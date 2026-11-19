<?php

use App\Enums\EstadoOcorrencia;
use App\Models\AvaliacaoPrioridade;
use App\Models\DetalheAvaliacao;
use App\Models\DocumentoIdentificacao;
use App\Models\Evidencia;
use App\Models\FatorPrioridade;
use App\Models\HistoricoOcorrencia;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\Prioridade;
use App\Models\TipoOcorrencia;
use App\Models\User;
use App\Models\VerificacaoIdentidade;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

function domainIntegrationUser(string $profile): User
{
    $role = Perfil::query()->firstOrCreate(
        ['nome' => $profile],
        ['descricao' => $profile],
    );

    return User::factory()->create(['perfil_id' => $role->id]);
}

function domainIntegrationOccurrence(User $owner): Ocorrencia
{
    $type = TipoOcorrencia::query()->create([
        'nome' => 'Incidente '.uniqid(),
        'descricao' => 'Ocorrência de teste',
        'ativo' => true,
    ]);
    $priority = Prioridade::query()->firstOrCreate(
        ['nome' => 'Baixa'],
        ['descricao' => 'Prioridade baixa', 'nivel' => 4],
    );

    return Ocorrencia::query()->create([
        'titulo' => 'Incidente de teste',
        'descricao' => 'Descrição de integração.',
        'localizacao' => 'Centro',
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $owner->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);
}

function approveDomainIntegrationCitizen(User $citizen): void
{
    $document = DocumentoIdentificacao::query()->create([
        'utilizador_id' => $citizen->id,
        'tipo_documento' => 'BI',
        'numero_documento' => 'APPROVED-'.uniqid(),
        'estado_verificacao' => 'APROVADA',
    ]);
    VerificacaoIdentidade::query()->create([
        'documento_identificacao_id' => $document->id,
        'utilizador_solicitante_id' => $citizen->id,
        'estado' => 'APROVADA',
        'data_verificacao' => now(),
    ]);
}

it('allows citizens to consult only their own occurrences', function () {
    $owner = domainIntegrationUser('Cidadão');
    $otherUser = domainIntegrationUser('Cidadão');
    $occurrence = domainIntegrationOccurrence($owner);

    $this->withToken($otherUser->createToken('other')->plainTextToken)
        ->getJson('/api/ocorrencias/'.$occurrence->id)
        ->assertForbidden();

    Auth::forgetGuards();
    $this->withToken($owner->createToken('owner')->plainTextToken)
        ->getJson('/api/ocorrencias/'.$occurrence->id)
        ->assertOk()
        ->assertJsonPath('data.utilizador_id', $owner->id);
});

it('registers a citizen occurrence without inventing a priority and lists only the citizen records', function () {
    $citizen = domainIntegrationUser('Cidadão');
    $otherCitizen = domainIntegrationUser('Cidadão');
    approveDomainIntegrationCitizen($citizen);
    $type = TipoOcorrencia::query()->create([
        'nome' => 'Cheia '.uniqid(),
        'descricao' => 'Inundação',
        'ativo' => true,
    ]);

    $this->actingAs($citizen, 'sanctum')
        ->postJson('/api/ocorrencias', [
            'titulo' => 'Água na estrada principal',
            'descricao' => 'A água começou a cobrir a estrada junto à escola.',
            'localizacao' => 'Beira, Macurungo, junto à escola',
            'tipo_ocorrencia_id' => $type->id,
            'latitude' => -19.843,
            'longitude' => 34.838,
            'prioridade_id' => 4,
            'utilizador_id' => $otherCitizen->id,
            'estado' => EstadoOcorrencia::RESOLVIDA->value,
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['prioridade_id', 'utilizador_id', 'estado']);

    $response = $this->actingAs($citizen, 'sanctum')
        ->postJson('/api/ocorrencias', [
            'titulo' => 'Água na estrada principal',
            'descricao' => 'A água começou a cobrir a estrada junto à escola.',
            'localizacao' => 'Beira, Macurungo, junto à escola',
            'tipo_ocorrencia_id' => $type->id,
            'latitude' => -19.843,
            'longitude' => 34.838,
        ])
        ->assertCreated()
        ->assertJsonPath('data.utilizador_id', $citizen->id)
        ->assertJsonPath('data.prioridade_id', null)
        ->assertJsonPath('data.estado', EstadoOcorrencia::REGISTADA->value);

    $occurrenceId = $response->json('data.id');
    expect(HistoricoOcorrencia::query()->where('ocorrencia_id', $occurrenceId)->sole()->estado_novo)
        ->toBe(EstadoOcorrencia::REGISTADA->value);

    $ownOccurrence = domainIntegrationOccurrence($citizen);
    domainIntegrationOccurrence($otherCitizen);

    $this->actingAs($citizen, 'sanctum')
        ->getJson('/api/ocorrencias?per_page=1')
        ->assertOk()
        ->assertJsonPath('data.pagination.total', 2)
        ->assertJsonCount(1, 'data.items')
        ->assertJsonPath('data.items.0.utilizador_id', $citizen->id);

    $this->actingAs($citizen, 'sanctum')
        ->getJson('/api/ocorrencias/'.$ownOccurrence->id)
        ->assertOk()
        ->assertJsonStructure(['data' => ['tipo_ocorrencia', 'historico', 'evidencias']]);

    $this->actingAs($citizen, 'sanctum')
        ->getJson('/api/ocorrencias/'.domainIntegrationOccurrence($otherCitizen)->id)
        ->assertForbidden();
});

it('serves active occurrence types and protects citizen occurrence creation', function () {
    $citizen = domainIntegrationUser('Cidadão');
    $activeType = TipoOcorrencia::query()->create([
        'nome' => 'Activa '.uniqid(),
        'descricao' => 'Activa',
        'ativo' => true,
    ]);
    TipoOcorrencia::query()->create([
        'nome' => 'Inactiva '.uniqid(),
        'descricao' => 'Inactiva',
        'ativo' => false,
    ]);

    $this->getJson('/api/ocorrencias')->assertUnauthorized();
    $this->actingAs(domainIntegrationUser('Operador'), 'sanctum')
        ->postJson('/api/ocorrencias', [])
        ->assertForbidden();
    $this->actingAs($citizen, 'sanctum')
        ->getJson('/api/tipos-ocorrencia')
        ->assertOk()
        ->assertJsonFragment(['id' => $activeType->id, 'nome' => $activeType->nome])
        ->assertJsonMissing(['nome' => 'Inactiva']);

    $this->actingAs($citizen, 'sanctum')
        ->postJson('/api/ocorrencias', [
            'titulo' => 'Título válido',
            'descricao' => 'Descrição válida com informação suficiente.',
            'localizacao' => 'Centro',
            'tipo_ocorrencia_id' => TipoOcorrencia::query()->where('ativo', false)->value('id'),
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('tipo_ocorrencia_id');
});

it('lists evidence metadata only after checking occurrence ownership', function () {
    $owner = domainIntegrationUser('Cidadão');
    approveDomainIntegrationCitizen($owner);
    $otherUser = domainIntegrationUser('Cidadão');
    $occurrence = domainIntegrationOccurrence($owner);
    $evidence = Evidencia::query()->create([
        'ocorrencia_id' => $occurrence->id,
        'utilizador_id' => $owner->id,
        'nome_ficheiro' => 'foto.jpg',
        'caminho_ficheiro' => 'evidencias/private.jpg',
        'tipo_mime' => 'image/jpeg',
        'tamanho_bytes' => 200,
        'descricao' => 'Imagem do local',
    ]);

    $this->actingAs($owner, 'sanctum')
        ->getJson('/api/ocorrencias/'.$occurrence->id.'/evidencias')
        ->assertOk()
        ->assertJsonPath('data.0.id', $evidence->id)
        ->assertJsonMissingPath('data.0.caminho_ficheiro');

    $this->actingAs($otherUser, 'sanctum')
        ->getJson('/api/ocorrencias/'.$occurrence->id.'/evidencias')
        ->assertForbidden();
});

it('allows citizens to update only their own name and email fields', function () {
    $citizen = domainIntegrationUser('Cidadão');
    $otherCitizen = domainIntegrationUser('Cidadão');

    $this->actingAs($citizen, 'sanctum')
        ->patchJson('/api/me', [
            'name' => 'Nome actualizado',
            'email' => 'updated-'.uniqid().'@example.test',
        ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Nome actualizado')
        ->assertJsonPath('data.perfil.nome', 'Cidadão');

    $this->actingAs($citizen, 'sanctum')
        ->patchJson('/api/me', ['perfil_id' => $otherCitizen->perfil_id])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('perfil_id');

    $this->actingAs(domainIntegrationUser('Operador'), 'sanctum')
        ->patchJson('/api/me', ['name' => 'Não autorizado'])
        ->assertForbidden();
});

it('updates an occurrence as a coordinator and records the authenticated actor in its history', function () {
    $coordinator = domainIntegrationUser('Coordenador');
    $occurrence = domainIntegrationOccurrence(domainIntegrationUser('Cidadão'));
    $token = $coordinator->createToken('coordinator')->plainTextToken;

    $this->withToken($token)
        ->patchJson('/api/ocorrencias/'.$occurrence->id.'/estado', [
            'estado' => EstadoOcorrencia::RESOLVIDA->value,
        ])
        ->assertOk()
        ->assertJsonPath('data.estado', EstadoOcorrencia::RESOLVIDA->value);

    $history = HistoricoOcorrencia::query()
        ->where('ocorrencia_id', $occurrence->id)
        ->sole();

    expect($history->utilizador_id)->toBe($coordinator->id)
        ->and($history->estado_novo)->toBe(EstadoOcorrencia::RESOLVIDA->value);
});

it('stores evidence privately and enforces occurrence ownership on upload and download', function () {
    Storage::fake('local');
    $owner = domainIntegrationUser('Cidadão');
    $otherUser = domainIntegrationUser('Cidadão');
    $occurrence = domainIntegrationOccurrence($owner);
    $ownerToken = $owner->createToken('owner')->plainTextToken;

    $response = $this->withToken($ownerToken)->postJson('/api/evidencias', [
        'ocorrencia_id' => $occurrence->id,
        'ficheiro' => UploadedFile::fake()->create('evidence.pdf', 20, 'application/pdf'),
        'descricao' => 'Documento de evidência.',
    ])->assertCreated();

    $evidence = Evidencia::query()->findOrFail($response->json('data.id'));
    Storage::disk('local')->assertExists($evidence->caminho_ficheiro);
    expect($response->json('data'))->not->toHaveKey('caminho_ficheiro');

    Auth::forgetGuards();
    $otherToken = $otherUser->createToken('other')->plainTextToken;
    $this->withToken($otherToken)
        ->getJson('/api/evidencias/'.$evidence->id.'/download')
        ->assertForbidden();

    Auth::forgetGuards();
    $download = $this->withToken($ownerToken)
        ->get('/api/evidencias/'.$evidence->id.'/download');
    $download->assertOk();
    expect($download->headers->get('X-Content-Type-Options'))->toBe('nosniff');
});

it('rejects invalid evidence uploads before creating database or storage records', function () {
    Storage::fake('local');
    $owner = domainIntegrationUser('Cidadão');
    $occurrence = domainIntegrationOccurrence($owner);
    $token = $owner->createToken('owner')->plainTextToken;

    $this->withToken($token)->postJson('/api/evidencias', [
        'ocorrencia_id' => $occurrence->id,
        'ficheiro' => UploadedFile::fake()->create('invalid.exe', 20, 'application/octet-stream'),
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('ficheiro');

    Auth::forgetGuards();
    $this->withToken($token)->postJson('/api/evidencias', [
        'ocorrencia_id' => $occurrence->id,
        'ficheiro' => UploadedFile::fake()->create('oversize.pdf', 10241, 'application/pdf'),
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('ficheiro');

    expect(Evidencia::query()->count())->toBe(0);
    Storage::disk('local')->assertDirectoryEmpty('evidencias');
});

it('records a priority evaluation and the applied factor weights through the API', function () {
    $coordinator = domainIntegrationUser('Coordenador');
    $occurrence = domainIntegrationOccurrence($coordinator);
    Prioridade::query()->create(['nome' => 'Crítica', 'descricao' => 'Imediata', 'nivel' => 1]);
    Prioridade::query()->create(['nome' => 'Alta', 'descricao' => 'Prioritária', 'nivel' => 2]);
    Prioridade::query()->create(['nome' => 'Média', 'descricao' => 'Programada', 'nivel' => 3]);

    $factorNames = [
        ['nome' => 'Gravidade', 'peso' => 0.35],
        ['nome' => 'Pessoas afectadas', 'peso' => 0.29],
        ['nome' => 'Vulnerabilidade', 'peso' => 0.24],
        ['nome' => 'Escassez de recursos', 'peso' => 0.12],
    ];
    $factors = collect($factorNames)->map(
        fn (array $factor): FatorPrioridade => FatorPrioridade::query()->create([
            ...$factor,
            'ativo' => true,
        ]),
    );

    $response = $this->withToken($coordinator->createToken('coordinator')->plainTextToken)
        ->postJson('/api/avaliacoes-prioridade', [
            'ocorrencia_id' => $occurrence->id,
            'factores' => $factors->map(fn (FatorPrioridade $factor): array => [
                'fator_prioridade_id' => $factor->id,
                'pontuacao' => 5,
            ])->all(),
        ])
        ->assertCreated()
        ->assertJsonPath('data.pontuacao_total', '5.00')
        ->assertJsonCount(4, 'data.detalhes');

    $evaluation = AvaliacaoPrioridade::query()->findOrFail($response->json('data.id'));
    expect($evaluation->detalhes)->toHaveCount(4)
        ->and(DetalheAvaliacao::query()->where('avaliacao_prioridade_id', $evaluation->id)->sum('peso_aplicado'))
        ->toBe(1.0)
        ->and($occurrence->refresh()->prioridade_id)->toBe($evaluation->prioridade_id);
});

it('validates document metadata and stores an uploaded identification document privately', function () {
    Storage::fake('local');
    $owner = domainIntegrationUser('Cidadão');
    $token = $owner->createToken('owner')->plainTextToken;

    $response = $this->withToken($token)->postJson('/api/identificacao/documentos', [
        'tipo_documento' => 'Passaporte',
        'numero_documento' => 'P-'.uniqid(),
        'nome_documento' => 'passaporte.pdf',
        'ficheiro' => UploadedFile::fake()->create('passaporte.pdf', 30, 'application/pdf'),
    ])->assertCreated();

    $document = DocumentoIdentificacao::query()->findOrFail($response->json('data.id'));
    Storage::disk('local')->assertExists($document->caminho_documento);
    expect($response->json('data'))->not->toHaveKey('caminho_documento');

    $otherUser = domainIntegrationUser('Cidadão');
    Auth::forgetGuards();
    $this->withToken($otherUser->createToken('other')->plainTextToken)
        ->get('/api/identificacao/documentos/'.$document->id.'/download')
        ->assertForbidden();

    Auth::forgetGuards();
    $this->withToken($token)
        ->get('/api/identificacao/documentos/'.$document->id.'/download')
        ->assertOk()
        ->assertHeader('X-Content-Type-Options', 'nosniff');
});

it('validates identity verification requests and distinguishes the requester from the verifier', function () {
    $owner = domainIntegrationUser('Cidadão');
    $document = DocumentoIdentificacao::query()->create([
        'utilizador_id' => $owner->id,
        'tipo_documento' => 'Passaporte',
        'numero_documento' => 'V-'.uniqid(),
        'estado_verificacao' => 'PENDENTE',
    ]);
    $token = $owner->createToken('owner')->plainTextToken;

    $this->withToken($token)->postJson('/api/identificacao/verificacoes', [
        'documento_identificacao_id' => $document->id,
        'observacoes' => ['not', 'a', 'string'],
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('observacoes');

    $response = $this->withToken($token)->postJson('/api/identificacao/verificacoes', [
        'documento_identificacao_id' => $document->id,
        'utilizador_verificador_id' => $owner->id,
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('utilizador_verificador_id');

    expect($response->json('errors'))->toHaveKey('utilizador_verificador_id')
        ->and(VerificacaoIdentidade::query()->count())->toBe(0);

    $this->withToken($token)->postJson('/api/identificacao/verificacoes', [
        'documento_identificacao_id' => $document->id,
        'observacoes' => 'Solicito confirmação.',
    ])->assertCreated()
        ->assertJsonPath('data.utilizador_solicitante_id', $owner->id)
        ->assertJsonPath('data.utilizador_verificador_id', null);
});
