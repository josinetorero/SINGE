<?php

use App\Models\Distrito;
use App\Models\Perfil;
use App\Models\Provincia;
use App\Models\TipoOcorrencia;
use App\Models\User;

it('serves hierarchical geographic options and persists valid occurrence references', function () {
    $profile = Perfil::query()->firstOrCreate(['nome' => 'Operador'], ['descricao' => 'Operador']);
    $operator = User::factory()->create(['perfil_id' => $profile->id]);
    $province = Provincia::query()->create(['nome' => 'Província de teste', 'codigo' => 'TST']);
    $district = Distrito::query()->create(['provincia_id' => $province->id, 'nome' => 'Distrito de teste', 'codigo' => 'TST-1']);
    $otherProvince = Provincia::query()->create(['nome' => 'Outra província de teste', 'codigo' => 'TST2']);
    $otherDistrict = Distrito::query()->create(['provincia_id' => $otherProvince->id, 'nome' => 'Outro distrito de teste', 'codigo' => 'TST2-1']);
    $type = TipoOcorrencia::query()->create(['nome' => 'Incêndio geográfico', 'descricao' => 'Teste de localização', 'ativo' => true]);

    $this->actingAs($operator, 'sanctum')
        ->getJson('/api/referencias/geograficas?tipo=provincias')
        ->assertOk()
        ->assertJsonFragment(['id' => $province->id, 'nome' => $province->nome]);

    $this->actingAs($operator, 'sanctum')
        ->getJson('/api/referencias/geograficas?tipo=distritos&parent_id='.$province->id)
        ->assertOk()
        ->assertJsonCount(1, 'data')
        ->assertJsonPath('data.0.id', $district->id);

    $payload = [
        'titulo' => 'Ocorrência geográfica de teste',
        'descricao' => 'Descrição de teste suficientemente clara.',
        'localizacao' => 'Distrito de teste, referência de teste',
        'tipo_ocorrencia_id' => $type->id,
        'origem' => 'observacao_directa',
        'referencia_geografica' => [
            'provincia_id' => $province->id,
            'distrito_id' => $district->id,
            'endereco_referencia' => 'Referência de teste',
        ],
    ];

    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/operador/ocorrencias', [...$payload, 'referencia_geografica' => [
            ...$payload['referencia_geografica'],
            'distrito_id' => $otherDistrict->id,
        ]])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('referencia_geografica.distrito_id');

    $response = $this->actingAs($operator, 'sanctum')->postJson('/api/operador/ocorrencias', $payload)->assertCreated();
    $occurrence = \App\Models\Ocorrencia::query()->findOrFail($response->json('data.id'));

    expect($occurrence->localizacaoGeografica)->not->toBeNull()
        ->and($occurrence->localizacaoGeografica->provincia_id)->toBe($province->id)
        ->and($occurrence->localizacaoGeografica->distrito_id)->toBe($district->id)
        ->and($occurrence->localizacaoGeografica->endereco_referencia)->toBe('Referência de teste');
});
