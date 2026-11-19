import React, { useCallback, useEffect, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls, EmptyState, StatusBadge } from '../../components/common/CommonComponents';
import { identidadeService } from '../../services/identidadeService';

const STATE_LABELS = {
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  CORRECAO_NECESSARIA: 'Correcção solicitada',
};

const STATE_PILL = {
  PENDENTE:            'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
  EM_ANALISE:          'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
  APROVADA:            'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200/70 dark:border-green-800/60',
  REJEITADA:           'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/70 dark:border-red-800/60',
  CORRECAO_NECESSARIA: 'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60',
};

const STATE_DOT = {
  PENDENTE: 'bg-amber-500',
  EM_ANALISE: 'bg-blue-500',
  APROVADA: 'bg-green-500',
  REJEITADA: 'bg-red-500',
  CORRECAO_NECESSARIA: 'bg-orange-500',
};

const STATE_ICON = {
  PENDENTE: 'History',
  EM_ANALISE: 'Activity',
  APROVADA: 'CheckCircle',
  REJEITADA: 'AlertTriangle',
  CORRECAO_NECESSARIA: 'Edit',
};

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString('pt-MZ') : '—';
}

/* ─── Skeleton ─────────────────────────────────────────────── */
function SkeletonRequest() {
  return (
    <div className="p-4 animate-pulse space-y-3 border-b border-bd dark:border-dborder last:border-b-0">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div className="flex-1 space-y-1.5">
          <div className="h-3 w-1/3 rounded bg-slate-200 dark:bg-slate-700" />
          <div className="h-2.5 w-1/2 rounded bg-slate-100 dark:bg-slate-800" />
        </div>
        <div className="h-5 w-20 rounded-full bg-slate-100 dark:bg-slate-800" />
      </div>
      <div className="h-12 rounded-lg bg-slate-100 dark:bg-slate-800" />
      <div className="flex gap-2">
        <div className="h-8 w-32 rounded-lg bg-slate-100 dark:bg-slate-800" />
        <div className="h-8 w-24 rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    </div>
  );
}

/* ─── Timeline de histórico ─────────────────────────────────── */
function HistoryTimeline({ entries }) {
  if (!entries || entries.length === 0) return null;
  return (
    <ol className="relative border-l border-bd dark:border-dborder ml-2 space-y-2.5">
      {entries.map((entry, idx) => (
        <li key={entry.id || idx} className="ml-4 relative">
          <span className="absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-blue-100 dark:ring-blue-950/60" />
          <p className="text-xs text-ink dark:text-dink">
            <span className="font-semibold">{entry.estado_anterior || 'Submissão'}</span>
            <span className="text-muted dark:text-dmuted"> → </span>
            <span className="font-semibold">{entry.estado_novo}</span>
            <span className="text-muted dark:text-dmuted"> · {entry.responsavel || 'Sistema'} · {formatDate(entry.created_at)}</span>
          </p>
          {(entry.motivo || entry.observacoes) && (
            <p className="text-[11px] text-muted dark:text-dmuted mt-0.5 truncate">
              {entry.motivo ? `Motivo: ${entry.motivo}` : ''}
              {entry.observacoes ? ` ${entry.observacoes}` : ''}
            </p>
          )}
        </li>
      ))}
    </ol>
  );
}

