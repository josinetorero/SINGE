import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, EmptyState } from '../../components/common/CommonComponents';

/* ─── Mapa de níveis (preservado do original + gradientes) ──── */
const nivelMap = {
  critica:     { bg: 'bg-red-700',    label: 'CRÍTICA',     gradient: 'from-red-500 to-rose-600',       pill: 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/70 dark:border-red-800/60',       dot: 'bg-red-500',       icon: 'AlertOctagon' },
  alta:        { bg: 'bg-orange-600', label: 'ALTA',        gradient: 'from-orange-500 to-amber-600',    pill: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60', dot: 'bg-orange-500',    icon: 'AlertTriangle' },
  media:       { bg: 'bg-yellow-600', label: 'MÉDIA',       gradient: 'from-yellow-500 to-orange-500',   pill: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/60 dark:text-yellow-300 border-yellow-200/70 dark:border-yellow-800/60', dot: 'bg-yellow-500',    icon: 'AlertTriangle' },
  baixa:       { bg: 'bg-blue-700',   label: 'BAIXA',       gradient: 'from-blue-500 to-cyan-500',       pill: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',         dot: 'bg-blue-500',      icon: 'Info' },
  informativa: { bg: 'bg-slate-600',  label: 'INFORMAÇÃO',  gradient: 'from-slate-500 to-slate-600',     pill: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200/70 dark:border-slate-700',        dot: 'bg-slate-500',     icon: 'Info' },
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

function formatDateTime(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString();
}

export function CidadaoDetalheAlerta({ a, loading = false, error = '', setPage }) {

  /* ─── Loading skeleton ──────────────────────────────────── */
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="h-4 w-32 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
        <Card className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="flex gap-2">
              <div className="h-5 w-20 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div className="h-5 w-24 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>
            <div className="h-6 w-3/4 rounded bg-slate-200 dark:bg-slate-700" />
            <div className="grid sm:grid-cols-2 gap-3">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-14 rounded-lg bg-slate-100 dark:bg-slate-800" />
              ))}
            </div>
            <div className="h-3 w-full rounded bg-slate-100 dark:bg-slate-800" />
            <div className="h-3 w-5/6 rounded bg-slate-100 dark:bg-slate-800" />
          </div>
        </Card>
        <span className="sr-only" role="status">A carregar alerta…</span>
      </div>
    );
  }

  /* ─── Erro ──────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <Card role="alert" className="p-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
              <Icon name="AlertOctagon" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Não foi possível carregar o alerta</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ─── Empty state ───────────────────────────────────────── */
  if (!a) {
    return (
      <div className="max-w-3xl mx-auto">
        <EmptyState
          icon="Bell"
          title="Nenhum alerta seleccionado"
          description="Escolha um alerta a partir da lista para consultar os detalhes."
          action={<Button onClick={() => setPage('alertas')} icon="ArrowLeft">Voltar aos alertas</Button>}
        />
      </div>
    );
  }

  const lvl = nivelMap[a.severidade] || nivelMap.informativa;

  return (
    <div className="max-w-3xl mx-auto space-y-5">

      {/* ─── Botão voltar ──────────────────────────────────── */}
      <button
        onClick={() => setPage('alertas')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted dark:text-dmuted hover:text-brand dark:hover:text-dblue transition-colors group"
      >
        <Icon name="ChevronLeft" size={16} className="transition-transform group-hover:-translate-x-0.5" />
        Voltar aos alertas
      </button>

      {/* ─── Cabeçalho ─────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-blue-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/50">
              <Icon name="Bell" size={11} />
              Alerta Público
            </span>
            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${lvl.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${lvl.dot} ${a.severidade === 'critica' ? 'animate-pulse' : ''}`} />
              {lvl.label}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700">
              <Icon name={lvl.icon} size={11} />
              {a.tipo_perigo}
            </span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-dink leading-snug">{a.titulo}</h1>

          <div className="flex items-center gap-2 mt-2 text-xs text-muted dark:text-dmuted flex-wrap">
            <span className="inline-flex items-center gap-1">
              <Icon name="MapPin" size={11} />
              {a.area_geografica || [a.localizacao?.provincia, a.localizacao?.distrito].filter(Boolean).join(', ') || 'Área não indicada'}
            </span>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <span className="inline-flex items-center gap-1">
              <Icon name="Clock" size={11} />
              {formatDateTime(a.data_publicacao)}
            </span>
          </div>
        </div>
      </header>

      {/* ─── Cartão principal ──────────────────────────────── */}
      <Card className="relative overflow-hidden">
        {/* Barra lateral de severidade */}
        <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b ${lvl.gradient}`} />

        <div className="p-5 md:p-6 pl-6 md:pl-7 space-y-5">

          {/* Badges de estado */}
          {(a.estado === 'encerrado' || (a.estado === 'publicado' && !a.activo)) && (
            <div className="flex flex-wrap items-center gap-2">
              {a.estado === 'encerrado' && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700">
                  <Icon name="CheckCircle" size={11} />
                  Encerrado
                </span>
              )}
              {a.estado === 'publicado' && !a.activo && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/70 dark:border-amber-800/60">
                  <Icon name="Clock" size={11} />
                  Fora do período de validade
                </span>
              )}
            </div>
          )}

          {/* Grelha de metadados */}
          <div>
            <SectionTitle icon="Info" accent="bg-gradient-to-b from-blue-500 to-indigo-500" title="Informação do Alerta" />
            <div className="grid sm:grid-cols-2 gap-2 mt-3">
              {[
                {
                  label: 'Região afectada',
                  value: a.area_geografica || [a.localizacao?.provincia, a.localizacao?.distrito].filter(Boolean).join(', ') || 'Não indicada',
                  icon: 'MapPin',
                },
                {
                  label: 'Publicado em',
                  value: formatDateTime(a.data_publicacao),
                  icon: 'Calendar',
                },
                {
                  label: 'Período de validade',
                  value: `${formatDateTime(a.valido_desde)} – ${formatDateTime(a.valido_ate)}`,
                  icon: 'Clock',
                },
                {
                  label: 'Entidade responsável',
                  value: a.fonte || '—',
                  icon: 'ShieldCheck',
                },
              ].map((row, i) => (
                <div key={i} className="p-3 rounded-lg border border-bd dark:border-dborder bg-light/60 dark:bg-dsidebar/40">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted inline-flex items-center gap-1 mb-1">
                    <Icon name={row.icon} size={10} />
                    {row.label}
                  </p>
                  <p className="text-sm font-medium text-ink dark:text-dink break-words">{row.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Descrição */}
          <div className="pt-3 border-t border-bd dark:border-dborder">
            <SectionTitle icon="FileText" accent="bg-gradient-to-b from-cyan-500 to-blue-500" title="Descrição da Situação" />
            <p className="text-sm text-ink dark:text-dink leading-relaxed">{a.descricao}</p>
          </div>

          {/* Recomendações */}
          <div className="rounded-xl border border-blue-200/70 dark:border-blue-900/50 bg-blue-50/60 dark:bg-blue-950/30 p-4">
            <h3 className="font-semibold text-ink dark:text-dink mb-2 flex items-center gap-2">
              <span className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
              <Icon name="Shield" size={16} className="text-brand dark:text-dblue" />
              Recomendações Oficiais de Segurança
            </h3>
            <p className="text-sm text-ink dark:text-dink leading-relaxed">{a.recomendacoes}</p>
          </div>

          {/* Rodapé com fonte */}
          <div className="pt-3 border-t border-bd dark:border-dborder">
            <p className="text-[11px] text-muted dark:text-dmuted inline-flex items-center gap-1.5">
              <Icon name="ShieldCheck" size={11} />
              Fonte / autoridade emissora: <span className="font-medium text-ink dark:text-dink">{a.fonte}</span>
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default CidadaoDetalheAlerta;