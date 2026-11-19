import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, PrioBadge, Timeline, EmptyState } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { OCORRENCIAS, EQUIPAS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

/* ─── Gradiente por prioridade (fallback neutro) ─────────────── */
const PRIORIDADE_GRADIENT = {
  'Crítico': 'from-red-500 to-rose-600',
  'Alto':    'from-orange-500 to-amber-600',
  'Médio':   'from-amber-400 to-orange-500',
  'Baixo':   'from-green-500 to-emerald-600',
};

/* ─── Cor do badge do tipo de equipa ─────────────────────────── */
const EQUIPA_TIPO_COLOR = {
  'Bombeiros':          'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/70 dark:border-red-800/60',
  'INEM':               'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60',
  'Protecção Civil':    'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
  'Polícia':            'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60',
  'Forças Armadas':     'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
  'ONG':                'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200/70 dark:border-purple-800/60',
};

/* ─── Section header reutilizável ────────────────────────────── */
function SectionHeader({ icon, accent, title }) {
  return (
    <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2 mb-3">
      <span className={`w-1 h-4 rounded-full ${accent}`} />
      {icon && <Icon name={icon} size={14} className="text-muted dark:text-dmuted" />}
      {title}
    </h3>
  );
}

export function DetalheMissao({ m, setPage }) {
  const toast = useToast();

  /* ─── Empty state ────────────────────────────────────────── */
  if (!m) {
    return (
      <div className="max-w-2xl">
        <EmptyState
          icon="Target"
          title="Nenhuma missão seleccionada"
          description="Escolha uma missão a partir do painel de missões para consultar os seus detalhes."
          action={<Button onClick={() => setPage('missoes')} icon="ArrowLeft">Voltar às missões</Button>}
        />
      </div>
    );
  }

  const oc = OCORRENCIAS.find(o => o.ref === m.ocorrenciaRef);
  const eq = EQUIPAS.find(e => e.id === m.equipa);

  const gradient = PRIORIDADE_GRADIENT[m.prioridade] || 'from-blue-500 to-indigo-600';
  const equipaColor = EQUIPA_TIPO_COLOR[eq?.tipo] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';

  return (
    <div className="space-y-5">

      {/* ─── Botão voltar ─────────────────────────────────────── */}
      <button
        onClick={() => setPage('missoes')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted dark:text-dmuted hover:text-brand dark:hover:text-dblue transition-colors group"
      >
        <Icon name="ChevronLeft" size={16} className="transition-transform group-hover:-translate-x-0.5" />
        Voltar às missões
      </button>

      {/* ─── Cabeçalho ────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-blue-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md bg-gradient-to-br ${gradient}`}>
              <Icon name="Target" size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-800 text-muted dark:text-dmuted border border-bd dark:border-dborder">
                  {m.ref}
                </span>
                <span className="text-[10px] uppercase tracking-wider font-semibold text-brand dark:text-dblue">
                  Detalhe da Missão
                </span>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink leading-snug truncate">
                {oc?.titulo || '—'}
              </h2>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted dark:text-dmuted flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Icon name="MapPin" size={11} />
                  {oc?.distrito}, {oc?.provincia}
                </span>
                {eq?.nome && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="Users" size={11} />
                      {eq.nome}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <StatusBadge s={m.estado} />
            <PrioBadge p={m.prioridade} />
          </div>
        </div>
      </header>

      {/* ─── Grelha principal ─────────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* ─── Coluna esquerda (2/3) ──────────────────────────── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Objectivos + Instruções */}
          <Card className="p-5">
            <SectionHeader
              icon="Target"
              accent="bg-gradient-to-b from-blue-500 to-indigo-500"
              title="Objectivos da Missão"
            />
            <p className="text-sm text-ink dark:text-dink leading-relaxed">{m.objetivos || '—'}</p>

            <div className="my-4 border-t border-bd dark:border-dborder" />

            <SectionHeader
              icon="FileText"
              accent="bg-gradient-to-b from-cyan-500 to-blue-500"
              title="Instruções Operacionais"
            />
            <p className="text-sm text-ink dark:text-dink leading-relaxed">{m.instrucoes || '—'}</p>
          </Card>

          {/* Progresso reportado */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <SectionHeader
                icon="Activity"
                accent="bg-gradient-to-b from-purple-500 to-pink-500"
                title="Progresso Reportado"
              />
              {m.progresso?.length > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                  {m.progresso.length} actualizaç{m.progresso.length === 1 ? 'ão' : 'ões'}
                </span>
              )}
            </div>

            {m.progresso.length ? (
              <Timeline items={m.progresso} />
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted flex items-center justify-center">
                  <Icon name="History" size={18} />
                </div>
                <p className="text-sm text-muted dark:text-dmuted italic">
                  Sem actualizações registadas para esta missão.
                </p>
              </div>
            )}
          </Card>

          {/* Acções */}
          <div className="flex flex-wrap gap-2 justify-end">
            <Button
              variant="secondary"
              icon="CheckCircle"
              onClick={() => toast.info('Registo de relatório final requer backend.')}
            >
              Registar resultado
            </Button>
            <Button icon="RefreshCw" onClick={() => setPage('atualizar')}>
              Actualizar estado
            </Button>
          </div>
        </div>

        {/* ─── Coluna direita (1/3) ──────────────────────────── */}
        <div className="space-y-4">

          {/* Equipa */}
          <Card className="p-5">
            <SectionHeader
              icon="Users"
              accent="bg-gradient-to-b from-amber-500 to-orange-500"
              title="Equipa Designada"
            />

            {eq ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 text-white text-sm font-bold flex items-center justify-center shrink-0 shadow-sm">
                    {(eq.nome || '?').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-ink dark:text-dink truncate">{eq.nome}</p>
                    <p className="text-xs text-muted dark:text-dmuted">Equipa operacional</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {eq.tipo && (
                    <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold border ${equipaColor}`}>
                      <Icon name="ShieldCheck" size={10} />
                      {eq.tipo}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    <Icon name="Users" size={10} />
                    <span className="tabular-nums">{eq.membros}</span> membros
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted dark:text-dmuted italic">Equipa não atribuída.</p>
            )}
          </Card>

          {/* Localização */}
          <Card className="p-5">
            <SectionHeader
              icon="MapPin"
              accent="bg-gradient-to-b from-emerald-500 to-teal-500"
              title="Localização da Emergência"
            />
            <div className="h-48 rounded-xl overflow-hidden border border-bd dark:border-dborder">
              <MozambiqueMap ocorrencias={oc ? [oc] : []} height={192} />
            </div>
            {oc?.distrito && (
              <p className="text-[11px] text-muted dark:text-dmuted mt-2 inline-flex items-center gap-1">
                <Icon name="MapPin" size={10} />
                {oc.distrito}, {oc.provincia}
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DetalheMissao;