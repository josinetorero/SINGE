<?php

namespace App\Http\Controllers\Ocorrencias;

use App\Http\Controllers\SingeApiController;
use App\Http\Requests\Ocorrencias\IndexOcorrenciasRequest;
use App\Http\Requests\Ocorrencias\IndexOperadorOcorrenciasRequest;
use App\Http\Requests\Ocorrencias\StoreOcorrenciaRequest;
use App\Http\Requests\Ocorrencias\StoreOperatorOcorrenciaRequest;
use App\Http\Requests\Ocorrencias\UpdateOcorrenciaRequest;
use App\Models\Evidencia;
use App\Models\Ocorrencia;
use App\Models\TipoOcorrencia;
use App\Services\Ocorrencias\OcorrenciaService;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Services\Ocorrencias\DeteccaoDuplicadosService;
use Illuminate\Support\Facades\Log;
use Throwable;
use App\Services\Ocorrencias\AnaliseSemanticaDuplicadosService;
use App\Services\Ocorrencias\SugestaoComplementoDuplicadosService;

class OcorrenciaController extends SingeApiController
{
    public function suggestDescription(Ocorrencia $ocorrencia, SugestaoComplementoDuplicadosService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->sugerir($ocorrencia),
            'Sugestões de complemento consultadas com sucesso.',
        );
    }

    public function indexForOperator(
        IndexOperadorOcorrenciasRequest $request,
        OcorrenciaService $service,
    ): JsonResponse {
        return $this->execute(function () use ($request, $service): array {
            $filtros = $request->validated();
            $paginator = $service->listarOperacionais(
                $filtros,
                (int) ($filtros['per_page'] ?? 15),
            );

            return [
                'items' => collect($paginator->items())
                    ->map(fn (Ocorrencia $ocorrencia): array => $this->resumoOperacional($ocorrencia))
                    ->all(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'last_page' => $paginator->lastPage(),
                    'total' => $paginator->total(),
                ],
                'estatisticas' => $service->estatisticasOperacionais(),
            ];
        }, 'Ocorrências operacionais consultadas com sucesso.');
    }

    public function indexTypesForOperator(OcorrenciaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listarTipos()
                ->map(fn (TipoOcorrencia $tipo): array => $this->attributes($tipo, ['id', 'nome', 'ativo']))
                ->all(),
            'Tipos de ocorrência consultados com sucesso.',
        );
    }

    public function index(IndexOcorrenciasRequest $request, OcorrenciaService $service): JsonResponse
    {
        return $this->execute(function () use ($request, $service): array {
            $utilizador = $this->authenticatedUser($request);
            $paginator = $service->listarDoUtilizador(
                $utilizador,
                $request->validated(),
                (int) $request->validated('per_page', 15),
            );

            return [
                'items' => collect($paginator->items())
                    ->map(fn (Ocorrencia $ocorrencia): array => $this->resumo($ocorrencia))
                    ->all(),
                'pagination' => [
                    'current_page' => $paginator->currentPage(),
                    'per_page' => $paginator->perPage(),
                    'last_page' => $paginator->lastPage(),
                    'total' => $paginator->total(),
                ],
                'estatisticas' => $service->estatisticasDoUtilizador($utilizador),
            ];
        }, 'Ocorrências do cidadão consultadas com sucesso.');
    }

    public function indexTypes(OcorrenciaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $service->listarTiposAtivos()
                ->map(fn (TipoOcorrencia $tipo): array => $this->attributes($tipo, ['id', 'nome', 'descricao']))
                ->all(),
            'Tipos de ocorrência consultados com sucesso.',
        );
    }

    public function store(StoreOcorrenciaRequest $request, OcorrenciaService $service): JsonResponse
    {
        return $this->execute(
            fn (): array => $this->detalhes(
                $service->criar($request->validated(), $this->authenticatedUser($request)),
            ),
            'Ocorrência registada com sucesso e aguarda avaliação de prioridade.',
            201,
        );
    }

   public function storeForOperator(
        StoreOperatorOcorrenciaRequest $request,
        OcorrenciaService $service,
        DeteccaoDuplicadosService $detector,
        AnaliseSemanticaDuplicadosService $analiseSemantica,
    ): JsonResponse {
        return $this->execute(
            function () use (
                $request,
                $service,
                $detector,
                $analiseSemantica,
            ): array {
                // 1. Registar a ocorrência normalmente.
                $ocorrencia = $service->criar(
                    $request->validated(),
                    $this->authenticatedUser($request),
                );

                // 2. Preparar os detalhes habituais.
                $details = $this->detalhes($ocorrencia, true);

                // 3. Procurar possíveis duplicados.
                // A falha da detecção ou da IA não pode impedir o registo.
                $details['possiveis_duplicados'] = $this->buscarDuplicados(
                    $ocorrencia,
                    $detector,
                    $analiseSemantica,
                );

                return $details;
            },
            'Ocorrência institucional registada com sucesso e aguarda validação.',
            201,
        );
    }

    public function show(int $id, Request $request, OcorrenciaService $service): JsonResponse
    {
        return $this->execute(
            function () use ($id, $request, $service): array {
                $utilizador = $this->authenticatedUser($request);
                $ocorrencia = $service->consultar($id, $utilizador);

                return $this->detalhes($ocorrencia, $utilizador->perfil?->nome === 'Operador');
            },
            'Ocorrência consultada com sucesso.',
        );
    }

    public function update(
        UpdateOcorrenciaRequest $request,
        Ocorrencia $ocorrencia,
        OcorrenciaService $service,
    ): JsonResponse {
        $dados = $request->validated();
        if (array_key_exists('estado', $dados)) {
            return $this->failure('A alteração do estado deve ser enviada numa operação separada.', 422);
        }

        return $this->execute(
            fn (): array => $this->attributes(
                $service->atualizar($ocorrencia, $dados, $this->authenticatedUser($request)),
                [
                    'id', 'titulo', 'descricao', 'localizacao', 'localizacao_id',
                    'latitude', 'longitude', 'tipo_ocorrencia_id', 'prioridade_id',
                    'utilizador_id', 'origem', 'comunicante_nome', 'comunicante_contacto',
                    'data_ocorrencia', 'estado', 'created_at', 'updated_at',
                ],
            ),
            'Ocorrência actualizada com sucesso.',
        );
    }

    public function updateState(
        UpdateOcorrenciaRequest $request,
        Ocorrencia $ocorrencia,
        OcorrenciaService $service,
    ): JsonResponse {
        $dados = $request->validated();
        if (! isset($dados['estado']) || count($dados) !== 1) {
            return $this->failure('Esta operação aceita apenas o novo estado da ocorrência.', 422);
        }

        return $this->execute(
            fn (): array => $this->attributes(
                $service->alterarEstado(
                    $ocorrencia,
                    $dados['estado'],
                    $this->authenticatedUser($request),
                ),
                [
                    'id', 'titulo', 'estado', 'prioridade_id',
                    'utilizador_id', 'updated_at',
                ],
            ),
            'Estado da ocorrência actualizado com sucesso.',
        );
    }

    /**
     * Procura possíveis ocorrências duplicadas sem comprometer o registo.
     *
     * Primeiro utiliza a detecção determinística.
     * Depois complementa os resultados com a análise semântica.
     *
     * @return array<int, array<string, mixed>>
     */
    private function buscarDuplicados(
        Ocorrencia $ocorrencia,
        DeteccaoDuplicadosService $detector,
        AnaliseSemanticaDuplicadosService $analiseSemantica,
    ): array {
        try {
            // 1. Obter candidatos através das regras determinísticas.
            $candidatas = $detector->buscarCandidatas($ocorrencia);

            if ($candidatas === []) {
                return [];
            }

            // 2. Analisar semanticamente os candidatos.
            // Se a IA falhar, o serviço devolve uma lista vazia.
            $analises = $analiseSemantica->analisar(
                $ocorrencia,
                $candidatas,
            );

            // 3. Combinar os resultados sem perder os candidatos originais.
            return collect($candidatas)
                ->map(function (array $candidata) use ($analises): array {
                    /** @var Ocorrencia $possivelDuplicado */
                    $possivelDuplicado = $candidata['ocorrencia'];

                    return [
                        ...$this->attributes($possivelDuplicado, [
                            'id',
                            'titulo',
                            'data_ocorrencia',
                            'estado',
                        ]),
                        'tipo_ocorrencia' => $possivelDuplicado->tipoOcorrencia?->nome,
                        'distancia_km' => $candidata['distancia_km'],
                        'criterio' => $candidata['criterio'],

                        // Resultado da IA, quando disponível.
                        'analise_semantica' => $analises[$possivelDuplicado->id] ?? null,
                    ];
                })
                ->all();

        } catch (Throwable $e) {
            Log::warning(
                'Não foi possível detectar possíveis duplicados da ocorrência.',
                [
                    'ocorrencia_id' => $ocorrencia->id,
                    'erro' => $e::class,
                ],
            );

            return [];
        }
    }
    
    /** @return array<string, mixed> */
    private function resumo(Ocorrencia $ocorrencia): array
    {
        return [
            ...$this->attributes($ocorrencia, [
                'id', 'titulo', 'descricao', 'localizacao', 'localizacao_id',
                'latitude', 'longitude', 'tipo_ocorrencia_id', 'prioridade_id',
                'utilizador_id', 'origem', 'comunicante_nome', 'comunicante_contacto',
                'data_ocorrencia', 'estado', 'created_at', 'updated_at',
            ]),
            'tipo_ocorrencia' => $ocorrencia->tipoOcorrencia
                ? $this->attributes($ocorrencia->tipoOcorrencia, ['id', 'nome'])
                : null,
            'prioridade' => $ocorrencia->prioridade
                ? $this->attributes($ocorrencia->prioridade, ['id', 'nome', 'nivel'])
                : null,
        ];
    }

    /** @return array<string, mixed> */
    private function resumoOperacional(Ocorrencia $ocorrencia): array
    {
        return [
            ...$this->attributes($ocorrencia, [
                'id', 'titulo', 'descricao', 'localizacao', 'localizacao_id',
                'latitude', 'longitude', 'tipo_ocorrencia_id', 'origem', 'data_ocorrencia',
                'estado', 'created_at', 'updated_at',
            ]),
            'tipo_ocorrencia' => $ocorrencia->tipoOcorrencia
                ? $this->attributes($ocorrencia->tipoOcorrencia, ['id', 'nome'])
                : null,
            'localizacao_geografica' => $ocorrencia->localizacaoGeografica
                ? [
                    'provincia' => $ocorrencia->localizacaoGeografica->provincia?->nome,
                    'distrito' => $ocorrencia->localizacaoGeografica->distrito?->nome,
                    'municipio' => $ocorrencia->localizacaoGeografica->municipio?->nome,
                    'endereco_referencia' => $ocorrencia->localizacaoGeografica->endereco_referencia,
                ]
                : null,
        ];
    }

    /** @return array<string, mixed> */
    private function detalhes(Ocorrencia $ocorrencia, bool $includeOperatorInfo = false): array
    {
        $details = [
            ...$this->resumo($ocorrencia),
            'localizacao_geografica' => $ocorrencia->localizacaoGeografica
                ? $this->attributes($ocorrencia->localizacaoGeografica, [
                    'id', 'endereco_referencia', 'latitude', 'longitude',
                ]) + [
                    'provincia' => $ocorrencia->localizacaoGeografica->provincia?->nome,
                    'distrito' => $ocorrencia->localizacaoGeografica->distrito?->nome,
                    'municipio' => $ocorrencia->localizacaoGeografica->municipio?->nome,
                    'posto_administrativo' => $ocorrencia->localizacaoGeografica->postoAdministrativo?->nome,
                    'bairro' => $ocorrencia->localizacaoGeografica->bairro?->nome,
                    'quarteirao' => $ocorrencia->localizacaoGeografica->quarteirao?->nome,
                ]
                : null,
            'historico' => $ocorrencia->historico
                ->map(function (Model $item) use ($includeOperatorInfo): array {
                    $attributes = $this->attributes($item, [
                        'id', 'estado_anterior', 'estado_novo', 'observacoes', 'created_at',
                    ]);
                    if ($includeOperatorInfo) {
                        $attributes['utilizador_nome'] = $item->utilizador?->name;
                    }

                    return $attributes;
                })
                ->all(),
            'evidencias' => $ocorrencia->evidencias
                ->map(fn (Evidencia $evidencia): array => $this->attributes($evidencia, [
                    'id', 'nome_ficheiro', 'tipo_mime', 'tamanho_bytes', 'descricao', 'created_at',
                ]))
                ->all(),
        ];

        if ($includeOperatorInfo) {
            unset($details['utilizador_id'], $details['prioridade_id'], $details['prioridade']);
            $details['autor_registo'] = $ocorrencia->utilizador?->name;
            $details['comunicante'] = $ocorrencia->comunicante_nome || $ocorrencia->comunicante_contacto
                ? [
                    'name' => $ocorrencia->comunicante_nome,
                    'contacto' => $ocorrencia->comunicante_contacto,
                ]
                : ($ocorrencia->origem === 'cidadao'
                    ? ['name' => $ocorrencia->utilizador?->name, 'contacto' => null]
                    : null);
            $details['validacoes'] = $ocorrencia->validacoes
                ->map(fn (Model $validacao): array => [
                    ...$this->attributes($validacao, [
                        'id', 'estado', 'observacoes', 'motivo', 'data_validacao', 'created_at',
                    ]),
                    'utilizador_id' => $validacao->utilizador_id,
                    'utilizador_nome' => $validacao->utilizador?->name,
                ])
                ->all();
        }

        return $details;
    }
}
