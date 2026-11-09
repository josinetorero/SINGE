<?php

namespace App\Services\Ocorrencias;

use App\Enums\EstadoOcorrencia;
use App\Models\HistoricoOcorrencia;
use App\Models\Localizacao;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\Prioridade;
use App\Models\TipoOcorrencia;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class OcorrenciaService
{
    private const PERFIS_OPERACIONAIS = ['Administrador', 'Operador', 'Coordenador'];

    private const CAMPOS_INFORMATIVOS = [
        'titulo',
        'descricao',
        'localizacao',
        'localizacao_id',
        'latitude',
        'longitude',
        'tipo_ocorrencia_id',
    ];

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $utilizador, Prioridade $prioridadeInicial): Ocorrencia
    {
        return DB::transaction(function () use ($dados, $utilizador, $prioridadeInicial): Ocorrencia {
            $campos = array_intersect_key($dados, array_flip(self::CAMPOS_INFORMATIVOS));
            $this->validarDados($campos);
            TipoOcorrencia::query()->findOrFail((int) $campos['tipo_ocorrencia_id']);

            if (isset($campos['localizacao_id'])) {
                Localizacao::query()->findOrFail((int) $campos['localizacao_id']);
            }

            $ocorrencia = Ocorrencia::query()->create([
                ...$campos,
                'prioridade_id' => $prioridadeInicial->id,
                'utilizador_id' => $utilizador->id,
                'estado' => EstadoOcorrencia::REGISTADA,
            ]);

            $this->registarHistorico(
                $ocorrencia,
                $utilizador,
                null,
                EstadoOcorrencia::REGISTADA->value,
            );

            return $ocorrencia->fresh(['utilizador', 'tipoOcorrencia', 'prioridade', 'localizacaoGeografica']);
        });
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $utilizador, Prioridade $prioridadeInicial): Ocorrencia
    {
        return $this->criar($dados, $utilizador, $prioridadeInicial);
    }

    /** @param array<string, mixed> $dados */
    public function atualizar(Ocorrencia $ocorrencia, array $dados, User $utilizador): Ocorrencia
    {
        $this->autorizarActualizacao($ocorrencia, $utilizador);
        $campos = array_intersect_key($dados, array_flip(self::CAMPOS_INFORMATIVOS));
        $this->validarDados($campos, parcial: true);

        if (isset($campos['tipo_ocorrencia_id'])) {
            TipoOcorrencia::query()->findOrFail((int) $campos['tipo_ocorrencia_id']);
        }
        if (array_key_exists('localizacao_id', $campos) && $campos['localizacao_id'] !== null) {
            Localizacao::query()->findOrFail((int) $campos['localizacao_id']);
        }

        $ocorrencia->fill($campos);
        $ocorrencia->save();

        return $ocorrencia->fresh(['utilizador', 'tipoOcorrencia', 'prioridade', 'localizacaoGeografica']);
    }

    /** @param array<string, mixed> $dados */
    public function update(Ocorrencia $ocorrencia, array $dados, User $utilizador): Ocorrencia
    {
        return $this->atualizar($ocorrencia, $dados, $utilizador);
    }

    public function alterarEstado(
        Ocorrencia $ocorrencia,
        string $estado,
        User $utilizador,
        ?string $observacoes = null,
    ): Ocorrencia {
        $this->autorizarAlteracaoEstado($utilizador);
        $novoEstado = EstadoOcorrencia::tryFrom(trim($estado));
        if (! $novoEstado) {
            throw new InvalidArgumentException('Estado da ocorrência inválido.');
        }

        return DB::transaction(function () use ($ocorrencia, $novoEstado, $observacoes, $utilizador): Ocorrencia {
            $actual = Ocorrencia::query()->lockForUpdate()->findOrFail($ocorrencia->id);
            $estadoAnterior = EstadoOcorrencia::tryFrom((string) $actual->getRawOriginal('estado'));
            if (! $estadoAnterior) {
                throw new RuntimeException('A ocorrência possui um estado inválido na base de dados.');
            }

            if ($estadoAnterior === $novoEstado) {
                throw new InvalidArgumentException('A ocorrência já se encontra no estado indicado.');
            }

            $actual->estado = $novoEstado->value;
            $actual->save();

            $this->registarHistorico(
                $actual,
                $utilizador,
                $estadoAnterior->value,
                $novoEstado->value,
                $observacoes,
            );

            return $actual->fresh(['utilizador', 'tipoOcorrencia', 'prioridade', 'localizacaoGeografica']);
        });
    }

    public function alterarEstadoOperacional(
        Ocorrencia $ocorrencia,
        string $estado,
        User $utilizador,
        ?string $observacoes = null,
    ): Ocorrencia {
        return $this->alterarEstado($ocorrencia, $estado, $utilizador, $observacoes);
    }

    public function associarLocalizacao(Ocorrencia $ocorrencia, int $localizacaoId, User $utilizador): Ocorrencia
    {
        $perfil = $this->nomePerfil($utilizador);
        $podeAlterarComoCidadao = $perfil === 'Cidadão'
            && (int) $ocorrencia->utilizador_id === (int) $utilizador->id
            && $ocorrencia->getRawOriginal('estado') === EstadoOcorrencia::REGISTADA->value;

        if (! $podeAlterarComoCidadao && ! in_array($perfil, self::PERFIS_OPERACIONAIS, true)) {
            throw new AuthorizationException('O utilizador não está autorizado a alterar a localização desta ocorrência.');
        }

        return DB::transaction(function () use ($ocorrencia, $localizacaoId): Ocorrencia {
            Localizacao::query()->findOrFail($localizacaoId);
            $actual = Ocorrencia::query()->lockForUpdate()->findOrFail($ocorrencia->id);
            $actual->localizacao_id = Localizacao::query()->findOrFail($localizacaoId)->id;
            $actual->save();

            return $actual->fresh('localizacaoGeografica');
        });
    }

    public function consultar(int $id, User $utilizador): Ocorrencia
    {
        $ocorrencia = Ocorrencia::query()
            ->with(['utilizador', 'tipoOcorrencia', 'prioridade', 'localizacaoGeografica'])
            ->findOrFail($id);

        $perfil = $this->nomePerfil($utilizador);
        $podeConsultar = (int) $ocorrencia->utilizador_id === (int) $utilizador->id
            || in_array($perfil, self::PERFIS_OPERACIONAIS, true)
            || ($perfil === 'Agente'
                && $utilizador->equipa_id !== null
                && $ocorrencia->missoes()->where('equipa_id', $utilizador->equipa_id)->exists());

        if (! $podeConsultar) {
            throw new AuthorizationException('O utilizador não está autorizado a consultar esta ocorrência.');
        }

        return $ocorrencia;
    }

    private function autorizarActualizacao(Ocorrencia $ocorrencia, User $utilizador): void
    {
        $perfil = $this->nomePerfil($utilizador);
        if (in_array($perfil, self::PERFIS_OPERACIONAIS, true)) {
            return;
        }

        if ($perfil === 'Cidadão'
            && (int) $ocorrencia->utilizador_id === (int) $utilizador->id
            && $ocorrencia->getRawOriginal('estado') === EstadoOcorrencia::REGISTADA->value) {
            return;
        }

        throw new AuthorizationException('O utilizador não está autorizado a actualizar esta ocorrência.');
    }

    private function autorizarAlteracaoEstado(User $utilizador): void
    {
        if (! in_array($this->nomePerfil($utilizador), self::PERFIS_OPERACIONAIS, true)) {
            throw new AuthorizationException('O perfil do utilizador não pode alterar o estado operacional das ocorrências.');
        }
    }

    /** @param array<string, mixed> $dados */
    private function validarDados(array $dados, bool $parcial = false): void
    {
        foreach (['titulo', 'descricao', 'localizacao', 'tipo_ocorrencia_id'] as $required) {
            if (! $parcial && empty($dados[$required] ?? null)) {
                throw new InvalidArgumentException("O campo {$required} é obrigatório.");
            }
        }

        if (isset($dados['latitude']) && (! is_numeric($dados['latitude']) || $dados['latitude'] < -90 || $dados['latitude'] > 90)) {
            throw new InvalidArgumentException('A latitude deve estar compreendida entre -90 e 90.');
        }

        if (isset($dados['longitude']) && (! is_numeric($dados['longitude']) || $dados['longitude'] < -180 || $dados['longitude'] > 180)) {
            throw new InvalidArgumentException('A longitude deve estar compreendida entre -180 e 180.');
        }

        if (array_key_exists('latitude', $dados) xor array_key_exists('longitude', $dados)) {
            throw new InvalidArgumentException('A latitude e a longitude devem ser fornecidas em conjunto.');
        }
    }

    private function registarHistorico(
        Ocorrencia $ocorrencia,
        User $utilizador,
        ?string $estadoAnterior,
        string $estadoNovo,
        ?string $observacoes = null,
    ): HistoricoOcorrencia {
        return HistoricoOcorrencia::query()->create([
            'ocorrencia_id' => $ocorrencia->id,
            'utilizador_id' => $utilizador->id,
            'estado_anterior' => $estadoAnterior,
            'estado_novo' => $estadoNovo,
            'observacoes' => $observacoes,
        ]);
    }

    private function nomePerfil(User $utilizador): ?string
    {
        $perfil = $utilizador->perfil;

        return $perfil instanceof Perfil ? $perfil->nome : null;
    }
}
