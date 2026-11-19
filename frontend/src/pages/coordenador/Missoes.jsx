import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatCard, StatusBadge, PrioBadge, Modal, Field, inputCls } from '../../components/common/CommonComponents';
import { MISSOES, EQUIPAS, OCORRENCIAS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

// Nome curto da equipa (antes do " — ")
function teamShortName(id) {
  const team = EQUIPAS.find(e => e.id === id);
  return team?.nome?.split(' — ')[0] || id;
}

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
            onClick={() => {
              onClose();
              toast.success('Missão criada com sucesso.');
            }}
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
          <textarea
            rows={3}
            className={inputCls}
            placeholder="Descreva os objectivos principais…"
          />
        </Field>

        <Field label="Equipa de Resposta" required>
          <select
            value={equipa}
            onChange={e => setEquipa(e.target.value)}
            className={inputCls}
          >
            <option value="">Seleccionar equipa…</option>
            {EQUIPAS.map(e => (
              <option key={e.id} value={e.id} disabled={e.estado !== 'Disponível'}>
                {e.nome} — {e.estado}
              </option>
            ))}
          </select>
        </Field>

        {indisponivel && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30 p-2.5 text-xs text-amber-800 dark:text-amber-200"
          >
            <Icon name="AlertTriangle" size={14} className="mt-0.5 shrink-0" />
            <p>A equipa seleccionada encontra-se indisponível. Escolha outra para prosseguir.</p>
          </div>
        )}

        <Field label="Data e hora de início" required>
          <input type="datetime-local" className={inputCls} />
        </Field>
      </div>
    </Modal>
  );
}

export function Missoes({ setPage, setSelectedMissao }) {
  const [modal, setModal] = useState(false);

  const activas = MISSOES.filter(m => m.estado === 'Em curso').length;
  const pendentes = MISSOES.filter(m => m.estado === 'Atribuída').length;
  const concluidas = MISSOES.filter(m => m.estado === 'Concluída').length;
  const canceladas = MISSOES.filter(m => m.estado === 'Cancelada').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="Target" size={22} className="text-brand" />
            Coordenação de Missões
          </h2>
          <p className="text-sm text-muted dark:text-dmuted mt-1">
            Despacho e acompanhamento de intervenções no terreno.
          </p>
        </div>
        <Button icon="PlusCircle" onClick={() => setModal(true)}>
          Criar missão
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="Target" label="Activas" value={activas} tone="brand" />
        <StatCard icon="Clock" label="Pendentes" value={pendentes} tone="orange" />
        <StatCard icon="CheckCircle" label="Concluídas" value={concluidas} tone="green" />
        <StatCard icon="XCircle" label="Canceladas" value={canceladas} tone="red" />
      </div>

      {/* Tabela */}
      <Card>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="List" size={16} className="text-muted" />
            Missões registadas
          </h3>
          <span className="text-xs font-semibold rounded-full bg-light dark:bg-dsidebar px-2 py-0.5 text-muted dark:text-dmuted">
            {MISSOES.length} total
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-bd dark:border-dborder">
          <table className="w-full text-sm min-w-[800px]">
            <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase tracking-wide text-muted dark:text-dmuted">
              <tr>
                {['Referência', 'Ocorrência', 'Prioridade', 'Equipa', 'Início', 'Estado', ''].map(h => (
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
              {MISSOES.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-muted dark:text-dmuted">
                    <div className="flex flex-col items-center gap-2">
                      <Icon name="Target" size={28} className="opacity-40" />
                      <p>Sem missões registadas.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                MISSOES.map(m => (
                  <tr
                    key={m.ref}
                    className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono text-xs font-medium text-ink dark:text-dink">
                        {m.ref}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink dark:text-dink whitespace-nowrap">
                      {m.ocorrenciaRef}
                    </td>
                    <td className="px-4 py-3"><PrioBadge p={m.prioridade} /></td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5">
                        <Icon name="Users" size={12} className="opacity-60" />
                        {teamShortName(m.equipa)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">
                      {m.dataInicio}
                    </td>
                    <td className="px-4 py-3"><StatusBadge s={m.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMissao(m);
                          setPage('detalhe-ms-coord');
                        }}
                        className="text-brand dark:text-dblue p-1.5 rounded-md hover:bg-lblue dark:hover:bg-dsidebar transition-colors"
                        title="Ver missão"
                        aria-label={`Ver missão ${m.ref}`}
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

      <CriarMissaoModal open={modal} onClose={() => setModal(false)} />
    </div>
  );
}

export default Missoes;