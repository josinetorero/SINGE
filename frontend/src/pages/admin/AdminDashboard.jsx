import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, StatCard, Button, StatusBadge } from '../../components/common/CommonComponents';
import { UTILIZADORES, AUDITORIA_LOGS, INFRA_STATUS, FATORES_PRIORIDADE } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function AdminDashboard({ setPage }) {
  const toast = useToast();

  const totalUsers = UTILIZADORES.length;
  const activeUsers = UTILIZADORES.filter(u => u.estado === 'Activo').length;
  const operadores = UTILIZADORES.filter(u => u.perfil === 'Operador').length;
  const coordenadores = UTILIZADORES.filter(u => u.perfil === 'Coordenador').length;
  const agentes = UTILIZADORES.filter(u => u.perfil === 'Agente').length;
  const administradores = UTILIZADORES.filter(u => u.perfil === 'Administrador').length;

  const handleTestPing = () => {
    toast.success('Serviços verificados: API Laravel (Sanctum) e MySQL 8.0 operacionais (latência: 36ms).');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold uppercase tracking-wider">
              Painel de Governança e Administração
            </span>
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-1">Visão Geral do Sistema SINGE</h2>
          <p className="text-sm text-muted dark:text-dmuted">
            Monitorização da infraestrutura, gestão de acessos RBAC, parametrização algorítmica e auditoria global.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" icon="Activity" onClick={handleTestPing}>Diagnóstico da API</Button>
          <Button icon="UserPlus" onClick={() => setPage('utilizadores')}>Novo Utilizador</Button>
        </div>
      </div>

      {/* Cartões de Indicadores Administrativos */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon="Users" label="Utilizadores" value={totalUsers} hint={`${activeUsers} activos no sistema`} tone="brand" />
        <StatCard icon="ShieldCheck" label="Sessões Activas" value={INFRA_STATUS.sessoesAtivas} hint="Tokens Sanctum válidos" tone="green" />
        <StatCard icon="Server" label="API Laravel" value={INFRA_STATUS.backendApi.latencia} hint="Latência média · Online" tone="green" />
        <StatCard icon="Sliders" label="Fatores de Prioridade" value={FATORES_PRIORIDADE.length} hint="Pesos calibrados (100%)" tone="orange" />
        <StatCard icon="History" label="Logs 24h" value={AUDITORIA_LOGS.length} hint="Rastreabilidade activa" tone="brand" />
      </div>

      {/* Estado dos Módulos e Infraestrutura Tecnológica */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-bd dark:border-dborder pb-3">
            <div>
              <h3 className="font-semibold text-ink dark:text-dink">Saúde dos Serviços e Camadas Tecnológicas</h3>
              <p className="text-xs text-muted dark:text-dmuted">Arquitectura cliente-servidor: React 18 · Laravel 11 · MySQL 8</p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Todos operacionais
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-bd dark:border-dborder bg-light/50 dark:bg-dsidebar/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-brand dark:text-dblue flex items-center justify-center shrink-0">
                <Icon name="Server" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink dark:text-dink">Backend API REST</p>
                  <StatusBadge s="Activo" />
                </div>
                <p className="text-xs text-muted dark:text-dmuted mt-0.5">{INFRA_STATUS.backendApi.versao}</p>
                <p className="text-xs text-muted dark:text-dmuted">Latência: {INFRA_STATUS.backendApi.latencia}</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-bd dark:border-dborder bg-light/50 dark:bg-dsidebar/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center shrink-0">
                <Icon name="Database" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink dark:text-dink">Base de Dados Central</p>
                  <StatusBadge s="Activo" />
                </div>
                <p className="text-xs text-muted dark:text-dmuted mt-0.5">{INFRA_STATUS.database.motor}</p>
                <p className="text-xs text-muted dark:text-dmuted">{INFRA_STATUS.database.conexoes} conexões simultâneas</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-bd dark:border-dborder bg-light/50 dark:bg-dsidebar/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-300 flex items-center justify-center shrink-0">
                <Icon name="Sliders" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink dark:text-dink">Motor de Priorização</p>
                  <StatusBadge s="Activo" />
                </div>
                <p className="text-xs text-muted dark:text-dmuted mt-0.5">{INFRA_STATUS.iaEngine.modelo}</p>
                <p className="text-xs text-muted dark:text-dmuted">5 factores ponderados configurados</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-bd dark:border-dborder bg-light/50 dark:bg-dsidebar/30 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <Icon name="Upload" size={18} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink dark:text-dink">Repositório de Evidências</p>
                  <StatusBadge s="Activo" />
                </div>
                <p className="text-xs text-muted dark:text-dmuted mt-0.5">Armazenamento de ficheiros / fotos</p>
                <p className="text-xs text-muted dark:text-dmuted">{INFRA_STATUS.storage.usado} em uso de {INFRA_STATUS.storage.total}</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap gap-2 text-xs text-muted dark:text-dmuted">
            <span>• Requisições processadas hoje: <strong>{INFRA_STATUS.requisicoesHoje}</strong></span>
            <span>• Política de tokens: <strong>Expiração automática após 8h de inactividade</strong></span>
          </div>
        </Card>

        {/* Distribuição de Contas por Perfil (RBAC) */}
        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-ink dark:text-dink">Distribuição RBAC</h3>
              <button onClick={() => setPage('utilizadores')} className="text-xs text-brand dark:text-dblue hover:underline">
                Gerir contas
              </button>
            </div>
            <p className="text-xs text-muted dark:text-dmuted mb-4">
              Controlo estrito de acesso para evitar sobreposição de papéis institucionais.
            </p>

            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-ink dark:text-dink">Operadores (Atendimento/Registo)</span>
                  <span className="font-bold text-brand">{operadores}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-light dark:bg-dsidebar overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${(operadores / totalUsers) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-ink dark:text-dink">Coordenadores (Comando/Recursos)</span>
                  <span className="font-bold text-indigo-600">{coordenadores}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-light dark:bg-dsidebar overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${(coordenadores / totalUsers) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-ink dark:text-dink">Agentes de Terreno (Execução)</span>
                  <span className="font-bold text-amber-600">{agentes}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-light dark:bg-dsidebar overflow-hidden">
                  <div className="h-full bg-amber-500 rounded-full" style={{ width: `${(agentes / totalUsers) * 100}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-ink dark:text-dink">Administradores (Governança)</span>
                  <span className="font-bold text-purple-600">{administradores}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-light dark:bg-dsidebar overflow-hidden">
                  <div className="h-full bg-purple-600 rounded-full" style={{ width: `${(administradores / totalUsers) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <Icon name="Info" size={16} className="shrink-0 mt-0.5" />
            <p>
              Princípio do Menor Privilégio ativo: A coordenação de missões e registo de chamadas estão estritamente segregados dos operadores e gestores de infraestrutura.
            </p>
          </div>
        </Card>
      </div>

      {/* Rastreabilidade e Auditoria Recente */}
      <Card>
        <div className="p-5 border-b border-bd dark:border-dborder flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-ink dark:text-dink">Registos Recentes de Auditoria e Segurança</h3>
            <p className="text-xs text-muted dark:text-dmuted">Últimas acções administrativas, alterações de permissões e eventos críticos</p>
          </div>
          <button 
            onClick={() => setPage('auditoria')} 
            className="text-xs text-brand dark:text-dblue hover:underline font-semibold flex items-center gap-1"
          >
            Ver registo completo <Icon name="ArrowRight" size={14} />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Ref</th>
                <th className="text-left px-4 py-3 font-medium">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium">Utilizador</th>
                <th className="text-left px-4 py-3 font-medium">Perfil</th>
                <th className="text-left px-4 py-3 font-medium">Acção</th>
                <th className="text-left px-4 py-3 font-medium">Detalhe</th>
                <th className="text-left px-4 py-3 font-medium">IP Origem</th>
                <th className="text-left px-4 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bd dark:divide-dborder">
              {AUDITORIA_LOGS.slice(0, 5).map(log => (
                <tr key={log.id} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted dark:text-dmuted">{log.id}</td>
                  <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">{log.data}</td>
                  <td className="px-4 py-3 font-medium text-ink dark:text-dink">{log.utilizador}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.perfil}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink dark:text-dink">{log.acao}</td>
                  <td className="px-4 py-3 text-xs text-muted dark:text-dmuted max-w-xs truncate">{log.detalhe}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted dark:text-dmuted">{log.ip}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                      log.status === 'Sucesso' 
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300' 
                        : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default AdminDashboard;

