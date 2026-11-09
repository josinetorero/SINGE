<?php

namespace App\Http\Controllers\Avaliacoes;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Avaliacoes\StoreAvaliacaoPrioridadeRequest;
use App\Services\Avaliacoes\AvaliacaoPrioridadeService;
use Illuminate\Http\JsonResponse;

class AvaliacaoPrioridadeController extends SingeApiController
{
    public function store(
        StoreAvaliacaoPrioridadeRequest $request,
        AvaliacaoPrioridadeService $service,
    ): JsonResponse {
        return $this->execute(
            function () use ($request, $service): array {
                $avaliacao = $service->avaliar($request->validated(), $this->authenticatedUser($request));
                $detalhes = $avaliacao->detalhes->map(
                    fn ($detalhe): array => $this->attributes($detalhe, [
                        'id', 'fator_prioridade_id', 'pontuacao', 'peso_aplicado', 'observacao',
                    ]),
                )->all();

                return [
                    ...$this->attributes($avaliacao, [
                        'id', 'ocorrencia_id', 'utilizador_id', 'prioridade_id',
                        'pontuacao_total', 'justificacao', 'created_at',
                    ]),
                    'detalhes' => $detalhes,
                ];
            },
            'Avaliação de prioridade registada com sucesso.',
            201,
        );
    }
}
