import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Modal, Field, inputCls } from '../../components/common/CommonComponents';
import { FATORES_PRIORIDADE, TIPOS_OCORRENCIA, TIPOS_EQUIPA } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function ParametrosSistema() {
  const toast = useToast();
  const [tab, setTab] = useState('fatores'); // 'fatores' | 'tipos-ocorrencia' | 'tipos-equipa'

  // Estados locais para interacção reactiva
  const [fatores, setFatores] = useState(FATORES_PRIORIDADE);
  const [tiposOc, setTiposOc] = useState(TIPOS_OCORRENCIA);
  const [tiposEq, setTiposEq] = useState(TIPOS_EQUIPA);

  // Modal para editar factor
  const [editFator, setEditFator] = useState(null);
  const [novoTipoOc, setNovoTipoOc] = useState(false);
  const [formTipoOc, setFormTipoOc] = useState({ nome: '', descricao: '', prioridadePadrao: 'Médio' });

  // Calcular soma de pesos actuais
  const totalPeso = fatores.reduce((acc, f) => acc + (f.ativo ? Number(f.peso) : 0), 0);

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
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold uppercase tracking-wider">
              Parametrização do Sistema
            </span>
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-1">Configuração de Fatores e Catálogos</h2>
          <p className="text-sm text-muted dark:text-dmuted">
            Defina os pesos do algoritmo de pontuação de prioridade, tipos de ocorrência e tipos de resposta (Diagrama de Classes UML).
          </p>
        </div>

        {tab === 'tipos-ocorrencia' && (
          <Button icon="PlusCircle" onClick={() => setNovoTipoOc(true)}>Adicionar Tipo de Emergência</Button>
        )}
      </div>

      {/* Navegação por Abas */}
      <div className="flex border-b border-bd dark:border-dborder gap-2">
        <button
          onClick={() => setTab('fatores')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'fatores'
              ? 'border-brand text-brand dark:text-dblue font-semibold'
              : 'border-transparent text-muted dark:text-dmuted hover:text-ink dark:hover:text-dink'
          }`}
        >
          <Icon name="Sliders" size={16} /> Fatores de Prioridade (Algoritmo)
        </button>
        <button
          onClick={() => setTab('tipos-ocorrencia')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'tipos-ocorrencia'
              ? 'border-brand text-brand dark:text-dblue font-semibold'
              : 'border-transparent text-muted dark:text-dmuted hover:text-ink dark:hover:text-dink'
          }`}
        >
          <Icon name="FileText" size={16} /> Tipos de Ocorrência (Catálogo)
        </button>
        <button
          onClick={() => setTab('tipos-equipa')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'tipos-equipa'
              ? 'border-brand text-brand dark:text-dblue font-semibold'
              : 'border-transparent text-muted dark:text-dmuted hover:text-ink dark:hover:text-dink'
          }`}
        >
          <Icon name="Users" size={16} /> Tipos de Equipa de Resposta
        </button>
      </div>

      {/* ABA 1: FATORES DE PRIORIDADE */}
      {tab === 'fatores' && (
        <div className="space-y-4">
          <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-dsidebar/60 dark:to-dcard border-blue-200 dark:border-dborder">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-ink dark:text-dink text-sm">Fórmula Multicritério de Apoio à Decisão</h3>
                <p className="text-xs text-muted dark:text-dmuted">
                  A pontuação de prioridade é calculada pela soma ponderada: Score = ∑ (Fator_i × Peso_i). A validação final permanece sob coordenação humana.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted dark:text-dmuted">Total ponderado:</span>
                <span className={`text-sm font-bold px-3 py-1 rounded-full ${
                  Math.abs(totalPeso - 1.0) < 0.01 
                    ? 'bg-green-100 text-green-700 dark:bg-green-950/70 dark:text-green-300' 
                    : 'bg-red-100 text-red-700 dark:bg-red-950/70 dark:text-red-300'
                }`}>
                  {(totalPeso * 100).toFixed(0)}% / 100%
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Código</th>
                    <th className="text-left px-4 py-3 font-medium">Fator de Avaliação</th>
                    <th className="text-left px-4 py-3 font-medium">Descrição Operacional</th>
                    <th className="text-left px-4 py-3 font-medium">Peso (Decimal)</th>
                    <th className="text-left px-4 py-3 font-medium">Peso (%)</th>
                    <th className="text-left px-4 py-3 font-medium">Estado</th>
                    <th className="text-right px-4 py-3 font-medium">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {fatores.map(f => (
                    <tr key={f.id} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-medium text-xs text-brand dark:text-dblue">{f.codigo}</td>
                      <td className="px-4 py-3 font-medium text-ink dark:text-dink">{f.nome}</td>
                      <td className="px-4 py-3 text-xs text-muted dark:text-dmuted max-w-xs">{f.descricao}</td>
                      <td className="px-4 py-3 font-mono font-bold text-ink dark:text-dink">{f.peso.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 rounded-full bg-light dark:bg-dsidebar overflow-hidden">
                            <div className="h-full bg-brand rounded-full" style={{ width: `${f.peso * 100}%` }} />
                          </div>
                          <span className="text-xs font-semibold text-muted dark:text-dmuted">{(f.peso * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleAtivoFator(f.id)}
                          className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors ${
                            f.ativo 
                              ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300' 
                              : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                          }`}
                        >
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

      {/* ABA 2: TIPOS DE OCORRÊNCIA */}
      {tab === 'tipos-ocorrencia' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tiposOc.map(t => (
              <Card key={t.id} className="p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-brand dark:text-dblue flex items-center justify-center shrink-0">
                      <Icon name={t.icone || 'AlertTriangle'} size={18} />
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded-md font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      Padrão: {t.prioridadePadrao}
                    </span>
                  </div>
                  <h4 className="font-semibold text-ink dark:text-dink text-base">{t.nome}</h4>
                  <p className="text-xs text-muted dark:text-dmuted mt-1 leading-relaxed">{t.descricao}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-bd dark:border-dborder flex items-center justify-between text-xs text-muted dark:text-dmuted">
                  <span>Classificação Oficial SINGE</span>
                  <button 
                    onClick={() => toast.info('Edição de catálogo persistida na API.')}
                    className="text-brand dark:text-dblue hover:underline font-medium"
                  >
                    Editar
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: TIPOS DE EQUIPA */}
      {tab === 'tipos-equipa' && (
        <div className="space-y-4">
          <Card>
            <div className="p-4 border-b border-bd dark:border-dborder flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-ink dark:text-dink">Especialidades e Tipos de Equipa de Resposta</h3>
                <p className="text-xs text-muted dark:text-dmuted">Estrutura organizacional referenciada no Diagrama de Classes (TipoEquipa 1..* Equipa)</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[650px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Sigla</th>
                    <th className="text-left px-4 py-3 font-medium">Nome da Especialidade</th>
                    <th className="text-left px-4 py-3 font-medium">Competências e Recursos</th>
                    <th className="text-left px-4 py-3 font-medium">Equipas Registadas</th>
                    <th className="text-right px-4 py-3 font-medium">Acções</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {tiposEq.map(te => (
                    <tr key={te.id} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-xs text-brand dark:text-dblue">{te.sigla}</td>
                      <td className="px-4 py-3 font-semibold text-ink dark:text-dink">{te.nome}</td>
                      <td className="px-4 py-3 text-xs text-muted dark:text-dmuted max-w-sm">{te.descricao}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300">
                          {te.equipasAtivas} mobilizadas
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

      {/* Modal para Calibração de Fator */}
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
                <span className="text-sm font-bold text-brand">
                  = {(editFator.peso * 100).toFixed(0)}% do peso global
                </span>
              </div>
            </Field>
          </form>
        )}
      </Modal>

      {/* Modal para Adicionar Tipo de Ocorrência */}
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
          </Field>
        </form>
      </Modal>
    </div>
  );
}

export default ParametrosSistema;

