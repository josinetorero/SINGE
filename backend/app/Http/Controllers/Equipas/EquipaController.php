<?php

namespace App\Http\Controllers\Equipas;

use App\Http\Controllers\SingeApiController;
use App\Models\Equipa;
use App\Services\Equipas\EquipaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EquipaController extends SingeApiController
{
    public function show(Equipa $equipa, Request $request, EquipaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->consultar($equipa->id, $this->authenticatedUser($request)),
                ['id', 'nome', 'tipo_equipa_id', 'estado', 'descricao', 'created_at', 'updated_at'],
            ),
            'Equipa consultada com sucesso.',
        );
    }

    public function updateAvailability(Equipa $equipa, Request $request, EquipaService $service): JsonResponse
    {
        $estado = $request->input('estado');
        if (! is_string($estado)) {
            return $this->failure('O estado da equipa deve ser indicado como texto.', 422);
        }

        return $this->execute(
            fn (): array => $this->attributes(
                $service->atualizarDisponibilidade($equipa, $estado, $this->authenticatedUser($request)),
                ['id', 'nome', 'tipo_equipa_id', 'estado', 'descricao', 'updated_at'],
            ),
            'Disponibilidade da equipa actualizada com sucesso.',
        );
    }
}
