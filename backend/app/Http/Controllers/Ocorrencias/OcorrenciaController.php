<?php

namespace App\Http\Controllers\Ocorrencias;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Ocorrencias\UpdateOcorrenciaRequest;
use App\Models\Ocorrencia;
use App\Services\Ocorrencias\OcorrenciaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OcorrenciaController extends SingeApiController
{
    public function show(int $id, Request $request, OcorrenciaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->consultar($id, $this->authenticatedUser($request)),
                [
                    'id', 'titulo', 'descricao', 'localizacao', 'localizacao_id',
                    'latitude', 'longitude', 'tipo_ocorrencia_id', 'prioridade_id',
                    'utilizador_id', 'estado', 'created_at', 'updated_at',
                ],
            ),
            'Ocorrência consultada com sucesso.',
        );
    }

    public function update(
        UpdateOcorrenciaRequest $request,
        Ocorrencia $ocorrencia,
        OcorrenciaService $service,
    ): JsonResponse {
        $dados = $request->validated();
        if (array_key_exists('estado', $dados)) {
            return $this->failure('A alteração do estado deve ser enviada numa operação separada.', 422);
        }

        return $this->execute(
            fn (): array => $this->attributes(
                $service->atualizar($ocorrencia, $dados, $this->authenticatedUser($request)),
                [
                    'id', 'titulo', 'descricao', 'localizacao', 'localizacao_id',
                    'latitude', 'longitude', 'tipo_ocorrencia_id', 'prioridade_id',
                    'utilizador_id', 'estado', 'created_at', 'updated_at',
                ],
            ),
            'Ocorrência actualizada com sucesso.',
        );
    }

    public function updateState(
        UpdateOcorrenciaRequest $request,
        Ocorrencia $ocorrencia,
        OcorrenciaService $service,
    ): JsonResponse {
        $dados = $request->validated();
        if (! isset($dados['estado']) || count($dados) !== 1) {
            return $this->failure('Esta operação aceita apenas o novo estado da ocorrência.', 422);
        }

        return $this->execute(
            fn (): array => $this->attributes(
                $service->alterarEstado(
                    $ocorrencia,
                    $dados['estado'],
                    $this->authenticatedUser($request),
                ),
                [
                    'id', 'titulo', 'estado', 'prioridade_id',
                    'utilizador_id', 'updated_at',
                ],
            ),
            'Estado da ocorrência actualizado com sucesso.',
        );
    }
}
