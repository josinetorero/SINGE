import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, EmptyState } from '../../components/common/CommonComponents';
import { MISSOES } from '../../data/mockData';

export function DetalheEquipa({ e, setPage }) {
  if (!e) {
    return (
      <EmptyState 
        icon="Users" 
        title="Nenhuma equipa seleccionada" 
        action={<Button onClick={() => setPage('equipas')}>Voltar</Button>} 
      />
    );
  }

  const missoesEq = MISSOES.filter(m => m.equipa === e.id);

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setPage('equipas')} 
        className="text-sm text-brand dark:text-dblue flex items-center gap-1 hover:underline"
      >
        <Icon name="ChevronLeft" size={16} /> Voltar
      </button>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted dark:text-dmuted">{e.id}</p>
          <h2 className="text-xl font-bold text-ink dark:text-dink">{e.nome}</h2>
          <p className="text-sm text-muted dark:text-dmuted">{e.tipo}</p>
        </div>
        <StatusBadge s={e.estado} />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Informação Operacional</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted dark:text-dmuted">Responsável</dt>
              <dd className="text-ink dark:text-dink font-medium">{e.responsavel}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted dark:text-dmuted">Membros</dt>
              <dd className="text-ink dark:text-dink">{e.membros}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted dark:text-dmuted">Localização Base</dt>
              <dd className="text-ink dark:text-dink">{e.localizacao}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted dark:text-dmuted">Missão Atual</dt>
              <dd className="text-ink dark:text-dink">{e.missao || '—'}</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Histórico de Missões</h3>
          {missoesEq.length === 0 ? (
            <p className="text-sm text-muted dark:text-dmuted">Sem missões atribuídas.</p>
          ) : (
            missoesEq.map(m => (
              <div key={m.ref} className="flex items-center justify-between p-2.5 rounded-lg bg-light dark:bg-dsidebar/40 mb-2">
                <div>
                  <p className="text-sm font-medium text-ink dark:text-dink">{m.ref}</p>
                  <p className="text-xs text-muted dark:text-dmuted">{m.dataInicio}</p>
                </div>
                <StatusBadge s={m.estado} />
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}

export default DetalheEquipa;
