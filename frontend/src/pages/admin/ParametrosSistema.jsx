import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Modal, Field, inputCls } from '../../components/common/CommonComponents';
import { FATORES_PRIORIDADE, TIPOS_OCORRENCIA, TIPOS_EQUIPA } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

/* ─── Mapas de estilo ─────────────────────────────────────── */
const PRIORIDADE_PILL = {
  'Crítico': 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/70 dark:border-red-800/60',
  'Alto':    'bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200/70 dark:border-orange-800/60',
  'Médio':   'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60',
  'Baixo':   'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200/70 dark:border-green-800/60',
};

const PRIORIDADE_DOT = {
  'Crítico': 'bg-red-500',
  'Alto':    'bg-orange-500',
  'Médio':   'bg-amber-500',
  'Baixo':   'bg-green-500',
};

const PRIORIDADE_ICON_BG = {
  'Crítico': 'bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-300',
  'Alto':    'bg-orange-100 dark:bg-orange-950/60 text-orange-600 dark:text-orange-300',
  'Médio':   'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300',
  'Baixo':   'bg-green-100 dark:bg-green-950/60 text-green-600 dark:text-green-300',
};

/* ─── Sub-componentes ─────────────────────────────────────── */
function TabButton({ active, icon, label, count, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
        active
          ? 'border-brand text-brand dark:border-dblue dark:text-dblue font-semibold'
          : 'border-transparent text-muted dark:text-dmuted hover:text-ink dark:hover:text-dink'
      }`}
    >
      <Icon name={icon} size={16} />
      {label}
      {typeof count === 'number' && (
        <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
          active
            ? 'bg-brand/10 text-brand dark:bg-dblue/20 dark:text-dblue'
            : 'bg-slate-100 text-muted dark:bg-slate-800 dark:text-dmuted'
        }`}>
          {count}
        </span>
      )}
    </button>
  );
}

