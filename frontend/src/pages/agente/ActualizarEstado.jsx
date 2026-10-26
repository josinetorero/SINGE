import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, EmptyState, inputCls } from '../../components/common/CommonComponents';
import { useToast } from '../../contexts/ToastContext';

export function ActualizarEstado({ m, setPage }) {
  const toast = useToast();
  const [estado, setEstado] = useState(m?.estado || 'Em curso');

  if (!m) {
    return (
      <EmptyState 
        icon="RefreshCw" 
        title="Nenhuma missão seleccionada" 
        action={<Button onClick={() => setPage('missoes')}>Voltar</Button>} 
      />
    );
  }

  return (
    <div className="space-y-4 max-w-2xl">
      <button 
        onClick={() => setPage('missoes')} 
        className="text-sm text-brand dark:text-dblue flex items-center gap-1 hover:underline"
      >
        <Icon name="ChevronLeft" size={16} /> Voltar
      </button>

      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink">Actualizar Estado</h2>
        <p className="text-sm text-muted dark:text-dmuted">Missão {m.ref}</p>
      </div>

      <Card className="p-6 space-y-4">
        <Field label="Novo estado da missão" required>
          <select value={estado} onChange={e => setEstado(e.target.value)} className={inputCls}>
            <option>Em curso</option>
            <option>Concluída</option>
            <option>Suspensa</option>
          </select>
        </Field>

        <Field label="Descrição da actualização" required>
          <textarea rows={3} className={inputCls} placeholder="Ex: Equipa chegou ao local e iniciou resgate aquático..." />
        </Field>

        <Field label="Observações e recursos adicionais necessários">
          <textarea rows={2} className={inputCls} placeholder="Observações opcionais..." />
        </Field>
      </Card>

      <div className="flex gap-2 justify-end">
        <Button variant="secondary" onClick={() => setPage('missoes')}>Cancelar</Button>
        <Button icon="CheckCircle" onClick={() => { setPage('missoes'); toast.success('Missão actualizada com sucesso.'); }}>
          Submeter
        </Button>
      </div>
    </div>
  );
}

export default ActualizarEstado;
