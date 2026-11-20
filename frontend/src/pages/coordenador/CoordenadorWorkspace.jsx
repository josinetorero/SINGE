import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { coordenadorService } from '../../services/coordenadorService';
import { alertasPublicosService } from '../../services/alertasPublicosService';
import { ValidationError } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Button, StatCard } from '../../components/common/CommonComponents';
import Icon from '../../components/common/Icon';
import { CidadaoPerfil } from '../cidadao/CidadaoPerfil';
import { GestaoUtilizadores } from '../admin/GestaoUtilizadores';
import { AuthenticatedLayout } from '../../components/layout/AuthenticatedLayout';
import { adminService } from '../../services/adminService';
import { AdminDashboardReal } from '../admin/AdminDashboardReal';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const TABS = [
  ['dashboard', 'Painel geral'],
  ['ocorrencias', 'Ocorrências'],
  ['prioridades', 'Avaliar prioridades'],
  ['equipas', 'Equipas'],
  ['missoes', 'Missões'],
  ['alertas', 'Alertas públicos'],
  ['perfil', 'Meu perfil'],
];
const MISSION_STATES = ['atribuida', 'em_deslocacao', 'em_execucao', 'concluida', 'cancelada'];
const EMPTY_DASHBOARD = { ocorrencias: {}, equipas: {}, missoes: {}, recentes: [], actividade_recente: [] };
const EMPTY_FILTERS = { q: '', estado: '', tipo_ocorrencia_id: '', prioridade_id: '', page: 1, per_page: 20 };

// ---------- Componentes auxiliares ----------
function Card({ children, className = '', ...rest }) {
  return (
    <section
      className={`rounded-xl border border-bd bg-white p-4 shadow-sm dark:border-dborder dark:bg-dcard ${className}`}
      {...rest}
    >
      {children}
    </section>
  );
}

