<?php

use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Enums\EstadoOcorrencia;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Avaliacoes\StoreAvaliacaoPrioridadeRequest;
use App\Http\Requests\Documentos\StoreDocumentoIdentificacaoRequest;
use App\Http\Requests\Documentos\UpdateDocumentoIdentificacaoRequest;
use App\Http\Requests\Evidencias\StoreEvidenciaRequest;
use App\Http\Requests\Localizacoes\StoreLocalizacaoRequest;
use App\Http\Requests\Localizacoes\UpdateLocalizacaoRequest;
use App\Http\Requests\Missoes\StoreMissaoRequest;
use App\Http\Requests\Missoes\UpdateMissaoRequest;
use App\Http\Requests\Notificacoes\StoreNotificacaoRequest;
use App\Http\Requests\Ocorrencias\StoreOcorrenciaRequest;
use App\Http\Requests\Ocorrencias\UpdateOcorrenciaRequest;
use App\Http\Requests\Validacoes\StoreValidacaoOcorrenciaRequest;
use App\Models\Bairro;
use App\Models\Distrito;
use App\Models\DocumentoIdentificacao;
use App\Models\Equipa;
use App\Models\FatorPrioridade;
use App\Models\Localizacao;
use App\Models\Missao;
use App\Models\Municipio;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\PostoAdministrativo;
use App\Models\Prioridade;
use App\Models\Provincia;
use App\Models\TipoEquipa;
use App\Models\TipoOcorrencia;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Routing\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

function requestValidator(string $requestClass, array $data, ?User $user = null, array $routeParameters = []): array
{
    $formRequest = $requestClass::create('/test', 'POST', $data);
    $formRequest->setUserResolver(fn () => $user);
    $formRequest->setRouteResolver(function () use ($routeParameters, $formRequest) {
        $route = new Route('POST', '/test', []);
        $route->bind($formRequest);
        foreach ($routeParameters as $key => $value) {
            $route->setParameter($key, $value);
        }

        return $route;
    });

    $validator = Validator::make(
        $formRequest->all(),
        $formRequest->rules(),
        $formRequest->messages(),
        $formRequest->attributes(),
    );

    if (method_exists($formRequest, 'withValidator')) {
        $formRequest->withValidator($validator);
    }

    return [$formRequest, $validator];
}

function createLocationFixture(): array
{
    $province = Provincia::create(['nome' => 'Maputo']);
    $district = Distrito::create([
        'provincia_id' => $province->id,
        'nome' => 'KaMpfumo',
    ]);
    $municipality = Municipio::create([
        'distrito_id' => $district->id,
        'nome' => 'Maputo',
    ]);
    $neighborhood = Bairro::create([
        'municipio_id' => $municipality->id,
        'nome' => 'Polana',
    ]);
    $administrativePost = PostoAdministrativo::create([
        'distrito_id' => $district->id,
        'nome' => 'Posto Central',
    ]);

    return [$province, $district, $municipality, $neighborhood, $administrativePost];
}

it('uses form requests for the existing public authentication endpoints', function () {
    Perfil::create(['nome' => 'Cidadão']);

    $this->postJson('/api/register', [
        'name' => 'Ana Cossa',
        'email' => 'ana@example.test',
        'password' => 'Singe-password-2026',
        'password_confirmation' => 'Singe-password-2026',
    ])->assertCreated()
        ->assertJsonPath('user.email', 'ana@example.test');

    $this->postJson('/api/register', [
        'name' => 'Outra Ana',
        'email' => 'ana@example.test',
        'password' => 'Singe-password-2026',
        'password_confirmation' => 'Singe-password-2026',
    ])->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);

    $this->postJson('/api/login', [
        'email' => 'ana@example.test',
        'password' => 'Singe-password-2026',
    ])->assertOk()
        ->assertJsonPath('user.email', 'ana@example.test');

    $this->postJson('/api/login', [])->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'password']);

    expect((new RegisterRequest)->authorize())->toBeTrue()
        ->and((new LoginRequest)->authorize())->toBeTrue();
});

