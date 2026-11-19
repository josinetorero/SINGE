
<?php

use App\Models\Ocorrencia;
use App\Models\Prioridade;
use App\Models\TipoOcorrencia;
use App\Models\User;
use App\Services\Ocorrencias\AnaliseSemanticaDuplicadosService;
use Illuminate\Support\Facades\Http;
use App\Enums\EstadoOcorrencia;

function singeSemanticaPreparar(): array
{
    $user = User::factory()->create();

    $tipo = TipoOcorrencia::query()->create([
        'nome' => 'Incendio '.uniqid(),
        'descricao' => 'Teste de analise semantica.',
        'ativo' => true,
    ]);

    $prioridade = Prioridade::query()->firstOrCreate(
        ['nome' => 'Baixa'],
        ['descricao' => 'Prioridade inicial.', 'nivel' => 4],
    );

    return [
        'user' => $user,
        'tipo' => $tipo,
        'prioridade' => $prioridade,
    ];
}

function singeSemanticaCriarOcorrencia(
    array $base,
    array $alteracoes = []
): Ocorrencia {
    return Ocorrencia::query()->create(array_merge([
        'titulo' => 'Incendio numa residencia',
        'descricao' => 'Incendio numa residencia no bairro central.',
        'localizacao' => 'Maputo',
        'latitude' => -25.9655,
        'longitude' => 32.5832,
        'tipo_ocorrencia_id' => $base['tipo']->id,
        'prioridade_id' => $base['prioridade']->id,
        'utilizador_id' => $base['user']->id,
        'estado' => EstadoOcorrencia::REGISTADA,
        'data_ocorrencia' => now(),
    ], $alteracoes));
}

function singeSemanticaRespostaOpenAI(array $resultados): array
{
    return [
        'choices' => [
            [
                'message' => [
                    'content' => json_encode([
                        'resultados' => $resultados,
                    ], JSON_UNESCAPED_UNICODE),
                ],
            ],
        ],
    ];
}

function singeSemanticaCandidata(Ocorrencia $ocorrencia): array
{
    return [
        'ocorrencia' => $ocorrencia,
        'distancia_km' => 1.5,
        'criterio' => 'PROXIMIDADE_GPS',
    ];
}

beforeEach(function () {
    config([
        'services.openai.enabled' => true,
        'services.openai.api_key' => 'test-api-key',
        'services.openai.base_url' => 'https://api.openai.test/v1',
        'services.openai.model' => 'gpt-6.1-terra',
        'services.openai.reasoning_effort' => 'none',
        'services.openai.max_output_tokens' => 6000,
        'services.openai.timeout' => 30,
        'services.openai.connect_timeout' => 5,
    ]);
});

it('identifica uma possivel ocorrencia duplicada', function () {
    Http::fake([
        '*' => Http::response(
            singeSemanticaRespostaOpenAI([
                [
                    'id' => 2,
                    'semelhanca' => 90,
                    'possivel_duplicado' => true,
                    'justificacao' => 'Os relatos descrevem aparentemente o mesmo incendio.',
                ],
            ]),
            200,
        ),
    ]);

    $base = singeSemanticaPreparar();

    $original = singeSemanticaCriarOcorrencia($base);
    $candidata = singeSemanticaCriarOcorrencia($base);

    // O resultado usa o ID real da candidata.
    Http::fake([
        '*' => Http::response(
            singeSemanticaRespostaOpenAI([
                [
                    'id' => $candidata->id,
                    'semelhanca' => 90,
                    'possivel_duplicado' => true,
                    'justificacao' => 'Os relatos descrevem aparentemente o mesmo incendio.',
                ],
            ]),
            200,
        ),
    ]);

    $resultado = (new AnaliseSemanticaDuplicadosService)->analisar(
        $original,
        [singeSemanticaCandidata($candidata)],
    );

    expect($resultado)
        ->toHaveKey($candidata->id)
        ->and($resultado[$candidata->id]['semelhanca'])->toBe(90)
        ->and($resultado[$candidata->id]['possivel_duplicado'])->toBeTrue()
        ->and($resultado[$candidata->id]['justificacao'])
        ->toBe('Os relatos descrevem aparentemente o mesmo incendio.');
});


