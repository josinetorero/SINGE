import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, EmptyState } from '../../components/common/CommonComponents';
import { CIDADAO_NOTIFICACOES } from '../../data/mockData';

export function CidadaoNotificacoes({ setPage }) {
  const [lidas, setLidas] = useState(new Set(CIDADAO_NOTIFICACOES.filter(n => n.lida).map(n => n.id)));

  const marcarLida = (id) => {
    const s = new Set(lidas);
    s.add(id);
    setLidas(s);
  };

  const marcarTodas = () => {
    setLidas(new Set(CIDADAO_NOTIFICACOES.map(n => n.id)));
  };

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink dark:text-dink">Notificações</h1>
        <Button variant="secondary" size="sm" icon="CheckCheck" onClick={marcarTodas}>
          Marcar todas como lidas
        </Button>
      </div>
      <Card>
        {CIDADAO_NOTIFICACOES.length === 0 ? (
          <EmptyState icon="Bell" />
        ) : (
          CIDADAO_NOTIFICACOES.map(n => {
            const isLida = lidas.has(n.id);
            return (
              <button
                key={n.id}
                onClick={() => {
                  marcarLida(n.id);
                  if (n.ref) setPage('minhas-ocorrencias');
                }}
                className={`w-full text-left flex gap-3 p-4 border-b border-bd dark:border-dborder last:border-0 hover:bg-light dark:hover:bg-dsidebar/30 transition-colors ${
                  !isLida ? 'bg-lblue/30 dark:bg-dblue/5' : ''
                }`}
              >
                <div
                  className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                    !isLida ? 'bg-red-500' : 'bg-transparent'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        n.urg === 'error'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300'
                          : n.urg === 'ok'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                      }`}
                    >
                      {n.tipo}
                    </span>
                    {n.ref && <span className="text-xs text-muted dark:text-dmuted">{n.ref}</span>}
                  </div>
                  <p className="text-sm font-medium text-ink dark:text-dink">{n.titulo}</p>
                  <p className="text-xs text-muted dark:text-dmuted mt-0.5">{n.desc}</p>
                  <p className="text-xs text-muted dark:text-dmuted mt-1">{n.data}</p>
                </div>
              </button>
            );
          })
        )}
      </Card>
    </div>
  );
}

export default CidadaoNotificacoes;
