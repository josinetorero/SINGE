import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, PrioBadge, Timeline, EmptyState } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { OCORRENCIAS, EQUIPAS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function DetalheMissaoCoord({ m, setPage }) {
  const toast = useToast();

  if (!m) {
    return (
      <EmptyState 
        icon="Target" 
        title="Nenhuma missão seleccionada" 
        action={<Button onClick={() => setPage('missoes')}>Voltar</Button>} 
      />
    );
  }

  const oc = OCORRENCIAS.find(o => o.ref === m.ocorrenciaRef);
  const eq = EQUIPAS.find(e => e.id === m.equipa);

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setPage('missoes')} 
        className="text-sm text-brand dark:text-dblue flex items-center gap-1 hover:underline"
      >
        <Icon name="ChevronLeft" size={16} /> Voltar
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted dark:text-dmuted">{m.ref}</p>
          <h2 className="text-xl font-bold text-ink dark:text-dink">{oc?.titulo}</h2>
          <p className="text-sm text-muted dark:text-dmuted">{m.ocorrenciaRef}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge s={m.estado} />
          <PrioBadge p={m.prioridade} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-2">Objectivos</h3>
            <p className="text-sm text-ink dark:text-dink">{m.objetivos}</p>
            <h3 className="font-semibold text-ink dark:text-dink mt-4 mb-2">Instruções Operacionais</h3>
            <p className="text-sm text-ink dark:text-dink">{m.instrucoes}</p>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-3">Timeline de Execução</h3>
            <Timeline items={[...m.progresso, { data: '—', txt: 'Registada no sistema' }]} />
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon="UserPlus" onClick={() => toast.info('Reatribuição requer backend.')}>
              Reatribuir equipa
            </Button>
            <Button variant="secondary" icon="MessageSquare" onClick={() => toast.success('Instrução enviada ao chefe de equipa.')}>
              Enviar instrução
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-2">Equipa no Terreno</h3>
            <p className="text-sm font-medium text-ink dark:text-dink">{eq?.nome}</p>
            <p className="text-xs text-muted dark:text-dmuted">{eq?.tipo}</p>
            <p className="text-xs text-muted dark:text-dmuted mt-1">Efectivo: {eq?.membros} operacionais</p>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-2">Mapa da Operação</h3>
            <div className="h-48 rounded-lg overflow-hidden">
              <MozambiqueMap ocorrencias={oc ? [oc] : []} height={192} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DetalheMissaoCoord;
