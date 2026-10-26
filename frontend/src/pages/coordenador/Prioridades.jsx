import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, PrioBadge, StatusBadge, EmptyState } from '../../components/common/CommonComponents';
import { useToast } from '../../contexts/ToastContext';

export function Prioridades({ ocorrencias, setPage, setSelected }) {
  const toast = useToast();
  const pend = ocorrencias.filter(o => o.estado === 'Em análise' || !o.prioridade);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink">Avaliação e Priorização</h2>
        <p className="text-sm text-muted dark:text-dmuted">Reveja prioridades calculadas pelo motor de IA e valide as decisões operacionais.</p>
      </div>

      <Card>
        {pend.length === 0 ? (
          <EmptyState icon="CheckCircle" title="Nada a avaliar" description="Todas as ocorrências foram avaliadas e priorizadas." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[800px]">
              <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                <tr>
                  {['Referência', 'Tipo', 'Localização', 'Registo', 'Gravidade', 'Prioridade', 'Avaliação', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                {pend.map(o => (
                  <tr key={o.ref} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-ink dark:text-dink whitespace-nowrap">{o.ref}</td>
                    <td className="px-4 py-3 text-ink dark:text-dink">{o.tipo}</td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted">{o.distrito}</td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.data}</td>
                    <td className="px-4 py-3 text-ink dark:text-dink">{o.risco}</td>
                    <td className="px-4 py-3"><PrioBadge p={o.prioridade} /></td>
                    <td className="px-4 py-3"><StatusBadge s={o.prioridade ? 'Validada' : 'Nova'} /></td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button 
                        onClick={() => { setSelected(o); setPage('detalhe-oc'); }} 
                        className="text-brand dark:text-dblue p-1.5 rounded hover:bg-lblue dark:hover:bg-dsidebar"
                        title="Ver ocorrência"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                      <button 
                        onClick={() => toast.info('Revisão requer backend.')} 
                        className="text-ink dark:text-dink p-1.5 rounded hover:bg-lblue dark:hover:bg-dsidebar ml-1"
                        title="Rever prioridade"
                      >
                        <Icon name="Edit" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

export default Prioridades;
