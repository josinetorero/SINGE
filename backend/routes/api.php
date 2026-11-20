<?php

use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\PerfilController;
use App\Http\Controllers\Admin\UtilizadorAdminController;
use App\Http\Controllers\Alertas\AlertaPublicoController;
use App\Http\Controllers\Avaliacoes\AvaliacaoPrioridadeController;
use App\Http\Controllers\Coordenacao\CoordenadorController;
use App\Http\Controllers\Equipas\EquipaController;
use App\Http\Controllers\Evidencias\EvidenciaController;
use App\Http\Controllers\Identificacao\DocumentoIdentificacaoController;
use App\Http\Controllers\Identificacao\VerificacaoIdentidadeController;
use App\Http\Controllers\Localizacoes\LocalizacaoController;
use App\Http\Controllers\Missoes\MissaoController;
use App\Http\Controllers\Notificacoes\NotificacaoController;
use App\Http\Controllers\Ocorrencias\OcorrenciaController;
use App\Http\Controllers\Validacoes\ValidacaoOcorrenciaController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->name('auth.register');
Route::post('/login', [AuthController::class, 'login'])->name('auth.login');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout'])->name('auth.logout');
    Route::get('/me', [AuthController::class, 'user'])->name('auth.me');

    Route::middleware('perfil:Administrador,Coordenador,Operador,Agente,Cidadão')
        ->get('/referencias/geograficas', [LocalizacaoController::class, 'options'])
        ->name('referencias.geograficas');

    Route::middleware('perfil:Cidadão')->patch('/me', [PerfilController::class, 'update'])->name('auth.me.update');

    Route::middleware('perfil:Administrador')->prefix('utilizadores')->name('utilizadores.')->group(function (): void {
        Route::get('/', [UtilizadorAdminController::class, 'index'])->name('index');
        Route::post('/', [UtilizadorAdminController::class, 'store'])->name('store');
        Route::put('/{utilizador}', [UtilizadorAdminController::class, 'update'])->name('update');
        Route::patch('/{utilizador}/desativar', [UtilizadorAdminController::class, 'deactivate'])->name('deactivate');
    });
    Route::middleware('perfil:Administrador')->get('/admin/dashboard', [UtilizadorAdminController::class, 'dashboard'])
        ->name('admin.dashboard');

    // Backward-compatible alias retained for existing clients.
    Route::get('/user', [AuthController::class, 'user'])->name('auth.user');

    Route::middleware('perfil:Administrador,Operador,Coordenador,Agente,Cidadão')->group(function (): void {
        Route::get('/ocorrencias/{id}', [OcorrenciaController::class, 'show'])->name('ocorrencias.show');
        Route::get('/ocorrencias/{ocorrencia}/evidencias', [EvidenciaController::class, 'indexForOccurrence'])
            ->name('ocorrencias.evidencias.index');
        Route::get('/equipas/{equipa}', [EquipaController::class, 'show'])->name('equipas.show');
        Route::get('/equipas/{equipa}/missoes', [MissaoController::class, 'indexForTeam'])->name('equipas.missoes.index');

        Route::post('/evidencias', [EvidenciaController::class, 'store'])->name('evidencias.store');
        Route::get('/evidencias/{evidencia}/download', [EvidenciaController::class, 'download'])->name('evidencias.download');

        Route::post('/identificacao/documentos', [DocumentoIdentificacaoController::class, 'store'])->name('identificacao.documentos.store');
        Route::patch('/identificacao/documentos/{documentoIdentificacao}', [DocumentoIdentificacaoController::class, 'update'])->name('identificacao.documentos.update');
        Route::get('/identificacao/documentos/{documentoIdentificacao}/download', [DocumentoIdentificacaoController::class, 'download'])->name('identificacao.documentos.download');
        Route::post('/identificacao/verificacoes', [VerificacaoIdentidadeController::class, 'store'])->name('identificacao.verificacoes.store');

        Route::get('/notificacoes', [NotificacaoController::class, 'index'])->name('notificacoes.index');
        Route::get('/notificacoes/{id}', [NotificacaoController::class, 'show'])->name('notificacoes.show');
        Route::patch('/notificacoes/{notificacao}/lida', [NotificacaoController::class, 'markAsRead'])->name('notificacoes.read');
    });

    Route::middleware('perfil:Cidadão')->get('/identificacao/minha', [DocumentoIdentificacaoController::class, 'myStatus'])
        ->name('identificacao.mine');

    Route::middleware('perfil:Cidadão')->group(function (): void {
        Route::get('/tipos-ocorrencia', [OcorrenciaController::class, 'indexTypes'])->name('tipos-ocorrencia.index');
        Route::get('/ocorrencias', [OcorrenciaController::class, 'index'])->name('ocorrencias.index');
        Route::post('/ocorrencias', [OcorrenciaController::class, 'store'])->name('ocorrencias.store');
    });

    Route::middleware('perfil:Operador')->prefix('operador')->name('operador.')->group(function (): void {
        Route::get('/ocorrencias', [OcorrenciaController::class, 'indexForOperator'])->name('ocorrencias.index');
        Route::post('/ocorrencias', [OcorrenciaController::class, 'storeForOperator'])->name('ocorrencias.store');
        Route::get('/tipos-ocorrencia', [OcorrenciaController::class, 'indexTypesForOperator'])->name('tipos-ocorrencia.index');
        Route::get('/ocorrencias/{ocorrencia}/sugerir-complementos', [OcorrenciaController::class, 'suggestDescription'])->name('ocorrencias.description-suggestions');
    });

    Route::middleware('perfil:Administrador,Coordenador,Operador,Agente,Cidadão')
        ->prefix('alertas-publicos')->name('alertas-publicos.')->group(function (): void {
            Route::get('/', [AlertaPublicoController::class, 'index'])->name('index');
            Route::get('/{id}', [AlertaPublicoController::class, 'show'])->name('show');
        });

    Route::middleware('perfil:Administrador,Operador,Coordenador')->group(function (): void {
        Route::post('/validacoes/ocorrencias', [ValidacaoOcorrenciaController::class, 'store'])->name('validacoes.ocorrencias.store');
    });

    Route::middleware('perfil:Administrador,Coordenador')->group(function (): void {
        Route::patch('/ocorrencias/{ocorrencia}/estado', [OcorrenciaController::class, 'updateState'])->name('ocorrencias.state');
    });

    Route::middleware('perfil:Administrador,Coordenador,Operador')->group(function (): void {
        Route::patch('/ocorrencias/{ocorrencia}', [OcorrenciaController::class, 'update'])->name('ocorrencias.update');
    });

    Route::middleware('perfil:Administrador,Coordenador,Operador')
        ->post('/avaliacoes-prioridade', [AvaliacaoPrioridadeController::class, 'store'])
        ->name('avaliacoes-prioridade.store');

    Route::middleware('perfil:Administrador,Coordenador,Operador')
        ->post('/avaliacoes-prioridade/sugerir', [AvaliacaoPrioridadeController::class, 'suggest'])
        ->name('avaliacoes-prioridade.suggest');

    Route::middleware('perfil:Administrador,Coordenador')->group(function (): void {
        Route::get('/alertas-publicos/gestao/lista', [AlertaPublicoController::class, 'managementIndex'])->name('alertas-publicos.management.index');
        Route::get('/coordenador/dashboard', [CoordenadorController::class, 'dashboard'])->name('coordenador.dashboard');
        Route::get('/coordenador/tipos-ocorrencia', [CoordenadorController::class, 'types'])->name('coordenador.tipos-ocorrencia.index');
        Route::get('/coordenador/ocorrencias', [CoordenadorController::class, 'occurrences'])->name('coordenador.ocorrencias.index');
        Route::get('/coordenador/ocorrencias/{id}', [CoordenadorController::class, 'show'])->name('coordenador.ocorrencias.show');
        Route::get('/equipas', [EquipaController::class, 'index'])->name('equipas.index');
        Route::get('/tipos-equipa', [EquipaController::class, 'types'])->name('tipos-equipa.index');
        Route::get('/missoes', [MissaoController::class, 'index'])->name('missoes.index');
        Route::get('/avaliacoes-prioridade', [AvaliacaoPrioridadeController::class, 'index'])->name('avaliacoes-prioridade.index');
        Route::get('/fatores-prioridade', [AvaliacaoPrioridadeController::class, 'factors'])->name('fatores-prioridade.index');
        Route::post('/missoes', [MissaoController::class, 'store'])->name('missoes.store');
        Route::patch('/missoes/{missao}/equipa', [MissaoController::class, 'reassignTeam'])->name('missoes.team.update');
        Route::post('/notificacoes/para/{destinatario}', [NotificacaoController::class, 'send'])->name('notificacoes.send');
        Route::post('/alertas-publicos', [AlertaPublicoController::class, 'store'])->name('alertas-publicos.store');
        Route::put('/alertas-publicos/{alertaPublico}', [AlertaPublicoController::class, 'update'])->name('alertas-publicos.update');
        Route::post('/alertas-publicos/{alertaPublico}/publicar', [AlertaPublicoController::class, 'publish'])->name('alertas-publicos.publish');
        Route::post('/alertas-publicos/{alertaPublico}/encerrar', [AlertaPublicoController::class, 'close'])->name('alertas-publicos.close');

    });

    Route::middleware('perfil:Operador')->prefix('identificacao/verificacoes')->name('identificacao.verificacoes.')->group(function (): void {
        Route::get('/', [DocumentoIdentificacaoController::class, 'pendingReviews'])->name('index');
        Route::get('/estatisticas', [DocumentoIdentificacaoController::class, 'reviewStatistics'])->name('statistics');
        Route::get('/historico', [DocumentoIdentificacaoController::class, 'reviewHistory'])->name('history');
        Route::get('/{verificacao}/documento', [DocumentoIdentificacaoController::class, 'downloadForReview'])->name('documento.download');
        Route::post('/{verificacao}/analise', [VerificacaoIdentidadeController::class, 'startReview'])->name('review');
        Route::post('/{verificacao}/aprovar', [VerificacaoIdentidadeController::class, 'approve'])->name('approve');
        Route::post('/{verificacao}/rejeitar', [VerificacaoIdentidadeController::class, 'reject'])->name('reject');
        Route::post('/{verificacao}/correccao', [VerificacaoIdentidadeController::class, 'requestCorrection'])->name('correction');
    });

    Route::middleware('perfil:Administrador,Coordenador,Agente')->get('/missoes/{missao}', [MissaoController::class, 'show'])
        ->name('missoes.show');

    Route::middleware('perfil:Administrador,Coordenador')->group(function (): void {
        Route::post('/localizacoes', [LocalizacaoController::class, 'store'])->name('localizacoes.store');
        Route::patch('/localizacoes/{localizacao}', [LocalizacaoController::class, 'update'])->name('localizacoes.update');
    });

    Route::middleware('perfil:Administrador,Coordenador')->group(function (): void {
        Route::patch('/equipas/{equipa}/disponibilidade', [EquipaController::class, 'updateAvailability'])->name('equipas.availability');
        Route::patch('/equipas/{equipa}/localizacao', [EquipaController::class, 'updateLocation'])->name('equipas.location');
    });

    Route::middleware('perfil:Agente')->group(function (): void {
        Route::patch('/missoes/{missao}/estado', [MissaoController::class, 'updateState'])->name('missoes.state');
        Route::post('/missoes/{missao}/concluir', [MissaoController::class, 'complete'])->name('missoes.complete');
        Route::post('/missoes/{missao}/cancelar', [MissaoController::class, 'cancel'])->name('missoes.cancel');
    });

    Route::middleware('perfil:Agente')->post('/missoes/{missao}/actividades', [MissaoController::class, 'storeActivity'])
        ->name('missoes.activities.store');
});
