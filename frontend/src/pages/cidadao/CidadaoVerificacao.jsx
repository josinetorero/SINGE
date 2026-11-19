import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls, StatusBadge } from '../../components/common/CommonComponents';
import { identidadeService } from '../../services/identidadeService';
import { ValidationError } from '../../services/api';

const STATE_LABEL = {
  NAO_SUBMETIDA: 'Não submetida',
  PENDENTE: 'Pendente',
  EM_ANALISE: 'Em análise',
  APROVADA: 'Aprovada',
  REJEITADA: 'Rejeitada',
  CORRECAO_NECESSARIA: 'Necessita de correcção',
};

// Metadados visuais por estado
const STATE_META = {
  NAO_SUBMETIDA:       { icon: 'FileText',      cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  PENDENTE:            { icon: 'Clock',         cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
  EM_ANALISE:          { icon: 'Search',        cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
  APROVADA:            { icon: 'CheckCircle2',  cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300' },
  REJEITADA:           { icon: 'XCircle',       cls: 'bg-red-100 text-red-700 dark:bg-red-950/40 dark:text-red-300' },
  CORRECAO_NECESSARIA: { icon: 'AlertTriangle', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300' },
};

const getMeta = (estado) => STATE_META[estado] || STATE_META.NAO_SUBMETIDA;

const STEPS = [
  { key: 'NAO_SUBMETIDA', label: 'Submissão' },
  { key: 'EM_ANALISE',    label: 'Análise' },
  { key: 'APROVADA',      label: 'Aprovação' },
];

// Índice do passo actual na timeline
function stepIndex(estado) {
  if (estado === 'APROVADA') return 2;
  if (estado === 'EM_ANALISE' || estado === 'PENDENTE') return 1;
  if (estado === 'REJEITADA' || estado === 'CORRECAO_NECESSARIA') return 1;
  return 0;
}

// Ícone por tipo de ficheiro
function fileIcon(name = '') {
  const lower = name.toLowerCase();
  if (lower.endsWith('.pdf')) return 'FileText';
  if (/\.(jpe?g|png)$/.test(lower)) return 'Image';
  return 'File';
}

export function CidadaoVerificacao({ onEligibilityChange }) {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [form, setForm] = useState({
    tipo_documento: 'BI',
    numero_documento: '',
    nome_documento: '',
    data_validade: '',
    ficheiro: null,
  });

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await identidadeService.minha();
      setStatus(result);
      onEligibilityChange?.(Boolean(result.elegivel));
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível consultar a verificação.');
    } finally {
      setLoading(false);
    }
  }, [onEligibilityChange]);

  useEffect(() => { refresh(); }, [refresh]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.ficheiro) {
      setError('Seleccione uma fotografia ou digitalização do documento.');
      return;
    }
    if (
      !['application/pdf', 'image/jpeg', 'image/png'].includes(form.ficheiro.type) ||
      form.ficheiro.size > 10 * 1024 * 1024
    ) {
      setError('Envie um PDF, JPG ou PNG válido até 10 MB.');
      return;
    }
    if (!form.numero_documento.trim()) {
      setFieldErrors({ numero_documento: 'Indique o número apresentado no documento.' });
      return;
    }
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      const document = await identidadeService.submeterDocumento(form);
      await identidadeService.solicitarVerificacao(document.id);
      await refresh();
      setForm(current => ({
        ...current,
        numero_documento: '',
        nome_documento: '',
        data_validade: '',
        ficheiro: null,
      }));
    } catch (requestError) {
      const message = requestError.message || 'Não foi possível submeter os documentos.';
      if (requestError instanceof ValidationError) setFieldErrors(requestError.errors);
      await refresh();
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  const canResubmit =
    !status || ['NAO_SUBMETIDA', 'REJEITADA', 'CORRECAO_NECESSARIA'].includes(status.estado);

  const requestReview = async (documentId) => {
    setSaving(true);
    setError('');
    try {
      await identidadeService.solicitarVerificacao(documentId);
      await refresh();
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível pedir a análise do documento.');
    } finally {
      setSaving(false);
    }
  };

  const meta = getMeta(status?.estado);
  const currentStep = stepIndex(status?.estado);
  const isRejected = ['REJEITADA', 'CORRECAO_NECESSARIA'].includes(status?.estado);

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-ink dark:text-dink flex items-center gap-2">
          <Icon name="ShieldCheck" size={24} className="text-brand" />
          Verificação de identidade
        </h1>
        <p className="mt-1 text-sm text-muted dark:text-dmuted leading-relaxed">
          A identidade aprovada habilita o registo de ocorrências através da sua conta. Situações
          urgentes podem continuar a ser registadas pelo Operador.
        </p>
      </header>

      {/* Alerta de erro */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
        >
          <Icon name="AlertCircle" size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{error}</p>
          <button
            type="button"
            onClick={refresh}
            className="shrink-0 text-xs font-medium underline hover:no-underline"
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Card de estado */}
      <Card className="p-6 rounded-xl shadow-sm space-y-5">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <span
              className={`w-10 h-10 rounded-full flex items-center justify-center ${meta.cls}`}
              aria-hidden="true"
            >
              <Icon name={meta.icon} size={20} />
            </span>
            <div>
              <h2 className="font-semibold text-ink dark:text-dink">Estado do pedido</h2>
              <p className="text-xs text-muted dark:text-dmuted">
                {status ? STATE_LABEL[status.estado] || status.estado : 'A consultar…'}
              </p>
            </div>
          </div>
          {status && <StatusBadge s={STATE_LABEL[status.estado] || status.estado} />}
        </div>

        {/* Timeline */}
        {status && (
          <ol className="flex items-center gap-1" aria-label="Progresso da verificação">
            {STEPS.map((step, i) => {
              const done = i < currentStep;
              const active = i === currentStep;
              const failed = isRejected && i === currentStep;
              return (
                <li key={step.key} className="flex-1 flex items-center">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold border-2 transition-colors ${
                        failed
                          ? 'bg-red-100 border-red-500 text-red-700 dark:bg-red-950/40 dark:border-red-500 dark:text-red-300'
                          : done
                          ? 'bg-emerald-500 border-emerald-500 text-white'
                          : active
                          ? 'bg-brand/10 border-brand text-brand dark:bg-brand/20'
                          : 'bg-surface border-bd text-muted dark:bg-dsurface dark:border-dborder dark:text-dmuted'
                      }`}
                      aria-current={active ? 'step' : undefined}
                    >
                      {done ? (
                        <Icon name="Check" size={14} />
                      ) : failed ? (
                        <Icon name="X" size={14} />
                      ) : (
                        i + 1
                      )}
                    </div>
                    <span
                      className={`text-[11px] font-medium text-center ${
                        active || done ? 'text-ink dark:text-dink' : 'text-muted dark:text-dmuted'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 -mt-5 rounded ${
                        i < currentStep ? 'bg-emerald-500' : 'bg-bd dark:bg-dborder'
                      }`}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {/* Mensagem contextual */}
        <div className="pt-1">
          {loading ? (
            <div role="status" aria-live="polite" className="flex items-center gap-2 text-sm text-muted dark:text-dmuted">
              <span className="w-4 h-4 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              A consultar o estado…
            </div>
          ) : status?.elegivel ? (
            <div className="flex items-start gap-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 p-3 text-sm text-emerald-800 dark:text-emerald-300">
              <Icon name="CheckCircle2" size={16} className="mt-0.5 shrink-0" />
              <p>Identidade aprovada. Já pode comunicar ocorrências com a sua conta.</p>
            </div>
          ) : status?.estado === 'EM_ANALISE' || status?.estado === 'PENDENTE' ? (
            <div className="flex items-start gap-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/20 p-3 text-sm text-blue-800 dark:text-blue-300">
              <Icon name="Clock" size={16} className="mt-0.5 shrink-0" />
              <p>
                O pedido está em análise pelas equipas autorizadas. Poderá consultar alertas e
                acompanhar ocorrências entretanto.
              </p>
            </div>
          ) : isRejected ? (
            <div className="flex items-start gap-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/20 p-3 text-sm text-amber-900 dark:text-amber-100">
              <Icon name="AlertTriangle" size={16} className="mt-0.5 shrink-0" />
              <div>
                <strong>É necessária correcção.</strong>
                <p className="mt-0.5">
                  {status.motivo_rejeicao ||
                    'Reveja a imagem e os dados do documento e submeta novamente.'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-2.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-700 dark:text-slate-300">
              <Icon name="FileText" size={16} className="mt-0.5 shrink-0" />
              <p>Ainda não submeteu documentos de identificação.</p>
            </div>
          )}
        </div>
      </Card>

      {/* Documentos submetidos */}
      {status?.documentos?.length > 0 && (
        <Card className="p-6 rounded-xl shadow-sm">
          <h2 className="mb-3 font-semibold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="Files" size={18} className="text-muted dark:text-dmuted" />
            Documentos submetidos
          </h2>
          <ul className="divide-y divide-bd dark:divide-dborder">
            {status.documentos.map((document) => {
              const docMeta = getMeta(document.estado_verificacao);
              return (
                <li
                  key={document.id}
                  className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <span className="w-9 h-9 rounded-lg bg-lblue/50 dark:bg-dblue/30 flex items-center justify-center text-brand dark:text-blue-300 shrink-0">
                      <Icon name="FileText" size={16} />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink dark:text-dink">
                        {document.tipo_documento} ·{' '}
                        <span className="font-mono text-muted dark:text-dmuted">
                          {document.numero_documento_mascarado || 'Número protegido'}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 flex-wrap mt-1">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${docMeta.cls}`}
                        >
                          <Icon name={docMeta.icon} size={10} />
                          {STATE_LABEL[document.estado_verificacao] || document.estado_verificacao}
                        </span>
                        <span className="text-[11px] text-muted dark:text-dmuted inline-flex items-center gap-1">
                          <Icon
                            name={document.ficheiro_submetido ? 'Check' : 'X'}
                            size={10}
                            className={document.ficheiro_submetido ? 'text-emerald-600' : 'text-red-500'}
                          />
                          Ficheiro {document.ficheiro_submetido ? 'recebido' : 'em falta'}
                        </span>
                      </div>
                    </div>
                  </div>
                  {document.ficheiro_submetido && !document.verificacoes?.length && (
                    <Button
                      variant="secondary"
                      disabled={saving}
                      onClick={() => requestReview(document.id)}
                      className="shrink-0"
                    >
                      Pedir análise
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </Card>
      )}

      {/* Formulário de submissão */}
      {canResubmit && (
        <Card className="p-6 rounded-xl shadow-sm">
          <h2 className="mb-4 font-semibold text-ink dark:text-dink flex items-center gap-2">
            <Icon name="Upload" size={18} className="text-brand" />
            Submeter documento
          </h2>
          <form className="space-y-5" onSubmit={submit} aria-busy={saving}>
            {/* Secção: Dados do documento */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-dmuted mb-3">
                Dados do documento
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Tipo de documento" htmlFor="identity-type" required>
                  <select
                    id="identity-type"
                    className={inputCls}
                    value={form.tipo_documento}
                    onChange={event => setForm({ ...form, tipo_documento: event.target.value })}
                  >
                    <option>BI</option>
                    <option>Passaporte</option>
                  </select>
                </Field>
                <Field
                  label="Número do documento"
                  htmlFor="identity-number"
                  required
                  error={fieldErrors.numero_documento}
                >
                  <input
                    id="identity-number"
                    className={inputCls}
                    required
                    maxLength={100}
                    value={form.numero_documento}
                    onChange={event => setForm({ ...form, numero_documento: event.target.value })}
                  />
                </Field>
                <Field
                  label="Nome indicado no documento"
                  htmlFor="identity-name"
                  error={fieldErrors.nome_documento}
                >
                  <input
                    id="identity-name"
                    className={inputCls}
                    maxLength={150}
                    value={form.nome_documento}
                    onChange={event => setForm({ ...form, nome_documento: event.target.value })}
                  />
                </Field>
                <Field
                  label="Data de validade (quando aplicável)"
                  htmlFor="identity-expiry"
                  error={fieldErrors.data_validade}
                >
                  <input
                    id="identity-expiry"
                    className={inputCls}
                    type="date"
                    value={form.data_validade}
                    onChange={event => setForm({ ...form, data_validade: event.target.value })}
                  />
                </Field>
              </div>
            </div>

            {/* Secção: Ficheiro */}
            <div className="pt-2 border-t border-bd dark:border-dborder">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-dmuted mb-3 mt-4">
                Ficheiro
              </h3>
              <Field
                label="Fotografia ou digitalização (PDF, JPG ou PNG; máximo 10 MB)"
                htmlFor="identity-file"
                required
                error={fieldErrors.ficheiro}
              >
                <label
                  htmlFor="identity-file"
                  className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-bd dark:border-dborder bg-lblue/20 dark:bg-dblue/5 px-4 py-6 cursor-pointer hover:bg-lblue/40 dark:hover:bg-dblue/10 transition-colors"
                >
                  <span className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center">
                    <Icon name="Upload" size={18} />
                  </span>
                  {form.ficheiro ? (
                    <span className="text-sm text-ink dark:text-dink font-medium inline-flex items-center gap-1.5">
                      <Icon name={fileIcon(form.ficheiro.name)} size={14} />
                      {form.ficheiro.name}
                      <span className="text-muted dark:text-dmuted font-normal">
                        · {(form.ficheiro.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </span>
                  ) : (
                    <>
                      <span className="text-sm font-medium text-ink dark:text-dink">
                        Clique para seleccionar um ficheiro
                      </span>
                      <span className="text-xs text-muted dark:text-dmuted">
                        PDF, JPG ou PNG até 10 MB
                      </span>
                    </>
                  )}
                  <input
                    id="identity-file"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png"
                    required
                    onChange={event =>
                      setForm({ ...form, ficheiro: event.target.files?.[0] || null })
                    }
                  />
                </label>
                {form.ficheiro && (
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, ficheiro: null })}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-red-600 hover:underline"
                  >
                    <Icon name="X" size={12} />
                    Remover ficheiro
                  </button>
                )}
              </Field>
            </div>

            <div className="flex justify-end pt-2 border-t border-bd dark:border-dborder">
              <Button type="submit" disabled={saving || loading}>
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    A submeter…
                  </span>
                ) : (
                  'Submeter para verificação'
                )}
              </Button>
            </div>
          </form>
        </Card>
      )}
    </div>
  );
}

export default CidadaoVerificacao;