it('identifica quando duas ocorrencias nao sao duplicadas', function () {
    $base = singeSemanticaPreparar();

    $original = singeSemanticaCriarOcorrencia($base);

    $candidata = singeSemanticaCriarOcorrencia($base, [
        'titulo' => 'Incendio numa oficina',
        'descricao' => 'Incendio numa oficina noutra zona da cidade.',
    ]);

    Http::fake([
        'api.openai.test/v1/chat/completions' => Http::response([
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode([
                            'resultados' => [
                                [
                                    'id' => (int) $candidata->id,
                                    'semelhanca' => 35,
                                    'possivel_duplicado' => false,
                                    'justificacao' => 'Os relatos descrevem acontecimentos diferentes.',
                                ],
                            ],
                        ], JSON_UNESCAPED_UNICODE),
                    ],
                ],
            ],
        ], 200),
    ]);

    $resultado = (new AnaliseSemanticaDuplicadosService)->analisar(
        $original,
        [singeSemanticaCandidata($candidata)],
    );

    expect($resultado)->toHaveKey($candidata->id)
        ->and($resultado[$candidata->id]['semelhanca'])->toBe(35)
        ->and($resultado[$candidata->id]['possivel_duplicado'])->toBeFalse();
});


it('ignora uma resposta JSON invalida da OpenAI', function () {
    Http::fake([
        '*' => Http::response([
            'choices' => [
                [
                    'message' => [
                        'content' => 'Isto nao e um JSON valido.',
                    ],
                ],
            ],
        ], 200),
    ]);

    $base = singeSemanticaPreparar();

    $original = singeSemanticaCriarOcorrencia($base);
    $candidata = singeSemanticaCriarOcorrencia($base);

    $resultado = (new AnaliseSemanticaDuplicadosService)->analisar(
        $original,
        [singeSemanticaCandidata($candidata)],
    );

    expect($resultado)->toBeEmpty();
});

it('ignora respostas com dados fora do formato esperado', function () {
    Http::fake([
        '*' => Http::response(
            singeSemanticaRespostaOpenAI([
                [
                    'id' => 999999,
                    'semelhanca' => 95,
                    'possivel_duplicado' => true,
                    'justificacao' => 'ID inexistente.',
                ],
                [
                    'id' => 2,
                    'semelhanca' => 150,
                    'possivel_duplicado' => true,
                    'justificacao' => 'Pontuacao invalida.',
                ],
                [
                    'id' => 3,
                    'semelhanca' => 90,
                    'possivel_duplicado' => 'sim',
                    'justificacao' => 'Tipo booleano invalido.',
                ],
            ]),
            200,
        ),
    ]);

    $base = singeSemanticaPreparar();

    $original = singeSemanticaCriarOcorrencia($base);
    $candidata = singeSemanticaCriarOcorrencia($base);

    $resultado = (new AnaliseSemanticaDuplicadosService)->analisar(
        $original,
        [singeSemanticaCandidata($candidata)],
    );

    expect($resultado)->toBeEmpty();
});

it('nao impede o funcionamento quando a OpenAI devolve erro HTTP', function () {
    Http::fake([
        '*' => Http::response([
            'error' => 'OpenAI indisponivel.',
        ], 500),
    ]);

    $base = singeSemanticaPreparar();

    $original = singeSemanticaCriarOcorrencia($base);
    $candidata = singeSemanticaCriarOcorrencia($base);

    $resultado = (new AnaliseSemanticaDuplicadosService)->analisar(
        $original,
        [singeSemanticaCandidata($candidata)],
    );

    expect($resultado)->toBeEmpty();
});

it('nao faz chamadas a OpenAI quando a analise esta desactivada', function () {
    config(['services.openai.enabled' => false]);

    Http::fake();

    $base = singeSemanticaPreparar();

    $original = singeSemanticaCriarOcorrencia($base);
    $candidata = singeSemanticaCriarOcorrencia($base);

    $resultado = (new AnaliseSemanticaDuplicadosService)->analisar(
        $original,
        [singeSemanticaCandidata($candidata)],
    );

    expect($resultado)->toBeEmpty();

    Http::assertNothingSent();
});

