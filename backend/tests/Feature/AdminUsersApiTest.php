<?php

use App\Models\Equipa;
use App\Models\Perfil;
use App\Models\TipoEquipa;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

function adminUsersApiProfile(string $name): Perfil
{
    return Perfil::query()->firstOrCreate(['nome' => $name], ['descricao' => $name]);
}

it('allows only administrators to manage real user accounts and assigns agents to a team', function () {
    $admin = User::factory()->create(['perfil_id' => adminUsersApiProfile('Administrador')->id]);
    $operator = User::factory()->create(['perfil_id' => adminUsersApiProfile('Operador')->id]);
    adminUsersApiProfile('Agente');
    $teamType = TipoEquipa::query()->create(['nome' => 'Resgate admin teste', 'descricao' => 'Resgate', 'ativo' => true]);
    $team = Equipa::query()->create(['nome' => 'Resgate admin Beira', 'tipo_equipa_id' => $teamType->id, 'estado' => 'disponivel']);

    $this->actingAs($admin, 'sanctum')->getJson('/api/utilizadores')
        ->assertOk()->assertJsonFragment(['id' => $admin->id, 'perfil' => 'Administrador']);
    $this->actingAs($operator, 'sanctum')->getJson('/api/utilizadores')->assertForbidden();

    $this->actingAs($admin, 'sanctum')->postJson('/api/utilizadores', [
        'nome' => 'Agente de Demonstração',
        'email' => 'agente.admin-api@singe.test',
        'perfil' => 'Agente',
        'password' => 'SenhaTeste2026',
    ])->assertUnprocessable()->assertJsonValidationErrors('equipa_id');

    $agent = $this->actingAs($admin, 'sanctum')->postJson('/api/utilizadores', [
        'nome' => 'Agente de Demonstração',
        'email' => 'agente.admin-api@singe.test',
        'perfil' => 'Agente',
        'equipa_id' => $team->id,
        'password' => 'SenhaTeste2026',
    ])->assertCreated()->assertJsonPath('data.perfil', 'Agente')->assertJsonPath('data.equipa_id', $team->id)->json('data');

    $this->actingAs($admin, 'sanctum')->patchJson('/api/utilizadores/'.$agent['id'].'/desativar')
        ->assertOk()->assertJsonPath('data.estado', 'Inactivo');
    $this->postJson('/api/login', ['email' => 'agente.admin-api@singe.test', 'password' => 'SenhaTeste2026'])
        ->assertUnprocessable()->assertJsonValidationErrors('email');
});

it('prevents an administrator from deactivating their own account', function () {
    $admin = User::factory()->create([
        'perfil_id' => adminUsersApiProfile('Administrador')->id,
        'password' => Hash::make('SenhaTeste2026'),
    ]);

    $this->actingAs($admin, 'sanctum')->patchJson('/api/utilizadores/'.$admin->id.'/desativar')
        ->assertForbidden();
});
