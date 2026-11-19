import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, StatCard, StatusBadge } from '../../components/common/CommonComponents';

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
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium' }).format(date);
}

/* ─── Skeleton de linha ──────────────────────────────────── */
function SkeletonRow() {
  return (
    <tr>
      {[1, 2, 3, 4, 5, 6].map(i => (
        <td key={i} className="px-4 py-3">
          <div className="h-3 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" style={{ width: `${60 + (i % 3) * 15}%` }} />
        </td>
      ))}
    </tr>
  );
}

export function CidadaoDashboard({
  user,
  occurrences = [],
  statistics = { total: 0, em_acompanhamento: 0, resolvidas: 0 },
  loading,
  error,
  unreadNotifications = 0,
  identityStatus = null,
  onRefresh,
  onSelect,
  setPage,
}) {
  const identityApproved = Boolean(identityStatus?.elegivel);

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ─── Cabeçalho ─────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-emerald-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold uppercase tracking-wider border border-emerald-200/60 dark:border-emerald-800/50">
                <Icon name="User" size={11} />
                Área do Cidadão
              </span>
              {identityApproved ? (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                  <Icon name="ShieldCheck" size={11} />
                  Identidade verificada
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-semibold border border-amber-200/60 dark:border-amber-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Identidade pendente
                </span>
              )}
              {unreadNotifications > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-semibold border border-blue-200/60 dark:border-blue-800/50">
                  <Icon name="Bell" size={11} />
                  <span className="tabular-nums">{unreadNotifications}</span> nova{unreadNotifications === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-ink dark:text-dink truncate">
              Bem-vindo(a), {user.name}
            </h1>
            <p className="text-sm text-muted dark:text-dmuted mt-1">
              Acompanhe as comunicações registadas na sua conta.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-bd dark:border-dborder bg-white dark:bg-dsidebar text-ink dark:text-dink disabled:opacity-50 shadow-sm hover:border-brand hover:text-brand dark:hover:border-dblue dark:hover:text-dblue active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-brand/40 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
              aria-label="Actualizar painel"
            >
              <Icon name="RefreshCw" size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button
              onClick={() => setPage(identityApproved ? 'comunicar' : 'verificacao')}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <Icon name="AlertCircle" size={16} />
              <span className="hidden sm:inline">Comunicar ocorrência</span>
              <span className="sm:hidden">Comunicar</span>
            </button>
          </div>
        </div>
      </header>

      {/* ─── KPIs ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard icon="FileText"    label="Total registados"           value={loading ? '…' : statistics.total}                  tone="brand" />
        <StatCard icon="Bell"        label="Notificações não lidas"     value={unreadNotifications}                                tone="orange" />
        <StatCard icon="ShieldCheck" label="Identidade"                 value={identityApproved ? 'Verificada' : 'Pendente'}       tone={identityApproved ? 'green' : 'orange'} />
      </div>

      {/* ─── Aviso de emergência ────────────────────────────── */}
      <div className="relative overflow-hidden rounded-xl border border-amber-200/70 dark:border-amber-900/60 bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/40 dark:to-orange-950/30 p-4 flex items-start gap-3 shadow-sm">
        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
          <Icon name="AlertTriangle" size={18} />
        </div>
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
          <strong className="font-semibold">Em caso de perigo imediato,</strong> procure um local seguro e contacte os serviços de emergência competentes.
          O registo na plataforma não garante assistência imediata.
        </p>
      </div>

      {/* ─── Ocorrências recentes ────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="p-4 md:p-5 border-b border-bd dark:border-dborder flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            As minhas ocorrências recentes
            {!loading && occurrences.length > 0 && (
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                {Math.min(occurrences.length, 5)}
              </span>
            )}
          </h3>
          <button
            onClick={() => setPage('minhas-ocorrencias')}
            className="group inline-flex items-center gap-1 text-xs text-brand dark:text-dblue hover:underline font-semibold"
          >
            Ver todas
            <Icon name="ArrowRight" size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        {error ? (
          <div className="p-5" role="alert">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
                <Icon name="AlertOctagon" size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-red-800 dark:text-red-200">Não foi possível carregar ocorrências</p>
                <p className="text-xs text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
                <button onClick={onRefresh} className="mt-2 text-xs font-semibold text-brand dark:text-dblue underline hover:no-underline">
                  Tentar novamente
                </button>
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead className="bg-light dark:bg-dsidebar/50">
                <tr>
                  {['Identificador', 'Tipo', 'Localização', 'Data', 'Estado', ''].map(heading => (
                    <th key={heading} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted whitespace-nowrap">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                <SkeletonRow />
                <SkeletonRow />
                <SkeletonRow />
              </tbody>
            </table>
            <span className="sr-only">A carregar ocorrências…</span>
          </div>
        ) : occurrences.length === 0 ? (
          <div className="p-10 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted flex items-center justify-center mx-auto mb-3">
              <Icon name="FileText" size={22} />
            </div>
            <p className="text-sm font-semibold text-ink dark:text-dink">Ainda sem ocorrências registadas</p>
            <p className="text-xs text-muted dark:text-dmuted mt-1 max-w-sm mx-auto">
              Quando comunicar a primeira ocorrência, ela aparecerá aqui com o estado actualizado.
            </p>
            <button
              onClick={() => setPage(identityApproved ? 'comunicar' : 'verificacao')}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <Icon name="PlusCircle" size={12} />
              Comunicar primeira ocorrência
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[620px]">
              <thead className="bg-light dark:bg-dsidebar/50">
                <tr>
                  {['Identificador', 'Tipo', 'Localização', 'Data', 'Estado', ''].map(heading => (
                    <th key={heading} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted whitespace-nowrap">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                {occurrences.slice(0, 5).map(occurrence => (
                  <tr key={occurrence.id} className="group hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-semibold text-xs text-brand dark:text-dblue px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40">
                        #{occurrence.id}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 font-medium text-ink dark:text-dink">
                        <span className="w-6 h-6 rounded-md bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {(occurrence.tipo_ocorrencia?.nome || '?').charAt(0).toUpperCase()}
                        </span>
                        <span className="truncate max-w-[180px]">{occurrence.tipo_ocorrencia?.nome || '—'}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted dark:text-dmuted">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="MapPin" size={11} className="shrink-0" />
                        <span className="truncate max-w-[200px]">{occurrence.localizacao}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap tabular-nums">
                      {formatDate(occurrence.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge s={STATE_LABELS[occurrence.estado] || occurrence.estado} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => onSelect(occurrence.id)}
                        aria-label={`Consultar ocorrência ${occurrence.id}`}
                        className="inline-flex items-center gap-1 text-brand dark:text-dblue p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
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

export default CidadaoDashboard;