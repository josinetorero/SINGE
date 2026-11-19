import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, EmptyState, inputCls } from '../../components/common/CommonComponents';
import { useToast } from '../../contexts/ToastContext';

/* ─── Mapas de estilo para estados da missão ─────────────────── */
const ESTADO_META = {
  'Em curso': {
    pill: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200/70 dark:border-blue-800/60',
    dot: 'bg-blue-500',
    icon: 'Activity',
    iconBg: 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300',
    hint: 'Missão em execução operacional.',
  },
  'Concluída': {
    pill: 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200/70 dark:border-green-800/60',
    dot: 'bg-green-500',
    icon: 'CheckCircle',
    iconBg: 'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-300',
    hint: 'A missão será encerrada e os recursos libertados.',
  },
  'Suspensa': {
    pill: 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
    dot: 'bg-amber-500',
    icon: 'AlertTriangle',
    iconBg: 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300',
    hint: 'A missão ficará temporariamente em pausa.',
  },
};

export function ActualizarEstado({ m, setPage }) {
  const toast = useToast();
  const [estado, setEstado] = useState(m?.estado || 'Em curso');

  /* ─── Empty state ────────────────────────────────────────── */
  if (!m) {
    return (
      <div className="max-w-2xl">
        <EmptyState
          icon="RefreshCw"
          title="Nenhuma missão seleccionada"
          description="Escolha uma missão a partir do painel de missões para actualizar o seu estado."
          action={<Button onClick={() => setPage('missoes')} icon="ArrowLeft">Voltar às missões</Button>}
        />
      </div>
    );
  }

  const meta = ESTADO_META[estado] || ESTADO_META['Em curso'];

  return (
    <div className="space-y-5 max-w-2xl">

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

        <div className="relative flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold uppercase tracking-wider border border-blue-200/60 dark:border-blue-800/50">
                <Icon name="Activity" size={11} />
                Actualização de Missão
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700 font-mono">
                {m.ref}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">
              Actualizar Estado
            </h2>
            <p className="mt-1 text-sm text-muted dark:text-dmuted">
              Registe a evolução operacional da missão <span className="font-semibold text-ink dark:text-dink">{m.ref}</span>.
            </p>
          </div>
        </div>
      </header>

      {/* ─── Formulário ───────────────────────────────────────── */}
      <Card className="p-5 md:p-6 space-y-5">

        {/* Estado actual → novo estado (pré-visualização) */}
        <div className="p-3 rounded-xl border border-bd dark:border-dborder bg-light/60 dark:bg-dsidebar/40">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${meta.iconBg}`}>
                <Icon name={meta.icon} size={16} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted">
                  Novo estado seleccionado
                </p>
                <p className="text-sm font-bold text-ink dark:text-dink">{estado}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${meta.pill}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {estado}
            </span>
          </div>
          <p className="text-[11px] text-muted dark:text-dmuted mt-2 ml-10">{meta.hint}</p>
        </div>

        {/* Selector de estado */}
        <Field label="Novo estado da missão" required>
          <select
            value={estado}
            onChange={e => setEstado(e.target.value)}
            className={inputCls}
          >
            <option>Em curso</option>
            <option>Concluída</option>
            <option>Suspensa</option>
          </select>
        </Field>

        <div className="border-t border-bd dark:border-dborder" />

        {/* Descrição */}
        <Field
          label="Descrição da actualização"
          required
          hint="Registe sucintamente o que aconteceu no terreno."
        >
          <textarea
            rows={3}
            className={inputCls}
            placeholder="Ex: Equipa chegou ao local e iniciou resgate aquático..."
          />
        </Field>

        {/* Observações */}
        <Field
          label="Observações e recursos adicionais necessários"
          hint="Campo opcional — use para sinalizar necessidades logísticas."
        >
          <textarea
            rows={2}
            className={inputCls}
            placeholder="Observações opcionais..."
          />
        </Field>
      </Card>

      {/* ─── Acções ───────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="secondary" onClick={() => setPage('missoes')} icon="X">
          Cancelar
        </Button>
        <Button
          icon="CheckCircle"
          onClick={() => { setPage('missoes'); toast.success('Missão actualizada com sucesso.'); }}
        >
          Submeter actualização
        </Button>
      </div>
    </div>
  );
}

export default ActualizarEstado;