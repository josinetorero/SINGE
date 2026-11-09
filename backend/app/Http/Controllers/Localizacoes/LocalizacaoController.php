<?php

namespace App\Http\Controllers\Localizacoes;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Localizacoes\StoreLocalizacaoRequest;
use App\Http\Requests\Localizacoes\UpdateLocalizacaoRequest;
use App\Models\Localizacao;
use App\Services\Localizacoes\LocalizacaoService;
use Illuminate\Http\JsonResponse;

class LocalizacaoController extends SingeApiController
{
    public function store(StoreLocalizacaoRequest $request, LocalizacaoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->criar($request->validated(), $this->authenticatedUser($request)),
                [
                    'id', 'provincia_id', 'distrito_id', 'municipio_id',
                    'posto_administrativo_id', 'bairro_id', 'quarteirao_id',
                    'endereco_referencia', 'latitude', 'longitude', 'created_at',
                ],
            ),
            'Localização registada com sucesso.',
            201,
        );
    }

    public function update(
        UpdateLocalizacaoRequest $request,
        Localizacao $localizacao,
        LocalizacaoService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->atualizar($localizacao, $request->validated(), $this->authenticatedUser($request)),
                [
                    'id', 'provincia_id', 'distrito_id', 'municipio_id',
                    'posto_administrativo_id', 'bairro_id', 'quarteirao_id',
                    'endereco_referencia', 'latitude', 'longitude', 'updated_at',
                ],
            ),
            'Localização actualizada com sucesso.',
        );
    }
}
