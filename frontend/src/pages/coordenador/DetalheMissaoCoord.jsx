import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, PrioBadge, Timeline, EmptyState } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { OCORRENCIAS, EQUIPAS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(p => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Section({ icon, title, children }) {
  return (
    <div>
      <h3 className="font-semibold text-ink dark:text-dink mb-1.5 flex items-center gap-2">
        <Icon name={icon} size={15} className="text-muted" />
        {title}
      </h3>
      <div className="text-sm text-ink dark:text-dink leading-relaxed">{children}</div>
    </div>
  );
}

export function DetalheMissaoCoord({ m, setPage }) {
  const toast = useToast();

  if (!m) {
    return (
      <EmptyState
        icon="Target"
        title="Nenhuma missão seleccionada"
        description="Escolha uma missão na lista para ver os detalhes operacionais."
        action={<Button onClick={() => setPage('missoes')}>Voltar às missões</Button>}
      />
    );
  }

  const oc = OCORRENCIAS.find(o => o.ref === m.ocorrenciaRef);
  const eq = EQUIPAS.find(e => e.id === m.equipa);

  return (
    <div className="space-y-4">
      {/* Voltar */}
      <button
        type="button"
        onClick={() => setPage('missoes')}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand dark:text-dblue hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors"
        aria-label="Voltar à lista de missões"
      >
        <Icon name="ChevronLeft" size={16} />
        Voltar às missões
      </button>

      {/* Header */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-4 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0">
              <Icon name="Target" size={22} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-mono text-muted dark:text-dmuted">
                Missão {m.ref}
              </p>
              <h2 className="text-xl font-bold text-ink dark:text-dink truncate">
                {oc?.titulo || 'Missão sem ocorrência associada'}
              </h2>
              {m.ocorrenciaRef && (
                <p className="text-sm text-muted dark:text-dmuted flex items-center gap-1.5 mt-0.5">
                  <Icon name="FileText" size={12} className="opacity-70" />
                  {m.ocorrenciaRef}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge s={m.estado} />
            <PrioBadge p={m.prioridade} />
          </div>
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5 space-y-4">
            <Section icon="Flag" title="Objectivos">
              <p className="whitespace-pre-wrap">{m.objetivos || '—'}</p>
            </Section>
            <div className="border-t border-bd dark:border-dborder pt-4">
              <Section icon="ClipboardList" title="Instruções Operacionais">
                <p className="whitespace-pre-wrap">{m.instrucoes || '—'}</p>
              </Section>
            </div>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <Icon name="History" size={16} className="text-muted" />
                Timeline de Execução
              </h3>
              <span className="text-xs font-semibold rounded-full bg-light dark:bg-dsidebar px-2 py-0.5 text-muted dark:text-dmuted">
                {m.progresso?.length || 0} evento{(m.progresso?.length || 0) === 1 ? '' : 's'}
              </span>
            </div>
            <Timeline
              items={[
                ...(m.progresso || []),
                { data: '—', txt: 'Registada no sistema' },
              ]}
            />
          </Card>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="secondary"
              icon="UserPlus"
              onClick={() => toast.info('Reatribuição requer backend.')}
            >
              Reatribuir equipa
            </Button>
            <Button
              variant="secondary"
              icon="MessageSquare"
              onClick={() =>
                toast.success('Instrução enviada ao chefe de equipa.')
              }
            >
              Enviar instrução
            </Button>
          </div>
        </div>

        {/* Coluna lateral */}
        <div className="space-y-4">
          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-3 flex items-center gap-2">
              <Icon name="Users" size={16} className="text-muted" />
              Equipa no Terreno
            </h3>
            {eq ? (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-navy text-white flex items-center justify-center text-base font-semibold shrink-0">
                  {getInitials(eq.nome)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink dark:text-dink truncate">
                    {eq.nome}
                  </p>
                  <p className="text-xs text-muted dark:text-dmuted">{eq.tipo}</p>
                  <p className="text-xs text-muted dark:text-dmuted mt-1 flex items-center gap-1">
                    <Icon name="UserCheck" size={11} />
                    Efectivo: <strong className="text-ink dark:text-dink font-semibold">{eq.membros}</strong> operacionais
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-sm text-muted dark:text-dmuted py-6 flex flex-col items-center gap-2">
                <Icon name="UserX" size={24} className="opacity-40" />
                <p>Sem equipa atribuída.</p>
              </div>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="font-semibold text-ink dark:text-dink mb-3 flex items-center gap-2">
              <Icon name="Map" size={16} className="text-muted" />
              Mapa da Operação
            </h3>
            <div className="h-48 rounded-lg overflow-hidden border border-bd dark:border-dborder">
              <MozambiqueMap ocorrencias={oc ? [oc] : []} height={192} />
            </div>
            {!oc && (
              <p className="mt-2 text-xs text-muted dark:text-dmuted text-center">
                Sem ocorrência associada para exibir no mapa.
              </p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DetalheMissaoCoord;