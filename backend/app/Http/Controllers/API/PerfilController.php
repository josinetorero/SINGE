<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Auth\UpdatePerfilRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;

class PerfilController extends SingeApiController
{
    public function update(UpdatePerfilRequest $request, AuthService $service): JsonResponse
    {
        return $this->execute(
            function () use ($request, $service): array {
                $user = $service->atualizarPerfilCidadao(
                    $request->validated(),
                    $this->authenticatedUser($request),
                );

                return $this->attributes($user, ['id', 'name', 'email', 'created_at', 'updated_at'])
                    + ['perfil' => $user->perfil ? $this->attributes($user->perfil, ['id', 'nome']) : null];
            },
            'Perfil actualizado com sucesso.',
        );
    }
}
