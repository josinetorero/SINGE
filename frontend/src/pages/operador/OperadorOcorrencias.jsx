import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, StatCard, StatusBadge, Pagination, EmptyState, inputCls } from '../../components/common/CommonComponents';

const STATES = [
  ['registada', 'Registada'],
  ['em_avaliacao', 'Em avaliação'],
  ['em_atendimento', 'Em atendimento'],
  ['resolvida', 'Resolvida'],
  ['cancelada', 'Cancelada'],
];

const STATE_LABELS = Object.fromEntries(STATES);

const EMPTY_FILTERS = {
  q: '',
  estado: '',
  tipo_ocorrencia_id: '',
  provincia: '',
  distrito: '',
  localizacao: '',
  data_inicio: '',
  data_fim: '',
  ordenar_por: 'created_at',
  ordem: 'desc',
  page: 1,
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// Chip de filtro activo
function FilterChip({ label, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-lblue/40 dark:bg-dblue/20 text-ink dark:text-dink border border-bd dark:border-dborder px-2.5 py-1 text-xs">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="rounded-full hover:bg-brand/10 p-0.5"
        aria-label={`Remover filtro ${label}`}
      >
        <Icon name="X" size={11} />
      </button>
    </span>
  );
}

export function OperadorOcorrencias({
  ocorrencias = [],
  estatisticas = {},
  pagination,
  filters,
  types = [],
  loading,
  error,
  onRefresh,
  onFiltersChange,
  onSelect,
}) {
  const [query, setQuery] = useState(filters.q || '');

  useEffect(() => {
    setQuery(filters.q || '');
  }, [filters.q]);

  const submitSearch = (event) => {
    event.preventDefault();
    onFiltersChange({ q: query.trim(), page: 1 });
  };

  const setFilter = (key, value) => onFiltersChange({ [key]: value, page: 1 });

  const clearAll = () => {
    setQuery('');
    onFiltersChange(EMPTY_FILTERS);
  };

  // Chips de filtros activos (excluindo ordenação)
  const activeChips = useMemo(() => {
    const chips = [];
    if (filters.estado) chips.push({ key: 'estado', label: STATE_LABELS[filters.estado] || filters.estado });
    if (filters.tipo_ocorrencia_id) {
      const t = types.find(item => String(item.id) === String(filters.tipo_ocorrencia_id));
      if (t) chips.push({ key: 'tipo_ocorrencia_id', label: t.nome });
    }
    if (filters.data_inicio) chips.push({ key: 'data_inicio', label: `Desde ${filters.data_inicio}` });
    if (filters.data_fim) chips.push({ key: 'data_fim', label: `Até ${filters.data_fim}` });
    if (filters.q) chips.push({ key: 'q', label: `"${filters.q}"` });
    return chips;
  }, [filters, types]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="FileText" size={22} className="text-brand" />
            Ocorrências
          </h1>
          <p className="text-sm text-muted dark:text-dmuted mt-1">
            {pagination?.total ?? 0} registo{(pagination?.total ?? 0) === 1 ? '' : 's'} encontrado{(pagination?.total ?? 0) === 1 ? '' : 's'} na base de dados.
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          aria-label="Actualizar ocorrências"
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
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard icon="FileText" label="Ocorrências registadas" value={estatisticas.total ?? pagination?.total ?? 0} tone="brand" />
        <StatCard icon="CheckCircle" label="Resolvidas" value={estatisticas.resolvidas ?? 0} tone="green" />
        <StatCard icon="XCircle" label="Canceladas" value={estatisticas.canceladas ?? 0} tone="red" />
      </div>

      {/* Filtros */}
      <Card className="p-4 space-y-3">
        <form onSubmit={submitSearch} className="space-y-3">
          {/* Pesquisa + estado + tipo */}
          <div className="grid md:grid-cols-3 gap-3">
            <div className="relative md:col-span-1">
              <Icon
                name="Search"
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none"
              />
              <input
                aria-label="Pesquisar ocorrências"
                placeholder="Pesquisar por título ou localização"
                value={query}
                onChange={event => {
                  setQuery(event.target.value);
                  onFiltersChange({ q: event.target.value, page: 1 });
                }}
                className={`${inputCls} pl-9`}
              />
            </div>
            <select
              aria-label="Filtrar por estado"
              value={filters.estado || ''}
              onChange={event => setFilter('estado', event.target.value)}
              className={inputCls}
            >
              <option value="">Todos os estados</option>
              {STATES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select
              aria-label="Filtrar por tipo"
              value={filters.tipo_ocorrencia_id || ''}
              onChange={event => setFilter('tipo_ocorrencia_id', event.target.value)}
              className={inputCls}
            >
              <option value="">Todos os tipos</option>
              {types.map(type => <option key={type.id} value={type.id}>{type.nome}</option>)}
            </select>
          </div>

          {/* Datas + ordenação */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <label className="text-xs text-muted dark:text-dmuted space-y-1 block">
              <span className="font-medium">Desde</span>
              <input
                type="date"
                aria-label="Data inicial"
                value={filters.data_inicio || ''}
                onChange={event => setFilter('data_inicio', event.target.value)}
                className={inputCls}
              />
            </label>
            <label className="text-xs text-muted dark:text-dmuted space-y-1 block">
              <span className="font-medium">Até</span>
              <input
                type="date"
                aria-label="Data final"
                value={filters.data_fim || ''}
                onChange={event => setFilter('data_fim', event.target.value)}
                className={inputCls}
              />
            </label>
            <label className="text-xs text-muted dark:text-dmuted space-y-1 block">
              <span className="font-medium">Ordenar por</span>
              <select
                aria-label="Ordenar por"
                value={filters.ordenar_por || 'created_at'}
                onChange={event => setFilter('ordenar_por', event.target.value)}
                className={inputCls}
              >
                <option value="created_at">Data de registo</option>
                <option value="updated_at">Última actualização</option>
                <option value="id">Identificador</option>
              </select>
            </label>
            <label className="text-xs text-muted dark:text-dmuted space-y-1 block">
              <span className="font-medium">Ordem</span>
              <select
                aria-label="Ordem"
                value={filters.ordem || 'desc'}
                onChange={event => setFilter('ordem', event.target.value)}
                className={inputCls}
              >
                <option value="desc">Mais recentes primeiro</option>
                <option value="asc">Mais antigos primeiro</option>
              </select>
            </label>
          </div>

          {/* Acções */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-bd dark:border-dborder">
            <div className="flex flex-wrap gap-1.5">
              {activeChips.map(chip => (
                <FilterChip
                  key={chip.key}
                  label={chip.label}
                  onRemove={() => {
                    if (chip.key === 'q') setQuery('');
                    setFilter(chip.key, '');
                  }}
                />
              ))}
              {activeChips.length === 0 && (
                <span className="text-xs text-muted dark:text-dmuted">Sem filtros activos.</span>
              )}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={clearAll}
                className="rounded-lg border border-bd dark:border-dborder px-4 py-2 text-sm text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar transition-colors"
              >
                Limpar
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-medium text-white hover:bg-brand/90 transition-colors"
              >
                <Icon name="Search" size={14} />
                Pesquisar
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* Tabela */}
      <Card>
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
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex gap-3 animate-pulse">
                <div className="h-3 w-10 rounded bg-lblue/40 dark:bg-dblue/20" />
                <div className="h-3 w-24 rounded bg-lblue/40 dark:bg-dblue/20" />
                <div className="h-3 flex-1 rounded bg-lblue/40 dark:bg-dblue/20" />
                <div className="h-3 w-20 rounded bg-lblue/40 dark:bg-dblue/20" />
              </div>
            ))}
          </div>
        ) : ocorrencias.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon="FileText"
              title="Nenhuma ocorrência encontrada"
              description="Altere os filtros ou tente novamente."
              action={
                activeChips.length > 0 ? (
                  <button
                    type="button"
                    onClick={clearAll}
                    className="rounded-lg border border-bd dark:border-dborder px-4 py-2 text-sm text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar transition-colors"
                  >
                    Limpar filtros
                  </button>
                ) : undefined
              }
            />
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[820px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase tracking-wide text-muted dark:text-dmuted">
                  <tr>
                    {['ID', 'Tipo', 'Título e descrição', 'Localização', 'Data/hora', 'Estado', ''].map(heading => (
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
                  {ocorrencias.map(occurrence => (
                    <tr
                      key={occurrence.id}
                      data-testid="operator-occurrence-row"
                      className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono text-xs font-medium text-ink dark:text-dink">
                        #{occurrence.id}
                      </td>
                      <td className="px-4 py-3 text-ink dark:text-dink">
                        {occurrence.tipo_ocorrencia?.nome || '—'}
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-medium text-ink dark:text-dink truncate">{occurrence.titulo}</p>
                        <p className="text-xs text-muted dark:text-dmuted truncate">{occurrence.descricao}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted dark:text-dmuted">
                        {[occurrence.localizacao_geografica?.distrito, occurrence.localizacao_geografica?.provincia]
                          .filter(Boolean).join(', ') || occurrence.localizacao || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">
                        {formatDate(occurrence.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <StatusBadge s={STATE_LABELS[occurrence.estado] || occurrence.estado} />
                      </td>
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
            <div className="p-4 border-t border-bd dark:border-dborder">
              <Pagination
                total={pagination?.total || 0}
                page={pagination?.current_page || 1}
                pageSize={pagination?.per_page || 15}
                onChange={page => onFiltersChange({ page })}
              />
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default OperadorOcorrencias;