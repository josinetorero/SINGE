<?php

namespace App\Http\Controllers\Missoes;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Missoes\StoreMissaoRequest;
use App\Http\Requests\Missoes\StoreActividadeMissaoRequest;
use App\Http\Requests\Missoes\IndexMissaoRequest;
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
            'ocorrencia_id', 'equipa_id', 'observacoes', 'objectivos',
            'instrucoes', 'data_atribuicao', 'data_prevista_conclusao',
        ]));

        return $this->execute(
            fn (): array => $this->attributes(
                $service->criar($dados, $this->authenticatedUser($request)),
                [
                    'id', 'ocorrencia_id', 'equipa_id', 'coordenador_id',
                    'estado', 'data_atribuicao', 'data_inicio',
                    'data_prevista_conclusao', 'data_conclusao', 'observacoes',
                    'objectivos', 'instrucoes', 'created_at', 'updated_at',
                ],
            ),
            'Missão criada com sucesso.',
            201,
        );
    }

    public function index(IndexMissaoRequest $request, MissaoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listar($request->validated())
                ->map(fn (Missao $missao): array => $this->serializar($missao))
                ->all(),
            'Missões consultadas com sucesso.',
        );
    }

    public function show(Missao $missao, Request $request, MissaoService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->serializar(
                $service->consultar($missao->id, $this->authenticatedUser($request)),
            ),
            'Missão consultada com sucesso.',
        );
    }

    /** @return array<string, mixed> */
    private function serializar(Missao $missao): array
    {
        $missao->loadMissing([
            'ocorrencia.prioridade', 'ocorrencia.localizacaoGeografica.provincia',
            'ocorrencia.localizacaoGeografica.distrito', 'equipa.tipoEquipa',
            'ocorrencia.evidencias', 'equipa.utilizadores.perfil', 'coordenador', 'historico.utilizador',
        ]);

        return [
            ...$this->attributes($missao, [
                'id', 'ocorrencia_id', 'equipa_id', 'coordenador_id', 'estado',
                'data_atribuicao', 'data_inicio', 'data_prevista_conclusao',
                'data_conclusao', 'observacoes', 'objectivos', 'instrucoes',
                'created_at', 'updated_at',
            ]),
            'ocorrencia' => $missao->ocorrencia
                ? $this->attributes($missao->ocorrencia, ['id', 'titulo', 'estado', 'prioridade_id'])
                    + [
                        'prioridade' => $missao->ocorrencia->prioridade?->nome,
                        'localizacao' => $missao->ocorrencia->localizacao,
                        'provincia' => $missao->ocorrencia->localizacaoGeografica?->provincia?->nome,
                        'distrito' => $missao->ocorrencia->localizacaoGeografica?->distrito?->nome,
                        'latitude' => $missao->ocorrencia->latitude,
                        'longitude' => $missao->ocorrencia->longitude,
                        'evidencias' => $missao->ocorrencia->evidencias->map(fn ($item): array => $this->attributes(
                            $item,
                            ['id', 'nome_ficheiro', 'tipo_mime', 'tamanho_bytes', 'descricao', 'created_at'],
                        ))->all(),
                    ]
                : null,
            'equipa' => $missao->equipa ? [
                ...$this->attributes($missao->equipa, ['id', 'nome', 'estado']),
                'tipo' => $missao->equipa->tipoEquipa?->nome,
                'membros' => $missao->equipa->utilizadores->map(fn ($user): array => [
                    'id' => $user->id,
                    'nome' => $user->name,
                    'perfil' => $user->perfil?->nome,
                ])->all(),
            ] : null,
            'coordenador' => $missao->coordenador?->name,
            'historico' => $missao->historico->map(fn ($item): array => [
                ...$this->attributes($item, [
                    'id', 'operacao', 'estado_anterior', 'estado_novo', 'observacoes', 'created_at',
                ]),
                'utilizador' => $item->utilizador?->name,
            ])->all(),
        ];
    }

    public function storeActivity(
        StoreActividadeMissaoRequest $request,
        Missao $missao,
        MissaoService $service,
    ): JsonResponse {
        $data = $request->validated();

        return $this->execute(
            fn (): array => $this->serializar($service->registarActividade(
                $missao,
                $data['operacao'],
                $data['observacoes'] ?? null,
                $this->authenticatedUser($request),
            )),
            'Actualização operacional registada com sucesso.',
            201,
        );
    }

    public function indexForTeam(Equipa $equipa, Request $request, EquipaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->consultarMissoes($equipa, $this->authenticatedUser($request))
                ->map(fn (Missao $missao): array => [
                    ...$this->attributes($missao, [
                        'id', 'ocorrencia_id', 'equipa_id', 'coordenador_id', 'estado',
                        'data_atribuicao', 'data_inicio', 'data_prevista_conclusao',
                        'data_conclusao', 'observacoes', 'objectivos', 'instrucoes', 'created_at', 'updated_at',
                    ]),
                    'ocorrencia' => $missao->ocorrencia ? [
                        'id' => $missao->ocorrencia->id,
                        'titulo' => $missao->ocorrencia->titulo,
                        'estado' => $missao->ocorrencia->estado?->value ?? $missao->ocorrencia->estado,
                        'prioridade' => $missao->ocorrencia->prioridade?->nome,
                        'localizacao' => $missao->ocorrencia->localizacao,
                        'provincia' => $missao->ocorrencia->localizacaoGeografica?->provincia?->nome,
                        'distrito' => $missao->ocorrencia->localizacaoGeografica?->distrito?->nome,
                        'latitude' => $missao->ocorrencia->latitude ?? $missao->ocorrencia->localizacaoGeografica?->latitude,
                        'longitude' => $missao->ocorrencia->longitude ?? $missao->ocorrencia->localizacaoGeografica?->longitude,
                    ] : null,
                    'historico' => $missao->historico->map(fn ($item): array => [
                        ...$this->attributes($item, ['id', 'operacao', 'estado_anterior', 'estado_novo', 'observacoes', 'created_at']),
                        'utilizador' => $item->utilizador?->name,
                    ])->all(),
                ])
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
