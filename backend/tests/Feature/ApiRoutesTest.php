<?php

use App\Enums\EstadoMissao;
use App\Enums\EstadoOcorrencia;
use App\Http\Middleware\VerificarPerfil;
use App\Models\Equipa;
use App\Models\Missao;
use App\Models\Notificacao;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\Prioridade;
use App\Models\TipoEquipa;
use App\Models\TipoOcorrencia;
use App\Models\User;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

function apiRouteUserWithProfile(string $profileName): User
{
    $profile = Perfil::query()->firstOrCreate(
        ['nome' => $profileName],
        ['descricao' => $profileName],
    );

    return User::factory()->create(['perfil_id' => $profile->id]);
}

/**
 * @return array{Equipa, Missao}
 */
function apiRouteMissionFixture(?EstadoMissao $state = null): array
{
    $state ??= EstadoMissao::ATRIBUIDA;
    $coordinator = apiRouteUserWithProfile('Coordenador');
    $teamType = TipoEquipa::query()->create([
        'nome' => 'Resgate '.uniqid(),
        'descricao' => 'Equipa de resgate',
        'ativo' => true,
    ]);
    $team = Equipa::query()->create([
        'nome' => 'Equipa de Resgate',
        'tipo_equipa_id' => $teamType->id,
        'estado' => 'em_missao',
    ]);

    $occurrenceType = TipoOcorrencia::query()->create([
        'nome' => 'Incêndio '.uniqid(),
        'descricao' => 'Fogo em edifício',
        'ativo' => true,
    ]);
    $priority = Prioridade::query()->firstOrCreate(
        ['nome' => 'Baixa'],
        ['descricao' => 'Prioridade baixa', 'nivel' => 4],
    );
    $occurrence = Ocorrencia::query()->create([
        'titulo' => 'Incêndio',
        'descricao' => 'Fogo numa habitação.',
        'localizacao' => 'Centro',
        'tipo_ocorrencia_id' => $occurrenceType->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $coordinator->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);

    $mission = Missao::query()->create([
        'ocorrencia_id' => $occurrence->id,
        'equipa_id' => $team->id,
        'coordenador_id' => $coordinator->id,
        'estado' => $state,
        'data_atribuicao' => now()->subMinutes(10),
        'data_inicio' => $state === EstadoMissao::EM_EXECUCAO ? now()->subMinutes(5) : null,
    ]);

    return [$team, $mission];
}

it('returns JSON 401 when the profile middleware receives an unauthenticated request', function () {
    $request = Request::create('/api/admin', 'GET');
    $response = (new VerificarPerfil)->handle(
        $request,
        fn (Request $request): Response => response()->noContent(),
        'Administrador',
    );

    expect($response->getStatusCode())->toBe(401)
        ->and(json_decode($response->getContent(), true))->toMatchArray([
            'success' => false,
            'message' => 'Autenticação necessária.',
        ]);
});

it('rejects authenticated users without a valid profile', function () {
    $request = Request::create('/api/admin', 'GET');
    $request->setUserResolver(fn (): User => User::factory()->make());

    $response = (new VerificarPerfil)->handle(
        $request,
        fn (Request $request): Response => response()->noContent(),
        'Administrador',
    );

    expect($response->getStatusCode())->toBe(403);

    $unknownProfile = apiRouteUserWithProfile('Perfil inesperado');
    $request->setUserResolver(fn (): User => $unknownProfile);
    $response = (new VerificarPerfil)->handle(
        $request,
        fn (Request $request): Response => response()->noContent(),
        'Perfil inesperado',
    );

    expect($response->getStatusCode())->toBe(403);
});

it('accepts a comma-separated list of profile names', function () {
    $user = apiRouteUserWithProfile('Coordenador');
    $request = Request::create('/api/admin-or-coordinator', 'GET');
    $request->setUserResolver(fn (): User => $user);

    $response = (new VerificarPerfil)->handle(
        $request,
        fn (Request $request): Response => response()->noContent(),
        'Administrador,Coordenador',
    );

    expect($response->getStatusCode())->toBe(204);
});

it('keeps login public and protects the authenticated profile endpoint', function () {
    $this->postJson('/api/login', [])->assertUnprocessable();
    $this->getJson('/api/me')->assertUnauthorized();
});

it('allows an administrator to consult a team and restricts mission creation by profile', function () {
    $administrator = apiRouteUserWithProfile('Administrador');
    $teamType = TipoEquipa::query()->create([
        'nome' => 'Comunicações',
        'descricao' => 'Equipa de comunicações',
        'ativo' => true,
    ]);
    $team = Equipa::query()->create([
        'nome' => 'Equipa de Comunicações',
        'tipo_equipa_id' => $teamType->id,
        'estado' => 'disponivel',
    ]);

    $this->actingAs($administrator, 'sanctum')
        ->getJson('/api/equipas/'.$team->id)
        ->assertOk()
        ->assertJsonPath('data.id', $team->id);

    $citizen = apiRouteUserWithProfile('Cidadão');
    $this->actingAs($citizen, 'sanctum')
        ->postJson('/api/missoes', [])
        ->assertForbidden();

    $this->actingAs($administrator, 'sanctum')
        ->postJson('/api/missoes', [])
        ->assertUnprocessable();
});

it('creates a mission through the authenticated route and updates team availability', function () {
    $coordinator = apiRouteUserWithProfile('Coordenador');
    $teamType = TipoEquipa::query()->create([
        'nome' => 'Busca '.uniqid(),
        'descricao' => 'Equipa de busca',
        'ativo' => true,
    ]);
    $team = Equipa::query()->create([
        'nome' => 'Equipa de Busca',
        'tipo_equipa_id' => $teamType->id,
        'estado' => 'disponivel',
    ]);
    $occurrenceType = TipoOcorrencia::query()->create([
        'nome' => 'Inundação '.uniqid(),
        'descricao' => 'Cheia',
        'ativo' => true,
    ]);
    $priority = Prioridade::query()->firstOrCreate(
        ['nome' => 'Baixa'],
        ['descricao' => 'Prioridade baixa', 'nivel' => 4],
    );
    $occurrence = Ocorrencia::query()->create([
        'titulo' => 'Cheia',
        'descricao' => 'Cheia junto ao rio.',
        'localizacao' => 'Margem',
        'tipo_ocorrencia_id' => $occurrenceType->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $coordinator->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);

    $this->withToken($coordinator->createToken('coordinator')->plainTextToken)
        ->postJson('/api/missoes', [
            'ocorrencia_id' => $occurrence->id,
            'equipa_id' => $team->id,
            'data_atribuicao' => now()->toDateTimeString(),
            'data_prevista_conclusao' => now()->addHours(4)->toDateTimeString(),
            'objectivos' => 'Apoiar as pessoas afectadas.',
            'instrucoes' => 'Avaliar o perímetro.',
        ])
        ->assertCreated()
        ->assertJsonPath('data.estado', EstadoMissao::ATRIBUIDA->value)
        ->assertJsonPath('data.equipa_id', $team->id);

    expect(Equipa::query()->findOrFail($team->id)->getRawOriginal('estado'))
        ->toBe('em_missao');
});

it('restricts priority evaluation to administrators and coordinators', function () {
    $agent = apiRouteUserWithProfile('Agente');
    $this->actingAs($agent, 'sanctum')
        ->postJson('/api/avaliacoes-prioridade', [])
        ->assertForbidden();

    $coordinator = apiRouteUserWithProfile('Coordenador');
    $this->actingAs($coordinator, 'sanctum')
        ->postJson('/api/avaliacoes-prioridade', [])
        ->assertUnprocessable();
});

it('allows an assigned agent to advance and complete a mission', function () {
    $agent = apiRouteUserWithProfile('Agente');
    [$team, $mission] = apiRouteMissionFixture();
    $agent->equipa_id = $team->id;
    $agent->save();

    $this->actingAs($agent, 'sanctum')
        ->patchJson('/api/missoes/'.$mission->id.'/estado', [
            'estado' => EstadoMissao::EM_DESLOCACAO->value,
        ])
        ->assertOk()
        ->assertJsonPath('data.estado', EstadoMissao::EM_DESLOCACAO->value);

    $mission->refresh();
    $mission->estado = EstadoMissao::EM_EXECUCAO;
    $mission->data_inicio = now()->subMinute();
    $mission->save();

    $this->actingAs($agent, 'sanctum')
        ->postJson('/api/missoes/'.$mission->id.'/concluir')
        ->assertOk()
        ->assertJsonPath('data.estado', EstadoMissao::CONCLUIDA->value);

    expect(Equipa::query()->findOrFail($team->id)->getRawOriginal('estado'))
        ->toBe('disponivel');
});

it('prevents agents from mutating missions outside their team or cancelling missions', function () {
    $agent = apiRouteUserWithProfile('Agente');
    [, $mission] = apiRouteMissionFixture(EstadoMissao::EM_EXECUCAO);

    $this->actingAs($agent, 'sanctum')
        ->postJson('/api/missoes/'.$mission->id.'/concluir')
        ->assertForbidden();

    $this->actingAs($agent, 'sanctum')
        ->postJson('/api/missoes/'.$mission->id.'/cancelar')
        ->assertForbidden();

    $citizen = apiRouteUserWithProfile('Cidadão');
    $this->actingAs($citizen, 'sanctum')
        ->postJson('/api/missoes/'.$mission->id.'/concluir')
        ->assertForbidden();
});

it('does not expose another users notifications', function () {
    $owner = apiRouteUserWithProfile('Cidadão');
    $otherUser = apiRouteUserWithProfile('Cidadão');
    $notification = Notificacao::query()->create([
        'utilizador_id' => $owner->id,
        'titulo' => 'Aviso',
        'mensagem' => 'Mensagem privada',
        'tipo' => 'sistema',
        'lida' => false,
    ]);

    $this->actingAs($otherUser, 'sanctum')
        ->getJson('/api/notificacoes/'.$notification->id)
        ->assertNotFound();

    $this->actingAs($otherUser, 'sanctum')
        ->patchJson('/api/notificacoes/'.$notification->id.'/lida')
        ->assertNotFound();

    expect($notification->refresh()->lida)->toBeFalse();

    $this->actingAs($owner, 'sanctum')
        ->getJson('/api/notificacoes')
        ->assertOk()
        ->assertJsonPath('data.0.id', $notification->id);
});

it('returns 404 for unregistered API paths', function () {
    $this->getJson('/api/rota-inexistente')->assertNotFound();
});