it('nao envia dados pessoais dos comunicantes a OpenAI', function () {
    Http::fake([
        '*' => Http::response(
            singeSemanticaRespostaOpenAI([]),
            200,
        ),
    ]);

    $base = singeSemanticaPreparar();

    $original = singeSemanticaCriarOcorrencia($base);
    $candidata = singeSemanticaCriarOcorrencia($base);

    // Simular dados pessoais presentes nos modelos.
    $original->forceFill([
        'comunicante_nome' => 'Nome Confidencial Principal',
        'comunicante_contacto' => '841234567',
    ]);

    $candidata->forceFill([
        'comunicante_nome' => 'Nome Confidencial Candidato',
        'comunicante_contacto' => '849876543',
    ]);

    (new AnaliseSemanticaDuplicadosService)->analisar(
        $original,
        [singeSemanticaCandidata($candidata)],
    );

    Http::assertSent(function ($request) {
        $payload = $request->data();
        $conteudo = $payload['messages'][1]['content'] ?? '';

        return $request->url() === 'https://api.openai.test/v1/chat/completions'
            && $request->hasHeader('Authorization', 'Bearer test-api-key')
            && $payload['model'] === 'gpt-6.1-terra'
            && $payload['reasoning_effort'] === 'none'
            && $payload['max_completion_tokens'] === 6000
            && $payload['response_format'] === ['type' => 'json_object']
            && ! str_contains($conteudo, 'Nome Confidencial Principal')
            && ! str_contains($conteudo, 'Nome Confidencial Candidato')
            && ! str_contains($conteudo, '841234567')
            && ! str_contains($conteudo, '849876543');
    });
});

it('envia no maximo dez candidatas a OpenAI', function () {
    Http::fake([
        '*' => Http::response(
            singeSemanticaRespostaOpenAI([]),
            200,
        ),
    ]);

    $base = singeSemanticaPreparar();

    $original = singeSemanticaCriarOcorrencia($base);

    $candidatas = [];

    for ($i = 0; $i < 11; $i++) {
        $candidata = singeSemanticaCriarOcorrencia($base);

        $candidatas[] = singeSemanticaCandidata($candidata);
    }

    (new AnaliseSemanticaDuplicadosService)->analisar(
        $original,
        $candidatas,
    );

    Http::assertSent(function ($request) {
        $dados = json_decode(
            $request->data()['messages'][1]['content'] ?? '',
            true,
        );

        return is_array($dados)
            && count($dados['candidatas'] ?? []) === 10;
    });
});

it('nao altera estados nem cria validacoes durante a analise semantica', function () {
    Http::fake([
        '*' => Http::response(
            singeSemanticaRespostaOpenAI([
                [
                    'id' => 2,
                    'semelhanca' => 95,
                    'possivel_duplicado' => true,
                    'justificacao' => 'Possivel duplicacao.',
                ],
            ]),
            200,
        ),
    ]);

    $base = singeSemanticaPreparar();

    $original = singeSemanticaCriarOcorrencia($base);
    $candidata = singeSemanticaCriarOcorrencia($base);

    Http::fake([
        '*' => Http::response(
            singeSemanticaRespostaOpenAI([
                [
                    'id' => $candidata->id,
                    'semelhanca' => 95,
                    'possivel_duplicado' => true,
                    'justificacao' => 'Possivel duplicacao.',
                ],
            ]),
            200,
        ),
    ]);

    (new AnaliseSemanticaDuplicadosService)->analisar(
        $original,
        [singeSemanticaCandidata($candidata)],
    );

    expect($original->fresh()->estado)->toBe(EstadoOcorrencia::REGISTADA)
        ->and($candidata->fresh()->estado)->toBe(EstadoOcorrencia::REGISTADA)
        ->and(\App\Models\ValidacaoOcorrencia::query()->count())->toBe(0);
});
