import React, { useEffect, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, Timeline, EmptyState, Field, inputCls } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { useToast } from '../../contexts/ToastContext';
import { ValidationError } from '../../services/api';
import { validacoesService } from '../../services/validacoesService';
import { ocorrenciasService } from '../../services/ocorrenciasService';
import { operadorService } from '../../services/operadorService';

const STATE_LABELS = {
  registada: 'Registada',
  em_avaliacao: 'Em avaliação',
  em_atendimento: 'Em atendimento',
  resolvida: 'Resolvida',
  cancelada: 'Cancelada',
};

const VALIDATION_LABELS = {
  PENDENTE: 'Pendente',
  EM_VERIFICACAO: 'Em verificação',
  VALIDADA: 'Validada',
  NAO_CONFIRMADA: 'Não confirmada',
  REJEITADA: 'Rejeitada',
  DUPLICADA: 'Duplicada',
};

const NEGATIVE_VALIDATIONS = ['NAO_CONFIRMADA', 'REJEITADA'];

// Cor do marcador de validação
const VALIDATION_TONE = {
  VALIDADA:       'bg-emerald-500',
  NAO_CONFIRMADA: 'bg-amber-500',
  REJEITADA:      'bg-red-500',
  DUPLICADA:      'bg-slate-400',
  EM_VERIFICACAO: 'bg-blue-500',
  PENDENTE:       'bg-slate-400',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? '—'
    : new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export function DetalheOcorrencia({ o, loading, error, onRefresh, onValidationSaved, onDownloadEvidence, setPage }) {
  const toast = useToast();
  const [validationState, setValidationState] = useState('VALIDADA');
  const [reason, setReason] = useState('');
  const [observations, setObservations] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [downloadError, setDownloadError] = useState('');
  const [editingDescription, setEditingDescription] = useState(false);
  const [description, setDescription] = useState(o?.descricao || '');
  const [suggestions, setSuggestions] = useState(null);
  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [descriptionSaving, setDescriptionSaving] = useState(false);

  useEffect(() => {
    setDescription(o?.descricao || '');
    setEditingDescription(false);
    setSuggestions(null);
  }, [o?.id, o?.descricao]);

  const loadDescriptionSuggestions = async () => {
    setSuggestionLoading(true);
    try {
      setSuggestions(await operadorService.sugerirComplementos(o.id));
    } catch (suggestionError) {
      toast.error(suggestionError.message || 'Não foi possível obter sugestões.');
    } finally {
      setSuggestionLoading(false);
    }
  };

  const saveDescription = async () => {
    setDescriptionSaving(true);
    try {
      await ocorrenciasService.atualizarDescricao(o.id, description.trim());
      await onRefresh?.();
      setEditingDescription(false);
      toast.success('Descrição actualizada.');
    } catch (saveError) {
      toast.error(saveError.message || 'Não foi possível actualizar a descrição.');
    } finally {
      setDescriptionSaving(false);
    }
  };

  const submitValidation = async (event) => {
    event.preventDefault();
    if (!o || submitting) return;
    setFieldErrors({});
    setSubmitting(true);
    try {
      await validacoesService.registar({
        ocorrencia_id: o.id,
        estado: validationState,
        motivo: reason.trim(),
        observacoes: observations.trim(),
      });
      setReason('');
      setObservations('');
      await onValidationSaved?.();
      toast.success('Validação registada pelo servidor.');
    } catch (validationError) {
      if (validationError instanceof ValidationError) {
        setFieldErrors(validationError.errors);
      }
      toast.error(validationError.message || 'Não foi possível registar a validação.');
    } finally {
      setSubmitting(false);
    }
  };

  const downloadEvidence = async (evidence) => {
    setDownloadError('');
    try {
      await onDownloadEvidence(evidence);
    } catch (downloadFailure) {
      setDownloadError(downloadFailure.message || 'Não foi possível descarregar a evidência.');
    }
  };

  // ---------- Estados de carregamento / erro / vazio ----------
  if (loading && !o) {
    return (
      <Card className="p-6 space-y-3" aria-busy="true">
        <div className="h-4 w-32 rounded bg-lblue/40 dark:bg-dblue/20 animate-pulse" />
        <div className="h-6 w-2/3 rounded bg-lblue/40 dark:bg-dblue/20 animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-lblue/40 dark:bg-dblue/20 animate-pulse" />
      </Card>
    );
  }

  if (error && !o) {
    return (
      <div role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200 flex items-start gap-3">
        <Icon name="AlertCircle" size={18} className="mt-0.5 shrink-0" />
        <div className="flex-1">
          <p>{error}</p>
          <button type="button" onClick={onRefresh} className="mt-2 text-xs font-medium underline hover:no-underline">
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!o) {
    return (
      <EmptyState
        icon="FileText"
        title="Nenhuma ocorrência seleccionada"
        description="Escolha uma ocorrência na lista para ver os detalhes."
        action={<Button onClick={() => setPage('ocorrencias')}>Voltar à lista</Button>}
      />
    );
  }

  // ---------- Derivados ----------
  const location = o.localizacao_geografica || {};
  const mapOccurrence = {
    lat: Number(o.latitude ?? location.latitude),
    lng: Number(o.longitude ?? location.longitude),
    prioridade: null,
  };
  const historyItems = (o.historico || []).map(item => ({
    data: formatDate(item.created_at),
    txt: [
      item.estado_novo ? `Estado: ${STATE_LABELS[item.estado_novo] || item.estado_novo}` : '',
      item.observacoes || '',
      item.utilizador_nome ? `Por ${item.utilizador_nome}` : '',
    ].filter(Boolean).join(' — ') || 'Registo de histórico',
  }));
  const latestValidation = o.validacoes?.[0];
  const requiresReason = NEGATIVE_VALIDATIONS.includes(validationState);
  const locationLine =
    [o.localizacao, location.endereco_referencia, location.distrito, location.provincia]
      .filter(Boolean)
      .join(', ') || 'Localização não disponível';

  return (
    <div className="space-y-4">
      {/* Voltar */}
      <button
        type="button"
        onClick={() => setPage('ocorrencias')}
        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-brand dark:text-dblue hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors"
        aria-label="Voltar à lista de ocorrências"
      >
        <Icon name="ChevronLeft" size={16} />
        Voltar às ocorrências
      </button>

      {/* Aviso de erro recuperável */}
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-100 flex items-start gap-3"
        >
          <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button type="button" onClick={onRefresh} className="shrink-0 text-xs font-medium underline hover:no-underline">
            Actualizar
          </button>
        </div>
      )}

      {/* Header */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-mono text-xs font-bold text-muted dark:text-dmuted">
              Ocorrência #{o.id}
            </p>
            <h1 className="text-xl font-bold text-ink dark:text-dink mt-1">{o.titulo}</h1>
            <p className="text-sm text-muted dark:text-dmuted mt-0.5 flex items-center gap-1.5">
              <Icon name="Tag" size={12} />
              {o.tipo_ocorrencia?.nome || 'Tipo não informado'} · {formatDate(o.created_at)}
            </p>
          </div>
          <StatusBadge s={STATE_LABELS[o.estado] || o.estado} />
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Coluna principal */}
        <div className="lg:col-span-2 space-y-4">
          {/* Descrição */}
          <Card className="p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <Icon name="FileText" size={16} className="text-muted" />
                Descrição e localização
              </h2>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={loadDescriptionSuggestions}
                  disabled={suggestionLoading}
                >
                  {suggestionLoading ? 'A analisar…' : 'Sugestões da IA'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingDescription(value => !value)}
                >
                  {editingDescription ? 'Cancelar edição' : 'Editar descrição'}
                </Button>
              </div>
            </div>

            {editingDescription ? (
              <>
                <textarea
                  aria-label="Descrição da ocorrência"
                  className={inputCls}
                  rows={6}
                  value={description}
                  onChange={event => setDescription(event.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={saveDescription}
                    disabled={descriptionSaving || !description.trim()}
                  >
                    {descriptionSaving ? 'A guardar…' : 'Guardar descrição'}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-ink dark:text-dink whitespace-pre-wrap leading-relaxed">
                {o.descricao || 'Sem descrição registada.'}
              </p>
            )}

            {suggestions && (
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon name="Sparkles" size={15} className="text-blue-600 dark:text-blue-300" />
                  <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-200">
                    Complementos sugeridos
                  </h3>
                </div>
                <p className="text-xs text-blue-800/80 dark:text-blue-300/80">{suggestions.aviso}</p>
                {suggestions.sugestoes?.length ? (
                  <div className="space-y-2">
                    {suggestions.sugestoes.map((item, index) => (
                      <article
                        key={`${item.relatos_ids.join('-')}-${index}`}
                        className="rounded-lg bg-white/60 dark:bg-dcard/60 p-3"
                      >
                        <p className="text-sm text-ink dark:text-dink">{item.texto}</p>
                        <p className="mt-1 text-xs text-muted dark:text-dmuted">
                          Relatos #{item.relatos_ids.join(', #')} · {item.justificacao}
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="mt-2"
                          onClick={() => {
                            setDescription(current =>
                              `${current.trim()}${current.trim() ? '\n\n' : ''}${item.texto}`
                            );
                            setEditingDescription(true);
                          }}
                        >
                          Adicionar ao rascunho
                        </Button>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-ink dark:text-dink">Sem complementos adicionais.</p>
                )}
              </div>
            )}

            <div className="flex items-start gap-2 text-sm text-muted dark:text-dmuted border-t border-bd dark:border-dborder pt-3">
              <Icon name="MapPin" size={14} className="mt-0.5 shrink-0" />
              <span>{locationLine}</span>
            </div>

            <div className="border-t border-bd dark:border-dborder pt-3">
              <p className="text-xs uppercase tracking-wide font-semibold text-muted dark:text-dmuted">
                Comunicante
              </p>
              <p className="text-sm font-medium text-ink dark:text-dink mt-0.5">
                {o.comunicante?.name || 'Dados não disponíveis'}
              </p>
              {o.comunicante?.email && (
                <p className="text-sm text-muted dark:text-dmuted">{o.comunicante.email}</p>
              )}
            </div>
          </Card>

          {/* Histórico */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <Icon name="History" size={16} className="text-muted" />
                Histórico da ocorrência
              </h2>
              <span className="text-xs font-semibold rounded-full bg-light dark:bg-dsidebar px-2 py-0.5 text-muted dark:text-dmuted">
                {historyItems.length} evento{historyItems.length === 1 ? '' : 's'}
              </span>
            </div>
            {historyItems.length ? (
              <Timeline items={historyItems} />
            ) : (
              <p className="text-sm text-muted dark:text-dmuted">
                Não há alterações registadas no histórico.
              </p>
            )}
          </Card>

          {/* Validações */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <Icon name="CheckSquare" size={16} className="text-muted" />
                Validações registadas
              </h2>
              <span className="text-xs font-semibold rounded-full bg-light dark:bg-dsidebar px-2 py-0.5 text-muted dark:text-dmuted">
                {o.validacoes?.length || 0}
              </span>
            </div>

            {latestValidation && (
              <div className="mb-3 rounded-lg bg-light dark:bg-dsidebar/40 p-3 text-sm flex items-center gap-2">
                <Icon name="Info" size={14} className="text-muted shrink-0" />
                <p className="text-ink dark:text-dink">
                  Estado mais recente:{' '}
                  <strong>{VALIDATION_LABELS[latestValidation.estado] || latestValidation.estado}</strong>
                </p>
              </div>
            )}

            {o.validacoes?.length ? (
              <ol className="space-y-3">
                {o.validacoes.map(validation => {
                  const tone = VALIDATION_TONE[validation.estado] || 'bg-brand';
                  return (
                    <li key={validation.id} className="relative pl-5">
                      <span
                        className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ${tone}`}
                        aria-hidden="true"
                      />
                      <p className="text-sm font-medium text-ink dark:text-dink">
                        {VALIDATION_LABELS[validation.estado] || validation.estado}
                      </p>
                      <p className="text-xs text-muted dark:text-dmuted">
                        {formatDate(validation.data_validacao || validation.created_at)}
                        {validation.utilizador_nome ? ` · ${validation.utilizador_nome}` : ''}
                      </p>
                      {validation.motivo && (
                        <p className="text-sm text-ink dark:text-dink mt-1">{validation.motivo}</p>
                      )}
                      {validation.observacoes && (
                        <p className="text-sm text-muted dark:text-dmuted mt-1">{validation.observacoes}</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            ) : (
              <p className="text-sm text-muted dark:text-dmuted">Ainda não existem validações.</p>
            )}
          </Card>

          {/* Evidências */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
                <Icon name="Paperclip" size={16} className="text-muted" />
                Evidências
              </h2>
              <span className="text-xs font-semibold rounded-full bg-light dark:bg-dsidebar px-2 py-0.5 text-muted dark:text-dmuted">
                {o.evidencias?.length || 0}
              </span>
            </div>
            {o.evidencias?.length ? (
              <ul className="divide-y divide-bd dark:divide-dborder">
                {o.evidencias.map(evidence => (
                  <li key={evidence.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-lg bg-lblue/50 dark:bg-dblue/30 flex items-center justify-center text-brand dark:text-blue-300 shrink-0">
                        <Icon name="File" size={15} />
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-ink dark:text-dink truncate">{evidence.nome_ficheiro}</p>
                        <p className="text-xs text-muted dark:text-dmuted truncate">
                          {evidence.descricao || evidence.tipo_mime}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => downloadEvidence(evidence)}
                      aria-label={`Descarregar ${evidence.nome_ficheiro}`}
                      className="shrink-0 p-2 rounded-md text-brand dark:text-dblue hover:bg-lblue dark:hover:bg-dsidebar transition-colors"
                    >
                      <Icon name="Download" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted dark:text-dmuted">Não existem evidências anexadas.</p>
            )}
            {downloadError && (
              <p role="alert" className="mt-2 text-sm text-red-700 dark:text-red-300">{downloadError}</p>
            )}
          </Card>

          {/* Registo de validação */}
          <Card className="p-5">
            <h2 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
              <Icon name="ShieldCheck" size={16} className="text-brand" />
              Registar validação
            </h2>
            <p className="text-xs text-muted dark:text-dmuted mt-1 mb-4 leading-relaxed">
              A identidade e a data são registadas pelo servidor. Esta acção não altera a prioridade
              nem o estado operacional.
            </p>
            <form onSubmit={submitValidation} className="space-y-4" aria-busy={submitting}>
              <Field label="Resultado" required error={fieldErrors.estado}>
                <select
                  value={validationState}
                  onChange={event => {
                    setValidationState(event.target.value);
                    setFieldErrors(current => ({ ...current, estado: undefined, motivo: undefined }));
                  }}
                  className={inputCls}
                >
                  <option value="VALIDADA">Validada</option>
                  <option value="NAO_CONFIRMADA">Não confirmada</option>
                  <option value="REJEITADA">Rejeitada</option>
                </select>
              </Field>

              {requiresReason && (
                <Field label="Motivo" required error={fieldErrors.motivo}>
                  <textarea
                    value={reason}
                    onChange={event => setReason(event.target.value)}
                    className={inputCls}
                    rows={3}
                    required
                  />
                </Field>
              )}

              <Field label="Observações" error={fieldErrors.observacoes}>
                <textarea
                  value={observations}
                  onChange={event => setObservations(event.target.value)}
                  className={inputCls}
                  rows={3}
                />
              </Field>

              {fieldErrors.geral && (
                <p role="alert" className="text-sm text-red-700 dark:text-red-300">{fieldErrors.geral}</p>
              )}

              <div className="flex justify-end pt-2 border-t border-bd dark:border-dborder">
                <Button type="submit" icon="CheckCircle" disabled={submitting}>
                  {submitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                      A registar…
                    </span>
                  ) : (
                    'Registar validação'
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>

        {/* Coluna lateral */}
        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-ink dark:text-dink mb-3 flex items-center gap-2">
              <Icon name="Map" size={16} className="text-muted" />
              Localização geográfica
            </h2>
            <div className="h-48 rounded-lg overflow-hidden border border-bd dark:border-dborder">
              <MozambiqueMap ocorrencias={[mapOccurrence]} height={192} />
            </div>
            <p className="text-xs text-muted dark:text-dmuted mt-2 flex items-start gap-1.5">
              <Icon name="MapPin" size={12} className="mt-0.5 shrink-0" />
              <span>{location.endereco_referencia || o.localizacao || 'Localização não disponível'}</span>
            </p>
          </Card>
        </aside>
      </div>
    </div>
  );
}

export default DetalheOcorrencia;