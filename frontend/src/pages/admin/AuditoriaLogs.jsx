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

  const hasFilters = Boolean(q || acaoFiltro || statusFiltro);
  const clearFilters = () => { setQ(''); setAcaoFiltro(''); setStatusFiltro(''); };

  const handleExportCSV = () => {
    toast.success('Ficheiro de auditoria (audit_trail_singe.csv) gerado e pronto para download.');
  };

  const handleCopyPayload = async () => {
    if (!selLog) return;
    const payload = JSON.stringify({
      registroId: selLog.id,
      tipoEvento: selLog.acao,
      detalhes: selLog.detalhe,
      ipAddress: selLog.ip,
      protocolo: 'HTTPS / REST API Laravel',
      metadados: {
        assinaturaDigital: 'SHA-256 Validada',
        origemSessao: 'Token Sanctum Bearer',
      },
    }, null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      toast.success('Payload copiado para a área de transferência.');
    } catch {
      toast.error?.('Não foi possível copiar o payload.');
    }
  };

  return (
    <div className="space-y-6">

      {/* ─── Cabeçalho ─────────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-purple-50/70 via-white to-indigo-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-purple-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-indigo-400/10 dark:bg-indigo-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 font-semibold uppercase tracking-wider border border-purple-200/60 dark:border-purple-800/50">
                <Icon name="ShieldCheck" size={11} />
                Segurança & Rastreabilidade
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-semibold border border-emerald-200/60 dark:border-emerald-800/50">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Registo imutável activo
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">
              Registo Global de Auditoria
            </h2>
            <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
              Rastreio imutável de autenticações, alterações de permissão, despachos de missão e intervenções de sistema.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 rounded-lg border border-bd dark:border-dborder bg-white dark:bg-dsidebar px-4 py-2.5 text-sm font-semibold text-ink dark:text-dink shadow-sm transition-all hover:border-purple-300 hover:shadow-md hover:text-purple-700 dark:hover:border-purple-700 dark:hover:text-purple-300 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 dark:focus:ring-offset-slate-900"
          >
            <Icon name="FileSpreadsheet" size={15} />
            Exportar Relatório
          </button>
        </div>
      </header>

      {/* ─── KPIs ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="History"       label="Total Registado"        value={AUDITORIA_LOGS.length} tone="brand" />
        <StatCard icon="CheckCircle"   label="Operações com Sucesso"  value={AUDITORIA_LOGS.filter(l => l.status === 'Sucesso').length} tone="green" />
        <StatCard icon="AlertTriangle" label="Alertas de Segurança"   value={AUDITORIA_LOGS.filter(l => l.status === 'Alerta').length}  tone="red" />
        <StatCard icon="ShieldCheck"   label="Conformidade RBAC"      value="100%" hint="Políticas rigorosas" tone="brand" />
      </div>

      {/* ─── Filtros ───────────────────────────────────────────── */}
      <Card className="p-4 md:p-5">
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h3 className="text-sm font-semibold text-ink dark:text-dink flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-gradient-to-b from-purple-500 to-indigo-500" />
            Filtros de Pesquisa
          </h3>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-medium tabular-nums">
              {filtered.length} de {AUDITORIA_LOGS.length} registos
            </span>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:underline font-semibold"
              >
                <Icon name="X" size={12} /> Limpar
              </button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <div className="md:col-span-2">
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Pesquisa livre
            </label>
            <div className="relative">
              <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted dark:text-dmuted pointer-events-none" />
              <input
                placeholder="Utilizador, referência, IP ou descrição..."
                value={q}
                onChange={e => setQ(e.target.value)}
                className={inputCls + ' pl-9 pr-9'}
              />
              {q && (
                <button
                  onClick={() => setQ('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center text-muted dark:text-dmuted hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                  aria-label="Limpar pesquisa"
                >
                  <Icon name="X" size={12} />
                </button>
              )}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Tipo de Acção
            </label>
            <select value={acaoFiltro} onChange={e => setAcaoFiltro(e.target.value)} className={inputCls}>
              <option value="">Todas as acções</option>
              <option>Autenticação</option>
              <option>Ajuste de Parâmetro</option>
              <option>Validação de Gravidade</option>
              <option>Registo de Ocorrência</option>
              <option>Criação de Conta</option>
              <option>Tentativa Falhada</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted mb-1.5 block">
              Estado
            </label>
            <select value={statusFiltro} onChange={e => setStatusFiltro(e.target.value)} className={inputCls}>
              <option value="">Todos os estados</option>
              <option>Sucesso</option>
              <option>Alerta</option>
            </select>
          </div>
        </div>
      </Card>

      {/* ─── Tabela ────────────────────────────────────────────── */}
      <Card className="overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-10 px-4">
            <EmptyState icon="History" title="Nenhum registo de auditoria encontrado" />
            {hasFilters && (
              <div className="text-center mt-2">
                <button
                  onClick={clearFilters}
                  className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Limpar filtros e ver todos os registos
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[850px]">
              <thead className="bg-light dark:bg-dsidebar/50 text-[11px] uppercase tracking-wider text-muted dark:text-dmuted">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Ref</th>
                  <th className="text-left px-4 py-3 font-semibold">Timestamp</th>
                  <th className="text-left px-4 py-3 font-semibold">Utilizador</th>
                  <th className="text-left px-4 py-3 font-semibold">Perfil RBAC</th>
                  <th className="text-left px-4 py-3 font-semibold">Operação</th>
                  <th className="text-left px-4 py-3 font-semibold">Descrição</th>
                  <th className="text-left px-4 py-3 font-semibold">IP Origem</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-right px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bd dark:divide-dborder">
                {filtered.map(l => (
                  <tr
                    key={l.id}
                    onClick={() => setSelLog(l)}
                    className="group cursor-pointer hover:bg-light dark:hover:bg-dsidebar/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono font-semibold text-xs text-brand dark:text-dblue">
                      {l.id}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted dark:text-dmuted whitespace-nowrap">{l.data}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                          {(l.utilizador?.[0] ?? '?').toUpperCase()}
                        </div>
                        <span className="font-medium text-ink dark:text-dink truncate">{l.utilizador}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-medium">
                        {l.perfil}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-ink dark:text-dink">{l.acao}</td>
                    <td
                      className="px-4 py-3 text-xs text-muted dark:text-dmuted max-w-xs truncate"
                      title={l.detalhe}
                    >
                      {l.detalhe}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted dark:text-dmuted">{l.ip}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        l.status === 'Sucesso'
                          ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300'
                          : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${l.status === 'Sucesso' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {l.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelLog(l); }}
                        className="inline-flex items-center gap-1 text-brand dark:text-dblue hover:underline text-xs font-semibold"
                      >
                        Detalhes
                        <Icon name="ArrowRight" size={12} className="transition-transform group-hover:translate-x-0.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* ─── Modal de Detalhe ──────────────────────────────────── */}
      <Modal
        open={Boolean(selLog)}
        onClose={() => setSelLog(null)}
        title={`Registo de Auditoria ${selLog?.id || ''}`}
        footer={<Button variant="secondary" onClick={() => setSelLog(null)}>Fechar</Button>}
      >
        {selLog && (
          <div className="space-y-4 text-sm">

            {/* Cabeçalho de estado */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-500 text-white font-bold flex items-center justify-center shadow-sm">
                  <Icon name="ShieldCheck" size={18} />
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-wider text-muted dark:text-dmuted font-semibold">Operação</p>
                  <p className="text-sm font-bold text-ink dark:text-dink">{selLog.acao}</p>
                </div>
              </div>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                selLog.status === 'Sucesso'
                  ? 'bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300'
                  : 'bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${selLog.status === 'Sucesso' ? 'bg-green-500' : 'bg-red-500'}`} />
                {selLog.status}
              </span>
            </div>

            {/* Metadados em grelha */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: 'Identificador', value: selLog.id, mono: true },
                { label: 'Data e Hora',   value: selLog.data },
                { label: 'Utilizador',    value: `${selLog.utilizador} · ${selLog.perfil}` },
                { label: 'Endereço IP',   value: selLog.ip, mono: true },
              ].map((row, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-bd dark:border-dborder bg-light/60 dark:bg-dsidebar/40"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted dark:text-dmuted font-semibold mb-1">
                    {row.label}
                  </p>
                  <p className={`text-sm font-medium text-ink dark:text-dink truncate ${row.mono ? 'font-mono' : ''}`}>
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            {/* Payload JSON */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted dark:text-dmuted">
                  Carga e Detalhes da Acção
                </p>
                <button
                  onClick={handleCopyPayload}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                >
                  <Icon name="Copy" size={12} /> Copiar payload
                </button>
              </div>
              <div className="p-3 rounded-lg bg-slate-900 dark:bg-black text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 shadow-inner">
                <pre className="whitespace-pre">{JSON.stringify({
                  registroId: selLog.id,
                  tipoEvento: selLog.acao,
                  detalhes: selLog.detalhe,
                  ipAddress: selLog.ip,
                  protocolo: 'HTTPS / REST API Laravel',
                  metadados: {
                    assinaturaDigital: 'SHA-256 Validada',
                    origemSessao: 'Token Sanctum Bearer',
                  },
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