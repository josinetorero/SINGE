import React from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, EmptyState } from '../../components/common/CommonComponents';

export function CidadaoDetalheInfo({ info, setPage }) {
  if (!info) {
    return (
      <EmptyState 
        icon="BookOpen" 
        title="Nenhuma informação seleccionada" 
        action={<Button onClick={() => setPage('informacoes')}>Voltar</Button>} 
      />
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <button 
        onClick={() => setPage('informacoes')} 
        className="text-sm text-brand dark:text-dblue flex items-center gap-1 hover:underline font-medium"
      >
        <Icon name="ChevronLeft" size={16} /> Voltar às informações
      </button>

      <Card className="p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-lg bg-lblue dark:bg-dblue/20 text-brand dark:text-dblue flex items-center justify-center shrink-0">
            <Icon name={info.icon} size={24} />
          </div>
          <div>
            <p className="text-xs text-muted dark:text-dmuted uppercase tracking-wide font-semibold">{info.categoria}</p>
            <h1 className="text-xl font-bold text-ink dark:text-dink">{info.titulo}</h1>
          </div>
        </div>
        
        <p className="text-sm text-ink dark:text-dink leading-relaxed whitespace-pre-line">
          {info.conteudo}
        </p>

        <div className="mt-6 p-3 rounded-lg bg-light dark:bg-dsidebar/40 text-xs text-muted dark:text-dmuted border border-bd dark:border-dborder">
          <strong>Nota Institucional:</strong> Estas são recomendações gerais de proteção civil. Siga sempre as instruções das autoridades competentes em situações reais de emergência.
        </div>
      </Card>
    </div>
  );
}

export default CidadaoDetalheInfo;
