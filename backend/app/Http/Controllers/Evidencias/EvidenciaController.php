<?php

namespace App\Http\Controllers\Evidencias;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Evidencias\StoreEvidenciaRequest;
use App\Models\Evidencia;
use App\Services\Evidencias\EvidenciaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EvidenciaController extends SingeApiController
{
    public function store(StoreEvidenciaRequest $request, EvidenciaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->criar($request->validated(), $this->authenticatedUser($request)),
                [
                    'id', 'ocorrencia_id', 'utilizador_id', 'nome_ficheiro',
                    'tipo_mime', 'tamanho_bytes', 'descricao', 'created_at',
                ],
            ),
            'Evidência registada com sucesso.',
            201,
        );
    }

    public function download(Evidencia $evidencia, Request $request, EvidenciaService $service): StreamedResponse|JsonResponse
    {
        return $this->executeStream(
            fn (): StreamedResponse => $service->descarregar($evidencia, $this->authenticatedUser($request)),
        );
    }
}
