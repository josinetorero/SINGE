import React from 'react';
import Icon from '../../components/common/Icon';
import { StatCard, Card, Button, StatusBadge, PrioBadge, Timeline } from '../../components/common/CommonComponents';

export function OperadorDashboard({ setPage, setSelected, ocorrencias }) {
  const novos = ocorrencias.filter(o => o.estado === 'Nova').length;
  const pend = ocorrencias.filter(o => o.estado === 'Em análise').length;
  const val = ocorrencias.filter(o => o.estado === 'Validada').length;
  const incompletas = ocorrencias.filter(o => !o.prioridade).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-dink">Painel do Operador</h2>
          <p className="text-sm text-muted dark:text-dmuted">Acompanhe e organize as ocorrências registadas no sistema.</p>
        </div>
        <Button icon="PlusCircle" onClick={() => setPage('registar')}>Registar ocorrência</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon="FileText" label="Registadas" value={ocorrencias.length} tone="brand" />
        <StatCard icon="Sparkles" label="Novas" value={novos} tone="brand" />
        <StatCard icon="Clock" label="Pend. validação" value={pend} tone="orange" />
        <StatCard icon="CheckCircle" label="Validadas" value={val} tone="green" />
        <StatCard icon="AlertTriangle" label="Info. em falta" value={incompletas} tone="red" />
      </div>

      <Card>
        <div className="p-5 border-b border-bd dark:border-dborder flex items-center justify-between">
          <h3 className="font-semibold text-ink dark:text-dink">Ocorrências recentes</h3>
          <button onClick={() => setPage('ocorrencias')} className="text-xs text-brand dark:text-dblue hover:underline flex items-center gap-1 font-medium">
            Ver todas <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
              <tr>
                {['Referência', 'Tipo', 'Localização', 'Data', 'Estado', 'Prioridade', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bd dark:divide-dborder">
              {ocorrencias.slice(0, 5).map(o => (
                <tr key={o.ref} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink dark:text-dink whitespace-nowrap">{o.ref}</td>
                  <td className="px-4 py-3 text-ink dark:text-dink">{o.tipo}</td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.distrito}, {o.provincia}</td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.data}</td>
                  <td className="px-4 py-3"><StatusBadge s={o.estado} /></td>
                  <td className="px-4 py-3"><PrioBadge p={o.prioridade} /></td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => { setSelected(o); setPage('detalhe-oc'); }} 
                      className="text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar p-1.5 rounded transition-colors"
                      title="Ver detalhes"
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

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Ocorrências que exigem atenção</h3>
          <div className="space-y-2">
            {ocorrencias.filter(o => o.estado === 'Em análise' || !o.prioridade).slice(0, 4).map(o => (
              <div key={o.ref} className="flex items-center gap-3 p-3 rounded-lg bg-light dark:bg-dsidebar/40">
                <Icon name="AlertTriangle" size={18} className="text-orange-500 shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink dark:text-dink truncate">{o.ref} · {o.titulo}</p>
                  <p className="text-xs text-muted dark:text-dmuted">{o.estado} · {o.distrito}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Actividade recente</h3>
          <Timeline items={[
            { data: 'Hoje, 08:30', txt: 'Ocorrência OC-2025-0142 registada' },
            { data: 'Hoje, 07:15', txt: 'OC-2025-0141 validada' },
            { data: 'Ontem, 18:45', txt: 'Evidências anexadas' },
            { data: 'Ontem, 14:20', txt: 'OC-2025-0139 registada' }
          ]} />
        </Card>
      </div>
    </div>
  );
}

export default OperadorDashboard;
