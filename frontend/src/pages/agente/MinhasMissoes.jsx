import React from 'react';
import { Card, StatusBadge, PrioBadge } from '../../components/common/CommonComponents';
import { MISSOES, OCORRENCIAS } from '../../data/mockData';

export function MinhasMissoes({ setPage, setSelectedMissao }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink">As minhas missões</h2>
        <p className="text-sm text-muted dark:text-dmuted">Lista completa de missões atribuídas à sua equipa operacional.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {MISSOES.map(m => {
          const oc = OCORRENCIAS.find(o => o.ref === m.ocorrenciaRef);
          return (
            <Card key={m.ref} className="p-4 hover:border-brand/40 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-muted dark:text-dmuted">{m.ref}</span>
                <StatusBadge s={m.estado} />
              </div>
              <p className="text-sm font-medium text-ink dark:text-dink">{oc?.titulo}</p>
              <p className="text-xs text-muted dark:text-dmuted">{oc?.distrito}, {oc?.provincia}</p>
              <div className="mt-3 flex items-center justify-between">
                <PrioBadge p={m.prioridade} />
                <button 
                  onClick={() => { setSelectedMissao(m); setPage('detalhe-ms'); }} 
                  className="text-xs text-brand dark:text-dblue hover:underline font-medium"
                >
                  Ver detalhes →
                </button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export default MinhasMissoes;
