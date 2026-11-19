import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatCard, StatusBadge, Modal, Field, inputCls } from '../../components/common/CommonComponents';
import { EQUIPAS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

// Iniciais a partir do nome
function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

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
          <Button
            icon="Save"
            onClick={() => {
              onClose();
              toast.success('Equipa registada.');
            }}
          >
            Registar
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome da equipa" required>
          <input
            className={inputCls}
            placeholder="Ex: Equipa Foxtrot — Resgate"
            autoComplete="off"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Tipo" required>
            <select className={inputCls}>
              {['Busca e Salvamento', 'Saúde', 'Logística', 'Protecção Civil', 'Avaliação'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </Field>
          <Field label="Nº membros">
            <input type="number" min="1" defaultValue="8" className={inputCls} />
          </Field>
        </div>

        <Field label="Responsável" required>
          <input className={inputCls} placeholder="Ex: Cap. Ernesto Sitoe" autoComplete="name" />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Contacto">
            <input type="tel" className={inputCls} placeholder="+258 84 000 0000" autoComplete="tel" />
          </Field>
          <Field label="Estado">
            <select className={inputCls}>
              <option>Disponível</option>
              <option>Indisponível</option>
            </select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}

export function Equipas({ setPage, setSelectedEquipa }) {
  const [modal, setModal] = useState(false);

  const disponiveis = EQUIPAS.filter(e => e.estado === 'Disponível').length;
  const emMissao = EQUIPAS.filter(e => e.estado === 'Em missão').length;
  const indisponiveis = EQUIPAS.filter(e => e.estado === 'Indisponível').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="Users" size={22} className="text-brand" />
            Gestão de Equipas
          </h2>
          <p className="text-sm text-muted dark:text-dmuted mt-1">
            Acompanhe o estado operacional e efetivo no terreno.
          </p>
        </div>
        <Button icon="UserPlus" onClick={() => setModal(true)}>
          Registar equipa
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="Users" label="Total" value={EQUIPAS.length} tone="brand" />
        <StatCard icon="CheckCircle" label="Disponíveis" value={disponiveis} tone="green" />
        <StatCard icon="Activity" label="Em missão" value={emMissao} tone="brand" />
        <StatCard icon="XCircle" label="Indisponíveis" value={indisponiveis} tone="red" />
      </div>

      {/* Tabela */}
      <Card>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="List" size={16} className="text-muted" />
            Equipas registadas
          </h3>
          <span className="text-xs font-semibold rounded-full bg-light dark:bg-dsidebar px-2 py-0.5 text-muted dark:text-dmuted">
            {EQUIPAS.length} total
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-bd dark:border-dborder">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase tracking-wide text-muted dark:text-dmuted">
              <tr>
                {['Nome', 'Tipo', 'Responsável', 'Membros', 'Estado', 'Missão', 'Localização', ''].map(h => (
                  <th
                    key={h || 'actions'}
                    scope="col"
                    className={`text-left px-4 py-2.5 font-semibold whitespace-nowrap ${h === '' ? 'text-right' : ''}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bd dark:divide-dborder">
              {EQUIPAS.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-sm text-muted dark:text-dmuted">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="Users" size={28} className="opacity-40" />
                      <p>Sem equipas registadas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                EQUIPAS.map(e => (
                  <tr
                    key={e.id}
                    className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-full bg-navy/10 dark:bg-white/10 text-navy dark:text-white text-[10px] font-semibold flex items-center justify-center shrink-0">
                          {getInitials(e.nome)}
                        </span>
                        <span className="font-medium text-ink dark:text-dink">{e.nome}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted">{e.tipo}</td>
                    <td className="px-4 py-3 text-ink dark:text-dink whitespace-nowrap">{e.responsavel}</td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted tabular-nums">{e.membros}</td>
                    <td className="px-4 py-3"><StatusBadge s={e.estado} /></td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">
                      {e.missao || <span className="italic opacity-60">—</span>}
                    </td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{e.localizacao}</td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => { setSelectedEquipa(e); setPage('detalhe-eq'); }}
                        className="text-brand dark:text-dblue p-1.5 rounded-md hover:bg-lblue dark:hover:bg-dsidebar transition-colors"
                        title="Ver equipa"
                        aria-label={`Ver equipa ${e.nome}`}
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <CriarEquipaModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}

export default Equipas;