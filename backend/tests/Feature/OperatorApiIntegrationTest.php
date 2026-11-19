<?php

use App\Enums\EstadoOcorrencia;
use App\Models\Distrito;
use App\Models\Evidencia;
use App\Models\HistoricoOcorrencia;
use App\Models\Localizacao;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\Prioridade;
use App\Models\Provincia;
use App\Models\TipoOcorrencia;
use App\Models\User;
use App\Models\ValidacaoOcorrencia;
use App\Services\Localizacoes\LocalizacaoService;
use App\Services\Ocorrencias\OcorrenciaService;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Http;

function operatorApiUser(string $profile): User
{
    $role = Perfil::query()->firstOrCreate(
        ['nome' => $profile],
        ['descricao' => $profile],
    );

    return User::factory()->create(['perfil_id' => $role->id]);
}

/**
 * @return array{Ocorrencia, TipoOcorrencia, Provincia, Distrito}
 */
function operatorApiOccurrence(User $owner, string $title = 'Incidente de teste'): array
{
    $type = TipoOcorrencia::query()->create([
        'nome' => 'Tipo '.uniqid(),
        'descricao' => 'Tipo operacional',
        'ativo' => true,
    ]);
    $priority = Prioridade::query()->firstOrCreate(
        ['nome' => 'Baixa'],
        ['descricao' => 'Prioridade baixa', 'nivel' => 4],
    );
    $province = Provincia::query()->create(['nome' => 'Sofala '.uniqid()]);
    $district = Distrito::query()->create([
        'provincia_id' => $province->id,
        'nome' => 'Beira '.uniqid(),
    ]);
    $location = Localizacao::query()->create([
        'provincia_id' => $province->id,
        'distrito_id' => $district->id,
        'endereco_referencia' => 'Bairro Central',
    ]);
    $occurrence = Ocorrencia::query()->create([
        'titulo' => $title,
        'descricao' => 'Descrição operacional para teste.',
        'localizacao' => 'Bairro Central',
        'localizacao_id' => $location->id,
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $owner->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);

    return [$occurrence, $type, $province, $district];
}

it('provides an operator-only paginated list with database filters and global statistics', function () {
    $operator = operatorApiUser('Operador');
    $citizen = operatorApiUser('Cidadão');
    [$match, $type, $province, $district] = operatorApiOccurrence($citizen, 'Cheia junto à escola');
    operatorApiOccurrence($citizen, 'Incêndio numa residência');
    ValidacaoOcorrencia::query()->create([
        'ocorrencia_id' => $match->id,
        'utilizador_id' => $operator->id,
        'estado' => 'VALIDADA',
        'data_validacao' => now(),
    ]);
    $token = $operator->createToken('operator')->plainTextToken;

    $response = $this->withToken($token)
        ->getJson('/api/operador/ocorrencias?q=escola&tipo_ocorrencia_id='.$type->id
            .'&estado=registada&provincia='.urlencode($province->nome)
            .'&distrito='.urlencode($district->nome)
            .'&localizacao=Central&data_inicio='.now()->toDateString()
            .'&data_fim='.now()->toDateString().'&ordenar_por=id&ordem=asc&per_page=1')
        ->assertOk()
        ->assertJsonPath('data.pagination.total', 1)
        ->assertJsonPath('data.items.0.id', $match->id)
        ->assertJsonPath('data.items.0.localizacao_geografica.provincia', $province->nome)
        ->assertJsonPath('data.items.0.localizacao_geografica.distrito', $district->nome)
        ->assertJsonPath('data.estatisticas.total', 2)
        ->assertJsonPath('data.estatisticas.pendentes_analise', 1)
        ->assertJsonPath('data.estatisticas.validadas', 1);

    expect($response->json('data.items'))->toHaveCount(1);

    $this->actingAs(operatorApiUser('Coordenador'), 'sanctum')
        ->getJson('/api/operador/ocorrencias')
        ->assertForbidden();
    $this->actingAs($citizen, 'sanctum')
        ->getJson('/api/operador/ocorrencias')
        ->assertForbidden();
});

it('returns only active or inactive type metadata without exposing write operations', function () {
    $operator = operatorApiUser('Operador');
    $type = TipoOcorrencia::query()->create([
        'nome' => 'Tipo de triagem '.uniqid(),
        'descricao' => 'Descrição interna',
        'ativo' => false,
    ]);

    $this->actingAs($operator, 'sanctum')
        ->getJson('/api/operador/tipos-ocorrencia')
        ->assertOk()
        ->assertJsonFragment(['id' => $type->id, 'nome' => $type->nome, 'ativo' => false]);
});

it('validates operator date range and sorting filters at the API boundary', function () {
    $operator = operatorApiUser('Operador');

    $this->actingAs($operator, 'sanctum')
        ->getJson('/api/operador/ocorrencias?data_inicio=2026-11-12&data_fim=2026-11-11')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('data_fim');

    $this->actingAs($operator, 'sanctum')
        ->getJson('/api/operador/ocorrencias?ordem=sideways')
        ->assertUnprocessable()
        ->assertJsonValidationErrors('ordem');
});

it('allows an operator to register an institutional occurrence under their own identity', function () {
    $operator = operatorApiUser('Operador');
    $citizen = operatorApiUser('Cidadão');
    $type = TipoOcorrencia::query()->create([
        'nome' => 'Institucional '.uniqid(),
        'descricao' => 'Ocorrência institucional',
        'ativo' => true,
    ]);

    $response = $this->actingAs($operator, 'sanctum')
        ->postJson('/api/operador/ocorrencias', [
            'titulo' => 'Cheia comunicada por telefone',
            'descricao' => 'Subida rápida do nível da água.',
            'localizacao' => 'Beira, zona baixa',
            'tipo_ocorrencia_id' => $type->id,
            'origem' => 'telefone',
            'comunicante_nome' => 'Pessoa comunicante',
            'comunicante_contacto' => '+258 840000000',
            'data_ocorrencia' => '2026-11-11 13:15:00',
        ])
        ->assertCreated()
        ->assertJsonPath('data.origem', 'telefone')
        ->assertJsonPath('data.comunicante_nome', 'Pessoa comunicante');

    $occurrenceId = $response->json('data.id');
    $occurrence = Ocorrencia::query()->findOrFail($occurrenceId);
    expect($occurrence->utilizador_id)->toBe($operator->id)
        ->and($occurrence->prioridade_id)->toBeNull()
        ->and($occurrence->estado->value)->toBe(EstadoOcorrencia::REGISTADA->value)
        ->and(HistoricoOcorrencia::query()->where('ocorrencia_id', $occurrenceId)->count())->toBe(1);

    $this->actingAs($citizen, 'sanctum')
        ->postJson('/api/operador/ocorrencias', [])
        ->assertForbidden();

    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/avaliacoes-prioridade', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['ocorrencia_id', 'factores']);
});

it('returns operator detail with minimal communicator, evidence, validation and history actors', function () {
    Storage::fake('local');
    $operator = operatorApiUser('Operador');
    $citizen = operatorApiUser('Cidadão');
    [$occurrence] = operatorApiOccurrence($citizen);
    $history = HistoricoOcorrencia::query()->create([
        'ocorrencia_id' => $occurrence->id,
        'utilizador_id' => $citizen->id,
        'estado_anterior' => null,
        'estado_novo' => EstadoOcorrencia::REGISTADA->value,
        'observacoes' => null,
    ]);
    $validation = ValidacaoOcorrencia::query()->create([
        'ocorrencia_id' => $occurrence->id,
        'utilizador_id' => $operator->id,
        'estado' => 'NAO_CONFIRMADA',
        'motivo' => 'Informação insuficiente.',
        'data_validacao' => now(),
    ]);
    $evidence = Evidencia::query()->create([
        'ocorrencia_id' => $occurrence->id,
        'utilizador_id' => $citizen->id,
        'nome_ficheiro' => 'prova.pdf',
        'caminho_ficheiro' => 'evidencias/prova.pdf',
        'tipo_mime' => 'application/pdf',
        'tamanho_bytes' => 12,
    ]);

    $this->actingAs($operator, 'sanctum')
        ->getJson('/api/ocorrencias/'.$occurrence->id)
        ->assertOk()
        ->assertJsonPath('data.comunicante.name', $citizen->name)
        ->assertJsonMissingPath('data.comunicante.password')
        ->assertJsonPath('data.historico.0.id', $history->id)
        ->assertJsonPath('data.historico.0.utilizador_nome', $citizen->name)
        ->assertJsonPath('data.validacoes.0.id', $validation->id)
        ->assertJsonPath('data.validacoes.0.utilizador_nome', $operator->name)
        ->assertJsonPath('data.evidencias.0.id', $evidence->id)
        ->assertJsonMissingPath('data.evidencias.0.caminho_ficheiro');

    Storage::disk('local')->put('evidencias/prova.pdf', 'evidence');
    $this->actingAs($operator, 'sanctum')
        ->get('/api/evidencias/'.$evidence->id.'/download')
        ->assertOk();
});

it('records operator validation actor and timestamp and requires reason for negative decisions', function () {
    $operator = operatorApiUser('Operador');
    $citizen = operatorApiUser('Cidadão');
    [$occurrence] = operatorApiOccurrence($citizen);

    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/validacoes/ocorrencias', [
            'ocorrencia_id' => $occurrence->id,
            'estado' => 'REJEITADA',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('motivo');

    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/validacoes/ocorrencias', [
            'ocorrencia_id' => $occurrence->id,
            'estado' => 'REJEITADA',
            'motivo' => 'Registo duplicado.',
            'utilizador_id' => $citizen->id,
            'data_validacao' => now()->toDateTimeString(),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['utilizador_id', 'data_validacao']);

    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/validacoes/ocorrencias', [
            'ocorrencia_id' => $occurrence->id,
            'estado' => 'REJEITADA',
            'motivo' => 'Registo duplicado.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.utilizador_id', $operator->id)
        ->assertJsonPath('data.estado', 'REJEITADA');

    $validation = ValidacaoOcorrencia::query()->sole();
    expect($validation->utilizador_id)->toBe($operator->id)
        ->and($validation->data_validacao)->not->toBeNull();

    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/validacoes/ocorrencias', [
            'ocorrencia_id' => $occurrence->id,
            'estado' => 'DUPLICADA',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('ocorrencia_original_id');
});

