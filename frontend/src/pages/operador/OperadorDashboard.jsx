import React, { useMemo } from 'react';
import Icon from '../../components/common/Icon';
import { Card, StatCard, StatusBadge } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const STATE_LABELS = {
  registada: 'Registada',
  em_avaliacao: 'Em avaliação',
  em_atendimento: 'Em atendimento',
  resolvida: 'Resolvida',
  cancelada: 'Cancelada',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

const TOOLTIP_STYLE = {
  borderRadius: 8,
  border: '1px solid #e2e8f0',
  fontSize: 12,
};

function EmptyChart({ label, icon = 'BarChart3' }) {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center text-sm text-muted dark:text-dmuted gap-2">
      <Icon name={icon} size={28} className="opacity-30" />
      <p>{label}</p>
    </div>
  );
}

function ChartCard({ title, icon, loading, empty, children }) {
  return (
    <Card className="p-5">
      <h2 className="mb-3 font-semibold text-ink dark:text-dink flex items-center gap-2">
        <Icon name={icon} size={16} className="text-muted" />
        {title}
      </h2>
      {loading ? (
        <div className="h-56 flex items-center justify-center" role="status" aria-live="polite">
          <span className="inline-flex items-center gap-2 text-sm text-muted dark:text-dmuted">
            <span className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
            A carregar…
          </span>
        </div>
      ) : empty ? (
        <div className="h-56">{children}</div>
      ) : (
        children
      )}
    </Card>
  );
}

