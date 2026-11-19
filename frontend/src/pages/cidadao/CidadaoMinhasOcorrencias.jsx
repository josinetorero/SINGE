import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, EmptyState, inputCls } from '../../components/common/CommonComponents';

const STATES = [
  ['registada', 'Registada'],
  ['em_avaliacao', 'Em avaliação'],
  ['em_atendimento', 'Em atendimento'],
  ['resolvida', 'Resolvida'],
  ['cancelada', 'Cancelada'],
];

const STATE_LABELS = Object.fromEntries(STATES);

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/* ─── Skeleton de linha ─────────────────────────────────────── */
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

export function CidadaoMinhasOcorrencias({
  ocorrencias = [],
  pagination,
  filters,
  types = [],
  loading,
  error,
  onRefresh,
  onFiltersChange,
  onSelect,
  setPage,
}) {
  const [query, setQuery] = useState('');
  const filtered = ocorrencias.filter(occurrence => (
    !query
    || String(occurrence.id).includes(query.trim())
    || occurrence.titulo?.toLowerCase().includes(query.trim().toLowerCase())
  ));

  const hasFilters = Boolean(query || filters?.estado || filters?.tipo_ocorrencia_id);
  const clearFilters = () => {
    setQuery('');
    onFiltersChange({ tipo_ocorrencia_id: '', estado: '' });
  };

  return (
    <div className="space-y-5 max-w-6xl mx-auto">

      {/* ─── Cabeçalho ─────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-emerald-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold uppercase tracking-wider border border-emerald-200/60 dark:border-emerald-800/50">
                <Icon name="User" size={11} />
                Área do Cidadão
              </span>
              {!loading && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700 tabular-nums">
                  <Icon name="FileText" size={11} />
                  {pagination?.total ?? ocorrencias.length} registo{(pagination?.total ?? ocorrencias.length) === 1 ? '' : 's'}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">As Minhas Ocorrências</h1>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">Registos associados à sua conta.</p>
          </div>
          <button
            onClick={() => setPage('comunicar')}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Icon name="PlusCircle" size={15} />
            Nova ocorrência
          </button>
        </div>
      </header>

      {/* ─── Filtros ───────────────────────────────────────── */}
      <Card className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-ink dark:text-dink flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
            Filtrar Ocorrências
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-medium tabular-nums">
              {filtered.length} de {ocorrencias.length}
            </span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
              >
                <Icon name="X" size={12} /> Limpar
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Pesquisar
            </label>
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none" />
              <input
                aria-label="Pesquisar ocorrências"
                placeholder="Pesquisar identificador ou título…"
                value={query}
                onChange={event => setQuery(event.target.value)}
                className={`${inputCls} pl-9 pr-9`}
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-muted dark:text-dmuted hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Limpar pesquisa"
                >
                  <Icon name="X" size={12} />
                </button>
              )}
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Tipo
            </label>
            <select
              aria-label="Filtrar por tipo"
              value={filters.tipo_ocorrencia_id}
              onChange={event => onFiltersChange({ tipo_ocorrencia_id: event.target.value })}
              className={inputCls}
            >
              <option value="">Todos os tipos</option>
              {types.map(type => <option key={type.id} value={type.id}>{type.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Estado
            </label>
            <select
              aria-label="Filtrar por estado"
              value={filters.estado}
              onChange={event => onFiltersChange({ estado: event.target.value })}
              className={inputCls}
            >
              <option value="">Todos os estados</option>
              {STATES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* ─── Tabela / Estados ──────────────────────────────── */}
      {error ? (
        <Card className="p-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30" role="alert">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
              <Icon name="AlertOctagon" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Não foi possível carregar as ocorrências</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
              <button onClick={onRefresh} className="mt-2 text-xs font-semibold text-brand dark:text-dblue underline hover:no-underline">
                Tentar novamente
              </button>
            </div>
          </div>
        </Card>
      ) : loading ? (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
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
          </div>
          <span className="sr-only" role="status">A carregar as suas ocorrências…</span>
        </Card>
      ) : filtered.length === 0 ? (
        <Card>
          <div className="py-10 px-4">
            <EmptyState
              icon="FileText"
              title={hasFilters ? 'Nenhuma ocorrência corresponde aos filtros.' : 'Ainda não comunicou nenhuma ocorrência.'}
              description={hasFilters ? 'Altere os filtros e tente novamente.' : 'Quando registar uma ocorrência, ela aparecerá aqui.'}
              action={!hasFilters
                ? <Button icon="PlusCircle" onClick={() => setPage('comunicar')}>Comunicar uma ocorrência</Button>
                : undefined}
            />
            {hasFilters && (
              <div className="text-center mt-2">
                <button onClick={clearFilters} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
                  Limpar filtros e ver todas as ocorrências
                </button>
              </div>
            )}
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[700px]">
              <thead className="bg-light dark:bg-dsidebar/50">
                <tr>
                  {['Identificador', 'Tipo', 'Localização', 'Data', 'Estado', ''].map(heading => (
                    <th key={heading} className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted whitespace-nowrap">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                {filtered.map(occurrence => (
                  <tr
                    key={occurrence.id}
                    data-testid="cid-oc-item"
                    data-ref={occurrence.id}
                    className="group hover:bg-light dark:hover:bg-dsidebar/30 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
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
                        title="Consultar"
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

          {/* ─── Paginação ────────────────────────────────── */}
          <div className="flex items-center justify-between p-4 border-t border-bd dark:border-dborder flex-wrap gap-3">
            <span className="text-xs text-muted dark:text-dmuted tabular-nums inline-flex items-center gap-1.5">
              <Icon name="FileText" size={12} />
              Página {pagination?.current_page || 1} de {pagination?.last_page || 1}
              <span className="text-slate-300 dark:text-slate-600">·</span>
              {pagination?.total || 0} registo{(pagination?.total || 0) === 1 ? '' : 's'}
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={!pagination || pagination.current_page <= 1}
                onClick={() => onFiltersChange({ page: pagination.current_page - 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-bd dark:border-dborder bg-white dark:bg-dsidebar px-3 py-1.5 text-xs font-semibold text-ink dark:text-dink hover:border-brand hover:text-brand dark:hover:border-dblue dark:hover:text-dblue disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-bd disabled:hover:text-ink dark:disabled:hover:border-dborder dark:disabled:hover:text-dink transition-colors"
              >
                <Icon name="ChevronLeft" size={13} />
                Anterior
              </button>
              <button
                type="button"
                disabled={!pagination || pagination.current_page >= pagination.last_page}
                onClick={() => onFiltersChange({ page: pagination.current_page + 1 })}
                className="inline-flex items-center gap-1 rounded-lg border border-bd dark:border-dborder bg-white dark:bg-dsidebar px-3 py-1.5 text-xs font-semibold text-ink dark:text-dink hover:border-brand hover:text-brand dark:hover:border-dblue dark:hover:text-dblue disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-bd disabled:hover:text-ink dark:disabled:hover:border-dborder dark:disabled:hover:text-dink transition-colors"
              >
                Seguinte
                <Icon name="ChevronRight" size={13} />
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

export default CidadaoMinhasOcorrencias;