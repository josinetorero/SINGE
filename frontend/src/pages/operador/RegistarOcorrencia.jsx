import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls } from '../../components/common/CommonComponents';
import { useToast } from '../../contexts/ToastContext';

export function RegistarOcorrencia({ setPage }) {
  const toast = useToast();
  const [sec, setSec] = useState('A');

  const secs = [
    { id: 'A', label: 'Informação geral' },
    { id: 'B', label: 'Localização' },
    { id: 'C', label: 'Evidências' },
    { id: 'D', label: 'Confirmação' }
  ];

  return (
    <div className="space-y-4 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-ink dark:text-dink">Registar Ocorrência</h2>
        <p className="text-sm text-muted dark:text-dmuted">Preencha as secções.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {secs.map((s, i) => (
          <button 
            key={s.id} 
            onClick={() => setSec(s.id)} 
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
              sec === s.id 
                ? 'bg-brand text-white font-medium' 
                : 'bg-white dark:bg-dcard border border-bd dark:border-dborder text-ink dark:text-dink'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
              sec === s.id ? 'bg-white/20' : 'bg-lblue dark:bg-dsidebar text-brand dark:text-dblue font-semibold'
            }`}>
              {i + 1}
            </span>
            {s.label}
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        {sec === 'A' && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Tipo de ocorrência" required>
                <select className={inputCls}>
                  <option>Ciclone</option>
                  <option>Cheia</option>
                  <option>Seca</option>
                  <option>Surto de doença</option>
                  <option>Incêndio</option>
                  <option>Deslizamento</option>
                  <option>Acidente</option>
                </select>
              </Field>
              <Field label="Data e hora" required>
                <input type="datetime-local" className={inputCls} />
              </Field>
            </div>
            <Field label="Título" required>
              <input className={inputCls} placeholder="Ex: Inundação no centro da vila" />
            </Field>
            <Field label="Descrição detalhada" required>
              <textarea rows={4} className={inputCls} placeholder="Descreva os acontecimentos com o maior detalhe possível..." />
            </Field>
            <Field label="Fonte" required>
              <select className={inputCls}>
                <option>INE</option>
                <option>DPCC</option>
                <option>PRM</option>
                <option>Cidadão</option>
                <option>Outro</option>
              </select>
            </Field>
          </>
        )}

        {sec === 'B' && (
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Província" required>
              <select className={inputCls}>
                {['Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'].map(p => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field label="Distrito" required><input className={inputCls} /></Field>
            <Field label="Localidade"><input className={inputCls} /></Field>
            <Field label="Endereço"><input className={inputCls} /></Field>
            <Field label="Latitude"><input type="number" step="0.0001" className={inputCls} placeholder="-19.84" /></Field>
            <Field label="Longitude"><input type="number" step="0.0001" className={inputCls} placeholder="34.84" /></Field>
          </div>
        )}

        {sec === 'C' && (
          <>
            <Field label="Fotografias">
              <div className="border-2 border-dashed border-bd dark:border-dborder rounded-lg p-8 text-center">
                <Icon name="Upload" size={28} className="mx-auto text-muted dark:text-dmuted mb-2" />
                <p className="text-sm text-ink dark:text-dink">Clique ou arraste ficheiros</p>
                <p className="text-xs text-muted dark:text-dmuted mt-1">PNG, JPG até 10MB</p>
              </div>
            </Field>
            <Field label="Documentos">
              <button type="button" className="flex items-center gap-2 px-3 py-2 border border-bd dark:border-dborder rounded-lg text-sm text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar">
                <Icon name="Paperclip" size={16} /> Anexar
              </button>
            </Field>
          </>
        )}

        {sec === 'D' && (
          <div className="p-4 rounded-lg bg-lblue dark:bg-dblue/10 text-sm">
            <p className="font-semibold text-ink dark:text-dink">Síntese de Registo</p>
            <p className="text-muted dark:text-dmuted mt-1">
              A prioridade será calculada automaticamente pelo motor inteligente do SINGE após a submissão.
            </p>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="secondary" onClick={() => setPage('ocorrencias')}>Cancelar</Button>
        <Button variant="secondary" icon="Save" onClick={() => toast.success('Rascunho guardado.')}>Guardar rascunho</Button>
        <Button icon="CheckCircle" onClick={() => { setPage('ocorrencias'); toast.success('Ocorrência registada.'); }}>Registar</Button>
      </div>
    </div>
  );
}

export default RegistarOcorrencia;
