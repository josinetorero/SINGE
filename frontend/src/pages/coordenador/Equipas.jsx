import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatCard, StatusBadge, Modal, Field, inputCls } from '../../components/common/CommonComponents';
import { EQUIPAS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function CriarEquipaModal({ open, onClose }) {
  const toast = useToast();
  return (
    <Modal 
      open={open} 
      onClose={onClose} 
      title="Registar equipa"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button icon="Save" onClick={() => { onClose(); toast.success('Equipa registada.'); }}>Registar</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome da equipa" required><input className={inputCls} placeholder="Ex: Equipa Foxtrot — Resgate" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Tipo" required>
            <select className={inputCls}>
              {['Busca e Salvamento', 'Saúde', 'Logística', 'Protecção Civil', 'Avaliação'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Nº membros"><input type="number" defaultValue="8" className={inputCls} /></Field>
        </div>
        <Field label="Responsável" required><input className={inputCls} placeholder="Ex: Cap. Ernesto Sitoe" /></Field>
        <Field label="Contacto"><input type="tel" className={inputCls} placeholder="+258 84 000 0000" /></Field>
        <Field label="Estado">
          <select className={inputCls}>
            <option>Disponível</option>
            <option>Indisponível</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}

export function Equipas({ setPage, setSelectedEquipa }) {
  const [modal, setModal] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-dink">Gestão de Equipas</h2>
          <p className="text-sm text-muted dark:text-dmuted">Acompanhe o estado operacional e efetivo no terreno.</p>
        </div>
        <Button icon="UserPlus" onClick={() => setModal(true)}>Registar equipa</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="Users" label="Total" value={EQUIPAS.length} tone="brand" />
        <StatCard icon="CheckCircle" label="Disponíveis" value={EQUIPAS.filter(e => e.estado === 'Disponível').length} tone="green" />
        <StatCard icon="Activity" label="Em missão" value={EQUIPAS.filter(e => e.estado === 'Em missão').length} tone="brand" />
        <StatCard icon="XCircle" label="Indisponíveis" value={EQUIPAS.filter(e => e.estado === 'Indisponível').length} tone="red" />
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
              <tr>
                {['Nome', 'Tipo', 'Responsável', 'Membros', 'Estado', 'Missão', 'Localização', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bd dark:divide-dborder">
              {EQUIPAS.map(e => (
                <tr key={e.id} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink dark:text-dink whitespace-nowrap">{e.nome}</td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted">{e.tipo}</td>
                  <td className="px-4 py-3 text-ink dark:text-dink whitespace-nowrap">{e.responsavel}</td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted">{e.membros}</td>
                  <td className="px-4 py-3"><StatusBadge s={e.estado} /></td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{e.missao || '—'}</td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{e.localizacao}</td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => { setSelectedEquipa(e); setPage('detalhe-eq'); }} 
                      className="text-brand dark:text-dblue p-1.5 rounded hover:bg-lblue dark:hover:bg-dsidebar"
                      title="Ver equipa"
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

      <CriarEquipaModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}

export default Equipas;
