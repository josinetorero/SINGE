<?php

use App\Enums\EstadoEquipa;
use App\Enums\EstadoMissao;
use App\Enums\EstadoOcorrencia;
use App\Models\AvaliacaoPrioridade;
use App\Models\Bairro;
use App\Models\DetalheAvaliacao;
use App\Models\Distrito;
use App\Models\DocumentoIdentificacao;
use App\Models\Equipa;
use App\Models\Evidencia;
use App\Models\FatorPrioridade;
use App\Models\HistoricoOcorrencia;
use App\Models\Localizacao;
use App\Models\Missao;
use App\Models\Municipio;
use App\Models\Notificacao;
use App\Models\Ocorrencia;
use App\Models\Perfil;
use App\Models\PostoAdministrativo;
use App\Models\Prioridade;
use App\Models\Provincia;
use App\Models\Quarteirao;
use App\Models\TipoEquipa;
use App\Models\TipoOcorrencia;
use App\Models\User;
use App\Models\ValidacaoOcorrencia;
use App\Models\VerificacaoIdentidade;

it('loads the configured Eloquent relationships across the domain', function () {
    $perfil = Perfil::create([
        'nome' => 'Cidadão',
        'descricao' => 'Utilizador cidadão',
    ]);
    $tipoEquipa = TipoEquipa::create([
        'nome' => 'Resgate',
        'descricao' => 'Equipa de resgate',
        'ativo' => true,
    ]);
    $equipa = Equipa::create([
        'nome' => 'Equipa de Resgate',
        'tipo_equipa_id' => $tipoEquipa->id,
        'estado' => EstadoEquipa::DISPONIVEL,
    ]);

    $provincia = Provincia::create(['nome' => 'Maputo']);
    $distrito = Distrito::create([
        'provincia_id' => $provincia->id,
        'nome' => 'KaMpfumo',
    ]);
    $municipio = Municipio::create([
        'distrito_id' => $distrito->id,
        'nome' => 'Maputo',
    ]);
    $bairro = Bairro::create([
        'municipio_id' => $municipio->id,
        'nome' => 'Polana',
    ]);
    $quarteirao = Quarteirao::create([
        'bairro_id' => $bairro->id,
        'nome' => '12',
    ]);
    $localizacao = Localizacao::create([
        'provincia_id' => $provincia->id,
        'distrito_id' => $distrito->id,
        'municipio_id' => $municipio->id,
        'bairro_id' => $bairro->id,
        'quarteirao_id' => $quarteirao->id,
        'endereco_referencia' => 'Próximo ao mercado',
        'latitude' => -25.9692,
        'longitude' => 32.5732,
    ]);
    $posto = PostoAdministrativo::create([
        'distrito_id' => $distrito->id,
        'nome' => 'Posto Central',
    ]);
    $bairroPosto = Bairro::create([
        'posto_administrativo_id' => $posto->id,
        'nome' => 'Mafalala',
    ]);
    $localizacaoPosto = Localizacao::create([
        'provincia_id' => $provincia->id,
        'distrito_id' => $distrito->id,
        'posto_administrativo_id' => $posto->id,
        'bairro_id' => $bairroPosto->id,
    ]);

    $user = User::factory()->create([
        'perfil_id' => $perfil->id,
        'equipa_id' => $equipa->id,
        'localizacao_id' => $localizacao->id,
    ]);
    $tipoOcorrencia = TipoOcorrencia::create([
        'nome' => 'Inundação',
        'descricao' => 'Cheias e inundações',
        'ativo' => true,
    ]);
    $prioridade = Prioridade::create([
        'nome' => 'Alta',
        'descricao' => 'Prioridade elevada',
        'nivel' => 1,
    ]);
    $ocorrencia = Ocorrencia::create([
        'titulo' => 'Inundação na Polana',
        'descricao' => 'Água acumulada na via',
        'localizacao' => 'Polana, Maputo',
        'localizacao_id' => $localizacao->id,
        'latitude' => -25.9692,
        'longitude' => 32.5732,
        'tipo_ocorrencia_id' => $tipoOcorrencia->id,
        'prioridade_id' => $prioridade->id,
        'utilizador_id' => $user->id,
        'estado' => EstadoOcorrencia::REGISTADA,
    ]);
    $missao = Missao::create([
        'ocorrencia_id' => $ocorrencia->id,
        'equipa_id' => $equipa->id,
        'coordenador_id' => $user->id,
        'estado' => EstadoMissao::ATRIBUIDA,
        'data_atribuicao' => now(),
    ]);
    $evidencia = Evidencia::create([
        'ocorrencia_id' => $ocorrencia->id,
        'utilizador_id' => $user->id,
        'nome_ficheiro' => 'foto.jpg',
        'caminho_ficheiro' => 'private/evidencias/foto.jpg',
        'tipo_mime' => 'image/jpeg',
        'tamanho_bytes' => 1024,
    ]);
    $avaliacao = AvaliacaoPrioridade::create([
        'ocorrencia_id' => $ocorrencia->id,
        'utilizador_id' => $user->id,
        'prioridade_id' => $prioridade->id,
        'pontuacao_total' => 8.5,
    ]);
    $fator = FatorPrioridade::create([
        'nome' => 'Risco para pessoas',
        'peso' => 1.5,
        'ativo' => true,
    ]);
    $detalhe = DetalheAvaliacao::create([
        'avaliacao_prioridade_id' => $avaliacao->id,
        'fator_prioridade_id' => $fator->id,
        'pontuacao' => 8.5,
    ]);
    $historico = HistoricoOcorrencia::create([
        'ocorrencia_id' => $ocorrencia->id,
        'utilizador_id' => $user->id,
        'estado_novo' => 'registada',
    ]);
    $documento = DocumentoIdentificacao::create([
        'utilizador_id' => $user->id,
        'tipo_documento' => 'BI',
        'numero_documento' => 'BI-12345',
        'estado_verificacao' => 'PENDENTE',
    ]);
    $verificacao = VerificacaoIdentidade::create([
        'documento_identificacao_id' => $documento->id,
        'utilizador_solicitante_id' => $user->id,
        'utilizador_verificador_id' => $user->id,
        'estado' => 'EM_ANALISE',
    ]);
    $validacao = ValidacaoOcorrencia::create([
        'ocorrencia_id' => $ocorrencia->id,
        'utilizador_id' => $user->id,
        'estado' => 'EM_VERIFICACAO',
    ]);
    $notificacao = Notificacao::create([
        'utilizador_id' => $user->id,
        'titulo' => 'Ocorrência registada',
        'mensagem' => 'A ocorrência foi registada.',
        'tipo' => 'ocorrencia',
        'ocorrencia_id' => $ocorrencia->id,
        'missao_id' => $missao->id,
    ]);

    $user->load(
        'perfil',
        'equipa.tipoEquipa',
        'localizacao.provincia',
        'localizacao.distrito',
        'localizacao.municipio',
        'localizacao.bairro.quarteiroes',
        'ocorrenciasRegistadas.evidencias',
        'ocorrenciasRegistadas.missoes.equipa',
        'ocorrenciasRegistadas.missoes.coordenador',
        'avaliacoesPrioridade',
        'historicoOcorrencias',
        'documentosIdentificacao.verificacoes',
        'verificacoesIdentidadeSolicitadas',
        'verificacoesIdentidadeAnalisadas',
        'notificacoes',
    );
    $ocorrencia->load(
        'utilizador',
        'tipoOcorrencia',
        'prioridade',
        'localizacaoGeografica',
        'missoes',
        'evidencias',
        'avaliacoesPrioridade',
        'historico',
        'validacoes',
        'notificacoes',
    );
    $avaliacao->load('ocorrencia', 'utilizador', 'prioridade', 'detalhes.fator');
    $missao->load('ocorrencia', 'equipa', 'coordenador', 'notificacoes');
    $documento->load('utilizador', 'verificacoes.utilizadorVerificador');
    $validacao->load('ocorrencia', 'utilizador');
    $notificacao->load('utilizador', 'ocorrencia', 'missao');
    $posto->load('distrito');
    $fator->load('detalhesAvaliacoes');
    $perfil->load('utilizadores');
    $tipoOcorrencia->load('ocorrencias');
    $prioridade->load('ocorrencias', 'avaliacoes');
    $tipoEquipa->load('equipas');
    $equipa->load('tipoEquipa', 'utilizadores', 'missoes');
    $evidencia->load('ocorrencia', 'utilizador');
    $historico->load('ocorrencia', 'utilizador');
    $localizacao->load('utilizadores', 'ocorrencias');
    $bairroPosto->load('postoAdministrativo');
    $localizacaoPosto->load('postoAdministrativo', 'bairro');

    expect($user->perfil->is($perfil))->toBeTrue()
        ->and($user->equipa->is($equipa))->toBeTrue()
        ->and($user->localizacao->is($localizacao))->toBeTrue()
        ->and($user->ocorrenciasRegistadas->sole()->is($ocorrencia))->toBeTrue()
        ->and($user->evidencias->sole()->is($evidencia))->toBeTrue()
        ->and($user->missoesAtribuidas->sole()->is($missao))->toBeTrue()
        ->and($user->avaliacoesPrioridade->sole()->is($avaliacao))->toBeTrue()
        ->and($user->historicoOcorrencias->sole()->is($historico))->toBeTrue()
        ->and($user->documentosIdentificacao->sole()->is($documento))->toBeTrue()
        ->and($user->verificacoesIdentidadeSolicitadas->sole()->is($verificacao))->toBeTrue()
        ->and($user->verificacoesIdentidadeAnalisadas->sole()->is($verificacao))->toBeTrue()
        ->and($user->notificacoes->sole()->is($notificacao))->toBeTrue()
        ->and($perfil->utilizadores->sole()->is($user))->toBeTrue()
        ->and($tipoOcorrencia->ocorrencias->sole()->is($ocorrencia))->toBeTrue()
        ->and($prioridade->ocorrencias->sole()->is($ocorrencia))->toBeTrue()
        ->and($prioridade->avaliacoes->sole()->is($avaliacao))->toBeTrue()
        ->and($equipa->tipoEquipa->is($tipoEquipa))->toBeTrue()
        ->and($evidencia->ocorrencia->is($ocorrencia))->toBeTrue()
        ->and($evidencia->utilizador->is($user))->toBeTrue()
        ->and($historico->ocorrencia->is($ocorrencia))->toBeTrue()
        ->and($historico->utilizador->is($user))->toBeTrue()
        ->and($ocorrencia->utilizador->is($user))->toBeTrue()
        ->and($ocorrencia->tipoOcorrencia->is($tipoOcorrencia))->toBeTrue()
        ->and($ocorrencia->prioridade->is($prioridade))->toBeTrue()
        ->and($ocorrencia->localizacaoGeografica->is($localizacao))->toBeTrue()
        ->and($ocorrencia->missoes->sole()->is($missao))->toBeTrue()
        ->and($ocorrencia->evidencias->sole()->is($evidencia))->toBeTrue()
        ->and($ocorrencia->avaliacoesPrioridade->sole()->is($avaliacao))->toBeTrue()
        ->and($ocorrencia->historico->sole()->is($historico))->toBeTrue()
        ->and($ocorrencia->validacoes->sole()->is($validacao))->toBeTrue()
        ->and($ocorrencia->notificacoes->sole()->is($notificacao))->toBeTrue()
        ->and($avaliacao->detalhes->sole()->is($detalhe))->toBeTrue()
        ->and($detalhe->fator->is($fator))->toBeTrue()
        ->and($missao->equipa->is($equipa))->toBeTrue()
        ->and($missao->coordenador->is($user))->toBeTrue()
        ->and($documento->verificacoes->sole()->is($verificacao))->toBeTrue()
        ->and($documento->utilizador->is($user))->toBeTrue()
        ->and($verificacao->documentoIdentificacao->is($documento))->toBeTrue()
        ->and($verificacao->utilizadorVerificador->is($user))->toBeTrue()
        ->and($verificacao->utilizadorSolicitante->is($user))->toBeTrue()
        ->and($validacao->utilizador->is($user))->toBeTrue()
        ->and($validacao->ocorrencia->is($ocorrencia))->toBeTrue()
        ->and($notificacao->utilizador->is($user))->toBeTrue()
        ->and($notificacao->ocorrencia->is($ocorrencia))->toBeTrue()
        ->and($notificacao->missao->is($missao))->toBeTrue()
        ->and($tipoEquipa->equipas->sole()->is($equipa))->toBeTrue()
        ->and($equipa->utilizadores->sole()->is($user))->toBeTrue()
        ->and($equipa->missoes->sole()->is($missao))->toBeTrue()
        ->and($provincia->distritos->sole()->is($distrito))->toBeTrue()
        ->and($provincia->localizacoes->contains($localizacao))->toBeTrue()
        ->and($distrito->provincia->is($provincia))->toBeTrue()
        ->and($distrito->municipios->sole()->is($municipio))->toBeTrue()
        ->and($distrito->postosAdministrativos->sole()->is($posto))->toBeTrue()
        ->and($municipio->distrito->is($distrito))->toBeTrue()
        ->and($municipio->bairros->sole()->is($bairro))->toBeTrue()
        ->and($posto->distrito->is($distrito))->toBeTrue()
        ->and($posto->bairros->sole()->is($bairroPosto))->toBeTrue()
        ->and($bairro->municipio->is($municipio))->toBeTrue()
        ->and($bairro->quarteiroes->sole()->is($quarteirao))->toBeTrue()
        ->and($quarteirao->bairro->is($bairro))->toBeTrue()
        ->and($localizacao->provincia->is($provincia))->toBeTrue()
        ->and($localizacao->distrito->is($distrito))->toBeTrue()
        ->and($localizacao->municipio->is($municipio))->toBeTrue()
        ->and($localizacao->bairro->is($bairro))->toBeTrue()
        ->and($localizacao->quarteirao->is($quarteirao))->toBeTrue()
        ->and($localizacao->utilizadores->sole()->is($user))->toBeTrue()
        ->and($localizacao->ocorrencias->sole()->is($ocorrencia))->toBeTrue()
        ->and($distrito->localizacoes->contains($localizacao))->toBeTrue()
        ->and($municipio->localizacoes->sole()->is($localizacao))->toBeTrue()
        ->and($bairro->localizacoes->sole()->is($localizacao))->toBeTrue()
        ->and($quarteirao->localizacoes->sole()->is($localizacao))->toBeTrue()
        ->and($bairroPosto->postoAdministrativo->is($posto))->toBeTrue()
        ->and($localizacaoPosto->postoAdministrativo->is($posto))->toBeTrue()
        ->and($localizacaoPosto->bairro->is($bairroPosto))->toBeTrue()
        ->and($missao->ocorrencia->is($ocorrencia))->toBeTrue()
        ->and($missao->notificacoes->sole()->is($notificacao))->toBeTrue()
        ->and($avaliacao->ocorrencia->is($ocorrencia))->toBeTrue()
        ->and($avaliacao->utilizador->is($user))->toBeTrue()
        ->and($avaliacao->prioridade->is($prioridade))->toBeTrue()
        ->and($fator->detalhesAvaliacoes->sole()->is($detalhe))->toBeTrue();
});
