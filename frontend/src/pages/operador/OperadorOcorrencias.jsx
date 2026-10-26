import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, PrioBadge, Pagination, EmptyState, inputCls } from '../../components/common/CommonComponents';
import { useToast } from '../../contexts/ToastContext';

export function OperadorOcorrencias({ setPage, setSelected, ocorrencias }) {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('');
  const [prov, setProv] = useState('');
  const [est, setEst] = useState('');
  const [prio, setPrio] = useState('');
  const [pg, setPg] = useState(1);
  const pageSize = 6;

  const filtered = ocorrencias.filter(o =>
    (!q || o.ref.toLowerCase().includes(q.toLowerCase()) || o.titulo.toLowerCase().includes(q.toLowerCase())) &&
    (!tipo || o.tipo === tipo) && 
    (!prov || o.provincia === prov) &&
    (!est || o.estado === est) && 
    (!prio || o.prioridade === prio)
  );
  const slice = filtered.slice((pg - 1) * pageSize, pg * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-dink">Gestão de Ocorrências</h2>
          <p className="text-sm text-muted dark:text-dmuted">{filtered.length} registos encontrados</p>
        </div>
        <Button icon="PlusCircle" onClick={() => setPage('registar')}>Registar ocorrência</Button>
      </div>

      <Card className="p-4">
        <div className="grid md:grid-cols-5 gap-3">
          <div className="relative md:col-span-2">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none" />
            <input 
              placeholder="Pesquisar por referência ou título..." 
              value={q} 
              onChange={e => { setQ(e.target.value); setPg(1); }} 
              className={inputCls + ' pl-9'} 
            />
          </div>
          <select value={tipo} onChange={e => { setTipo(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todos os tipos</option>
            {[...new Set(ocorrencias.map(o => o.tipo))].map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={prov} onChange={e => { setProv(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todas as províncias</option>
            {[...new Set(ocorrencias.map(o => o.provincia))].map(p => <option key={p}>{p}</option>)}
          </select>
          <select value={est} onChange={e => { setEst(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todos os estados</option>
            {[...new Set(ocorrencias.map(o => o.estado))].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={prio} onChange={e => { setPrio(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todas as prioridades</option>
            {['Crítico', 'Alto', 'Médio', 'Baixo'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </Card>

      <Card>
        {slice.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                  <tr>
                    {['Referência', 'Tipo', 'Descrição', 'Província', 'Distrito', 'Data', 'Estado', 'Prioridade', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {slice.map(o => (
                    <tr key={o.ref} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                      <td className="px-4 py-3 font-medium text-ink dark:text-dink whitespace-nowrap">{o.ref}</td>
                      <td className="px-4 py-3 text-ink dark:text-dink whitespace-nowrap">{o.tipo}</td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted max-w-xs truncate">{o.descricao}</td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.provincia}</td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.distrito}</td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.data}</td>
                      <td className="px-4 py-3"><StatusBadge s={o.estado} /></td>
                      <td className="px-4 py-3"><PrioBadge p={o.prioridade} /></td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <button 
                          onClick={() => { setSelected(o); setPage('detalhe-oc'); }} 
                          className="text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar p-1.5 rounded"
                          title="Consultar"
                        >
                          <Icon name="Eye" size={16} />
                        </button>
                        <button 
                          onClick={() => toast.info('Edição requer backend.')} 
                          className="text-ink dark:text-dink hover:bg-lblue dark:hover:bg-dsidebar p-1.5 rounded ml-1"
                          title="Editar"
                        >
                          <Icon name="Edit" size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination total={filtered.length} page={pg} pageSize={pageSize} onChange={setPg} />
          </>
        )}
      </Card>
    </div>
  );
}

export default OperadorOcorrencias;
