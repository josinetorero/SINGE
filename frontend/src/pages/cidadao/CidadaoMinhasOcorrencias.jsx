import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, EmptyState, inputCls } from '../../components/common/CommonComponents';
import { CIDADAO_OCORRENCIAS } from '../../data/mockData';

export function CidadaoMinhasOcorrencias({ setPage, setSelectedOc, ocorrencias }) {
  const [q, setQ] = useState('');
  const [tipo, setTipo] = useState('');
  const [estado, setEstado] = useState('');

  const lista = ocorrencias || CIDADAO_OCORRENCIAS;

  const filtered = lista.filter(o =>
    (!q || (o.ref && o.ref.toLowerCase().includes(q.toLowerCase())) || 
           (o.titulo && o.titulo.toLowerCase().includes(q.toLowerCase()))) &&
    (!tipo || o.tipo === tipo) && 
    (!estado || o.estado === estado)
  );

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-ink dark:text-dink">As Minhas Ocorrências</h1>
          <p className="text-sm text-muted dark:text-dmuted mt-1">Acompanhe as ocorrências que comunicou às entidades de resposta.</p>
        </div>
        <Button icon="PlusCircle" onClick={() => setPage('comunicar')}>Nova ocorrência</Button>
      </div>

      <Card className="p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none" />
            <input 
              placeholder="Pesquisar referência ou título..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              className={inputCls + ' pl-9'} 
            />
          </div>
          <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputCls}>
            <option value="">Todos os tipos</option>
            {[...new Set(lista.map(o => o.tipo).filter(Boolean))].map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={estado} onChange={e => setEstado(e.target.value)} className={inputCls}>
            <option value="">Todos os estados</option>
            {[...new Set(lista.map(o => o.estado).filter(Boolean))].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </Card>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState 
            icon="FileText" 
            title="Ainda não comunicou nenhuma ocorrência."
            description="Quando comunicar uma ocorrência, ela aparecerá aqui com estado e acompanhamento."
            action={<Button icon="PlusCircle" onClick={() => setPage('comunicar')}>Comunicar uma ocorrência</Button>}
          />
        </Card>
      ) : (
        <>
          {/* Tabela para Ecrãs Grandes */}
          <Card className="hidden md:block">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                  <tr>
                    {['Referência', 'Tipo', 'Localização', 'Data', 'Estado', 'Última actualização', ''].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {filtered.map(o => (
                    <tr 
                      key={o.ref || o.id} 
                      data-testid="cid-oc-item" 
                      data-ref={o.ref || o.id} 
                      className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-ink dark:text-dink whitespace-nowrap">{o.ref || o.id}</td>
                      <td className="px-4 py-3 text-ink dark:text-dink">{o.tipo}</td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">
                        {o.distrito ? `${o.distrito}, ${o.provincia}` : (o.localidade || 'Moçambique')}
                      </td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.data}</td>
                      <td className="px-4 py-3"><StatusBadge s={o.estado} /></td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.ultimaActualizacao || o.data}</td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => { setSelectedOc(o); setPage('detalhe-cidadao'); }} 
                          className="text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar p-1.5 rounded transition-colors"
                          title="Consultar"
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

          {/* Cards para Dispositivos Móveis */}
          <div className="md:hidden space-y-3">
            {filtered.map(o => (
              <Card 
                key={o.ref || o.id} 
                data-testid="cid-oc-item" 
                data-ref={o.ref || o.id} 
                className="p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted dark:text-dmuted">{o.ref || o.id}</span>
                  <StatusBadge s={o.estado} />
                </div>
                <p className="text-sm font-medium text-ink dark:text-dink">{o.titulo}</p>
                <p className="text-xs text-muted dark:text-dmuted">
                  {o.tipo} · {o.distrito ? `${o.distrito}, ${o.provincia}` : (o.localidade || 'Moçambique')}
                </p>
                <p className="text-xs text-muted dark:text-dmuted mt-1">Comunicada em {o.data}</p>
                <button 
                  onClick={() => { setSelectedOc(o); setPage('detalhe-cidadao'); }} 
                  className="mt-3 text-xs text-brand dark:text-dblue hover:underline font-medium block"
                >
                  Consultar detalhes →
                </button>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default CidadaoMinhasOcorrencias;
