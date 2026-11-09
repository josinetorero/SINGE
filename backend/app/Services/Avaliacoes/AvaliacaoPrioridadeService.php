<?php

namespace App\Services\Avaliacoes;

use App\Models\AvaliacaoPrioridade;
use App\Models\DetalheAvaliacao;
use App\Models\FatorPrioridade;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\Prioridade;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use InvalidArgumentException;
use RuntimeException;

class AvaliacaoPrioridadeService
{
    private const PERFIS_AVALIADORES = ['Administrador', 'Operador', 'Coordenador'];

    /**
     * @var array<string, float>
     */
    private const PESOS_OFICIAIS = [
        'gravidade' => 0.30,
        'pessoas afectadas' => 0.25,
        'vulnerabilidade' => 0.20,
        'localizacao' => 0.15,
        'escassez de recursos' => 0.10,
    ];

    /**
     * @param  array<int, mixed>  $factores
     */
    public function calcularPontuacaoPonderada(array $factores): float
    {
        /** @var Collection<int, FatorPrioridade> $fatoresAtivos */
        $fatoresAtivos = FatorPrioridade::query()
            ->where('ativo', true)
            ->get()
            ->keyBy('id');

        return $this->calcularComFatores($factores, $fatoresAtivos);
    }

    /**
     * @param  array<int, mixed>  $factores
     * @param  Collection<int, FatorPrioridade>  $fatoresAtivos
     */
    private function calcularComFatores(array $factores, Collection $fatoresAtivos): float
    {
        $this->validarConfiguracaoDosFatores($fatoresAtivos);

        if (! array_is_list($factores) || count($factores) !== $fatoresAtivos->count()) {
            throw new InvalidArgumentException('A avaliação deve incluir cada factor activo exactamente uma vez.');
        }

        $pontuacoes = [];
        foreach ($factores as $factor) {
            if (! is_array($factor)) {
                throw new InvalidArgumentException('Cada detalhe de avaliação deve ser um objecto válido.');
            }

            $idInput = $factor['fator_prioridade_id'] ?? null;
            $pontuacaoInput = $factor['pontuacao'] ?? null;

            if (! is_scalar($idInput) || filter_var($idInput, FILTER_VALIDATE_INT) === false) {
                throw new InvalidArgumentException('Cada factor de avaliação precisa de um identificador inteiro válido.');
            }

            $id = (int) $idInput;
            if (! $fatoresAtivos->has($id)) {
                throw new InvalidArgumentException('A avaliação contém um factor desconhecido ou inactivo.');
            }

            if (array_key_exists($id, $pontuacoes)) {
                throw new InvalidArgumentException('Não é permitido repetir factores na mesma avaliação.');
            }

            if (! is_numeric($pontuacaoInput) || ! is_finite((float) $pontuacaoInput)) {
                throw new InvalidArgumentException('A pontuação de cada factor deve ser numérica.');
            }

            $pontuacao = (float) $pontuacaoInput;
            if ($pontuacao < 0 || $pontuacao > 10) {
                throw new InvalidArgumentException('A pontuação de cada factor deve estar compreendida entre 0 e 10.');
            }

            $pontuacoes[$id] = $pontuacao;
        }

        if (count($pontuacoes) !== $fatoresAtivos->count()) {
            throw new InvalidArgumentException('A avaliação não contém todos os factores activos.');
        }

        $total = 0.0;
        foreach ($fatoresAtivos as $fator) {
            $total += $pontuacoes[$fator->id] * (float) $fator->peso;
        }

        return round($total, 2);
    }

    public function determinarPrioridade(float $pontuacao): Prioridade
    {
        if (! is_finite($pontuacao) || $pontuacao < 0 || $pontuacao > 10) {
            throw new InvalidArgumentException('A pontuação total deve estar compreendida entre 0 e 10.');
        }

        $nome = match (true) {
            $pontuacao < 2.50 => 'baixa',
            $pontuacao < 5.00 => 'media',
            $pontuacao < 7.50 => 'alta',
            default => 'critica',
        };

        return $this->obterPrioridadesConfiguradas()->get($nome)
            ?? throw new RuntimeException("A prioridade '{$nome}' não está configurada.");
    }

