<?php

namespace App\Services\Identificacao;

use App\Models\DocumentoIdentificacao;
use App\Models\Perfil;
use App\Models\User;
use App\Models\VerificacaoIdentidade;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use InvalidArgumentException;

class VerificacaoIdentidadeService
{
    private const PERFIS_VERIFICADORES = ['Administrador', 'Coordenador'];

    /** @param array<string, mixed> $dados */
    public function criar(array $dados, User $solicitante): VerificacaoIdentidade
    {
        $documentoId = $dados['documento_identificacao_id'] ?? null;
        if (! is_scalar($documentoId) || filter_var($documentoId, FILTER_VALIDATE_INT) === false) {
            throw new InvalidArgumentException('O documento de identificação deve ser indicado.');
        }

        return DB::transaction(function () use ($dados, $documentoId, $solicitante): VerificacaoIdentidade {
            $documento = DocumentoIdentificacao::query()->lockForUpdate()->findOrFail((int) $documentoId);
            if ((int) $documento->utilizador_id !== (int) $solicitante->id) {
                throw new AuthorizationException('Só o titular do documento pode solicitar a sua verificação.');
            }

            return VerificacaoIdentidade::query()->create([
                'documento_identificacao_id' => $documento->id,
                'utilizador_solicitante_id' => $solicitante->id,
                'utilizador_verificador_id' => null,
                'estado' => 'PENDENTE',
                'observacoes' => $dados['observacoes'] ?? null,
                'motivo_rejeicao' => null,
                'data_verificacao' => null,
            ]);
        });
    }

    /** @param array<string, mixed> $dados */
    public function create(array $dados, User $solicitante): VerificacaoIdentidade
    {
        return $this->criar($dados, $solicitante);
    }

    public function iniciarAnalise(VerificacaoIdentidade $verificacao, User $verificador): VerificacaoIdentidade
    {
        $this->autorizarVerificador($verificador);

        return DB::transaction(function () use ($verificacao, $verificador): VerificacaoIdentidade {
            $actual = VerificacaoIdentidade::query()
                ->with('documentoIdentificacao')
                ->lockForUpdate()
                ->findOrFail($verificacao->id);

            if ($actual->estado !== 'PENDENTE') {
                throw new InvalidArgumentException('Só é possível iniciar a análise de uma verificação pendente.');
            }

            $documento = $actual->documentoIdentificacao;
            if (! $documento instanceof DocumentoIdentificacao) {
                throw (new ModelNotFoundException)->setModel(DocumentoIdentificacao::class, [$actual->documento_identificacao_id]);
            }
            $this->impedirAutoVerificacao($documento, $verificador);
            $actual->estado = 'EM_ANALISE';
            $actual->utilizador_verificador_id = $verificador->id;
            $actual->save();

            return $actual->fresh(['documentoIdentificacao', 'utilizadorVerificador']);
        });
    }

    public function aprovar(VerificacaoIdentidade $verificacao, User $verificador, ?string $observacoes = null): VerificacaoIdentidade
    {
        return $this->decidir($verificacao, $verificador, 'APROVADA', null, $observacoes);
    }

    public function rejeitar(VerificacaoIdentidade $verificacao, User $verificador, string $motivo, ?string $observacoes = null): VerificacaoIdentidade
    {
        if (trim($motivo) === '') {
            throw new InvalidArgumentException('O motivo da rejeição é obrigatório.');
        }

        return $this->decidir($verificacao, $verificador, 'REJEITADA', $motivo, $observacoes);
    }

    private function decidir(
        VerificacaoIdentidade $verificacao,
        User $verificador,
        string $resultado,
        ?string $motivo,
        ?string $observacoes,
    ): VerificacaoIdentidade {
        $this->autorizarVerificador($verificador);

        return DB::transaction(function () use ($verificacao, $verificador, $resultado, $motivo, $observacoes): VerificacaoIdentidade {
            $actual = VerificacaoIdentidade::query()
                ->with('documentoIdentificacao')
                ->lockForUpdate()
                ->findOrFail($verificacao->id);

            if (! in_array($actual->estado, ['PENDENTE', 'EM_ANALISE'], true)) {
                throw new InvalidArgumentException('A verificação já possui uma decisão final e não pode ser alterada.');
            }

            $documentoActual = $actual->documentoIdentificacao;
            if (! $documentoActual instanceof DocumentoIdentificacao) {
                throw (new ModelNotFoundException)->setModel(DocumentoIdentificacao::class, [$actual->documento_identificacao_id]);
            }
            $this->impedirAutoVerificacao($documentoActual, $verificador);
            if ($actual->utilizador_verificador_id !== null
                && (int) $actual->utilizador_verificador_id !== (int) $verificador->id) {
                throw new AuthorizationException('A decisão deve ser concluída pelo responsável que iniciou a análise.');
            }

            $actual->estado = $resultado;
            $actual->utilizador_verificador_id = $verificador->id;
            $actual->motivo_rejeicao = $motivo;
            $actual->observacoes = $observacoes ?? $actual->observacoes;
            $actual->data_verificacao = now();
            $actual->save();

            $documento = DocumentoIdentificacao::query()
                ->lockForUpdate()
                ->findOrFail($actual->documento_identificacao_id);
            $documento->estado_verificacao = $resultado;
            $documento->save();

            return $actual->fresh(['documentoIdentificacao', 'utilizadorVerificador']);
        });
    }

    private function autorizarVerificador(User $utilizador): void
    {
        $perfil = $utilizador->perfil;
        if (! $perfil instanceof Perfil || ! in_array($perfil->nome, self::PERFIS_VERIFICADORES, true)) {
            throw new AuthorizationException('O perfil do utilizador não está autorizado a verificar identidades.');
        }
    }

    private function impedirAutoVerificacao(DocumentoIdentificacao $documento, User $verificador): void
    {
        if ((int) $documento->utilizador_id === (int) $verificador->id) {
            throw new AuthorizationException('O titular não pode verificar o próprio documento.');
        }
    }
}
