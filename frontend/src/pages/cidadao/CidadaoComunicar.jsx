import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls } from '../../components/common/CommonComponents';
import { LocationPicker } from '../../components/map/MapComponents';
import { GeographicComboboxes } from '../../components/common/GeographicComboboxes';
import { useToast } from '../../contexts/ToastContext';
import { validarOcorrencia } from '../../validation/ocorrencia';
import { ocorrenciasService } from '../../services/ocorrenciasService';
import { NetworkError, ValidationError } from '../../services/api';

const SECTIONS = [
  { id: 'A', label: 'Tipo',        icon: 'Sliders' },
  { id: 'B', label: 'Descrição',   icon: 'FileText' },
  { id: 'C', label: 'Localização', icon: 'MapPin' },
  { id: 'D', label: 'Evidências',  icon: 'Upload' },
  { id: 'E', label: 'Confirmação', icon: 'CheckCircle' },
];

const TYPE_ICONS = ['Waves', 'Wind', 'Flame', 'MapPin', 'AlertTriangle', 'Leaf', 'AlertCircle'];

const EMPTY_FORM = {
  tipo: '',
  titulo: '',
  descricao: '',
  provincia: '',
  distrito: '',
  localidade: '',
  endereco: '',
  lat: '',
  lng: '',
  confirmed: false,
  provincia_id: '',
  distrito_id: '',
  geografia: {},
};

function mapValidationErrors(errors) {
  const mapped = { ...errors };
  Object.entries(errors).forEach(([key, message]) => {
    if (key.startsWith('referencia_geografica.')) mapped[key.replace('referencia_geografica.', '')] = message;
  });
  return {
    ...mapped,
    tipo: mapped.tipo_ocorrencia_id || mapped.tipo,
    coordenadas: mapped.latitude || mapped.longitude || mapped.coordenadas,
  };
}

/* ─── Section header reutilizável ─────────────────────────── */
function SectionTitle({ icon, accent, title, hint }) {
  return (
    <div className="mb-4">
      <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
        <span className={`w-1 h-5 rounded-full ${accent}`} />
        {icon && <Icon name={icon} size={15} className="text-muted dark:text-dmuted" />}
        {title}
      </h3>
      {hint && <p className="text-xs text-muted dark:text-dmuted mt-1 ml-3">{hint}</p>}
    </div>
  );
}