export function GestaoVerificacoesIdentidade() {
  const [items, setItems] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [rejection, setRejection] = useState({});
  const [reasonErrors, setReasonErrors] = useState({});

  const refresh = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [pending, past] = await Promise.all([identidadeService.pendentes(), identidadeService.historico()]);
      setItems(pending);
      setHistory(past);
    }
    catch (requestError) { setError(requestError.message || 'Não foi possível carregar pedidos de verificação.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { refresh(); }, [refresh]);

  const perform = async (id, operation) => {
    setBusyId(id); setError(''); setReasonErrors(current => ({ ...current, [id]: '' }));
    try {
      if (operation === 'review') await identidadeService.iniciarAnalise(id);
      if (operation === 'approve') await identidadeService.aprovar(id);
      if (operation === 'reject') {
        const reason = (rejection[id] || '').trim();
        if (reason.length < 5 || reason.length > 500) { setReasonErrors(current => ({ ...current, [id]: 'Indique um motivo entre 5 e 500 caracteres.' })); return; }
        await identidadeService.rejeitar(id, reason);
      }
      if (operation === 'correction') {
        const reason = (rejection[id] || '').trim();
        if (reason.length < 5 || reason.length > 500) { setReasonErrors(current => ({ ...current, [id]: 'Descreva a correcção entre 5 e 500 caracteres.' })); return; }
        await identidadeService.solicitarCorrecao(id, reason);
      }
      await refresh();
    } catch (requestError) {
      if (requestError.errors?.motivo) setReasonErrors(current => ({ ...current, [id]: requestError.errors.motivo }));
      setError(requestError.message || 'Não foi possível actualizar o pedido.');
    }
    finally { setBusyId(null); }
  };

  const openDocument = async id => {
    try {
      const file = await identidadeService.descarregarDocumento(id);
      const url = URL.createObjectURL(file);
      const anchor = document.createElement('a'); anchor.href = url; anchor.target = '_blank'; anchor.rel = 'noopener'; anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (requestError) { setError(requestError.message || 'Não foi possível abrir o documento protegido.'); }
  };

  return (
    <div className="space-y-5">

      {/* ─── Cabeçalho ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-cyan-50/70 via-white to-blue-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-blue-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-400/10 dark:bg-cyan-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 font-semibold uppercase tracking-wider border border-cyan-200/60 dark:border-cyan-800/50">
                <Icon name="ShieldCheck" size={11} />
                KYC · Verificação de Identidade
              </span>
              {!loading && (
                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 text-[10px] font-semibold border border-amber-200/60 dark:border-amber-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  {items.length} pedido{items.length === 1 ? '' : 's'} na fila
                </span>
              )}
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">Verificação de Identidade</h2>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
              Fila de análise do Operador. Números mascarados · documentos obtidos apenas por rota autenticada.
            </p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-lg border border-bd dark:border-dborder bg-white dark:bg-dsidebar px-4 py-2.5 text-sm font-semibold text-ink dark:text-dink shadow-sm transition-all hover:border-cyan-300 hover:shadow-md hover:text-cyan-700 dark:hover:border-cyan-700 dark:hover:text-cyan-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Icon name="Activity" size={15} />
            Actualizar fila
          </button>
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
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Ocorreu um erro</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
              <button onClick={refresh} className="mt-2 text-xs font-semibold text-red-800 dark:text-red-200 underline hover:no-underline">
                Actualizar
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* ─── Fila de análise ───────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-bd dark:border-dborder flex items-center justify-between flex-wrap gap-2">
          <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
            <span className="w-1 h-5 rounded-full bg-gradient-to-b from-cyan-500 to-blue-500" />
            Fila de Análise
          </h3>
          {!loading && items.length > 0 && (
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-medium tabular-nums">
              {items.length} pedido{items.length === 1 ? '' : 's'} aguardando decisão
            </span>
          )}
        </div>

        {loading ? (
          <div role="status">
            <SkeletonRequest />
            <SkeletonRequest />
            <span className="sr-only">A carregar pedidos…</span>
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 px-4">
            <EmptyState
              icon="ShieldCheck"
              title="Sem pedidos pendentes"
              description="Os novos pedidos de verificação aparecerão aqui."
            />
          </div>
        ) : (
          <div className="divide-y divide-bd dark:divide-dborder">
            {items.map(item => {
              const state = item.estado;
              const pillCls = STATE_PILL[state] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
              const dotCls = STATE_DOT[state] || 'bg-slate-500';
              const stateIcon = STATE_ICON[state] || 'Info';
              const isBusy = busyId === item.id;

              return (
                <article key={item.id} className="p-4 md:p-5">

                  {/* Cabeçalho do pedido */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm ${
                        state === 'REJEITADA'
                          ? 'bg-gradient-to-br from-red-500 to-red-600'
                          : state === 'APROVADA'
                          ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                          : 'bg-gradient-to-br from-cyan-500 to-blue-600'
                      }`}>
                        {initials(item.solicitante?.nome)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-ink dark:text-dink truncate">
                            {item.solicitante?.nome || 'Cidadão'}
                          </h3>
                          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted">
                            #{item.id}
                          </span>
                        </div>
                        <p className="text-xs text-muted dark:text-dmuted truncate">
                          {item.solicitante?.email || '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${pillCls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotCls} ${state === 'EM_ANALISE' ? 'animate-pulse' : ''}`} />
                        {STATE_LABELS[item.estado] || item.estado}
                      </span>
                    </div>
                  </div>

                  {/* Grelha de dados do documento */}
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { label: 'Tipo de documento', value: item.documento?.tipo_documento || '—' },
                      { label: 'Número (mascarado)', value: item.documento?.numero_documento_mascarado || '—', mono: true },
                      { label: 'Validade', value: item.documento?.data_validade || 'não indicada' },
                      { label: 'Submetido em', value: formatDate(item.created_at) },
                    ].map((row, i) => (
                      <div
                        key={i}
                        className="p-2.5 rounded-lg border border-bd dark:border-dborder bg-light/60 dark:bg-dsidebar/40"
                      >
                        <p className="text-[10px] uppercase tracking-wider text-muted dark:text-dmuted font-semibold">
                          {row.label}
                        </p>
                        <p className={`text-sm font-medium text-ink dark:text-dink truncate ${row.mono ? 'font-mono' : ''}`}>
                          {row.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Acções */}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      variant="secondary"
                      disabled={!item.documento?.ficheiro_submetido || isBusy}
                      onClick={() => openDocument(item.id)}
                      icon="FileText"
                    >
                      Consultar documento
                    </Button>
                    {item.estado === 'PENDENTE' && (
                      <Button variant="secondary" disabled={isBusy} onClick={() => perform(item.id, 'review')} icon="Search">
                        Iniciar análise
                      </Button>
                    )}
                    {item.estado === 'EM_ANALISE' && (
                      <>
                        <Button disabled={isBusy} onClick={() => perform(item.id, 'approve')} icon="CheckCircle">
                          Aprovar
                        </Button>
                        <Button variant="secondary" disabled={isBusy} onClick={() => perform(item.id, 'correction')} icon="Edit">
                          Solicitar correcção
                        </Button>
                        <Button variant="danger" disabled={isBusy} onClick={() => perform(item.id, 'reject')} icon="AlertTriangle">
                          Rejeitar
                        </Button>
                      </>
                    )}
                  </div>

                  {/* Histórico colapsável */}
                  <details className="group mt-3 rounded-lg border border-bd dark:border-dborder bg-light/40 dark:bg-dsidebar/30 overflow-hidden">
                    <summary className="cursor-pointer select-none flex items-center justify-between px-3 py-2 text-sm font-medium text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar/50 transition-colors">
                      <span className="inline-flex items-center gap-2">
                        <Icon name="History" size={14} className="text-muted dark:text-dmuted" />
                        Histórico do pedido
                        <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                          {item.historico?.length || 0}
                        </span>
                      </span>
                      <Icon name="ArrowRight" size={14} className="text-muted dark:text-dmuted transition-transform group-open:rotate-90" />
                    </summary>
                    <div className="px-3 py-3 border-t border-bd dark:border-dborder">
                      {item.historico?.length ? (
                        <HistoryTimeline entries={item.historico} />
                      ) : (
                        <p className="text-xs text-muted dark:text-dmuted italic">Sem eventos registados.</p>
                      )}
                    </div>
                  </details>

                  {/* Motivo / correcção */}
                  {item.estado === 'EM_ANALISE' && (
                    <div className="mt-3 p-3 rounded-lg border border-bd dark:border-dborder bg-light/40 dark:bg-dsidebar/30">
                      <Field
                        label="Motivo ou correcção pedida (5 a 500 caracteres)"
                        htmlFor={`rejection-${item.id}`}
                        error={reasonErrors[item.id]}
                      >
                        <textarea
                          id={`rejection-${item.id}`}
                          className={inputCls}
                          rows="2"
                          maxLength={500}
                          value={rejection[item.id] || ''}
                          onChange={event => setRejection(current => ({ ...current, [item.id]: event.target.value }))}
                        />
                      </Field>
                      <p className="text-[10px] text-muted dark:text-dmuted mt-1 tabular-nums text-right">
                        {(rejection[item.id] || '').length}/500
                      </p>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </Card>

      {/* ─── Histórico de decisões ─────────────────────────────── */}
      <Card className="overflow-hidden">
        <details className="group">
          <summary className="cursor-pointer select-none p-4 flex items-center justify-between hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
            <span className="inline-flex items-center gap-2 font-semibold text-ink dark:text-dink">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
              Histórico de decisões
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                {history.length}
              </span>
            </span>
            <Icon name="ArrowRight" size={16} className="text-muted dark:text-dmuted transition-transform group-open:rotate-90" />
          </summary>

          <div className="border-t border-bd dark:border-dborder">
            {history.length === 0 ? (
              <p className="p-4 text-sm text-muted dark:text-dmuted italic">Ainda não existem decisões registadas.</p>
            ) : (
              <div className="divide-y divide-bd dark:divide-dborder">
                {history.map(item => {
                  const pillCls = STATE_PILL[item.estado] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
                  const dotCls = STATE_DOT[item.estado] || 'bg-slate-500';
                  return (
                    <article key={item.id} className="p-4 text-sm">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-semibold text-ink dark:text-dink">
                            Pedido <span className="font-mono text-brand dark:text-dblue">#{item.id}</span>
                            <span className="text-muted dark:text-dmuted font-normal"> · </span>
                            {item.cidadao || 'Cidadão'}
                          </p>
                          <p className="text-xs text-muted dark:text-dmuted mt-0.5">
                            <span className="font-mono">{item.numero_documento_mascarado || '—'}</span>
                            <span> · submetido {formatDate(item.submetido_em)}</span>
                            <span> · decidido {formatDate(item.decidido_em)}</span>
                          </p>
                        </div>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border shrink-0 ${pillCls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
                          {STATE_LABELS[item.estado] || item.estado}
                        </span>
                      </div>

                      {item.motivo && (
                        <div className="mt-2 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200/70 dark:border-amber-900/50">
                          <p className="text-[10px] uppercase tracking-wider font-semibold text-amber-700 dark:text-amber-300 mb-0.5">Motivo</p>
                          <p className="text-xs text-amber-800 dark:text-amber-200">{item.motivo}</p>
                        </div>
                      )}

                      {item.historico?.length > 0 && (
                        <div className="mt-3">
                          <HistoryTimeline entries={item.historico} />
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </details>
      </Card>
    </div>
  );
}

export default GestaoVerificacoesIdentidade;