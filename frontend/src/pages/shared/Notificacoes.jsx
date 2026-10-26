import React from 'react';
import { Card } from '../../components/common/CommonComponents';

export function Notificacoes() {
  const items = [
    { tipo: 'Nova missão', titulo: 'MS-2025-0030 atribuída', desc: 'Equipa Bravo designada para avaliação epidemiológica.', urg: 'warning' },
    { tipo: 'Ocorrência crítica', titulo: 'OC-2025-0142', desc: 'Ciclone Filipe com ventos severos e evacuação em curso.', urg: 'error' },
    { tipo: 'Actualização', titulo: 'MS-2025-0031 em curso', desc: 'Equipa Alfa no terreno em Macurungo.', urg: 'ok' },
  ];

  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink">Notificações</h2>
        <p className="text-sm text-muted dark:text-dmuted">Histórico de notificações e avisos operacionais do sistema.</p>
      </div>

      <Card>
        {items.map((n, i) => (
          <div key={i} className="flex gap-3 p-4 border-b border-bd dark:border-dborder last:border-0 hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${n.urg === 'error' ? 'bg-red-500' : n.urg === 'warning' ? 'bg-orange-500' : 'bg-green-500'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-ink dark:text-dink">{n.titulo}</p>
              <p className="text-xs text-muted dark:text-dmuted mt-0.5">{n.desc}</p>
            </div>
            <span className="text-xs text-muted dark:text-dmuted whitespace-nowrap">{n.tipo}</span>
          </div>
        ))}
      </Card>
    </div>
  );
}

export default Notificacoes;
