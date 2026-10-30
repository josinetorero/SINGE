import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls } from '../../components/common/CommonComponents';
import { LocationPicker } from '../../components/map/MapComponents';
import { USERS } from '../../data/mockData';
import { useToast } from '../../contexts/ToastContext';
import { validarOcorrencia } from '../../validation/ocorrencia';
import { ocorrenciasService } from '../../services/ocorrenciasService';
import { NetworkError, ValidationError } from '../../services/api';

export function CidadaoComunicar({ setPage, onCreated, onOcorrenciaCriada }) {
  const toast = useToast();
  const [sec, setSec] = useState('A'); // Exatamente 5 passos: A, B, C, D, E [RF16]
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Campos controlados preservados entre secções
  const [form, setForm] = useState({
    tipo: '',
    titulo: '',
    descricao: '',
    data: new Date().toISOString().slice(0, 16),
    provincia: 'Sofala',
    distrito: '',
    localidade: '',
    endereco: '',
    lat: '',
    lng: '',
    descricaoEvidencias: '',
    confirmed: false,
  });

  const tipos = [
    { id: 'Cheia', label: 'Cheias ou inundações', icon: 'Waves', color: 'text-blue-600 dark:text-blue-300' },
    { id: 'Ciclone', label: 'Ciclone ou tempestade', icon: 'Wind', color: 'text-indigo-600 dark:text-indigo-300' },
    { id: 'Incêndio', label: 'Incêndio', icon: 'Flame', color: 'text-orange-600 dark:text-orange-300' },
    { id: 'Deslizamento', label: 'Deslizamento de terras', icon: 'MapPin', color: 'text-amber-600 dark:text-amber-300' },
    { id: 'Acidente', label: 'Acidente', icon: 'AlertTriangle', color: 'text-red-600 dark:text-red-300' },
    { id: 'Surto de doença', label: 'Risco sanitário', icon: 'Leaf', color: 'text-green-600 dark:text-green-300' },
    { id: 'Outra situação', label: 'Outra situação', icon: 'AlertCircle', color: 'text-slate-600 dark:text-slate-300' },
  ];

  // [RF16] Exatamente 5 passos estruturados
  const secs = [
    { id: 'A', label: 'Tipo' },
    { id: 'B', label: 'Descrição' },
    { id: 'C', label: 'Localização' },
    { id: 'D', label: 'Evidências' },
    { id: 'E', label: 'Confirmação' }
  ];

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (fieldErrors[field] || fieldErrors.localizacao || fieldErrors.coordenadas) {
      setFieldErrors(prev => {
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

  const handleLocationPick = (coords) => {
    setForm(prev => ({
      ...prev,
      lat: coords.lat !== null && coords.lat !== undefined ? String(coords.lat) : '',
      lng: coords.lng !== null && coords.lng !== undefined ? String(coords.lng) : '',
    }));
    if (fieldErrors.localizacao || fieldErrors.coordenadas) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next.localizacao;
        delete next.coordenadas;
        return next;
      });
    }
  };

  const usarLocalizacao = () => {
    if (!navigator.geolocation) { 
      toast.error('Geolocalização não disponível no seu dispositivo.'); 
      return; 
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setForm(prev => ({
          ...prev,
          lat: String(pos.coords.latitude),
          lng: String(pos.coords.longitude),
        }));
        setGeoLoading(false);
        toast.success('Localização GPS obtida com sucesso.');
      },
      () => {
        setGeoLoading(false);
        toast.error('Não foi possível obter a localização automática. Preencha manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isSubmitting) return;

    // 1) Validação das regras puras
    const errors = validarOcorrencia(form);

    // Validação da confirmação de veracidade no passo E
    if (!form.confirmed) {
      errors.confirm = 'Confirme que as informações comunicadas são verdadeiras.';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);

      // Foca/vai para a primeira secção com erro [Requisito 2]
      if (errors.tipo) {
        setSec('A');
      } else if (errors.titulo || errors.descricao || errors.data) {
        setSec('B');
      } else if (errors.localizacao || errors.provincia || errors.distrito || errors.coordenadas) {
        setSec('C');
      } else if (errors.confirm) {
        setSec('E');
      }
      toast.error('Corrija os campos assinalados antes de submeter.');
      return;
    }

    setIsSubmitting(true);
    setFieldErrors({});

    try {
      const payload = {
        tipo: form.tipo,
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        data: form.data,
        provincia: form.provincia,
        distrito: form.distrito.trim(),
        localidade: form.localidade.trim(),
        endereco: form.endereco.trim(),
        lat: form.lat !== '' ? Number(form.lat) : null,
        lng: form.lng !== '' ? Number(form.lng) : null,
        descricaoEvidencias: form.descricaoEvidencias.trim(),
        fonte: 'Cidadão',
      };

      // [CU01] Estado e identificador vêm da API, o frontend não os inventa
      const respostaApi = await ocorrenciasService.registar(payload);
      
      toast.success('Ocorrência comunicada com sucesso.');
      setSubmitted({
        ref: respostaApi?.ref || respostaApi?.id || 'OC-2025-NOVA',
        data: respostaApi?.data || new Date().toLocaleString('pt-PT'),
        tipo: respostaApi?.tipo || form.tipo,
        local: form.distrito ? `${form.distrito}, ${form.provincia}` : (form.lat ? `${form.lat}, ${form.lng}` : 'Moçambique')
      });

      if (typeof onOcorrenciaCriada === 'function') {
        onOcorrenciaCriada(respostaApi);
      } else if (typeof onCreated === 'function') {
        onCreated(respostaApi);
      }
    } catch (err) {
      if (err instanceof ValidationError) {
        setFieldErrors(err.errors);
        if (err.errors.tipo) setSec('A');
        else if (err.errors.titulo || err.errors.descricao) setSec('B');
        else if (err.errors.localizacao || err.errors.provincia || err.errors.distrito) setSec('C');
        toast.error(err.message || 'Verifique os dados assinalados.');
      } else if (err instanceof NetworkError || err.isNetworkError) {
        // [RNF12] Preserva formulário e exibe mensagem oficial
        toast.error('Sem ligação. Os seus dados foram mantidos.');
      } else {
        toast.error(err.message || 'Erro ao submeter ocorrência.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="p-8 text-center animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-300 mx-auto flex items-center justify-center">
            <Icon name="CheckCircle" size={32} />
          </div>
          <h2 className="text-xl font-bold text-ink dark:text-dink mt-4">Ocorrência submetida</h2>
          <p className="text-sm text-muted dark:text-dmuted mt-1">
            A sua comunicação foi recebida pelo sistema e será analisada pelas entidades responsáveis.
          </p>

          <div className="mt-6 p-4 rounded-lg bg-light dark:bg-dsidebar/40 text-left space-y-2 border border-bd dark:border-dborder">
            <div className="flex justify-between text-sm">
              <span className="text-muted dark:text-dmuted">Referência única</span>
              <span className="font-mono font-semibold text-brand dark:text-dblue">{submitted.ref}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted dark:text-dmuted">Data e hora</span>
              <span className="text-ink dark:text-dink">{submitted.data}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted dark:text-dmuted">Tipo de emergência</span>
              <span className="text-ink dark:text-dink font-medium">{submitted.tipo}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted dark:text-dmuted">Prioridade</span>
              <span className="text-amber-600 dark:text-amber-400 font-semibold">Por avaliar</span>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-100 text-left">
            <strong>Nota:</strong> A submissão será sujeita a análise. Este envio <strong>não representa confirmação</strong> de que uma equipa foi mobilizada.
          </div>

          <div className="mt-6 flex gap-2 justify-center flex-wrap">
            <Button icon="Eye" onClick={() => setPage('minhas-ocorrencias')}>Acompanhar ocorrência</Button>
            <Button 
              variant="secondary" 
              onClick={() => { 
                setSubmitted(null); 
                setForm({
                  tipo: '',
                  titulo: '',
                  descricao: '',
                  data: new Date().toISOString().slice(0, 16),
                  provincia: 'Sofala',
                  distrito: '',
                  localidade: '',
                  endereco: '',
                  lat: '',
                  lng: '',
                  descricaoEvidencias: '',
                  confirmed: false,
                });
                setSec('A'); 
              }}
            >
              Nova comunicação
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const locObj = {
    lat: form.lat !== '' ? Number(form.lat) : null,
    lng: form.lng !== '' ? Number(form.lng) : null,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-dink">Comunicar uma Ocorrência</h1>
        <p className="text-sm text-muted dark:text-dmuted mt-1">
          Forneça informações claras para ajudar as entidades responsáveis a compreender e avaliar a situação.
        </p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {secs.map((s, i) => (
          <button 
            key={s.id} 
            type="button"
            onClick={() => setSec(s.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm whitespace-nowrap transition-colors ${
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
            <span>{s.label}</span>
          </button>
        ))}
      </div>

      <Card className="p-6 space-y-5">
        {sec === 'A' && (
          <Field 
            label="Seleccione o tipo de ocorrência" 
            required 
            hint="Escolha a opção que melhor descreve a situação observada."
            error={fieldErrors.tipo}
            errorTestId="tipo-error"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {tipos.map(t => (
                <button 
                  key={t.id} 
                  type="button"
                  data-testid={`cid-tipo-${t.id}`}
                  onClick={() => handleChange('tipo', t.id)}
                  aria-pressed={form.tipo === t.id}
                  className={`p-3 rounded-lg border-2 flex flex-col items-start gap-1.5 transition-all text-left ${
                    form.tipo === t.id 
                      ? 'border-brand bg-lblue/50 dark:bg-dblue/10 shadow-sm' 
                      : 'border-bd dark:border-dborder hover:border-brand/50'
                  }`}
                >
                  <Icon name={t.icon} size={22} className={t.color} />
                  <span className="text-xs font-semibold text-ink dark:text-dink">{t.label}</span>
                </button>
              ))}
            </div>
          </Field>
        )}

        {sec === 'B' && (
          <>
            <Field 
              label="Título / descrição resumida" 
              required 
              hint="Ex: Água a subir na rua principal (entre 5 e 100 caracteres)"
              htmlFor="cid-titulo"
              error={fieldErrors.titulo}
              errorTestId="titulo-error"
            >
              <input 
                id="cid-titulo"
                data-testid="cid-titulo"
                value={form.titulo}
                onChange={e => handleChange('titulo', e.target.value)}
                aria-invalid={Boolean(fieldErrors.titulo)}
                className={inputCls} 
                placeholder="Resumo curto da situação" 
              />
            </Field>

            <Field 
              label="Descrição detalhada" 
              required 
              hint="Inclua o que observou, extensão aparente, se há pessoas em risco, etc. (10 a 1000 caracteres)"
              htmlFor="cid-descricao"
              error={fieldErrors.descricao}
              errorTestId="descricao-error"
            >
              <textarea 
                rows={5} 
                id="cid-descricao"
                data-testid="cid-descricao"
                value={form.descricao}
                onChange={e => handleChange('descricao', e.target.value)}
                aria-invalid={Boolean(fieldErrors.descricao)}
                className={inputCls} 
                placeholder="Descreva a situação com o máximo de detalhe possível..." 
              />
            </Field>

            <Field 
              label="Data e hora em que observou a situação" 
              htmlFor="cid-data"
              error={fieldErrors.data}
              errorTestId="data-error"
            >
              <input 
                type="datetime-local" 
                id="cid-data"
                data-testid="cid-data"
                value={form.data}
                onChange={e => handleChange('data', e.target.value)}
                aria-invalid={Boolean(fieldErrors.data)}
                className={inputCls} 
              />
            </Field>
          </>
        )}

        {sec === 'C' && (
          <>
            {fieldErrors.localizacao && (
              <div 
                role="alert" 
                data-testid="localizacao-error"
                className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 font-medium"
              >
                {fieldErrors.localizacao}
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-4">
              <Field 
                label="Província" 
                required 
                htmlFor="cid-provincia"
                error={fieldErrors.provincia}
                errorTestId="provincia-error"
              >
                <select 
                  id="cid-provincia"
                  data-testid="cid-provincia"
                  value={form.provincia}
                  onChange={e => handleChange('provincia', e.target.value)}
                  className={inputCls}
                >
                  {['Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'].map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>

              <Field 
                label="Distrito" 
                required 
                htmlFor="cid-distrito"
                error={fieldErrors.distrito}
                errorTestId="distrito-error"
              >
                <input 
                  id="cid-distrito"
                  data-testid="cid-distrito"
                  value={form.distrito}
                  onChange={e => handleChange('distrito', e.target.value)}
                  aria-invalid={Boolean(fieldErrors.distrito)}
                  className={inputCls} 
                  placeholder="Ex: Beira" 
                />
              </Field>

              <Field label="Localidade" htmlFor="cid-localidade">
                <input 
                  id="cid-localidade"
                  data-testid="cid-localidade"
                  value={form.localidade}
                  onChange={e => handleChange('localidade', e.target.value)}
                  className={inputCls} 
                  placeholder="Ex: Macurungo" 
                />
              </Field>

              <Field label="Endereço / ponto de referência" htmlFor="cid-endereco">
                <input 
                  id="cid-endereco"
                  data-testid="cid-endereco"
                  value={form.endereco}
                  onChange={e => handleChange('endereco', e.target.value)}
                  className={inputCls} 
                  placeholder="Ex: Próximo à escola primária" 
                />
              </Field>
            </div>
            
            <div className="flex flex-wrap gap-2 items-center pt-2">
              <Button variant="secondary" icon="Navigation" onClick={usarLocalizacao} disabled={geoLoading}>
                {geoLoading ? 'A obter coordenadas...' : 'Usar a minha localização GPS'}
              </Button>
              {form.lat && form.lng && (
                <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1 font-medium">
                  <Icon name="CheckCircle" size={14} /> Localização obtida ({Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)})
                </span>
              )}
            </div>
            <p className="text-xs text-muted dark:text-dmuted">
              A localização só será obtida após a sua autorização explícita. Pode também clicar no mapa para marcar o local.
            </p>

            <Field label="Localização no mapa" hint="Clique no mapa para marcar a localização exacta (opcional)">
              <div className="h-64 rounded-xl overflow-hidden mt-2">
                <LocationPicker 
                  value={locObj} 
                  onChange={handleLocationPick} 
                  height={256} 
                />
              </div>
            </Field>

            <div className="grid md:grid-cols-2 gap-4">
              <Field 
                label="Latitude" 
                htmlFor="cid-lat"
                error={fieldErrors.coordenadas}
                errorTestId="coordenadas-error"
              >
                <input 
                  type="number" 
                  step="0.0001" 
                  id="cid-lat"
                  data-testid="cid-lat"
                  value={form.lat} 
                  onChange={e => handleChange('lat', e.target.value)} 
                  className={inputCls} 
                />
              </Field>
              <Field label="Longitude" htmlFor="cid-lng">
                <input 
                  type="number" 
                  step="0.0001" 
                  id="cid-lng"
                  data-testid="cid-lng"
                  value={form.lng} 
                  onChange={e => handleChange('lng', e.target.value)} 
                  className={inputCls} 
                />
              </Field>
            </div>
          </>
        )}

        {sec === 'D' && (
          <>
            <Field label="Fotografias" hint="Formatos aceites: JPG, PNG. Tamanho máximo: 10MB por ficheiro. Não é obrigatório — não coloque a sua segurança em risco para obter fotografias.">
              <div className="border-2 border-dashed border-bd dark:border-dborder rounded-lg p-8 text-center mt-2 hover:border-brand/50 transition-colors">
                <Icon name="Camera" size={32} className="mx-auto text-muted dark:text-dmuted mb-2" />
                <p className="text-sm text-ink dark:text-dink font-medium">Clique ou arraste fotografias para aqui</p>
                <p className="text-xs text-muted dark:text-dmuted mt-1">(opcional)</p>
              </div>
            </Field>
            <Field label="Documentos" hint="Ex: PDF, DOC. Tamanho máximo: 10MB.">
              <button type="button" className="flex items-center gap-2 px-3 py-2 border border-bd dark:border-bd dark:border-dborder rounded-lg text-sm text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar transition-colors">
                <Icon name="Paperclip" size={16} /> Anexar documento
              </button>
            </Field>
            <Field label="Descrição das evidências anexadas" htmlFor="cid-evidencias">
              <textarea 
                rows={3} 
                id="cid-evidencias"
                value={form.descricaoEvidencias}
                onChange={e => handleChange('descricaoEvidencias', e.target.value)}
                className={inputCls} 
                placeholder="Notas adicionais sobre as imagens ou vídeos..." 
              />
            </Field>
          </>
        )}

        {sec === 'E' && (
          <>
            <div className="p-4 rounded-lg bg-lblue dark:bg-dblue/10 space-y-2 border border-blue-200 dark:border-blue-900/30">
              <p className="text-sm font-semibold text-ink dark:text-dink">Os seus dados de contacto associados</p>
              <div className="flex items-center gap-2 text-sm text-ink dark:text-dink">
                <Icon name="Mail" size={14} className="text-muted dark:text-dmuted" /> {USERS.cidadao.email}
              </div>
              <div className="flex items-center gap-2 text-sm text-ink dark:text-dink">
                <Icon name="Phone" size={14} className="text-muted dark:text-dmuted" /> {USERS.cidadao.telefone}
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  id="cid-confirm"
                  data-testid="cid-confirm"
                  checked={form.confirmed}
                  onChange={e => handleChange('confirmed', e.target.checked)}
                  aria-invalid={Boolean(fieldErrors.confirm)}
                  className="mt-1 w-4 h-4 rounded border-bd text-brand focus:ring-brand" 
                />
                <span className="text-sm text-ink dark:text-dink">
                  Confirmo que as informações prestadas são verdadeiras e correspondem ao que observei pessoalmente.
                </span>
              </label>
              {fieldErrors.confirm && (
                <p role="alert" data-testid="confirm-error" className="text-xs text-red-600 ml-7">
                  {fieldErrors.confirm}
                </p>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-muted dark:text-dmuted">
              <strong>Aviso legal:</strong> A comunicação falsa de emergências é punível por lei nos termos do Código Penal de Moçambique.
            </div>
          </>
        )}
      </Card>

      <div className="flex gap-2 justify-between">
        <Button 
          variant="secondary" 
          disabled={sec === 'A' || isSubmitting} 
          onClick={() => {
            const idx = secs.findIndex(s => s.id === sec);
            if (idx > 0) setSec(secs[idx - 1].id);
          }}
        >
          Anterior
        </Button>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setPage('dashboard')} disabled={isSubmitting}>Cancelar</Button>
          {sec !== 'E' ? (
            <Button 
              onClick={() => {
                const idx = secs.findIndex(s => s.id === sec);
                if (idx < secs.length - 1) setSec(secs[idx + 1].id);
              }}
            >
              Seguinte
            </Button>
          ) : (
            <Button 
              icon="CheckCircle" 
              id="cid-submit"
              data-testid="cid-submit"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'A submeter...' : 'Submeter ocorrência'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default CidadaoComunicar;