export function CidadaoComunicar({ user, types = [], typesError = '', setPage, onCreated }) {
  const toast = useToast();
  const [section, setSection] = useState('A');
  const [form, setForm] = useState(EMPTY_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [geoLoading, setGeoLoading] = useState(false);

  const setField = (field, value) => {
    setForm(current => ({ ...current, [field]: value }));
    setFieldErrors(current => {
      const next = { ...current };
      delete next[field];
      if (['provincia', 'distrito', 'localidade', 'endereco', 'lat', 'lng'].includes(field)) {
        delete next.localizacao;
        delete next.coordenadas;
      }
      return next;
    });
  };

  const setCoordinates = (latitude, longitude) => {
    setForm(current => ({
      ...current,
      lat: latitude === null || latitude === undefined ? '' : String(latitude),
      lng: longitude === null || longitude === undefined ? '' : String(longitude),
    }));
    setFieldErrors(current => {
      const next = { ...current };
      delete next.localizacao;
      delete next.coordenadas;
      delete next.latitude;
      delete next.longitude;
      return next;
    });
  };

  const getDeviceLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocalização não disponível neste dispositivo.');
      return;
    }

    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoordinates(coords.latitude, coords.longitude);
        setGeoLoading(false);
        toast.success('Localização GPS obtida.');
      },
      () => {
        setGeoLoading(false);
        toast.error('Não foi possível obter a localização. Indique-a manualmente.');
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    const errors = validarOcorrencia(form);
    if (!form.tipo) errors.tipo = 'O tipo de ocorrência é obrigatório.';
    if (!form.confirmed) errors.confirm = 'Confirme que as informações comunicadas são verdadeiras.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      setSection(errors.tipo ? 'A' : errors.titulo || errors.descricao ? 'B' : errors.localizacao ? 'C' : 'E');
      toast.error('Corrija os campos assinalados antes de submeter.');
      return;
    }

    const locationParts = [form.endereco, form.localidade, form.distrito, form.provincia]
      .map(value => value.trim())
      .filter(Boolean);
    const location = locationParts.length
      ? locationParts.join(', ')
      : `Coordenadas: ${form.lat}, ${form.lng}`;

    setIsSubmitting(true);
    setFieldErrors({});
    try {
      const occurrence = await ocorrenciasService.registar({
        tipo_ocorrencia_id: Number(form.tipo),
        titulo: form.titulo.trim(),
        descricao: form.descricao.trim(),
        localizacao: location,
        latitude: form.lat === '' ? null : Number(form.lat),
        longitude: form.lng === '' ? null : Number(form.lng),
        referencia_geografica: form.provincia_id && form.distrito_id ? Object.fromEntries(
          Object.entries(form.geografia).filter(([key, value]) => key.endsWith('_id') && value).map(([key, value]) => [key, Number(value)])
        ) : undefined,
      });

      setSubmitted(occurrence);
      await onCreated?.(occurrence);
      toast.success('Ocorrência comunicada com sucesso.');
    } catch (error) {
      if (error instanceof ValidationError) {
        const mappedErrors = mapValidationErrors(error.errors);
        setFieldErrors(mappedErrors);
        setSection(mappedErrors.tipo ? 'A' : mappedErrors.titulo || mappedErrors.descricao ? 'B' : 'C');
        toast.error(error.message || 'Verifique os dados assinalados.');
      } else if (error instanceof NetworkError || error.isNetworkError) {
        toast.error('Sem ligação. Os seus dados foram mantidos.');
      } else {
        toast.error(error.message || 'Erro ao submeter ocorrência.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setSubmitted(null);
    setForm(EMPTY_FORM);
    setFieldErrors({});
    setSection('A');
  };

  const locationValue = {
    lat: form.lat === '' ? null : Number(form.lat),
    lng: form.lng === '' ? null : Number(form.lng),
  };

  const currentIndex = SECTIONS.findIndex(item => item.id === section);
  const progress = ((currentIndex + 1) / SECTIONS.length) * 100;

  /* ═══════════ ECRÃ DE SUCESSO ═══════════ */
  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <Card className="relative overflow-hidden p-8 text-center">
          <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-green-400/10 dark:bg-green-500/10 blur-3xl" />

          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-green-600 text-white mx-auto flex items-center justify-center shadow-md">
              <Icon name="CheckCircle" size={32} />
            </div>
            <h2 className="text-xl font-bold text-ink dark:text-dink mt-4">Ocorrência submetida</h2>
            <p className="text-sm text-muted dark:text-dmuted mt-1">
              A comunicação foi persistida e aguarda avaliação pelas entidades responsáveis.
            </p>

            {/* Metadados em grelha */}
            <div className="mt-6 grid grid-cols-2 gap-2 text-left">
              {[
                { label: 'Identificador', value: `#${submitted.id}`, mono: true, accent: 'text-brand dark:text-dblue' },
                { label: 'Registada em', value: submitted.created_at ? new Date(submitted.created_at).toLocaleString('pt-MZ') : 'Registada' },
                { label: 'Tipo', value: submitted.tipo_ocorrencia?.nome || '—' },
                { label: 'Prioridade', value: 'Por avaliar', accent: 'text-amber-600 dark:text-amber-400' },
              ].map((row, i) => (
                <div key={i} className="p-3 rounded-lg border border-bd dark:border-dborder bg-light/60 dark:bg-dsidebar/40">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted mb-1">{row.label}</p>
                  <p className={`text-sm font-semibold text-ink dark:text-dink truncate ${row.mono ? 'font-mono' : ''} ${row.accent || ''}`}>
                    {row.value}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-4 p-3 rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 text-xs text-amber-900 dark:text-amber-100 text-left inline-flex items-start gap-2">
              <Icon name="Info" size={14} className="shrink-0 mt-0.5" />
              <span>O registo não confirma a mobilização de uma equipa nem garante assistência imediata.</span>
            </p>

            <div className="mt-6 flex gap-2 justify-center flex-wrap">
              <Button icon="Eye" onClick={() => setPage('minhas-ocorrencias')}>Acompanhar ocorrência</Button>
              <Button variant="secondary" icon="PlusCircle" onClick={reset}>Nova comunicação</Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ═══════════ ECRÃ DE FORMULÁRIO ═══════════ */
  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ─── Cabeçalho ─────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-emerald-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-3xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold uppercase tracking-wider border border-emerald-200/60 dark:border-emerald-800/50">
              <Icon name="AlertCircle" size={11} />
              Comunicação ao Cidadão
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold border border-slate-200/60 dark:border-slate-700 tabular-nums">
              Passo {currentIndex + 1} de {SECTIONS.length}
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-dink">Comunicar uma Ocorrência</h1>
          <p className="mt-1 text-sm text-muted dark:text-dmuted max-w-2xl">
            Forneça informações claras para ajudar as entidades responsáveis a compreender a situação.
          </p>
        </div>
      </header>

      {/* ─── Stepper ──────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {SECTIONS.map((item, index) => {
            const isActive = section === item.id;
            const isPast = index < currentIndex;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSection(item.id)}
                className={`group flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-brand text-white font-semibold shadow-sm'
                    : isPast
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300'
                    : 'bg-white dark:bg-dcard border border-bd dark:border-dborder text-ink dark:text-dink hover:border-brand/40'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  isActive
                    ? 'bg-white/20'
                    : isPast
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-800'
                }`}>
                  {isPast ? <Icon name="CheckCircle" size={12} /> : index + 1}
                </span>
                <Icon name={item.icon} size={13} className={isActive ? 'opacity-90' : ''} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Barra de progresso */}
        <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <form onSubmit={submit}>
        <Card className="p-5 md:p-6 space-y-5">

          {/* ═══ SECÇÃO A — TIPO ═══ */}
          {section === 'A' && (
            <>
              <SectionTitle
                icon="Sliders"
                accent="bg-gradient-to-b from-blue-500 to-indigo-500"
                title="Seleccione o tipo de ocorrência"
                hint="Escolha a categoria que melhor descreve a situação observada."
              />
              <Field label="Tipo de ocorrência" required error={fieldErrors.tipo}>
                {typesError ? (
                  <div role="alert" className="p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300 inline-flex items-start gap-2">
                    <Icon name="AlertOctagon" size={14} className="shrink-0 mt-0.5" />
                    <span>{typesError}</span>
                  </div>
                ) : types.length === 0 ? (
                  <div className="p-4 rounded-lg border border-bd dark:border-dborder bg-light/50 dark:bg-dsidebar/30 text-center">
                    <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted flex items-center justify-center mx-auto mb-2">
                      <Icon name="Info" size={18} />
                    </div>
                    <p className="text-sm text-muted dark:text-dmuted">Não existem tipos activos disponíveis para registo.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                    {types.map((type, index) => {
                      const selected = form.tipo === String(type.id);
                      return (
                        <button
                          key={type.id}
                          type="button"
                          data-testid={`cid-tipo-${type.id}`}
                          onClick={() => setField('tipo', String(type.id))}
                          aria-pressed={selected}
                          className={`group relative p-3.5 rounded-xl border-2 flex flex-col items-start gap-2 transition-all text-left ${
                            selected
                              ? 'border-brand bg-blue-50/60 dark:bg-blue-950/30 shadow-sm ring-2 ring-brand/20'
                              : 'border-bd dark:border-dborder hover:border-brand/50 hover:shadow-sm hover:-translate-y-0.5'
                          }`}
                        >
                          {selected && (
                            <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-brand text-white flex items-center justify-center">
                              <Icon name="Check" size={10} />
                            </span>
                          )}
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            selected
                              ? 'bg-brand text-white'
                              : 'bg-blue-100 dark:bg-blue-950/60 text-brand dark:text-dblue'
                          }`}>
                            <Icon name={TYPE_ICONS[index % TYPE_ICONS.length]} size={18} />
                          </div>
                          <span className="text-xs font-semibold text-ink dark:text-dink leading-snug">{type.nome}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </Field>
            </>
          )}

          {/* ═══ SECÇÃO B — DESCRIÇÃO ═══ */}
          {section === 'B' && (
            <>
              <SectionTitle
                icon="FileText"
                accent="bg-gradient-to-b from-cyan-500 to-blue-500"
                title="Descrição do que observou"
                hint="Seja claro e objectivo — a informação é partilhada com as equipas de resposta."
              />
              <Field
                label="Título / descrição resumida"
                required
                hint="Escreva um resumo curto (5 a 100 caracteres)."
                htmlFor="cid-titulo"
                error={fieldErrors.titulo}
                errorTestId="titulo-error"
              >
                <input
                  id="cid-titulo"
                  data-testid="cid-titulo"
                  value={form.titulo}
                  onChange={event => setField('titulo', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.titulo)}
                  className={inputCls}
                  maxLength={100}
                  required
                />
              </Field>
              <Field
                label="Descrição detalhada"
                required
                hint="Descreva o que observou (10 a 1000 caracteres)."
                htmlFor="cid-descricao"
                error={fieldErrors.descricao}
                errorTestId="descricao-error"
              >
                <textarea
                  id="cid-descricao"
                  data-testid="cid-descricao"
                  rows={5}
                  value={form.descricao}
                  onChange={event => setField('descricao', event.target.value)}
                  aria-invalid={Boolean(fieldErrors.descricao)}
                  className={inputCls}
                  maxLength={1000}
                  required
                />
                <p className="text-[10px] text-muted dark:text-dmuted mt-1 text-right tabular-nums">
                  {form.descricao.length}/1000
                </p>
              </Field>
            </>
          )}

          {/* ═══ SECÇÃO C — LOCALIZAÇÃO ═══ */}
          {section === 'C' && (
            <>
              <SectionTitle
                icon="MapPin"
                accent="bg-gradient-to-b from-emerald-500 to-teal-500"
                title="Localização da ocorrência"
                hint="Indique a área geográfica ou as coordenadas exactas."
              />

              {fieldErrors.localizacao && (
                <div role="alert" data-testid="localizacao-error" className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-600 dark:text-red-300 inline-flex items-start gap-2">
                  <Icon name="AlertOctagon" size={14} className="shrink-0 mt-0.5" />
                  <span>{fieldErrors.localizacao}</span>
                </div>
              )}

              <GeographicComboboxes required value={form.geografia} errors={fieldErrors} onChange={geografia => {
                setForm(current => ({ ...current, geografia, provincia_id: geografia.provincia_id, distrito_id: geografia.distrito_id, provincia: geografia.provincia || '', distrito: geografia.distrito || '', endereco: geografia.endereco_referencia || current.endereco }));
                setFieldErrors(current => { const next = { ...current }; Object.keys(next).filter(key => key.endsWith('_id') || key === 'localizacao').forEach(key => delete next[key]); return next; });
              }} />

              <div className="flex flex-wrap gap-2 items-center pt-2">
                <Button type="button" variant="secondary" icon="Navigation" onClick={getDeviceLocation} disabled={geoLoading}>
                  {geoLoading ? 'A obter coordenadas…' : 'Usar a minha localização GPS'}
                </Button>
                {form.lat && form.lng && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-950/60 dark:text-green-300 border border-green-200/70 dark:border-green-800/60">
                    <Icon name="CheckCircle" size={12} /> {Number(form.lat).toFixed(4)}, {Number(form.lng).toFixed(4)}
                  </span>
                )}
              </div>

              <p className="text-xs text-muted dark:text-dmuted p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-bd dark:border-dborder inline-flex items-start gap-2">
                <Icon name="Info" size={12} className="shrink-0 mt-0.5" />
                As coordenadas só são obtidas após a sua autorização explícita. Pode marcar o local no mapa ou preencher a localização textual.
              </p>

              <Field label="Localização no mapa" hint="Clique no mapa para marcar o local exacto (opcional).">
                <div className="h-64 rounded-xl overflow-hidden mt-2 border border-bd dark:border-dborder">
                  <LocationPicker value={locationValue} onChange={coords => { setCoordinates(coords.lat, coords.lng); if (coords.label) setField('endereco', coords.label); }} height={256} />
                </div>
              </Field>

              <div className="grid md:grid-cols-2 gap-4">
                <Field label="Latitude" htmlFor="cid-lat" error={fieldErrors.latitude || fieldErrors.coordenadas}>
                  <input type="number" step="any" id="cid-lat" data-testid="cid-lat" value={form.lat} onChange={event => setField('lat', event.target.value)} className={inputCls} />
                </Field>
                <Field label="Longitude" htmlFor="cid-lng" error={fieldErrors.longitude}>
                  <input type="number" step="any" id="cid-lng" data-testid="cid-lng" value={form.lng} onChange={event => setField('lng', event.target.value)} className={inputCls} />
                </Field>
              </div>
            </>
          )}

          {/* ═══ SECÇÃO D — EVIDÊNCIAS ═══ */}
          {section === 'D' && (
            <>
              <SectionTitle
                icon="Upload"
                accent="bg-gradient-to-b from-purple-500 to-pink-500"
                title="Evidências"
                hint="Documente a ocorrência — se possível e em segurança."
              />

              <div className="rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/60 dark:bg-blue-950/30 p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-300 flex items-center justify-center shrink-0">
                    <Icon name="Upload" size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink dark:text-dink">Anexos disponíveis após o registo</p>
                    <p className="text-xs text-muted dark:text-dmuted mt-0.5">
                      Depois de registar a ocorrência, poderá anexar imagens JPG/PNG ou PDF (até 10 MB por ficheiro) na página de detalhes.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-amber-200 dark:border-amber-900/50 bg-amber-50 dark:bg-amber-950/20 p-3 inline-flex items-start gap-2">
                <Icon name="AlertTriangle" size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-100">
                  <strong className="font-semibold">Prioridade à sua segurança.</strong> Não coloque a sua integridade física em risco para obter evidências.
                </p>
              </div>
            </>
          )}

          {/* ═══ SECÇÃO E — CONFIRMAÇÃO ═══ */}
          {section === 'E' && (
            <>
              <SectionTitle
                icon="CheckCircle"
                accent="bg-gradient-to-b from-emerald-500 to-green-500"
                title="Confirmação final"
                hint="Reveja os dados e confirme antes de submeter."
              />

              <div className="p-4 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/50 space-y-2">
                <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700 dark:text-blue-300">Conta utilizada</p>
                <div className="flex items-center gap-2 text-sm text-ink dark:text-dink">
                  <Icon name="User" size={14} className="text-muted dark:text-dmuted" /> {user.name}
                </div>
                <div className="flex items-center gap-2 text-sm text-ink dark:text-dink">
                  <Icon name="Mail" size={14} className="text-muted dark:text-dmuted" /> {user.email}
                </div>
              </div>

              <label className="flex items-start gap-3 cursor-pointer p-3 rounded-xl border border-bd dark:border-dborder bg-light/40 dark:bg-dsidebar/30 hover:bg-light dark:hover:bg-dsidebar/50 transition-colors">
                <input
                  type="checkbox"
                  id="cid-confirm"
                  data-testid="cid-confirm"
                  checked={form.confirmed}
                  onChange={event => setField('confirmed', event.target.checked)}
                  aria-invalid={Boolean(fieldErrors.confirm)}
                  className="mt-0.5 w-4 h-4 rounded border-bd text-brand focus:ring-brand shrink-0"
                />
                <span className="text-sm text-ink dark:text-dink">
                  Confirmo que as informações prestadas são verdadeiras e correspondem ao que observei.
                </span>
              </label>
              {fieldErrors.confirm && (
                <p role="alert" data-testid="confirm-error" className="text-xs text-red-600 dark:text-red-400 inline-flex items-center gap-1">
                  <Icon name="AlertOctagon" size={12} /> {fieldErrors.confirm}
                </p>
              )}

              <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 inline-flex items-start gap-2">
                <Icon name="Info" size={14} className="text-muted dark:text-dmuted shrink-0 mt-0.5" />
                <p className="text-xs text-muted dark:text-dmuted">
                  A comunicação não confirma a mobilização de equipas. Em perigo imediato, contacte os serviços de emergência competentes.
                </p>
              </div>
            </>
          )}
        </Card>

        {/* ─── Navegação ──────────────────────────────────── */}
        <div className="mt-4 flex gap-2 justify-between flex-wrap">
          <Button
            type="button"
            variant="secondary"
            icon="ChevronLeft"
            disabled={section === 'A' || isSubmitting}
            onClick={() => setSection(SECTIONS[Math.max(0, SECTIONS.findIndex(item => item.id === section) - 1)].id)}
          >
            Anterior
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setPage('dashboard')} disabled={isSubmitting}>Cancelar</Button>
            {section !== 'E' ? (
              <Button
                type="button"
                icon="ChevronRight"
                onClick={() => setSection(SECTIONS[Math.min(SECTIONS.length - 1, SECTIONS.findIndex(item => item.id === section) + 1)].id)}
              >
                Seguinte
              </Button>
            ) : (
              <Button type="submit" icon="CheckCircle" id="cid-submit" data-testid="cid-submit" disabled={isSubmitting || !types.length}>
                {isSubmitting ? 'A submeter…' : 'Submeter ocorrência'}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

export default CidadaoComunicar;