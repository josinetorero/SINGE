<?php

use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Enums\EstadoOcorrencia;
use App\Models\AvaliacaoPrioridade;
use App\Models\DocumentoIdentificacao;
use App\Models\Equipa;
use App\Models\FatorPrioridade;
use App\Models\HistoricoOcorrencia;
use App\Models\Missao;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\Prioridade;
use App\Models\TipoEquipa;
use App\Models\TipoOcorrencia;
use App\Models\User;
use App\Services\Avaliacoes\AvaliacaoPrioridadeService;
use App\Services\Equipas\EquipaService;
use App\Services\Evidencias\EvidenciaService;
use App\Services\Identificacao\DocumentoIdentificacaoService as IdentificacaoDocumentoService;
use App\Services\Identificacao\VerificacaoIdentidadeService;
use App\Services\Localizacoes\LocalizacaoService;
use App\Services\Missoes\MissaoService;
use App\Services\Notificacoes\NotificacaoService;
use App\Services\Ocorrencias\OcorrenciaService;
use Database\Seeders\FatoresPrioridadeSeeder;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

function singeUserWithProfile(string $nome): User
{
    $perfil = Perfil::query()->firstOrCreate(['nome' => $nome], ['descricao' => $nome]);

    return User::factory()->create(['perfil_id' => $perfil->id]);
}

