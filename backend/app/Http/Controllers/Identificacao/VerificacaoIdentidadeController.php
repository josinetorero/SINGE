<?php

namespace App\Http\Controllers\Identificacao;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Identificacao\StoreVerificacaoIdentidadeRequest;
use App\Models\VerificacaoIdentidade;
use App\Services\Identificacao\VerificacaoIdentidadeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VerificacaoIdentidadeController extends SingeApiController
{
    public function store(StoreVerificacaoIdentidadeRequest $request, VerificacaoIdentidadeService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->criar($request->validated(), $this->authenticatedUser($request)),
                [
                    'id', 'documento_identificacao_id', 'utilizador_solicitante_id',
                    'utilizador_verificador_id', 'estado', 'observacoes', 'data_verificacao', 'created_at',
                ],
            ),
            'Verificação de identidade solicitada com sucesso.',
            201,
        );
    }

    public function startReview(
        VerificacaoIdentidade $verificacao,
        Request $request,
        VerificacaoIdentidadeService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->iniciarAnalise($verificacao, $this->authenticatedUser($request)),
                [
                    'id', 'documento_identificacao_id', 'utilizador_solicitante_id',
                    'utilizador_verificador_id', 'estado', 'observacoes', 'data_verificacao', 'updated_at',
                ],
            ),
            'Análise de identidade iniciada com sucesso.',
        );
    }

    public function approve(
        VerificacaoIdentidade $verificacao,
        Request $request,
        VerificacaoIdentidadeService $service,
    ): JsonResponse {
        $observacoes = $request->input('observacoes');
        if ($observacoes !== null && ! is_string($observacoes)) {
            return $this->failure('As observações devem ser texto.', 422);
        }

        return $this->execute(
            fn (): array => $this->attributes(
                $service->aprovar($verificacao, $this->authenticatedUser($request), $observacoes),
                [
                    'id', 'documento_identificacao_id', 'utilizador_solicitante_id',
                    'utilizador_verificador_id', 'estado', 'observacoes', 'data_verificacao', 'updated_at',
                ],
            ),
            'Verificação de identidade aprovada com sucesso.',
        );
    }

    public function reject(
        VerificacaoIdentidade $verificacao,
        Request $request,
        VerificacaoIdentidadeService $service,
    ): JsonResponse {
        $dados = $request->validate([
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
            'observacoes' => ['nullable', 'string', 'max:2000'],
        ]);

        return $this->execute(
            fn (): array => $this->attributes(
                $service->rejeitar(
                    $verificacao,
                    $this->authenticatedUser($request),
                    $dados['motivo'],
                    $dados['observacoes'] ?? null,
                ),
                [
                    'id', 'documento_identificacao_id', 'utilizador_solicitante_id',
                    'utilizador_verificador_id', 'estado', 'motivo_rejeicao',
                    'observacoes', 'data_verificacao', 'updated_at',
                ],
            ),
            'Verificação de identidade rejeitada com sucesso.',
        );
    }

    public function requestCorrection(
        VerificacaoIdentidade $verificacao,
        Request $request,
        VerificacaoIdentidadeService $service,
    ): JsonResponse {
        $dados = $request->validate([
            'motivo' => ['required', 'string', 'min:5', 'max:500'],
            'observacoes' => ['nullable', 'string', 'max:2000'],
        ]);

        return $this->execute(
            fn (): array => $this->attributes(
                $service->solicitarCorrecao($verificacao, $this->authenticatedUser($request), $dados['motivo'], $dados['observacoes'] ?? null),
                ['id', 'documento_identificacao_id', 'utilizador_solicitante_id', 'utilizador_verificador_id', 'estado', 'motivo_rejeicao', 'observacoes', 'data_verificacao', 'updated_at'],
            ),
            'Correcção do documento solicitada com sucesso.',
        );
    }
}
