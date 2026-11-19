<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Admin\IndexUtilizadoresAdminRequest;
use App\Http\Requests\Admin\StoreUtilizadorAdminRequest;
use App\Http\Requests\Admin\UpdateUtilizadorAdminRequest;
use App\Models\User;
use App\Services\Admin\UtilizadorAdminService;
use App\Services\Admin\DashboardAdminService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UtilizadorAdminController extends SingeApiController
{
    public function dashboard(DashboardAdminService $service): JsonResponse
    {
        return $this->execute(fn (): array => $service->dados(), 'Indicadores administrativos consultados com sucesso.');
    }

    public function index(IndexUtilizadoresAdminRequest $request, UtilizadorAdminService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listar($request->validated())
                ->map(fn (User $user): array => $this->serializar($user))
                ->all(),
            'Utilizadores consultados com sucesso.',
        );
    }

    public function store(StoreUtilizadorAdminRequest $request, UtilizadorAdminService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->serializar($service->criar($request->validated())),
            'Utilizador criado com sucesso.',
            201,
        );
    }

    public function update(
        UpdateUtilizadorAdminRequest $request,
        User $utilizador,
        UtilizadorAdminService $service,
    ): JsonResponse {
        return $this->execute(
            fn (): array => $this->serializar($service->actualizar(
                $utilizador,
                $request->validated(),
                $this->authenticatedUser($request),
            )),
            'Utilizador actualizado com sucesso.',
        );
    }

    public function deactivate(User $utilizador, Request $request, UtilizadorAdminService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->serializar($service->desactivar($utilizador, $this->authenticatedUser($request))),
            'Utilizador desactivado e sessões revogadas com sucesso.',
        );
    }

    /** @return array<string, mixed> */
    private function serializar(User $user): array
    {
        $user->loadMissing(['perfil', 'equipa']);

        return [
            'id' => $user->id,
            'nome' => $user->name,
            'email' => $user->email,
            'perfil' => $user->perfil?->nome,
            'estado' => $user->activo ? 'Activo' : 'Inactivo',
            'equipa_id' => $user->equipa_id,
            'equipa' => $user->equipa?->nome,
            'created_at' => $user->created_at,
            'registo' => $user->created_at?->format('d/m/Y'),
        ];
    }
}
