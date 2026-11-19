<?php

use App\Models\DocumentoIdentificacao;
use App\Models\Perfil;
use App\Models\TipoOcorrencia;
use App\Models\User;
use App\Models\VerificacaoIdentidade;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

function identityApiUser(string $role): User
{
    $profile = Perfil::query()->firstOrCreate(['nome' => $role], ['descricao' => $role]);
    return User::factory()->create(['perfil_id' => $profile->id]);
}

it('blocks unverified citizen reporting and supports private identity review, correction and approval', function () {
    Storage::fake('local');
    $citizen = identityApiUser('Cidadão');
    $operator = identityApiUser('Operador');
    $admin = identityApiUser('Administrador');
    $type = TipoOcorrencia::query()->create(['nome' => 'Incêndio identidade', 'descricao' => 'Fogo', 'ativo' => true]);
    $occurrenceData = [
        'titulo' => 'Fumo junto ao mercado',
        'descricao' => 'Fumo visível na zona do mercado municipal.',
        'localizacao' => 'Beira, Mercado Municipal',
        'tipo_ocorrencia_id' => $type->id,
    ];

    $this->actingAs($citizen, 'sanctum')->postJson('/api/ocorrencias', $occurrenceData)
        ->assertUnprocessable()->assertJsonValidationErrors('identidade');

    $this->actingAs($citizen, 'sanctum')->post('/api/identificacao/documentos', [
        'tipo_documento' => 'BI',
        'numero_documento' => 'ID-'.uniqid(),
        'nome_documento' => 'BI demonstrativo',
        'ficheiro' => UploadedFile::fake()->image('bi.jpg'),
    ])->assertCreated()->assertJsonMissingPath('data.numero_documento');
    $document = DocumentoIdentificacao::query()->latest('id')->firstOrFail();
    expect(Storage::disk('local')->exists($document->caminho_documento))->toBeTrue();

    $verification = $this->actingAs($citizen, 'sanctum')->postJson('/api/identificacao/verificacoes', [
        'documento_identificacao_id' => $document->id,
    ])->assertCreated()->json('data');
    $duplicateVerification = $this->actingAs($citizen, 'sanctum')->postJson('/api/identificacao/verificacoes', [
        'documento_identificacao_id' => $document->id,
    ])->assertCreated()->json('data');
    expect($duplicateVerification['id'])->toBe($verification['id']);
    $this->actingAs($citizen, 'sanctum')->getJson('/api/identificacao/minha')
        ->assertOk()->assertJsonPath('data.estado', 'PENDENTE')
        ->assertJsonMissing(['numero_documento' => $document->numero_documento]);
    $this->actingAs($citizen, 'sanctum')->getJson('/api/identificacao/verificacoes')->assertForbidden();

    $this->actingAs($admin, 'sanctum')->getJson('/api/identificacao/verificacoes')->assertForbidden();
    $this->actingAs($admin, 'sanctum')->getJson('/api/identificacao/verificacoes/estatisticas')->assertForbidden();
    $this->actingAs($operator, 'sanctum')->getJson('/api/identificacao/verificacoes/estatisticas')
        ->assertOk()->assertJsonPath('data.pendentes', 1);
    $this->actingAs($operator, 'sanctum')->getJson('/api/identificacao/verificacoes')
        ->assertOk()->assertJsonPath('data.0.id', $verification['id'])
        ->assertJsonMissing(['numero_documento' => $document->numero_documento]);
    $this->actingAs($operator, 'sanctum')->get('/api/identificacao/verificacoes/'.$verification['id'].'/documento')->assertOk();
    $this->actingAs($admin, 'sanctum')->get('/api/identificacao/verificacoes/'.$verification['id'].'/documento')->assertForbidden();
    $this->actingAs($admin, 'sanctum')->get('/api/identificacao/documentos/'.$document->id.'/download')->assertForbidden();
    $this->actingAs($operator, 'sanctum')->postJson('/api/identificacao/verificacoes/'.$verification['id'].'/analise')->assertOk();
    $this->actingAs($operator, 'sanctum')->postJson('/api/identificacao/verificacoes/'.$verification['id'].'/correccao', [
        'motivo' => 'Não.',
    ])->assertUnprocessable()->assertJsonValidationErrors('motivo');
    $this->actingAs($operator, 'sanctum')->postJson('/api/identificacao/verificacoes/'.$verification['id'].'/correccao', [
        'motivo' => 'A fotografia do verso está ilegível.',
    ])->assertOk()->assertJsonPath('data.estado', 'CORRECAO_NECESSARIA');
    $this->actingAs($citizen, 'sanctum')->getJson('/api/identificacao/minha')->assertJsonPath('data.estado', 'CORRECAO_NECESSARIA');

    $this->actingAs($citizen, 'sanctum')->post('/api/identificacao/documentos', [
        'tipo_documento' => 'BI',
        'numero_documento' => 'ID-CORRIGIDO-'.uniqid(),
        'nome_documento' => 'BI demonstrativo corrigido',
        'ficheiro' => UploadedFile::fake()->image('bi-corrigido.png'),
    ])->assertCreated();
    $replacement = DocumentoIdentificacao::query()->latest('id')->firstOrFail();
    $replacementVerification = $this->actingAs($citizen, 'sanctum')->postJson('/api/identificacao/verificacoes', [
        'documento_identificacao_id' => $replacement->id,
    ])->assertCreated()->json('data');
    $this->actingAs($operator, 'sanctum')->postJson('/api/identificacao/verificacoes/'.$replacementVerification['id'].'/analise')->assertOk();
    $this->actingAs($operator, 'sanctum')->postJson('/api/identificacao/verificacoes/'.$replacementVerification['id'].'/aprovar')->assertOk();

    $this->actingAs($citizen, 'sanctum')->postJson('/api/ocorrencias', $occurrenceData)
        ->assertCreated()->assertJsonPath('data.utilizador_id', $citizen->id);
    expect(VerificacaoIdentidade::query()->findOrFail($verification['id'])->historico)->toHaveCount(3)
        ->and(VerificacaoIdentidade::query()->findOrFail($replacementVerification['id'])->historico)->toHaveCount(3);
    $this->actingAs($operator, 'sanctum')->getJson('/api/identificacao/verificacoes/historico')->assertOk()
        ->assertJsonCount(2, 'data');
});

