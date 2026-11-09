<?php

namespace App\Http\Controllers\Identificacao;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Documentos\StoreDocumentoIdentificacaoRequest;
use App\Http\Requests\Documentos\UpdateDocumentoIdentificacaoRequest;
use App\Models\DocumentoIdentificacao;
use App\Services\Identificacao\DocumentoIdentificacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class DocumentoIdentificacaoController extends SingeApiController
{
    public function store(
        StoreDocumentoIdentificacaoRequest $request,
        DocumentoIdentificacaoService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->criar($request->validated(), $this->authenticatedUser($request)),
                ['id', 'estado_verificacao', 'created_at'],
            ),
            'Documento de identificação registado com sucesso.',
            201,
        );
    }

    public function update(
        UpdateDocumentoIdentificacaoRequest $request,
        DocumentoIdentificacao $documentoIdentificacao,
        DocumentoIdentificacaoService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->atualizar(
                    $documentoIdentificacao,
                    $request->validated(),
                    $this->authenticatedUser($request),
                ),
                ['id', 'estado_verificacao', 'updated_at'],
            ),
            'Documento de identificação actualizado com sucesso.',
        );
    }

    public function download(
        DocumentoIdentificacao $documentoIdentificacao,
        Request $request,
        DocumentoIdentificacaoService $service,
    ): StreamedResponse|JsonResponse {
        return $this->executeStream(
            fn (): StreamedResponse => $service->descarregar(
                $documentoIdentificacao,
                $this->authenticatedUser($request),
            ),
        );
    }
}
