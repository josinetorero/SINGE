<?php

namespace App\Http\Controllers\Avaliacoes;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Avaliacoes\StoreAvaliacaoPrioridadeRequest;
use App\Models\AvaliacaoPrioridade;
use App\Models\FatorPrioridade;
use App\Services\Avaliacoes\AvaliacaoPrioridadeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\Avaliacoes\SugestaoPrioridadeIAService;

class AvaliacaoPrioridadeController extends SingeApiController
{
    public function factors(AvaliacaoPrioridadeService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listarFatoresAtivos()
                ->map(fn (FatorPrioridade $fator): array => $this->attributes(
                    $fator,
                    ['id', 'nome', 'descricao', 'peso'],
                ))
                ->all(),
            'Factores oficiais consultados com sucesso.',
        );
    }

    public function index(Request $request, AvaliacaoPrioridadeService $service): JsonResponse
    {
        $ocorrenciaId = $request->integer('ocorrencia_id') ?: null;

        return $this->execute(
            fn (): array => $service->listarAvaliacoes($ocorrenciaId)
                ->map(fn (AvaliacaoPrioridade $avaliacao): array => $this->serializar($avaliacao))
                ->all(),
            'Avaliações de prioridade consultadas com sucesso.',
        );
    }

    public function store(
        StoreAvaliacaoPrioridadeRequest $request,
        AvaliacaoPrioridadeService $service,
    ): JsonResponse {
        return $this->execute(
            function () use ($request, $service): array {
                $avaliacao = $service->avaliar($request->validated(), $this->authenticatedUser($request));
                return $this->serializar($avaliacao);
            },
            'Avaliação de prioridade registada com sucesso.',
            201,
        );
    }

    /** @return array<string, mixed> */
    private function serializar(AvaliacaoPrioridade $avaliacao): array
    {
        $avaliacao->loadMissing(['prioridade', 'utilizador', 'detalhes']);

        return [
            ...$this->attributes($avaliacao, [
                'id', 'ocorrencia_id', 'utilizador_id', 'prioridade_id',
                'pontuacao_total', 'justificacao', 'created_at',
            ]),
            'prioridade' => $avaliacao->prioridade?->nome,
            'responsavel' => $avaliacao->utilizador?->name,
            'detalhes' => $avaliacao->detalhes->map(
                fn ($detalhe): array => $this->attributes($detalhe, [
                    'id', 'fator_prioridade_id', 'fator_nome_snapshot', 'fator_descricao_snapshot',
                    'pontuacao', 'peso_aplicado', 'contribuicao_ponderada', 'observacao',
                ]),
            )->all(),
        ];
    }

    public function suggest(
        Request $request,
        SugestaoPrioridadeIAService $service,
    ): JsonResponse {
        $dados = $request->validate([
            'ocorrencia_id' => ['required', 'integer', 'exists:ocorrencias,id'],
        ]);

        return $this->execute(
            fn (): array => $service->sugerir((int) $dados['ocorrencia_id']),
            'Sugestão de prioridade consultada com sucesso.',
        );
    }
}