export function ParametrosSistema() {
  const toast = useToast();
  const [tab, setTab] = useState('fatores');

  const [fatores, setFatores] = useState(FATORES_PRIORIDADE);
  const [tiposOc, setTiposOc] = useState(TIPOS_OCORRENCIA);
  const [tiposEq, setTiposEq] = useState(TIPOS_EQUIPA);

  const [editFator, setEditFator] = useState(null);
  const [novoTipoOc, setNovoTipoOc] = useState(false);
  const [formTipoOc, setFormTipoOc] = useState({ nome: '', descricao: '', prioridadePadrao: 'Médio' });

  const totalPeso = fatores.reduce((acc, f) => acc + (f.ativo ? Number(f.peso) : 0), 0);
  const isPesoValido = Math.abs(totalPeso - 1.0) < 0.01;

  const handleSalvarFator = (e) => {
    e.preventDefault();
    if (!editFator) return;
    setFatores(prev => prev.map(f => f.id === editFator.id ? editFator : f));
    setEditFator(null);
    toast.success(`Fator "${editFator.nome}" atualizado com sucesso no backend.`);
  };

  const handleToggleAtivoFator = (id) => {
    setFatores(prev => prev.map(f => {
      if (f.id === id) {
        const next = !f.ativo;
        toast.info(`Fator ${f.codigo} ${next ? 'ativado' : 'desativado'} para o cálculo de gravidade.`);
        return { ...f, ativo: next };
      }
      return f;
    }));
  };

  const handleCriarTipoOc = (e) => {
    e.preventDefault();
    if (!formTipoOc.nome.trim()) {
      toast.error('Indique o nome do tipo de emergência.');
      return;
    }
    const novo = {
      id: Date.now(),
      nome: formTipoOc.nome,
      descricao: formTipoOc.descricao || 'Sem descrição detalhada.',
      prioridadePadrao: formTipoOc.prioridadePadrao,
      icone: 'AlertTriangle'
    };
    setTiposOc(prev => [novo, ...prev]);
    setNovoTipoOc(false);
    setFormTipoOc({ nome: '', descricao: '', prioridadePadrao: 'Médio' });
    toast.success(`Novo tipo de emergência "${novo.nome}" adicionado com sucesso.`);
  };

  return (
    <div className="space-y-5">

      {/* ─── Cabeçalho ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-purple-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold uppercase tracking-wider border border-purple-200/60 dark:border-purple-800/50">
                <Icon name="Sliders" size={11} />
                Parametrização do Sistema
              </span>
              <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-semibold border ${
                isPesoValido
                  ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border-green-200/60 dark:border-green-800/50'
                  : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300 border-red-200/60 dark:border-red-800/50'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isPesoValido ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                {isPesoValido ? 'Algoritmo calibrado' : 'Calibração pendente'}
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">
              Configuração de Fatores e Catálogos
            </h2>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
              Defina os pesos do algoritmo de pontuação de prioridade, tipos de ocorrência e tipos de resposta (Diagrama de Classes UML).
            </p>
          </div>

          {tab === 'tipos-ocorrencia' && (
            <button
              onClick={() => setNovoTipoOc(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-purple-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-purple-800 hover:shadow-md active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
            >
              <Icon name="PlusCircle" size={15} />
              Adicionar Tipo
            </button>
          )}
        </div>
      </header>

      {/* ─── Navegação por Abas ────────────────────────────────── */}
      <div className="flex border-b border-bd dark:border-dborder gap-1 overflow-x-auto">
        <TabButton active={tab === 'fatores'}          icon="Sliders"  label="Fatores de Prioridade"  count={fatores.length} onClick={() => setTab('fatores')} />
        <TabButton active={tab === 'tipos-ocorrencia'} icon="FileText" label="Tipos de Ocorrência"    count={tiposOc.length} onClick={() => setTab('tipos-ocorrencia')} />
        <TabButton active={tab === 'tipos-equipa'}     icon="Users"    label="Tipos de Equipa"        count={tiposEq.length} onClick={() => setTab('tipos-equipa')} />
      </div>

      {/* ═══ ABA 1: FATORES DE PRIORIDADE ══════════════════════ */}
      {tab === 'fatores' && (
        <div className="space-y-4">

          {/* Painel da fórmula */}
          <Card className="p-5 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-900/80 dark:to-blue-950/40 border-blue-200/70 dark:border-blue-900/50">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                  <Icon name="Sliders" size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-ink dark:text-dink text-sm">Fórmula Multicritério de Apoio à Decisão</h3>
                  <p className="text-xs text-muted dark:text-dmuted mt-0.5">
                    <span className="font-mono px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-800 text-ink dark:text-dink">Score = ∑ (Fator_i × Peso_i)</span>
                    <span> · a validação final permanece sob coordenação humana.</span>
                  </p>
                </div>
              </div>

              {/* Indicador de soma com anel */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted">Total ponderado</p>
                  <p className={`text-sm font-bold ${isPesoValido ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                    {(totalPeso * 100).toFixed(0)}% / 100%
                  </p>
                </div>
                <div className="relative w-14 h-14">
                  <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                    <circle cx="18" cy="18" r="15" fill="none" stroke="currentColor" strokeWidth="3" className="text-slate-200 dark:text-slate-700" />
                    <circle
                      cx="18" cy="18" r="15" fill="none" strokeWidth="3" strokeLinecap="round"
                      strokeDasharray={`${Math.min(totalPeso * 100, 100) * 0.9425} 942.5`}
                      className={isPesoValido ? 'text-green-500' : 'text-red-500'}
                      style={{ transition: 'stroke-dasharray 0.4s' }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-ink dark:text-dink tabular-nums">
                    {(totalPeso * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabela de fatores */}
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-bd dark:border-dborder flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                Fatores Configurados
              </h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-medium tabular-nums">
                {fatores.filter(f => f.ativo).length} de {fatores.length} activos
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-[11px] uppercase tracking-wider text-muted dark:text-dmuted">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Código</th>
                    <th className="text-left px-4 py-3 font-semibold">Fator</th>
                    <th className="text-left px-4 py-3 font-semibold">Descrição</th>
                    <th className="text-left px-4 py-3 font-semibold">Peso</th>
                    <th className="text-left px-4 py-3 font-semibold">Distribuição</th>
                    <th className="text-left px-4 py-3 font-semibold">Estado</th>
                    <th className="text-right px-4 py-3 font-semibold">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {fatores.map(f => (
                    <tr
                      key={f.id}
                      className={`hover:bg-light dark:hover:bg-dsidebar/30 transition-colors ${!f.ativo ? 'opacity-60' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-mono font-semibold text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand dark:text-dblue">
                          {f.codigo}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-ink dark:text-dink">{f.nome}</td>
                      <td className="px-4 py-3 text-xs text-muted dark:text-dmuted max-w-xs">{f.descricao}</td>
                      <td className="px-4 py-3 font-mono font-bold text-ink dark:text-dink tabular-nums">{f.peso.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 rounded-full bg-light dark:bg-dsidebar overflow-hidden">
                            <div
                              className={`h-full rounded-full bg-gradient-to-r ${
                                f.ativo ? 'from-blue-500 to-indigo-500' : 'from-slate-400 to-slate-500'
                              }`}
                              style={{ width: `${f.peso * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-semibold text-muted dark:text-dmuted tabular-nums w-9">
                            {(f.peso * 100).toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleAtivoFator(f.id)}
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-semibold transition-all hover:ring-2 hover:ring-offset-1 dark:hover:ring-offset-slate-900 ${
                            f.ativo
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 hover:ring-green-300 dark:hover:ring-green-800'
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:ring-slate-300 dark:hover:ring-slate-700'
                          }`}
                          title={f.ativo ? 'Clique para desactivar' : 'Clique para activar'}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${f.ativo ? 'bg-green-500' : 'bg-slate-500'}`} />
                          {f.ativo ? 'Activo' : 'Desactivado'}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon="Edit"
                          onClick={() => setEditFator({ ...f })}
                        >
                          Calibrar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ ABA 2: TIPOS DE OCORRÊNCIA ════════════════════════ */}
      {tab === 'tipos-ocorrencia' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiposOc.map(t => {
              const prio = t.prioridadePadrao;
              const pillCls = PRIORIDADE_PILL[prio] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700';
              const dotCls = PRIORIDADE_DOT[prio] || 'bg-slate-500';
              const iconBg = PRIORIDADE_ICON_BG[prio] || 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300';

              return (
                <Card key={t.id} className="p-5 flex flex-col justify-between group hover:shadow-md transition-shadow">
                  <div>
                    <div className="flex items-start justify-between mb-3 gap-2">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${iconBg}`}>
                        <Icon name={t.icone || 'AlertTriangle'} size={18} />
                      </div>
                      <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold border ${pillCls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${dotCls}`} />
                        Padrão: {prio}
                      </span>
                    </div>
                    <h4 className="font-semibold text-ink dark:text-dink text-base leading-snug">{t.nome}</h4>
                    <p className="text-xs text-muted dark:text-dmuted mt-1.5 leading-relaxed line-clamp-3">{t.descricao}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-bd dark:border-dborder flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-[11px] text-muted dark:text-dmuted">
                      <Icon name="CheckCircle" size={11} />
                      Classificação Oficial SINGE
                    </span>
                    <button
                      onClick={() => toast.info('Edição de catálogo persistida na API.')}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-brand dark:text-dblue hover:underline"
                    >
                      Editar
                      <Icon name="ArrowRight" size={12} className="transition-transform group-hover:translate-x-0.5" />
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══ ABA 3: TIPOS DE EQUIPA ═════════════════════════════ */}
      {tab === 'tipos-equipa' && (
        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-bd dark:border-dborder flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                  <span className="w-1 h-5 rounded-full bg-gradient-to-b from-emerald-500 to-teal-500" />
                  Especialidades e Tipos de Equipa de Resposta
                </h3>
                <p className="text-xs text-muted dark:text-dmuted mt-0.5 ml-3">
                  Estrutura organizacional referenciada no Diagrama de Classes (TipoEquipa 1..* Equipa)
                </p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-medium tabular-nums">
                {tiposEq.length} tipos registados
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-[11px] uppercase tracking-wider text-muted dark:text-dmuted">
                  <tr>
                    <th className="text-left px-4 py-3 font-semibold">Sigla</th>
                    <th className="text-left px-4 py-3 font-semibold">Nome</th>
                    <th className="text-left px-4 py-3 font-semibold">Competências e Recursos</th>
                    <th className="text-left px-4 py-3 font-semibold">Equipas</th>
                    <th className="text-right px-4 py-3 font-semibold">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {tiposEq.map(te => (
                    <tr key={te.id} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                          {te.sigla}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink dark:text-dink">{te.nome}</td>
                      <td className="px-4 py-3 text-xs text-muted dark:text-dmuted max-w-sm">{te.descricao}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-900/50">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                          <span className="tabular-nums">{te.equipasAtivas}</span> mobilizadas
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          icon="Edit"
                          onClick={() => toast.info('Actualização de tipo de equipa.')}
                        >
                          Configurar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      )}

      {/* ═══ MODAL: Calibração de Fator ═════════════════════════ */}
      <Modal
        open={Boolean(editFator)}
        onClose={() => setEditFator(null)}
        title={`Calibrar Fator: ${editFator?.nome || ''}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setEditFator(null)}>Cancelar</Button>
            <Button icon="Save" onClick={handleSalvarFator}>Guardar Calibração</Button>
          </div>
        }
      >
        {editFator && (
          <form onSubmit={handleSalvarFator} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl border bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-900/50">
              <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center shrink-0">
                <Icon name="Sliders" size={18} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-ink dark:text-dink">Ajuste de peso no algoritmo</p>
                <p className="text-[11px] text-muted dark:text-dmuted">
                  A soma total dos fatores activos deve ser 100%.
                </p>
              </div>
              <span className="ml-auto font-mono text-xs font-bold text-brand dark:text-dblue shrink-0">{editFator.codigo}</span>
            </div>

            <Field label="Nome do Fator">
              <input
                value={editFator.nome}
                onChange={e => setEditFator({ ...editFator, nome: e.target.value })}
                className={inputCls}
                required
              />
            </Field>

            <Field label="Descrição e Critérios de Aplicação">
              <textarea
                value={editFator.descricao}
                onChange={e => setEditFator({ ...editFator, descricao: e.target.value })}
                className={inputCls}
                rows={3}
              />
            </Field>

            <Field label="Peso no Algoritmo (entre 0.05 e 0.50)">
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  step="0.05"
                  min="0.05"
                  max="0.60"
                  value={editFator.peso}
                  onChange={e => setEditFator({ ...editFator, peso: parseFloat(e.target.value) || 0 })}
                  className={inputCls + ' w-32'}
                  required
                />
                <div className="flex-1 min-w-0">
                  <div className="w-full h-2 rounded-full bg-light dark:bg-dsidebar overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all"
                      style={{ width: `${Math.min((editFator.peso || 0) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs font-semibold text-brand dark:text-dblue mt-1">
                    = {((editFator.peso || 0) * 100).toFixed(0)}% do peso global
                  </p>
                </div>
              </div>
            </Field>
          </form>
        )}
      </Modal>

      {/* ═══ MODAL: Novo Tipo de Ocorrência ═════════════════════ */}
      <Modal
        open={novoTipoOc}
        onClose={() => setNovoTipoOc(false)}
        title="Registar Novo Tipo de Ocorrência"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setNovoTipoOc(false)}>Cancelar</Button>
            <Button icon="Save" onClick={handleCriarTipoOc}>Criar Tipo</Button>
          </div>
        }
      >
        <form onSubmit={handleCriarTipoOc} className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl border bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-900/50">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Icon name="PlusCircle" size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-ink dark:text-dink">Adicionar ao catálogo oficial</p>
              <p className="text-[11px] text-muted dark:text-dmuted">
                O novo tipo ficará disponível na triagem de ocorrências.
              </p>
            </div>
          </div>

          <Field label="Nome da Emergência">
            <input
              placeholder="Ex.: Tsunami, Erupção, Tempestade Eléctrica..."
              value={formTipoOc.nome}
              onChange={e => setFormTipoOc({ ...formTipoOc, nome: e.target.value })}
              className={inputCls}
              required
            />
          </Field>

          <Field label="Descrição Operacional">
            <textarea
              placeholder="Detalhes dos riscos associados e orientações de triagem..."
              value={formTipoOc.descricao}
              onChange={e => setFormTipoOc({ ...formTipoOc, descricao: e.target.value })}
              className={inputCls}
              rows={3}
            />
          </Field>

          <Field label="Classificação de Gravidade Prévia">
            <select
              value={formTipoOc.prioridadePadrao}
              onChange={e => setFormTipoOc({ ...formTipoOc, prioridadePadrao: e.target.value })}
              className={inputCls}
            >
              <option>Crítico</option>
              <option>Alto</option>
              <option>Médio</option>
              <option>Baixo</option>
            </select>
            <div className="mt-2">
              <span className={`inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full font-semibold border ${PRIORIDADE_PILL[formTipoOc.prioridadePadrao] || ''}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${PRIORIDADE_DOT[formTipoOc.prioridadePadrao] || 'bg-slate-500'}`} />
                Pré-visualização: {formTipoOc.prioridadePadrao}
              </span>
            </div>
          </Field>
        </form>
      </Modal>
    </div>
  );
}

export default ParametrosSistema;