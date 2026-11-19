<?php

namespace App\Http\Controllers\Alertas;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Alertas\StoreAlertaPublicoRequest;
use App\Models\AlertaPublico;
use App\Services\Alertas\AlertaPublicoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlertaPublicoController extends SingeApiController
{
    public function index(Request $request, AlertaPublicoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listarPublicos($request->only(['q', 'tipo_perigo', 'severidade', 'estado']))
                ->map(fn (AlertaPublico $alerta): array => $this->serializar($alerta))
                ->all(),
            'Alertas públicos consultados com sucesso.',
        );
    }

    public function managementIndex(AlertaPublicoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listarGestao()
                ->map(fn (AlertaPublico $alerta): array => $this->serializar($alerta))
                ->all(),
            'Alertas para gestão consultados com sucesso.',
        );
    }

    public function show(int $id, AlertaPublicoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->serializar($service->consultarPublico($id), true),
            'Alerta público consultado com sucesso.',
        );
    }

    public function store(StoreAlertaPublicoRequest $request, AlertaPublicoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->serializar(
                $service->criar($request->validated(), $this->authenticatedUser($request)),
            ),
            'Alerta criado em rascunho.',
            201,
        );
    }

    public function update(
        StoreAlertaPublicoRequest $request,
        AlertaPublico $alertaPublico,
        AlertaPublicoService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->serializar(
                $service->actualizar(
                    $alertaPublico,
                    $request->validated(),
                    $this->authenticatedUser($request),
                ),
            ),
            'Alerta actualizado com sucesso.',
        );
    }

    public function publish(
        AlertaPublico $alertaPublico,
        Request $request,
        AlertaPublicoService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->serializar(
                $service->publicar($alertaPublico, $this->authenticatedUser($request)),
            ),
            'Alerta publicado com sucesso.',
        );
    }

    public function close(
        AlertaPublico $alertaPublico,
        Request $request,
        AlertaPublicoService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->serializar(
                $service->encerrar($alertaPublico, $this->authenticatedUser($request)),
            ),
            'Alerta encerrado com sucesso.',
        );
    }

    /** @return array<string, mixed> */
    private function serializar(AlertaPublico $alerta, bool $includeHistory = false): array
    {
        $alerta->loadMissing(['localizacao.provincia', 'localizacao.distrito']);
        if ($includeHistory) {
            $alerta->loadMissing('historico.utilizador');
        }

        $validFrom = $alerta->valido_desde;
        $validUntil = $alerta->valido_ate;

        return [
            ...$this->attributes($alerta, [
                'id', 'titulo', 'descricao', 'tipo_perigo', 'severidade', 'localizacao_id',
                'area_geografica', 'data_publicacao', 'valido_desde', 'valido_ate',
                'fonte', 'estado', 'recomendacoes', 'created_at', 'updated_at',
            ]),
            'activo' => $alerta->estado === 'publicado'
                && $validFrom !== null && $validUntil !== null
                && $validFrom->isPast() && $validUntil->isFuture(),
            'localizacao' => $alerta->localizacao ? [
                'provincia' => $alerta->localizacao->provincia?->nome,
                'distrito' => $alerta->localizacao->distrito?->nome,
                'referencia' => $alerta->localizacao->endereco_referencia,
            ] : null,
            'historico' => $includeHistory ? $alerta->historico->map(fn ($item): array => [
                ...$this->attributes($item, [
                    'id', 'operacao', 'estado_anterior', 'estado_novo', 'observacoes', 'created_at',
                ]),
                'responsavel' => $item->utilizador?->name,
            ])->all() : [],
        ];
    }
}
