<?php

namespace App\Http\Controllers\Localizacoes;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Localizacoes\StoreLocalizacaoRequest;
use App\Http\Requests\Localizacoes\UpdateLocalizacaoRequest;
use App\Models\Localizacao;
use Illuminate\Http\Request;
use App\Services\Localizacoes\LocalizacaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class LocalizacaoController extends SingeApiController
{
    public function options(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'tipo' => ['required', Rule::in(['provincias', 'distritos', 'municipios', 'postos_administrativos', 'bairros', 'quarteiroes'])],
            'parent_id' => ['nullable', 'integer', 'min:1'],
        ]);

        $type = $validated['tipo'];
        $parentId = $validated['parent_id'] ?? null;
        $parentColumn = match ($type) {
            'provincias' => null,
            'distritos' => 'provincia_id',
            'municipios', 'postos_administrativos' => 'distrito_id',
            'bairros' => null,
            'quarteiroes' => 'bairro_id',
        };

        if ($type !== 'provincias' && $type !== 'bairros' && ! $parentId) {
            throw ValidationException::withMessages(['parent_id' => 'Seleccione primeiro a localização superior.']);
        }
        if ($type === 'bairros' && ! $parentId) {
            throw ValidationException::withMessages(['parent_id' => 'Seleccione primeiro um município ou posto administrativo.']);
        }

        $query = DB::table($type)->select(['id', 'nome'])->orderBy('nome');
        if ($type === 'bairros') {
            $mode = $request->validate(['parent_type' => ['required', Rule::in(['municipios', 'postos_administrativos'])]])['parent_type'];
            $query->where($mode === 'municipios' ? 'municipio_id' : 'posto_administrativo_id', $parentId);
        } elseif ($parentColumn !== null) {
            $query->where($parentColumn, $parentId);
        }

        return $this->execute(fn (): array => $query->get()->map(fn ($row): array => [
            'id' => (int) $row->id,
            'nome' => $row->nome,
        ])->all(), 'Opções geográficas carregadas.');
    }

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
