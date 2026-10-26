import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Pagination, EmptyState, inputCls } from '../../components/common/CommonComponents';
import { HISTORICO } from '../../data/mockData';

export function HistoricoSistema() {
  const [q, setQ] = useState('');
  const [ent, setEnt] = useState('');
  const [pg, setPg] = useState(1);
  const pageSize = 6;

  const filtered = HISTORICO.filter(h =>
    (!q || h.desc.toLowerCase().includes(q.toLowerCase()) || h.user.toLowerCase().includes(q.toLowerCase())) &&
    (!ent || h.entidade.startsWith(ent))
  );
  const slice = filtered.slice((pg - 1) * pageSize, pg * pageSize);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink">Histórico do Sistema</h2>
        <p className="text-sm text-muted dark:text-dmuted">Registo imutável de auditoria de eventos e ações operacionais (Somente leitura).</p>
      </div>

      <Card className="p-4">
        <div className="grid md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none" />
            <input 
              placeholder="Pesquisar por descrição ou utilizador..." 
              value={q} 
              onChange={e => { setQ(e.target.value); setPg(1); }} 
              className={inputCls + ' pl-9'} 
            />
          </div>
          <select value={ent} onChange={e => { setEnt(e.target.value); setPg(1); }} className={inputCls}>
            <option value="">Todas as entidades</option>
            <option value="OC">Ocorrências (OC)</option>
            <option value="MS">Missões (MS)</option>
            <option value="US">Utilizadores (US)</option>
          </select>
        </div>
      </Card>

      <Card>
        {slice.length === 0 ? (
          <EmptyState icon="History" title="Sem registos de histórico" />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[800px]">
                <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                  <tr>
                    {['Data', 'Utilizador', 'Acção', 'Entidade', 'Descrição', 'Registo'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-bd dark:divide-dborder">
                  {slice.map((h, i) => (
                    <tr key={i} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                      <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{h.data}</td>
                      <td className="px-4 py-3 text-ink dark:text-dink whitespace-nowrap font-medium">{h.user}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs px-2 py-1 rounded bg-lblue dark:bg-dblue/20 text-brand dark:text-dblue font-medium">
                          {h.acao}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted dark:text-dmuted">{h.entidade}</td>
                      <td className="px-4 py-3 text-ink dark:text-dink">{h.desc}</td>
                      <td className="px-4 py-3">
                        <span className="text-brand dark:text-dblue text-xs font-mono font-semibold">{h.reg}</span>
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

export default HistoricoSistema;
