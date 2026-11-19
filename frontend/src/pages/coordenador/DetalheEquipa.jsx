import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, EmptyState } from '../../components/common/CommonComponents';
import { MISSOES } from '../../data/mockData';

// Iniciais a partir do nome
function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Linha de informação com ícone
function InfoRow({ icon, label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-bd dark:border-dborder last:border-0">
      <dt className="text-muted dark:text-dmuted flex items-center gap-2 text-sm">
        <Icon name={icon} size={14} className="opacity-70 shrink-0" />
        {label}
      </dt>
      <dd
        className={`text-sm text-right ${
          highlight
            ? 'font-semibold text-ink dark:text-dink'
            : 'text-ink dark:text-dink'
        }`}
      >
        {value || '—'}
      </dd>
    </div>
  );
}

export function DetalheEquipa({ e, setPage }) {
  if (!e) {
    return (
      <EmptyState
        icon="Users"
        title="Nenhuma equipa seleccionada"
        description="Escolha uma equipa na lista para ver os detalhes operacionais."
        action={<Button onClick={() => setPage('equipas')}>Voltar às equipas</Button>}
      />
    );
  }

  const missoesEq = MISSOES.filter(m => m.equipa === e.id);

  return (
    <div className="space-y-4">
      {/* Botão voltar */}
      <button
        type="button"
        onClick={() => setPage('equipas')}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand dark:text-dblue hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors"
        aria-label="Voltar à lista de equipas"
      >
        <Icon name="ChevronLeft" size={16} />
        Voltar às equipas
      </button>

      {/* Header */}
      <Card className="p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-navy text-white flex items-center justify-center text-lg font-semibold shrink-0 shadow-sm">
              {getInitials(e.nome)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono text-muted dark:text-dmuted">{e.id}</p>
              <h2 className="text-xl font-bold text-ink dark:text-dink truncate">{e.nome}</h2>
              <p className="text-sm text-muted dark:text-dmuted flex items-center gap-1.5 mt-0.5">
                <Icon name="Tag" size={12} className="opacity-70" />
                {e.tipo}
              </p>
            </div>
          </div>
          <StatusBadge s={e.estado} />
        </div>
      </Card>

      {/* Grelha de detalhes */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Informação operacional */}
        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-2 flex items-center gap-2">
            <Icon name="Info" size={16} className="text-muted" />
            Informação Operacional
          </h3>
          <dl>
            <InfoRow icon="User" label="Responsável" value={e.responsavel} highlight />
            <InfoRow icon="Users" label="Membros" value={e.membros} />
            <InfoRow icon="MapPin" label="Localização Base" value={e.localizacao} />
            <InfoRow icon="Target" label="Missão Atual" value={e.missao} />
          </dl>
        </Card>

        {/* Histórico */}
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <Icon name="History" size={16} className="text-muted" />
              Histórico de Missões
            </h3>
            <span className="text-xs font-semibold rounded-full bg-light dark:bg-dsidebar px-2 py-0.5 text-muted dark:text-dmuted">
              {missoesEq.length}
            </span>
          </div>
          {missoesEq.length === 0 ? (
            <div className="text-center text-sm text-muted dark:text-dmuted py-8 flex flex-col items-center gap-2">
              <Icon name="Inbox" size={28} className="opacity-40" />
              <p>Sem missões atribuídas.</p>
            </div>
          ) : (
            <ul className="space-y-2" role="list">
              {missoesEq.map(m => (
                <li
                  key={m.ref}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg bg-light dark:bg-dsidebar/40 hover:bg-lblue/40 dark:hover:bg-dblue/10 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-8 h-8 rounded-lg bg-white dark:bg-dcard flex items-center justify-center text-brand dark:text-dblue shrink-0">
                      <Icon name="Target" size={14} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink dark:text-dink truncate">
                        {m.ref}
                      </p>
                      <p className="text-xs text-muted dark:text-dmuted flex items-center gap-1">
                        <Icon name="Calendar" size={10} />
                        {m.dataInicio}
                      </p>
                    </div>
                  </div>
                  <StatusBadge s={m.estado} />
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}

export default DetalheEquipa;
