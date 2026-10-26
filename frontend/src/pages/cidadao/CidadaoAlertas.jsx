import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, EmptyState, inputCls } from '../../components/common/CommonComponents';
import { ALERTAS } from '../../data/mockData';

export function CidadaoAlertas({ setPage, setSelectedAlerta }) {
  const [tipo, setTipo] = useState('');
  const [prov, setProv] = useState('');
  const [nivel, setNivel] = useState('');

  const filtered = ALERTAS.filter(a =>
    (!tipo || a.tipo === tipo) && 
    (!prov || a.regiao.includes(prov)) && 
    (!nivel || a.nivel === nivel)
  );

  const nivelMap = { 
    'Crítico': { bg: 'bg-red-600', label: 'CRÍTICO' }, 
    'Elevado': { bg: 'bg-orange-500', label: 'ELEVADO' }, 
    'Médio': { bg: 'bg-yellow-500', label: 'MÉDIO' }, 
    'Informativo': { bg: 'bg-brand', label: 'INFORMAÇÃO' } 
  };

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-dink">Alertas e Avisos</h1>
        <p className="text-sm text-muted dark:text-dmuted mt-1">
          Alertas emitidos por fontes autorizadas (INGD, INAM, MISAU). <span className="font-medium">Dados de demonstração.</span>
        </p>
      </div>

      <Card className="p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <select value={tipo} onChange={e => setTipo(e.target.value)} className={inputCls}>
            <option value="">Todos os tipos</option>
            {[...new Set(ALERTAS.map(a => a.tipo))].map(t => <option key={t}>{t}</option>)}
          </select>
          <select value={nivel} onChange={e => setNivel(e.target.value)} className={inputCls}>
            <option value="">Todos os níveis</option>
            <option>Crítico</option>
            <option>Elevado</option>
            <option>Médio</option>
            <option>Informativo</option>
          </select>
          <select value={prov} onChange={e => setProv(e.target.value)} className={inputCls}>
            <option value="">Todas as regiões</option>
            {['Maputo', 'Gaza', 'Sofala', 'Zambézia', 'Cabo Delgado', 'Nampula'].map(p => <option key={p}>{p}</option>)}
          </select>
        </div>
      </Card>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <EmptyState icon="Bell" title="Sem alertas encontrados" description="Nenhum alerta corresponde aos filtros seleccionados." />
          </Card>
        ) : (
          filtered.map(a => {
            const lvl = nivelMap[a.nivel] || nivelMap.Informativo;
            return (
              <Card key={a.id} className={`p-5 transition-colors ${a.ativo ? 'hover:border-brand/40' : 'opacity-70'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${lvl.bg}`}>{lvl.label}</span>
                    <span className="text-xs text-muted dark:text-dmuted">{a.tipo}</span>
                    {!a.ativo && (
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium">
                        Expirado
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted dark:text-dmuted whitespace-nowrap">{a.data}</span>
                </div>
                <h3 className="text-base font-semibold text-ink dark:text-dink">{a.titulo}</h3>
                <p className="text-xs text-muted dark:text-dmuted mt-1">
                  Região afectada: <span className="font-medium text-ink dark:text-dink">{a.regiao}</span> · Validade: {a.validade}
                </p>
                <p className="text-sm text-ink dark:text-dink mt-3">{a.descricao}</p>
                
                <div className="mt-3 p-3 rounded-lg bg-lblue dark:bg-dblue/10 text-xs">
                  <p className="font-semibold text-ink dark:text-dink mb-1 flex items-center gap-1">
                    <Icon name="Shield" size={12} className="text-brand dark:text-dblue" /> Recomendações
                  </p>
                  <p className="text-ink dark:text-dink">{a.recomendacoes}</p>
                </div>
                
                <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-2 border-t border-bd dark:border-dborder">
                  <p className="text-xs text-muted dark:text-dmuted">Fonte oficial: {a.entidade}</p>
                  <button 
                    onClick={() => { setSelectedAlerta(a); setPage('detalhe-alerta'); }} 
                    className="text-xs text-brand dark:text-dblue hover:underline flex items-center gap-1 font-medium"
                  >
                    Consultar detalhes <Icon name="ArrowRight" size={12} />
                  </button>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}

export default CidadaoAlertas;
