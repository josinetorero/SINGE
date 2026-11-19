<?php

use App\Enums\EstadoOcorrencia;
use App\Enums\EstadoEquipa;
use App\Models\Equipa;
use App\Models\FatorPrioridade;
use App\Models\Ocorrencia;
use App\Models\Prioridade;
use App\Models\TipoOcorrencia;
use App\Models\TipoEquipa;
use App\Models\User;
use App\Services\Avaliacoes\SugestaoPrioridadeIAService;
use Illuminate\Support\Facades\Http;

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

it('requests priority suggestions from the configured OpenAI model', function () {
    $user = User::factory()->create();
    $type = TipoOcorrencia::query()->create([
        'nome' => 'Incêndio',
        'descricao' => 'Incêndio em edifício.',
        'ativo' => true,
    ]);
    $priority = Prioridade::query()->firstOrCreate(
        ['nome' => 'Baixa'],
        ['descricao' => 'Prioridade baixa.', 'nivel' => 4],
    );
    $occurrence = Ocorrencia::query()->create([
        'titulo' => 'Incêndio numa residência',
        'descricao' => 'Fumo numa residência.',
        'localizacao' => 'Maputo',
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $user->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);
    $teamType = TipoEquipa::query()->create(['nome' => 'Incêndio', 'ativo' => true]);
    $otherTeamType = TipoEquipa::query()->create(['nome' => 'Resgate', 'ativo' => true]);
    Equipa::query()->create(['nome' => 'Equipa disponível', 'tipo_equipa_id' => $teamType->id, 'estado' => EstadoEquipa::DISPONIVEL]);
    Equipa::query()->create(['nome' => 'Equipa disponível de outro tipo', 'tipo_equipa_id' => $otherTeamType->id, 'estado' => EstadoEquipa::DISPONIVEL]);
    Equipa::query()->create(['nome' => 'Equipa ocupada', 'tipo_equipa_id' => $teamType->id, 'estado' => EstadoEquipa::EM_MISSAO]);

    $factors = [
        ['Gravidade', 0.35],
        ['Pessoas afectadas', 0.29],
        ['Vulnerabilidade', 0.24],
        ['Escassez de recursos', 0.12],
    ];
    $factors = collect($factors)->map(
        fn (array $factor): FatorPrioridade => FatorPrioridade::query()->create([
            'nome' => $factor[0],
            'peso' => $factor[1],
            'ativo' => true,
        ]),
    );

    Http::fake([
        '*' => Http::response([
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode([
                            'sugestoes' => [
                                [
                                    'fator_prioridade_id' => $factors[0]->id,
                                    'pontuacao' => 7,
                                    'dados_suficientes' => true,
                                    'justificacao' => 'A descrição indica uma ocorrência grave.',
                                ],
                            ],
                        ], JSON_UNESCAPED_UNICODE),
                    ],
                ],
            ],
        ], 200),
    ]);

    $result = (new SugestaoPrioridadeIAService)->sugerir($occurrence->id);

    expect($result['disponivel'])->toBeTrue()
        ->and($result['sugestoes'][0]['pontuacao'])->toBe(7.0);

    Http::assertSent(function ($request) use ($occurrence) {
        $payload = $request->data();
        $data = json_decode($payload['messages'][1]['content'], true);

        return $request->url() === 'https://api.openai.test/v1/chat/completions'
            && $request->hasHeader('Authorization', 'Bearer test-api-key')
            && $payload['model'] === 'gpt-6.1-terra'
            && $payload['reasoning_effort'] === 'none'
            && $payload['max_completion_tokens'] === 6000
            && $payload['response_format'] === ['type' => 'json_object']
            && str_contains($payload['messages'][1]['content'], $occurrence->titulo)
            && $data['equipas_disponiveis'] === 2
            && count($data['fatores']) === 4
            && ! collect($data['fatores'])->contains(fn (array $factor): bool => $factor['nome'] === 'Localização');
    });
});
