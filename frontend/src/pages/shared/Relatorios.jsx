import React, { useState } from 'react';
import { Card, Button, StatCard, Field, inputCls } from '../../components/common/CommonComponents';
import { OCORRENCIAS, MISSOES, EQUIPAS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

export function Relatorios() {
  const toast = useToast();
  const [prov, setProv] = useState('');
  const [prio, setPrio] = useState('');

  const filtered = OCORRENCIAS.filter(o => (!prov || o.provincia === prov) && (!prio || o.prioridade === prio));
  
  const porEstado = ['Nova', 'Em análise', 'Validada', 'Em resposta', 'Resolvida'].map(s => ({
    name: s,
    value: filtered.filter(o => o.estado === s).length
  }));

  const porTipo = [...new Set(filtered.map(o => o.tipo))].map(t => ({
    name: t,
    value: filtered.filter(o => o.tipo === t).length
  }));

  const porProv = [...new Set(OCORRENCIAS.map(o => o.provincia))].map(p => ({
    name: p,
    value: filtered.filter(o => o.provincia === p).length
  }));

  const porPrio = ['Crítico', 'Alto', 'Médio', 'Baixo'].map(p => ({
    name: p,
    value: filtered.filter(o => o.prioridade === p).length
  }));

  const evolucao = [
    { name: '12/01', ocorrencias: 3, missoes: 1 },
    { name: '13/01', ocorrencias: 5, missoes: 2 },
    { name: '14/01', ocorrencias: 4, missoes: 3 },
    { name: '15/01', ocorrencias: 7, missoes: 2 }
  ];

  const concluidas = MISSOES.filter(m => m.estado === 'Concluída').length;
  const taxa = ((concluidas / (MISSOES.length || 1)) * 100).toFixed(0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-ink dark:text-dink">Relatórios e Estatísticas</h2>
          <p className="text-sm text-muted dark:text-dmuted">Painel consolidado de métricas operacionais e tendências.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" icon="FileDown" onClick={() => toast.info('Exportação PDF requer backend.')}>PDF</Button>
          <Button variant="secondary" icon="FileSpreadsheet" onClick={() => toast.info('Exportação Excel requer backend.')}>Excel</Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid md:grid-cols-4 gap-3">
          <Field label="Província">
            <select value={prov} onChange={e => setProv(e.target.value)} className={inputCls}>
              <option value="">Todas</option>
              {[...new Set(OCORRENCIAS.map(o => o.provincia))].map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Prioridade">
            <select value={prio} onChange={e => setPrio(e.target.value)} className={inputCls}>
              <option value="">Todas</option>
              {['Crítico', 'Alto', 'Médio', 'Baixo'].map(p => <option key={p}>{p}</option>)}
            </select>
          </Field>
          <Field label="Data início"><input type="date" className={inputCls} defaultValue="2025-01-01" /></Field>
          <Field label="Data fim"><input type="date" className={inputCls} defaultValue="2025-01-16" /></Field>
        </div>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon="FileText" label="Total" value={filtered.length} tone="brand" />
        <StatCard icon="CheckCircle" label="Taxa conclusão" value={`${taxa}%`} tone="green" />
        <StatCard icon="Users" label="Em missão" value={EQUIPAS.filter(e => e.estado === 'Em missão').length} tone="orange" />
        <StatCard icon="Target" label="Concluídas" value={concluidas} tone="green" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Gráfico de Evolução Temporal */}
        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Evolução de Ocorrências vs Missões</h3>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolucao}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="ocorrencias" stroke="#1D4ED8" strokeWidth={2} name="Ocorrências" />
                <Line type="monotone" dataKey="missoes" stroke="#16A34A" strokeWidth={2} name="Missões" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico por Província Horizontal */}
        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Ocorrências por província</h3>
          <div style={{ height: 260, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porProv} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="value" fill="#1D4ED8" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico Circular por Prioridade */}
        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Distribuição por prioridade</h3>
          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie 
                  data={porPrio} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  outerRadius={80} 
                  label 
                >
                  {porPrio.map((_, i) => (
                    <Cell key={i} fill={['#DC2626', '#EA580C', '#CA8A04', '#16A34A'][i]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Gráfico de Barras por Tipo */}
        <Card className="p-5">
          <h3 className="font-semibold text-ink dark:text-dink mb-3">Distribuição por tipo de emergência</h3>
          <div style={{ height: 240, width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={porTipo}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-20} textAnchor="end" height={45} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#60A5FA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="font-semibold text-ink dark:text-dink mb-3">Distribuição por estado</h3>
        <div style={{ height: 200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={porEstado}>
              <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#1D4ED8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

export default Relatorios;
