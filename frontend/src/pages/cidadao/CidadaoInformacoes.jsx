import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card } from '../../components/common/CommonComponents';
import { INFO_SEGURANCA } from '../../data/mockData';

export function CidadaoInformacoes({ setPage, setSelectedInfo }) {
  const cats = [...new Set(INFO_SEGURANCA.map(i => i.categoria))];
  const [cat, setCat] = useState('');
  const filtered = cat ? INFO_SEGURANCA.filter(i => i.categoria === cat) : INFO_SEGURANCA;

  return (
    <div className="space-y-4 max-w-6xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-dink">Preparação e Segurança Comunitária</h1>
        <p className="text-sm text-muted dark:text-dmuted mt-1">
          Recomendações e medidas preventivas gerais — não substituem as instruções das autoridades competentes.
        </p>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button 
          onClick={() => setCat('')} 
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            cat === '' 
              ? 'bg-brand text-white' 
              : 'bg-white dark:bg-dcard border border-bd dark:border-dborder text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar'
          }`}
        >
          Todas as categorias
        </button>
        {cats.map(c => (
          <button 
            key={c} 
            onClick={() => setCat(c)} 
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              cat === c 
                ? 'bg-brand text-white' 
                : 'bg-white dark:bg-dcard border border-bd dark:border-dborder text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-3">
        {filtered.map(info => (
          <Card key={info.id} className="p-5 flex flex-col hover:border-brand/40 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-lg bg-lblue dark:bg-dblue/20 text-brand dark:text-dblue flex items-center justify-center shrink-0">
                <Icon name={info.icon} size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted dark:text-dmuted uppercase tracking-wide font-semibold">{info.categoria}</p>
                <p className="text-sm font-semibold text-ink dark:text-dink mt-0.5">{info.titulo}</p>
              </div>
            </div>
            <p className="text-xs text-muted dark:text-dmuted mt-3 flex-1">{info.resumo}</p>
            <button 
              onClick={() => { setSelectedInfo(info); setPage('detalhe-info'); }} 
              className="mt-3 text-xs text-brand dark:text-dblue hover:underline text-left flex items-center gap-1 font-medium"
            >
              Consultar guia completo <Icon name="ArrowRight" size={12} />
            </button>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default CidadaoInformacoes;
