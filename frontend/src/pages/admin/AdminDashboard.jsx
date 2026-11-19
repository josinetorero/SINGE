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

  const rbacData = [
    { label: 'Operadores',        sub: 'Atendimento / Registo',   count: operadores,      bar: 'from-blue-500 to-blue-600',       text: 'text-blue-600 dark:text-blue-400' },
    { label: 'Coordenadores',     sub: 'Comando / Recursos',      count: coordenadores,   bar: 'from-indigo-500 to-indigo-600',   text: 'text-indigo-600 dark:text-indigo-400' },
    { label: 'Agentes de Terreno',sub: 'Execução Operacional',    count: agentes,         bar: 'from-amber-400 to-amber-500',     text: 'text-amber-600 dark:text-amber-400' },
    { label: 'Administradores',   sub: 'Governança / TI',         count: administradores, bar: 'from-purple-500 to-purple-600',   text: 'text-purple-600 dark:text-purple-400' },
  ];

  const services = [
    { icon: 'Server',   title: 'Backend API REST',         desc: INFRA_STATUS.backendApi.versao,           extra: `Latência: ${INFRA_STATUS.backendApi.latencia}`,        box: 'bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300',         hover: 'hover:border-blue-300 dark:hover:border-blue-700' },
    { icon: 'Database', title: 'Base de Dados Central',    desc: INFRA_STATUS.database.motor,              extra: `${INFRA_STATUS.database.conexoes} conexões simultâneas`, box: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-300', hover: 'hover:border-emerald-300 dark:hover:border-emerald-700' },
    { icon: 'Sliders',  title: 'Motor de Priorização',     desc: INFRA_STATUS.iaEngine.modelo,             extra: '5 factores ponderados configurados',                    box: 'bg-amber-100 text-amber-600 dark:bg-amber-950/60 dark:text-amber-300',     hover: 'hover:border-amber-300 dark:hover:border-amber-700' },
    { icon: 'Upload',   title: 'Repositório de Evidências',desc: 'Armazenamento de ficheiros / fotos',   extra: `${INFRA_STATUS.storage.usado} em uso de ${INFRA_STATUS.storage.total}`, box: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-300', hover: 'hover:border-indigo-300 dark:hover:border-indigo-700' },
  ];

  return (
    <div className="space-y-6">

      {/* ─── Cabeçalho ───────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-blue-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-blue-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-blue-400/10 dark:bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold uppercase tracking-wider border border-purple-200/60 dark:border-purple-800/50">
                <Icon name="ShieldCheck" size={11} />
                Painel de Governança e Administração
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sistema Online
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">
              Visão Geral do Sistema SINGE
            </h2>
            <p className="text-sm text-muted dark:text-dmuted mt-1 max-w-2xl">
              Monitorização da infraestrutura, gestão de acessos RBAC, parametrização algorítmica e auditoria global.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" icon="Activity" onClick={handleTestPing}>Diagnóstico da API</Button>
            <Button icon="UserPlus" onClick={() => setPage('utilizadores')}>Novo Utilizador</Button>
          </div>
        </div>
      </div>

      {/* ─── KPIs ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard icon="Users"       label="Utilizadores"          value={totalUsers}                  hint={`${activeUsers} activos no sistema`}       tone="brand" />
        <StatCard icon="ShieldCheck" label="Sessões Activas"       value={INFRA_STATUS.sessoesAtivas}  hint="Tokens Sanctum válidos"                     tone="green" />
        <StatCard icon="Server"      label="API Laravel"           value={INFRA_STATUS.backendApi.latencia} hint="Latência média · Online"                tone="green" />
        <StatCard icon="Sliders"     label="Fatores de Prioridade" value={FATORES_PRIORIDADE.length}   hint="Pesos calibrados (100%)"                    tone="orange" />
        <StatCard icon="History"     label="Logs 24h"              value={AUDITORIA_LOGS.length}       hint="Rastreabilidade activa"                     tone="brand" />
      </div>

      {/* ─── Infraestrutura + RBAC ───────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-bd dark:border-dborder pb-3 flex-wrap gap-2">
            <div>
              <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                Saúde dos Serviços e Camadas Tecnológicas
              </h3>
              <p className="text-xs text-muted dark:text-dmuted mt-0.5 ml-3">
                Arquitectura cliente-servidor: React 18 · Laravel 11 · MySQL 8
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300 border border-green-200 dark:border-green-900/50">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Todos operacionais
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {services.map((s, i) => (
              <div
                key={i}
                className={`group p-3.5 rounded-xl border border-bd dark:border-dborder bg-gradient-to-br from-light/60 to-transparent dark:from-dsidebar/40 dark:to-transparent flex items-start gap-3 transition-all duration-200 hover:shadow-sm ${s.hover}`}
              >
                <div className={`w-10 h-10 rounded-lg ${s.box} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105`}>
                  <Icon name={s.icon} size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink dark:text-dink truncate">{s.title}</p>
                    <StatusBadge s="Activo" />
                  </div>
                  <p className="text-xs text-muted dark:text-dmuted mt-1 truncate">{s.desc}</p>
                  <p className="text-xs text-muted dark:text-dmuted truncate">{s.extra}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-bd dark:border-dborder flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted dark:text-dmuted">
            <span className="inline-flex items-center gap-1.5">
              <Icon name="Activity" size={12} />
              Requisições hoje: <strong className="text-ink dark:text-dink">{INFRA_STATUS.requisicoesHoje}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icon name="Info" size={12} />
              Tokens expiram após 8h de inactividade
            </span>
          </div>
        </Card>

        <Card className="p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-gradient-to-b from-purple-500 to-pink-500" />
                Distribuição RBAC
              </h3>
              <button
                onClick={() => setPage('utilizadores')}
                className="text-xs text-brand dark:text-dblue hover:underline font-medium"
              >
                Gerir contas
              </button>
            </div>
            <p className="text-xs text-muted dark:text-dmuted mb-5 ml-3">
              Controlo estrito de acesso para evitar sobreposição de papéis institucionais.
            </p>

            <div className="space-y-4">
              {rbacData.map((r, i) => {
                const pct = totalUsers > 0 ? (r.count / totalUsers) * 100 : 0;
                return (
                  <div key={i} className="group">
                    <div className="flex items-baseline justify-between mb-1.5 gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink dark:text-dink truncate">{r.label}</p>
                        <p className="text-[10px] text-muted dark:text-dmuted truncate">{r.sub}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-xs font-bold ${r.text}`}>{r.count}</span>
                        <span className="text-[10px] text-muted dark:text-dmuted w-9 text-right tabular-nums">
                          {pct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-light dark:bg-dsidebar overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${r.bar} transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-5 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/30 border border-blue-200/70 dark:border-blue-900/50 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2">
            <Icon name="ShieldCheck" size={16} className="shrink-0 mt-0.5" />
            <p>
              <strong className="font-semibold">Princípio do Menor Privilégio</strong> — coordenação de missões e registo
              de chamadas estão estritamente segregados.
            </p>
          </div>
        </Card>
      </div>

      {/* ─── Auditoria ───────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        <div className="p-5 border-b border-bd dark:border-dborder flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <span className="w-1 h-5 rounded-full bg-gradient-to-b from-rose-500 to-orange-500" />
              Registos Recentes de Auditoria e Segurança
            </h3>
            <p className="text-xs text-muted dark:text-dmuted mt-0.5 ml-3">
              Últimas acções administrativas, alterações de permissões e eventos críticos
            </p>
          </div>
          <button
            onClick={() => setPage('auditoria')}
            className="group inline-flex items-center gap-1 text-xs text-brand dark:text-dblue hover:underline font-semibold"
          >
            Ver registo completo
            <Icon name="ArrowRight" size={14} className="transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[750px]">
            <thead className="bg-light dark:bg-dsidebar/50 text-[11px] uppercase tracking-wider text-muted dark:text-dmuted">
              <tr>
                <th className="text-left px-4 py-3 font-semibold">Ref</th>
                <th className="text-left px-4 py-3 font-semibold">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold">Utilizador</th>
                <th className="text-left px-4 py-3 font-semibold">Perfil</th>
                <th className="text-left px-4 py-3 font-semibold">Acção</th>
                <th className="text-left px-4 py-3 font-semibold">Detalhe</th>
                <th className="text-left px-4 py-3 font-semibold">IP Origem</th>
                <th className="text-left px-4 py-3 font-semibold">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-bd dark:divide-dborder">
              {AUDITORIA_LOGS.slice(0, 5).map(log => (
                <tr key={log.id} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted dark:text-dmuted">{log.id}</td>
                  <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">{log.data}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                        {(log.utilizador?.[0] ?? '?').toUpperCase()}
                      </div>
                      <span className="font-medium text-ink dark:text-dink truncate">{log.utilizador}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                      {log.perfil}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-ink dark:text-dink">{log.acao}</td>
                  <td className="px-4 py-3 text-xs text-muted dark:text-dmuted max-w-xs truncate">{log.detalhe}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted dark:text-dmuted">{log.ip}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                      log.status === 'Sucesso'
                        ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300'
                        : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${log.status === 'Sucesso' ? 'bg-green-500' : 'bg-red-500'}`} />
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