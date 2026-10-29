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
  const [pg, setPg] = useState(1);
  const pageSize = 6;

  const filtered = (ocorrencias || []).filter(o =>
    (!q || (o.ref && o.ref.toLowerCase().includes(q.toLowerCase())) || 
           (o.titulo && o.titulo.toLowerCase().includes(q.toLowerCase())) || 
           (o.descricao && o.descricao.toLowerCase().includes(q.toLowerCase()))) &&
    (!tipo || o.tipo === tipo) && 
    (!prov || o.provincia === prov) &&
    (!est || o.estado === est)
  );
  const slice = filtered.slice((pg - 1) * pageSize, pg * pageSize);

  const handleValidar = (o, e) => {
    e.stopPropagation();
    toast.success(`Ocorrência ${o.ref} validada com sucesso! Encaminhada para avaliação da Coordenação.`);
  };

  const handleSolicitarInfo = (o, e) => {
    e.stopPropagation();
    toast.info(`Pedido de esclarecimentos emitido para a ocorrência ${o.ref}.`);
  };

  return (
    <div className="space-y-4">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold uppercase tracking-wider">
              Posto de Atendimento
            </span>
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-1">Fila de Triagem e Ocorrências</h2>
          <p className="text-sm text-muted dark:text-dmuted">
            {filtered.length} ocorrências na fila. Valide os dados e encaminhe para a decisão operacional do Coordenador.
          </p>
        </div>
        <Button icon="PlusCircle" onClick={() => setPage('registar')}>Registar Nova Ocorrência</Button>
      </div>

      {/* Filtros de Triagem */}
      <Card className="p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none" />
            <input 
              placeholder="Pesquisar por ref, título ou descrição..." 
              value={q} 
              onChange={e => { setQ(e.target.value); setPg(1); }} 
              className={inputCls + ' pl-9'} 
            />
          </div>
          <select value={tipo} onChange={e => { setTipo(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todos os tipos de evento</option>
            {[...new Set((ocorrencias || []).map(o => o.tipo).filter(Boolean))].map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={prov} onChange={e => { setProv(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todas as províncias</option>
            {[...new Set((ocorrencias || []).map(o => o.provincia).filter(Boolean))].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </Card>

      {/* Tabela de Ocorrências com Triagem Rápida */}
      <Card>
        {slice.length === 0 ? (
          <EmptyState icon="FileText" title="Nenhuma ocorrência encontrada para os filtros selecionados" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[900px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium">Ref</th>
                    <th className="text-left px-4 py-3 font-medium">Tipo de Evento</th>
                    <th className="text-left px-4 py-3 font-medium">Título e Descrição</th>
                    <th className="text-left px-4 py-3 font-medium">Localização</th>
                    <th className="text-left px-4 py-3 font-medium">Fonte Denúncia</th>
                    <th className="text-left px-4 py-3 font-medium">Estado</th>
                    <th className="text-left px-4 py-3 font-medium">Prioridade</th>
                    <th className="text-right px-4 py-3 font-medium">Ações de Triagem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {slice.map(o => (
                    <tr 
                      key={o.ref || o.id} 
                      data-testid="oc-row" 
                      data-ref={o.ref || o.id} 
                      className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-medium text-ink dark:text-dink whitespace-nowrap text-xs">{o.ref}</td>
                      <td className="px-4 py-3 font-medium text-ink dark:text-dink whitespace-nowrap">{o.tipo}</td>
                      <td className="px-4 py-3 max-w-xs">
                        <p className="font-semibold text-ink dark:text-dink truncate">{o.titulo}</p>
                        <p className="text-xs text-muted dark:text-dmuted truncate">{o.descricao}</p>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">{o.distrito}, {o.provincia}</td>
                      <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">{o.fonte}</td>
                      <td className="px-4 py-3 whitespace-nowrap"><StatusBadge s={o.estado} /></td>
                      <td className="px-4 py-3 whitespace-nowrap"><PrioBadge p={o.prioridade} /></td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {o.estado === 'Nova' || o.estado === 'Em análise' ? (
                            <>
                              <button
                                onClick={(e) => handleSolicitarInfo(o, e)}
                                className="p-1.5 rounded-lg border border-bd dark:border-dborder text-xs text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar transition-colors"
                                title="Pedir dados complementares"
                              >
                                <Icon name="MessageSquare" size={14} />
                              </button>
                              <button
                                onClick={(e) => handleValidar(o, e)}
                                className="px-2.5 py-1 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                                title="Confirmar dados e enviar para Coordenação"
                              >
                                <Icon name="CheckCircle" size={13} /> Validar
                              </button>
                            </>
                          ) : null}
                          <button 
                            onClick={() => { setSelected(o); setPage('detalhe-oc'); }} 
                            className="p-1.5 rounded-lg text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar transition-colors"
                            title="Consultar Detalhes"
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
            <Pagination total={filtered.length} page={pg} pageSize={pageSize} onChange={setPg} />
          </>
        )}
      </Card>
    </div>
  );
}

export default OperadorOcorrencias;