export function OperadorDashboard({
  user,
  ocorrencias = [],
  estatisticas = {},
  identidadeStats,
  identidadeStatsError,
  loading,
  error,
  onRefresh,
  onSelect,
  setPage,
  notificationsTotal = 0,
  alertsTotal = 0,
}) {
  const tiposComTotal = useMemo(
    () => (estatisticas.por_tipo || []).filter(item => Number(item.total) > 0),
    [estatisticas.por_tipo]
  );
  const estadosValidacao = useMemo(
    () =>
      Object.entries(estatisticas.por_estado_validacao || {}).map(([estado, total]) => ({
        estado: estado.replaceAll('_', ' '),
        total: Number(total),
      })),
    [estatisticas.por_estado_validacao]
  );
  const provincias = estatisticas.por_provincia || [];
  const identidadesPorAnalisar = identidadeStats
    ? (identidadeStats.pendentes ?? 0) + (identidadeStats.em_analise ?? 0)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold uppercase tracking-wider">
            <Icon name="Headset" size={12} />
            Central de Atendimento e Triagem
          </span>
          <h1 className="text-2xl font-bold text-ink dark:text-dink mt-2">Painel do Operador</h1>
          <p className="text-sm text-muted dark:text-dmuted mt-1">
            Olá, <strong className="text-ink dark:text-dink">{user.name}</strong>. Consulte as ocorrências e registe a validação inicial.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Actualizar painel"
          className="group p-2 rounded-lg border border-bd dark:border-dborder text-ink dark:text-dink disabled:opacity-50 hover:bg-light dark:hover:bg-dsidebar transition-colors"
        >
          <Icon
            name="RefreshCw"
            size={18}
            className={loading ? 'animate-spin' : 'transition-transform group-hover:rotate-90'}
          />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatCard icon="FileText" label="Total de ocorrências" value={loading ? '…' : (estatisticas.total ?? 0)} tone="brand" />
        <StatCard
          icon="ShieldCheck"
          label="Identidades por analisar"
          value={loading || identidadesPorAnalisar === null ? '…' : identidadesPorAnalisar}
          tone="orange"
        />
        <StatCard icon="Bell" label="Total de notificações" value={notificationsTotal} tone="brand" />
        <StatCard icon="AlertTriangle" label="Total de alertas" value={alertsTotal} tone="red" />
      </div>

      {/* Identidade — erro */}
      {identidadeStatsError && (
        <div
          role="alert"
          className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100"
        >
          <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0" />
          <p>{identidadeStatsError}</p>
        </div>
      )}

      {/* Gráficos */}
      <div className="grid gap-4 xl:grid-cols-2">
        <ChartCard
          title="Ocorrências por tipo"
          icon="BarChart3"
          loading={loading}
          empty={!tiposComTotal.length}
        >
          {tiposComTotal.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tiposComTotal}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="total" fill="#0f766e" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Sem ocorrências por classificar." />
          )}
        </ChartCard>

        <ChartCard
          title="Estado da validação mais recente"
          icon="CheckSquare"
          loading={loading}
          empty={!estadosValidacao.length}
        >
          {estadosValidacao.length ? (
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={estadosValidacao}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="estado" tick={{ fontSize: 10 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="total" fill="#ea580c" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyChart label="Ainda não foram registadas validações." icon="ClipboardCheck" />
          )}
        </ChartCard>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="Map" size={16} className="text-muted" />
            Localização das ocorrências
          </h2>
          {ocorrencias.some(item => item.latitude != null || item.localizacao_geografica?.latitude != null) ? (
            <div className="h-[300px] rounded-lg overflow-hidden border border-bd dark:border-dborder">
              <MozambiqueMap
                ocorrencias={ocorrencias}
                height={300}
                onSelectOccurrence={item => onSelect(item.id)}
              />
            </div>
          ) : (
            <div className="h-[300px]">
              <EmptyChart
                label="As ocorrências recentes ainda não têm coordenadas verificadas."
                icon="MapPin"
              />
            </div>
          )}
        </Card>

        <Card className="p-5">
          <h2 className="mb-3 font-semibold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="MapPin" size={16} className="text-muted" />
            Ocorrências por província
          </h2>
          {provincias.length ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={provincias} margin={{ top: 8, right: 12, left: -12, bottom: 35 }}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                  <XAxis dataKey="nome" tick={{ fontSize: 10 }} angle={-20} textAnchor="end" interval={0} />
                  <YAxis allowDecimals={false} />
                  <Tooltip contentStyle={TOOLTIP_STYLE} />
                  <Bar dataKey="total" fill="#0f766e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[300px]">
              <EmptyChart label="Sem ocorrências por província." icon="MapPin" />
            </div>
          )}
        </Card>
      </div>

      {/* Ocorrências recentes */}
      <Card>
        <div className="p-5 border-b border-bd dark:border-dborder flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <Icon name="Clock" size={16} className="text-muted" />
              Ocorrências recentes
            </h2>
            <p className="text-xs text-muted dark:text-dmuted mt-1">
              Ordenadas pela data de registo na API.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPage('ocorrencias')}
            className="text-xs font-medium text-brand dark:text-dblue hover:underline flex items-center gap-1"
          >
            Abrir lista <Icon name="ArrowRight" size={14} />
          </button>
        </div>

        {error ? (
          <div className="p-5" role="alert">
            <div className="flex items-start gap-2.5 rounded-lg border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-3 text-sm text-red-800 dark:text-red-200">
              <Icon name="AlertCircle" size={16} className="mt-0.5 shrink-0" />
              <div className="flex-1">
                <p>{error}</p>
                <button type="button" onClick={onRefresh} className="mt-2 text-xs font-medium underline hover:no-underline">
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="p-5 space-y-3" aria-busy="true">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-3 w-12 rounded bg-lblue/40 dark:bg-dblue/20" />
                <div className="h-3 flex-1 rounded bg-lblue/40 dark:bg-dblue/20" />
                <div className="h-3 w-24 rounded bg-lblue/40 dark:bg-dblue/20" />
                <div className="h-3 w-20 rounded bg-lblue/40 dark:bg-dblue/20" />
              </div>
            ))}
          </div>
        ) : ocorrencias.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted dark:text-dmuted flex flex-col items-center gap-2">
            <Icon name="FileText" size={28} className="opacity-40" />
            <p>Não existem ocorrências registadas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase tracking-wide text-muted dark:text-dmuted">
                <tr>
                  {['ID', 'Tipo', 'Localização', 'Data/hora', 'Estado', ''].map(heading => (
                    <th
                      key={heading || 'actions'}
                      scope="col"
                      className={`px-4 py-2.5 font-semibold whitespace-nowrap ${heading === '' ? 'text-right' : 'text-left'}`}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                {ocorrencias.slice(0, 5).map(occurrence => (
                  <tr key={occurrence.id} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs font-medium text-ink dark:text-dink">#{occurrence.id}</td>
                    <td className="px-4 py-3 text-ink dark:text-dink">{occurrence.tipo_ocorrencia?.nome || '—'}</td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted">
                      {[occurrence.localizacao_geografica?.distrito, occurrence.localizacao_geografica?.provincia]
                        .filter(Boolean).join(', ') || occurrence.localizacao || '—'}
                    </td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{formatDate(occurrence.created_at)}</td>
                    <td className="px-4 py-3"><StatusBadge s={STATE_LABELS[occurrence.estado] || occurrence.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => onSelect(occurrence.id)}
                        aria-label={`Consultar ocorrência ${occurrence.id}`}
                        className="p-1.5 rounded-md text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar transition-colors"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default OperadorDashboard;