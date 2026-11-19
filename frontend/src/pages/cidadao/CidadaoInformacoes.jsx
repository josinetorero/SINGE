import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, EmptyState } from '../../components/common/CommonComponents';

/* ─── Cores por tipo de perigo ──────────────────────────────── */
const TIPO_PILL = {
  'Inundação':      'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
  'Ciclone':        'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60',
  'Seca':           'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
  'Incêndio':       'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60',
  'Deslizamento':   'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/60',
  'Chuva Intensa':  'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200/70 dark:border-cyan-800/60',
};

const TIPO_ICON = {
  'Inundação': 'Waves',
  'Ciclone': 'Wind',
  'Seca': 'Sun',
  'Incêndio': 'Flame',
  'Deslizamento': 'Mountain',
  'Chuva Intensa': 'CloudRain',
};

const TIPO_GRADIENT = {
  'Inundação': 'from-blue-500 to-cyan-500',
  'Ciclone': 'from-indigo-500 to-purple-500',
  'Seca': 'from-amber-500 to-orange-500',
  'Incêndio': 'from-orange-500 to-red-500',
  'Deslizamento': 'from-rose-500 to-pink-500',
  'Chuva Intensa': 'from-cyan-500 to-blue-500',
};

/* ─── Skeleton ─────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <Card className="p-5">
      <div className="animate-pulse space-y-3">
        <div className="flex items-center gap-2">
          <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
          <div className="h-4 w-24 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-5 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
        <div className="h-3 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
        <div className="h-16 rounded bg-slate-100 dark:bg-slate-800" />
      </div>
    </Card>
  );
}

export function CidadaoInformacoes({ alertas = [], loading = false, error = '', onRefresh, setPage, setSelectedAlerta }) {
  const guides = alertas.filter(alert => alert.activo && alert.recomendacoes?.trim());

  return (
    <div className="mx-auto max-w-6xl space-y-5">

      {/* ─── Cabeçalho ─────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-purple-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold uppercase tracking-wider border border-purple-200/60 dark:border-purple-800/50">
                <Icon name="BookOpen" size={11} />
                Base de Conhecimento
              </span>
              {!loading && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="tabular-nums">{guides.length}</span> guia{guides.length === 1 ? '' : 's'} disponíve{guides.length === 1 ? 'l' : 'is'}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">
              Informações de segurança
            </h1>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
              Recomendações provenientes de alertas publicados por fontes identificadas. Este espaço não contém conteúdo editorial permanente enquanto a API não o disponibilizar.
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
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Não foi possível carregar recomendações</p>
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

      {/* ─── Conteúdo ──────────────────────────────────────── */}
      {loading ? (
        <div role="status" className="grid gap-3 md:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <span className="sr-only">A carregar recomendações…</span>
        </div>
      ) : guides.length === 0 ? (
        <Card>
          <div className="py-10 px-4">
            <EmptyState
              icon="BookOpen"
              title="Não há recomendações publicadas."
              description="Consulte esta área novamente quando houver informação aprovada pelas autoridades."
            />
          </div>
        </Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {guides.map(alert => {
            const tipo = alert.tipo_perigo || '—';
            const pillCls = TIPO_PILL[tipo] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/70 dark:border-slate-700';
            const icon = TIPO_ICON[tipo] || 'AlertTriangle';
            const gradient = TIPO_GRADIENT[tipo] || 'from-blue-500 to-indigo-600';

            return (
              <Card
                key={alert.id}
                className="group relative overflow-hidden p-5 pl-6 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                {/* Barra lateral de cor */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradient}`} />

                {/* Cabeçalho do cartão: tipo + fonte */}
                <div className="flex items-start justify-between gap-2 flex-wrap mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold border ${pillCls}`}>
                      <Icon name={icon} size={10} />
                      {tipo}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted">
                      <Icon name="ShieldCheck" size={10} />
                      {alert.fonte}
                    </span>
                  </div>
                </div>

                {/* Título */}
                <h2 className="font-semibold text-ink dark:text-dink text-base leading-snug line-clamp-2 min-h-[2.75rem]">
                  {alert.titulo}
                </h2>

                {/* Localização */}
                <p className="mt-1.5 text-xs text-muted dark:text-dmuted inline-flex items-center gap-1">
                  <Icon name="MapPin" size={11} className="shrink-0" />
                  <span className="truncate">
                    {alert.area_geografica || [alert.localizacao?.provincia, alert.localizacao?.distrito].filter(Boolean).join(', ') || 'Área não indicada'}
                  </span>
                </p>

                {/* Recomendações em destaque */}
                <div className="mt-3 flex-1 rounded-lg border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20 p-2.5">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-300 mb-1 inline-flex items-center gap-1">
                    <Icon name="Info" size={10} />
                    Recomendações
                  </p>
                  <p className="text-sm text-ink dark:text-dink leading-relaxed line-clamp-4">
                    {alert.recomendacoes}
                  </p>
                </div>

                {/* Rodapé: acção */}
                <div className="mt-3 pt-3 border-t border-bd dark:border-dborder flex items-center justify-end">
                  <button
                    onClick={() => { setSelectedAlerta(alert); setPage('detalhe-alerta'); }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand dark:text-dblue hover:underline"
                  >
                    Consultar alerta e validade
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

export default CidadaoInformacoes;