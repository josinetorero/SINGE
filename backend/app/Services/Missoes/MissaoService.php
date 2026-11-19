<?php

namespace App\Services\Missoes;

use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Enums\EstadoOcorrencia;
use App\Models\Equipa;
use App\Models\HistoricoMissao;
use App\Models\Missao;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\User;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;
use RuntimeException;

class MissaoService
{
    private const PERFIS_GESTAO = ['Administrador', 'Coordenador'];

    private const PERFIS_ATRIBUICAO = ['Coordenador'];

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $utilizador): Missao
    {
        $this->autorizarGestao($utilizador);

        return DB::transaction(function () use ($dados, $utilizador): Missao {
            $equipa = Equipa::query()->lockForUpdate()->findOrFail((int) ($dados['equipa_id'] ?? 0));
            $ocorrencia = Ocorrencia::query()->lockForUpdate()->findOrFail((int) ($dados['ocorrencia_id'] ?? 0));
            $this->validarOcorrenciaActiva($ocorrencia);
            $this->validarDisponibilidade($equipa);

            $missao = Missao::query()->create([
                'ocorrencia_id' => $ocorrencia->id,
                'equipa_id' => $equipa->id,
                'coordenador_id' => $utilizador->id,
                'estado' => EstadoMissao::ATRIBUIDA,
                'data_atribuicao' => $dados['data_atribuicao'] ?? now(),
                'data_prevista_conclusao' => $dados['data_prevista_conclusao'] ?? null,
                'objectivos' => $dados['objectivos'] ?? null,
                'instrucoes' => $dados['instrucoes'] ?? null,
                'observacoes' => $dados['observacoes'] ?? null,
            ]);

            $equipa->estado = EstadoEquipa::EM_MISSAO->value;
            $equipa->save();
            $this->registarHistorico($missao, $utilizador, 'criada', null, EstadoMissao::ATRIBUIDA->value);

            return $missao->fresh(['ocorrencia', 'equipa', 'coordenador']);
        });
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $utilizador): Missao
    {
        return $this->criar($dados, $utilizador);
    }

    public function atualizarEstado(
        Missao $missao,
        string $estado,
        User $utilizador,
        ?string $observacoes = null,
        ?string $operacaoHistorico = null,
    ): Missao
    {
        $novoEstado = EstadoMissao::tryFrom(trim($estado));
        if (! $novoEstado) {
            throw new InvalidArgumentException('Estado da missão inválido.');
        }

        return DB::transaction(function () use ($missao, $novoEstado, $utilizador, $observacoes, $operacaoHistorico): Missao {
            $missaoActual = Missao::query()->lockForUpdate()->findOrFail($missao->id);
            $equipa = Equipa::query()->lockForUpdate()->findOrFail($missaoActual->equipa_id);
            $this->autorizarOperacao($utilizador, $missaoActual, $novoEstado);

            $estadoActual = EstadoMissao::tryFrom((string) $missaoActual->getRawOriginal('estado'));
            if (! $estadoActual) {
                throw new RuntimeException('A missão possui um estado inválido na base de dados.');
            }

            if ($estadoActual === $novoEstado) {
                return $missaoActual->fresh(['ocorrencia', 'equipa', 'coordenador']);
            }

            $transicoes = [
                EstadoMissao::ATRIBUIDA->value => [
                    EstadoMissao::EM_DESLOCACAO,
                    EstadoMissao::CANCELADA,
                ],
                EstadoMissao::EM_DESLOCACAO->value => [
                    EstadoMissao::EM_EXECUCAO,
                    EstadoMissao::CANCELADA,
                ],
                EstadoMissao::EM_EXECUCAO->value => [
                    EstadoMissao::CONCLUIDA,
                    EstadoMissao::CANCELADA,
                ],
                EstadoMissao::CONCLUIDA->value => [],
                EstadoMissao::CANCELADA->value => [],
            ];

            if (! in_array($novoEstado, $transicoes[$estadoActual->value], true)) {
                throw new InvalidArgumentException(
                    "Transição de missão inválida: {$estadoActual->value} para {$novoEstado->value}.",
                );
            }

            $missaoActual->estado = $novoEstado->value;
            if ($novoEstado === EstadoMissao::EM_DESLOCACAO) {
                $missaoActual->data_inicio ??= now();
            }
            if (in_array($novoEstado, [EstadoMissao::CONCLUIDA, EstadoMissao::CANCELADA], true)) {
                $missaoActual->data_conclusao = now();
            }
            $missaoActual->save();
            $this->registarHistorico(
                $missaoActual,
                $utilizador,
                $operacaoHistorico ?? ($novoEstado === EstadoMissao::CANCELADA ? 'cancelada' : 'estado_alterado'),
                $estadoActual->value,
                $novoEstado->value,
                $observacoes,
            );

            if (in_array($novoEstado, [EstadoMissao::CONCLUIDA, EstadoMissao::CANCELADA], true)) {
                $outraMissaoActiva = Missao::query()
                    ->where('equipa_id', $equipa->id)
                    ->whereKeyNot($missaoActual->id)
                    ->whereIn('estado', $this->estadosActivos())
                    ->exists();

                if (! $outraMissaoActiva
                    && $equipa->getRawOriginal('estado') === EstadoEquipa::EM_MISSAO->value) {
                    $equipa->estado = EstadoEquipa::DISPONIVEL->value;
                    $equipa->save();
                }
            }

            return $missaoActual->fresh(['ocorrencia', 'equipa', 'coordenador']);
        });
    }

    public function concluir(Missao $missao, User $utilizador): Missao
    {
        return $this->atualizarEstado($missao, EstadoMissao::CONCLUIDA->value, $utilizador);
    }

    public function registarActividade(
        Missao $missao,
        string $operacao,
        ?string $observacoes,
        User $utilizador,
    ): Missao {
        if ($this->nomePerfil($utilizador) !== 'Agente'
            || $utilizador->equipa_id === null
            || (int) $utilizador->equipa_id !== (int) $missao->equipa_id) {
            throw new AuthorizationException('O Agente só pode actualizar missões da sua equipa.');
        }

        return DB::transaction(function () use ($missao, $operacao, $observacoes, $utilizador): Missao {
            $missaoActual = Missao::query()->lockForUpdate()->findOrFail($missao->id);
            if ((int) $utilizador->equipa_id !== (int) $missaoActual->equipa_id) {
                throw new AuthorizationException('A missão não pertence à equipa do Agente autenticado.');
            }

            $estado = $missaoActual->estado instanceof EstadoMissao
                ? $missaoActual->estado
                : EstadoMissao::from((string) $missaoActual->getRawOriginal('estado'));
            $texto = trim((string) $observacoes);

            if ($operacao === 'conhecimento') {
                if ($estado !== EstadoMissao::ATRIBUIDA) {
                    throw new InvalidArgumentException('A recepção só pode ser confirmada enquanto a missão estiver atribuída.');
                }
                $this->registarHistorico($missaoActual, $utilizador, 'conhecimento_confirmado', $estado->value, $estado->value);
            } elseif ($operacao === 'progresso' || $operacao === 'dificuldade') {
                if (! in_array($estado, [EstadoMissao::EM_DESLOCACAO, EstadoMissao::EM_EXECUCAO], true)) {
                    throw new InvalidArgumentException('A missão precisa estar em deslocação ou execução para receber esta actualização.');
                }
                $this->registarHistorico(
                    $missaoActual,
                    $utilizador,
                    $operacao === 'dificuldade' ? 'dificuldade_reportada' : 'progresso_reportado',
                    $estado->value,
                    $estado->value,
                    $texto,
                );
            } elseif ($operacao === 'chegada') {
                if ($estado !== EstadoMissao::EM_DESLOCACAO) {
                    throw new InvalidArgumentException('A chegada ao local só pode ser registada durante a deslocação.');
                }
                $this->atualizarEstado($missaoActual, EstadoMissao::EM_EXECUCAO->value, $utilizador, $texto, 'chegada_local');
            } elseif ($operacao === 'concluir') {
                if ($estado !== EstadoMissao::EM_EXECUCAO) {
                    throw new InvalidArgumentException('A intervenção só pode ser concluída depois de iniciada a execução.');
                }
                $this->atualizarEstado($missaoActual, EstadoMissao::CONCLUIDA->value, $utilizador, $texto, 'intervencao_concluida');
            } else {
                throw new InvalidArgumentException('A operação de missão indicada não é suportada.');
            }

            return $missaoActual->fresh(['ocorrencia', 'equipa', 'coordenador', 'historico.utilizador']);
        });
    }

    public function cancelar(Missao $missao, User $utilizador): Missao
    {
        return $this->atualizarEstado($missao, EstadoMissao::CANCELADA->value, $utilizador);
    }

    public function associarEquipe(Missao $missao, int $equipaId, User $utilizador): Missao
    {
        $this->autorizarGestao($utilizador);

        return DB::transaction(function () use ($missao, $equipaId, $utilizador): Missao {
            $missaoActual = Missao::query()->lockForUpdate()->findOrFail($missao->id);
            if ($missaoActual->getRawOriginal('estado') !== EstadoMissao::ATRIBUIDA->value) {
                throw new InvalidArgumentException('Só é possível alterar a equipa antes da deslocação.');
            }

            $equipaAnterior = Equipa::query()->lockForUpdate()->findOrFail($missaoActual->equipa_id);
            if ((int) $equipaAnterior->id === $equipaId) {
                return $missaoActual->fresh(['ocorrencia', 'equipa', 'coordenador']);
            }

            $equipaNova = Equipa::query()->lockForUpdate()->findOrFail($equipaId);
            $this->validarDisponibilidade($equipaNova);

            $missaoActual->equipa_id = $equipaNova->id;
            $missaoActual->save();
            $this->registarHistorico(
                $missaoActual,
                $utilizador,
                'equipa_reatribuida',
                $missaoActual->estado,
                $missaoActual->estado,
                "Equipa anterior: {$equipaAnterior->nome}; nova equipa: {$equipaNova->nome}.",
            );
            $equipaNova->estado = EstadoEquipa::EM_MISSAO->value;
            $equipaNova->save();

            $outraMissaoActiva = Missao::query()
                ->where('equipa_id', $equipaAnterior->id)
                ->whereKeyNot($missaoActual->id)
                ->whereIn('estado', $this->estadosActivos())
                ->exists();

            if (! $outraMissaoActiva
                && $equipaAnterior->getRawOriginal('estado') === EstadoEquipa::EM_MISSAO->value) {
                $equipaAnterior->estado = EstadoEquipa::DISPONIVEL->value;
                $equipaAnterior->save();
            }

            return $missaoActual->fresh(['ocorrencia', 'equipa', 'coordenador']);
        });
    }

    /**
     * @param array<string, mixed> $filtros
     * @return \Illuminate\Database\Eloquent\Collection<int, Missao>
     */
    public function listar(array $filtros = []): \Illuminate\Database\Eloquent\Collection
    {
        return Missao::query()
            ->with(['ocorrencia.prioridade', 'equipa.tipoEquipa', 'coordenador'])
            ->when(isset($filtros['estado']), fn ($query) => $query->where('estado', $filtros['estado']))
            ->when(isset($filtros['equipa_id']), fn ($query) => $query->where('equipa_id', $filtros['equipa_id']))
            ->when(isset($filtros['ocorrencia_id']), fn ($query) => $query->where('ocorrencia_id', $filtros['ocorrencia_id']))
            ->when(isset($filtros['q']), function ($query) use ($filtros): void {
                $term = trim((string) $filtros['q']);
                $query->whereHas('ocorrencia', fn ($occurrence) => $occurrence
                    ->where('titulo', 'like', "%{$term}%")
                    ->orWhere('id', ctype_digit($term) ? (int) $term : -1));
            })
            ->latest()
            ->get();
    }

    public function consultar(int $id, User $utilizador): Missao
    {
        $missao = Missao::query()
            ->with([
                'ocorrencia.prioridade',
                'equipa.tipoEquipa',
                'equipa.utilizadores.perfil',
                'coordenador',
                'historico.utilizador',
            ])
            ->findOrFail($id);
        $perfil = $this->nomePerfil($utilizador);
        if (! in_array($perfil, self::PERFIS_GESTAO, true)
            && ! ($perfil === 'Agente' && (int) $utilizador->equipa_id === (int) $missao->equipa_id)) {
            throw new AuthorizationException('O utilizador não está autorizado a consultar esta missão.');
        }

        return $missao;
    }

    private function registarHistorico(
        Missao $missao,
        User $utilizador,
        string $operacao,
        ?string $estadoAnterior,
        ?string $estadoNovo,
        ?string $observacoes = null,
    ): void {
        HistoricoMissao::query()->create([
            'missao_id' => $missao->id,
            'utilizador_id' => $utilizador->id,
            'operacao' => $operacao,
            'estado_anterior' => $estadoAnterior,
            'estado_novo' => $estadoNovo,
            'observacoes' => $observacoes,
        ]);
    }

    private function validarDisponibilidade(Equipa $equipa): void
    {
        if ($equipa->getRawOriginal('estado') !== EstadoEquipa::DISPONIVEL->value) {
            throw new InvalidArgumentException('A equipa não está disponível para novas missões.');
        }

        if (Missao::query()
            ->where('equipa_id', $equipa->id)
            ->whereIn('estado', $this->estadosActivos())
            ->exists()) {
            throw new InvalidArgumentException('A equipa já possui uma missão activa.');
        }
    }

    private function validarOcorrenciaActiva(Ocorrencia $ocorrencia): void
    {
        if (in_array($ocorrencia->getRawOriginal('estado'), [
            EstadoOcorrencia::RESOLVIDA->value,
            EstadoOcorrencia::CANCELADA->value,
        ], true)) {
            throw new InvalidArgumentException('Não é possível atribuir uma missão a uma ocorrência encerrada.');
        }
    }

    private function autorizarGestao(User $utilizador): void
    {
        if (! in_array($this->nomePerfil($utilizador), self::PERFIS_ATRIBUICAO, true)) {
            throw new AuthorizationException('O perfil do utilizador não pode criar ou atribuir missões.');
        }
    }

    private function autorizarOperacao(User $utilizador, Missao $missao, EstadoMissao $novoEstado): void
    {
        $perfil = $this->nomePerfil($utilizador);
        if (in_array($perfil, self::PERFIS_GESTAO, true)) {
            return;
        }

        if ($perfil === 'Agente'
            && $novoEstado !== EstadoMissao::CANCELADA
            && $utilizador->equipa_id !== null
            && (int) $utilizador->equipa_id === (int) $missao->equipa_id) {
            return;
        }

        throw new AuthorizationException('O utilizador não está autorizado a actualizar esta missão.');
    }

    private function nomePerfil(User $utilizador): ?string
    {
        $perfil = $utilizador->perfil;

        return $perfil instanceof Perfil ? $perfil->nome : null;
    }

    /**
     * @return array<int, string>
     */
    private function estadosActivos(): array
    {
        return [
            EstadoMissao::ATRIBUIDA->value,
            EstadoMissao::EM_DESLOCACAO->value,
            EstadoMissao::EM_EXECUCAO->value,
        ];
    }
}
