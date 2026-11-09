<?php

namespace App\Services\Missoes;

use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Enums\EstadoOcorrencia;
use App\Models\Equipa;
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

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $utilizador): Missao
    {
        $this->autorizarGestao($utilizador);

        return DB::transaction(function () use ($dados, $utilizador): Missao {
            $equipa = Equipa::query()->lockForUpdate()->findOrFail((int) ($dados['equipa_id'] ?? 0));
            $ocorrencia = Ocorrencia::query()->lockForUpdate()->findOrFail((int) ($dados['ocorrencia_id'] ?? 0));
            $this->validarOcorrenciaActiva($ocorrencia);
            $this->validarDisponibilidade($equipa);

            $coordenadorId = $dados['coordenador_id'] ?? $utilizador->id;
            $coordenador = User::query()->with('perfil')->findOrFail((int) $coordenadorId);
            if (! in_array($this->nomePerfil($coordenador), ['Administrador', 'Coordenador'], true)) {
                throw new InvalidArgumentException('O responsável seleccionado não tem perfil de coordenador.');
            }

            $missao = Missao::query()->create([
                'ocorrencia_id' => $ocorrencia->id,
                'equipa_id' => $equipa->id,
                'coordenador_id' => $coordenador->id,
                'estado' => EstadoMissao::ATRIBUIDA,
                'data_atribuicao' => now(),
                'observacoes' => $dados['observacoes'] ?? null,
            ]);

            $equipa->estado = EstadoEquipa::EM_MISSAO->value;
            $equipa->save();

            return $missao->fresh(['ocorrencia', 'equipa', 'coordenador']);
        });
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $utilizador): Missao
    {
        return $this->criar($dados, $utilizador);
    }

    public function atualizarEstado(Missao $missao, string $estado, User $utilizador): Missao
    {
        $novoEstado = EstadoMissao::tryFrom(trim($estado));
        if (! $novoEstado) {
            throw new InvalidArgumentException('Estado da missão inválido.');
        }

        return DB::transaction(function () use ($missao, $novoEstado, $utilizador): Missao {
            $missaoActual = Missao::query()->lockForUpdate()->findOrFail($missao->id);
            $equipa = Equipa::query()->lockForUpdate()->findOrFail($missaoActual->equipa_id);
            $this->autorizarOperacao($utilizador);

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

    public function cancelar(Missao $missao, User $utilizador): Missao
    {
        return $this->atualizarEstado($missao, EstadoMissao::CANCELADA->value, $utilizador);
    }

    public function associarEquipe(Missao $missao, int $equipaId, User $utilizador): Missao
    {
        $this->autorizarGestao($utilizador);

        return DB::transaction(function () use ($missao, $equipaId): Missao {
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
        if (! in_array($this->nomePerfil($utilizador), self::PERFIS_GESTAO, true)) {
            throw new AuthorizationException('O perfil do utilizador não pode atribuir ou reatribuir missões.');
        }
    }

    private function autorizarOperacao(User $utilizador): void
    {
        if (in_array($this->nomePerfil($utilizador), self::PERFIS_GESTAO, true)) {
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
