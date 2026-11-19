
<?php

use App\Models\Localizacao;
use App\Models\Ocorrencia;
use App\Models\Prioridade;
use App\Models\Provincia;
use App\Models\Distrito;
use App\Models\TipoOcorrencia;
use App\Models\User;
use App\Models\ValidacaoOcorrencia;
use App\Enums\EstadoOcorrencia;
use App\Services\Ocorrencias\DeteccaoDuplicadosService;
use Illuminate\Support\Facades\DB;

function singeDuplicadosPreparar(): array
{
    $user = User::factory()->create();

    $tipo = TipoOcorrencia::query()->create([
        'nome' => 'Incêndio '.uniqid(),
        'descricao' => 'Teste de detecção.',
        'ativo' => true,
    ]);

    $prioridade = Prioridade::query()->firstOrCreate(
        ['nome' => 'Baixa'],
        ['descricao' => 'Prioridade inicial.', 'nivel' => 4],
    );

    return [
        'user' => $user,
        'tipo' => $tipo,
        'prioridade' => $prioridade,
    ];
}

function singeDuplicadosCriarOcorrencia(
    array $base,
    array $alteracoes = []
): Ocorrencia {
    return Ocorrencia::query()->create(array_merge([
        'titulo' => 'Incêndio de teste',
        'descricao' => 'Ocorrência para testar duplicação.',
        'localizacao' => 'Maputo',
        'latitude' => -25.9655,
        'longitude' => 32.5832,
        'tipo_ocorrencia_id' => $base['tipo']->id,
        'prioridade_id' => $base['prioridade']->id,
        'utilizador_id' => $base['user']->id,
        'estado' => 'registada',
        'data_ocorrencia' => now(),
    ], $alteracoes));
}

