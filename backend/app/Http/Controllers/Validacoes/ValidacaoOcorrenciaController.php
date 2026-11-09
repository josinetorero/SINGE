<?php

namespace App\Http\Controllers\Validacoes;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Validacoes\StoreValidacaoOcorrenciaRequest;
use App\Services\Validacoes\ValidacaoOcorrenciaService;
use Illuminate\Http\JsonResponse;

class ValidacaoOcorrenciaController extends SingeApiController
{
    public function store(
        StoreValidacaoOcorrenciaRequest $request,
        ValidacaoOcorrenciaService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->criar($request->validated(), $this->authenticatedUser($request)),
                [
                    'id', 'ocorrencia_id', 'utilizador_id', 'estado',
                    'observacoes', 'motivo', 'data_validacao', 'created_at',
                ],
            ),
            'Validação da ocorrência registada com sucesso.',
            201,
        );
    }
}
