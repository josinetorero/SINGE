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

        if (in_array($estado, ['NAO_CONFIRMADA', 'REJEITADA'], true)
            && trim((string) ($dados['motivo'] ?? '')) === '') {
            throw new InvalidArgumentException('A justificação é obrigatória quando a ocorrência não é confirmada ou é rejeitada.');
        }

        return DB::transaction(function () use ($dados, $estado, $ocorrenciaId, $utilizador): ValidacaoOcorrencia {
            Ocorrencia::query()->lockForUpdate()->findOrFail((int) $ocorrenciaId);

            return ValidacaoOcorrencia::query()->create([
                'ocorrencia_id' => (int) $ocorrenciaId,
                'utilizador_id' => $utilizador->id,
                'estado' => $estado,
                'observacoes' => $dados['observacoes'] ?? null,
                'motivo' => $dados['motivo'] ?? null,
                'data_validacao' => in_array($estado, ['VALIDADA', 'NAO_CONFIRMADA', 'REJEITADA', 'DUPLICADA'], true)
                    ? now()
                    : null,
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
}
