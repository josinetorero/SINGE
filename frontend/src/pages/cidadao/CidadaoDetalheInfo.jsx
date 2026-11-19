import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, EmptyState } from '../../components/common/CommonComponents';

/* ─── Gradiente por categoria (fallback neutro) ─────────────── */
const CATEGORIA_GRADIENT = {
  'Prevenção':        'from-blue-500 to-cyan-500',
  'Durante':          'from-orange-500 to-red-500',
  'Após':             'from-emerald-500 to-teal-500',
  'Primeiros Socorros':'from-rose-500 to-pink-500',
  'Kit de Emergência':'from-amber-500 to-orange-500',
  'Contactos':        'from-indigo-500 to-purple-500',
};

const CATEGORIA_PILL = {
  'Prevenção':        'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
  'Durante':          'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60',
  'Após':             'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60',
  'Primeiros Socorros':'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200/70 dark:border-rose-800/60',
  'Kit de Emergência':'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
  'Contactos':        'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200/70 dark:border-indigo-800/60',
};

/* ─── Section header reutilizável ───────────────────────────── */
function SectionTitle({ icon, accent, title }) {
  return (
    <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2 mb-2">
      <span className={`w-1 h-4 rounded-full ${accent}`} />
      {icon && <Icon name={icon} size={14} className="text-muted dark:text-dmuted" />}
      {title}
    </h3>
  );
}

export function CidadaoDetalheInfo({ info, setPage }) {

  /* ─── Empty state ───────────────────────────────────────── */
  if (!info) {
    return (
      <div className="max-w-3xl mx-auto">
        <EmptyState
          icon="BookOpen"
          title="Nenhuma informação seleccionada"
          description="Escolha um tópico a partir da base de conhecimento para consultar o conteúdo completo."
          action={<Button onClick={() => setPage('informacoes')} icon="ArrowLeft">Voltar às informações</Button>}
        />
      </div>
    );
  }

  const gradient = CATEGORIA_GRADIENT[info.categoria] || 'from-blue-500 to-indigo-600';
  const pillCls = CATEGORIA_PILL[info.categoria] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/70 dark:border-slate-700';

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ─── Botão voltar ──────────────────────────────────── */}
      <button
        onClick={() => setPage('informacoes')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted dark:text-dmuted hover:text-brand dark:hover:text-dblue transition-colors group"
      >
        <Icon name="ChevronLeft" size={16} className="transition-transform group-hover:-translate-x-0.5" />
        Voltar às informações
      </button>

      {/* ─── Cabeçalho ─────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-purple-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative flex items-start gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md bg-gradient-to-br ${gradient}`}>
            <Icon name={info.icon || 'BookOpen'} size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold uppercase tracking-wider border border-purple-200/60 dark:border-purple-800/50">
                <Icon name="BookOpen" size={11} />
                Base de Conhecimento
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${pillCls}`}>
                <Icon name="Tag" size={10} />
                {info.categoria}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-dink leading-snug">
              {info.titulo}
            </h1>
            <p className="mt-1 text-xs text-muted dark:text-dmuted inline-flex items-center gap-1">
              <Icon name="FileText" size={11} />
              Conteúdo informativo · recomendações gerais de protecção civil
            </p>
          </div>
        </div>
      </header>

      {/* ─── Cartão de conteúdo ─────────────────────────────── */}
      <Card className="relative overflow-hidden">
        {/* Barra lateral com cor de categoria */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${gradient}`} />

        <div className="p-5 md:p-6 pl-6 md:pl-7 space-y-5">

          {/* Conteúdo principal */}
          <div>
            <SectionTitle
              icon="FileText"
              accent="bg-gradient-to-b from-cyan-500 to-blue-500"
              title="Conteúdo"
            />
            <p className="text-sm text-ink dark:text-dink leading-relaxed whitespace-pre-line">
              {info.conteudo}
            </p>
          </div>

          {/* Nota institucional */}
          <div className="pt-4 border-t border-bd dark:border-dborder">
            <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/50 bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/40 dark:to-orange-950/30 p-4 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Icon name="Info" size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-bold text-amber-700 dark:text-amber-300 mb-1">
                  Nota Institucional
                </p>
                <p className="text-xs text-amber-900 dark:text-amber-100 leading-relaxed">
                  Estas são recomendações gerais de protecção civil. Siga sempre as instruções das autoridades competentes em situações reais de emergência.
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CidadaoDetalheInfo;