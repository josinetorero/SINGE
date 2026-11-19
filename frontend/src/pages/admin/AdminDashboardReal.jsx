import React from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Icon from '../../components/common/Icon';
import { Card, StatCard } from '../../components/common/CommonComponents';

const COLORS = ['#2563eb', '#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#7c3aed', '#0891b2'];
const display = value => String(value || '').replaceAll('_', ' ');

/* ─── Sub-componentes ─────────────────────────────────────────── */

function ChartCard({ title, subtitle, icon, accent, children }) {
  return (
    <Card className="p-4 md:p-5 flex flex-col">
      <div className="mb-3 flex items-start gap-2.5">
        {icon && (
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${accent}`}>
            <Icon name={icon} size={16} />
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-ink dark:text-dink text-sm leading-tight truncate">{title}</h3>
          {subtitle && <p className="text-xs text-muted dark:text-dmuted mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="h-64 text-ink dark:text-dink">{children}</div>
    </Card>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border border-bd dark:border-dborder bg-white dark:bg-dsidebar px-3 py-2 shadow-lg text-xs">
      {label && <p className="font-semibold text-ink dark:text-dink mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 text-muted dark:text-dmuted">
          <span
            className="inline-block w-2 h-2 rounded-full"
            style={{ background: p.color || p.payload?.fill || p.fill }}
          />
          {p.name}: <strong className="text-ink dark:text-dink">{p.value}</strong>
        </p>
      ))}
    </div>
  );
}

function EmptyChart({ message }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center gap-2 px-4">
      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-muted dark:text-dmuted">
        <Icon name="Info" size={18} />
      </div>
      <p className="text-xs text-muted dark:text-dmuted max-w-xs">{message}</p>
    </div>
  );
}

function SkeletonCard() {
  return (
    <Card className="p-4 md:p-5">
      <div className="animate-pulse space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-slate-200 dark:bg-slate-700" />
          <div className="space-y-1.5 flex-1">
            <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="h-2.5 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </div>
        <div className="h-56 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </Card>
  );
}

/* ─── Estilos partilhados dos gráficos ────────────────────────── */

const axisTick = { fontSize: 11, fill: 'currentColor' };
const axisLine = { stroke: 'currentColor', opacity: 0.2 };
const gridProps = { strokeDasharray: '3 3', stroke: 'currentColor', opacity: 0.15 };
const cursorProps = { fill: 'currentColor', fillOpacity: 0.06 };

/* ─── Página principal ────────────────────────────────────────── */

export function AdminDashboardReal({ data, loading, error, onRefresh, onManageUsers }) {

  /* ─── Estado de erro ─────────────────────────────────────────── */
  if (error) {
    return (
      <Card role="alert" className="border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
            <Icon name="AlertOctagon" size={18} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-red-800 dark:text-red-200">Erro ao carregar indicadores</p>
            <p className="text-xs text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
            <button
              onClick={onRefresh}
              className="mt-2 text-xs font-semibold text-red-800 dark:text-red-200 underline hover:no-underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      </Card>
    );
  }

  /* ─── Derivação de dados ─────────────────────────────────────── */
  const users = data?.utilizadores || {};
  const occurrences = data?.ocorrencias || {};
  const missions = data?.missoes || {};
  const userChart = (users.por_perfil || []).map(item => ({ name: item.perfil, total: Number(item.total) }));
  const stateChart = (occurrences.por_estado || []).map(item => ({ name: display(item.estado), total: Number(item.total) }));
  const typeChart = (occurrences.por_tipo || []).filter(item => Number(item.total) > 0).map(item => ({ name: item.tipo, total: Number(item.total) }));
  const missionStates = (missions.por_estado || []).map(item => ({ name: display(item.estado), total: Number(item.total) }));
  const activeMissions = missionStates
    .filter(item => ['atribuida', 'em deslocacao', 'em execucao'].includes(item.name))
    .reduce((total, item) => total + item.total, 0);
  const availableTeams = (data?.equipas?.por_estado || []).find(item => item.estado === 'disponivel')?.total ?? 0;

  return (
    <div className="space-y-5">

      {/* ─── Cabeçalho ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-blue-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/50">
                <Icon name="ShieldCheck" size={11} />
                Administração do Sistema
              </span>
              {!loading && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Dados sincronizados
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">Visão global do SINGE</h2>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
              Indicadores agregados da base operacional, actualizados a partir da API.
            </p>
          </div>
          <button
            onClick={onManageUsers}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Icon name="Users" size={15} />
            Gerir utilizadores
          </button>
        </div>
      </header>

      {/* ─── KPIs ──────────────────────────────────────────────── */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard icon="Users"       label="Utilizadores"          value={loading ? '…' : users.total ?? 0}            hint={`${users.activos ?? 0} activos · ${users.inactivos ?? 0} inactivos`} tone="brand" />
        <StatCard icon="FileText"    label="Ocorrências"           value={loading ? '…' : occurrences.total ?? 0}      tone="orange" />
        <StatCard icon="Target"      label="Missões activas"       value={loading ? '…' : activeMissions}              tone="brand" />
        <StatCard icon="Users"       label="Equipas disponíveis"   value={loading ? '…' : availableTeams}              tone="green" />
        <StatCard icon="AlertOctagon" label="Alertas públicos activos" value={loading ? '…' : data?.alertas_activos ?? 0} tone="red" />
      </div>

      {/* ─── Gráficos ──────────────────────────────────────────── */}
      {loading && !data ? (
        <div className="grid gap-4 xl:grid-cols-2">
          <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">

          {/* Utilizadores por perfil */}
          <ChartCard
            title="Utilizadores por perfil"
            subtitle="Distribuição RBAC das contas"
            icon="Users"
            accent="bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={userChart}>
                <CartesianGrid {...gridProps} />
                <XAxis dataKey="name" tick={axisTick} axisLine={axisLine} tickLine={false} />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={cursorProps} />
                <Bar dataKey="total" fill="#2563eb" radius={[5, 5, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Ocorrências por tipo (com empty state) */}
          <ChartCard
            title="Ocorrências por tipo"
            subtitle="Volume por categoria operacional"
            icon="Sliders"
            accent="bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300"
          >
            {typeChart.length === 0 ? (
              <EmptyChart message="Ainda não existem dados suficientes para apresentar esta distribuição." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChart}
                    dataKey="total"
                    nameKey="name"
                    innerRadius={45}
                    outerRadius={85}
                    paddingAngle={2}
                    label={({ name, value }) => `${name} (${value})`}
                    labelLine={false}
                  >
                    {typeChart.map((item, index) => (
                      <Cell key={item.name} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                    ))}
                  </Pie>
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </ChartCard>

          {/* Ocorrências por estado */}
          <ChartCard
            title="Ocorrências por estado"
            subtitle="Ciclo de vida operacional"
            icon="Activity"
            accent="bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stateChart} margin={{ bottom: 8 }}>
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="name"
                  tick={{ ...axisTick, fontSize: 10 }}
                  axisLine={axisLine}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={cursorProps} />
                <Bar dataKey="total" fill="#ea580c" radius={[5, 5, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Missões por estado */}
          <ChartCard
            title="Missões por estado"
            subtitle="Estado actual das missões operacionais"
            icon="Target"
            accent="bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={missionStates} margin={{ bottom: 8 }}>
                <CartesianGrid {...gridProps} />
                <XAxis
                  dataKey="name"
                  tick={{ ...axisTick, fontSize: 10 }}
                  axisLine={axisLine}
                  tickLine={false}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={50}
                />
                <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
                <Tooltip content={<ChartTooltip />} cursor={cursorProps} />
                <Bar dataKey="total" fill="#0f766e" radius={[5, 5, 0, 0]} maxBarSize={56} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      )}
    </div>
  );
}

export default AdminDashboardReal;