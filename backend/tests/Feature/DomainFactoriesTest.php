<?php

use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Models\Equipa;
use App\Models\Missao;
use App\Models\User;

it('builds reproducible profile, team, occurrence and mission scenarios with factories', function () {
    $team = Equipa::factory()->create();
    $agent = User::factory()->agent($team)->create();
    $mission = Missao::factory()->emExecucao()->create();

    expect($agent->perfil->nome)->toBe('Agente')
        ->and($agent->equipa_id)->toBe($team->id)
        ->and($mission->estado)->toBe(EstadoMissao::EM_EXECUCAO)
        ->and($mission->ocorrencia->utilizador->perfil->nome)->toBe('Cidadão')
        ->and($mission->coordenador->perfil->nome)->toBe('Coordenador')
        ->and($mission->equipa->estado)->toBe(EstadoEquipa::EM_MISSAO)
        ->and($mission->historico()->where('operacao', 'criada')->exists())->toBeTrue();
});