function singeOccurrenceFor(User $user, ?Prioridade $priority = null): Ocorrencia
{
    $tipo = TipoOcorrencia::query()->create([
        'nome' => 'Incêndio '.uniqid(),
        'descricao' => 'Fogo em edifício',
        'ativo' => true,
    ]);
    $priority ??= Prioridade::query()->firstOrCreate(
        ['nome' => 'Baixa'],
        ['descricao' => 'Prioridade baixa', 'nivel' => 4],
    );

    return Ocorrencia::query()->create([
        'titulo' => 'Incêndio',
        'descricao' => 'Fogo numa habitação.',
        'localizacao' => 'Centro',
        'tipo_ocorrencia_id' => $tipo->id,
        'prioridade_id' => $priority->id,
        'utilizador_id' => $user->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);
}

function singeOfficialFactors(): array
{
    return [
        FatorPrioridade::query()->create(['nome' => 'Gravidade', 'peso' => 0.30, 'ativo' => true]),
        FatorPrioridade::query()->create(['nome' => 'Pessoas afectadas', 'peso' => 0.25, 'ativo' => true]),
        FatorPrioridade::query()->create(['nome' => 'Vulnerabilidade', 'peso' => 0.20, 'ativo' => true]),
        FatorPrioridade::query()->create(['nome' => 'Localização', 'peso' => 0.15, 'ativo' => true]),
        FatorPrioridade::query()->create(['nome' => 'Escassez de recursos', 'peso' => 0.10, 'ativo' => true]),
    ];
}

function singeFactorScores(array $factors, float $score = 5): array
{
    return array_map(
        fn (FatorPrioridade $factor): array => [
            'fator_prioridade_id' => $factor->id,
            'pontuacao' => $score,
        ],
        $factors,
    );
}

function singePriorities(): array
{
    return [
        Prioridade::query()->create(['nome' => 'Crítica', 'descricao' => 'Imediata', 'nivel' => 1]),
        Prioridade::query()->create(['nome' => 'Alta', 'descricao' => 'Prioritária', 'nivel' => 2]),
        Prioridade::query()->create(['nome' => 'Média', 'descricao' => 'Programada', 'nivel' => 3]),
        Prioridade::query()->create(['nome' => 'Baixa', 'descricao' => 'Não urgente', 'nivel' => 4]),
    ];
}

function singeMissionFixture(string $teamState = 'disponivel'): array
{
    $coordinator = singeUserWithProfile('Coordenador');
    $teamType = TipoEquipa::query()->create(['nome' => 'Resgate', 'descricao' => 'Equipa de resgate', 'ativo' => true]);
    $team = Equipa::query()->create([
        'nome' => 'Equipa de Resgate',
        'tipo_equipa_id' => $teamType->id,
        'estado' => $teamState,
    ]);
    $incident = singeOccurrenceFor($coordinator);

    return [$coordinator, $team, $incident];
}

it('calcula a pontuação oficial com os cinco factores e classifica os limites pelo nome configurado', function () {
    $factors = singeOfficialFactors();
    $priorities = singePriorities();
    $service = new AvaliacaoPrioridadeService;

    expect($service->calcularPontuacaoPonderada([
        ['fator_prioridade_id' => $factors[0]->id, 'pontuacao' => 6],
        ['fator_prioridade_id' => $factors[1]->id, 'pontuacao' => 5],
        ['fator_prioridade_id' => $factors[2]->id, 'pontuacao' => 4],
        ['fator_prioridade_id' => $factors[3]->id, 'pontuacao' => 7],
        ['fator_prioridade_id' => $factors[4]->id, 'pontuacao' => 2],
    ]))->toBe(5.1)
        ->and($service->determinarPrioridade(2.49)->is($priorities[3]))->toBeTrue()
        ->and($service->determinarPrioridade(2.50)->is($priorities[2]))->toBeTrue()
        ->and($service->determinarPrioridade(4.99)->is($priorities[2]))->toBeTrue()
        ->and($service->determinarPrioridade(5.00)->is($priorities[1]))->toBeTrue()
        ->and($service->determinarPrioridade(7.49)->is($priorities[1]))->toBeTrue()
        ->and($service->determinarPrioridade(7.50)->is($priorities[0]))->toBeTrue();
});

it('configura os cinco pesos oficiais e desactiva os factores legados incompatíveis', function () {
    foreach ([
        ['Número de vítimas', 30],
        ['Gravidade dos danos', 25],
        ['População em risco', 25],
        ['Urgência da intervenção', 20],
    ] as [$nome, $peso]) {
        FatorPrioridade::query()->create(['nome' => $nome, 'peso' => $peso, 'ativo' => true]);
    }

    (new FatoresPrioridadeSeeder)->run();

    expect(FatorPrioridade::query()->where('ativo', true)->orderBy('id')->get()->mapWithKeys(
        fn (FatorPrioridade $factor): array => [$factor->nome => (float) $factor->peso],
    )->all())->toBe([
        'Gravidade' => 0.3,
        'Pessoas afectadas' => 0.25,
        'Vulnerabilidade' => 0.2,
        'Localização' => 0.15,
        'Escassez de recursos' => 0.1,
    ])
        ->and(FatorPrioridade::query()->where('ativo', false)->count())->toBe(4);
});

it('rejeita factores em falta, duplicados, inactivos e desconhecidos', function () {
    $factors = singeOfficialFactors();
    $service = new AvaliacaoPrioridadeService;
    $scores = singeFactorScores($factors);

    expect(fn () => $service->calcularPontuacaoPonderada(array_slice($scores, 1)))
        ->toThrow(InvalidArgumentException::class, 'exactamente uma vez');

    $duplicate = $scores;
    $duplicate[4]['fator_prioridade_id'] = $factors[0]->id;
    expect(fn () => $service->calcularPontuacaoPonderada($duplicate))
        ->toThrow(InvalidArgumentException::class, 'repetir factores');

    $factors[4]->ativo = false;
    $factors[4]->save();
    expect(fn () => $service->calcularPontuacaoPonderada($scores))
        ->toThrow(RuntimeException::class, 'cinco factores oficiais');

    $factors[4]->ativo = true;
    $factors[4]->save();
    $unknown = $scores;
    $unknown[4]['fator_prioridade_id'] = 99999;
    expect(fn () => $service->calcularPontuacaoPonderada($unknown))
        ->toThrow(InvalidArgumentException::class, 'desconhecido ou inactivo');
});

it('impede avaliações com pesos divergentes e pontuações fora de 0 a 10', function () {
    $factors = singeOfficialFactors();
    $service = new AvaliacaoPrioridadeService;
    $scores = singeFactorScores($factors);
    $scores[0]['pontuacao'] = -0.01;

    expect(fn () => $service->calcularPontuacaoPonderada($scores))
        ->toThrow(InvalidArgumentException::class, 'entre 0 e 10');

    $scores[0]['pontuacao'] = 10.01;
    expect(fn () => $service->calcularPontuacaoPonderada($scores))
        ->toThrow(InvalidArgumentException::class, 'entre 0 e 10');

    $factors[0]->peso = 0.31;
    $factors[0]->save();
    expect(fn () => $service->calcularPontuacaoPonderada(singeFactorScores($factors)))
        ->toThrow(RuntimeException::class, 'soma dos pesos');

    $factors[1]->peso = 0.24;
    $factors[1]->save();
    expect(fn () => $service->calcularPontuacaoPonderada(singeFactorScores($factors)))
        ->toThrow(RuntimeException::class, 'peso configurado');
});

it('não cria prioridades automaticamente quando a configuração está incompleta', function () {
    $service = new AvaliacaoPrioridadeService;

    expect(fn () => $service->determinarPrioridade(8))
        ->toThrow(RuntimeException::class, 'configuração de prioridades está incompleta');

    expect(Prioridade::query()->count())->toBe(0);
});

it('regista risco iminente apenas com perfil autorizado e justificação', function () {
    $citizen = singeUserWithProfile('Cidadão');
    $coordinator = singeUserWithProfile('Coordenador');
    $service = new AvaliacaoPrioridadeService;

    expect(fn () => $service->avaliar(['risco_iminente_morte' => true], $citizen))
        ->toThrow(AuthorizationException::class);
    expect(fn () => $service->avaliar([
        'ocorrencia_id' => 1,
        'risco_iminente_morte' => true,
    ], $coordinator))
        ->toThrow(InvalidArgumentException::class, 'justificação fundamentada');
});

it('atribui criticidade excepcional abaixo do limiar normal e regista actor e justificação', function () {
    $factors = singeOfficialFactors();
    $priorities = singePriorities();
    $coordinator = singeUserWithProfile('Coordenador');
    $incident = singeOccurrenceFor($coordinator, $priorities[3]);

    Event::listen('eloquent.creating: '.AvaliacaoPrioridade::class, function (AvaliacaoPrioridade $assessment) use ($coordinator, $priorities): void {
        expect((int) $assessment->prioridade_id)->toBe($priorities[0]->id)
            ->and((int) $assessment->utilizador_id)->toBe($coordinator->id)
            ->and(str_starts_with($assessment->justificacao, '[RISCO IMINENTE DE MORTE]'))->toBeTrue()
            ->and((float) $assessment->pontuacao_total)->toBeLessThan(7.5);

        throw new RuntimeException('Interromper depois de verificar os dados da decisão excepcional.');
    });

    try {
        expect(fn () => (new AvaliacaoPrioridadeService)->avaliar([
            'ocorrencia_id' => $incident->id,
            'factores' => singeFactorScores($factors, 1),
            'risco_iminente_morte' => true,
            'justificacao' => 'Foi observada ameaça imediata à vida no local.',
        ], $coordinator))->toThrow(RuntimeException::class, 'decisão excepcional');
    } finally {
        Event::forget('eloquent.creating: '.AvaliacaoPrioridade::class);
    }

    expect(AvaliacaoPrioridade::query()->count())->toBe(0);
});

it('preserva os pesos usados em cada detalhe da avaliação', function () {
    $factors = singeOfficialFactors();
    $priorities = singePriorities();
    $coordinator = singeUserWithProfile('Coordenador');
    $incident = singeOccurrenceFor($coordinator, $priorities[3]);
    $service = new AvaliacaoPrioridadeService;

    $assessment = $service->avaliar([
        'ocorrencia_id' => $incident->id,
        'factores' => singeFactorScores($factors),
        'justificacao' => 'Avaliação operacional.',
    ], $coordinator);

    $factors[0]->peso = 0.90;
    $factors[0]->save();

    $savedFactorWeights = $assessment->fresh('detalhes')->detalhes
        ->mapWithKeys(fn ($detail): array => [$detail->fator_prioridade_id => $detail->peso_aplicado])
        ->all();

    expect($savedFactorWeights)->toBe([
        $factors[0]->id => '0.30',
        $factors[1]->id => '0.25',
        $factors[2]->id => '0.20',
        $factors[3]->id => '0.15',
        $factors[4]->id => '0.10',
    ])->and($incident->fresh()->prioridade_id)->toBe($priorities[1]->id);
});

it('não atribui missões a equipas indisponíveis e mantém estados coerentes', function () {
    [$coordinator, $team, $incident] = singeMissionFixture('indisponivel');
    $service = new MissaoService;

    expect(fn () => $service->criar([
        'ocorrencia_id' => $incident->id,
        'equipa_id' => $team->id,
    ], $coordinator))->toThrow(InvalidArgumentException::class, 'não está disponível');
    expect(Missao::query()->count())->toBe(0);

    $team->estado = EstadoEquipa::DISPONIVEL;
    $team->save();
    $mission = $service->criar([
        'ocorrencia_id' => $incident->id,
        'equipa_id' => $team->id,
    ], $coordinator);
    expect($team->fresh()->estado)->toBe(EstadoEquipa::EM_MISSAO);

    expect(fn () => $service->concluir($mission, $coordinator))
        ->toThrow(InvalidArgumentException::class, 'Transição de missão inválida');

    $service->atualizarEstado($mission, EstadoMissao::EM_DESLOCACAO->value, $coordinator);
    $service->atualizarEstado($mission, EstadoMissao::EM_EXECUCAO->value, $coordinator);
    $completed = $service->concluir($mission, $coordinator);

    expect($completed->estado)->toBe(EstadoMissao::CONCLUIDA)
        ->and($team->fresh()->estado)->toBe(EstadoEquipa::DISPONIVEL);
});

it('rejeita uma segunda missão para a equipa ocupada', function () {
    [$coordinator, $team, $incident] = singeMissionFixture();
    $service = new MissaoService;
    $service->criar(['ocorrencia_id' => $incident->id, 'equipa_id' => $team->id], $coordinator);
    $anotherIncident = singeOccurrenceFor($coordinator);

    expect(fn () => $service->criar([
        'ocorrencia_id' => $anotherIncident->id,
        'equipa_id' => $team->id,
    ], $coordinator))->toThrow(InvalidArgumentException::class, 'não está disponível');
});

it('cancela uma missão activa e repõe a disponibilidade da equipa', function () {
    [$coordinator, $team, $incident] = singeMissionFixture();
    $service = new MissaoService;
    $mission = $service->criar([
        'ocorrencia_id' => $incident->id,
        'equipa_id' => $team->id,
    ], $coordinator);

    $cancelled = $service->cancelar($mission, $coordinator);

    expect($cancelled->estado)->toBe(EstadoMissao::CANCELADA)
        ->and($team->fresh()->estado)->toBe(EstadoEquipa::DISPONIVEL);
});

it('impede alterar a disponibilidade manualmente enquanto a equipa tem missão activa', function () {
    [$coordinator, $team, $incident] = singeMissionFixture();
    (new MissaoService)->criar([
        'ocorrencia_id' => $incident->id,
        'equipa_id' => $team->id,
    ], $coordinator);

    expect(fn () => (new EquipaService)->atualizarDisponibilidade(
        $team,
        EstadoEquipa::INDISPONIVEL->value,
        $coordinator,
    ))->toThrow(InvalidArgumentException::class, 'missões activas');
});

it('regista a ocorrência com o actor autenticado, prioridade inicial do servidor e histórico', function () {
    $citizen = singeUserWithProfile('Cidadão');
    $priority = Prioridade::query()->create(['nome' => 'Baixa', 'descricao' => 'Inicial', 'nivel' => 4]);
    $type = TipoOcorrencia::query()->create([
        'nome' => 'Acidente '.uniqid(),
        'descricao' => 'Acidente rodoviário',
        'ativo' => true,
    ]);

    $incident = (new OcorrenciaService)->criar([
        'titulo' => 'Colisão na avenida',
        'descricao' => 'Duas viaturas envolvidas.',
        'localizacao' => 'Avenida central',
        'tipo_ocorrencia_id' => $type->id,
        'prioridade_id' => 99999,
        'utilizador_id' => 99999,
        'estado' => EstadoOcorrencia::RESOLVIDA->value,
    ], $citizen, $priority);

    expect($incident->utilizador_id)->toBe($citizen->id)
        ->and($incident->prioridade_id)->toBe($priority->id)
        ->and($incident->estado)->toBe(EstadoOcorrencia::REGISTADA)
        ->and($incident->historico()->sole()->estado_novo)->toBe(EstadoOcorrencia::REGISTADA->value);
});

it('não permite ao cidadão alterar o estado operacional nem editar uma ocorrência alheia', function () {
    $citizen = singeUserWithProfile('Cidadão');
    $other = singeUserWithProfile('Cidadão');
    $incident = singeOccurrenceFor($citizen);
    $service = new OcorrenciaService;

    expect(fn () => $service->alterarEstado($incident, EstadoOcorrencia::EM_AVALIACAO->value, $citizen))
        ->toThrow(AuthorizationException::class);
    expect(fn () => $service->atualizar($incident, ['titulo' => 'Manipulada'], $other))
        ->toThrow(AuthorizationException::class);

    $updated = $service->atualizar($incident, [
        'titulo' => 'Descrição corrigida',
        'estado' => EstadoOcorrencia::RESOLVIDA->value,
        'prioridade_id' => 99999,
        'utilizador_id' => $other->id,
    ], $citizen);

    expect($updated->titulo)->toBe('Descrição corrigida')
        ->and($updated->estado)->toBe(EstadoOcorrencia::REGISTADA)
        ->and($updated->utilizador_id)->toBe($citizen->id);
});

it('impede o cidadão de alterar a localização depois da ocorrência sair do estado registada', function () {
    $citizen = singeUserWithProfile('Cidadão');
    $incident = singeOccurrenceFor($citizen);
    $incident->estado = EstadoOcorrencia::EM_AVALIACAO;
    $incident->save();

    expect(fn () => (new OcorrenciaService)->associarLocalizacao($incident, 99999, $citizen))
        ->toThrow(AuthorizationException::class);
    expect(fn () => (new LocalizacaoService)->associarAOcorrencia($incident, 99999, $citizen))
        ->toThrow(AuthorizationException::class);
});

it('faz rollback da atribuição da missão quando a actualização da equipa falha', function () {
    [$coordinator, $team, $incident] = singeMissionFixture();
    Event::listen('eloquent.updating: '.Equipa::class, function (Equipa $model): void {
        if ($model->estado === EstadoEquipa::EM_MISSAO) {
            throw new RuntimeException('Falha simulada ao actualizar equipa.');
        }
    });

    try {
        expect(fn () => (new MissaoService)->criar([
            'ocorrencia_id' => $incident->id,
            'equipa_id' => $team->id,
        ], $coordinator))->toThrow(RuntimeException::class, 'Falha simulada');
    } finally {
        Event::forget('eloquent.updating: '.Equipa::class);
    }

    expect(Missao::query()->count())->toBe(0)
        ->and($team->fresh()->estado)->toBe(EstadoEquipa::DISPONIVEL);
});

it('faz rollback do estado operacional quando o histórico não pode ser escrito', function () {
    $coordinator = singeUserWithProfile('Coordenador');
    $incident = singeOccurrenceFor($coordinator);
    Event::listen('eloquent.creating: '.HistoricoOcorrencia::class, function (): void {
        throw new RuntimeException('Falha simulada no histórico.');
    });

    try {
        expect(fn () => (new OcorrenciaService)->alterarEstado(
            $incident,
            EstadoOcorrencia::EM_AVALIACAO->value,
            $coordinator,
        ))->toThrow(RuntimeException::class, 'Falha simulada');
    } finally {
        Event::forget('eloquent.creating: '.HistoricoOcorrencia::class);
    }

    expect($incident->fresh()->estado)->toBe(EstadoOcorrencia::REGISTADA)
        ->and($incident->historico()->count())->toBe(0);
});

it('armazena evidências em disco privado e impede acesso de utilizadores sem relação', function () {
    Storage::fake('local');
    $owner = singeUserWithProfile('Cidadão');
    $other = singeUserWithProfile('Cidadão');
    $incident = singeOccurrenceFor($owner);
    $evidence = (new EvidenciaService)->criar([
        'ocorrencia_id' => $incident->id,
        'ficheiro' => UploadedFile::fake()->image('prova.png'),
        'descricao' => 'Fotografia da ocorrência.',
    ], $owner);

    Storage::disk('local')->assertExists($evidence->caminho_ficheiro);
    expect(fn () => (new EvidenciaService)->descarregar($evidence, $other))
        ->toThrow(AuthorizationException::class);
    expect((new EvidenciaService)->descarregar($evidence, $owner))
        ->toBeInstanceOf(StreamedResponse::class);
});

it('armazena documentos de identificação em privado e limita o acesso ao titular', function () {
    Storage::fake('local');
    $owner = singeUserWithProfile('Cidadão');
    $other = singeUserWithProfile('Cidadão');
    $service = new IdentificacaoDocumentoService;
    $document = $service->criar([
        'tipo_documento' => 'BI',
        'numero_documento' => 'BI-0001',
        'ficheiro' => UploadedFile::fake()->image('documento.png'),
    ], $owner);

    Storage::disk('local')->assertExists($document->caminho_documento);
    expect(fn () => $service->descarregar($document, $other))
        ->toThrow(AuthorizationException::class);
    expect($service->descarregar($document, $owner))
        ->toBeInstanceOf(StreamedResponse::class);
});

it('substitui o ficheiro de identificação sem deixar o ficheiro anterior acessível', function () {
    Storage::fake('local');
    $owner = singeUserWithProfile('Cidadão');
    $service = new IdentificacaoDocumentoService;
    $document = $service->criar([
        'tipo_documento' => 'BI',
        'numero_documento' => 'BI-REPLACE',
        'ficheiro' => UploadedFile::fake()->image('primeiro.png'),
    ], $owner);
    $caminhoAnterior = $document->caminho_documento;

    $updated = $service->atualizar($document, [
        'ficheiro' => UploadedFile::fake()->image('segundo.png'),
    ], $owner);

    Storage::disk('local')->assertMissing($caminhoAnterior);
    Storage::disk('local')->assertExists($updated->caminho_documento);
});

it('impede que uma notificação altere o destinatário e que outro utilizador a marque como lida', function () {
    $owner = singeUserWithProfile('Cidadão');
    $other = singeUserWithProfile('Cidadão');
    $service = new NotificacaoService;
    $notification = $service->criar([
        'titulo' => 'Actualização',
        'mensagem' => 'Informação da ocorrência.',
        'tipo' => 'ocorrencia',
    ], $owner);

    expect($notification->utilizador_id)->toBe($owner->id)
        ->and($service->listar($other))->toHaveCount(0);

    expect(fn () => $service->criar([
        'utilizador_id' => $other->id,
        'titulo' => 'Manipulada',
        'mensagem' => 'Mensagem.',
        'tipo' => 'ocorrencia',
    ], $owner))->toThrow(AuthorizationException::class);

    $admin = singeUserWithProfile('Administrador');
    $sent = $service->enviarPara([
        'utilizador_id' => $owner->id,
        'titulo' => 'Aviso interno',
        'mensagem' => 'A equipa iniciou deslocação.',
        'tipo' => 'missao',
    ], $other, $admin);
    expect($sent->utilizador_id)->toBe($other->id);

    expect(fn () => $service->marcarComoLida($notification, $other))
        ->toThrow(ModelNotFoundException::class);

    expect($service->marcarComoLida($notification, $owner)->lida)->toBeTrue();
});

it('separa o titular que solicita verificação do verificador e preserva a decisão final', function () {
    $requester = singeUserWithProfile('Cidadão');
    $reviewer = singeUserWithProfile('Administrador');
    $document = DocumentoIdentificacao::query()->create([
        'utilizador_id' => $requester->id,
        'tipo_documento' => 'BI',
        'numero_documento' => 'BI-1001',
    ]);
    $service = new VerificacaoIdentidadeService;
    $verification = $service->criar([
        'documento_identificacao_id' => $document->id,
        'utilizador_solicitante_id' => $reviewer->id,
        'utilizador_verificador_id' => $requester->id,
        'estado' => 'APROVADA',
    ], $requester);

    expect($verification->estado)->toBe('PENDENTE')
        ->and($verification->utilizador_solicitante_id)->toBe($requester->id)
        ->and($verification->utilizador_verificador_id)->toBeNull();

    $verification = $service->iniciarAnalise($verification, $reviewer);
    $decision = $service->aprovar($verification, $reviewer, 'Documento legível e válido.');

    expect($decision->estado)->toBe('APROVADA')
        ->and($decision->utilizador_verificador_id)->toBe($reviewer->id)
        ->and($decision->utilizadorSolicitante->is($requester))->toBeTrue()
        ->and($decision->documentoIdentificacao->utilizador_id)->toBe($requester->id)
        ->and($document->fresh()->estado_verificacao)->toBe('APROVADA');

    expect(fn () => $service->rejeitar($decision, $reviewer, 'Motivo posterior'))
        ->toThrow(InvalidArgumentException::class, 'decisão final');
});

it('não permite que o titular do documento verifique a própria identidade', function () {
    $owner = singeUserWithProfile('Administrador');
    $document = DocumentoIdentificacao::query()->create([
        'utilizador_id' => $owner->id,
        'tipo_documento' => 'BI',
        'numero_documento' => 'BI-SELF',
    ]);
    $verification = (new VerificacaoIdentidadeService)->criar([
        'documento_identificacao_id' => $document->id,
    ], $owner);

    expect(fn () => (new VerificacaoIdentidadeService)->aprovar($verification, $owner))
        ->toThrow(AuthorizationException::class);
});