    /** @param array<string, mixed> $dados */
    public function avaliar(array $dados, User $utilizador): AvaliacaoPrioridade
    {
        $this->autorizarAvaliador($utilizador);

        $ocorrenciaId = $dados['ocorrencia_id'] ?? null;
        if (! is_scalar($ocorrenciaId) || filter_var($ocorrenciaId, FILTER_VALIDATE_INT) === false) {
            throw new InvalidArgumentException('A ocorrência da avaliação deve ser um identificador inteiro válido.');
        }

        $riscoInput = $dados['risco_iminente_morte'] ?? false;
        if (! in_array($riscoInput, [true, false, 1, 0, '1', '0'], true)) {
            throw new InvalidArgumentException('O indicador de risco iminente deve ser booleano.');
        }
        $riscoImminente = in_array($riscoInput, [true, 1, '1'], true);
        $justificacao = trim((string) ($dados['justificacao'] ?? ''));
        if ($riscoImminente) {
            if (! in_array($this->nomePerfil($utilizador), ['Administrador', 'Coordenador'], true)) {
                throw new AuthorizationException('Só um administrador ou coordenador pode confirmar um risco iminente de morte.');
            }

            if ($justificacao === '') {
                throw new InvalidArgumentException('A classificação crítica excepcional exige uma justificação fundamentada.');
            }
        }

        return DB::transaction(function () use ($dados, $justificacao, $ocorrenciaId, $riscoImminente, $utilizador): AvaliacaoPrioridade {
            /** @var Collection<int, FatorPrioridade> $fatoresAtivos */
            $fatoresAtivos = FatorPrioridade::query()
                ->where('ativo', true)
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $factores = $dados['factores'] ?? [];
            $pontuacao = $this->calcularComFatores($factores, $fatoresAtivos);
            $prioridade = $riscoImminente
                ? $this->obterPrioridadesConfiguradas()->get('critica')
                    ?? throw new RuntimeException("A prioridade 'critica' não está configurada.")
                : $this->determinarPrioridade($pontuacao);

            $ocorrencia = Ocorrencia::query()->lockForUpdate()->findOrFail((int) $ocorrenciaId);

            $prefixoRisco = $riscoImminente ? '[RISCO IMINENTE DE MORTE] ' : '';

            $avaliacao = AvaliacaoPrioridade::query()->create([
                'ocorrencia_id' => $ocorrencia->id,
                'utilizador_id' => $utilizador->id,
                'prioridade_id' => $prioridade->id,
                'pontuacao_total' => $pontuacao,
                'justificacao' => $prefixoRisco.$justificacao,
            ]);

            foreach ($factores as $factor) {
                if (! is_array($factor)) {
                    throw new InvalidArgumentException('Cada detalhe de avaliação deve ser um objecto válido.');
                }

                $id = (int) $factor['fator_prioridade_id'];
                $fator = $fatoresAtivos->get($id);
                if (! $fator instanceof FatorPrioridade) {
                    throw new RuntimeException('O factor avaliado deixou de estar disponível durante a operação.');
                }

                $detalhe = new DetalheAvaliacao;
                $detalhe->forceFill([
                    'avaliacao_prioridade_id' => $avaliacao->id,
                    'fator_prioridade_id' => $id,
                    'pontuacao' => (float) $factor['pontuacao'],
                    'peso_aplicado' => (float) $fator->peso,
                    'observacao' => $factor['observacao'] ?? null,
                ]);
                $detalhe->save();
            }

            $ocorrencia->prioridade_id = $prioridade->id;
            $ocorrencia->save();

            return $avaliacao->fresh(['prioridade', 'utilizador', 'detalhes.fator']);
        });
    }

    /** @param array<int, mixed> $factores */
    public function calculateWeightedScore(array $factores): float
    {
        return $this->calcularPontuacaoPonderada($factores);
    }

    public function determinePriority(float $pontuacao): Prioridade
    {
        return $this->determinarPrioridade($pontuacao);
    }

    /** @param array<string, mixed> $dados */
    public function evaluate(array $dados, User $utilizador): AvaliacaoPrioridade
    {
        return $this->avaliar($dados, $utilizador);
    }

    /**
     * @param  Collection<int, FatorPrioridade>  $fatoresAtivos
     */
    private function validarConfiguracaoDosFatores(Collection $fatoresAtivos): void
    {
        if ($fatoresAtivos->count() !== count(self::PESOS_OFICIAIS)) {
            throw new RuntimeException('A configuração deve conter exactamente os cinco factores oficiais activos.');
        }

        $totalPeso = (float) $fatoresAtivos->sum(fn (FatorPrioridade $fator): float => (float) $fator->peso);
        if (abs($totalPeso - 1.0) > 0.0001) {
            throw new RuntimeException('A soma dos pesos dos factores activos deve ser igual a 1.00.');
        }

        $pesosEncontrados = [];
        foreach ($fatoresAtivos as $fator) {
            $nome = $this->normalizarNome((string) $fator->nome);
            if (! array_key_exists($nome, self::PESOS_OFICIAIS)) {
                throw new RuntimeException("O factor activo '{$fator->nome}' não corresponde a um factor oficial.");
            }

            if (array_key_exists($nome, $pesosEncontrados)) {
                throw new RuntimeException("Existe mais de um factor activo para '{$fator->nome}'.");
            }

            if (abs((float) $fator->peso - self::PESOS_OFICIAIS[$nome]) > 0.0001) {
                throw new RuntimeException("O peso configurado para '{$fator->nome}' não corresponde à fórmula oficial.");
            }

            $pesosEncontrados[$nome] = true;
        }

        if (count($pesosEncontrados) !== count(self::PESOS_OFICIAIS)) {
            throw new RuntimeException('A configuração não contém todos os factores oficiais activos.');
        }
    }

    /**
     * @return Collection<string, Prioridade>
     */
    private function obterPrioridadesConfiguradas(): Collection
    {
        $niveis = [
            'critica' => 1,
            'alta' => 2,
            'media' => 3,
            'baixa' => 4,
        ];
        /** @var Collection<string, Prioridade> $porNome */
        $porNome = Prioridade::query()->get()->keyBy(
            fn (Prioridade $prioridade): string => $this->normalizarNome((string) $prioridade->nome),
        );

        foreach ($niveis as $nome => $nivel) {
            if (! $porNome->has($nome)) {
                throw new RuntimeException("A configuração de prioridades está incompleta: falta '{$nome}'.");
            }

            if ((int) $porNome->get($nome)->nivel !== $nivel) {
                throw new RuntimeException("O nível configurado para a prioridade '{$nome}' não corresponde à ordem operacional.");
            }
        }

        return $porNome;
    }

    private function normalizarNome(string $nome): string
    {
        return strtolower(Str::ascii(trim($nome)));
    }

    private function autorizarAvaliador(User $utilizador): void
    {
        if (! in_array($this->nomePerfil($utilizador), self::PERFIS_AVALIADORES, true)) {
            throw new AuthorizationException('O perfil do utilizador não está autorizado a avaliar prioridades.');
        }
    }

    private function nomePerfil(User $utilizador): ?string
    {
        $perfil = $utilizador->perfil;

        return $perfil instanceof Perfil ? $perfil->nome : null;
    }
}
