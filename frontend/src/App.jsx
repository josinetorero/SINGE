import React, { Suspense, lazy, useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CitizenLayout } from './components/layout/CitizenLayout';
import { Login } from './pages/public/Login';
import { EmptyState } from './components/common/CommonComponents';
import { notificacoesService } from './services/notificacoesService';
import { ocorrenciasService } from './services/ocorrenciasService';
import { evidenciasService } from './services/evidenciasService';
import { alertasPublicosService } from './services/alertasPublicosService';
import { useTheme } from './contexts/ThemeContext';
import { identidadeService } from './services/identidadeService';

const namedPage = (load, name) => lazy(() => load().then(module => ({ default: module[name] })));
const CidadaoDashboard = namedPage(() => import('./pages/cidadao/CidadaoDashboard'), 'CidadaoDashboard');
const CidadaoPerfil = namedPage(() => import('./pages/cidadao/CidadaoPerfil'), 'CidadaoPerfil');
const CidadaoNotificacoes = namedPage(() => import('./pages/cidadao/CidadaoNotificacoes'), 'CidadaoNotificacoes');
const CidadaoComunicar = namedPage(() => import('./pages/cidadao/CidadaoComunicar'), 'CidadaoComunicar');
const CidadaoMinhasOcorrencias = namedPage(() => import('./pages/cidadao/CidadaoMinhasOcorrencias'), 'CidadaoMinhasOcorrencias');
const CidadaoDetalheOcorrencia = namedPage(() => import('./pages/cidadao/CidadaoDetalheOcorrencia'), 'CidadaoDetalheOcorrencia');
const CidadaoAlertas = namedPage(() => import('./pages/cidadao/CidadaoAlertas'), 'CidadaoAlertas');
const CidadaoInformacoes = namedPage(() => import('./pages/cidadao/CidadaoInformacoes'), 'CidadaoInformacoes');
const CidadaoDetalheAlerta = namedPage(() => import('./pages/cidadao/CidadaoDetalheAlerta'), 'CidadaoDetalheAlerta');
const CidadaoVerificacao = namedPage(() => import('./pages/cidadao/CidadaoVerificacao'), 'CidadaoVerificacao');
const OperadorWorkspace = namedPage(() => import('./pages/operador/OperadorWorkspace'), 'OperadorWorkspace');
const CoordenadorWorkspace = namedPage(() => import('./pages/coordenador/CoordenadorWorkspace'), 'CoordenadorWorkspace');
const AgenteWorkspace = namedPage(() => import('./pages/agente/AgenteWorkspace'), 'AgenteWorkspace');

const EMPTY_OCCURRENCES = {
  items: [],
  pagination: { current_page: 1, per_page: 20, last_page: 1, total: 0 },
  estatisticas: { total: 0, em_acompanhamento: 0, resolvidas: 0 },
};