function PageTitle({ title, description, children }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="text-xl font-bold text-ink dark:text-dink">{title}</h2>
        {description && (
          <p className="mt-1 text-sm text-muted dark:text-dmuted">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

function ErrorMessage({ error, retry }) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
    >
      <Icon name="AlertCircle" size={18} className="mt-0.5 shrink-0" />
      <p className="flex-1">{error}</p>
      {retry && (
        <button
          type="button"
          onClick={retry}
          className="shrink-0 text-xs font-medium underline hover:no-underline"
        >
          Tentar novamente
        </button>
      )}
    </div>
  );
}

function Table({ headers, children, empty }) {
  const isEmpty = React.Children.count(children) === 0;
  return (
    <div className="overflow-x-auto rounded-lg border border-bd dark:border-dborder">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-light text-xs uppercase tracking-wide text-muted dark:bg-dsidebar/50 dark:text-dmuted">
          <tr>
            {headers.map((header, i) => (
              <th className="px-3 py-2.5 font-semibold" key={header || i}>
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-bd dark:divide-dborder">
          {isEmpty ? (
            <tr>
              <td colSpan={headers.length} className="px-3 py-8 text-center text-sm text-muted dark:text-dmuted">
                {empty || 'Sem registos.'}
              </td>
            </tr>
          ) : (
            children
          )}
        </tbody>
      </table>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block space-y-1 text-sm">
      <span className="font-medium text-ink dark:text-dink">{label}</span>
      {children}
    </label>
  );
}

const input =
  'w-full rounded-lg border border-bd bg-white px-3 py-2 text-sm text-ink dark:border-dborder dark:bg-dbg dark:text-dink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand transition-colors';

const showDate = value => (value ? new Date(value).toLocaleString() : '—');

// Badge de estado da missão
function MissionStateBadge({ state }) {
  const map = {
    atribuida:     'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    em_deslocacao: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    em_execucao:   'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300',
    concluida:     'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    cancelada:     'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[state] || 'bg-slate-100 text-slate-700'}`}>
      {state}
    </span>
  );
}

// Badge de severidade de alerta
function SeverityBadge({ value }) {
  const map = {
    critica:     'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300',
    alta:        'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300',
    media:       'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    baixa:       'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
    informativa: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${map[value] || map.informativa}`}>
      {value}
    </span>
  );
}

// Cor da prioridade
function priorityTone(label = '') {
  const l = label.toLowerCase();
  if (l.includes('crít') || l.includes('crit')) return { cls: 'text-red-700 bg-red-100 dark:bg-red-950/40 dark:text-red-300', bar: 'bg-red-500' };
  if (l.includes('alt')) return { cls: 'text-orange-700 bg-orange-100 dark:bg-orange-950/40 dark:text-orange-300', bar: 'bg-orange-500' };
  if (l.includes('méd') || l.includes('med')) return { cls: 'text-amber-700 bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300', bar: 'bg-amber-500' };
  return { cls: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300', bar: 'bg-emerald-500' };
}

// ---------- Componente principal ----------
export function CoordenadorWorkspace({ user, onLogout }) {
  const tabs = user.role === 'administrador'
    ? [...TABS.filter(([id]) => !['prioridades', 'perfil'].includes(id)), ['utilizadores', 'Gestão de utilizadores'], ['perfil', 'Meu perfil']]
    : TABS;
  const toast = useToast();
  const [tab, setTab] = useState('dashboard');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dashboard, setDashboard] = useState(EMPTY_DASHBOARD);
  const [adminDashboard, setAdminDashboard] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const [occurrences, setOccurrences] = useState({ items: [], pagination: {} });
  const [occurrenceTypes, setOccurrenceTypes] = useState([]);
  const [teamTypes, setTeamTypes] = useState([]);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);
  const [factors, setFactors] = useState([]);
  const [scores, setScores] = useState({});
  const [evaluations, setEvaluations] = useState([]);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [teams, setTeams] = useState([]);
  const [teamFilters, setTeamFilters] = useState({ q: '', estado: '', tipo_equipa_id: '' });
  const teamFiltersRef = useRef(teamFilters);
  teamFiltersRef.current = teamFilters;
  const [missions, setMissions] = useState([]);
  const [missionFilters, setMissionFilters] = useState({ q: '', estado: '', equipa_id: '', ocorrencia_id: '' });
  const missionFiltersRef = useRef(missionFilters);
  missionFiltersRef.current = missionFilters;
  const [selectedMission, setSelectedMission] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [alertForm, setAlertForm] = useState(null);

  const loadDashboard = useCallback(async () => {
    if (user.role === 'administrador') setAdminDashboard(await adminService.dashboard());
    else setDashboard(await coordenadorService.dashboard());
  }, [user.role]);
  const loadOccurrences = useCallback(async (nextFilters = filtersRef.current) => {
    setOccurrences(await coordenadorService.ocorrencias(nextFilters));
  }, []);
  const loadTeams = useCallback(async (next = teamFiltersRef.current) => setTeams(await coordenadorService.teams(next)), []);
  const loadMissions = useCallback(async (next = missionFiltersRef.current) => setMissions(await coordenadorService.missions(next)), []);
  const loadAlerts = useCallback(async () => setAlertas(await alertasPublicosService.listarGestao()), []);

  const loadActiveTab = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      if (tab === 'dashboard') await loadDashboard();
      if (tab === 'ocorrencias') await loadOccurrences();
      if (tab === 'ocorrencias') setOccurrenceTypes(await coordenadorService.tiposOcorrencia());
      if (tab === 'prioridades') {
        const [result, factorList] = await Promise.all([
          coordenadorService.ocorrencias({ page: 1, per_page: 100, sem_prioridade: 1 }),
          coordenadorService.factors(),
        ]);
        setOccurrences(result);
        setFactors(factorList);
      }
      if (tab === 'equipas') await loadTeams();
      if (tab === 'equipas') setTeamTypes(await coordenadorService.tiposEquipa());
      if (tab === 'missoes') {
        await Promise.all([
          loadMissions(),
          loadTeams(),
          coordenadorService.tiposEquipa().then(setTeamTypes),
          coordenadorService.ocorrencias({ page: 1, per_page: 100 }).then(setOccurrences),
          coordenadorService.tiposOcorrencia().then(setOccurrenceTypes),
        ]);
      }
      if (tab === 'alertas') await loadAlerts();
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar os dados.');
    } finally {
      setBusy(false);
    }
  }, [tab, loadDashboard, loadOccurrences, loadTeams, loadMissions, loadAlerts]);

  useEffect(() => { loadActiveTab(); }, [loadActiveTab]);

  useEffect(() => { if (tab !== 'equipas') return; const timer = setTimeout(() => loadTeams(teamFilters), 250); return () => clearTimeout(timer); }, [tab, teamFilters.q, teamFilters.estado, teamFilters.tipo_equipa_id, loadTeams]);
  useEffect(() => { if (tab !== 'missoes') return; const timer = setTimeout(() => loadMissions(missionFilters), 250); return () => clearTimeout(timer); }, [tab, missionFilters.q, missionFilters.estado, missionFilters.equipa_id, missionFilters.ocorrencia_id, loadMissions]);

  useEffect(() => {
    if (tab !== 'ocorrencias') return;
    const timer = setTimeout(() => loadOccurrences({ ...filters, page: 1 }), 250);
    return () => clearTimeout(timer);
  }, [tab, filters.q, filters.estado, filters.tipo_ocorrencia_id, filters.prioridade_id, loadOccurrences]);

  const selectOccurrence = async item => {
    setBusy(true);
    setError('');
    try {
      const details = await coordenadorService.ocorrencia(item.id);
      setSelectedOccurrence(details);
      setAiSuggestion(null);
      setEvaluations(details.avaliacoes || []);
      setScores(Object.fromEntries(factors.map(factor => [factor.id, 0])));
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível consultar a ocorrência.');
    } finally {
      setBusy(false);
    }
  };

  const requestPrioritySuggestion = async () => {
    if (!selectedOccurrence) return;
    setBusy(true);
    setError('');
    setAiSuggestion(null);
    try {
      const result = await coordenadorService.suggestPriority(selectedOccurrence.id);
      setAiSuggestion(result);
      if (!result.disponivel) {
        setError(result.aviso || 'Não foi possível obter sugestões da IA.');
        return;
      }
      setScores(previous => {
        const next = { ...previous };
        result.sugestoes.forEach(suggestion => {
          if (suggestion.dados_suficientes && suggestion.pontuacao !== null) {
            next[suggestion.fator_prioridade_id] = suggestion.pontuacao;
          }
        });
        return next;
      });
      toast.success('Sugestões da IA recebidas. Revê as pontuações antes de guardar.');
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível solicitar sugestões à IA.');
    } finally {
      setBusy(false);
    }
  };

  const submitEvaluation = async event => {
    event.preventDefault();
    if (!selectedOccurrence) return;
    setBusy(true);
    setError('');
    try {
      const result = await coordenadorService.evaluate({
        ocorrencia_id: selectedOccurrence.id,
        factores: factors.map(factor => ({
          fator_prioridade_id: factor.id,
          pontuacao: Number(scores[factor.id] ?? 0),
        })),
      });
      toast.success(`Avaliação guardada. Prioridade atribuída: ${result.prioridade || result.prioridade_id}.`);
      setSelectedOccurrence(null);
      await Promise.all([loadOccurrences(), loadDashboard()]);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível guardar a avaliação.');
    } finally {
      setBusy(false);
    }
  };

  const openMission = async id => {
    setBusy(true);
    setError('');
    try {
      setSelectedMission(await coordenadorService.mission(id));
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível consultar a missão.');
    } finally {
      setBusy(false);
    }
  };

  const reassignMission = async equipaId => {
    if (!selectedMission || !equipaId) return;
    setBusy(true);
    setError('');
    try {
      await coordenadorService.reassignMission(selectedMission.id, Number(equipaId));
      await Promise.all([openMission(selectedMission.id), loadMissions(), loadTeams()]);
      toast.success('Equipa da missão actualizada.');
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível reatribuir a equipa.');
    } finally {
      setBusy(false);
    }
  };

  const actOnMission = async action => {
    if (!selectedMission) return;
    setBusy(true);
    setError('');
    try {
      if (action === 'cancelar') await coordenadorService.cancelMission(selectedMission.id);
      else if (action.startsWith('estado:')) await coordenadorService.updateMissionState(selectedMission.id, action.slice(7));
      await openMission(selectedMission.id);
      await loadMissions();
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível actualizar a missão.');
    } finally {
      setBusy(false);
    }
  };

  const submitMission = async event => {
    event.preventDefault();
    const formElement = event.currentTarget;
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.ocorrencia_id = Number(payload.ocorrencia_id);
    payload.equipa_id = Number(payload.equipa_id);
    setBusy(true);
    setError('');
    try {
      const created = await coordenadorService.createMission(payload);
      toast.success('Missão criada e equipa atribuída.');
      formElement.reset();
      await Promise.all([openMission(created.id), loadMissions(), loadDashboard(), loadTeams()]);
    } catch (requestError) {
      setError(requestError instanceof ValidationError
        ? Object.values(requestError.errors).join(' ')
        : requestError.message || 'Não foi possível criar a missão.');
    } finally {
      setBusy(false);
    }
  };

  const saveAlert = async event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());
    payload.localizacao_id = payload.localizacao_id ? Number(payload.localizacao_id) : null;
    setBusy(true);
    setError('');
    try {
      const saved = alertForm.id
        ? await alertasPublicosService.actualizar(alertForm.id, payload)
        : await alertasPublicosService.criar(payload);
      setAlertForm(null);
      await loadAlerts();
      toast.success(alertForm.id ? `Alerta #${saved.id} actualizado.` : `Alerta #${saved.id} guardado como rascunho.`);
    } catch (requestError) {
      setError(requestError instanceof ValidationError
        ? Object.values(requestError.errors).join(' ')
        : requestError.message || 'Não foi possível guardar o alerta.');
    } finally {
      setBusy(false);
    }
  };

  const publishAlert = async id => {
    try {
      await alertasPublicosService.publicar(id);
      await loadAlerts();
      toast.success('Alerta publicado.');
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível publicar o alerta.');
    }
  };
  const closeAlert = async id => {
    try {
      await alertasPublicosService.encerrar(id);
      await loadAlerts();
      toast.success('Alerta encerrado.');
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível encerrar o alerta.');
    }
  };

  const totalScore = useMemo(() => factors.reduce(
    (total, factor) => total + Number(scores[factor.id] ?? 0) * Number(factor.peso),
    0,
  ), [factors, scores]);
  const priorityPreview = totalScore < 2.5 ? 'Baixa' : totalScore < 5 ? 'Média' : totalScore < 7.5 ? 'Alta' : 'Crítica';
  const previewTone = priorityTone(priorityPreview);

  // ---------- Renderizadores ----------
  const renderDashboard = () => (
    user.role === 'administrador'
      ? <AdminDashboardReal data={adminDashboard} loading={busy} error={error} onRefresh={loadActiveTab} onManageUsers={() => setTab('utilizadores')} />
      : (
        <div className="space-y-4">
          <PageTitle title="Centro de Coordenação" description="Indicadores agregados e recentes calculados pelo backend." />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon="FileText" label="Número de ocorrências" value={dashboard.ocorrencias?.total ?? 0} tone="brand" />
            <StatCard icon="Users" label="Equipas existentes" value={dashboard.equipas?.total ?? 0} tone="green" />
            <StatCard icon="Target" label="Número de missões" value={dashboard.missoes?.total ?? 0} tone="orange" />
            <StatCard icon="AlertTriangle" label="Alertas publicados" value={dashboard.alertas_publicados ?? dashboard.alertas_activos ?? 0} tone="red" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <h3 className="mb-3 font-semibold flex items-center gap-2 text-ink dark:text-dink">
                <Icon name="BarChart3" size={16} className="text-muted" />
                Ocorrências por prioridade
              </h3>
              <div className="h-56">
                {(dashboard.ocorrencias?.por_prioridade || []).some(item => Number(item.total))
                  ? <ResponsiveContainer width="100%" height="100%"><BarChart data={dashboard.ocorrencias.por_prioridade}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="nome" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="#dc2626" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
                  : <EmptyChart label="Sem avaliações de prioridade." />}
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 font-semibold flex items-center gap-2 text-ink dark:text-dink">
                <Icon name="BarChart3" size={16} className="text-muted" />
                Ocorrências por tipo
              </h3>
              <div className="h-56">
                {(dashboard.ocorrencias?.por_tipo || []).some(item => Number(item.total))
                  ? <ResponsiveContainer width="100%" height="100%"><BarChart data={dashboard.ocorrencias.por_tipo.filter(item => Number(item.total))}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="nome" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="#0f766e" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
                  : <EmptyChart label="Sem ocorrências." />}
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 font-semibold flex items-center gap-2 text-ink dark:text-dink">
                <Icon name="BarChart3" size={16} className="text-muted" />
                Missões por estado
              </h3>
              <div className="h-56">
                {(dashboard.missoes_por_estado || []).length
                  ? <ResponsiveContainer width="100%" height="100%"><BarChart data={dashboard.missoes_por_estado}><CartesianGrid strokeDasharray="3 3" opacity={0.2} /><XAxis dataKey="estado" tick={{ fontSize: 10 }} /><YAxis allowDecimals={false} /><Tooltip /><Bar dataKey="total" fill="#7c3aed" radius={[5, 5, 0, 0]} /></BarChart></ResponsiveContainer>
                  : <EmptyChart label="Ainda não existem missões." />}
              </div>
            </Card>
            <Card>
              <h3 className="mb-3 font-semibold flex items-center gap-2 text-ink dark:text-dink">
                <Icon name="MapPin" size={16} className="text-muted" />
                Ocorrências por localização
              </h3>
              {(dashboard.mapa_ocorrencias || []).some(item => item.latitude != null && item.longitude != null)
                ? <MozambiqueMap ocorrencias={dashboard.mapa_ocorrencias} height={300} onSelectOccurrence={item => { setTab('ocorrencias'); selectOccurrence({ id: item.id }); }} />
                : <EmptyChart label="Não existem ocorrências com coordenadas verificadas." />}
            </Card>
          </div>

          <Card>
            <h3 className="mb-3 font-semibold flex items-center gap-2 text-ink dark:text-dink">
              <Icon name="Clock" size={16} className="text-muted" />
              Ocorrências recentes
            </h3>
            <Table
              headers={['ID', 'Título', 'Tipo', 'Estado', 'Prioridade', 'Data']}
              empty="Sem ocorrências recentes."
            >
              {(dashboard.recentes || []).map(item => (
                <tr key={item.id} className="hover:bg-light/50 dark:hover:bg-dsidebar/30 transition-colors">
                  <td className="px-3 py-2 font-mono text-xs">#{item.id}</td>
                  <td className="px-3 py-2 font-medium">{item.titulo}</td>
                  <td className="px-3 py-2">{item.tipo}</td>
                  <td className="px-3 py-2">{item.estado}</td>
                  <td className="px-3 py-2">{item.prioridade || '—'}</td>
                  <td className="px-3 py-2 text-muted dark:text-dmuted">{showDate(item.created_at)}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>
      )
  );

  const renderOccurrences = () => (
    <div className="space-y-4">
      <PageTitle title="Monitorização de ocorrências" description="Pesquisa e filtros aplicados no servidor." />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon="FileText" label="Ocorrências registadas" value={dashboard.ocorrencias?.total ?? occurrences.pagination?.total ?? 0} tone="brand" />
        <StatCard icon="CheckCircle" label="Resolvidas" value={dashboard.ocorrencias?.por_estado?.resolvida ?? 0} tone="green" />
        <StatCard icon="XCircle" label="Canceladas" value={dashboard.ocorrencias?.por_estado?.cancelada ?? 0} tone="red" />
      </div>
      <Card className="grid gap-3 md:grid-cols-3">
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className={`${input} pl-8`} placeholder="Pesquisar por título ou localização" value={filters.q} onChange={event => setFilters({ ...filters, q: event.target.value, page: 1 })} />
        </div>
        <select className={input} value={filters.estado} onChange={event => setFilters({ ...filters, estado: event.target.value, page: 1 })}>
          <option value="">Todos os estados</option>
          {['registada', 'em_avaliacao', 'em_atendimento', 'resolvida', 'cancelada'].map(state => <option key={state} value={state}>{state}</option>)}
        </select>
        <select className={input} value={filters.tipo_ocorrencia_id} onChange={event => setFilters({ ...filters, tipo_ocorrencia_id: event.target.value, page: 1 })}>
          <option value="">Todos os tipos</option>
          {occurrenceTypes.map(type => <option key={type.id} value={type.id}>{type.nome}</option>)}
        </select>
        <select className={input} value={filters.prioridade_id} onChange={event => setFilters({ ...filters, prioridade_id: event.target.value, page: 1 })}>
          <option value="">Todas as prioridades</option>
          {(dashboard.ocorrencias?.por_prioridade || []).map(item => <option key={item.id} value={item.id}>{item.nome}</option>)}
        </select>
      </Card>
      <Card>
        <Table headers={['ID', 'Título', 'Tipo', 'Localização', 'Estado', 'Prioridade', '']} empty="Nenhuma ocorrência encontrada.">
          {occurrences.items.map(item => (
            <tr key={item.id} className="hover:bg-light/50 dark:hover:bg-dsidebar/30 transition-colors">
              <td className="px-3 py-2 font-mono text-xs">#{item.id}</td>
              <td className="px-3 py-2 font-medium">{item.titulo}</td>
              <td className="px-3 py-2">{item.tipo}</td>
              <td className="px-3 py-2 text-muted dark:text-dmuted">{[item.distrito, item.provincia].filter(Boolean).join(', ') || item.localizacao}</td>
              <td className="px-3 py-2">{item.estado}</td>
              <td className="px-3 py-2">{item.prioridade || '—'}</td>
              <td className="px-3 py-2 text-right">
                <button aria-label={`Ver ocorrência ${item.id}`} className="rounded-md p-1.5 text-brand hover:bg-light dark:hover:bg-dsidebar transition-colors" onClick={() => selectOccurrence(item)}>
                  <Icon name="Eye" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-muted dark:text-dmuted">Total: {occurrences.pagination?.total || 0}</span>
          <div className="flex gap-2">
            <button disabled={(occurrences.pagination?.current_page || 1) <= 1} className="rounded-lg border border-bd dark:border-dborder px-3 py-1.5 disabled:opacity-40 hover:bg-light dark:hover:bg-dsidebar transition-colors" onClick={() => { const page = filters.page - 1; const next = { ...filters, page }; setFilters(next); loadOccurrences(next); }}>Anterior</button>
            <button disabled={(occurrences.pagination?.current_page || 1) >= (occurrences.pagination?.last_page || 1)} className="rounded-lg border border-bd dark:border-dborder px-3 py-1.5 disabled:opacity-40 hover:bg-light dark:hover:bg-dsidebar transition-colors" onClick={() => { const page = filters.page + 1; const next = { ...filters, page }; setFilters(next); loadOccurrences(next); }}>Seguinte</button>
          </div>
        </div>
      </Card>
      {selectedOccurrence && <OccurrenceDetail occurrence={selectedOccurrence} onClose={() => setSelectedOccurrence(null)} />}
    </div>
  );

  const renderPriorities = () => (
    <div className="space-y-4">
      <PageTitle title="Avaliação formal de prioridade" description="Quatro factores oficiais, pesos e classificação calculados pelo sistema." />
      <ErrorMessage error={error} />
      {selectedOccurrence ? (
        <Card>
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="font-semibold text-ink dark:text-dink">{selectedOccurrence.titulo}</h3>
              <p className="text-sm text-muted dark:text-dmuted">{selectedOccurrence.tipo} · {selectedOccurrence.localizacao}</p>
            </div>
            <button className="text-brand underline text-sm shrink-0" onClick={() => setSelectedOccurrence(null)}>Fechar</button>
          </div>

          <div className="mb-4 rounded-lg bg-light p-3 dark:bg-dsidebar">
            <h4 className="text-sm font-semibold text-ink dark:text-dink">Descrição da ocorrência</h4>
            <p className="mt-1 whitespace-pre-wrap text-sm text-ink dark:text-dink">
              {selectedOccurrence.descricao || 'Sem descrição registada.'}
            </p>
          </div>

          {selectedOccurrence.validacoes?.map(validation => (
            <p key={validation.id} className="mb-1.5 text-sm text-muted dark:text-dmuted">
              <strong className="text-ink dark:text-dink">Validação {validation.estado}</strong> · {validation.responsavel} · {validation.motivo || validation.observacoes || '—'}
            </p>
          ))}

          <form className="space-y-4 mt-4" onSubmit={submitEvaluation}>
            {/* Painel de IA */}
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4 dark:border-orange-900 dark:bg-orange-950/30">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 flex items-center justify-center shrink-0">
                    <Icon name="Sparkles" size={16} />
                  </span>
                  <div>
                    <h4 className="font-semibold text-ink dark:text-dink">Assistência de Inteligência Artificial</h4>
                    <p className="text-xs text-muted dark:text-dmuted">A IA sugere pontuações. A decisão final pertence ao avaliador.</p>
                  </div>
                </div>
                <button type="button" disabled={busy} onClick={requestPrioritySuggestion} className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm text-white disabled:opacity-50 hover:bg-brand/90 transition-colors">
                  <Icon name="Sparkles" size={14} />
                  Sugerir prioridade com IA
                </button>
              </div>
              {aiSuggestion?.aviso && <p className="mt-2 text-sm text-muted dark:text-dmuted">{aiSuggestion.aviso}</p>}
              {aiSuggestion?.fatores_sem_informacao?.length > 0 && (
                <p className="mt-2 text-sm text-orange-800 dark:text-orange-300">
                  <strong>Informação insuficiente:</strong> {aiSuggestion.fatores_sem_informacao.join(', ')}. Estes factores precisam de avaliação humana.
                </p>
              )}
            </div>

            {/* Factores */}
            <div className="space-y-4">
              {factors.map(factor => {
                const suggestion = aiSuggestion?.sugestoes?.find(item => item.fator_prioridade_id === factor.id);
                return (
                  <div key={factor.id} className="rounded-lg border border-bd dark:border-dborder p-3">
                    <Field label={`${factor.nome} (${Number(factor.peso) * 100}%)`}>
                      <div className="flex items-center gap-3">
                        <input className={`${input} max-w-32`} type="number" min="0" max="10" step="0.1" value={scores[factor.id] ?? 0} onChange={event => setScores({ ...scores, [factor.id]: event.target.value })} />
                        <div className="flex-1 h-2 rounded-full bg-light dark:bg-dsidebar overflow-hidden">
                          <div className="h-full bg-brand transition-all" style={{ width: `${Math.min(100, Number(scores[factor.id] ?? 0) * 10)}%` }} />
                        </div>
                      </div>
                      <span className="text-xs text-muted dark:text-dmuted">{factor.descricao}</span>
                      {suggestion && (
                        <div className="mt-2 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 p-2.5 text-xs">
                          <p className="font-semibold text-orange-800 dark:text-orange-300">
                            Sugestão da IA: {suggestion.pontuacao === null ? 'Sem pontuação — informação insuficiente.' : `${suggestion.pontuacao}/10`}
                          </p>
                          <p className="mt-1 text-orange-900 dark:text-orange-200">{suggestion.justificacao}</p>
                        </div>
                      )}
                    </Field>
                  </div>
                );
              })}
            </div>

            {/* Preview da prioridade */}
            <div className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-3 ${previewTone.cls}`}>
              <div>
                <p className="text-xs uppercase tracking-wide font-semibold opacity-80">Pontuação ponderada</p>
                <p className="text-2xl font-bold">{totalScore.toFixed(2)}<span className="text-base opacity-70">/10</span></p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wide font-semibold opacity-80">Prioridade prevista</p>
                <p className="text-lg font-bold flex items-center gap-2 justify-end">
                  <span className={`w-2.5 h-2.5 rounded-full ${previewTone.bar}`} />
                  {priorityPreview}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={busy} className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-brand/90 transition-colors">
                <Icon name="Save" size={14} />
                Guardar avaliação
              </button>
            </div>
          </form>

          <h4 className="mt-6 mb-2 font-semibold text-ink dark:text-dink">Avaliações anteriores</h4>
          {(selectedOccurrence.avaliacoes || []).length === 0 ? (
            <p className="text-sm text-muted dark:text-dmuted">Sem avaliações anteriores.</p>
          ) : (
            <ul className="divide-y divide-bd dark:divide-dborder rounded-lg border border-bd dark:border-dborder">
              {(selectedOccurrence.avaliacoes || []).map(item => (
                <li key={item.id} className="p-3 text-sm flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-ink dark:text-dink">{item.prioridade}</span>
                  <span className="text-muted dark:text-dmuted">{item.pontuacao_total}/10 · {item.responsavel}</span>
                  <span className="text-xs text-muted dark:text-dmuted">{showDate(item.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      ) : (
        <Card>
          <Table headers={['ID', 'Título', 'Tipo', 'Estado', 'Validação', '']} empty="Nenhuma ocorrência pendente de avaliação.">
            {occurrences.items.map(item => (
              <tr key={item.id} className="hover:bg-light/50 dark:hover:bg-dsidebar/30 transition-colors">
                <td className="px-3 py-2 font-mono text-xs">#{item.id}</td>
                <td className="px-3 py-2 font-medium">{item.titulo}</td>
                <td className="px-3 py-2">{item.tipo}</td>
                <td className="px-3 py-2">{item.estado}</td>
                <td className="px-3 py-2">{item.validacao || '—'}</td>
                <td className="px-3 py-2 text-right">
                  <button className="text-brand underline text-sm" onClick={() => selectOccurrence(item)}>Avaliar</button>
                </td>
              </tr>
            ))}
          </Table>
        </Card>
      )}
    </div>
  );

  const renderTeams = () => (
    <div className="space-y-4">
      <PageTitle title="Equipas operacionais" description="Consulta de membros, missões e disponibilidade." />
      <Card className="grid gap-3 md:grid-cols-3">
        <div className="relative">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input className={`${input} pl-8`} placeholder="Pesquisar equipa" value={teamFilters.q} onChange={event => setTeamFilters({ ...teamFilters, q: event.target.value })} />
        </div>
        <select className={input} value={teamFilters.estado} onChange={event => setTeamFilters({ ...teamFilters, estado: event.target.value })}>
          <option value="">Todos os estados</option>
          {['disponivel', 'em_missao', 'indisponivel'].map(state => <option key={state}>{state}</option>)}
        </select>
        <select className={input} value={teamFilters.tipo_equipa_id} onChange={event => setTeamFilters({ ...teamFilters, tipo_equipa_id: event.target.value })}>
          <option value="">Todos os tipos</option>
          {teamTypes.map(type => <option key={type.id} value={type.id}>{type.nome}</option>)}
        </select>
      </Card>
      <div className="grid gap-3 lg:grid-cols-2">
        {teams.length === 0 && (
          <Card className="lg:col-span-2">
            <p className="text-center text-sm text-muted dark:text-dmuted py-6">Sem equipas para mostrar.</p>
          </Card>
        )}
        {teams.map(team => (
          <Card key={team.id} className="space-y-3">
            <div className="flex justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold text-ink dark:text-dink truncate">{team.nome}</h3>
                <p className="text-sm text-muted dark:text-dmuted">{team.tipo_equipa} · {team.estado}</p>
              </div>
              <select aria-label={`Disponibilidade ${team.nome}`} className={`${input} max-w-40`} value={team.estado} disabled={team.estado === 'em_missao'} onChange={async event => { await coordenadorService.teamAvailability(team.id, event.target.value); await loadTeams(); toast.success('Disponibilidade actualizada.'); }}>
                <option value="disponivel">disponivel</option>
                <option value="indisponivel">indisponivel</option>
              </select>
            </div>

            <div>
              <p className="text-sm font-medium mb-1.5 flex items-center gap-1.5 text-ink dark:text-dink">
                <Icon name="Users" size={14} className="text-muted" />
                Membros ({team.membros?.length || 0})
              </p>
              {(team.membros || []).length === 0 ? (
                <p className="text-xs text-muted dark:text-dmuted">Sem membros.</p>
              ) : (
                <ul className="space-y-1">
                  {(team.membros || []).map(member => (
                    <li className="text-sm text-muted dark:text-dmuted flex items-center gap-2" key={member.id}>
                      <span className="w-6 h-6 rounded-full bg-navy/10 dark:bg-white/10 text-navy dark:text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                        {(member.nome || '?').slice(0, 2).toUpperCase()}
                      </span>
                      {member.nome} · {member.perfil}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <form className="grid grid-cols-2 gap-2 pt-2 border-t border-bd dark:border-dborder" onSubmit={async event => { event.preventDefault(); const form = new FormData(event.currentTarget); const lat = form.get('latitude'); const lon = form.get('longitude'); try { await coordenadorService.updateTeamLocation(team.id, lat === '' ? null : Number(lat), lon === '' ? null : Number(lon)); await loadTeams(); toast.success('Localização da equipa actualizada.'); } catch (e) { toast.error(e.message || 'Não foi possível guardar a localização.'); } }}>
              <label className="text-xs text-muted dark:text-dmuted">Latitude<input name="latitude" type="number" step="any" min="-90" max="90" defaultValue={team.latitude ?? ''} className={input} /></label>
              <label className="text-xs text-muted dark:text-dmuted">Longitude<input name="longitude" type="number" step="any" min="-180" max="180" defaultValue={team.longitude ?? ''} className={input} /></label>
              <Button type="submit" size="sm" variant="secondary" className="col-span-2">Guardar localização da equipa</Button>
            </form>

            <div className="pt-2 border-t border-bd dark:border-dborder">
              <p className="text-sm font-medium mb-1.5 flex items-center gap-1.5 text-ink dark:text-dink">
                <Icon name="Target" size={14} className="text-muted" />
                Missões
              </p>
              {(team.missoes || []).length === 0 ? (
                <p className="text-xs text-muted dark:text-dmuted">Sem missões atribuídas.</p>
              ) : (
                <ul className="space-y-1">
                  {(team.missoes || []).map(mission => (
                    <li className="text-sm text-muted dark:text-dmuted" key={mission.id}>#{mission.id} · {mission.estado} · {mission.ocorrencia_titulo}</li>
                  ))}
                </ul>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderMissions = () => (
    <div className="space-y-4">
      <PageTitle title="Coordenação de missões" description={user.role === 'administrador' ? 'Consulta das missões existentes.' : 'Criação, atribuição e acompanhamento com histórico de operações.'} />
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon="Clock" label="Missões atribuídas" value={missions.filter(item => item.estado === 'atribuida').length} tone="orange" />
        <StatCard icon="CheckCircle" label="Concluídas" value={missions.filter(item => item.estado === 'concluida').length} tone="green" />
        <StatCard icon="XCircle" label="Canceladas" value={missions.filter(item => item.estado === 'cancelada').length} tone="red" />
      </div>

      {user.role !== 'administrador' && (
        <Card>
          <h3 className="mb-3 font-semibold flex items-center gap-2 text-ink dark:text-dink">
            <Icon name="Plus" size={16} className="text-brand" />
            Criar missão
          </h3>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={submitMission}>
            <Field label="Ocorrência"><select required name="ocorrencia_id" className={input}><option value="">Seleccionar</option>{(occurrences.items || []).map(item => <option key={item.id} value={item.id}>#{item.id} · {item.titulo} · {item.prioridade || 'Sem prioridade'}</option>)}</select></Field>
            <Field label="Equipa disponível"><select required name="equipa_id" className={input}><option value="">Seleccionar</option>{teams.filter(team => team.estado === 'disponivel').map(team => <option key={team.id} value={team.id}>{team.nome} · {team.tipo_equipa}</option>)}</select></Field>
            <Field label="Objectivos"><textarea required name="objectivos" className={input} rows="2" /></Field>
            <Field label="Instruções operacionais"><textarea required name="instrucoes" className={input} rows="2" /></Field>
            <Field label="Data de atribuição"><input required type="datetime-local" name="data_atribuicao" className={input} /></Field>
            <Field label="Data prevista de conclusão"><input required type="datetime-local" name="data_prevista_conclusao" className={input} /></Field>
            <div className="md:col-span-2 flex justify-end"><Button type="submit" disabled={busy}>Criar e atribuir</Button></div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-3 grid gap-2 md:grid-cols-4">
          <div className="relative">
            <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input className={`${input} pl-8`} placeholder="Pesquisar missão" value={missionFilters.q} onChange={event => setMissionFilters({ ...missionFilters, q: event.target.value })} />
          </div>
          <select className={input} value={missionFilters.estado} onChange={event => setMissionFilters({ ...missionFilters, estado: event.target.value })}>
            <option value="">Todos os estados</option>
            {MISSION_STATES.map(state => <option key={state}>{state}</option>)}
          </select>
          <select className={input} value={missionFilters.equipa_id} onChange={event => setMissionFilters({ ...missionFilters, equipa_id: event.target.value })}>
            <option value="">Todas as equipas</option>
            {teams.map(team => <option key={team.id} value={team.id}>{team.nome}</option>)}
          </select>
          <select className={input} value={missionFilters.ocorrencia_id} onChange={event => setMissionFilters({ ...missionFilters, ocorrencia_id: event.target.value })}>
            <option value="">Todas as ocorrências</option>
            {occurrences.items.map(item => <option key={item.id} value={item.id}>#{item.id} · {item.titulo}</option>)}
          </select>
        </div>
        <Table headers={['ID', 'Ocorrência', 'Prioridade', 'Equipa', 'Estado', 'Atribuição', '']} empty="Nenhuma missão encontrada.">
          {missions.map(mission => (
            <tr key={mission.id} className="hover:bg-light/50 dark:hover:bg-dsidebar/30 transition-colors">
              <td className="px-3 py-2 font-mono text-xs">#{mission.id}</td>
              <td className="px-3 py-2 font-medium">{mission.ocorrencia?.titulo}</td>
              <td className="px-3 py-2">{mission.ocorrencia?.prioridade || '—'}</td>
              <td className="px-3 py-2">{mission.equipa?.nome}</td>
              <td className="px-3 py-2"><MissionStateBadge state={mission.estado} /></td>
              <td className="px-3 py-2 text-muted dark:text-dmuted">{showDate(mission.data_atribuicao)}</td>
              <td className="px-3 py-2 text-right">
                <button aria-label={`Ver missão ${mission.id}`} className="rounded-md p-1.5 text-brand hover:bg-light dark:hover:bg-dsidebar transition-colors" onClick={() => openMission(mission.id)}>
                  <Icon name="Eye" size={16} />
                </button>
              </td>
            </tr>
          ))}
        </Table>
      </Card>

      {selectedMission && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={event => { if (event.target === event.currentTarget) setSelectedMission(null); }}>
          <Card className="max-h-[85vh] w-full max-w-3xl overflow-y-auto p-5 space-y-4" onClick={event => event.stopPropagation()}>
            <div className="flex justify-between items-start gap-3">
              <div>
                <h3 className="font-semibold text-lg text-ink dark:text-dink">Missão #{selectedMission.id}</h3>
                <div className="mt-1"><MissionStateBadge state={selectedMission.estado} /></div>
              </div>
              <button className="text-brand underline text-sm shrink-0" onClick={() => setSelectedMission(null)}>Fechar</button>
            </div>

            <div className="rounded-lg bg-light dark:bg-dsidebar p-3 space-y-1">
              <p className="text-sm"><strong className="text-ink dark:text-dink">Objectivos:</strong> {selectedMission.objectivos}</p>
              <p className="text-sm text-muted dark:text-dmuted"><strong className="text-ink dark:text-dink">Instruções:</strong> {selectedMission.instrucoes}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-bd dark:border-dborder p-3">
                <p className="text-xs uppercase font-semibold text-muted dark:text-dmuted mb-1">Equipa</p>
                <p className="font-medium text-ink dark:text-dink">{selectedMission.equipa?.nome}</p>
                <p className="text-xs text-muted dark:text-dmuted">Estado: {selectedMission.equipa?.estado}</p>
              </div>
              <div className="rounded-lg border border-bd dark:border-dborder p-3">
                <p className="text-xs uppercase font-semibold text-muted dark:text-dmuted mb-1">Membros</p>
                <p className="text-sm text-ink dark:text-dink">{(selectedMission.equipa?.membros || []).map(member => member.nome).join(', ') || '—'}</p>
              </div>
            </div>

            {user.role !== 'administrador' && selectedMission.estado === 'atribuida' && (
              <Field label="Reatribuir equipa">
                <select className={input} value="" onChange={event => reassignMission(event.target.value)}>
                  <option value="">Seleccionar equipa disponível</option>
                  {teams.filter(team => team.estado === 'disponivel' && team.id !== selectedMission.equipa_id).map(team => <option value={team.id} key={team.id}>{team.nome}</option>)}
                </select>
              </Field>
            )}

            <div>
              <h4 className="font-semibold mb-2 text-ink dark:text-dink">Histórico</h4>
              {(selectedMission.historico || []).length === 0 ? (
                <p className="text-sm text-muted dark:text-dmuted">Sem histórico.</p>
              ) : (
                <ol className="relative border-l border-bd dark:border-dborder ml-2 space-y-3">
                  {(selectedMission.historico || []).map(item => (
                    <li className="ml-4 text-sm" key={item.id}>
                      <span className="absolute -left-1.5 mt-1.5 w-3 h-3 rounded-full bg-brand border-2 border-white dark:border-dcard" />
                      <p className="font-medium text-ink dark:text-dink">{item.operacao}: {item.estado_anterior || '—'} → {item.estado_novo || '—'}</p>
                      <p className="text-xs text-muted dark:text-dmuted">{item.utilizador} · {showDate(item.created_at)}</p>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const renderAlerts = () => (
    <div className="space-y-4">
      <PageTitle title="Alertas públicos" description="Criar rascunhos, publicar e encerrar avisos oficiais.">
        <button className="inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-sm text-white hover:bg-brand/90 transition-colors" onClick={() => setAlertForm({})}>
          <Icon name="Plus" size={14} />
          Novo alerta
        </button>
      </PageTitle>

      {alertForm && (
        <Card>
          <h3 className="mb-3 font-semibold flex items-center gap-2 text-ink dark:text-dink">
            <Icon name="Megaphone" size={16} className="text-brand" />
            {alertForm.id ? `Editar alerta #${alertForm.id}` : 'Novo alerta'}
          </h3>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={saveAlert}>
            <Field label="Título"><input required name="titulo" defaultValue={alertForm.titulo || ''} className={input} maxLength="180" /></Field>
            <Field label="Tipo de perigo"><input required name="tipo_perigo" defaultValue={alertForm.tipo_perigo || ''} className={input} /></Field>
            <Field label="Severidade"><select required name="severidade" defaultValue={alertForm.severidade || 'media'} className={input}>{['critica', 'alta', 'media', 'baixa', 'informativa'].map(value => <option key={value}>{value}</option>)}</select></Field>
            <Field label="Fonte/autoridade"><input required name="fonte" defaultValue={alertForm.fonte || ''} className={input} /></Field>
            <Field label="Área geográfica"><input name="area_geografica" defaultValue={alertForm.area_geografica || ''} className={input} /></Field>
            <Field label="ID de localização (opcional)"><input name="localizacao_id" defaultValue={alertForm.localizacao_id || ''} type="number" min="1" className={input} /></Field>
            <Field label="Válido desde"><input required name="valido_desde" type="datetime-local" defaultValue={alertForm.valido_desde?.slice(0, 16) || ''} className={input} /></Field>
            <Field label="Válido até"><input required name="valido_ate" type="datetime-local" defaultValue={alertForm.valido_ate?.slice(0, 16) || ''} className={input} /></Field>
            <Field label="Descrição"><textarea required name="descricao" defaultValue={alertForm.descricao || ''} className={input} /></Field>
            <Field label="Recomendações"><textarea required name="recomendacoes" defaultValue={alertForm.recomendacoes || ''} className={input} /></Field>
            <div className="flex gap-2 md:col-span-2 justify-end pt-2 border-t border-bd dark:border-dborder">
              <button type="button" className="rounded-lg border border-bd dark:border-dborder px-3 py-2 text-sm hover:bg-light dark:hover:bg-dsidebar transition-colors" onClick={() => setAlertForm(null)}>Cancelar</button>
              <button type="submit" disabled={busy} className="rounded-lg bg-brand px-4 py-2 text-sm text-white disabled:opacity-50 hover:bg-brand/90 transition-colors">{alertForm.id ? 'Actualizar alerta' : 'Guardar rascunho'}</button>
            </div>
          </form>
        </Card>
      )}

      {alertas.length === 0 ? (
        <Card><p className="text-center text-sm text-muted dark:text-dmuted py-6">Sem alertas registados.</p></Card>
      ) : alertas.map(alert => (
        <Card key={alert.id} className="space-y-3">
          <div className="flex flex-wrap justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-ink dark:text-dink">{alert.titulo}</h3>
                <SeverityBadge value={alert.severidade} />
                <span className="text-xs text-muted dark:text-dmuted">· {alert.estado}</span>
              </div>
              <p className="text-sm text-muted dark:text-dmuted mt-1">{alert.tipo_perigo} · Fonte: {alert.fonte}</p>
              <p className="text-sm text-ink dark:text-dink mt-1 flex items-center gap-1.5">
                <Icon name="MapPin" size={13} className="text-muted" />
                {alert.area_geografica || 'Área geográfica não indicada'}
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {alert.estado !== 'encerrado' && <button className="rounded-lg border border-bd dark:border-dborder px-3 py-1.5 text-sm hover:bg-light dark:hover:bg-dsidebar transition-colors" onClick={() => setAlertForm(alert)}>Editar</button>}
              {alert.estado === 'rascunho' && <button className="rounded-lg bg-brand px-3 py-1.5 text-sm text-white hover:bg-brand/90 transition-colors" onClick={() => publishAlert(alert.id)}>Publicar</button>}
              {alert.estado === 'publicado' && <button className="rounded-lg border border-red-300 dark:border-red-900 px-3 py-1.5 text-sm text-red-700 dark:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors" onClick={() => closeAlert(alert.id)}>Encerrar</button>}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  const navigation = tabs.map(([id, label]) => ({
    id,
    label,
    icon: ({ dashboard: 'LayoutDashboard', ocorrencias: 'FileText', prioridades: 'Activity', equipas: 'Users', missoes: 'Target', alertas: 'AlertOctagon', utilizadores: 'UserCog' })[id],
  }));

  return (
    <AuthenticatedLayout
      user={user}
      onLogout={onLogout}
      navigation={navigation}
      activePage={tab}
      onNavigate={nextTab => { setTab(nextTab); setSelectedOccurrence(null); setSelectedMission(null); }}
      title={tabs.find(([id]) => id === tab)?.[1] || 'Painel geral'}
    >
      <div className="space-y-4">
        {/* Barra fina de loading */}
        {busy && (
          <div className="h-0.5 w-full rounded-full bg-light dark:bg-dsidebar overflow-hidden" role="status" aria-label="A carregar">
            <div className="h-full w-1/3 bg-brand animate-[loading_1.2s_ease-in-out_infinite]" style={{ animation: 'loading 1.2s ease-in-out infinite' }} />
          </div>
        )}
        <ErrorMessage error={error} retry={loadActiveTab} />
        {tab === 'dashboard' && renderDashboard()}
        {tab === 'ocorrencias' && renderOccurrences()}
        {tab === 'prioridades' && renderPriorities()}
        {tab === 'equipas' && renderTeams()}
        {tab === 'missoes' && renderMissions()}
        {tab === 'alertas' && renderAlerts()}
        {tab === 'perfil' && <CidadaoPerfil user={user} showIdentity={false} />}
        {tab === 'utilizadores' && user.role === 'administrador' && <GestaoUtilizadores />}
      </div>
    </AuthenticatedLayout>
  );
}

// Placeholder para gráficos sem dados
function EmptyChart({ label }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-sm text-muted dark:text-dmuted gap-2">
      <Icon name="BarChart3" size={28} className="opacity-30" />
      <p>{label}</p>
    </div>
  );
}

function OccurrenceDetail({ occurrence, onClose }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" role="dialog" aria-modal="true" onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <Card className="max-h-[85vh] w-full max-w-2xl overflow-y-auto p-5 space-y-4" onClick={event => event.stopPropagation()}>
        <div className="flex justify-between items-start gap-3">
          <div>
            <h3 className="font-semibold text-lg text-ink dark:text-dink">Ocorrência #{occurrence.id}</h3>
            <p className="text-sm text-muted dark:text-dmuted">{occurrence.titulo}</p>
          </div>
          <button className="text-brand underline text-sm shrink-0" onClick={onClose}>Fechar</button>
        </div>

        <p className="text-sm text-ink dark:text-dink whitespace-pre-wrap">{occurrence.descricao}</p>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-light dark:bg-dsidebar px-2 py-0.5">{occurrence.tipo}</span>
          <span className="rounded-full bg-light dark:bg-dsidebar px-2 py-0.5">{occurrence.estado}</span>
          <span className="rounded-full bg-light dark:bg-dsidebar px-2 py-0.5">{occurrence.prioridade || 'Sem prioridade'}</span>
          <span className="rounded-full bg-light dark:bg-dsidebar px-2 py-0.5">Origem: {occurrence.origem}</span>
        </div>

        <Section title="Validações">
          {(occurrence.validacoes || []).length === 0
            ? <p className="text-sm text-muted dark:text-dmuted">Sem validações.</p>
            : (occurrence.validacoes || []).map(item => <p className="py-1 text-sm" key={item.id}>{item.estado} · {item.responsavel} · {item.motivo || item.observacoes || '—'}</p>)}
        </Section>

        <Section title="Avaliações">
          {(occurrence.avaliacoes || []).length === 0
            ? <p className="text-sm text-muted dark:text-dmuted">Sem avaliações.</p>
            : (occurrence.avaliacoes || []).map(item => <p className="py-1 text-sm" key={item.id}>{item.prioridade} · {item.pontuacao_total}/10 · {item.responsavel}</p>)}
        </Section>

        <Section title="Missões">
          {(occurrence.missoes || []).length === 0
            ? <p className="text-sm text-muted dark:text-dmuted">Sem missões.</p>
            : (occurrence.missoes || []).map(item => <p className="py-1 text-sm" key={item.id}>#{item.id} · {item.estado} · {item.equipa}</p>)}
        </Section>

        <Section title="Histórico">
          {(occurrence.historico || []).length === 0
            ? <p className="text-sm text-muted dark:text-dmuted">Sem histórico.</p>
            : (occurrence.historico || []).map(item => <p className="py-1 text-sm" key={item.id}>{item.estado_anterior || '—'} → {item.estado_novo} · {item.responsavel} · {showDate(item.created_at)}</p>)}
        </Section>
      </Card>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="pt-2 border-t border-bd dark:border-dborder">
      <h4 className="font-semibold text-ink dark:text-dink mb-1">{title}</h4>
      {children}
    </div>
  );
}

export default CoordenadorWorkspace;