it('allows an operator to mark an occurrence as duplicate and link its original', function () {
    $operator = operatorApiUser('Operador');
    $citizen = operatorApiUser('Cidadão');

    [$duplicate] = operatorApiOccurrence(
        $citizen,
        'Relato duplicado'
    );

    [$original] = operatorApiOccurrence(
        $citizen,
        'Ocorrência original'
    );

    // 1. O Operador regista a ocorrência como duplicada.
    $response = $this->actingAs($operator, 'sanctum')
        ->postJson('/api/validacoes/ocorrencias', [
            'ocorrencia_id' => $duplicate->id,
            'ocorrencia_original_id' => $original->id,
            'estado' => 'DUPLICADA',
            'observacoes' => 'Os dois relatos correspondem ao mesmo incidente.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.ocorrencia_id', $duplicate->id)
        ->assertJsonPath('data.ocorrencia_original_id', $original->id)
        ->assertJsonPath('data.utilizador_id', $operator->id)
        ->assertJsonPath('data.estado', 'DUPLICADA');

    // 2. Confirmar que os dados foram guardados correctamente.
    $validation = ValidacaoOcorrencia::query()
        ->where('ocorrencia_id', $duplicate->id)
        ->sole();

    expect($validation->ocorrencia_original_id)->toBe($original->id)
        ->and($validation->utilizador_id)->toBe($operator->id)
        ->and($validation->estado)->toBe('DUPLICADA')
        ->and($validation->data_validacao)->not->toBeNull();

    // 3. Uma ocorrência não pode ser duplicada de si própria.
    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/validacoes/ocorrencias', [
            'ocorrencia_id' => $duplicate->id,
            'ocorrencia_original_id' => $duplicate->id,
            'estado' => 'DUPLICADA',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('ocorrencia_original_id');

    // 4. A ocorrência original tem de existir.
    $idInexistente = ((int) Ocorrencia::query()->max('id')) + 100;

    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/validacoes/ocorrencias', [
            'ocorrencia_id' => $duplicate->id,
            'ocorrencia_original_id' => $idInexistente,
            'estado' => 'DUPLICADA',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('ocorrencia_original_id');
});

it('denies operators generic occurrence changes, priority evaluation, missions and geography management', function () {
    $operator = operatorApiUser('Operador');
    $citizen = operatorApiUser('Cidadão');
    [$occurrence] = operatorApiOccurrence($citizen);

    $this->actingAs($operator, 'sanctum')
        ->patchJson('/api/ocorrencias/'.$occurrence->id, ['titulo' => 'Alteração não autorizada'])
        ->assertForbidden();
    $this->actingAs($operator, 'sanctum')
        ->patchJson('/api/ocorrencias/'.$occurrence->id.'/estado', ['estado' => 'resolvida'])
        ->assertForbidden();
   $this->actingAs($operator, 'sanctum')
        ->postJson('/api/avaliacoes-prioridade', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['ocorrencia_id', 'factores']);
    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/missoes', [])
        ->assertForbidden();
    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/localizacoes', [])
        ->assertForbidden();

    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/ocorrencias', [])
        ->assertForbidden();
    $this->actingAs($citizen, 'sanctum')
        ->postJson('/api/validacoes/ocorrencias', [
            'ocorrencia_id' => $occurrence->id,
            'estado' => 'VALIDADA',
        ])
        ->assertForbidden();

    expect($occurrence->fresh()->titulo)->toBe('Incidente de teste')
        ->and($occurrence->fresh()->estado)->toBe(EstadoOcorrencia::REGISTADA);

    expect(fn () => (new OcorrenciaService)->atualizar($occurrence, ['titulo' => 'Não permitido'], $operator))
        ->toThrow(AuthorizationException::class)
        ->and(fn () => (new OcorrenciaService)->alterarEstado(
            $occurrence,
            EstadoOcorrencia::RESOLVIDA->value,
            $operator,
        ))->toThrow(AuthorizationException::class)
        ->and(fn () => (new LocalizacaoService)->criar([], $operator))
        ->toThrow(AuthorizationException::class);
});


it('returns deterministic and semantic duplicate suggestions when an operator registers an occurrence', function () {
    config([
        'services.openai.enabled' => true,
        'services.openai.api_key' => 'test-api-key',
        'services.openai.base_url' => 'https://api.openai.test/v1',
        'services.openai.model' => 'gpt-6.1-terra',
    ]);

    $operator = operatorApiUser('Operador');
    $citizen = operatorApiUser('Cidadão');

    [$candidate, $type] = operatorApiOccurrence(
        $citizen,
        'Cheia no bairro central'
    );

    $candidate->forceFill([
        'latitude' => -25.9655,
        'longitude' => 32.5832,
        'data_ocorrencia' => now()->subMinutes(6),
    ])->save();

    Http::fake([
        '*' => Http::response([
            'choices' => [
                [
                    'message' => [
                        'content' => json_encode([
                            'resultados' => [
                                [
                                    'id' => $candidate->id,
                                    'semelhanca' => 95,
                                    'possivel_duplicado' => true,
                                    'justificacao' => 'Os relatos descrevem aparentemente a mesma cheia.',
                                ],
                            ],
                        ], JSON_UNESCAPED_UNICODE),
                    ],
                ],
            ],
        ], 200),
    ]);

    $response = $this->actingAs($operator, 'sanctum')
        ->postJson('/api/operador/ocorrencias', [
            'titulo' => 'Cheia no bairro central',
            'descricao' => 'Subida rápida do nível da água no bairro central.',
            'localizacao' => 'Bairro Central',
            'latitude' => -25.9656,
            'longitude' => 32.5832,
            'tipo_ocorrencia_id' => $type->id,
            'origem' => 'telefone',
            'comunicante_nome' => 'Comunicante de teste',
            'comunicante_contacto' => '+258 840000000',
            'data_ocorrencia' => now()->subMinutes(5)->toDateTimeString(),
        ])
        ->assertCreated()
        ->assertJsonPath('data.possiveis_duplicados.0.id', $candidate->id)
        ->assertJsonPath(
            'data.possiveis_duplicados.0.analise_semantica.possivel_duplicado',
            true
        )
        ->assertJsonPath(
            'data.possiveis_duplicados.0.analise_semantica.semelhanca',
            95
        );

    $newOccurrenceId = $response->json('data.id');

    expect(Ocorrencia::query()->findOrFail($newOccurrenceId)->utilizador_id)
        ->toBe($operator->id)
        ->and(ValidacaoOcorrencia::query()->count())->toBe(0);
});

it('registers an operator occurrence even when semantic duplicate analysis fails', function () {
    config([
        'services.openai.enabled' => true,
        'services.openai.api_key' => 'test-api-key',
        'services.openai.base_url' => 'https://api.openai.test/v1',
        'services.openai.model' => 'gpt-6.1-terra',
    ]);

    $operator = operatorApiUser('Operador');
    $citizen = operatorApiUser('Cidadão');

    [$candidate, $type] = operatorApiOccurrence(
        $citizen,
        'Incêndio numa residência'
    );

    $candidate->forceFill([
        'latitude' => -25.9655,
        'longitude' => 32.5832,
        'data_ocorrencia' => now()->subMinutes(6),
    ])->save();

    Http::fake([
        '*' => Http::response([
            'error' => 'OpenAI indisponível.',
        ], 500),
    ]);

    $response = $this->actingAs($operator, 'sanctum')
        ->postJson('/api/operador/ocorrencias', [
            'titulo' => 'Incêndio numa residência',
            'descricao' => 'Fogo numa residência no bairro central.',
            'localizacao' => 'Bairro Central',
            'latitude' => -25.9656,
            'longitude' => 32.5832,
            'tipo_ocorrencia_id' => $type->id,
            'origem' => 'telefone',
            'data_ocorrencia' => now()->subMinutes(5)->toDateTimeString(),
        ])
        ->assertCreated()
        ->assertJsonPath('data.possiveis_duplicados.0.id', $candidate->id)
        ->assertJsonPath(
            'data.possiveis_duplicados.0.analise_semantica',
            null
        );

    expect(Ocorrencia::query()->findOrFail($response->json('data.id')))
        ->not->toBeNull()
        ->and(ValidacaoOcorrencia::query()->count())->toBe(0);
});
