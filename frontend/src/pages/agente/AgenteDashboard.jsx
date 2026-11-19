import React from 'react';
import Icon from '../../components/common/Icon';
import { StatCard, Card, Button, StatusBadge, PrioBadge } from '../../components/common/CommonComponents';
import { MISSOES, OCORRENCIAS } from '../../data/mockData';

/* ─── Cor de gradiente por prioridade ───────────────────────── */
const PRIORIDADE_GRADIENT = {
  'Crítico': 'from-red-500 to-rose-600',
  'Alto':    'from-orange-500 to-amber-600',
  'Médio':   'from-amber-400 to-orange-500',
  'Baixo':   'from-green-500 to-emerald-600',
};

const PRIORIDADE_RING = {
  'Crítico': 'ring-red-200 dark:ring-red-900/50',
  'Alto':    'ring-orange-200 dark:ring-orange-900/50',
  'Médio':   'ring-amber-200 dark:ring-amber-900/50',
  'Baixo':   'ring-green-200 dark:ring-green-900/50',
};

export function AgenteDashboard({ setPage, setSelectedMissao }) {
  const minhas = MISSOES.slice(0, 2);
  const prox = minhas[0];
  const oc = prox ? OCORRENCIAS.find(o => o.ref === prox.ocorrenciaRef) : null;

  const gradient = PRIORIDADE_GRADIENT[prox?.prioridade] || 'from-blue-500 to-indigo-600';
  const ring = PRIORIDADE_RING[prox?.prioridade] || 'ring-blue-200 dark:ring-blue-900/50';

  /* Distribuição de missões por estado (para a mini-barra) */
  const emCurso = MISSOES.filter(m => m.estado === 'Em curso').length;
  const concluidas = MISSOES.filter(m => m.estado === 'Concluída').length;
  const total = MISSOES.length || 1;

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
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Operacional
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">Painel de Operações</h2>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
              Consulte as suas missões e reporte o estado da intervenção no terreno.
            </p>
          </div>

          {/* Mini-distribuição de missões */}
          <div className="hidden md:flex flex-col gap-2 min-w-[200px]">
            <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted">
              <span>Distribuição</span>
              <span className="tabular-nums">{emCurso + concluidas}/{total}</span>
            </div>
            <div className="flex h-2 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                style={{ width: `${(emCurso / total) * 100}%` }}
                title={`${emCurso} em curso`}
              />
              <div
                className="bg-gradient-to-r from-green-500 to-emerald-500 transition-all"
                style={{ width: `${(concluidas / total) * 100}%` }}
                title={`${concluidas} concluídas`}
              />
            </div>
            <div className="flex items-center gap-3 text-[10px] text-muted dark:text-dmuted">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Em curso
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" /> Concluídas
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* ─── KPIs ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="Target"      label="Atribuídas"   value={MISSOES.length}                                          tone="brand" />
        <StatCard icon="Activity"    label="Em curso"     value={emCurso}                                                 tone="brand" />
        <StatCard icon="CheckCircle" label="Concluídas"   value={concluidas}                                              tone="green" />
        <StatCard icon="RefreshCw"   label="Actualizações" value={1}                                                    tone="orange" />
      </div>

      {/* ─── Missão prioritária ────────────────────────────────── */}
      {prox && (
        <Card className={`overflow-hidden ring-1 ${ring}`}>
          {/* Barra superior com gradiente */}
          <div className={`h-1.5 w-full bg-gradient-to-r ${gradient}`} />

          <div className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              {/* Bloco esquerdo: ícone + info */}
              <div className="flex items-start gap-3.5 min-w-0 flex-1">
                <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md bg-gradient-to-br ${gradient}`}>
                  <Icon name="Target" size={22} />
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-brand dark:text-dblue">
                      <Icon name="AlertCircle" size={10} />
                      Missão prioritária
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted border border-bd dark:border-dborder">
                      {prox.ref}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-ink dark:text-dink leading-snug truncate">
                    {oc?.titulo || '—'}
                  </h3>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-muted dark:text-dmuted flex-wrap">
                    <span className="inline-flex items-center gap-1">
                      <Icon name="MapPin" size={11} />
                      {oc?.distrito}, {oc?.provincia}
                    </span>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="inline-flex items-center gap-1 font-mono">
                      <Icon name="FileText" size={11} />
                      {prox.ocorrenciaRef}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bloco direito: badges */}
              <div className="flex items-center gap-2 flex-wrap shrink-0">
                <StatusBadge s={prox.estado} />
                <PrioBadge p={prox.prioridade} />
              </div>
            </div>

            {/* Acções */}
            <div className="mt-5 flex flex-wrap gap-2 items-center">
              <Button
                onClick={() => { setSelectedMissao(prox); setPage('detalhe-ms'); }}
                icon="Eye"
              >
                Ver missão
              </Button>
              <Button
                variant="secondary"
                onClick={() => { setSelectedMissao(prox); setPage('atualizar'); }}
                icon="RefreshCw"
              >
                Actualizar estado
              </Button>
              <span className="ml-auto inline-flex items-center gap-1.5 text-[11px] text-muted dark:text-dmuted">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                Aguarda actualização
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Missões atribuídas ────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-bd dark:border-dborder flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-amber-500 to-orange-500" />
            Missões atribuídas
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
              {minhas.length}
            </span>
          </h3>
          <button
            onClick={() => setPage('missoes')}
            className="group inline-flex items-center gap-1 text-xs text-brand dark:text-dblue hover:underline font-semibold"
          >
            Ver todas
            <Icon name="ArrowRight" size={12} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="p-4 grid md:grid-cols-2 gap-3">
          {minhas.map(m => {
            const ocorrencia = OCORRENCIAS.find(o => o.ref === m.ocorrenciaRef);
            const mGradient = PRIORIDADE_GRADIENT[m.prioridade] || 'from-blue-500 to-indigo-600';
            const isEmCurso = m.estado === 'Em curso';

            return (
              <div
                key={m.ref}
                className="group relative overflow-hidden p-4 pl-5 rounded-xl border border-bd dark:border-dborder bg-light/40 dark:bg-dsidebar/30 hover:bg-white dark:hover:bg-dsidebar/60 hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200"
              >
                {/* Barra lateral de prioridade */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${mGradient}`} />

                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 text-muted dark:text-dmuted border border-bd dark:border-dborder">
                    {m.ref}
                    {isEmCurso && (
                      <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" title="Em curso" />
                    )}
                  </span>
                  <PrioBadge p={m.prioridade} />
                </div>

                <p className="text-sm font-semibold text-ink dark:text-dink leading-snug line-clamp-2 min-h-[2.5rem]">
                  {ocorrencia?.titulo || '—'}
                </p>

                <div className="flex items-center gap-1 text-xs text-muted dark:text-dmuted mt-1">
                  <Icon name="MapPin" size={11} className="shrink-0" />
                  <span className="truncate">{ocorrencia?.distrito}, {ocorrencia?.provincia}</span>
                </div>

                <div className="mt-3 pt-3 border-t border-bd dark:border-dborder flex items-center justify-between gap-2">
                  <StatusBadge s={m.estado} />
                  <button
                    onClick={() => { setSelectedMissao(m); setPage('detalhe-ms'); }}
                    className="inline-flex items-center gap-1 text-xs text-brand dark:text-dblue hover:underline font-semibold"
                  >
                    Ver missão
                    <Icon name="ArrowRight" size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default AgenteDashboard;