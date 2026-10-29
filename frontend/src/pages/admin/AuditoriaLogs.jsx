import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatCard, StatusBadge, EmptyState, Modal, inputCls } from '../../components/common/CommonComponents';
import { AUDITORIA_LOGS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';

export function AuditoriaLogs() {
  const toast = useToast();
  const [q, setQ] = useState('');
  const [acaoFiltro, setAcaoFiltro] = useState('');
  const [statusFiltro, setStatusFiltro] = useState('');
  const [selLog, setSelLog] = useState(null);

  const filtered = AUDITORIA_LOGS.filter(l =>
    (!q || l.id.toLowerCase().includes(q.toLowerCase()) || 
           l.utilizador.toLowerCase().includes(q.toLowerCase()) || 
           l.detalhe.toLowerCase().includes(q.toLowerCase()) || 
           l.ip.includes(q)) &&
    (!acaoFiltro || l.acao === acaoFiltro) &&
    (!statusFiltro || l.status === statusFiltro)
  );

  const handleExportCSV = () => {
    toast.success('Ficheiro de auditoria (audit_trail_singe.csv) gerado e pronto para download.');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold uppercase tracking-wider">
              Segurança & Rastreabilidade
            </span>
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-1">Registo Global de Auditoria (Logs)</h2>
          <p className="text-sm text-muted dark:text-dmuted">
            Rastreio imutável de autenticações, alterações de permissão, despachos de missão e intervenções de sistema.
          </p>
        </div>

        <Button variant="secondary" icon="FileSpreadsheet" onClick={handleExportCSV}>
          Exportar Relatório de Auditoria
        </Button>
      </div>

      {/* Cartões Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="History" label="Total Registado" value={AUDITORIA_LOGS.length} tone="brand" />
        <StatCard icon="CheckCircle" label="Operações com Sucesso" value={AUDITORIA_LOGS.filter(l => l.status === 'Sucesso').length} tone="green" />
        <StatCard icon="AlertTriangle" label="Alertas de Segurança" value={AUDITORIA_LOGS.filter(l => l.status === 'Alerta').length} tone="red" />
        <StatCard icon="ShieldCheck" label="Conformidade RBAC" value="100%" hint="Políticas rigorosas" tone="brand" />
      </div>

      {/* Filtros */}
      <Card className="p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <div className="relative md:col-span-2">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none" />
            <input 
              placeholder="Pesquisar por Utilizador, Referência, IP ou descrição..." 
              value={q} 
              onChange={e => setQ(e.target.value)} 
              className={inputCls + ' pl-9'} 
            />
          </div>

          <select value={acaoFiltro} onChange={e => setAcaoFiltro(e.target.value)} className={inputCls}>
            <option value="">Todas as acções</option>
            <option>Autenticação</option>
            <option>Ajuste de Parâmetro</option>
            <option>Validação de Gravidade</option>
            <option>Registo de Ocorrência</option>
            <option>Criação de Conta</option>
            <option>Tentativa Falhada</option>
          </select>

          <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} className={inputCls}>
            <option value="">Todos os estados</option>
            <option>Sucesso</option>
            <option>Alerta</option>
          </select>
        </div>
      </Card>

      {/* Tabela de Logs */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState icon="History" title="Nenhum registo de auditoria encontrado" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[850px]">
              <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Ref</th>
                  <th className="text-left px-4 py-3 font-medium">Timestamp</th>
                  <th className="text-left px-4 py-3 font-medium">Utilizador</th>
                  <th className="text-left px-4 py-3 font-medium">Perfil RBAC</th>
                  <th className="text-left px-4 py-3 font-medium">Operação</th>
                  <th className="text-left px-4 py-3 font-medium">Descrição Detalhada</th>
                  <th className="text-left px-4 py-3 font-medium">IP Origem</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-right px-4 py-3 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-xs text-brand dark:text-dblue">{l.id}</td>
                    <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">{l.data}</td>
                    <td className="px-4 py-3 font-medium text-ink dark:text-dink">{l.utilizador}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                        {l.perfil}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink dark:text-dink">{l.acao}</td>
                    <td className="px-4 py-3 text-xs text-muted dark:text-dmuted max-w-xs truncate">{l.detalhe}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted dark:text-dmuted">{l.ip}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded text-xs font-semibold ${
                        l.status === 'Sucesso' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300' 
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => setSelLog(l)} 
                        className="text-brand dark:text-dblue hover:underline text-xs font-semibold"
                      >
                        Detalhes
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Detalhe do Log */}
      <Modal
        open={Boolean(selLog)}
        onClose={() => setSelLog(null)}
        title={`Registo de Auditoria ${selLog?.id || ''}`}
        footer={
          <Button variant="secondary" onClick={() => setSelLog(null)}>Fechar</Button>
        }
      >
        {selLog && (
          <div className="space-y-4 text-sm">
            <div className="p-3 rounded-lg bg-light dark:bg-dsidebar/50 border border-bd dark:border-dborder space-y-2">
              <div className="flex justify-between">
                <span className="text-muted dark:text-dmuted">Identificador:</span>
                <span className="font-mono font-bold text-ink dark:text-dink">{selLog.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted dark:text-dmuted">Data e Hora:</span>
                <span className="font-medium text-ink dark:text-dink">{selLog.data}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted dark:text-dmuted">Utilizador:</span>
                <span className="font-medium text-ink dark:text-dink">{selLog.utilizador} ({selLog.perfil})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted dark:text-dmuted">Endereço IP:</span>
                <span className="font-mono text-ink dark:text-dink">{selLog.ip}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted dark:text-dmuted">Resultado da Operação:</span>
                <span className="font-semibold text-green-600 dark:text-green-400">{selLog.status}</span>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-muted dark:text-dmuted uppercase mb-1">Carga e Detalhes da Ação</p>
              <div className="p-3 rounded-lg bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto">
                <pre>{JSON.stringify({
                  registroId: selLog.id,
                  tipoEvento: selLog.acao,
                  detalhes: selLog.detalhe,
                  ipAddress: selLog.ip,
                  protocolo: 'HTTPS / REST API Laravel',
                  metadados: {
                    assinaturaDigital: 'SHA-256 Validada',
                    origemSessao: 'Token Sanctum Bearer'
                  }
                }, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AuditoriaLogs;

