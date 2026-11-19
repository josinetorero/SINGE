<?php

namespace App\Http\Controllers\Coordenacao;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Ocorrencias\IndexCoordenadorOcorrenciasRequest;
use App\Models\Ocorrencia;
use App\Services\Coordenacao\CoordenadorService;
use Illuminate\Http\JsonResponse;

class CoordenadorController extends SingeApiController
{
    public function dashboard(CoordenadorService $service): JsonResponse
    {
        return $this->execute(function () use ($service): array {
            $data = $service->dashboard();
            $data['recentes'] = $data['recentes']->map(fn (Ocorrencia $ocorrencia): array => [
                ...$this->attributes($ocorrencia, [
                    'id', 'titulo', 'estado', 'origem', 'created_at', 'prioridade_id',
                ]),
                'tipo' => $ocorrencia->tipoOcorrencia?->nome,
                'prioridade' => $ocorrencia->prioridade?->nome,
                'validacao' => $ocorrencia->validacoes->first()?->estado,
            ])->all();
            $data['mapa_ocorrencias'] = $data['mapa_ocorrencias']->map(fn (Ocorrencia $ocorrencia): array => [
                'id' => $ocorrencia->id,
                'titulo' => $ocorrencia->titulo,
                'estado' => $ocorrencia->estado?->value ?? $ocorrencia->estado,
                'latitude' => $ocorrencia->latitude ?? $ocorrencia->localizacaoGeografica?->latitude,
                'longitude' => $ocorrencia->longitude ?? $ocorrencia->localizacaoGeografica?->longitude,
                'tipo' => $ocorrencia->tipoOcorrencia?->nome,
                'prioridade' => $ocorrencia->prioridade?->nome,
                'provincia' => $ocorrencia->localizacaoGeografica?->provincia?->nome,
                'distrito' => $ocorrencia->localizacaoGeografica?->distrito?->nome,
            ])->all();
            $data['actividade_recente'] = $data['actividade_recente']->map(fn ($avaliacao): array => [
                ...$this->attributes($avaliacao, [
                    'id', 'ocorrencia_id', 'pontuacao_total', 'created_at',
                ]),
                'responsavel' => $avaliacao->utilizador?->name,
                'prioridade' => $avaliacao->prioridade?->nome,
                'ocorrencia_titulo' => $avaliacao->ocorrencia?->titulo,
            ])->all();

            return $data;
        }, 'Dashboard do Coordenador consultado com sucesso.');
    }

    public function types(CoordenadorService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listarTiposOcorrencia()
                ->map(fn ($type): array => $this->attributes($type, ['id', 'nome']))
                ->all(),
            'Tipos de ocorrência consultados com sucesso.',
        );
    }

    public function occurrences(
        IndexCoordenadorOcorrenciasRequest $request,
        CoordenadorService $service,
    ): JsonResponse {
        return $this->execute(function () use ($request, $service): array {
            $filters = $request->validated();
            $paginator = $service->listarOcorrencias($filters, (int) ($filters['per_page'] ?? 20));

            return [
                'items' => $paginator->getCollection()->map(fn (Ocorrencia $ocorrencia): array => [
                    ...$this->attributes($ocorrencia, [
                        'id', 'titulo', 'descricao', 'localizacao', 'estado',
                        'prioridade_id', 'origem', 'data_ocorrencia', 'created_at',
                    ]),
                    'tipo' => $ocorrencia->tipoOcorrencia?->nome,
                    'prioridade' => $ocorrencia->prioridade?->nome,
                    'provincia' => $ocorrencia->localizacaoGeografica?->provincia?->nome,
                    'distrito' => $ocorrencia->localizacaoGeografica?->distrito?->nome,
                ])->all(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'last_page' => $paginator->lastPage(),
                    'total' => $paginator->total(),
                ],
            ];
        }, 'Ocorrências consultadas com sucesso.');
    }

    public function show(int $id, CoordenadorService $service): JsonResponse
    {
        return $this->execute(function () use ($id, $service): array {
            $ocorrencia = $service->consultarOcorrencia($id);

            return [
                ...$this->attributes($ocorrencia, [
                    'id', 'titulo', 'descricao', 'localizacao', 'latitude', 'longitude',
                    'tipo_ocorrencia_id', 'estado', 'origem', 'comunicante_nome',
                    'comunicante_contacto', 'data_ocorrencia', 'created_at',
                ]),
                'tipo' => $ocorrencia->tipoOcorrencia?->nome,
                'prioridade' => $ocorrencia->prioridade?->nome,
                'autor_registo' => $ocorrencia->utilizador?->name,
                'comunicante' => $ocorrencia->comunicante_nome || $ocorrencia->comunicante_contacto
                    ? ['nome' => $ocorrencia->comunicante_nome, 'contacto' => $ocorrencia->comunicante_contacto]
                    : ($ocorrencia->origem === 'cidadao'
                        ? ['nome' => $ocorrencia->utilizador?->name, 'contacto' => null]
                        : null),
                'localizacao_geografica' => $ocorrencia->localizacaoGeografica ? [
                    'provincia' => $ocorrencia->localizacaoGeografica->provincia?->nome,
                    'distrito' => $ocorrencia->localizacaoGeografica->distrito?->nome,
                    'municipio' => $ocorrencia->localizacaoGeografica->municipio?->nome,
                    'referencia' => $ocorrencia->localizacaoGeografica->endereco_referencia,
                ] : null,
                'historico' => $ocorrencia->historico->map(fn ($item): array => [
                    ...$this->attributes($item, [
                        'id', 'estado_anterior', 'estado_novo', 'observacoes', 'created_at',
                    ]),
                    'responsavel' => $item->utilizador?->name,
                ])->all(),
                'validacoes' => $ocorrencia->validacoes->map(fn ($item): array => [
                    ...$this->attributes($item, [
                        'id', 'estado', 'motivo', 'observacoes', 'data_validacao', 'created_at',
                    ]),
                    'responsavel' => $item->utilizador?->name,
                ])->all(),
                'avaliacoes' => $ocorrencia->avaliacoesPrioridade->map(fn ($item): array => [
                    ...$this->attributes($item, [
                        'id', 'pontuacao_total', 'justificacao', 'created_at',
                    ]),
                    'prioridade' => $item->prioridade?->nome,
                    'responsavel' => $item->utilizador?->name,
                    'factores' => $item->detalhes->map(fn ($detail): array => $this->attributes(
                        $detail,
                        [
                            'fator_nome_snapshot', 'fator_descricao_snapshot', 'pontuacao',
                            'peso_aplicado', 'contribuicao_ponderada', 'observacao',
                        ],
                    ))->all(),
                ])->all(),
                'missoes' => $ocorrencia->missoes->map(fn ($missao): array => [
                    'id' => $missao->id,
                    'estado' => $missao->estado?->value ?? $missao->estado,
                    'equipa' => $missao->equipa?->nome,
                    'coordenador' => $missao->coordenador?->name,
                    'data_atribuicao' => $missao->data_atribuicao,
                    'data_prevista_conclusao' => $missao->data_prevista_conclusao,
                    'data_conclusao' => $missao->data_conclusao,
                ])->all(),
            ];
        }, 'Detalhe operacional consultado com sucesso.');
    }
}