function singeDuplicadosCriarLocalizacao(
    bool $comCoordenadas = false
): Localizacao {
    $provinciaId = DB::table('provincias')->insertGetId([
        'nome' => 'Província '.uniqid(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    $distritoId = DB::table('distritos')->insertGetId([
        'provincia_id' => $provinciaId,
        'nome' => 'Distrito '.uniqid(),
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    return Localizacao::query()->create([
        'provincia_id' => $provinciaId,
        'distrito_id' => $distritoId,
        'latitude' => $comCoordenadas ? -25.9655 : null,
        'longitude' => $comCoordenadas ? 32.5832 : null,
    ]);
}

it('encontra ocorrências do mesmo tipo num raio de cinco quilómetros', function () {
    $base = singeDuplicadosPreparar();

    $original = singeDuplicadosCriarOcorrencia($base);

    // Aproximadamente 2,2 km da ocorrência original.
    $proxima = singeDuplicadosCriarOcorrencia($base, [
        'latitude' => -25.9455,
        'longitude' => 32.5832,
        'data_ocorrencia' => now()->subHours(2),
    ]);

    // Aproximadamente 6,7 km da ocorrência original.
    $distante = singeDuplicadosCriarOcorrencia($base, [
        'latitude' => -25.9055,
        'longitude' => 32.5832,
    ]);

    $resultado = (new DeteccaoDuplicadosService)
        ->buscarCandidatas($original);

    expect($resultado)->toHaveCount(1)
        ->and($resultado[0]['ocorrencia']->id)->toBe($proxima->id)
        ->and($resultado[0]['criterio'])->toBe('PROXIMIDADE_GPS')
        ->and($resultado[0]['distancia_km'])->toBeLessThan(5)
        ->and(collect($resultado)->pluck('ocorrencia.id')->contains($distante->id))
        ->toBeFalse();
});

it('respeita a janela temporal de vinte e quatro horas', function () {
    $base = singeDuplicadosPreparar();

    $original = singeDuplicadosCriarOcorrencia($base);

    $dentroDaJanela = singeDuplicadosCriarOcorrencia($base, [
        'data_ocorrencia' => now()->subHours(23),
    ]);

    $foraDaJanela = singeDuplicadosCriarOcorrencia($base, [
        'data_ocorrencia' => now()->subHours(25),
    ]);

    $resultado = (new DeteccaoDuplicadosService)
        ->buscarCandidatas($original);

    expect(collect($resultado)->pluck('ocorrencia.id'))
        ->toContain($dentroDaJanela->id)
        ->not->toContain($foraDaJanela->id);
});

it('não considera ocorrências de tipos diferentes', function () {
    $base = singeDuplicadosPreparar();

    $original = singeDuplicadosCriarOcorrencia($base);

    $outroTipo = TipoOcorrencia::query()->create([
        'nome' => 'Inundação '.uniqid(),
        'descricao' => 'Outro tipo.',
        'ativo' => true,
    ]);

    singeDuplicadosCriarOcorrencia($base, [
        'tipo_ocorrencia_id' => $outroTipo->id,
    ]);

    $resultado = (new DeteccaoDuplicadosService)
        ->buscarCandidatas($original);

    expect($resultado)->toBeEmpty();
});

it('usa a mesma localização quando as coordenadas GPS não existem', function () {
    $base = singeDuplicadosPreparar();

    $localizacao = singeDuplicadosCriarLocalizacao(false);
    $outraLocalizacao = singeDuplicadosCriarLocalizacao(false);

    $original = singeDuplicadosCriarOcorrencia($base, [
        'latitude' => null,
        'longitude' => null,
        'localizacao_id' => $localizacao->id,
    ]);

    $mesmaLocalizacao = singeDuplicadosCriarOcorrencia($base, [
        'latitude' => null,
        'longitude' => null,
        'localizacao_id' => $localizacao->id,
    ]);

    singeDuplicadosCriarOcorrencia($base, [
        'latitude' => null,
        'longitude' => null,
        'localizacao_id' => $outraLocalizacao->id,
    ]);

    $resultado = (new DeteccaoDuplicadosService)
        ->buscarCandidatas($original);

    expect($resultado)->toHaveCount(1)
        ->and($resultado[0]['ocorrencia']->id)->toBe($mesmaLocalizacao->id)
        ->and($resultado[0]['criterio'])->toBe('MESMA_LOCALIZACAO')
        ->and($resultado[0]['distancia_km'])->toBeNull();
});

it('não procura candidatos quando não existem coordenadas nem localização', function () {
    $base = singeDuplicadosPreparar();

    $original = singeDuplicadosCriarOcorrencia($base, [
        'latitude' => null,
        'longitude' => null,
        'localizacao_id' => null,
    ]);

    $resultado = (new DeteccaoDuplicadosService)
        ->buscarCandidatas($original);

    expect($resultado)->toBeEmpty();
});

it('limita a pesquisa a dez candidatos', function () {
    $base = singeDuplicadosPreparar();

    $original = singeDuplicadosCriarOcorrencia($base);

    for ($i = 0; $i < 12; $i++) {
        singeDuplicadosCriarOcorrencia($base, [
            'latitude' => -25.9655 + ($i * 0.0001),
            'longitude' => 32.5832,
        ]);
    }

    $resultado = (new DeteccaoDuplicadosService)
        ->buscarCandidatas($original);

    expect($resultado)->toHaveCount(10);
});

it('exclui ocorrências cuja última validação indica duplicação', function () {
    $base = singeDuplicadosPreparar();

    $original = singeDuplicadosCriarOcorrencia($base);
    $candidata = singeDuplicadosCriarOcorrencia($base);

    ValidacaoOcorrencia::query()->create([
        'ocorrencia_id' => $candidata->id,
        'estado' => 'DUPLICADA',
        'ocorrencia_original_id' => $original->id,
        'data_validacao' => now(),
    ]);

    $resultado = (new DeteccaoDuplicadosService)
        ->buscarCandidatas($original);

    expect(collect($resultado)->pluck('ocorrencia.id'))
        ->not->toContain($candidata->id);
});

it('não altera o estado das ocorrências ao procurar candidatas', function () {
    $base = singeDuplicadosPreparar();

    $original = singeDuplicadosCriarOcorrencia($base);
    $candidata = singeDuplicadosCriarOcorrencia($base);

    (new DeteccaoDuplicadosService)->buscarCandidatas($original);

    expect($original->fresh()->estado)->toBe(EstadoOcorrencia::REGISTADA)
        ->and($candidata->fresh()->estado)->toBe(EstadoOcorrencia::REGISTADA)
        ->and(ValidacaoOcorrencia::query()->count())->toBe(0);
});
