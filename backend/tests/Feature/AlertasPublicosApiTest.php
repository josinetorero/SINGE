<?php

use App\Models\AlertaPublico;
use App\Models\Perfil;
use App\Models\User;

function publicAlertTestUser(string $name): User
{
    $profile = Perfil::query()->firstOrCreate(['nome' => $name], ['descricao' => $name]);

    return User::factory()->create(['perfil_id' => $profile->id]);
}

it('allows coordinator publication and exposes only published or closed alerts to readers', function () {
    $coordinator = publicAlertTestUser('Coordenador');
    $citizen = publicAlertTestUser('Cidadão');
    $operator = publicAlertTestUser('Operador');
    $payload = [
        'titulo' => 'Aviso de inundação',
        'descricao' => 'Elevação do nível do rio.',
        'tipo_perigo' => 'Inundação',
        'severidade' => 'alta',
        'area_geografica' => 'Distrito da Beira',
        'valido_desde' => now()->subMinute()->toDateTimeString(),
        'valido_ate' => now()->addHour()->toDateTimeString(),
        'fonte' => 'Autoridade de Protecção Civil',
        'recomendacoes' => 'Evitar margens e seguir instruções oficiais.',
    ];

    $draft = $this->actingAs($coordinator, 'sanctum')
        ->postJson('/api/alertas-publicos', $payload)
        ->assertCreated()
        ->assertJsonPath('data.estado', 'rascunho')
        ->json('data');
    expect(AlertaPublico::query()->findOrFail($draft['id'])->utilizador_id)->toBe($coordinator->id);

    $this->actingAs($citizen, 'sanctum')
        ->getJson('/api/alertas-publicos')
        ->assertOk()
        ->assertJsonPath('data', []);
    $this->actingAs($operator, 'sanctum')
        ->postJson('/api/alertas-publicos', $payload)
        ->assertForbidden();

    $this->actingAs($coordinator, 'sanctum')
        ->postJson('/api/alertas-publicos/'.$draft['id'].'/publicar')
        ->assertOk()
        ->assertJsonPath('data.estado', 'publicado')
        ->assertJsonPath('data.activo', true);

    $this->actingAs($citizen, 'sanctum')
        ->getJson('/api/alertas-publicos/'.$draft['id'])
        ->assertOk()
        ->assertJsonPath('data.fonte', 'Autoridade de Protecção Civil')
        ->assertJsonPath('data.historico.0.operacao', 'publicado');

    $this->actingAs($coordinator, 'sanctum')
        ->postJson('/api/alertas-publicos/'.$draft['id'].'/encerrar')
        ->assertOk()
        ->assertJsonPath('data.estado', 'encerrado')
        ->assertJsonPath('data.activo', false);
});

it('rejects alerts without a source or geographic area', function () {
    $coordinator = publicAlertTestUser('Coordenador');
    $this->actingAs($coordinator, 'sanctum')
        ->postJson('/api/alertas-publicos', [
            'titulo' => 'Alerta sem fonte',
            'descricao' => 'Descrição',
            'tipo_perigo' => 'Cheia',
            'severidade' => 'media',
            'valido_desde' => now()->toDateTimeString(),
            'valido_ate' => now()->addHour()->toDateTimeString(),
            'recomendacoes' => 'Recomendações',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['fonte', 'area_geografica']);
});
