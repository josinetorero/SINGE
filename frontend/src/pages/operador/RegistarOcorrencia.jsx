import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls } from '../../components/common/CommonComponents';
import { useToast } from '../../contexts/ToastContext';
import { validarOcorrencia } from '../../validation/ocorrencia';
import { ocorrenciasService } from '../../services/ocorrenciasService';
import { NetworkError, ValidationError } from '../../services/api';

export function RegistarOcorrencia({ setPage, onCreated, onOcorrenciaCriada }) {
  const toast = useToast();
  const [sec, setSec] = useState('A');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Campos controlados preservados entre secções
  const [form, setForm] = useState({
    tipo: 'Ciclone',
    data: '',
    titulo: '',
    descricao: '',
    fonte: 'INE',
    provincia: 'Sofala',
    distrito: '',
    localidade: '',
    endereco: '',
    lat: '',
    lng: '',
  });

  const secs = [
    { id: 'A', label: 'Informação geral' },
    { id: 'B', label: 'Localização' },
    { id: 'C', label: 'Evidências' },
    { id: 'D', label: 'Confirmação' }
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    // Limpar o erro do campo quando o utilizador escreve
    if (errors[field] || errors.localizacao || errors.coordenadas) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        if (field === 'lat' || field === 'lng' || field === 'provincia' || field === 'distrito') {
          delete next.localizacao;
          delete next.coordenadas;
        }
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    // 1) Validação pura no frontend
    const formErrors = validarOcorrencia(form);
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);

      // Ao submeter com erros, foca/vai para a primeira secção com erro
      if (formErrors.tipo || formErrors.titulo || formErrors.descricao || formErrors.data) {
        setSec('A');
      } else if (formErrors.localizacao || formErrors.provincia || formErrors.distrito || formErrors.coordenadas) {
        setSec('B');
      }
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      const payload = {
        ...form,
        lat: form.lat !== '' ? Number(form.lat) : null,
        lng: form.lng !== '' ? Number(form.lng) : null,
      };

      const novaOcorrencia = await ocorrenciasService.registar(payload);
      toast.success('Ocorrência registada.');

      // Atualiza a lista pai com o resultado retornado pela API [CU01, Requisito 4]
      if (typeof onOcorrenciaCriada === 'function') {
        onOcorrenciaCriada(novaOcorrencia);
      } else if (typeof onCreated === 'function') {
        onCreated(novaOcorrencia);
      }

      setPage('ocorrencias');
    } catch (err) {
      if (err instanceof ValidationError) {
        setErrors(err.errors);
        if (err.errors.tipo || err.errors.titulo || err.errors.descricao) {
          setSec('A');
        } else if (err.errors.localizacao || err.errors.provincia || err.errors.distrito || err.errors.lat || err.errors.lng) {
          setSec('B');
        }
        toast.error(err.message || 'Corrija os erros assinalados no formulário.');
      } else if (err instanceof NetworkError || err.isNetworkError) {
        // [RNF12] Preserva o formulário e avisa
        toast.error('Sem ligação. Os seus dados foram mantidos.');
      } else {
        toast.error(err.message || 'Erro ao registar ocorrência. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
            type="button"
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
              <Field 
                label="Tipo de ocorrência" 
                required 
                htmlFor="oc-tipo"
                error={errors.tipo}
                errorTestId="tipo-error"
              >
                <select 
                  id="oc-tipo"
                  data-testid="oc-tipo"
                  value={form.tipo}
                  onChange={e => handleChange('tipo', e.target.value)}
                  aria-invalid={Boolean(errors.tipo)}
                  className={inputCls}
                >
                  <option>Ciclone</option>
                  <option>Cheia</option>
                  <option>Seca</option>
                  <option>Surto de doença</option>
                  <option>Incêndio</option>
                  <option>Deslizamento</option>
                  <option>Acidente</option>
                </select>
              </Field>

              <Field 
                label="Data e hora" 
                htmlFor="oc-data"
                error={errors.data}
                errorTestId="data-error"
              >
                <input 
                  type="datetime-local" 
                  id="oc-data"
                  data-testid="oc-data"
                  value={form.data}
                  onChange={e => handleChange('data', e.target.value)}
                  aria-invalid={Boolean(errors.data)}
                  className={inputCls} 
                />
              </Field>
            </div>

            <Field 
              label="Título" 
              required 
              htmlFor="oc-titulo"
              error={errors.titulo}
              errorTestId="titulo-error"
            >
              <input 
                id="oc-titulo"
                data-testid="oc-titulo"
                value={form.titulo}
                onChange={e => handleChange('titulo', e.target.value)}
                aria-invalid={Boolean(errors.titulo)}
                className={inputCls} 
                placeholder="Ex: Inundação no centro da vila" 
              />
            </Field>

            <Field 
              label="Descrição detalhada" 
              required 
              htmlFor="oc-descricao"
              error={errors.descricao}
              errorTestId="descricao-error"
            >
              <textarea 
                rows={4} 
                id="oc-descricao"
                data-testid="oc-descricao"
                value={form.descricao}
                onChange={e => handleChange('descricao', e.target.value)}
                aria-invalid={Boolean(errors.descricao)}
                className={inputCls} 
                placeholder="Descreva os acontecimentos com o maior detalhe possível..." 
              />
            </Field>

            <Field 
              label="Fonte" 
              required 
              htmlFor="oc-fonte"
              error={errors.fonte}
              errorTestId="fonte-error"
            >
              <select 
                id="oc-fonte"
                data-testid="oc-fonte"
                value={form.fonte}
                onChange={e => handleChange('fonte', e.target.value)}
                className={inputCls}
              >
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
          <div className="space-y-4">
            {errors.localizacao && (
              <div 
                role="alert" 
                data-testid="localizacao-error"
                className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 font-medium"
              >
                {errors.localizacao}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Field 
                label="Província" 
                required 
                htmlFor="oc-provincia"
                error={errors.provincia}
                errorTestId="provincia-error"
              >
                <select 
                  id="oc-provincia"
                  data-testid="oc-provincia"
                  value={form.provincia}
                  onChange={e => handleChange('provincia', e.target.value)}
                  aria-invalid={Boolean(errors.provincia)}
                  className={inputCls}
                >
                  <option value="">Selecione uma província</option>
                  {['Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>

              <Field 
                label="Distrito" 
                required 
                htmlFor="oc-distrito"
                error={errors.distrito}
                errorTestId="distrito-error"
              >
                <input 
                  id="oc-distrito"
                  data-testid="oc-distrito"
                  value={form.distrito}
                  onChange={e => handleChange('distrito', e.target.value)}
                  aria-invalid={Boolean(errors.distrito)}
                  className={inputCls} 
                />
              </Field>

              <Field label="Localidade" htmlFor="oc-localidade">
                <input 
                  id="oc-localidade"
                  data-testid="oc-localidade"
                  value={form.localidade}
                  onChange={e => handleChange('localidade', e.target.value)}
                  className={inputCls} 
                />
              </Field>

              <Field label="Endereço" htmlFor="oc-endereco">
                <input 
                  id="oc-endereco"
                  data-testid="oc-endereco"
                  value={form.endereco}
                  onChange={e => handleChange('endereco', e.target.value)}
                  className={inputCls} 
                />
              </Field>

              <Field 
                label="Latitude" 
                htmlFor="oc-lat"
                error={errors.coordenadas || errors.lat}
                errorTestId="coordenadas-error"
              >
                <input 
                  type="number" 
                  step="0.0001" 
                  id="oc-lat"
                  data-testid="oc-lat"
                  value={form.lat}
                  onChange={e => handleChange('lat', e.target.value)}
                  aria-invalid={Boolean(errors.coordenadas || errors.lat)}
                  className={inputCls} 
                  placeholder="-19.84" 
                />
              </Field>

              <Field 
                label="Longitude" 
                htmlFor="oc-lng"
              >
                <input 
                  type="number" 
                  step="0.0001" 
                  id="oc-lng"
                  data-testid="oc-lng"
                  value={form.lng}
                  onChange={e => handleChange('lng', e.target.value)}
                  aria-invalid={Boolean(errors.coordenadas || errors.lng)}
                  className={inputCls} 
                  placeholder="34.84" 
                />
              </Field>
            </div>
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
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-lblue dark:bg-dblue/10 text-sm">
              <p className="font-semibold text-ink dark:text-dink">Síntese de Registo</p>
              <div className="mt-2 space-y-1 text-xs">
                <p><strong>Tipo:</strong> {form.tipo}</p>
                <p><strong>Título:</strong> {form.titulo || '—'}</p>
                <p><strong>Localização:</strong> {form.distrito ? `${form.distrito}, ${form.provincia}` : form.lat ? `${form.lat}, ${form.lng}` : '—'}</p>
                <p>
                  <strong>Prioridade:</strong> <span className="font-semibold text-amber-600 dark:text-amber-400">Por avaliar</span>
                </p>
              </div>
              <p className="text-muted dark:text-dmuted mt-3 text-xs">
                A prioridade será calculada automaticamente pelo motor inteligente do SINGE após a submissão e validada pela Coordenação.
              </p>
            </div>
          </div>
        )}
      </Card>

      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="secondary" onClick={() => setPage('ocorrencias')} disabled={isSubmitting}>Cancelar</Button>
        <Button variant="secondary" icon="Save" onClick={() => toast.success('Rascunho guardado.')} disabled={isSubmitting}>Guardar rascunho</Button>
        <Button 
          icon="CheckCircle" 
          id="oc-submit"
          data-testid="oc-submit"
          onClick={handleSubmit} 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'A registar...' : 'Registar'}
        </Button>
      </div>
    </div>
  );
}

export default RegistarOcorrencia;