it('validates occurrence input and prevents client-selected priority, actor and state', function () {
    $user = User::factory()->create();
    $type = TipoOcorrencia::create(['nome' => 'Inundação']);
    $priority = Prioridade::create(['nome' => 'Alta', 'nivel' => 1]);
    $location = createLocationFixture();
    $locationRow = Localizacao::create([
        'provincia_id' => $location[0]->id,
        'distrito_id' => $location[1]->id,
        'municipio_id' => $location[2]->id,
    ]);

    $valid = [
        'titulo' => 'Cheia na avenida',
        'descricao' => 'Água impede circulação.',
        'localizacao' => 'Avenida central',
        'localizacao_id' => $locationRow->id,
        'tipo_ocorrencia_id' => $type->id,
        'latitude' => -25.9692,
        'longitude' => 32.5732,
    ];
    [, $validator] = requestValidator(StoreOcorrenciaRequest::class, $valid, $user);
    expect($validator->passes())->toBeTrue();

    [, $validator] = requestValidator(StoreOcorrenciaRequest::class, [
        ...$valid,
        'tipo_ocorrencia_id' => 99999,
        'latitude' => -91,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $user->id,
    ], $user);
    expect($validator->fails())->toBeTrue()
        ->and($validator->errors()->keys())->toContain('tipo_ocorrencia_id', 'latitude', 'prioridade_id', 'utilizador_id');

    [, $validator] = requestValidator(StoreOcorrenciaRequest::class, [
        'descricao' => 'Sem título e sem localização',
    ], $user);
    expect($validator->errors()->keys())->toContain('titulo', 'localizacao', 'tipo_ocorrencia_id');

    $occurrence = Ocorrencia::create([
        ...$valid,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $user->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);
    [, $validator] = requestValidator(UpdateOcorrenciaRequest::class, [
        'estado' => 'estado-inválido',
        'prioridade_id' => $priority->id,
    ], $user, ['ocorrencia' => $occurrence]);
    expect($validator->errors()->keys())->toContain('estado', 'prioridade_id');
});

it('validates evidence uploads, occurrence references and actor fields', function () {
    $user = User::factory()->create();
    [, $district, $municipality] = createLocationFixture();
    $type = TipoOcorrencia::create(['nome' => 'Incêndio']);
    $priority = Prioridade::create(['nome' => 'Média', 'nivel' => 2]);
    $location = Localizacao::create([
        'provincia_id' => $district->provincia_id,
        'distrito_id' => $district->id,
        'municipio_id' => $municipality->id,
    ]);
    $occurrence = Ocorrencia::create([
        'titulo' => 'Incêndio',
        'descricao' => 'Fumo numa residência.',
        'localizacao' => 'Polana',
        'localizacao_id' => $location->id,
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $user->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);
    $valid = [
        'ocorrencia_id' => $occurrence->id,
        'ficheiro' => UploadedFile::fake()->image('prova.jpg'),
    ];

    [, $validator] = requestValidator(StoreEvidenciaRequest::class, $valid, $user);
    expect($validator->passes())->toBeTrue();
    [$request] = requestValidator(StoreEvidenciaRequest::class, $valid, $user);
    expect($request->authorize())->toBeTrue();

    $differentUser = User::factory()->create();
    [$request] = requestValidator(StoreEvidenciaRequest::class, $valid, $differentUser);
    expect($request->authorize())->toBeFalse();

    [, $validator] = requestValidator(StoreEvidenciaRequest::class, [
        ...$valid,
        'ficheiro' => UploadedFile::fake()->create('script.exe', 100, 'application/octet-stream'),
        'utilizador_id' => $user->id,
    ], $user);
    expect($validator->errors()->keys())->toContain('ficheiro', 'utilizador_id');

    [, $validator] = requestValidator(StoreEvidenciaRequest::class, [
        'ocorrencia_id' => 99999,
        'ficheiro' => UploadedFile::fake()->create('large.pdf', 11000, 'application/pdf'),
    ], $user);
    expect($validator->errors()->keys())->toContain('ocorrencia_id', 'ficheiro');
});

it('validates mission references, available teams, dates and enum states', function () {
    $coordinatorProfile = Perfil::create(['nome' => 'Coordenador']);
    $user = User::factory()->create(['perfil_id' => $coordinatorProfile->id]);
    [, $district, $municipality] = createLocationFixture();
    $type = TipoOcorrencia::create(['nome' => 'Ciclone']);
    $priority = Prioridade::create(['nome' => 'Crítica', 'nivel' => 3]);
    $location = Localizacao::create([
        'provincia_id' => $district->provincia_id,
        'distrito_id' => $district->id,
        'municipio_id' => $municipality->id,
    ]);
    $occurrence = Ocorrencia::create([
        'titulo' => 'Ciclone',
        'descricao' => 'Danos reportados.',
        'localizacao' => 'Maputo',
        'localizacao_id' => $location->id,
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $user->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);
    $teamType = TipoEquipa::create(['nome' => 'Resgate', 'ativo' => true]);
    $team = Equipa::create([
        'nome' => 'Equipa A',
        'tipo_equipa_id' => $teamType->id,
        'estado' => EstadoEquipa::DISPONIVEL,
    ]);
    $data = [
        'ocorrencia_id' => $occurrence->id,
        'equipa_id' => $team->id,
        'coordenador_id' => $user->id,
        'estado' => EstadoMissao::ATRIBUIDA->value,
        'data_atribuicao' => '2026-11-06 09:00:00',
        'data_inicio' => '2026-11-06 10:00:00',
    ];

    [, $validator] = requestValidator(StoreMissaoRequest::class, $data, $user);
    expect($validator->passes())->toBeTrue();
    [$request] = requestValidator(StoreMissaoRequest::class, $data, $user);
    expect($request->authorize())->toBeTrue();

    $citizenProfile = Perfil::create(['nome' => 'Cidadão']);
    $citizen = User::factory()->create(['perfil_id' => $citizenProfile->id]);
    [, $validator] = requestValidator(StoreMissaoRequest::class, [
        ...$data,
        'coordenador_id' => $citizen->id,
    ], $user);
    expect($validator->errors()->has('coordenador_id'))->toBeTrue();

    $team->update(['estado' => EstadoEquipa::INDISPONIVEL]);
    [, $validator] = requestValidator(StoreMissaoRequest::class, [
        ...$data,
        'ocorrencia_id' => 99999,
        'estado' => 'em_estado_desconhecido',
        'data_inicio' => '2026-11-05 10:00:00',
    ], $user);
    expect($validator->errors()->keys())->toContain('ocorrencia_id', 'equipa_id', 'estado', 'data_inicio');

    $mission = Missao::create([
        ...$data,
        'estado' => EstadoMissao::ATRIBUIDA,
    ]);
    [, $validator] = requestValidator(UpdateMissaoRequest::class, [
        'estado' => 'inválido',
    ], $user, ['missao' => $mission]);
    expect($validator->errors()->has('estado'))->toBeTrue();

    [, $validator] = requestValidator(UpdateMissaoRequest::class, [
        'data_inicio' => '2026-11-05 08:00:00',
    ], $user, ['missao' => $mission]);
    expect($validator->errors()->has('data_inicio'))->toBeTrue();
});

it('validates priority assessments and rejects client-supplied actor identity', function () {
    $user = User::factory()->create();
    $priority = Prioridade::create(['nome' => 'Alta', 'nivel' => 1]);
    $factors = [
        FatorPrioridade::create(['nome' => 'Gravidade', 'peso' => 0.30, 'ativo' => true]),
        FatorPrioridade::create(['nome' => 'Pessoas afectadas', 'peso' => 0.25, 'ativo' => true]),
        FatorPrioridade::create(['nome' => 'Vulnerabilidade', 'peso' => 0.20, 'ativo' => true]),
        FatorPrioridade::create(['nome' => 'Localização', 'peso' => 0.15, 'ativo' => true]),
        FatorPrioridade::create(['nome' => 'Escassez de recursos', 'peso' => 0.10, 'ativo' => true]),
    ];
    $valid = [
        'ocorrencia_id' => 1,
        'factores' => array_map(
            fn (FatorPrioridade $factor): array => [
                'fator_prioridade_id' => $factor->id,
                'pontuacao' => 5,
            ],
            $factors,
        ),
    ];
    DB::table('ocorrencias')->insert([
        'titulo' => 'Teste',
        'descricao' => 'Teste',
        'localizacao' => 'Teste',
        'tipo_ocorrencia_id' => TipoOcorrencia::create(['nome' => 'Teste'])->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $user->id,
        'estado' => 'registada',
        'created_at' => now(),
        'updated_at' => now(),
    ]);

    [, $validator] = requestValidator(StoreAvaliacaoPrioridadeRequest::class, $valid, $user);
    expect($validator->passes())->toBeTrue();

    [, $validator] = requestValidator(StoreAvaliacaoPrioridadeRequest::class, [
        ...$valid,
        'pontuacao_total' => 1000000,
        'utilizador_id' => $user->id,
    ], $user);
    expect($validator->errors()->keys())->toContain('pontuacao_total', 'utilizador_id');
});

it('validates identity document uniqueness, dates, file types and ownership fields', function () {
    $user = User::factory()->create();
    $data = [
        'tipo_documento' => 'BI',
        'numero_documento' => '123456789A',
        'nome_documento' => 'Ana Cossa',
        'data_nascimento' => '1990-01-01',
        'data_emissao' => '2020-01-01',
        'data_validade' => '2030-01-01',
        'ficheiro' => UploadedFile::fake()->image('bi.jpg'),
    ];

    [, $validator] = requestValidator(StoreDocumentoIdentificacaoRequest::class, $data, $user);
    expect($validator->passes())->toBeTrue();
    [, $validator] = requestValidator(StoreDocumentoIdentificacaoRequest::class, [
        'tipo_documento' => 'Passaporte',
        'numero_documento' => 'P-123',
        'data_validade' => '2030-01-01',
    ], $user);
    expect($validator->passes())->toBeTrue();

    $document = DocumentoIdentificacao::create([
        'utilizador_id' => $user->id,
        'tipo_documento' => 'BI',
        'numero_documento' => '123456789A',
        'estado_verificacao' => 'PENDENTE',
    ]);
    [, $validator] = requestValidator(StoreDocumentoIdentificacaoRequest::class, $data, $user);
    expect($validator->errors()->has('numero_documento'))->toBeTrue();

    [, $validator] = requestValidator(StoreDocumentoIdentificacaoRequest::class, [
        ...$data,
        'numero_documento' => 'DUPLICADO-2',
        'data_nascimento' => '2999-01-01',
        'data_validade' => '2019-01-01',
        'ficheiro' => UploadedFile::fake()->create('anexo.exe', 10, 'application/octet-stream'),
        'utilizador_id' => 999,
    ], $user);
    expect($validator->errors()->keys())->toContain('data_nascimento', 'data_validade', 'ficheiro', 'utilizador_id');

    [, $validator] = requestValidator(UpdateDocumentoIdentificacaoRequest::class, [
        'numero_documento' => '123456789A',
    ], $user, ['documentoIdentificacao' => $document]);
    expect($validator->passes())->toBeTrue();

    $otherUser = User::factory()->create();
    [$request] = requestValidator(UpdateDocumentoIdentificacaoRequest::class, [], $otherUser, [
        'documentoIdentificacao' => $document,
    ]);
    expect($request->authorize())->toBeFalse();
});

it('requires a rejection reason and prevents client assignment of the validator', function () {
    $user = User::factory()->create();
    $type = TipoOcorrencia::create(['nome' => 'Acidente']);
    $priority = Prioridade::create(['nome' => 'Baixa', 'nivel' => 4]);
    DB::table('ocorrencias')->insert([
        'titulo' => 'Acidente',
        'descricao' => 'Teste',
        'localizacao' => 'Maputo',
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $user->id,
        'estado' => 'registada',
        'created_at' => now(),
        'updated_at' => now(),
    ]);
    $occurrenceId = (int) DB::table('ocorrencias')->value('id');

    [, $validator] = requestValidator(StoreValidacaoOcorrenciaRequest::class, [
        'ocorrencia_id' => $occurrenceId,
        'estado' => 'REJEITADA',
    ], $user);
    expect($validator->errors()->keys())->toContain('motivo');

    [, $validator] = requestValidator(StoreValidacaoOcorrenciaRequest::class, [
        'ocorrencia_id' => $occurrenceId,
        'estado' => 'REJEITADA',
        'motivo' => 'Não foi confirmada pela equipa.',
        'utilizador_id' => $user->id,
        'data_validacao' => now()->toDateTimeString(),
    ], $user);
    expect($validator->errors()->keys())->toContain('utilizador_id', 'data_validacao');
});

it('validates geographic hierarchy and coordinate ranges for location create and update', function () {
    [$province, $district, $municipality, $neighborhood] = createLocationFixture();
    $otherProvince = Provincia::create(['nome' => 'Gaza']);
    $otherDistrict = Distrito::create([
        'provincia_id' => $otherProvince->id,
        'nome' => 'Xai-Xai',
    ]);
    $valid = [
        'provincia_id' => $province->id,
        'distrito_id' => $district->id,
        'municipio_id' => $municipality->id,
        'bairro_id' => $neighborhood->id,
        'latitude' => -25.9692,
        'longitude' => 32.5732,
    ];
    [, $validator] = requestValidator(StoreLocalizacaoRequest::class, $valid, User::factory()->create());
    expect($validator->passes())->toBeTrue();

    [, $validator] = requestValidator(StoreLocalizacaoRequest::class, [
        ...$valid,
        'distrito_id' => 99999,
        'latitude' => 91,
    ], User::factory()->create());
    expect($validator->errors()->keys())->toContain('distrito_id', 'latitude');

    [, $validator] = requestValidator(StoreLocalizacaoRequest::class, [
        ...$valid,
        'distrito_id' => $otherDistrict->id,
    ], User::factory()->create());
    expect($validator->errors()->has('distrito_id'))->toBeTrue();

    $location = Localizacao::create([
        'provincia_id' => $province->id,
        'distrito_id' => $district->id,
        'municipio_id' => $municipality->id,
        'bairro_id' => $neighborhood->id,
    ]);
    $administratorProfile = Perfil::create(['nome' => 'Administrador']);
    $administrator = User::factory()->create(['perfil_id' => $administratorProfile->id]);
    [$request, $validator] = requestValidator(UpdateLocalizacaoRequest::class, [
        'longitude' => 181,
    ], $administrator, ['localizacao' => $location]);
    expect($validator->errors()->has('longitude'))->toBeTrue()
        ->and($request->authorize())->toBeTrue();
});

it('validates notification references and prevents clients setting read status', function () {
    $user = User::factory()->create();
    $data = [
        'utilizador_id' => $user->id,
        'titulo' => 'Ocorrência actualizada',
        'mensagem' => 'Foi registada uma actualização.',
        'tipo' => 'ocorrencia',
    ];
    [, $validator] = requestValidator(StoreNotificacaoRequest::class, $data, $user);
    expect($validator->passes())->toBeTrue();

    [, $validator] = requestValidator(StoreNotificacaoRequest::class, [
        ...$data,
        'utilizador_id' => 99999,
        'ocorrencia_id' => 99999,
        'lida' => true,
    ], $user);
    expect($validator->errors()->keys())->toContain('utilizador_id', 'ocorrencia_id', 'lida');
});
