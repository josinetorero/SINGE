import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Card, Button, StatCard, StatusBadge, EmptyState, inputCls } from '../../components/common/CommonComponents';
import Icon from '../../components/common/Icon';
import { agenteService } from '../../services/agenteService';
import { notificacoesService } from '../../services/notificacoesService';
import { alertasPublicosService } from '../../services/alertasPublicosService';
import { evidenciasService } from '../../services/evidenciasService';
import { useToast } from '../../contexts/ToastContext';
import { AuthenticatedLayout } from '../../components/layout/AuthenticatedLayout';
import { Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { CidadaoPerfil } from '../cidadao/CidadaoPerfil';
import { MozambiqueMap } from '../../components/map/MapComponents';

const ACTIVE_STATES = ['atribuida', 'em_deslocacao', 'em_execucao'];
const dateLabel = value => value ? new Date(value).toLocaleString() : '—';
const MISSION_COLORS = ['#2563eb', '#ea580c', '#7c3aed', '#16a34a', '#dc2626'];

const SEVERIDADE_PILL = {
  critica:   'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/70 dark:border-red-800/60',
  alta:      'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60',
  media:     'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
  baixa:     'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200/70 dark:border-green-800/60',
};
const SEVERIDADE_DOT = {
  critica: 'bg-red-500', alta: 'bg-orange-500', media: 'bg-amber-500', baixa: 'bg-green-500',
};

/* ─── Estilos partilhados dos gráficos ─────────────────────── */
const axisTick = { fontSize: 11, fill: 'currentColor' };
const axisLine = { stroke: 'currentColor', opacity: 0.2 };
const cursorProps = { fill: 'currentColor', fillOpacity: 0.06 };

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-bd dark:border-dborder bg-white dark:bg-dsidebar px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-ink dark:text-dink mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 text-muted dark:text-dmuted">
          <span className="inline-block w-2 h-2 rounded-full" style={{ background: p.color || p.payload?.fill || p.fill }} />
          {p.name}: <strong className="text-ink dark:text-dink">{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function ChartCard({ title, subtitle, icon, accent, children }) {
  return (
    <Card className="p-4 md:p-5 flex flex-col">
      <div className="mb-3 flex items-start gap-2.5">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
          <Icon name={icon} size={16} />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-ink dark:text-dink text-sm leading-tight truncate">{title}</h3>
          {subtitle && <p className="text-xs text-muted dark:text-dmuted mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="h-60 text-ink dark:text-dink">{children}</div>
    </Card>
  );
}

function SectionHeader({ icon, accent, title, action }) {
  return (
    <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
      <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
        <span className={`w-1 h-5 rounded-full ${accent}`} />
        {title}
      </h3>
      {action}
    </div>
  );
}

export function AgenteWorkspace({ user, onLogout }) {
  const toast = useToast();
  const [missions, setMissions] = useState([]);
  const [selected, setSelected] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [observation, setObservation] = useState('');
  const [evidenceFile, setEvidenceFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState('dashboard');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      if (!user.teamId) {
        setMissions([]);
        setError('A sua conta ainda não está associada a uma equipa operacional.');
        return;
      }
      const [teamMissions, privateNotifications, publicAlerts] = await Promise.all([
        agenteService.missoesDaEquipa(user.teamId),
        notificacoesService.listar(),
        alertasPublicosService.listar(),
      ]);
      setMissions(teamMissions);
      setNotifications(privateNotifications);
      setAlerts(publicAlerts);
      if (selected?.id) setSelected(await agenteService.missao(selected.id));
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível carregar os dados operacionais.');
    } finally {
      setLoading(false);
    }
  }, [user.teamId, selected?.id]);

  useEffect(() => { refresh(); }, [refresh]);

  const counts = useMemo(() => ({
    total: missions.length,
    pendentes: missions.filter(item => item.estado === 'atribuida').length,
    activas: missions.filter(item => ['em_deslocacao', 'em_execucao'].includes(item.estado)).length,
    concluidas: missions.filter(item => item.estado === 'concluida').length,
  }), [missions]);

  const missionStatusChart = useMemo(() => Object.entries(missions.reduce((totals, mission) => {
    totals[mission.estado] = (totals[mission.estado] || 0) + 1;
    return totals;
  }, {})).map(([name, total]) => ({ name: name.replaceAll('_', ' '), total })), [missions]);

  const completedTrend = useMemo(() => {
    const byDay = {};
    missions.forEach(mission => (mission.historico || []).forEach(entry => {
      if (entry.estado_novo !== 'concluida') return;
      const day = String(entry.created_at || '').slice(0, 10);
      if (day) byDay[day] = (byDay[day] || 0) + 1;
    }));
    return Object.entries(byDay).sort(([a], [b]) => a.localeCompare(b)).slice(-14).map(([dia, total]) => ({ dia, total }));
  }, [missions]);

  const reportActivity = async operation => {
    if (!selected) return;
    setBusy(true);
    setError('');
    try {
      const payload = { operacao: operation };
      if (operation !== 'conhecimento') payload.observacoes = observation.trim();
      const updated = await agenteService.registarActividade(selected.id, payload);
      setSelected(updated);
      setObservation('');
      await refresh();
      toast.success('Actualização operacional registada.');
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível registar a actualização.');
    } finally {
      setBusy(false);
    }
  };

  const uploadEvidence = async () => {
    if (!selected || !evidenceFile) return;
    setBusy(true);
    setError('');
    try {
      await evidenciasService.anexar(selected.ocorrencia_id, evidenceFile, 'Evidência de execução submetida pelo Agente.');
      setEvidenceFile(null);
      setSelected(await agenteService.missao(selected.id));
      toast.success('Evidência anexada à ocorrência da missão.');
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível anexar a evidência.');
    } finally {
      setBusy(false);
    }
  };

  const openMission = async missionId => {
    setError('');
    try { setSelected(await agenteService.missao(missionId)); }
    catch (e) { setError(e.message); }
  };

  const navigation = [
    { id: 'dashboard', label: 'Painel operacional', icon: 'LayoutDashboard' },
    { id: 'missoes', label: 'Missões da equipa', icon: 'Target' },
    { id: 'historico', label: 'Histórico de operações', icon: 'History' },
    { id: 'avisos', label: 'Alertas públicos e notificações', icon: 'Bell' },
    { id: 'perfil', label: 'Meu perfil', icon: 'User' },
  ];

  return (
    <AuthenticatedLayout user={user} onLogout={onLogout} navigation={navigation} activePage={page} onNavigate={setPage} title={navigation.find(item => item.id === page)?.label}>
      <div className="space-y-5">

        {/* ─── Cabeçalho ─────────────────────────────────────── */}
        <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-amber-950/30 p-5 shadow-sm">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-orange-400/10 dark:bg-orange-500/10 blur-3xl" />

          <div className="relative flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold uppercase tracking-wider border border-amber-200/60 dark:border-amber-800/50">
                  <Icon name="Target" size={11} />
                  Workspace do Agente
                </span>
                {!loading && (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {counts.activas} missõe{counts.activas === 1 ? 'm' : 's'} activa{counts.activas === 1 ? '' : 's'}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">Painel do Agente</h1>
              <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
                Missões da sua equipa, actualizações e avisos relevantes.
              </p>
            </div>
          </div>
        </header>

        {/* ─── Erro ──────────────────────────────────────────── */}
        {error && (
          <Card role="alert" className="p-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
                <Icon name="AlertOctagon" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">Não foi possível concluir a operação</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
              </div>
            </div>
          </Card>
        )}

        {/* ─── KPIs ──────────────────────────────────────────── */}
        {['dashboard', 'missoes'].includes(page) && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['Missões da equipa', counts.total],
              ['Pendentes', counts.pendentes],
              ['Activas', counts.activas],
              ['Concluídas', counts.concluidas],
            ].map(([label, value], index) => (
              <StatCard
                key={label}
                icon={['Target', 'Clock', 'Activity', 'CheckCircle'][index]}
                label={label}
                value={value}
                tone={['brand', 'orange', 'brand', 'green'][index]}
              />
            ))}
          </div>
        )}

        {/* ═══ PÁGINA: DASHBOARD ═══════════════════════════════ */}
        {page === 'dashboard' && (
          <div className="grid gap-4 lg:grid-cols-2">

            <ChartCard
              title="Missões por estado"
              subtitle="Distribuição da equipa"
              icon="Sliders"
              accent="bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300"
            >
              {missionStatusChart.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted dark:text-dmuted italic">
                  Sem missões atribuídas à equipa.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={missionStatusChart}
                      dataKey="total"
                      nameKey="name"
                      innerRadius={45}
                      outerRadius={82}
                      paddingAngle={2}
                      label={({ name, value }) => `${name} (${value})`}
                      labelLine={false}
                    >
                      {missionStatusChart.map((entry, index) => (
                        <Cell key={entry.name} fill={MISSION_COLORS[index % MISSION_COLORS.length]} stroke="transparent" />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <ChartCard
              title="Conclusões registadas"
              subtitle="Últimos 14 dias de actividade"
              icon="CheckCircle"
              accent="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300"
            >
              {completedTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-muted dark:text-dmuted italic text-center px-4">
                  Ainda não há conclusões no histórico acessível da equipa.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={completedTrend}>
                    <XAxis dataKey="dia" tick={{ ...axisTick, fontSize: 10 }} axisLine={axisLine} tickLine={false} />
                    <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Line
                      dataKey="total"
                      type="monotone"
                      stroke="#16a34a"
                      strokeWidth={3}
                      dot={{ r: 3, fill: '#16a34a' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </ChartCard>

            <Card className="p-4 md:p-5">
              <SectionHeader
                title="Localização das missões"
                accent="bg-gradient-to-b from-indigo-500 to-purple-500"
              />
              {missions.some(item => item.ocorrencia?.latitude != null && item.ocorrencia?.longitude != null) ? (
                <MozambiqueMap
                  ocorrencias={missions.map(item => ({ ...item.ocorrencia, id: item.ocorrencia_id, estado: item.estado }))}
                  height={260}
                />
              ) : (
                <div className="h-[260px] flex flex-col items-center justify-center gap-2 text-center px-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted flex items-center justify-center">
                    <Icon name="MapPin" size={18} />
                  </div>
                  <p className="text-xs text-muted dark:text-dmuted">
                    As missões atribuídas ainda não têm coordenadas verificadas.
                  </p>
                </div>
              )}
            </Card>

            <Card className="p-4 md:p-5 flex flex-col">
              <SectionHeader
                title="Missões atribuídas à equipa"
                accent="bg-gradient-to-b from-amber-500 to-orange-500"
                action={
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                    {missions.length}
                  </span>
                }
              />
              {loading ? (
                <div role="status" className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="animate-pulse rounded-lg border border-bd dark:border-dborder p-3 space-y-2">
                      <div className="h-3 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
                      <div className="h-2 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
                    </div>
                  ))}
                  <span className="sr-only">A carregar missões…</span>
                </div>
              ) : missions.length === 0 ? (
                <EmptyState icon="Target" title="A equipa não tem missões atribuídas." />
              ) : (
                <div className="space-y-2">
                  {missions.map(mission => {
                    const isSelected = selected?.id === mission.id;
                    return (
                      <button
                        key={mission.id}
                        onClick={() => openMission(mission.id)}
                        className={`group w-full rounded-lg border p-3 text-left transition-all hover:shadow-sm hover:-translate-y-0.5 ${
                          isSelected
                            ? 'border-brand bg-blue-50/50 dark:bg-blue-950/30'
                            : 'border-bd dark:border-dborder hover:border-brand dark:hover:border-dblue'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-ink dark:text-dink truncate">
                              Missão <span className="font-mono text-brand dark:text-dblue">#{mission.id}</span>
                              <span className="text-muted dark:text-dmuted font-normal"> · </span>
                              {mission.ocorrencia?.titulo || `Ocorrência #${mission.ocorrencia_id}`}
                            </p>
                            <p className="mt-1 text-xs text-muted dark:text-dmuted inline-flex items-center gap-1">
                              <Icon name="Clock" size={10} />
                              Atribuída em {dateLabel(mission.data_atribuicao)}
                            </p>
                          </div>
                          <StatusBadge s={mission.estado} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══ PÁGINA: MISSÕES ═════════════════════════════════ */}
        {page === 'missoes' && (
          <Card className="p-4 md:p-5">
            <SectionHeader
              title="Missões da equipa"
              accent="bg-gradient-to-b from-amber-500 to-orange-500"
              action={
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                  {missions.length}
                </span>
              }
            />
            {missions.length === 0 ? (
              <EmptyState icon="Target" title="A equipa não tem missões atribuídas." />
            ) : (
              <div className="space-y-2">
                {missions.map(mission => {
                  const isSelected = selected?.id === mission.id;
                  return (
                    <button
                      key={mission.id}
                      onClick={() => openMission(mission.id)}
                      className={`group flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left transition-all hover:shadow-sm hover:-translate-y-0.5 ${
                        isSelected
                          ? 'border-brand bg-blue-50/50 dark:bg-blue-950/30'
                          : 'border-bd dark:border-dborder hover:border-brand dark:hover:border-dblue'
                      }`}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block font-medium text-ink dark:text-dink truncate">
                          Missão <span className="font-mono text-brand dark:text-dblue">#{mission.id}</span>
                          <span className="text-muted dark:text-dmuted font-normal"> · </span>
                          {mission.ocorrencia?.titulo || `Ocorrência #${mission.ocorrencia_id}`}
                        </span>
                        <span className="mt-1 inline-flex items-center gap-1 text-xs text-muted dark:text-dmuted">
                          <Icon name="Clock" size={10} />
                          Prazo: {dateLabel(mission.data_prevista_conclusao)}
                        </span>
                      </span>
                      <StatusBadge s={mission.estado} />
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        )}

        {/* ═══ PÁGINA: HISTÓRICO ═══════════════════════════════ */}
        {page === 'historico' && (
          <Card className="p-4 md:p-5">
            <SectionHeader
              title="Histórico das missões da equipa"
              accent="bg-gradient-to-b from-purple-500 to-indigo-500"
              action={
                <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                  {missions.length}
                </span>
              }
            />
            {missions.length === 0 ? (
              <p className="text-sm text-muted dark:text-dmuted italic">Ainda não há operações registadas.</p>
            ) : (
              <div className="space-y-4">
                {missions.map(mission => (
                  <section key={mission.id} className="rounded-xl border border-bd dark:border-dborder p-4 bg-light/40 dark:bg-dsidebar/30">
                    <header className="flex items-center justify-between gap-2 flex-wrap mb-3">
                      <h3 className="font-semibold text-ink dark:text-dink">
                        Missão <span className="font-mono text-brand dark:text-dblue">#{mission.id}</span>
                        <span className="text-muted dark:text-dmuted font-normal"> · </span>
                        {mission.ocorrencia?.titulo || `Ocorrência #${mission.ocorrencia_id}`}
                      </h3>
                      <span className="text-[11px] text-muted dark:text-dmuted">
                        {(mission.historico || []).length} evento{(mission.historico || []).length === 1 ? '' : 's'}
                      </span>
                    </header>

                    {(mission.historico || []).length === 0 ? (
                      <p className="text-xs text-muted dark:text-dmuted italic">Sem eventos registados.</p>
                    ) : (
                      <ol className="relative border-l border-bd dark:border-dborder ml-2 space-y-2.5">
                        {(mission.historico || []).map(entry => (
                          <li key={entry.id} className="ml-4 relative">
                            <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-purple-100 dark:ring-purple-950/60" />
                            <p className="text-xs text-ink dark:text-dink">
                              <span className="font-semibold">{entry.operacao.replaceAll('_', ' ')}</span>
                              <span className="text-muted dark:text-dmuted"> · {entry.utilizador} · {dateLabel(entry.created_at)}</span>
                            </p>
                            {entry.observacoes && (
                              <p className="text-[11px] text-muted dark:text-dmuted mt-0.5 truncate">
                                {entry.observacoes}
                              </p>
                            )}
                          </li>
                        ))}
                      </ol>
                    )}
                  </section>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* ═══ PÁGINA: AVISOS ══════════════════════════════════ */}
        {page === 'avisos' && (
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-4 md:p-5">
              <SectionHeader
                title="Alertas públicos activos"
                accent="bg-gradient-to-b from-red-500 to-orange-500"
                action={
                  <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    {alerts.filter(a => a.activo).length} activo{alerts.filter(a => a.activo).length === 1 ? '' : 's'}
                  </span>
                }
              />
              {alerts.filter(alert => alert.activo).length === 0 ? (
                <p className="text-sm text-muted dark:text-dmuted italic">Não há alertas públicos activos.</p>
              ) : (
                <div className="space-y-3">
                  {alerts.filter(alert => alert.activo).map(alert => {
                    const sevKey = String(alert.severidade || '').toLowerCase();
                    const pill = SEVERIDADE_PILL[sevKey] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                    const dot = SEVERIDADE_DOT[sevKey] || 'bg-slate-500';
                    return (
                      <article key={alert.id} className="rounded-xl border border-bd dark:border-dborder bg-light/40 dark:bg-dsidebar/30 p-3">
                        <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
                          <p className="font-semibold text-ink dark:text-dink">{alert.titulo}</p>
                          <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold border ${pill}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                            {alert.severidade}
                          </span>
                        </div>
                        <p className="text-xs text-muted dark:text-dmuted">
                          <Icon name="MapPin" size={10} className="inline -mt-0.5 mr-1" />
                          {alert.area_geografica || 'Área não indicada'}
                          <span className="mx-1">·</span>
                          <Icon name="Clock" size={10} className="inline -mt-0.5 mr-1" />
                          válido até {dateLabel(alert.valido_ate)}
                        </p>
                        {alert.recomendacoes && (
                          <p className="mt-2 text-sm text-ink dark:text-dink">{alert.recomendacoes}</p>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-4 md:p-5">
              <SectionHeader
                title="Notificações"
                accent="bg-gradient-to-b from-cyan-500 to-blue-500"
                action={
                  <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                    {notifications.length}
                  </span>
                }
              />
              {notifications.length === 0 ? (
                <p className="text-sm text-muted dark:text-dmuted italic">Sem notificações.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map(item => (
                    <article key={item.id} className="rounded-lg border border-bd dark:border-dborder p-3 bg-light/40 dark:bg-dsidebar/30">
                      <div className="flex items-start justify-between gap-2 flex-wrap mb-1">
                        <p className="font-semibold text-ink dark:text-dink">{item.titulo}</p>
                        <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted">
                          {item.tipo}
                        </span>
                      </div>
                      <p className="text-sm text-muted dark:text-dmuted">{item.mensagem}</p>
                      <p className="text-[11px] text-muted dark:text-dmuted mt-1.5 inline-flex items-center gap-1">
                        <Icon name="Clock" size={10} />
                        {dateLabel(item.created_at)}
                      </p>
                    </article>
                  ))}
                </div>
              )}
            </Card>
          </div>
        )}

        {/* ═══ PÁGINA: PERFIL ══════════════════════════════════ */}
        {page === 'perfil' && <CidadaoPerfil user={user} showIdentity={false} />}

        {/* ═══ MODAL: DETALHE DE MISSÃO ════════════════════════ */}
        {selected && (
          <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 backdrop-blur-sm p-4">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto">
              <MissionDetails
                mission={selected}
                observation={observation}
                setObservation={setObservation}
                evidenceFile={evidenceFile}
                setEvidenceFile={setEvidenceFile}
                busy={busy}
                onReport={reportActivity}
                onUploadEvidence={uploadEvidence}
                onClose={() => setSelected(null)}
              />
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

/* ══════════════════════════════════════════════════════════ */
/*                    MISSION DETAILS MODAL                  */
/* ══════════════════════════════════════════════════════════ */

function MissionDetails({ mission, observation, setObservation, evidenceFile, setEvidenceFile, busy, onReport, onUploadEvidence, onClose }) {
  const status = mission.estado;
  const active = ACTIVE_STATES.includes(status);

  return (
    <Card className="p-5 md:p-6 space-y-5">

      {/* Cabeçalho do modal */}
      <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-bd dark:border-dborder">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted border border-bd dark:border-dborder">
              #{mission.id}
            </span>
            <span className="text-[10px] uppercase tracking-wider font-semibold text-brand dark:text-dblue">
              Detalhe da missão
            </span>
          </div>
          <h2 className="text-lg font-bold text-ink dark:text-dink leading-snug">
            {mission.ocorrencia?.titulo}
          </h2>
          <p className="text-sm text-muted dark:text-dmuted">{mission.ocorrencia?.localizacao}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted dark:text-dmuted flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Icon name="MapPin" size={11} />
              {mission.ocorrencia?.distrito}, {mission.ocorrencia?.provincia}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="Clock" size={11} />
              prazo {dateLabel(mission.data_prevista_conclusao)}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge s={status} />
          <button
            className="inline-flex items-center gap-1 text-xs font-semibold text-brand dark:text-dblue hover:underline"
            onClick={onClose}
          >
            <Icon name="X" size={14} /> Fechar
          </button>
        </div>
      </div>

      {/* Info + Histórico */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted mb-1">Objectivos</h3>
            <p className="text-sm text-ink dark:text-dink">{mission.objectivos || '—'}</p>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted mb-1">Instruções</h3>
            <p className="text-sm text-ink dark:text-dink">{mission.instrucoes || '—'}</p>
          </div>
          <div>
            <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted mb-1">Membros da equipa</h3>
            {(mission.equipa?.membros || []).length === 0 ? (
              <p className="text-sm text-muted dark:text-dmuted italic">Sem membros associados.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {(mission.equipa?.membros || []).map(member => (
                  <span key={member.id} className="inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <span className="w-4 h-4 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-[8px] font-bold flex items-center justify-center">
                      {(member.nome || '?').charAt(0).toUpperCase()}
                    </span>
                    {member.nome}
                    <span className="text-muted dark:text-dmuted">· {member.perfil}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted mb-1">Histórico operacional</h3>
          <div className="max-h-52 overflow-y-auto pr-1">
            {(mission.historico || []).length === 0 ? (
              <p className="text-sm text-muted dark:text-dmuted italic">Sem eventos registados.</p>
            ) : (
              <ol className="relative border-l border-bd dark:border-dborder ml-2 space-y-2.5">
                {(mission.historico || []).map(entry => (
                  <li key={entry.id} className="ml-4 relative">
                    <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-950/60" />
                    <p className="text-xs font-semibold text-ink dark:text-dink">
                      {entry.operacao.replaceAll('_', ' ')}
                      <span className="text-muted dark:text-dmuted font-normal"> · {entry.utilizador}</span>
                    </p>
                    <p className="text-[11px] text-muted dark:text-dmuted">
                      {entry.estado_anterior || '—'} → {entry.estado_novo || '—'} · {dateLabel(entry.created_at)}
                    </p>
                    {entry.observacoes && (
                      <p className="text-[11px] text-ink dark:text-dink mt-0.5">{entry.observacoes}</p>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>

      {/* Evidências */}
      <div className="pt-3 border-t border-bd dark:border-dborder">
        <h3 className="text-[11px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted mb-2">Evidências da ocorrência</h3>
        {(mission.ocorrencia?.evidencias || []).length === 0 ? (
          <p className="text-sm text-muted dark:text-dmuted italic">Ainda não há evidências associadas.</p>
        ) : (
          <div className="space-y-1.5">
            {(mission.ocorrencia?.evidencias || []).map(item => (
              <div key={item.id} className="flex items-center gap-2 text-sm text-ink dark:text-dink p-2 rounded-lg bg-light/60 dark:bg-dsidebar/40 border border-bd dark:border-dborder">
                <Icon name="FileText" size={14} className="text-muted dark:text-dmuted shrink-0" />
                <span className="font-medium truncate">{item.nome_ficheiro}</span>
                <span className="text-[11px] text-muted dark:text-dmuted ml-auto shrink-0">{dateLabel(item.created_at)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Acções (só se estiver activa) */}
      {active && (
        <div className="space-y-4 pt-3 border-t border-bd dark:border-dborder">
          <div>
            <label className="block space-y-1.5 text-sm">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted">
                Observação operacional <span className="text-red-500">*</span>
              </span>
              <textarea
                className={inputCls}
                rows="3"
                value={observation}
                onChange={event => setObservation(event.target.value)}
                placeholder="Progresso, chegada ao local, dificuldade encontrada ou resultado da intervenção"
              />
            </label>
            <p className="text-[10px] text-muted dark:text-dmuted mt-1">
              Obrigatória para reportar progresso, dificuldade ou conclusão.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {status === 'atribuida' && (
              <Button disabled={busy} onClick={() => onReport('conhecimento')} icon="CheckCircle">
                Confirmar recepção
              </Button>
            )}
            {status === 'em_deslocacao' && (
              <Button disabled={busy || !observation.trim()} onClick={() => onReport('chegada')} icon="MapPin">
                Registar chegada
              </Button>
            )}
            {['em_deslocacao', 'em_execucao'].includes(status) && (
              <Button variant="secondary" disabled={busy || !observation.trim()} onClick={() => onReport('progresso')} icon="Activity">
                Reportar progresso
              </Button>
            )}
            {['em_deslocacao', 'em_execucao'].includes(status) && (
              <Button variant="secondary" disabled={busy || !observation.trim()} onClick={() => onReport('dificuldade')} icon="AlertTriangle">
                Comunicar dificuldade
              </Button>
            )}
            {status === 'em_execucao' && (
              <Button disabled={busy || !observation.trim()} onClick={() => onReport('concluir')} icon="CheckCircle">
                Concluir intervenção
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-2 pt-3 border-t border-bd dark:border-dborder">
            <label className="block flex-1 min-w-[240px] space-y-1.5 text-sm">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted">
                Anexar fotografia ou relatório <span className="font-normal normal-case text-muted dark:text-dmuted">(JPG, PNG, PDF até 10 MB)</span>
              </span>
              <input
                className={inputCls}
                type="file"
                accept=".jpg,.jpeg,.png,.pdf"
                onChange={event => setEvidenceFile(event.target.files?.[0] || null)}
              />
            </label>
            <Button variant="secondary" disabled={busy || !evidenceFile} onClick={onUploadEvidence} icon="Upload">
              Enviar evidência
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default AgenteWorkspace;