function MainApp() {
  const { user, loading, authError, logout } = useAuth();
  const { setAccountId } = useTheme();
  const [page, setPage] = useState('dashboard');
  const [notifications, setNotifications] = useState([]);
  const [notificationsLoading, setNotificationsLoading] = useState(false);
  const [notificationsError, setNotificationsError] = useState('');
  const [occurrences, setOccurrences] = useState(EMPTY_OCCURRENCES);
  const [occurrencesLoading, setOccurrencesLoading] = useState(false);
  const [occurrencesError, setOccurrencesError] = useState('');
  const [occurrenceFilters, setOccurrenceFilters] = useState({
    estado: '',
    tipo_ocorrencia_id: '',
    page: 1,
  });
  const [occurrenceTypes, setOccurrenceTypes] = useState([]);
  const [typesError, setTypesError] = useState('');
  const [selectedOccurrenceId, setSelectedOccurrenceId] = useState(null);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [publicAlerts, setPublicAlerts] = useState([]);
  const [publicAlertsLoading, setPublicAlertsLoading] = useState(false);
  const [publicAlertsError, setPublicAlertsError] = useState('');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [selectedAlertLoading, setSelectedAlertLoading] = useState(false);
  const [selectedAlertError, setSelectedAlertError] = useState('');
  const [identityStatus, setIdentityStatus] = useState(null);
  const [identityError, setIdentityError] = useState('');

  useLayoutEffect(() => { setAccountId(user?.id ?? null); }, [user?.id, setAccountId]);

  const refreshPublicAlerts = useCallback(async () => {
    setPublicAlertsLoading(true);
    setPublicAlertsError('');
    try {
      setPublicAlerts(await alertasPublicosService.listar());
    } catch (error) {
      setPublicAlertsError(error.message || 'Não foi possível carregar os alertas publicados.');
    } finally {
      setPublicAlertsLoading(false);
    }
  }, []);

  const refreshNotifications = useCallback(async () => {
    setNotificationsLoading(true);
    setNotificationsError('');
    try {
      setNotifications(await notificacoesService.listar());
    } catch (error) {
      setNotificationsError(error.message || 'Não foi possível carregar as notificações.');
    } finally {
      setNotificationsLoading(false);
    }
  }, []);

  const refreshOccurrences = useCallback(async (filters = occurrenceFilters) => {
    setOccurrencesLoading(true);
    setOccurrencesError('');
    try {
      setOccurrences(await ocorrenciasService.listar(filters));
    } catch (error) {
      setOccurrencesError(error.message || 'Não foi possível carregar as ocorrências.');
    } finally {
      setOccurrencesLoading(false);
    }
  }, [occurrenceFilters]);

  const refreshDetail = useCallback(async (id = selectedOccurrenceId) => {
    if (!id) return;
    setDetailLoading(true);
    setDetailError('');
    try {
      setSelectedOccurrence(await ocorrenciasService.obterPorId(id));
    } catch (error) {
      setSelectedOccurrence(null);
      setDetailError(error.message || 'Não foi possível carregar a ocorrência.');
    } finally {
      setDetailLoading(false);
    }
  }, [selectedOccurrenceId]);

  const markNotificationAsRead = useCallback(async (id) => {
    const updatedNotification = await notificacoesService.marcarComoLida(id);
    setNotifications(current => current.map(notification => (
      notification.id === updatedNotification.id
        ? { ...notification, ...updatedNotification }
        : notification
    )));
  }, []);

  useEffect(() => {
    if (user?.role === 'cidadao') {
      refreshNotifications();
      refreshPublicAlerts();
      identidadeService.minha()
        .then(result => { setIdentityStatus(result); setIdentityError(''); })
        .catch(error => { setIdentityStatus(null); setIdentityError(error.message || 'Estado de identidade indisponível.'); });
      ocorrenciasService.listarTipos()
        .then(setOccurrenceTypes)
        .catch(error => setTypesError(error.message || 'Não foi possível carregar os tipos de ocorrência.'));
    } else {
      setNotifications([]);
      setNotificationsError('');
      setOccurrenceTypes([]);
      setTypesError('');
      setIdentityStatus(null);
      setIdentityError('');
    }
  }, [user?.id, user?.role, refreshNotifications, refreshPublicAlerts]);

  useEffect(() => {
    if (user?.role !== 'cidadao' || page !== 'detalhe-alerta' || !selectedAlert?.id) return;
    let active = true;
    setSelectedAlertLoading(true);
    setSelectedAlertError('');
    alertasPublicosService.obter(selectedAlert.id)
      .then(alert => { if (active) setSelectedAlert(alert); })
      .catch(error => { if (active) setSelectedAlertError(error.message || 'Não foi possível consultar o alerta.'); })
      .finally(() => { if (active) setSelectedAlertLoading(false); });
    return () => { active = false; };
  }, [user?.role, page, selectedAlert?.id]);

  useEffect(() => {
    if (user?.role !== 'cidadao') return;
    if (page === 'dashboard' || page === 'minhas-ocorrencias') {
      refreshOccurrences(page === 'dashboard' ? { page: 1, per_page: 5 } : occurrenceFilters);
    }
  }, [user?.id, user?.role, page, occurrenceFilters, refreshOccurrences]);

  useEffect(() => {
    if (user?.role === 'cidadao' && page === 'detalhe-cidadao' && selectedOccurrenceId) {
      refreshDetail(selectedOccurrenceId);
    }
  }, [user?.role, page, selectedOccurrenceId, refreshDetail]);

  const handleIdentityEligibility = useCallback(eligible => {
    setIdentityStatus(current => ({ ...(current || {}), elegivel: eligible, estado: eligible ? 'APROVADA' : current?.estado }));
  }, []);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-muted">A validar sessão…</div>;
  }

  if (!user) return <Login authError={authError} />;

  const handleLogout = async () => {
    await logout();
    setPage('dashboard');
    setSelectedOccurrenceId(null);
    setSelectedOccurrence(null);
  };

  if (user.role === 'operador') {
    return <Suspense fallback={<div className="min-h-screen grid place-items-center bg-light text-muted dark:bg-dbg dark:text-dmuted">A carregar o painel…</div>}><OperadorWorkspace user={user} onLogout={handleLogout} /></Suspense>;
  }

  if (user.role === 'agente') {
    return <Suspense fallback={<div className="min-h-screen grid place-items-center bg-light text-muted dark:bg-dbg dark:text-dmuted">A carregar o painel…</div>}><AgenteWorkspace user={user} onLogout={handleLogout} /></Suspense>;
  }

  if (user.role === 'coordenador' || user.role === 'administrador') {
    return <Suspense fallback={<div className="min-h-screen grid place-items-center bg-light text-muted dark:bg-dbg dark:text-dmuted">A carregar o painel…</div>}><CoordenadorWorkspace user={user} onLogout={handleLogout} /></Suspense>;
  }

  if (user.role !== 'cidadao') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light dark:bg-dbg p-6">
        <div className="max-w-lg rounded-xl bg-white dark:bg-dcard p-8 text-center shadow">
          <h1 className="text-xl font-bold text-ink dark:text-dink">Perfil autenticado: {user.roleTitle}</h1>
          <p className="mt-3 text-sm text-muted dark:text-dmuted">
            A integração disponível nesta etapa é apenas para o perfil Cidadão. Este perfil não tem acesso ao painel Cidadão.
          </p>
          <button onClick={handleLogout} className="mt-6 rounded-lg bg-brand px-4 py-2 text-white">
            Terminar sessão
          </button>
        </div>
      </div>
    );
  }

  const unreadNotifications = notifications.filter(notification => !notification.lida).length;
  const updateOccurrenceFilters = (changes) => {
    setOccurrenceFilters(current => ({ ...current, ...changes, page: changes.page ?? 1 }));
  };

  const handleOccurrenceCreated = async (occurrence) => {
    setOccurrenceFilters({ estado: '', tipo_ocorrencia_id: '', page: 1 });
    await refreshOccurrences({ page: 1, per_page: 5 });
    setSelectedOccurrenceId(occurrence.id);
  };

  const handleEvidenceUploaded = async () => {
    await refreshDetail(selectedOccurrenceId);
  };

  const downloadEvidence = async (evidence) => {
    const file = await evidenciasService.descarregar(evidence.id);
    const url = URL.createObjectURL(file);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = evidence.nome_ficheiro;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <Suspense fallback={<div className="min-h-screen grid place-items-center bg-light text-muted dark:bg-dbg dark:text-dmuted">A carregar a página…</div>}><CitizenLayout
      user={user}
      page={page}
      setPage={setPage}
      onLogout={handleLogout}
      availablePages={['dashboard', 'comunicar', 'minhas-ocorrencias', 'perfil', 'verificacao', 'notificacoes', 'alertas', 'informacoes', 'detalhe-alerta']}
      notifications={notifications}
      notificationsLoading={notificationsLoading}
      notificationsError={notificationsError}
      onRefreshNotifications={refreshNotifications}
      onMarkNotificationAsRead={markNotificationAsRead}
    >
      {page === 'perfil' ? (
        <CidadaoPerfil user={user} identityStatus={identityStatus} setPage={setPage} />
      ) : page === 'verificacao' ? (
        <CidadaoVerificacao onEligibilityChange={handleIdentityEligibility} />
      ) : page === 'notificacoes' ? (
        <CidadaoNotificacoes
          notifications={notifications}
          loading={notificationsLoading}
          error={notificationsError}
          onRefresh={refreshNotifications}
          onMarkAsRead={markNotificationAsRead}
        />
      ) : page === 'comunicar' ? (
        identityStatus?.elegivel ? (
        <CidadaoComunicar
          user={user}
          types={occurrenceTypes}
          typesError={typesError}
          onCreated={handleOccurrenceCreated}
          setPage={setPage}
        />
        ) : (
          <div className="mx-auto max-w-2xl rounded-xl border border-amber-300 bg-amber-50 p-5 text-amber-950 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100" role="status">
            <h1 className="text-lg font-semibold">Verificação necessária</h1>
            <p className="mt-2 text-sm">{identityError || 'Para comunicar uma ocorrência através da sua conta, submeta um documento e aguarde a aprovação da identidade.'} Em situações urgentes, o Operador pode registar a ocorrência pelo canal institucional.</p>
            <button className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white" onClick={() => setPage('verificacao')}>Verificar identidade</button>
          </div>
        )
      ) : page === 'minhas-ocorrencias' ? (
        <CidadaoMinhasOcorrencias
          ocorrencias={occurrences.items}
          pagination={occurrences.pagination}
          filters={occurrenceFilters}
          types={occurrenceTypes}
          loading={occurrencesLoading}
          error={occurrencesError}
          onRefresh={() => refreshOccurrences()}
          onFiltersChange={updateOccurrenceFilters}
          onSelect={(id) => {
            setSelectedOccurrenceId(id);
            setPage('detalhe-cidadao');
          }}
          setPage={setPage}
        />
      ) : page === 'detalhe-cidadao' ? (
        <CidadaoDetalheOcorrencia
          occurrence={selectedOccurrence}
          loading={detailLoading}
          error={detailError}
          onRefresh={() => refreshDetail()}
          onEvidenceUploaded={handleEvidenceUploaded}
          onDownloadEvidence={downloadEvidence}
          setPage={setPage}
        />
      ) : page === 'dashboard' ? (
        <CidadaoDashboard
          user={user}
          occurrences={occurrences.items}
          statistics={occurrences.estatisticas}
          loading={occurrencesLoading}
          error={occurrencesError}
          unreadNotifications={unreadNotifications}
          identityStatus={identityStatus}
          onRefresh={() => refreshOccurrences({ page: 1, per_page: 5 })}
          onSelect={(id) => {
            setSelectedOccurrenceId(id);
            setPage('detalhe-cidadao');
          }}
          setPage={setPage}
        />
      ) : page === 'alertas' ? (
        <CidadaoAlertas
          alertas={publicAlerts}
          loading={publicAlertsLoading}
          error={publicAlertsError}
          onRefresh={refreshPublicAlerts}
          setPage={setPage}
          setSelectedAlerta={setSelectedAlert}
        />
      ) : page === 'informacoes' ? (
        <CidadaoInformacoes
          alertas={publicAlerts}
          loading={publicAlertsLoading}
          error={publicAlertsError}
          onRefresh={refreshPublicAlerts}
          setPage={setPage}
          setSelectedAlerta={setSelectedAlert}
        />
      ) : page === 'detalhe-alerta' ? (
        <CidadaoDetalheAlerta
          a={selectedAlert}
          loading={selectedAlertLoading}
          error={selectedAlertError}
          setPage={setPage}
        />
      ) : (
        <EmptyState
          icon="Construction"
          title="Funcionalidade indisponível"
          description="A API ainda não disponibiliza esta operação. Nenhum dado simulado está a ser apresentado."
        />
      )}
    </CitizenLayout></Suspense>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <MainApp />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;
