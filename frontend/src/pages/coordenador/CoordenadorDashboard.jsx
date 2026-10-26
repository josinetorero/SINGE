import React from 'react';
import Icon from '../../components/common/Icon';
import { StatCard, Card, StatusBadge, PrioBadge } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { EQUIPAS, MISSOES } from '../../data/mockData';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

export function CoordenadorDashboard({ setPage, ocorrencias }) {
  const criticas = ocorrencias.filter(o => o.prioridade === 'Crítico').length;
  const pend = ocorrencias.filter(o => o.estado === 'Em análise').length;
  const emCurso = MISSOES.filter(m => m.estado === 'Em curso').length;
  const disp = EQUIPAS.filter(e => e.estado === 'Disponível').length;
  const pendAtrib = MISSOES.filter(m => m.estado === 'Atribuída').length;

  const porEstado = ['Nova', 'Em análise', 'Validada', 'Em resposta', 'Resolvida'].map(e => ({
    name: e,
    value: ocorrencias.filter(o => o.estado === e).length
  }));

  const porTipo = [...new Set(ocorrencias.map(o => o.tipo))].map(t => ({
    name: t,
    value: ocorrencias.filter(o => o.tipo === t).length
  }));

  const pieColors = ['#1D4ED8', '#DC2626', '#EA580C', '#CA8A04', '#16A34A', '#7C3AED', '#0EA5E9'];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink">Centro de Coordenação de Emergências</h2>
        <p className="text-sm text-muted dark:text-dmuted">Monitorize ocorrências, avalie prioridades e coordene operações.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard icon="Activity" label="Activas" value={ocorrencias.length} tone="brand" />
        <StatCard icon="AlertTriangle" label="Críticas" value={criticas} tone="red" />
        <StatCard icon="Clock" label="Pend. decisão" value={pend} tone="orange" />
        <StatCard icon="Target" label="Missões em curso" value={emCurso} tone="brand" />
        <StatCard icon="Users" label="Equipas disp." value={disp} tone="green" />
        <StatCard icon="Inbox" label="Por atribuir" value={pendAtrib} tone="orange" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-ink dark:text-dink">Mapa operacional</h3>
            <span className="text-xs text-muted dark:text-dmuted">Moçambique</span>
          </div>
          <MozambiqueMap ocorrencias={ocorrencias} height={360} />
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Prioritárias</h3>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {ocorrencias.filter(o => o.prioridade === 'Crítico' || o.prioridade === 'Alto').map(o => (
              <div key={o.ref} className="p-3 rounded-lg border border-bd dark:border-dborder hover:bg-light dark:hover:bg-dsidebar/30 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-muted dark:text-dmuted">{o.ref}</span>
                  <PrioBadge p={o.prioridade} />
                </div>
                <p className="text-sm font-medium text-ink dark:text-dink truncate">{o.titulo}</p>
                <p className="text-xs text-muted dark:text-dmuted">{o.distrito}, {o.provincia}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Gráficos Recharts */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Ocorrências por estado</h3>
          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porEstado} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-15} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Distribuição por tipo de emergência</h3>
          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={porTipo} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} 
                  labelLine={false}
                >
                  {porTipo.map((_, i) => (
                    <Cell key={i} fill={pieColors[i % pieColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Estado das Missões</h3>
          <div className="space-y-2">
            {['Atribuída', 'Em curso', 'Concluída'].map(s => (
              <div key={s} className="flex items-center justify-between p-3 rounded-lg bg-light dark:bg-dsidebar/40">
                <StatusBadge s={s} />
                <p className="text-sm font-bold text-ink dark:text-dink">{MISSOES.filter(m => m.estado === s).length}</p>
              </div>
            ))}
            <button onClick={() => setPage('missoes')} className="text-xs text-brand dark:text-dblue hover:underline flex items-center gap-1 pt-2 font-medium">
              Gerir Missões <Icon name="ArrowRight" size={14} />
            </button>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Disponibilidade de Equipas</h3>
          <div className="space-y-2">
            {['Disponível', 'Em missão', 'Indisponível'].map(s => (
              <div key={s} className="flex items-center justify-between p-3 rounded-lg bg-light dark:bg-dsidebar/40">
                <StatusBadge s={s} />
                <p className="text-sm font-bold text-ink dark:text-dink">{EQUIPAS.filter(e => e.estado === s).length}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

export default CoordenadorDashboard;
