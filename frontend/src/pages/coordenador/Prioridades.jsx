import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, PrioBadge, StatusBadge, EmptyState, Modal, Field, inputCls } from '../../components/common/CommonComponents';
import { FATORES_PRIORIDADE } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

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
    // Scores de exemplo
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

  // Calcular score ponderado atual
  const pontuacaoCalculada = FATORES_PRIORIDADE.reduce((acc, f) => {
    const s = scores[f.id] || 5;
    return acc + (s * f.peso);
  }, 0).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 font-semibold uppercase tracking-wider">
              Centro de Comando Tático
            </span>
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-1">Avaliação de Gravidade e Priorização</h2>
          <p className="text-sm text-muted dark:text-dmuted">
            Aplique os fatores configurados pelo Administrador, analise a pontuação heurística e valide a prioridade com julgamento humano.
          </p>
        </div>

        <Button 
          variant="secondary" 
          icon="Sliders" 
          onClick={() => toast.info('Os pesos dos fatores são definidos e auditados pelo Administrador do SINGE.')}
        >
          Critérios Heurísticos
        </Button>
      </div>

      {/* Cartão de Fórmulas e Pesos Ativos */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dsidebar/50 dark:to-dcard border-blue-200 dark:border-dborder">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <p className="font-semibold text-ink dark:text-dink">Critérios Ponderados em Vigor (Entidade UML: FatorPrioridade):</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {FATORES_PRIORIDADE.map(f => (
                <span key={f.id} className="px-2 py-0.5 rounded bg-white/80 dark:bg-dcard text-ink dark:text-dink border border-bd dark:border-dborder">
                  {f.nome}: <strong>{(f.peso * 100).toFixed(0)}%</strong>
                </span>
              ))}
            </div>
          </div>
          <span className="text-muted dark:text-dmuted">Validação Humana: <strong>Obrigatória</strong></span>
        </div>
      </Card>

      {/* Ocorrências Pendentes de Avaliação */}
      <Card>
        <div className="p-5 border-b border-bd dark:border-dborder flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-ink dark:text-dink">Ocorrências a Aguardar Avaliação de Gravidade</h3>
            <p className="text-xs text-muted dark:text-dmuted">{pend.length} ocorrências recebidas e triadas pelo Operador</p>
          </div>
        </div>

        {pend.length === 0 ? (
          <EmptyState icon="CheckCircle" title="Todas as ocorrências foram avaliadas e priorizadas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[850px]">
              <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Ref</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Título da Situação</th>
                  <th className="text-left px-4 py-3 font-medium">Localização</th>
                  <th className="text-left px-4 py-3 font-medium">Data/Hora</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-left px-4 py-3 font-medium">Prioridade Proposta</th>
                  <th className="text-right px-4 py-3 font-medium">Decisão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                {pend.map(o => (
                  <tr key={o.ref} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-ink dark:text-dink text-xs">{o.ref}</td>
                    <td className="px-4 py-3 font-medium text-ink dark:text-dink">{o.tipo}</td>
                    <td className="px-4 py-3 max-w-xs font-semibold text-ink dark:text-dink truncate">{o.titulo}</td>
                    <td className="px-4 py-3 text-xs text-muted dark:text-dmuted">{o.distrito}, {o.provincia}</td>
                    <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">{o.data}</td>
                    <td className="px-4 py-3"><StatusBadge s={o.estado} /></td>
                    <td className="px-4 py-3"><PrioBadge p={o.prioridade || 'A calcular'} /></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button 
                        size="sm" 
                        icon="AlertTriangle" 
                        onClick={() => openEvalModal(o)}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        Avaliar Gravidade
                      </Button>
                      <button 
                        onClick={() => { setSelected(o); setPage('detalhe-oc'); }} 
                        className="p-1.5 rounded-lg text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar ml-1 transition-colors"
                        title="Ver ocorrência completa"
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

      {/* Modal de Avaliação Multicritério com Validação Humana */}
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
            <div className="p-3.5 rounded-lg bg-light dark:bg-dsidebar/50 border border-bd dark:border-dborder">
              <p className="font-semibold text-sm text-ink dark:text-dink">{modalEval.titulo}</p>
              <p className="text-xs text-muted dark:text-dmuted mt-0.5">{modalEval.tipo} · {modalEval.distrito}, {modalEval.provincia}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted dark:text-dmuted uppercase mb-2">Pontuação por Factor de Avaliação (1 a 10):</p>
              <div className="space-y-2.5">
                {FATORES_PRIORIDADE.map(f => (
                  <div key={f.id} className="flex items-center justify-between gap-3 text-xs p-2 rounded bg-light/50 dark:bg-dsidebar/30">
                    <span className="font-medium text-ink dark:text-dink flex-1 truncate">{f.nome} ({(f.peso * 100).toFixed(0)}%)</span>
                    <input 
                      type="range" 
                      min="1" 
                      max="10" 
                      value={scores[f.id] || 5} 
                      onChange={e => setScores({ ...scores, [f.id]: parseInt(e.target.value) })}
                      className="w-28"
                    />
                    <span className="font-mono font-bold text-ink dark:text-dink w-6 text-right">{scores[f.id] || 5}/10</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between text-xs">
              <span className="text-indigo-900 dark:text-indigo-300 font-semibold">Índice de Gravidade Ponderado:</span>
              <span className="text-base font-bold text-indigo-700 dark:text-indigo-300 font-mono">{pontuacaoCalculada} / 10.0</span>
            </div>

            <Field label="Prioridade Operacional Validada" required>
              <select value={prioFinal} onChange={e => setPrioFinal(e.target.value)} className={inputCls}>
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
                placeholder="Indique a fundamentação técnica para a classificação da prioridade..." 
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
