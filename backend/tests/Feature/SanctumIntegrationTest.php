<?php

use App\Models\Equipa;
use App\Models\Perfil;
use App\Models\TipoEquipa;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

function sanctumIntegrationUser(string $profile = 'Administrador'): User
{
    $perfil = Perfil::query()->firstOrCreate(
        ['nome' => $profile],
        ['descricao' => $profile],
    );

    return User::factory()->create(['perfil_id' => $perfil->id]);
}

it('logs in with valid credentials and returns a token without sensitive user attributes', function () {
    $user = sanctumIntegrationUser();
    $user->password = 'correct-password';
    $user->save();

    $response = $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'correct-password',
    ])->assertOk()
        ->assertJsonStructure([
            'message',
            'user' => ['id', 'name', 'email', 'perfil'],
            'token',
        ]);

    expect($response->json('token'))->toBeString()->not->toBeEmpty()
        ->and($response->json('user'))->not->toHaveKey('password')
        ->and($response->json('user'))->not->toHaveKey('remember_token')
        ->and($response->json('user'))->not->toHaveKey('tokens');
});

it('rejects invalid login credentials without revealing account details', function () {
    $user = sanctumIntegrationUser();
    $user->password = 'correct-password';
    $user->save();

    $this->postJson('/api/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors('email');
});

it('validates missing login fields', function () {
    $this->postJson('/api/login', [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'password']);
});

it('registers a citizen through the public authentication endpoint', function () {
    Perfil::query()->create([
        'nome' => 'Cidadão',
        'descricao' => 'Registo público',
    ]);

    $this->postJson('/api/register', [
        'name' => 'New Citizen',
        'email' => 'new-citizen@example.test',
        'password' => 'password-123',
        'password_confirmation' => 'password-123',
    ])->assertCreated()
        ->assertJsonPath('user.perfil.nome', 'Cidadão')
        ->assertJsonStructure(['user', 'token'])
        ->assertJsonMissingPath('user.password');
});

it('returns the authenticated user and profile through a real Sanctum bearer token', function () {
    $user = sanctumIntegrationUser('Coordenador');
    $token = $user->createToken('integration-test')->plainTextToken;

    $response = $this->withToken($token)->getJson('/api/me')
        ->assertOk()
        ->assertJsonPath('user.id', $user->id)
        ->assertJsonPath('user.perfil.nome', 'Coordenador');

    expect($response->json('user'))->not->toHaveKey('password')
        ->and($response->json('user'))->not->toHaveKey('remember_token')
        ->and($response->json('user'))->not->toHaveKey('tokens');
});

it('rejects missing and invalid bearer tokens on private routes', function () {
    $this->getJson('/api/me')->assertUnauthorized();
    $this->withToken('invalid-token')->getJson('/api/me')->assertUnauthorized();
});

it('allows a valid token through profile-protected routes', function () {
    $user = sanctumIntegrationUser('Administrador');
    $token = $user->createToken('integration-test')->plainTextToken;
    $teamType = TipoEquipa::query()->create([
        'nome' => 'Intervenção',
        'descricao' => 'Equipa de intervenção',
        'ativo' => true,
    ]);
    $team = Equipa::query()->create([
        'nome' => 'Equipa de Intervenção',
        'tipo_equipa_id' => $teamType->id,
        'estado' => 'disponivel',
    ]);

    $this->withToken($token)->getJson('/api/equipas/'.$team->id)
        ->assertOk()
        ->assertJsonPath('data.id', $team->id);
});

it('logout revokes only the bearer token used for the current request', function () {
    $user = sanctumIntegrationUser();
    $firstToken = $user->createToken('first')->plainTextToken;
    $secondToken = $user->createToken('second')->plainTextToken;

    $this->withToken($firstToken)->postJson('/api/logout')->assertOk();

    expect($user->tokens()->count())->toBe(1)
        ->and($user->tokens()->first()?->name)->toBe('second');

    Auth::forgetGuards();
    $this->withToken($firstToken)->getJson('/api/me')->assertUnauthorized();
    Auth::forgetGuards();
    $this->withToken($secondToken)->getJson('/api/me')->assertOk();
});
