import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, StatCard } from '../../components/common/CommonComponents';
import { useToast } from '../../contexts/ToastContext';
import { evidenciasService } from '../../services/evidenciasService';
import { ocorrenciasService } from '../../services/ocorrenciasService';
import { operadorService } from '../../services/operadorService';
import { alertasPublicosService } from '../../services/alertasPublicosService';
import { notificacoesService } from '../../services/notificacoesService';
import { DetalheOcorrencia } from './DetalheOcorrencia';
import { OperadorDashboard } from './OperadorDashboard';
import { OperadorLayout } from './OperadorLayout';
import { OperadorOcorrencias } from './OperadorOcorrencias';
import { RegistarOcorrencia } from './RegistarOcorrencia';
import { GestaoVerificacoesIdentidade } from '../admin/GestaoVerificacoesIdentidade';
import { CidadaoPerfil } from '../cidadao/CidadaoPerfil';
import { identidadeService } from '../../services/identidadeService';

const EMPTY_RESULT = {
  items: [],
  pagination: { current_page: 1, per_page: 15, last_page: 1, total: 0 },
  estatisticas: {
    total: 0,
    pendentes_analise: 0,
    validadas: 0,
    nao_confirmadas: 0,
    rejeitadas: 0,
    duplicadas: 0,
  },
};

const INITIAL_FILTERS = {
  q: '',
  estado: '',
  tipo_ocorrencia_id: '',
  provincia: '',
  distrito: '',
  localizacao: '',
  data_inicio: '',
  data_fim: '',
  ordenar_por: 'created_at',
  ordem: 'desc',
  page: 1,
  per_page: 15,
};

