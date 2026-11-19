<?php

namespace App\Services\Validacoes;

use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\User;
use App\Models\ValidacaoOcorrencia;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class ValidacaoOcorrenciaService
{
    private const PERFIS_VALIDADORES = ['Administrador', 'Operador', 'Coordenador'];

    private const ESTADOS = [
        'PENDENTE',
        'EM_VERIFICACAO',
        'VALIDADA',
        'NAO_CONFIRMADA',
        'REJEITADA',
        'DUPLICADA',
    ];

    private const ESTADOS_OPERADOR = [
        'VALIDADA',
        'NAO_CONFIRMADA',
        'REJEITADA',
        'DUPLICADA',
    ];

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $utilizador): ValidacaoOcorrencia
    {
        $this->autorizar($utilizador);

        $ocorrenciaId = $dados['ocorrencia_id'] ?? null;
        if (! is_scalar($ocorrenciaId) || filter_var($ocorrenciaId, FILTER_VALIDATE_INT) === false) {
            throw new InvalidArgumentException('A ocorrência deve ser indicada.');
        }

        $estado = strtoupper((string) ($dados['estado'] ?? 'PENDENTE'));
        if (! in_array($estado, self::ESTADOS, true)) {
            throw new InvalidArgumentException('O estado da validação de ocorrência é inválido.');
        }
        if ($this->nomePerfil($utilizador) === 'Operador'
            && ! in_array($estado, self::ESTADOS_OPERADOR, true)) {
            throw new AuthorizationException('O Operador só pode validar, não confirmar ou rejeitar uma ocorrência.');
        }

        if (in_array($estado, ['NAO_CONFIRMADA', 'REJEITADA'], true)
            && trim((string) ($dados['motivo'] ?? '')) === '') {
            throw new InvalidArgumentException('A justificação é obrigatória quando a ocorrência não é confirmada ou é rejeitada.');
        }

        $ocorrenciaOriginalId = $dados['ocorrencia_original_id'] ?? null;

        if ($estado === 'DUPLICADA') {
            if (
                ! is_scalar($ocorrenciaOriginalId)
                || filter_var($ocorrenciaOriginalId, FILTER_VALIDATE_INT) === false
            ) {
                throw new InvalidArgumentException(
                    'É obrigatório indicar a ocorrência original.'
                );
            }

            if ((int) $ocorrenciaOriginalId === (int) $ocorrenciaId) {
                throw new InvalidArgumentException(
                    'Uma ocorrência não pode ser duplicada de si própria.'
                );
            }
        } elseif ($ocorrenciaOriginalId !== null) {
            throw new InvalidArgumentException(
                'A ocorrência original só pode ser indicada para validações DUPLICADA.'
            );
        }

        return DB::transaction(function () use (
            $dados,
            $estado,
            $ocorrenciaId,
            $ocorrenciaOriginalId,
            $utilizador
        ): ValidacaoOcorrencia {
            $ids = [(int) $ocorrenciaId];

            if ($estado === 'DUPLICADA') {
                $ids[] = (int) $ocorrenciaOriginalId;
            }

            // Bloquear as ocorrências por ordem de ID.
            // Isto ajuda a evitar conflitos entre operações simultâneas.
            sort($ids);

            $ocorrencias = Ocorrencia::query()
                ->whereIn('id', $ids)
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $ocorrencia = $ocorrencias->get((int) $ocorrenciaId);

            if (! $ocorrencia) {
                throw new InvalidArgumentException(
                    'A ocorrência indicada não existe.'
                );
            }

            if ($estado === 'DUPLICADA') {
                $original = $ocorrencias->get((int) $ocorrenciaOriginalId);

                if (! $original) {
                    throw new InvalidArgumentException(
                        'A ocorrência original indicada não existe.'
                    );
                }

                // Consultar a última decisão de validação da ocorrência original.
                $ultimaValidacaoOriginal = ValidacaoOcorrencia::query()
                    ->where('ocorrencia_id', $original->id)
                    ->orderByDesc('created_at')
                    ->orderByDesc('id')
                    ->first();

                if ($ultimaValidacaoOriginal?->estado === 'DUPLICADA') {
                    throw new InvalidArgumentException(
                        'A ocorrência escolhida já está identificada como duplicada. Seleccione a ocorrência original.'
                    );
                }

                // Não permitir transformar em duplicada uma ocorrência
                // que já serve de original a outras ocorrências.
                $temDuplicadasAssociadas = $ocorrencia->validacoesComoOriginal()
                    ->where('estado', 'DUPLICADA')
                    ->exists();

                if ($temDuplicadasAssociadas) {
                    throw new InvalidArgumentException(
                        'Esta ocorrência já está associada a outras duplicadas e não pode ser marcada como duplicada.'
                    );
                }
            }

            return ValidacaoOcorrencia::query()->create([
                'ocorrencia_id' => (int) $ocorrenciaId,
                'ocorrencia_original_id' => $estado === 'DUPLICADA'
                    ? (int) $ocorrenciaOriginalId
                    : null,
                'utilizador_id' => $utilizador->id,
                'estado' => $estado,
                'observacoes' => $dados['observacoes'] ?? null,
                'motivo' => $dados['motivo'] ?? null,
                'data_validacao' => in_array(
                    $estado,
                    ['VALIDADA', 'NAO_CONFIRMADA', 'REJEITADA', 'DUPLICADA'],
                    true
                ) ? now() : null,
            ]);
        });
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $utilizador): ValidacaoOcorrencia
    {
        return $this->criar($dados, $utilizador);
    }

    public function confirmar(Ocorrencia $ocorrencia, User $utilizador, ?string $observacoes = null): ValidacaoOcorrencia
    {
        return $this->criar([
            'ocorrencia_id' => $ocorrencia->id,
            'estado' => 'VALIDADA',
            'observacoes' => $observacoes,
        ], $utilizador);
    }

    /** @param array<string, mixed> $dados */
    public function processar(array $dados, User $utilizador): ValidacaoOcorrencia
    {
        return $this->criar($dados, $utilizador);
    }

    public function rejeitar(
        Ocorrencia $ocorrencia,
        User $utilizador,
        string $motivo,
        ?string $observacoes = null,
    ): ValidacaoOcorrencia {
        if (trim($motivo) === '') {
            throw new InvalidArgumentException('A justificação da rejeição é obrigatória.');
        }

        return $this->criar([
            'ocorrencia_id' => $ocorrencia->id,
            'estado' => 'REJEITADA',
            'motivo' => $motivo,
            'observacoes' => $observacoes,
        ], $utilizador);
    }

    private function autorizar(User $utilizador): void
    {
        $perfil = $utilizador->perfil;
        if (! $perfil instanceof Perfil || ! in_array($perfil->nome, self::PERFIS_VALIDADORES, true)) {
            throw new AuthorizationException('O perfil do utilizador não pode validar ocorrências.');
        }
    }

    private function nomePerfil(User $utilizador): ?string
    {
        $perfil = $utilizador->perfil;

        return $perfil instanceof Perfil ? $perfil->nome : null;
    }
}
