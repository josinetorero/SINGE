import React, { useMemo, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, EmptyState, inputCls } from '../../components/common/CommonComponents';

const severityLabel = {
  critica: 'CRÍTICA',
  alta: 'ALTA',
  media: 'MÉDIA',
  baixa: 'BAIXA',
  informativa: 'INFORMAÇÃO',
};

const severityClass = {
  critica: 'bg-red-700',
  alta: 'bg-orange-600',
  media: 'bg-yellow-600',
  baixa: 'bg-blue-700',
  informativa: 'bg-slate-600',
};

/* ─── Gradientes/acentos por severidade ──────────────────────── */
const SEVERITY_GRADIENT = {
  critica:     'from-red-500 to-rose-600',
  alta:        'from-orange-500 to-amber-600',
  media:       'from-yellow-500 to-orange-500',
  baixa:       'from-blue-500 to-cyan-500',
  informativa: 'from-slate-500 to-slate-600',
};

const SEVERITY_PILL = {
  critica:     'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/70 dark:border-red-800/60',
  alta:        'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60',
  media:       'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200/70 dark:border-yellow-800/60',
  baixa:       'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
  informativa: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/70 dark:border-slate-700',
};

const SEVERITY_DOT = {
  critica: 'bg-red-500',
  alta: 'bg-orange-500',
  media: 'bg-yellow-500',
  baixa: 'bg-blue-500',
  informativa: 'bg-slate-500',
};

const SEVERITY_ICON = {
  critica: 'AlertOctagon',
  alta: 'AlertTriangle',
  media: 'AlertTriangle',
  baixa: 'Info',
  informativa: 'Info',
};

const formatDate = value => value ? new Date(value).toLocaleString() : '—';

function SkeletonAlert() {
  return (
    <Card className="p-5">
      <div className="animate-pulse space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-12 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </Card>
  );
}

export function CidadaoAlertas({ alertas = [], loading = false, error = '', onRefresh, setPage, setSelectedAlerta }) {
  const [type, setType] = useState('');
  const [severity, setSeverity] = useState('');

  const types = useMemo(() => [...new Set(alertas.map(alert => alert.tipo_perigo))], [alertas]);
  const filtered = alertas.filter(alert => (!type || alert.tipo_perigo === type)
    && (!severity || alert.severidade === severity));

  const hasFilters = Boolean(type || severity);
  const clearFilters = () => { setType(''); setSeverity(''); };

  return (
    <div className="mx-auto max-w-6xl space-y-5">

      {/* ─── Cabeçalho ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-blue-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/50">
                <Icon name="Bell" size={11} />
                Informação pública
              </span>
              {!loading && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="tabular-nums">{filtered.length}</span> alerta{filtered.length === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">Alertas públicos</h1>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
              Alertas publicados por autoridades autorizadas. A relevância geográfica refere-se à área indicada, não à localização actual do cidadão.
            </p>
          </div>
        </div>
      </header>

      {/* ─── Erro ──────────────────────────────────────────────── */}
      {error && (
        <Card role="alert" className="p-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
              <Icon name="AlertOctagon" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Não foi possível carregar os alertas</p>
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
      )}

      {/* ─── Filtros ───────────────────────────────────────────── */}
      <Card className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-ink dark:text-dink flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
            Filtrar Alertas
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-medium tabular-nums">
              {filtered.length} de {alertas.length}
            </span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                <Icon name="X" size={12} /> Limpar
              </button>
            )}
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Tipo de perigo
            </label>
            <select className={inputCls} value={type} onChange={event => setType(event.target.value)}>
              <option value="">Todos os tipos de perigo</option>
              {types.map(value => <option key={value} value={value}>{value}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Severidade
            </label>
            <select className={inputCls} value={severity} onChange={event => setSeverity(event.target.value)}>
              <option value="">Todas as severidades</option>
              {Object.entries(severityLabel).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* ─── Conteúdo ──────────────────────────────────────────── */}
      {loading ? (
        <div role="status" className="space-y-3">
          <SkeletonAlert />
          <SkeletonAlert />
          <span className="sr-only">A carregar alertas publicados…</span>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="py-10 px-4">
            <EmptyState icon="Bell" title="Não há alertas publicados para estes filtros." />
            {hasFilters && (
              <div className="text-center mt-2">
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Limpar filtros e ver todos os alertas
                </button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map(alert => {
            const sev = alert.severidade || 'informativa';
            const gradient = SEVERITY_GRADIENT[sev] || SEVERITY_GRADIENT.informativa;
            const pill = SEVERITY_PILL[sev] || SEVERITY_PILL.informativa;
            const dot = SEVERITY_DOT[sev] || SEVERITY_DOT.informativa;
            const sevIcon = SEVERITY_ICON[sev] || 'Info';

            return (
              <Card key={alert.id} className="relative overflow-hidden p-5 pl-6 hover:shadow-md transition-shadow">
                {/* Barra lateral de severidade */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradient}`} />

                {/* Badges de topo */}
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${pill}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${dot} ${sev === 'critica' ? 'animate-pulse' : ''}`} />
                    {severityLabel[alert.severidade] || alert.severidade}
                  </span>

                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                    <Icon name={sevIcon} size={10} />
                    {alert.tipo_perigo}
                  </span>

                  {alert.estado === 'encerrado' && (
                    <span className="rounded-full bg-slate-200 dark:bg-slate-700 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      Encerrado
                    </span>
                  )}
                  {alert.estado === 'publicado' && !alert.activo && (
                    <span className="rounded-full bg-amber-100 dark:bg-amber-950/60 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
                      Fora do período de validade
                    </span>
                  )}
                </div>

                {/* Título */}
                <h2 className="text-lg font-bold text-ink dark:text-dink leading-snug">
                  {alert.titulo}
                </h2>

                {/* Metadados */}
                <div className="flex items-center gap-2 mt-1.5 text-xs text-muted dark:text-dmuted flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <Icon name="MapPin" size={11} />
                    {alert.area_geografica || [alert.localizacao?.provincia, alert.localizacao?.distrito].filter(Boolean).join(', ') || 'Não indicada'}
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Icon name="Clock" size={11} />
                    Publicado: {formatDate(alert.data_publicacao)}
                  </span>
                </div>

                {/* Descrição */}
                <p className="mt-3 text-sm text-ink dark:text-dink leading-relaxed">
                  {alert.descricao}
                </p>

                {/* Recomendações (bloco destacado) */}
                <div className="mt-3 rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 p-3">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-300 mb-1 inline-flex items-center gap-1">
                    <Icon name="Info" size={11} />
                    Recomendações
                  </p>
                  <p className="text-sm text-ink dark:text-dink leading-relaxed">
                    {alert.recomendacoes}
                  </p>
                </div>

                {/* Rodapé */}
                <div className="mt-3 pt-3 border-t border-bd dark:border-dborder flex flex-wrap items-center justify-between gap-2">
                  <p className="text-[11px] text-muted dark:text-dmuted inline-flex items-center gap-1.5">
                    <Icon name="ShieldCheck" size={11} />
                    Fonte: <span className="font-medium text-ink dark:text-dink">{alert.fonte}</span>
                  </p>
                  <button
                    onClick={() => { setSelectedAlerta(alert); setPage('detalhe-alerta'); }}
                    className="group inline-flex items-center gap-1 text-xs font-semibold text-brand dark:text-dblue hover:underline"
                  >
                    Ver detalhe
                    <Icon name="ArrowRight" size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CidadaoAlertas;