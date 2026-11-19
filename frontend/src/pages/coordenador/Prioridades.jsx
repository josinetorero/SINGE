import React, { useMemo, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, PrioBadge, StatusBadge, EmptyState, Modal, Field, inputCls } from '../../components/common/CommonComponents';
import { FATORES_PRIORIDADE } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

// Estilo do índice ponderado por faixa
function toneForScore(value) {
  if (value < 2.5) return {
    cls: 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300',
    bar: 'bg-emerald-500',
    label: 'Baixa',
  };
  if (value < 5) return {
    cls: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300',
    bar: 'bg-amber-500',
    label: 'Média',
  };
  if (value < 7.5) return {
    cls: 'bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900 text-orange-800 dark:text-orange-300',
    bar: 'bg-orange-500',
    label: 'Alta',
  };
  return {
    cls: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900 text-red-800 dark:text-red-300',
    bar: 'bg-red-500',
    label: 'Crítica',
  };
}

export function Prioridades({ ocorrencias, setPage, setSelected }) {
  const toast = useToast();
  const [modalEval, setModalEval] = useState(null);
  const [prioFinal, setPrioFinal] = useState('Crítico');
  const [justificacao, setJustificacao] = useState('');
  const [scores, setScores] = useState({ 1: 9, 2: 8, 3: 7, 4: 8, 5: 6 });

  const pend = ocorrencias.filter(o => o.estado === 'Em análise' || o.estado === 'Nova' || !o.prioridade);
  const avaliadas = ocorrencias.filter(o => o.prioridade && o.estado !== 'Nova');

  const openEvalModal = (oc) => {
    setModalEval(oc);
    setPrioFinal(oc.prioridade || 'Crítico');
    setJustificacao('');
    setScores({ 1: 9, 2: 8, 3: 7, 4: 8, 5: 6 });
  };

  const handleSalvarAvaliacao = (e) => {
    e.preventDefault();
    if (!justificacao.trim()) {
      toast.error('Indique a justificação operacional obrigatória para a validação da prioridade.');
      return;
    }
    toast.success(`Prioridade de ${modalEval.ref} validada como "${prioFinal}" com suporte de critérios ponderados.`);
    setModalEval(null);
  };

  const pontuacaoCalculada = useMemo(
    () =>
      Number(
        FATORES_PRIORIDADE.reduce((acc, f) => acc + (scores[f.id] || 5) * f.peso, 0).toFixed(1)
      ),
    [scores]
  );
  const scoreTone = toneForScore(pontuacaoCalculada);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold uppercase tracking-wider">
            <Icon name="Shield" size={12} />
            Centro de Comando Tático
          </span>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-2">
            Avaliação de Gravidade e Priorização
          </h2>
          <p className="text-sm text-muted dark:text-dmuted mt-1 max-w-2xl">
            Aplique os factores configurados pelo Administrador, analise a pontuação heurística
            e valide a prioridade com julgamento humano.
          </p>
        </div>
        <Button
          variant="secondary"
          icon="Sliders"
          onClick={() =>
            toast.info('Os pesos dos factores são definidos e auditados pelo Administrador do SINGE.')
          }
        >
          Critérios Heurísticos
        </Button>
      </div>

      {/* Card de critérios */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dsidebar/50 dark:to-dcard border-blue-200 dark:border-dborder">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-sm text-ink dark:text-dink flex items-center gap-2">
              <Icon name="Scale" size={15} className="text-indigo-600 dark:text-indigo-300" />
              Critérios Ponderados em Vigor (Entidade UML: FatorPrioridade)
            </p>
            <div className="flex flex-wrap gap-2 mt-2">
              {FATORES_PRIORIDADE.map(f => (
                <span
                  key={f.id}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/80 dark:bg-dcard text-xs text-ink dark:text-dink border border-bd dark:border-dborder"
                >
                  {f.nome}
                  <strong className="font-mono text-indigo-700 dark:text-indigo-300">
                    {(f.peso * 100).toFixed(0)}%
                  </strong>
                </span>
              ))}
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted dark:text-dmuted bg-white/70 dark:bg-dcard px-2.5 py-1 rounded-md border border-bd dark:border-dborder">
            <Icon name="UserCheck" size={12} />
            Validação humana: <strong className="text-ink dark:text-dink">Obrigatória</strong>
          </span>
        </div>
      </Card>

      {/* Ocorrências pendentes */}
      <Card>
        <div className="p-5 border-b border-bd dark:border-dborder flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <Icon name="Clock" size={16} className="text-muted" />
              Ocorrências a Aguardar Avaliação de Gravidade
            </h3>
            <p className="text-xs text-muted dark:text-dmuted mt-0.5">
              {pend.length} ocorrência{pend.length === 1 ? '' : 's'} recebida{pend.length === 1 ? '' : 's'} e triada{pend.length === 1 ? '' : 's'} pelo Operador
            </p>
          </div>
          <span className="text-xs font-semibold rounded-full bg-light dark:bg-dsidebar px-2 py-0.5 text-muted dark:text-dmuted">
            {pend.length} pendente{pend.length === 1 ? '' : 's'}
          </span>
        </div>

        {pend.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon="CheckCircle"
              title="Todas as ocorrências foram avaliadas e priorizadas."
              description="Nada pendente de decisão neste momento."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[850px]">
              <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase tracking-wide text-muted dark:text-dmuted">
                <tr>
                  {['Ref', 'Tipo', 'Título da Situação', 'Localização', 'Data/Hora', 'Estado', 'Prioridade Proposta', ''].map(h => (
                    <th
                      key={h || 'actions'}
                      scope="col"
                      className={`px-4 py-2.5 font-semibold ${h === '' ? 'text-right' : 'text-left'}`}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                {pend.map(o => (
                  <tr key={o.ref} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-ink dark:text-dink text-xs whitespace-nowrap">
                      {o.ref}
                    </td>
                    <td className="px-4 py-3 font-medium text-ink dark:text-dink">{o.tipo}</td>
                    <td className="px-4 py-3 max-w-xs font-semibold text-ink dark:text-dink truncate">
                      {o.titulo}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">
                      {o.distrito}, {o.provincia}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">
                      {o.data}
                    </td>
                    <td className="px-4 py-3"><StatusBadge s={o.estado} /></td>
                    <td className="px-4 py-3">
                      <PrioBadge p={o.prioridade || 'A calcular'} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => openEvalModal(o)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 text-xs font-medium transition-colors"
                        >
                          <Icon name="AlertTriangle" size={13} />
                          Avaliar
                        </button>
                        <button
                          type="button"
                          onClick={() => { setSelected(o); setPage('detalhe-oc'); }}
                          className="p-1.5 rounded-md text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar transition-colors"
                          title="Ver ocorrência completa"
                          aria-label={`Ver ocorrência ${o.ref}`}
                        >
                          <Icon name="Eye" size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de avaliação */}
      <Modal
        open={Boolean(modalEval)}
        onClose={() => setModalEval(null)}
        title={`Avaliação de Prioridade: ${modalEval?.ref || ''}`}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setModalEval(null)}>Cancelar</Button>
            <Button icon="CheckCircle" onClick={handleSalvarAvaliacao}>Validar e Fixar Prioridade</Button>
          </div>
        }
      >
        {modalEval && (
          <form onSubmit={handleSalvarAvaliacao} className="space-y-4">
            {/* Cabeçalho da ocorrência */}
            <div className="p-3.5 rounded-xl bg-light dark:bg-dsidebar/50 border border-bd dark:border-dborder">
              <p className="font-semibold text-sm text-ink dark:text-dink">{modalEval.titulo}</p>
              <p className="text-xs text-muted dark:text-dmuted mt-0.5 flex items-center gap-1.5">
                <Icon name="Tag" size={11} />
                {modalEval.tipo} · {modalEval.distrito}, {modalEval.provincia}
              </p>
            </div>

            {/* Factores */}
            <div>
              <p className="text-xs font-semibold text-muted dark:text-dmuted uppercase tracking-wide mb-2">
                Pontuação por Factor de Avaliação (1 a 10)
              </p>
              <div className="space-y-2">
                {FATORES_PRIORIDADE.map(f => {
                  const value = scores[f.id] || 5;
                  return (
                    <div
                      key={f.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg bg-light/50 dark:bg-dsidebar/30 border border-bd dark:border-dborder"
                    >
                      <span className="font-medium text-xs text-ink dark:text-dink flex-1 truncate">
                        {f.nome}
                        <span className="ml-1 text-muted dark:text-dmuted font-normal">
                          ({(f.peso * 100).toFixed(0)}%)
                        </span>
                      </span>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={value}
                        onChange={e => setScores({ ...scores, [f.id]: parseInt(e.target.value, 10) })}
                        className="w-28 accent-indigo-600"
                        aria-label={`Pontuação para ${f.nome}`}
                        aria-valuemin={1}
                        aria-valuemax={10}
                        aria-valuenow={value}
                      />
                      <span
                        className="font-mono font-bold text-ink dark:text-dink text-xs w-10 text-right tabular-nums"
                        aria-live="polite"
                      >
                        {value}/10
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Índice ponderado */}
            <div
              role="status"
              aria-live="polite"
              className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${scoreTone.cls}`}
            >
              <div>
                <p className="text-[10px] uppercase tracking-wide font-semibold opacity-80">
                  Índice de Gravidade Ponderado
                </p>
                <p className="text-2xl font-bold font-mono mt-0.5">
                  {pontuacaoCalculada.toFixed(1)}
                  <span className="text-sm opacity-70">/10.0</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wide font-semibold opacity-80">
                  Classificação sugerida
                </p>
                <p className="text-sm font-bold flex items-center gap-1.5 justify-end">
                  <span className={`w-2.5 h-2.5 rounded-full ${scoreTone.bar}`} />
                  {scoreTone.label}
                </p>
              </div>
            </div>

            <Field label="Prioridade Operacional Validada" required>
              <select
                value={prioFinal}
                onChange={e => setPrioFinal(e.target.value)}
                className={inputCls}
              >
                <option>Crítico</option>
                <option>Alto</option>
                <option>Médio</option>
                <option>Baixo</option>
              </select>
            </Field>

            <Field label="Justificação da Decisão do Coordenador" required>
              <textarea
                rows={3}
                className={inputCls}
                placeholder="Indique a fundamentação técnica para a classificação da prioridade…"
                value={justificacao}
                onChange={e => setJustificacao(e.target.value)}
                required
              />
            </Field>
          </form>
        )}
      </Modal>
    </div>
  );
}

export default Prioridades;