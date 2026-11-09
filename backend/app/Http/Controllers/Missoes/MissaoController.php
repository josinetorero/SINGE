<?php

namespace App\Http\Controllers\Missoes;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Missoes\StoreMissaoRequest;
use App\Http\Requests\Missoes\UpdateMissaoRequest;
use App\Models\Equipa;
use App\Models\Missao;
use App\Services\Equipas\EquipaService;
use App\Services\Missoes\MissaoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MissaoController extends SingeApiController
{
    public function store(StoreMissaoRequest $request, MissaoService $service): JsonResponse
    {
        $validated = $request->validated();
        $dados = array_intersect_key($validated, array_flip([
            'ocorrencia_id', 'equipa_id', 'coordenador_id', 'observacoes',
        ]));

        return $this->execute(
            fn (): array => $this->attributes(
                $service->criar($dados, $this->authenticatedUser($request)),
                [
                    'id', 'ocorrencia_id', 'equipa_id', 'coordenador_id',
                    'estado', 'data_atribuicao', 'data_inicio',
                    'data_conclusao', 'observacoes', 'created_at', 'updated_at',
                ],
            ),
            'Missão criada com sucesso.',
            201,
        );
    }

    public function indexForTeam(Equipa $equipa, Request $request, EquipaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->consultarMissoes($equipa, $this->authenticatedUser($request))
                ->map(fn (Missao $missao): array => $this->attributes($missao, [
                    'id', 'ocorrencia_id', 'equipa_id', 'coordenador_id',
                    'estado', 'data_atribuicao', 'data_inicio',
                    'data_conclusao', 'observacoes', 'created_at', 'updated_at',
                ]))
                ->all(),
            'Missões da equipa consultadas com sucesso.',
        );
    }

    public function updateState(
        UpdateMissaoRequest $request,
        Missao $missao,
        MissaoService $service,
    ): JsonResponse {
        $dados = $request->validated();
        if (! isset($dados['estado']) || count($dados) !== 1) {
            return $this->failure('Esta operação aceita apenas o novo estado da missão.', 422);
        }

        return $this->execute(
            fn (): array => $this->attributes(
                $service->atualizarEstado($missao, $dados['estado'], $this->authenticatedUser($request)),
                [
                    'id', 'ocorrencia_id', 'equipa_id', 'coordenador_id',
                    'estado', 'data_atribuicao', 'data_inicio',
                    'data_conclusao', 'observacoes', 'updated_at',
                ],
            ),
            'Estado da missão actualizado com sucesso.',
        );
    }

    public function reassignTeam(
        UpdateMissaoRequest $request,
        Missao $missao,
        MissaoService $service,
    ): JsonResponse {
        $dados = $request->validated();
        if (! isset($dados['equipa_id']) || count($dados) !== 1) {
            return $this->failure('Esta operação aceita apenas a nova equipa.', 422);
        }

        return $this->execute(
            fn (): array => $this->attributes(
                $service->associarEquipe(
                    $missao,
                    (int) $dados['equipa_id'],
                    $this->authenticatedUser($request),
                ),
                [
                    'id', 'ocorrencia_id', 'equipa_id', 'coordenador_id',
                    'estado', 'data_atribuicao', 'data_inicio',
                    'data_conclusao', 'observacoes', 'updated_at',
                ],
            ),
            'Equipa da missão actualizada com sucesso.',
        );
    }

    public function complete(Missao $missao, Request $request, MissaoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->concluir($missao, $this->authenticatedUser($request)),
                ['id', 'ocorrencia_id', 'equipa_id', 'coordenador_id', 'estado', 'data_conclusao'],
            ),
            'Missão concluída com sucesso.',
        );
    }

    public function cancel(Missao $missao, Request $request, MissaoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->attributes(
                $service->cancelar($missao, $this->authenticatedUser($request)),
                ['id', 'ocorrencia_id', 'equipa_id', 'coordenador_id', 'estado', 'data_conclusao'],
            ),
            'Missão cancelada com sucesso.',
        );
    }
}
