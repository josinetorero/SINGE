<?php

use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Enums\EstadoOcorrencia;
use App\Models\Equipa;
use App\Models\Perfil;
use App\Models\Prioridade;
use App\Models\TipoEquipa;
use App\Models\TipoOcorrencia;
use App\Models\Ocorrencia;
use App\Models\User;
use App\Models\HistoricoMissao;

function coordinatorApiTestUser(string $name): User
{
    $profile = Perfil::query()->firstOrCreate(['nome' => $name], ['descricao' => $name]);

    return User::factory()->create(['perfil_id' => $profile->id]);
}

it('serves coordinator dashboard and filtered global occurrence/team lists only to management profiles', function () {
    $coordinator = coordinatorApiTestUser('Coordenador');
    $citizen = coordinatorApiTestUser('Cidadão');
    $type = TipoOcorrencia::query()->create(['nome' => 'Cheia teste', 'descricao' => 'Cheia', 'ativo' => true]);
    $occurrence = Ocorrencia::query()->create([
        'titulo' => 'Cheia no centro',
        'descricao' => 'Água na via.',
        'localizacao' => 'Centro',
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => null,
        'utilizador_id' => $citizen->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);

    $this->actingAs($coordinator, 'sanctum')
        ->getJson('/api/coordenador/dashboard')
        ->assertOk()
        ->assertJsonPath('data.ocorrencias.total', 1)
        ->assertJsonPath('data.ocorrencias.sem_prioridade', 1);
    $this->actingAs($coordinator, 'sanctum')
        ->getJson('/api/coordenador/ocorrencias?sem_prioridade=1&q=Cheia')
        ->assertOk()
        ->assertJsonPath('data.items.0.id', $occurrence->id);
    $this->actingAs($citizen, 'sanctum')
        ->getJson('/api/coordenador/dashboard')
        ->assertForbidden();

    $typeTeam = TipoEquipa::query()->create(['nome' => 'Resgate', 'descricao' => 'Equipa de resgate', 'ativo' => true]);
    $team = Equipa::query()->create([
        'nome' => 'Resgate Beira',
        'tipo_equipa_id' => $typeTeam->id,
        'estado' => EstadoEquipa::DISPONIVEL,
    ]);
    $this->actingAs($coordinator, 'sanctum')
        ->getJson('/api/equipas?q=Beira&estado=disponivel')
        ->assertOk()
        ->assertJsonPath('data.0.id', $team->id);
});

it('binds a mission to the authenticated coordinator and records mission history', function () {
    $coordinator = coordinatorApiTestUser('Coordenador');
    $citizen = coordinatorApiTestUser('Cidadão');
    $type = TipoOcorrencia::query()->create(['nome' => 'Incêndio teste', 'descricao' => 'Incêndio', 'ativo' => true]);
    $priority = Prioridade::query()->create(['nome' => 'Baixa', 'descricao' => 'Baixa', 'nivel' => 4]);
    $occurrence = Ocorrencia::query()->create([
        'titulo' => 'Incêndio teste',
        'descricao' => 'Descrição',
        'localizacao' => 'Centro',
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $citizen->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);
    $teamType = TipoEquipa::query()->create(['nome' => 'Saúde', 'descricao' => 'Equipa médica', 'ativo' => true]);
    $team = Equipa::query()->create([
        'nome' => 'Equipa médica teste',
        'tipo_equipa_id' => $teamType->id,
        'estado' => EstadoEquipa::DISPONIVEL,
    ]);
    $response = $this->actingAs($coordinator, 'sanctum')
        ->postJson('/api/missoes', [
            'ocorrencia_id' => $occurrence->id,
            'equipa_id' => $team->id,
            'coordenador_id' => $citizen->id,
            'data_atribuicao' => now()->toDateTimeString(),
            'data_prevista_conclusao' => now()->addHours(3)->toDateTimeString(),
            'objectivos' => 'Prestar primeiros socorros.',
            'instrucoes' => 'Avaliar o local antes da intervenção.',
        ])
        ->assertUnprocessable()
        ->assertJsonValidationErrors('coordenador_id');

    expect($response->status())->toBe(422);

    $mission = $this->actingAs($coordinator, 'sanctum')
        ->postJson('/api/missoes', [
            'ocorrencia_id' => $occurrence->id,
            'equipa_id' => $team->id,
            'data_atribuicao' => now()->toDateTimeString(),
            'data_prevista_conclusao' => now()->addHours(3)->toDateTimeString(),
            'objectivos' => 'Prestar primeiros socorros.',
            'instrucoes' => 'Avaliar o local antes da intervenção.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.coordenador_id', $coordinator->id)
        ->json('data');

    $this->actingAs($coordinator, 'sanctum')
        ->patchJson('/api/missoes/'.$mission['id'].'/estado', ['estado' => EstadoMissao::EM_DESLOCACAO->value])
        ->assertForbidden();
    expect(HistoricoMissao::query()->where('missao_id', $mission['id'])->count())->toBe(1);
});

it('allows an agent to execute and report only missions assigned to their own team', function () {
    $coordinator = coordinatorApiTestUser('Coordenador');
    $citizen = coordinatorApiTestUser('Cidadão');
    $agent = coordinatorApiTestUser('Agente');
    $type = TipoOcorrencia::query()->create(['nome' => 'Cheia agente teste', 'descricao' => 'Inundação', 'ativo' => true]);
    $occurrence = Ocorrencia::query()->create([
        'titulo' => 'Cheia para intervenção de agente',
        'descricao' => 'Água junto às habitações.',
        'localizacao' => 'Beira',
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => null,
        'utilizador_id' => $citizen->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);
    $teamType = TipoEquipa::query()->create(['nome' => 'Protecção Civil teste', 'descricao' => 'Equipa de resposta', 'ativo' => true]);
    $team = Equipa::query()->create([
        'nome' => 'Equipa agente teste',
        'tipo_equipa_id' => $teamType->id,
        'estado' => EstadoEquipa::DISPONIVEL,
    ]);
    $agent->equipa_id = $team->id;
    $agent->save();
    $mission = app(\App\Services\Missoes\MissaoService::class)->criar([
        'ocorrencia_id' => $occurrence->id,
        'equipa_id' => $team->id,
        'objectivos' => 'Retirar moradores da área inundada.',
        'instrucoes' => 'Usar equipamento de segurança.',
    ], $coordinator);

    $this->actingAs($agent, 'sanctum')
        ->getJson('/api/missoes/'.$mission->id)
        ->assertOk()
        ->assertJsonPath('data.equipa.membros.0.id', $agent->id);

    $this->actingAs($agent, 'sanctum')
        ->postJson('/api/missoes/'.$mission->id.'/actividades', ['operacao' => 'conhecimento'])
        ->assertCreated()
        ->assertJsonPath('data.historico.0.operacao', 'conhecimento_confirmado');

    $this->actingAs($agent, 'sanctum')
        ->patchJson('/api/missoes/'.$mission->id.'/estado', ['estado' => EstadoMissao::EM_DESLOCACAO->value])
        ->assertOk();
    $this->actingAs($agent, 'sanctum')
        ->postJson('/api/missoes/'.$mission->id.'/actividades', [
            'operacao' => 'chegada',
            'observacoes' => 'Equipa chegou ao ponto de encontro.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.estado', EstadoMissao::EM_EXECUCAO->value);

    $this->actingAs($agent, 'sanctum')
        ->postJson('/api/missoes/'.$mission->id.'/actividades', [
            'operacao' => 'dificuldade',
            'observacoes' => 'A estrada secundária está parcialmente bloqueada.',
        ])
        ->assertCreated();
    $this->actingAs($agent, 'sanctum')
        ->postJson('/api/missoes/'.$mission->id.'/actividades', [
            'operacao' => 'concluir',
            'observacoes' => 'Residentes retirados e área entregue às autoridades locais.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.estado', EstadoMissao::CONCLUIDA->value);

    expect(HistoricoMissao::query()->where('missao_id', $mission->id)->count())->toBe(6)
        ->and($team->fresh()->estado)->toBe(EstadoEquipa::DISPONIVEL);

    $outsider = coordinatorApiTestUser('Agente');
    $outsider->equipa_id = Equipa::query()->create([
        'nome' => 'Equipa externa teste',
        'tipo_equipa_id' => $teamType->id,
        'estado' => EstadoEquipa::DISPONIVEL,
    ])->id;
    $outsider->save();
    $this->actingAs($outsider, 'sanctum')->getJson('/api/missoes/'.$mission->id)->assertForbidden();
    $this->actingAs($outsider, 'sanctum')->postJson('/api/missoes/'.$mission->id.'/actividades', [
        'operacao' => 'progresso',
        'observacoes' => 'Tentativa sem autorização.',
    ])->assertForbidden();
    $this->actingAs($agent, 'sanctum')->postJson('/api/missoes/'.$mission->id.'/cancelar')->assertUnprocessable();
});
