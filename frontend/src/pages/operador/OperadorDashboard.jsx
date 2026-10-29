import React from 'react';
import Icon from '../../components/common/Icon';
import { StatCard, Card, Button, StatusBadge, Timeline } from '../../components/common/CommonComponents';
import { useToast } from '../../contexts/ToastContext';

export function OperadorDashboard({ setPage, setSelected, ocorrencias }) {
  const toast = useToast();

  const novasTriagem = ocorrencias.filter(o => o.estado === 'Nova' || o.estado === 'Em análise');
  const validadasEncaminhadas = ocorrencias.filter(o => o.estado === 'Validada' || o.estado === 'Em resposta');
  const resolvidas = ocorrencias.filter(o => o.estado === 'Resolvida');

  const handleValidarRapido = (oc, e) => {
    e.stopPropagation();
    toast.success(`Ocorrência ${oc.ref} verificada e encaminhada para a Coordenação de Emergências.`);
  };

  const handlePedirDados = (oc, e) => {
    e.stopPropagation();
    toast.info(`Notificação enviada ao comunicante de ${oc.ref} solicitando dados complementares.`);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Operador */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-semibold uppercase tracking-wider">
              Central de Atendimento e Triagem
            </span>
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-1">Recepção de Alertas e Ocorrências</h2>
          <p className="text-sm text-muted dark:text-dmuted">
            Atenda comunicações de emergência, registe denúncias e realize a verificação inicial dos dados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon="Phone" onClick={() => {
            toast.info('Canal de rádio e linha telefónica de emergência activos (112 / INGD).');
          }}>
            Linha de Apoio
          </Button>
          <Button icon="PlusCircle" onClick={() => setPage('registar')}>+ Registar Ocorrência</Button>
        </div>
      </div>

      {/* Indicadores do Posto de Operador */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="FileText" label="Recebidas Hoje" value={ocorrencias.length} hint="Total no plantão" tone="brand" />
        <StatCard icon="Clock" label="Em Triagem / Análise" value={novasTriagem.length} hint="Aguardam verificação" tone="orange" />
        <StatCard icon="CheckCircle" label="Encaminhadas à Coordenação" value={validadasEncaminhadas.length} hint="Dados validados" tone="green" />
        <StatCard icon="Activity" label="Resolvidas no Terreno" value={resolvidas.length} hint="Intervenção concluída" tone="brand" />
      </div>

      {/* Fila Prioritária de Triagem Imediata (Diagrama de Atividades SINGE) */}
      <Card className="p-5 border-l-4 border-l-amber-500">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={18} className="text-amber-500" />
              <h3 className="font-semibold text-ink dark:text-dink">Fila de Triagem e Verificação Imediata</h3>
            </div>
            <p className="text-xs text-muted dark:text-dmuted mt-0.5">
              Conforme o fluxo operacional: verifique se a informação é suficiente antes de despachar para a tomada de decisão da Coordenação.
            </p>
          </div>
          <button 
            onClick={() => setPage('ocorrencias')} 
            className="text-xs text-brand dark:text-dblue font-semibold hover:underline flex items-center gap-1"
          >
            Abrir fila completa <Icon name="ArrowRight" size={14} />
          </button>
        </div>

        <div className="space-y-3">
          {novasTriagem.slice(0, 3).map(o => (
            <div 
              key={o.ref} 
              className="p-4 rounded-lg border border-bd dark:border-dborder bg-light/60 dark:bg-dsidebar/30 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-brand/40 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-ink dark:text-dink">{o.ref}</span>
                  <StatusBadge s={o.estado} />
                  <span className="text-xs text-muted dark:text-dmuted">Fonte: {o.fonte}</span>
                </div>
                <p className="text-sm font-semibold text-ink dark:text-dink">{o.titulo}</p>
                <p className="text-xs text-muted dark:text-dmuted truncate mt-0.5">
                  {o.tipo} · {o.localidade ? `${o.localidade}, ` : ''}{o.distrito}, {o.provincia} — {o.descricao}
                </p>
              </div>

              {/* Ações Rápidas de Operador */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={(e) => handlePedirDados(o, e)}
                  className="px-2.5 py-1.5 rounded-lg border border-bd dark:border-dborder text-xs font-medium text-ink dark:text-dink hover:bg-white dark:hover:bg-dcard transition-colors flex items-center gap-1"
                  title="Pedir dados complementares"
                >
                  <Icon name="MessageSquare" size={14} /> Solicitar Info
                </button>
                <button
                  onClick={(e) => handleValidarRapido(o, e)}
                  className="px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-700 text-white text-xs font-semibold shadow-sm transition-colors flex items-center gap-1"
                >
                  <Icon name="CheckCircle" size={14} /> Validar e Encaminhar
                </button>
                <button
                  onClick={() => { setSelected(o); setPage('detalhe-oc'); }}
                  className="p-1.5 rounded-lg text-brand dark:text-dblue hover:bg-blue-50 dark:hover:bg-blue-950/40"
                  title="Ver detalhes"
                >
                  <Icon name="Eye" size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabela de Ocorrências e Histórico de Atendimentos */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div className="p-5 border-b border-bd dark:border-dborder flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-ink dark:text-dink">Ocorrências Recentes no Sistema</h3>
              <p className="text-xs text-muted dark:text-dmuted">Acompanhe a evolução de estados das ocorrências atendidas</p>
            </div>
            <button 
              onClick={() => setPage('ocorrencias')} 
              className="text-xs text-brand dark:text-dblue hover:underline font-medium"
            >
              Ver todas
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[650px]">
              <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Ref</th>
                  <th className="text-left px-4 py-3 font-medium">Tipo</th>
                  <th className="text-left px-4 py-3 font-medium">Local</th>
                  <th className="text-left px-4 py-3 font-medium">Data/Hora</th>
                  <th className="text-left px-4 py-3 font-medium">Estado</th>
                  <th className="text-right px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                {ocorrencias.slice(0, 5).map(o => (
                  <tr key={o.ref} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-ink dark:text-dink text-xs">{o.ref}</td>
                    <td className="px-4 py-3 text-ink dark:text-dink">{o.tipo}</td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted text-xs">{o.distrito}, {o.provincia}</td>
                    <td className="px-4 py-3 text-muted dark:text-dmuted text-xs">{o.data}</td>
                    <td className="px-4 py-3"><StatusBadge s={o.estado} /></td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => { setSelected(o); setPage('detalhe-oc'); }} 
                        className="text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar p-1.5 rounded transition-colors"
                        title="Ver detalhes"
                      >
                        <Icon name="Eye" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Histórico do Posto de Atendimento */}
        <Card className="p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-ink dark:text-dink">Registo de Atividades do Operador</h3>
            <p className="text-xs text-muted dark:text-dmuted">Rastreabilidade das operações de atendimento</p>
          </div>
          <Timeline items={[
            { data: 'Hoje, 08:35', txt: 'Registo da ocorrência OC-2025-0142 (Ciclone Beira)' },
            { data: 'Hoje, 07:15', txt: 'Verificação da OC-2025-0141 e encaminhamento' },
            { data: 'Ontem, 18:45', txt: 'Evidências fotográficas anexadas à OC-2025-0140' },
            { data: 'Ontem, 14:20', txt: 'Comunicação telefónica registada via PRM' },
          ]} />
          
          <div className="pt-3 border-t border-bd dark:border-dborder text-xs text-muted dark:text-dmuted flex items-center gap-1.5">
            <Icon name="ShieldCheck" size={14} className="text-green-600 shrink-0" />
            <span>Sessão de Operador autenticada no CENOE.</span>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default OperadorDashboard;
