import React from 'react';
import Icon from '../../components/common/Icon';
import { StatCard, Card, Button, StatusBadge, PrioBadge } from '../../components/common/CommonComponents';
import { MISSOES, OCORRENCIAS } from '../../data/mockData';

export function AgenteDashboard({ setPage, setSelectedMissao }) {
  const minhas = MISSOES.slice(0, 2);
  const prox = minhas[0];
  const oc = prox ? OCORRENCIAS.find(o => o.ref === prox.ocorrenciaRef) : null;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink">Painel de Operações</h2>
        <p className="text-sm text-muted dark:text-dmuted">Consulte as suas missões e reporte o estado da intervenção no terreno.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="Target" label="Atribuídas" value={MISSOES.length} tone="brand" />
        <StatCard icon="Activity" label="Em curso" value={MISSOES.filter(m => m.estado === 'Em curso').length} tone="brand" />
        <StatCard icon="CheckCircle" label="Concluídas" value={MISSOES.filter(m => m.estado === 'Concluída').length} tone="green" />
        <StatCard icon="RefreshCw" label="Actualizações" value={1} tone="orange" />
      </div>

      {prox && (
        <Card className="p-5 border-l-4 border-l-brand">
          <p className="text-xs font-medium text-brand dark:text-dblue uppercase">Missão prioritária</p>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold text-ink dark:text-dink">{prox.ref}</h3>
              <p className="text-sm text-muted dark:text-dmuted">{prox.ocorrenciaRef} · {oc?.titulo}</p>
              <p className="text-sm text-ink dark:text-dink mt-1 font-medium">{oc?.distrito}, {oc?.provincia}</p>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge s={prox.estado} />
              <PrioBadge p={prox.prioridade} />
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button onClick={() => { setSelectedMissao(prox); setPage('detalhe-ms'); }} icon="Eye">
              Ver missão
            </Button>
            <Button variant="secondary" onClick={() => { setSelectedMissao(prox); setPage('atualizar'); }} icon="RefreshCw">
              Actualizar
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-ink dark:text-dink">Missões atribuídas</h3>
          <button onClick={() => setPage('missoes')} className="text-xs text-brand dark:text-dblue hover:underline font-medium">
            Ver todas
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {minhas.map(m => {
            const oc = OCORRENCIAS.find(o => o.ref === m.ocorrenciaRef);
            return (
              <div key={m.ref} className="p-4 rounded-lg border border-bd dark:border-dborder hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted dark:text-dmuted">{m.ref}</span>
                  <PrioBadge p={m.prioridade} />
                </div>
                <p className="text-sm font-medium text-ink dark:text-dink">{oc?.titulo}</p>
                <p className="text-xs text-muted dark:text-dmuted">{oc?.distrito}, {oc?.provincia}</p>
                <div className="mt-3 flex items-center justify-between">
                  <StatusBadge s={m.estado} />
                  <button onClick={() => { setSelectedMissao(m); setPage('detalhe-ms'); }} className="text-xs text-brand dark:text-dblue hover:underline">
                    Ver missão →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default AgenteDashboard;
