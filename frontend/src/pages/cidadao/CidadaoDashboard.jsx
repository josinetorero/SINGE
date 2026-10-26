import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, StatCard, StatusBadge } from '../../components/common/CommonComponents';
import { CIDADAO_OCORRENCIAS, ALERTAS, INFO_SEGURANCA } from '../../data/mockData';

export function CidadaoDashboard({ setPage, setSelectedOc }) {
  const total = CIDADAO_OCORRENCIAS.length;
  const emAnalise = CIDADAO_OCORRENCIAS.filter(o => o.estado === 'Em análise' || o.estado === 'Submetida').length;
  const comActualizacao = CIDADAO_OCORRENCIAS.filter(o => o.estado === 'Em análise').length;
  const encerradas = CIDADAO_OCORRENCIAS.filter(o => o.estado === 'Encerrada' || o.estado === 'Resolvida').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-ink dark:text-dink">Bem-vindo ao SINGE</h1>
        <p className="text-sm text-muted dark:text-dmuted mt-1">
          Ajude-nos a identificar situações de risco e acompanhe as informações relevantes para a sua comunidade.
        </p>
      </div>

      {/* Hero CTA */}
      <Card className="p-6 md:p-8 bg-navy border-0 text-white shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <h2 className="text-xl md:text-2xl font-bold">Identificou uma situação de emergência?</h2>
            <p className="text-white/75 mt-2 text-sm max-w-lg">
              Comunique a ocorrência para que a informação possa ser analisada com celeridade pelas entidades responsáveis.
            </p>
          </div>
          <button 
            onClick={() => setPage('comunicar')}
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-navy font-bold text-sm hover:bg-white/90 transition-all shadow-lg hover:scale-[1.02]"
          >
            <Icon name="AlertCircle" size={20} className="text-red-600" /> 
            <span>COMUNICAR OCORRÊNCIA</span>
          </button>
        </div>
      </Card>

      {/* Aviso Importante */}
      <div className="flex gap-3 p-4 rounded-lg border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-950/30">
        <Icon name="Info" size={20} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-900 dark:text-amber-100">
          <strong>Importante:</strong> Se estiver perante uma situação de perigo imediato, procure um local seguro e contacte os serviços de emergência competentes. O registo nesta plataforma <strong>não garante assistência imediata</strong>.
        </p>
      </div>

      {/* Resumo das ocorrências */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="FileText" label="Total comunicadas" value={total} tone="brand" />
        <StatCard icon="Clock" label="Em análise" value={emAnalise} tone="orange" />
        <StatCard icon="RefreshCw" label="Com actualizações" value={comActualizacao} tone="brand" />
        <StatCard icon="CheckCircle" label="Encerradas" value={encerradas} tone="green" />
      </div>

      {/* As minhas ocorrências */}
      <Card>
        <div className="p-5 border-b border-bd dark:border-dborder flex items-center justify-between">
          <h3 className="font-semibold text-ink dark:text-dink">As minhas ocorrências recentes</h3>
          <button onClick={() => setPage('minhas-ocorrencias')} className="text-xs text-brand dark:text-dblue hover:underline flex items-center gap-1 font-medium">
            Ver todas <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead className="bg-light dark:bg-dsidebar/50 text-xs uppercase text-muted dark:text-dmuted">
              <tr>
                {['Referência', 'Tipo', 'Localização', 'Data', 'Estado', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-bd dark:divide-dborder">
              {CIDADAO_OCORRENCIAS.slice(0, 3).map(o => (
                <tr key={o.ref} className="hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                  <td className="px-4 py-3 font-medium text-ink dark:text-dink whitespace-nowrap">{o.ref}</td>
                  <td className="px-4 py-3 text-ink dark:text-dink">{o.tipo}</td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.distrito}, {o.provincia}</td>
                  <td className="px-4 py-3 text-muted dark:text-dmuted whitespace-nowrap">{o.data}</td>
                  <td className="px-4 py-3"><StatusBadge s={o.estado} /></td>
                  <td className="px-4 py-3 text-right">
                    <button 
                      onClick={() => { setSelectedOc(o); setPage('detalhe-cidadao'); }} 
                      className="text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar p-1.5 rounded transition-colors"
                      title="Ver ocorrência"
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

      {/* Alertas Ativos */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-ink dark:text-dink">Alertas e avisos activos</h3>
          <button onClick={() => setPage('alertas')} className="text-xs text-brand dark:text-dblue hover:underline font-medium">
            Ver todos
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {ALERTAS.filter(a => a.ativo).slice(0, 2).map(a => {
            const nivelMap = { 
              'Crítico': { bg: 'bg-red-600', label: 'CRÍTICO' }, 
              'Elevado': { bg: 'bg-orange-500', label: 'ELEVADO' }, 
              'Médio': { bg: 'bg-yellow-500', label: 'MÉDIO' }, 
              'Informativo': { bg: 'bg-brand', label: 'INFO' } 
            };
            const lvl = nivelMap[a.nivel] || nivelMap.Informativo;
            return (
              <Card key={a.id} className="p-5 hover:border-brand/40 transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded text-white ${lvl.bg}`}>{lvl.label}</span>
                  <span className="text-xs text-muted dark:text-dmuted">{a.tipo}</span>
                </div>
                <p className="text-sm font-semibold text-ink dark:text-dink">{a.titulo}</p>
                <p className="text-xs text-muted dark:text-dmuted mt-1">Região: {a.regiao}</p>
                <p className="text-xs text-muted dark:text-dmuted">Publicado: {a.data}</p>
                <button onClick={() => setPage('alertas')} className="mt-3 text-xs text-brand dark:text-dblue hover:underline font-medium block">
                  Consultar detalhes →
                </button>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Informações para a Comunidade */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-ink dark:text-dink">Informações para a comunidade</h3>
          <button onClick={() => setPage('informacoes')} className="text-xs text-brand dark:text-dblue hover:underline font-medium">
            Ver todas
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {INFO_SEGURANCA.slice(0, 3).map(info => (
            <Card key={info.id} className="p-5 flex flex-col hover:border-brand/40 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-lblue dark:bg-dblue/20 text-brand dark:text-dblue flex items-center justify-center mb-3">
                <Icon name={info.icon} size={20} />
              </div>
              <p className="text-sm font-semibold text-ink dark:text-dink">{info.titulo}</p>
              <p className="text-xs text-muted dark:text-dmuted mt-1 flex-1">{info.resumo}</p>
              <button onClick={() => setPage('informacoes')} className="mt-3 text-xs text-brand dark:text-dblue hover:underline text-left font-medium">
                Consultar informação →
              </button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CidadaoDashboard;
