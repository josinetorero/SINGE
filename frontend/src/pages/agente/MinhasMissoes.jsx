import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, StatusBadge, PrioBadge, EmptyState } from '../../components/common/CommonComponents';
import { MISSOES, OCORRENCIAS } from '../../data/mockData';

/* ─── Gradiente por prioridade (fallback neutro) ─────────────── */
const PRIORIDADE_GRADIENT = {
  'Crítico': 'from-red-500 to-rose-600',
  'Alto':    'from-orange-500 to-amber-600',
  'Médio':   'from-amber-400 to-orange-500',
  'Baixo':   'from-green-500 to-emerald-600',
};

/* ─── Pill por estado (para o contador do cabeçalho) ─────────── */
const ESTADO_PILL = {
  'Em curso':  'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
  'Concluída': 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200/70 dark:border-green-800/60',
  'Suspensa':  'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
};

export function MinhasMissoes({ setPage, setSelectedMissao }) {
  const emCurso = MISSOES.filter(m => m.estado === 'Em curso').length;
  const concluidas = MISSOES.filter(m => m.estado === 'Concluída').length;
  const suspensas = MISSOES.filter(m => m.estado === 'Suspensa').length;

  return (
    <div className="space-y-5">

      {/* ─── Cabeçalho ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-amber-50/70 via-white to-orange-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-amber-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-amber-400/10 dark:bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-orange-400/10 dark:bg-orange-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold uppercase tracking-wider border border-amber-200/60 dark:border-amber-800/50">
                <Icon name="Target" size={11} />
                Agente de Terreno
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700">
                <Icon name="List" size={11} />
                <span className="tabular-nums">{MISSOES.length}</span> missõe{MISSOES.length === 1 ? 'm' : 's'}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">As minhas missões</h2>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
              Lista completa de missões atribuídas à sua equipa operacional.
            </p>
          </div>

          {/* Resumo por estado */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {emCurso > 0 && (
              <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold border ${ESTADO_PILL['Em curso']}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="tabular-nums">{emCurso}</span> em curso
              </span>
            )}
            {concluidas > 0 && (
              <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold border ${ESTADO_PILL['Concluída']}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                <span className="tabular-nums">{concluidas}</span> concluída{concluidas === 1 ? '' : 's'}
              </span>
            )}
            {suspensas > 0 && (
              <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full font-semibold border ${ESTADO_PILL['Suspensa']}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="tabular-nums">{suspensas}</span> suspensa{suspensas === 1 ? '' : 's'}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* ─── Lista de missões ──────────────────────────────────── */}
      {MISSOES.length === 0 ? (
        <Card className="p-4 md:p-6">
          <EmptyState
            icon="Target"
            title="Sem missões atribuídas"
            description="Ainda não existem missões atribuídas à sua equipa operacional."
          />
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-3">
          {MISSOES.map(m => {
            const oc = OCORRENCIAS.find(o => o.ref === m.ocorrenciaRef);
            const gradient = PRIORIDADE_GRADIENT[m.prioridade] || 'from-blue-500 to-indigo-600';
            const isEmCurso = m.estado === 'Em curso';

            return (
              <Card
                key={m.ref}
                className="group relative overflow-hidden p-4 pl-5 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 cursor-pointer"
              >
                {/* Barra lateral de prioridade */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${gradient}`} />

                {/* Topo: ref + status */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted border border-bd dark:border-dborder">
                    {m.ref}
                    {isEmCurso && (
                      <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" title="Em curso" />
                    )}
                  </span>
                  <StatusBadge s={m.estado} />
                </div>

                {/* Título + localização */}
                <p className="text-sm font-semibold text-ink dark:text-dink leading-snug line-clamp-2 min-h-[2.5rem]">
                  {oc?.titulo || '—'}
                </p>
                <div className="flex items-center gap-1 text-xs text-muted dark:text-dmuted mt-1">
                  <Icon name="MapPin" size={11} className="shrink-0" />
                  <span className="truncate">{oc?.distrito}, {oc?.provincia}</span>
                </div>

                {/* Rodapé: prioridade + acção */}
                <div className="mt-3 pt-3 border-t border-bd dark:border-dborder flex items-center justify-between gap-2">
                  <PrioBadge p={m.prioridade} />
                  <button
                    onClick={() => { setSelectedMissao(m); setPage('detalhe-ms'); }}
                    className="inline-flex items-center gap-1 text-xs text-brand dark:text-dblue hover:underline font-semibold"
                  >
                    Ver detalhes
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

export default MinhasMissoes;