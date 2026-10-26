import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, Timeline, EmptyState } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { useToast } from '../../contexts/ToastContext';

export function CidadaoDetalheOcorrencia({ o, setPage }) {
  const toast = useToast();

  if (!o) {
    return (
      <EmptyState 
        icon="FileText" 
        title="Nenhuma ocorrência encontrada" 
        action={<Button onClick={() => setPage('minhas-ocorrencias')}>Voltar</Button>} 
      />
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <button 
        onClick={() => setPage('minhas-ocorrencias')} 
        className="text-sm text-brand dark:text-dblue flex items-center gap-1 hover:underline font-medium"
      >
        <Icon name="ChevronLeft" size={16} /> Voltar às minhas ocorrências
      </button>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs text-muted dark:text-dmuted">Referência {o.ref}</p>
          <h1 className="text-xl font-bold text-ink dark:text-dink">{o.titulo}</h1>
          <p className="text-sm text-muted dark:text-dmuted">{o.tipo} · {o.distrito}, {o.provincia}</p>
        </div>
        <StatusBadge s={o.estado} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-ink dark:text-dink">Descrição</h3>
            <p className="text-sm text-ink dark:text-dink">{o.descricao}</p>
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-bd dark:border-dborder text-sm">
              <div>
                <p className="text-xs text-muted dark:text-dmuted">Submetida em</p>
                <p className="text-ink dark:text-dink">{o.data}</p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-dmuted">Última actualização</p>
                <p className="text-ink dark:text-dink">{o.ultimaActualizacao}</p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-dmuted">Evidências</p>
                <p className="text-ink dark:text-dink">{o.evidencias} ficheiro(s)</p>
              </div>
              <div>
                <p className="text-xs text-muted dark:text-dmuted">Estado</p>
                <div className="mt-1"><StatusBadge s={o.estado} /></div>
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-3">Acompanhamento e Evolução</h3>
            <Timeline items={[
              { data: o.data, txt: 'Ocorrência submetida' },
              { data: o.data, txt: 'Recebida pelo sistema SINGE' },
              ...(o.estado !== 'Submetida' ? [{ data: '+2h', txt: 'Em análise pelas entidades responsáveis' }] : []),
              ...(o.estado === 'Resolvida' || o.estado === 'Encerrada' ? [{ data: o.ultimaActualizacao, txt: 'Situação resolvida / encerrada' }] : []),
            ]} />
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" icon="MessageCircle" onClick={() => toast.info('Envio de informação adicional requer backend.')}>
              Fornecer informação adicional
            </Button>
            <Button variant="secondary" icon="Edit" onClick={() => toast.info('Pedido de correcção requer backend.')}>
              Solicitar correcção
            </Button>
          </div>
          <p className="text-xs text-muted dark:text-dmuted">
            Não é possível alterar unilateralmente o estado ou a prioridade da ocorrência. Contacte as entidades responsáveis se necessário.
          </p>
        </div>

        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-3">Localização</h3>
            <div className="h-48 rounded-lg overflow-hidden">
              <MozambiqueMap ocorrencias={[o]} height={192} />
            </div>
            <p className="text-xs text-muted dark:text-dmuted mt-2">{o.localidade}, {o.distrito}, {o.provincia}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CidadaoDetalheOcorrencia;
