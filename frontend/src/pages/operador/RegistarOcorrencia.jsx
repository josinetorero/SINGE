import React, { useMemo, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls } from '../../components/common/CommonComponents';
import { ApiError, ValidationError } from '../../services/api';
import { evidenciasService } from '../../services/evidenciasService';
import { operadorService } from '../../services/operadorService';
import { GeographicComboboxes } from '../../components/common/GeographicComboboxes';
import { LocationPicker } from '../../components/map/MapComponents';

const INITIAL = {
  titulo: '',
  descricao: '',
  tipo_ocorrencia_id: '',
  localizacao: '',
  latitude: '',
  longitude: '',
  origem: 'observacao_directa',
  comunicante_nome: '',
  comunicante_contacto: '',
  data_ocorrencia: '',
};

function Section({ icon, title, description, children }) {
  return (
    <section className="space-y-3 pt-4 border-t border-bd dark:border-dborder first:border-t-0 first:pt-0">
      <header>
        <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
          <Icon name={icon} size={15} className="text-muted" />
          {title}
        </h3>
        {description && (
          <p className="text-xs text-muted dark:text-dmuted mt-0.5">{description}</p>
        )}
      </header>
      {children}
    </section>
  );
}

export function RegistarOcorrencia({ types = [], onCreated, setPage }) {
  const [form, setForm] = useState(INITIAL);
  const [evidence, setEvidence] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [geografia, setGeografia] = useState({});

  const set = (key, value) => {
    setForm(current => ({ ...current, [key]: value }));
    setErrors(current => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const typesDisponiveis = useMemo(
    () => types.filter(type => type.ativo !== false),
    [types]
  );

  const submit = async event => {
    event.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    setErrors({});
    try {
      const payload = {
        ...form,
        localizacao: [geografia.provincia, geografia.distrito, geografia.municipio || geografia.posto_administrativo, geografia.bairro, geografia.quarteirao, geografia.endereco_referencia, form.localizacao].filter(Boolean).join(', '),
        referencia_geografica: geografia.provincia_id && geografia.distrito_id ? Object.fromEntries(
          Object.entries(geografia).filter(([key, value]) => key.endsWith('_id') && value).map(([key, value]) => [key, Number(value)])
        ) : undefined,
        tipo_ocorrencia_id: Number(form.tipo_ocorrencia_id),
        latitude: form.latitude === '' ? null : Number(form.latitude),
        longitude: form.longitude === '' ? null : Number(form.longitude),
        data_ocorrencia: form.data_ocorrencia || null,
        comunicante_nome: form.comunicante_nome || null,
        comunicante_contacto: form.comunicante_contacto || null,
      };
      const occurrence = await operadorService.registarOcorrencia(payload);
      let evidenceFailed = false;
      if (evidence) {
        try {
          await evidenciasService.anexar(occurrence.id, evidence);
        } catch {
          evidenceFailed = true;
        }
      }
      await onCreated?.(occurrence, evidenceFailed);
      setPage('ocorrencias');
      setForm(INITIAL);
      setEvidence(null);
      setGeografia({});
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.errors);
      } else if (error instanceof ApiError && error.status === 403) {
        setErrors({ geral: 'A sua conta não tem autorização para registar ocorrências institucionais.' });
      } else {
        setErrors({ geral: error.message || 'Não foi possível registar a ocorrência.' });
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {/* Header */}
      <header>
        <h2 className="text-xl font-bold text-ink dark:text-dink flex items-center gap-2">
          <Icon name="PlusCircle" size={22} className="text-brand" />
          Registar ocorrência institucional
        </h2>
        <p className="mt-1 text-sm text-muted dark:text-dmuted leading-relaxed">
          O responsável pelo registo será identificado pela sessão. A ocorrência ficará pendente de
          validação e sem prioridade atribuída.
        </p>
      </header>

      <Card className="p-5">
        <form className="space-y-5" onSubmit={submit} aria-busy={submitting}>
          {/* Erro geral */}
          {errors.geral && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30 p-3 text-sm text-red-800 dark:text-red-200"
            >
              <Icon name="AlertCircle" size={16} className="mt-0.5 shrink-0" />
              <p>{errors.geral}</p>
            </div>
          )}

          {/* Localização geográfica (componente externo) */}
          <Section
            icon="MapPin"
            title="Localização geográfica"
            description="Seleccione província, distrito e restantes níveis administrativos."
          >
            <GeographicComboboxes value={geografia} errors={errors} onChange={setGeografia} />
          </Section>

          {/* Classificação */}
          <Section
            icon="Tag"
            title="Classificação"
            description="Tipo de ocorrência e origem da informação."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tipo de ocorrência" required error={errors.tipo_ocorrencia_id}>
                <select
                  aria-label="Tipo de ocorrência"
                  className={inputCls}
                  value={form.tipo_ocorrencia_id}
                  onChange={event => set('tipo_ocorrencia_id', event.target.value)}
                  required
                >
                  <option value="">Seleccionar tipo</option>
                  {typesDisponiveis.map(type => (
                    <option key={type.id} value={type.id}>{type.nome}</option>
                  ))}
                </select>
              </Field>
              <Field label="Origem da informação" required error={errors.origem}>
                <select
                  aria-label="Origem da informação"
                  className={inputCls}
                  value={form.origem}
                  onChange={event => set('origem', event.target.value)}
                >
                  <option value="observacao_directa">Observação directa</option>
                  <option value="telefone">Comunicação telefónica</option>
                  <option value="instituicao">Outra instituição</option>
                  <option value="autoridades_locais">Autoridades locais</option>
                  <option value="outra">Outra fonte</option>
                </select>
              </Field>
            </div>
          </Section>

          {/* Posição no mapa */}
          <Section
            icon="Map"
            title="Posição no mapa"
            description="Opcional: pesquise uma referência ou marque a posição exacta."
          >
            <div className="rounded-lg overflow-hidden border border-bd dark:border-dborder">
              <LocationPicker
                value={{
                  lat: form.latitude ? Number(form.latitude) : null,
                  lng: form.longitude ? Number(form.longitude) : null,
                }}
                onChange={point =>
                  setForm(current => ({
                    ...current,
                    latitude: String(point.lat),
                    longitude: String(point.lng),
                    ...(point.label ? { localizacao: point.label } : {}),
                  }))
                }
                height={240}
              />
            </div>
          </Section>

          {/* Detalhes */}
          <Section
            icon="FileText"
            title="Detalhes da ocorrência"
            description="Título, descrição e momento do acontecimento."
          >
            <Field label="Título" required error={errors.titulo}>
              <input
                aria-label="Título"
                className={inputCls}
                value={form.titulo}
                onChange={event => set('titulo', event.target.value)}
                required
                maxLength={150}
              />
            </Field>
            <Field label="Descrição detalhada" required error={errors.descricao}>
              <textarea
                aria-label="Descrição detalhada"
                className={inputCls}
                rows={4}
                value={form.descricao}
                onChange={event => set('descricao', event.target.value)}
                required
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Localização" required error={errors.localizacao}>
                <input
                  aria-label="Localização"
                  className={inputCls}
                  value={form.localizacao}
                  onChange={event => set('localizacao', event.target.value)}
                  required
                  maxLength={255}
                  placeholder="Localidade, distrito, referência"
                />
              </Field>
              <Field label="Data e hora do acontecimento" error={errors.data_ocorrencia}>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={form.data_ocorrencia}
                  onChange={event => set('data_ocorrencia', event.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* Coordenadas */}
          <Section
            icon="Crosshair"
            title="Coordenadas (opcional)"
            description="Preenchidas automaticamente pela posição no mapa. Pode ajustar manualmente."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Latitude" error={errors.latitude}>
                <input
                  type="number"
                  step="any"
                  min="-90"
                  max="90"
                  className={inputCls}
                  value={form.latitude}
                  onChange={event => set('latitude', event.target.value)}
                />
              </Field>
              <Field label="Longitude" error={errors.longitude}>
                <input
                  type="number"
                  step="any"
                  min="-180"
                  max="180"
                  className={inputCls}
                  value={form.longitude}
                  onChange={event => set('longitude', event.target.value)}
                />
              </Field>
            </div>
          </Section>

          {/* Comunicação */}
          <Section
            icon="User"
            title="Comunicação"
            description="Dados opcionais do comunicante."
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Nome do comunicante (opcional)" error={errors.comunicante_nome}>
                <input
                  className={inputCls}
                  value={form.comunicante_nome}
                  onChange={event => set('comunicante_nome', event.target.value)}
                  maxLength={150}
                  autoComplete="name"
                />
              </Field>
              <Field label="Contacto do comunicante (opcional)" error={errors.comunicante_contacto}>
                <input
                  className={inputCls}
                  value={form.comunicante_contacto}
                  onChange={event => set('comunicante_contacto', event.target.value)}
                  maxLength={80}
                  autoComplete="tel"
                />
              </Field>
            </div>
          </Section>

          {/* Evidência */}
          <Section
            icon="Paperclip"
            title="Evidência"
            description="Opcional — JPG, PNG ou PDF até 10 MB."
          >
            <Field error={errors.ficheiro}>
              <label
                htmlFor="registar-evidencia"
                className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-bd dark:border-dborder bg-lblue/20 dark:bg-dblue/5 px-4 py-6 cursor-pointer hover:bg-lblue/40 dark:hover:bg-dblue/10 transition-colors"
              >
                <span className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                  <Icon name="Upload" size={18} />
                </span>
                {evidence ? (
                  <span className="text-sm font-medium text-ink dark:text-dink inline-flex items-center gap-1.5">
                    <Icon name="Paperclip" size={14} />
                    {evidence.name}
                    <span className="text-muted dark:text-dmuted font-normal">
                      · {(evidence.size / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </span>
                ) : (
                  <>
                    <span className="text-sm font-medium text-ink dark:text-dink">
                      Clique para anexar ficheiro
                    </span>
                    <span className="text-xs text-muted dark:text-dmuted">
                      JPG, PNG ou PDF até 10 MB
                    </span>
                  </>
                )}
                <input
                  id="registar-evidencia"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="sr-only"
                  onChange={event => setEvidence(event.target.files?.[0] || null)}
                />
              </label>
              {evidence && (
                <button
                  type="button"
                  onClick={() => setEvidence(null)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                >
                  <Icon name="X" size={12} />
                  Remover ficheiro
                </button>
              )}
            </Field>
          </Section>

          {/* Acções */}
          <div className="flex flex-wrap justify-end gap-2 pt-3 border-t border-bd dark:border-dborder">
            <Button type="button" variant="secondary" onClick={() => setPage('ocorrencias')}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting || types.length === 0}>
              {submitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  A registar…
                </span>
              ) : (
                'Registar ocorrência'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export default RegistarOcorrencia;