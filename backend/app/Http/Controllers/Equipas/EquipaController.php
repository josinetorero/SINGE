<?php

namespace App\Http\Controllers\Equipas;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Equipas\IndexEquipasRequest;
use App\Models\Equipa;
use App\Services\Equipas\EquipaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EquipaController extends SingeApiController
{
    public function index(IndexEquipasRequest $request, EquipaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listar($request->validated())
                ->map(fn (Equipa $equipa): array => $this->serializar($equipa))
                ->all(),
            'Equipas consultadas com sucesso.',
        );
    }

    public function types(EquipaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listarTipos()
                ->map(fn ($type): array => $this->attributes($type, ['id', 'nome']))
                ->all(),
            'Tipos de equipa consultados com sucesso.',
        );
    }

    public function show(Equipa $equipa, Request $request, EquipaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->serializar(
                $service->consultar($equipa->id, $this->authenticatedUser($request)),
            ),
            'Equipa consultada com sucesso.',
        );
    }

    /** @return array<string, mixed> */
    private function serializar(Equipa $equipa): array
    {
        $equipa->loadMissing(['tipoEquipa', 'utilizadores.perfil', 'missoes.ocorrencia']);

        return [
            ...$this->attributes($equipa, [
                'id', 'nome', 'tipo_equipa_id', 'estado', 'descricao', 'latitude', 'longitude', 'created_at', 'updated_at',
            ]),
            'tipo_equipa' => $equipa->tipoEquipa?->nome,
            'membros' => $equipa->utilizadores->map(fn ($user): array => [
                'id' => $user->id,
                'nome' => $user->name,
                'perfil' => $user->perfil?->nome,
            ])->all(),
            'missoes' => $equipa->missoes->map(fn ($missao): array => [
                'id' => $missao->id,
                'estado' => $missao->estado?->value ?? $missao->estado,
                'ocorrencia_id' => $missao->ocorrencia_id,
                'ocorrencia_titulo' => $missao->ocorrencia?->titulo,
                'data_atribuicao' => $missao->data_atribuicao,
            ])->all(),
        ];
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
                ['id', 'nome', 'tipo_equipa_id', 'estado', 'descricao', 'latitude', 'longitude', 'updated_at'],
            ),
            'Disponibilidade da equipa actualizada com sucesso.',
        );
    }

    public function updateLocation(Equipa $equipa, Request $request, EquipaService $service): JsonResponse
    {
        $dados = $request->validate([
            'latitude' => ['nullable', 'numeric', 'between:-90,90', 'required_with:longitude'],
            'longitude' => ['nullable', 'numeric', 'between:-180,180', 'required_with:latitude'],
        ]);
        return $this->execute(
            fn (): array => $this->attributes($service->atualizarLocalizacao($equipa, [
                'latitude' => isset($dados['latitude']) ? (float) $dados['latitude'] : null,
                'longitude' => isset($dados['longitude']) ? (float) $dados['longitude'] : null,
            ], $this->authenticatedUser($request)), ['id', 'latitude', 'longitude', 'updated_at']),
            'Localização da equipa actualizada com sucesso.',
        );
    }
}
