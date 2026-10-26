import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, PrioBadge, Timeline, EmptyState } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { useToast } from '../../contexts/ToastContext';

export function DetalheOcorrencia({ o, setPage, role }) {
  const toast = useToast();
  
  if (!o) {
    return (
      <EmptyState 
        icon="FileText" 
        title="Nenhuma ocorrência seleccionada" 
        action={<Button onClick={() => setPage('ocorrencias')}>Voltar</Button>}
      />
    );
  }

  const canEdit = role === 'operador' || role === 'administrador';
  const canValidate = role === 'operador' && o.estado === 'Em análise';
  const canCoordinate = role === 'coordenador' || role === 'administrador';

  return (
    <div className="space-y-4">
      <button 
        onClick={() => setPage('ocorrencias')} 
        className="text-sm text-brand dark:text-dblue flex items-center gap-1 hover:underline"
      >
        <Icon name="ChevronLeft" size={16} /> Voltar
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted dark:text-dmuted">{o.ref}</p>
          <h2 className="text-xl font-bold text-ink dark:text-dink">{o.titulo}</h2>
          <p className="text-sm text-muted dark:text-dmuted">{o.tipo} · {o.distrito}, {o.provincia}</p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge s={o.estado} />
          <PrioBadge p={o.prioridade} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-ink dark:text-dink">Descrição</h3>
            <p className="text-sm text-ink dark:text-dink">{o.descricao}</p>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-bd dark:border-dborder text-sm">
              <div>
                <p className="text-xs text-muted dark:text-dmuted">Data</p>
                <p className="text-ink dark:text-dink">{o.data}</p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-dmuted">Fonte</p>
                <p className="text-ink dark:text-dink">{o.fonte}</p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-dmuted">Afectados</p>
                <p className="text-ink dark:text-dink">{o.afectados ?? '—'}</p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-dmuted">Risco</p>
                <p className="text-ink dark:text-dink">{o.risco}</p>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-3">Histórico</h3>
            <Timeline items={[
              { data: o.data, txt: 'Registada' },
              { data: '15/01 08:45', txt: 'Em análise' },
              { data: '15/01 09:10', txt: 'Prioridade calculada' }
            ]} />
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-3">Localização</h3>
            <div className="h-48 rounded-lg overflow-hidden bg-light dark:bg-dsidebar">
              <MozambiqueMap ocorrencias={[o]} height={192} />
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-3">Acções</h3>
            <div className="space-y-2">
              {canEdit && (
                <Button variant="secondary" icon="Edit" className="w-full" onClick={() => toast.info('Edição requer backend.')}>
                  Editar
                </Button>
              )}
              {canValidate && (
                <Button icon="CheckCircle" className="w-full" onClick={() => toast.success('Validada.')}>
                  Validar
                </Button>
              )}
              {canCoordinate && (
                <Button icon="Target" className="w-full" onClick={() => toast.info('Requer backend.')}>
                  Criar missão
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DetalheOcorrencia;