it('requires an operator decision reason and preserves rejection history without exposing another citizen document', function () {
    Storage::fake('local');
    $citizen = identityApiUser('Cidadão');
    $otherCitizen = identityApiUser('Cidadão');
    $operator = identityApiUser('Operador');

    $this->actingAs($citizen, 'sanctum')->post('/api/identificacao/documentos', [
        'tipo_documento' => 'Passaporte',
        'numero_documento' => 'PASS-'.uniqid(),
        'ficheiro' => UploadedFile::fake()->create('passaporte.pdf', 20, 'application/pdf'),
    ])->assertCreated();
    $document = DocumentoIdentificacao::query()->latest('id')->firstOrFail();
    $verification = $this->actingAs($citizen, 'sanctum')->postJson('/api/identificacao/verificacoes', [
        'documento_identificacao_id' => $document->id,
    ])->assertCreated()->json('data');

    $this->actingAs($otherCitizen, 'sanctum')->get('/api/identificacao/documentos/'.$document->id.'/download')->assertForbidden();
    $this->actingAs($operator, 'sanctum')->postJson('/api/identificacao/verificacoes/'.$verification['id'].'/rejeitar', [
        'motivo' => 'Não.',
    ])->assertUnprocessable()->assertJsonValidationErrors('motivo');
    $this->actingAs($operator, 'sanctum')->postJson('/api/identificacao/verificacoes/'.$verification['id'].'/analise')->assertOk();
    $this->actingAs($operator, 'sanctum')->postJson('/api/identificacao/verificacoes/'.$verification['id'].'/rejeitar', [
        'motivo' => 'A página com a fotografia está ilegível.',
    ])->assertOk()->assertJsonPath('data.estado', 'REJEITADA');

    $this->actingAs($citizen, 'sanctum')->getJson('/api/identificacao/minha')
        ->assertOk()->assertJsonPath('data.estado', 'REJEITADA')
        ->assertJsonPath('data.motivo_rejeicao', 'A página com a fotografia está ilegível.');
    $history = VerificacaoIdentidade::query()->findOrFail($verification['id'])->historico;
    expect($history)->toHaveCount(3)
        ->and($history->last()->utilizador_id)->toBe($operator->id)
        ->and($history->last()->motivo)->toBe('A página com a fotografia está ilegível.');
});