// Estilo por tipo de notificação
const NOTIF_STYLE = {
  alerta:   { icon: 'AlertTriangle', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  sucesso:  { icon: 'CheckCircle2',  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  info:     { icon: 'Info',          cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  erro:     { icon: 'XCircle',       cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  default:  { icon: 'Bell',          cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

// Estilo por severidade de alerta público
const SEVERITY_STYLE = {
  critica:     'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  alta:        'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
  media:       'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
  baixa:       'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  informativa: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
};

function notifStyle(tipo) {
  const key = String(tipo || '').toLowerCase();
  return NOTIF_STYLE[key] || NOTIF_STYLE.default;
}

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? '—'
    : new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium', timeStyle: 'short' }).format(d);
}

export function OperadorWorkspace({ user, onLogout }) {
  const toast = useToast();
  const [page, setPage] = useState('dashboard');
  const [filters, setFilters] = useState(INITIAL_FILTERS);
  const [result, setResult] = useState(EMPTY_RESULT);
  const [listLoading, setListLoading] = useState(false);
  const [listError, setListError] = useState('');
  const [types, setTypes] = useState([]);
  const [typesError, setTypesError] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [occurrence, setOccurrence] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState('');
  const [notificacoes, setNotificacoes] = useState([]);
  const [alertas, setAlertas] = useState([]);
  const [avisosLoading, setAvisosLoading] = useState(false);
  const [avisosError, setAvisosError] = useState('');
  const [identidadeStats, setIdentidadeStats] = useState(null);
  const [identidadeStatsError, setIdentidadeStatsError] = useState('');

  const loadList = useCallback(async (query) => {
    setListLoading(true);
    setListError('');
    try {
      const response = await operadorService.listarOcorrencias(query);
      setResult(response);
    } catch (error) {
      setListError(error.message || 'Não foi possível carregar as ocorrências.');
    } finally {
      setListLoading(false);
    }
  }, []);

  const refreshList = useCallback(() => {
    const query = page === 'dashboard'
      ? { page: 1, per_page: 5, ordenar_por: 'created_at', ordem: 'desc' }
      : filters;
    return loadList(query);
  }, [filters, loadList, page]);

  const refreshDetail = useCallback(async () => {
    if (!selectedId) return;
    setDetailLoading(true);
    setDetailError('');
    try {
      setOccurrence(await ocorrenciasService.obterPorId(selectedId));
    } catch (error) {
      setOccurrence(null);
      setDetailError(error.message || 'Não foi possível carregar os detalhes da ocorrência.');
    } finally {
      setDetailLoading(false);
    }
  }, [selectedId]);

  useEffect(() => {
    if (page === 'dashboard' || page === 'ocorrencias') refreshList();
  }, [page, filters, refreshList]);

  useEffect(() => {
    if (page === 'detalhe-ocorrencia' && selectedId) refreshDetail();
  }, [page, selectedId, refreshDetail]);

  useEffect(() => {
    let active = true;
    operadorService.listarTipos()
      .then(items => { if (active) setTypes(items); })
      .catch(error => { if (active) setTypesError(error.message || 'Não foi possível carregar os tipos de ocorrência.'); });
    return () => { active = false; };
  }, []);

  const loadAvisos = useCallback(async () => {
    setAvisosLoading(true);
    setAvisosError('');
    try {
      const [privateItems, publicItems] = await Promise.all([
        notificacoesService.listar(),
        alertasPublicosService.listar(),
      ]);
      setNotificacoes(privateItems);
      setAlertas(publicItems);
    } catch (error) {
      setAvisosError(error.message || 'Não foi possível carregar os avisos.');
    } finally {
      setAvisosLoading(false);
    }
  }, []);

  useEffect(() => { if (page === 'avisos' || page === 'dashboard') loadAvisos(); }, [page, loadAvisos]);

  useEffect(() => {
    if (page !== 'dashboard') return;
    let active = true;
    setIdentidadeStatsError('');
    identidadeService.estatisticas()
      .then(stats => { if (active) setIdentidadeStats(stats); })
      .catch(error => { if (active) setIdentidadeStatsError(error.message || 'Não foi possível carregar os pedidos de identidade.'); });
    return () => { active = false; };
  }, [page]);

  const markNotificationRead = async id => {
    try {
      await notificacoesService.marcarComoLida(id);
      setNotificacoes(items => items.map(item => item.id === id ? { ...item, lida: true } : item));
    } catch (error) {
      toast.error(error.message || 'Não foi possível marcar a notificação como lida.');
    }
  };

  const updateFilters = useCallback((changes) => {
    setFilters(current => ({ ...current, ...changes }));
  }, []);

  const selectOccurrence = useCallback((id) => {
    setSelectedId(id);
    setOccurrence(null);
    setPage('detalhe-ocorrencia');
  }, []);

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

  const validationSaved = async () => {
    await Promise.all([
      refreshDetail(),
      loadList(page === 'dashboard'
        ? { page: 1, per_page: 5, ordenar_por: 'created_at', ordem: 'desc' }
        : filters),
    ]);
  };

  const occurrenceCreated = async (newOccurrence, evidenceFailed) => {
    await loadList({ ...filters, page: 1 });
    setPage('ocorrencias');
    if (evidenceFailed) {
      toast.error(`Ocorrência #${newOccurrence.id} criada, mas a evidência não foi anexada. Pode fazê-lo pelo detalhe.`);
    } else {
      toast.success(`Ocorrência #${newOccurrence.id} registada e aguarda validação.`);
    }
  };

  const logout = async () => {
    try {
      await onLogout();
    } catch (error) {
      toast.error(error.message || 'Não foi possível terminar a sessão.');
    }
  };

  // ---------- Página de Avisos ----------
  const unreadCount = useMemo(
    () => notificacoes.filter(n => !n.lida).length,
    [notificacoes]
  );

  const renderAvisos = () => (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="Megaphone" size={22} className="text-brand" />
            Alertas e notificações
          </h1>
          <p className="text-sm text-muted dark:text-dmuted mt-1">
            Notificações privadas da sua conta e alertas institucionais publicados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-light dark:bg-dsidebar px-2.5 py-1 text-xs font-semibold text-muted dark:text-dmuted">
            <Icon name="Bell" size={12} />
            {notificacoes.length} privada{notificacoes.length === 1 ? '' : 's'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-light dark:bg-dsidebar px-2.5 py-1 text-xs font-semibold text-muted dark:text-dmuted">
            <Icon name="AlertTriangle" size={12} />
            {alertas.length} pública{alertas.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {avisosError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
        >
          <Icon name="AlertCircle" size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{avisosError}</p>
          <button
            type="button"
            onClick={loadAvisos}
            className="shrink-0 text-xs font-medium underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {avisosLoading ? (
        <Card className="p-5 space-y-4" aria-busy="true">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-9 h-9 rounded-full bg-lblue/40 dark:bg-dblue/20 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 rounded bg-lblue/40 dark:bg-dblue/20" />
                <div className="h-3.5 w-2/3 rounded bg-lblue/40 dark:bg-dblue/20" />
                <div className="h-3 w-full rounded bg-lblue/40 dark:bg-dblue/20" />
              </div>
            </div>
          ))}
        </Card>
      ) : (
        <>
          {/* Notificações privadas */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <Icon name="Bell" size={16} className="text-muted" />
                Notificações privadas
              </h2>
              {unreadCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-2 py-0.5 text-[11px] font-semibold">
                  {unreadCount} nova{unreadCount === 1 ? '' : 's'}
                </span>
              )}
            </div>
            {notificacoes.length === 0 ? (
              <div className="text-center text-sm text-muted dark:text-dmuted py-8 flex flex-col items-center gap-2">
                <Icon name="Inbox" size={28} className="opacity-40" />
                <p>Sem notificações.</p>
              </div>
            ) : (
              <ul className="divide-y divide-bd dark:divide-dborder">
                {notificacoes.map(item => {
                  const style = notifStyle(item.tipo);
                  return (
                    <li
                      key={item.id}
                      className={`flex gap-3 p-3 transition-colors ${!item.lida ? 'bg-lblue/20 dark:bg-dblue/5' : ''}`}
                    >
                      <span className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${style.cls}`}>
                        <Icon name={style.icon} size={16} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-medium text-sm text-ink dark:text-dink truncate">{item.titulo}</p>
                          {!item.lida && (
                            <span className="text-[10px] font-semibold text-brand uppercase tracking-wide">
                              Nova
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted dark:text-dmuted">{item.mensagem}</p>
                        <p className="text-[11px] text-muted dark:text-dmuted mt-1 flex items-center gap-1">
                          <Icon name="Clock" size={10} />
                          {item.tipo} · {formatDate(item.created_at)}
                        </p>
                      </div>
                      {!item.lida && (
                        <button
                          type="button"
                          onClick={() => markNotificationRead(item.id)}
                          className="self-center shrink-0 inline-flex items-center gap-1.5 text-xs font-medium text-brand dark:text-dblue rounded-md px-2 py-1 hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors"
                          aria-label={`Marcar "${item.titulo}" como lida`}
                        >
                          <Icon name="Check" size={13} />
                          <span className="hidden sm:inline">Marcar como lida</span>
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>

          {/* Alertas públicos */}
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <Icon name="AlertTriangle" size={16} className="text-muted" />
                Alertas públicos
              </h2>
              <span className="text-xs font-semibold rounded-full bg-light dark:bg-dsidebar px-2 py-0.5 text-muted dark:text-dmuted">
                {alertas.length}
              </span>
            </div>
            {alertas.length === 0 ? (
              <div className="text-center text-sm text-muted dark:text-dmuted py-8 flex flex-col items-center gap-2">
                <Icon name="ShieldCheck" size={28} className="opacity-40" />
                <p>Sem alertas publicados.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {alertas.map(item => {
                  const sev = SEVERITY_STYLE[String(item.severidade || '').toLowerCase()] || SEVERITY_STYLE.informativa;
                  return (
                    <li
                      key={item.id}
                      className="rounded-xl border border-bd dark:border-dborder p-4 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                          <h3 className="font-semibold text-ink dark:text-dink">{item.titulo}</h3>
                          <p className="text-sm text-muted dark:text-dmuted">
                            {item.tipo_perigo} · {item.area_geografica || 'Área não indicada'}
                          </p>
                        </div>
                        <span className={`text-[11px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${sev}`}>
                          {item.severidade || 'informativa'}
                        </span>
                      </div>
                      <p className="text-sm text-ink dark:text-dink">{item.descricao}</p>
                      <div className="rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 p-2.5 text-sm text-amber-900 dark:text-amber-100">
                        <strong>Recomendações:</strong> {item.recomendacoes}
                      </div>
                      <p className="text-xs text-muted dark:text-dmuted flex items-center gap-1.5">
                        <Icon name="Clock" size={11} />
                        Fonte: {item.fonte} · Válido até {formatDate(item.valido_ate)}
                      </p>
                    </li>
                  );
                })}
              </ul>
            )}
          </Card>
        </>
      )}
    </div>
  );

  return (
    <OperadorLayout user={user} page={page} setPage={setPage} onLogout={logout}>
      {page === 'perfil' ? (
        <CidadaoPerfil user={user} showIdentity={false} />
      ) : page === 'identidade' ? (
        <GestaoVerificacoesIdentidade />
      ) : page === 'avisos' ? (
        renderAvisos()
      ) : page === 'dashboard' ? (
        <OperadorDashboard
          user={user}
          ocorrencias={result.items}
          estatisticas={result.estatisticas}
          identidadeStats={identidadeStats}
          identidadeStatsError={identidadeStatsError}
          loading={listLoading}
          error={listError}
          onRefresh={refreshList}
          onSelect={selectOccurrence}
          setPage={setPage}
        />
      ) : page === 'ocorrencias' ? (
        <div className="space-y-3">
          {typesError && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
            >
              <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0" />
              <p>{typesError}</p>
            </div>
          )}
          <OperadorOcorrencias
            estatisticas={result.estatisticas}
            ocorrencias={result.items}
            pagination={result.pagination}
            filters={filters}
            types={types}
            loading={listLoading}
            error={listError}
            onRefresh={refreshList}
            onFiltersChange={updateFilters}
            onSelect={selectOccurrence}
          />
        </div>
      ) : page === 'registar' ? (
        <RegistarOcorrencia types={types} onCreated={occurrenceCreated} setPage={setPage} />
      ) : (
        <DetalheOcorrencia
          o={occurrence}
          loading={detailLoading}
          error={detailError}
          onRefresh={refreshDetail}
          onValidationSaved={validationSaved}
          onDownloadEvidence={downloadEvidence}
          setPage={setPage}
        />
      )}
    </OperadorLayout>
  );
}

export default OperadorWorkspace;