import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatCard, StatusBadge, PrioBadge, Modal, Field, inputCls } from '../../components/common/CommonComponents';
import { MISSOES, EQUIPAS, OCORRENCIAS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function CriarMissaoModal({ open, onClose }) {
  const toast = useToast();
  const [equipa, setEquipa] = useState('');
  const sel = EQUIPAS.find(e => e.id === equipa);
  const indisponivel = sel && sel.estado !== 'Disponível';

  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title="Criar nova missão"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button 
            icon="CheckCircle" 
            disabled={!equipa || !!indisponivel} 
            onClick={() => { onClose(); toast.success('Missão criada com sucesso.'); }}
          >
            Criar missão
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Ocorrência" required>
          <select className={inputCls}>
            {OCORRENCIAS.filter(o => o.estado !== 'Resolvida').map(o => (
              <option key={o.ref}>{o.ref} — {o.titulo}</option>
            ))}
          </select>
        </Field>
        
        <Field label="Objectivos da intervenção" required>
          <textarea rows={3} className={inputCls} placeholder="Descreva os objectivos principais..." />
        </Field>

        <Field label="Equipa de Resposta" required>
          <select value={equipa} onChange={e => setEquipa(e.target.value)} className={inputCls}>
            <option value="">Seleccionar equipa...</option>
            {EQUIPAS.map(e => (
              <option key={e.id} value={e.id} disabled={e.estado !== 'Disponível'}>
                {e.nome} — {e.estado}
              </option>
            ))}
          </select>
        </Field>
        {indisponivel && <p className="text-xs text-red-600 font-medium">Equipa seleccionada encontra-se indisponível.</p>}

        <Field label="Data e hora de início" required>
          <input type="datetime-local" className={inputCls} />
        </Field>
      </div>
    </Modal>
  );
}

export function Missoes({ setPage, setSelectedMissao }) {
  const [modal, setModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-dink">Coordenação de Missões</h2>
          <p className="text-sm text-muted dark:text-dmuted">Despacho e acompanhamento de intervenções no terreno.</p>
        </div>
        <Button icon="PlusCircle" onClick={() => setModal(true)}>Criar missão</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="Target" label="Activas" value={MISSOES.filter(m => m.estado === 'Em curso').length} tone="brand" />
        <StatCard icon="Clock" label="Pendentes" value={MISSOES.filter(m => m.estado === 'Atribuída').length} tone="orange" />
        <StatCard icon="CheckCircle" label="Concluídas" value={MISSOES.filter(m => m.estado === 'Concluída').length} tone="green" />
        <StatCard icon="XCircle" label="Canceladas" value={0} tone="red" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
              <tr>
                {['Referência', 'Ocorrência', 'Prioridade', 'Equipa', 'Início', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bd dark:divide-dborder">
              {MISSOES.map(m => (
                <tr key={m.ref} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink dark:text-dink whitespace-nowrap">{m.ref}</td>
                  <td className="px-4 py-3 text-ink dark:text-dink">{m.ocorrenciaRef}</td>
                  <td className="px-4 py-3"><PrioBadge p={m.prioridade} /></td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted">
                    {EQUIPAS.find(e => e.id === m.equipa)?.nome.split(' — ')[0] || m.equipa}
                  </td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{m.dataInicio}</td>
                  <td className="px-4 py-3"><StatusBadge s={m.estado} /></td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => { setSelectedMissao(m); setPage('detalhe-ms-coord'); }} 
                      className="text-brand dark:text-dblue p-1.5 rounded hover:bg-lblue dark:hover:bg-dsidebar"
                      title="Ver missão"
                    >
                      <Icon name="Eye" size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <CriarMissaoModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}

export default Missoes;
