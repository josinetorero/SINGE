import React, { useMemo } from 'react';
import Icon from '../../components/common/Icon';
import { StatCard, Card, StatusBadge, PrioBadge } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { EQUIPAS, MISSOES } from '../../data/mockData';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#1D4ED8', '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#7C3AED', '#0EA5E9'];

// Cores por prioridade (para legenda do mapa e badges)
const PRIORITY_LEGEND = [
  { label: 'Crítico', cls: 'bg-red-500' },
  { label: 'Alto',    cls: 'bg-orange-500' },
  { label: 'Médio',   cls: 'bg-amber-500' },
  { label: 'Baixo',   cls: 'bg-emerald-500' },
];

// Cores por estado de missão/equipa
const STATE_COLORS = {
  'Atribuída':    'bg-blue-500',
  'Em curso':     'bg-indigo-500',
  'Concluída':    'bg-emerald-500',
  'Disponível':   'bg-emerald-500',
  'Em missão':    'bg-indigo-500',
  'Indisponível': 'bg-slate-400',
};

function EmptyChart({ label }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-sm text-muted dark:text-dmuted gap-2">
      <Icon name="BarChart3" size={28} className="opacity-30" />
      <p>{label}</p>
    </div>
  );
}

function StateRow({ label, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-light dark:bg-dsidebar/40">
      <StatusBadge s={label} />
      <div className="flex-1 h-1.5 rounded-full bg-white/60 dark:bg-black/30 overflow-hidden">
        <div
          className={`h-full rounded-full ${STATE_COLORS[label] || 'bg-brand'} transition-all`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-sm font-bold text-ink dark:text-dink tabular-nums w-8 text-right">
        {count}
      </p>
    </div>
  );
}

export function CoordenadorDashboard({ setPage, ocorrencias }) {
  const criticas = ocorrencias.filter(o => o.prioridade === 'Crítico').length;
  const pend = ocorrencias.filter(o => o.estado === 'Em análise').length;
  const emCurso = MISSOES.filter(m => m.estado === 'Em curso').length;
  const disp = EQUIPAS.filter(e => e.estado === 'Disponível').length;
  const pendAtrib = MISSOES.filter(m => m.estado === 'Atribuída').length;

  const porEstado = useMemo(
    () =>
      ['Nova', 'Em análise', 'Validada', 'Em resposta', 'Resolvida'].map(e => ({
        name: e,
        value: ocorrencias.filter(o => o.estado === e).length,
      })),
    [ocorrencias]
  );

  const porTipo = useMemo(
    () =>
      [...new Set(ocorrencias.map(o => o.tipo))].map(t => ({
        name: t,
        value: ocorrencias.filter(o => o.tipo === t).length,
      })),
    [ocorrencias]
  );

  const prioritarias = ocorrencias.filter(
    o => o.prioridade === 'Crítico' || o.prioridade === 'Alto'
  );

  const totalMissoes = MISSOES.length;
  const totalEquipas = EQUIPAS.length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink flex items-center gap-2">
          <Icon name="LayoutDashboard" size={22} className="text-brand" />
          Centro de Coordenação de Emergências
        </h2>
        <p className="text-sm text-muted dark:text-dmuted mt-1">
          Monitorize ocorrências, avalie prioridades e coordene operações.
        </p>
      </div>

      {/* KPIs — Operação */}
      <section aria-label="Indicadores de ocorrências">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-dmuted mb-2">
          Ocorrências
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
          <StatCard icon="Activity" label="Activas" value={ocorrencias.length} tone="brand" />
          <StatCard icon="AlertTriangle" label="Críticas" value={criticas} tone="red" />
          <StatCard icon="Clock" label="Pend. decisão" value={pend} tone="orange" />
        </div>
      </section>

      {/* KPIs — Operação */}
      <section aria-label="Indicadores de operação">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-dmuted mb-2">
          Operação
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3">
          <StatCard icon="Target" label="Missões em curso" value={emCurso} tone="brand" />
          <StatCard icon="Users" label="Equipas disp." value={disp} tone="green" />
          <StatCard icon="Inbox" label="Por atribuir" value={pendAtrib} tone="orange" />
        </div>
      </section>

      {/* Mapa + Prioritárias */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <Icon name="Map" size={16} className="text-muted" />
                Mapa operacional
              </h3>
              <p className="text-xs text-muted dark:text-dmuted">Moçambique</p>
            </div>
            <ul className="flex items-center gap-3 text-xs text-muted dark:text-dmuted">
              {PRIORITY_LEGEND.map(p => (
                <li key={p.label} className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${p.cls}`} />
                  {p.label}
                </li>
              ))}
            </ul>
          </div>
          <MozambiqueMap ocorrencias={ocorrencias} height={360} />
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <Icon name="AlertTriangle" size={16} className="text-red-500" />
              Prioritárias
            </h3>
            <span className="text-xs font-semibold rounded-full bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-300 px-2 py-0.5">
              {prioritarias.length}
            </span>
          </div>
          {prioritarias.length === 0 ? (
            <div className="text-center text-sm text-muted dark:text-dmuted py-10 flex flex-col items-center gap-2">
              <Icon name="CheckCircle2" size={28} className="opacity-40" />
              <p>Sem ocorrências prioritárias.</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto pr-1 -mr-1" role="list">
              {prioritarias.map(o => (
                <button
                  key={o.ref}
                  type="button"
                  className="w-full text-left p-3 rounded-lg border border-bd dark:border-dborder hover:bg-light dark:hover:bg-dsidebar/30 hover:border-brand/40 transition-colors"
                  onClick={() => setPage('ocorrencias')}
                  aria-label={`Ver ocorrência ${o.ref}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono font-medium text-muted dark:text-dmuted">
                      {o.ref}
                    </span>
                    <PrioBadge p={o.prioridade} />
                  </div>
                  <p className="text-sm font-medium text-ink dark:text-dink truncate">
                    {o.titulo}
                  </p>
                  <p className="text-xs text-muted dark:text-dmuted flex items-center gap-1 mt-0.5">
                    <Icon name="MapPin" size={11} />
                    {o.distrito}, {o.provincia}
                  </p>
                </button>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <Icon name="BarChart3" size={16} className="text-muted" />
              Ocorrências por estado
            </h3>
          </div>
          <div style={{ height: 240, width: '100%' }}>
            {porEstado.some(d => d.value) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porEstado} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                    height={45}
                  />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="value" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Sem ocorrências registadas." />
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <Icon name="PieChart" size={16} className="text-muted" />
              Distribuição por tipo
            </h3>
          </div>
          <div style={{ height: 240, width: '100%' }}>
            {porTipo.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={porTipo}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {porTipo.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e2e8f0',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart label="Sem dados por tipo." />
            )}
          </div>
        </Card>
      </div>

      {/* Missões + Equipas */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <Icon name="Target" size={16} className="text-muted" />
              Estado das Missões
            </h3>
            <span className="text-xs text-muted dark:text-dmuted">
              {totalMissoes} total
            </span>
          </div>
          <div className="space-y-2">
            {['Atribuída', 'Em curso', 'Concluída'].map(s => (
              <StateRow
                key={s}
                label={s}
                count={MISSOES.filter(m => m.estado === s).length}
                total={totalMissoes}
              />
            ))}
          </div>
          <button
            onClick={() => setPage('missoes')}
            className="mt-3 text-xs font-medium text-brand dark:text-dblue hover:underline flex items-center gap-1"
          >
            Gerir Missões
            <Icon name="ArrowRight" size={14} />
          </button>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <Icon name="Users" size={16} className="text-muted" />
              Disponibilidade de Equipas
            </h3>
            <span className="text-xs text-muted dark:text-dmuted">
              {totalEquipas} total
            </span>
          </div>
          <div className="space-y-2">
            {['Disponível', 'Em missão', 'Indisponível'].map(s => (
              <StateRow
                key={s}
                label={s}
                count={EQUIPAS.filter(e => e.estado === s).length}
                total={totalEquipas}
              />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CoordenadorDashboard;