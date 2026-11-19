import React, { useRef, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, StatusBadge, Timeline, EmptyState } from '../../components/common/CommonComponents';
import { MozambiqueMap } from '../../components/map/MapComponents';
import { evidenciasService } from '../../services/evidenciasService';

const STATE_LABELS = {
  registada: 'Registada',
  em_avaliacao: 'Em avaliação',
  em_atendimento: 'Em atendimento',
  resolvida: 'Resolvida',
  cancelada: 'Cancelada',
};

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

/* ─── Section title ─────────────────────────────────────────── */
function SectionTitle({ icon, accent, title, action }) {
  return (
    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
      <h3 className="font-semibold text-ink dark:text-dink flex items-center gap-2">
        <span className={`w-1 h-4 rounded-full ${accent}`} />
        {icon && <Icon name={icon} size={14} className="text-muted dark:text-dmuted" />}
        {title}
      </h3>
      {action}
    </div>
  );
}

/* ─── Skeleton ─────────────────────────────────────────────── */
function DetailSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="h-4 w-40 rounded bg-slate-200 dark:bg-slate-700 animate-pulse" />
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 rounded bg-slate-100 dark:bg-slate-800" />
              <div className="h-5 w-2/3 rounded bg-slate-200 dark:bg-slate-700" />
              <div className="h-3 w-1/3 rounded bg-slate-100 dark:bg-slate-800" />
            </div>
          </div>
          <div className="h-24 rounded-lg bg-slate-100 dark:bg-slate-800" />
        </div>
      </Card>
      <span className="sr-only" role="status">A carregar a ocorrência…</span>
    </div>
  );
}

export function CidadaoDetalheOcorrencia({
  occurrence,
  loading,
  error,
  onRefresh,
  onEvidenceUploaded,
  onDownloadEvidence,
  setPage,
}) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [downloadError, setDownloadError] = useState('');
  const fileInput = useRef(null);

  const uploadEvidence = async (event) => {
    event.preventDefault();
    if (!file || !occurrence) return;
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      await evidenciasService.anexar(occurrence.id, file);
      setFile(null);
      if (fileInput.current) fileInput.current.value = '';
      await onEvidenceUploaded();
      setUploadSuccess('Evidência anexada com sucesso.');
    } catch (uploadFailure) {
      setUploadError(uploadFailure.message || 'Não foi possível anexar a evidência.');
    } finally {
      setUploading(false);
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

  /* ─── Loading ─────────────────────────────────────────── */
  if (loading && !occurrence) {
    return <DetailSkeleton />;
  }

  /* ─── Erro fatal ──────────────────────────────────────── */
  if (error && !occurrence) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-4 border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30" role="alert">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-300 flex items-center justify-center shrink-0">
              <Icon name="AlertOctagon" size={18} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Não foi possível carregar a ocorrência</p>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1 break-words">{error}</p>
              <button onClick={onRefresh} className="mt-2 text-xs font-semibold text-brand dark:text-dblue underline hover:no-underline">
                Tentar novamente
              </button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  /* ─── Vazio ────────────────────────────────────────────── */
  if (!occurrence) {
    return (
      <div className="max-w-4xl mx-auto">
        <EmptyState
          icon="FileText"
          title="Nenhuma ocorrência encontrada"
          description="A ocorrência solicitada pode ter sido removida ou ainda não estar disponível."
          action={<Button onClick={() => setPage('minhas-ocorrencias')} icon="ArrowLeft">Voltar às minhas ocorrências</Button>}
        />
      </div>
    );
  }

  /* ─── Derivações (inalteradas) ────────────────────────── */
  const location = occurrence.localizacao_geografica || {};
  const history = (occurrence.historico || []).map(item => ({
    data: formatDate(item.created_at),
    txt: [
      item.estado_novo ? `Estado: ${STATE_LABELS[item.estado_novo] || item.estado_novo}` : '',
      item.observacoes || '',
    ].filter(Boolean).join(' — ') || 'Actualização registada',
  }));
  const mapOccurrence = {
    lat: Number(occurrence.latitude ?? location.latitude),
    lng: Number(occurrence.longitude ?? location.longitude),
    prioridade: occurrence.prioridade?.nome,
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ─── Botão voltar ──────────────────────────────────── */}
      <button
        onClick={() => setPage('minhas-ocorrencias')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted dark:text-dmuted hover:text-brand dark:hover:text-dblue transition-colors group"
      >
        <Icon name="ChevronLeft" size={16} className="transition-transform group-hover:-translate-x-0.5" />
        Voltar às minhas ocorrências
      </button>

      {/* ─── Erro não-fatal ────────────────────────────────── */}
      {error && (
        <div className="rounded-xl border border-amber-200/70 dark:border-amber-900/60 bg-gradient-to-br from-amber-50 to-orange-50/60 dark:from-amber-950/40 dark:to-orange-950/30 p-3 flex items-start gap-2" role="alert">
          <Icon name="AlertTriangle" size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-amber-900 dark:text-amber-100 break-words">{error}</p>
          </div>
          <button onClick={onRefresh} className="shrink-0 text-xs font-semibold text-amber-800 dark:text-amber-200 underline hover:no-underline">
            Actualizar
          </button>
        </div>
      )}

      {/* ─── Cabeçalho ─────────────────────────────────────── */}
      <header className="relative overflow-hidden rounded-2xl border border-bd dark:border-dborder bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 dark:from-slate-900 dark:via-slate-900/80 dark:to-emerald-950/30 p-5 shadow-sm">
        <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-emerald-400/10 dark:bg-emerald-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-1/3 w-56 h-56 rounded-full bg-teal-400/10 dark:bg-teal-500/10 blur-3xl" />

        <div className="relative flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5 min-w-0 flex-1">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Icon name="FileText" size={22} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold uppercase tracking-wider border border-emerald-200/60 dark:border-emerald-800/50">
                  <Icon name="User" size={11} />
                  Área do Cidadão
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/70 dark:bg-slate-800 text-muted dark:text-dmuted border border-bd dark:border-dborder">
                  #{occurrence.id}
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-ink dark:text-dink leading-snug">
                {occurrence.titulo}
              </h1>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-muted dark:text-dmuted flex-wrap">
                <span className="inline-flex items-center gap-1">
                  <Icon name="AlertTriangle" size={11} />
                  {occurrence.tipo_ocorrencia?.nome || 'Tipo não informado'}
                </span>
                {(location.distrito || location.provincia) && (
                  <>
                    <span className="text-slate-300 dark:text-slate-600">·</span>
                    <span className="inline-flex items-center gap-1">
                      <Icon name="MapPin" size={11} />
                      {[location.distrito, location.provincia].filter(Boolean).join(', ')}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <StatusBadge s={STATE_LABELS[occurrence.estado] || occurrence.estado} />
          </div>
        </div>
      </header>

      {/* ─── Grelha principal ──────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-4">

        {/* ═════ COLUNA ESQUERDA (2/3) ═════ */}
        <div className="lg:col-span-2 space-y-4">

          {/* Descrição + Metadados */}
          <Card className="p-5 space-y-3">
            <SectionTitle icon="FileText" accent="bg-gradient-to-b from-emerald-500 to-teal-500" title="Descrição" />
            <p className="text-sm text-ink dark:text-dink whitespace-pre-wrap leading-relaxed">
              {occurrence.descricao}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-bd dark:border-dborder">
              {[
                { label: 'Submetida em', value: formatDate(occurrence.created_at), icon: 'Clock' },
                { label: 'Última actualização', value: formatDate(occurrence.updated_at), icon: 'RefreshCw' },
                { label: 'Prioridade', value: occurrence.prioridade?.nome || 'Pendente de triagem oficial', icon: 'AlertTriangle' },
                { label: 'Estado', value: null, icon: 'Activity' },
              ].map((row, i) => (
                <div key={i} className="p-2.5 rounded-lg border border-bd dark:border-dborder bg-light/60 dark:bg-dsidebar/40">
                  <p className="text-[10px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted inline-flex items-center gap-1 mb-1">
                    <Icon name={row.icon} size={10} />
                    {row.label}
                  </p>
                  {row.value !== null ? (
                    <p className="text-sm font-medium text-ink dark:text-dink truncate">{row.value}</p>
                  ) : (
                    <StatusBadge s={STATE_LABELS[occurrence.estado] || occurrence.estado} />
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Acompanhamento */}
          <Card className="p-5">
            <SectionTitle
              icon="Activity"
              accent="bg-gradient-to-b from-purple-500 to-pink-500"
              title="Acompanhamento e evolução"
              action={
                history.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                    {history.length} evento{history.length === 1 ? '' : 's'}
                  </span>
                )
              }
            />
            {history.length ? (
              <Timeline items={history} />
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted flex items-center justify-center">
                  <Icon name="History" size={18} />
                </div>
                <p className="text-xs text-muted dark:text-dmuted italic">
                  Ainda não há actualizações de acompanhamento.
                </p>
              </div>
            )}
          </Card>

          {/* Evidências */}
          <Card className="p-5 space-y-4">
            <SectionTitle
              icon="Upload"
              accent="bg-gradient-to-b from-indigo-500 to-purple-500"
              title="Evidências"
              action={
                occurrence.evidencias?.length > 0 && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted font-semibold tabular-nums">
                    {occurrence.evidencias.length}
                  </span>
                )
              }
            />
            <p className="text-xs text-muted dark:text-dmuted -mt-1">JPG, PNG ou PDF até 10 MB por ficheiro.</p>

            {occurrence.evidencias?.length ? (
              <ul className="divide-y divide-bd dark:divide-dborder rounded-lg border border-bd dark:border-dborder overflow-hidden">
                {occurrence.evidencias.map(evidence => (
                  <li key={evidence.id} className="py-2.5 px-3 flex items-center gap-3 hover:bg-light/60 dark:hover:bg-dsidebar/40 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                      <Icon name="FileText" size={14} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-ink dark:text-dink truncate">{evidence.nome_ficheiro}</p>
                      <p className="text-[11px] text-muted dark:text-dmuted truncate">{evidence.descricao || evidence.tipo_mime}</p>
                    </div>
                    <button
                      onClick={() => downloadEvidence(evidence)}
                      className="shrink-0 inline-flex items-center gap-1 text-brand dark:text-dblue p-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors"
                      aria-label={`Descarregar ${evidence.nome_ficheiro}`}
                    >
                      <Icon name="Download" size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="py-6 flex flex-col items-center justify-center text-center gap-2 rounded-lg border border-dashed border-bd dark:border-dborder">
                <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 text-muted dark:text-dmuted flex items-center justify-center">
                  <Icon name="Upload" size={18} />
                </div>
                <p className="text-xs text-muted dark:text-dmuted italic">Não existem evidências anexadas.</p>
              </div>
            )}

            {downloadError && (
              <p role="alert" className="text-sm text-red-700 dark:text-red-300 inline-flex items-center gap-1.5">
                <Icon name="AlertOctagon" size={12} /> {downloadError}
              </p>
            )}

            {/* Form de upload */}
            <form onSubmit={uploadEvidence} className="pt-4 border-t border-bd dark:border-dborder space-y-3">
              <label className="block text-sm text-ink dark:text-dink">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-muted dark:text-dmuted">
                  Anexar ficheiro
                </span>
                <input
                  ref={fileInput}
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  onChange={event => {
                    setFile(event.target.files?.[0] || null);
                    setUploadError('');
                    setUploadSuccess('');
                  }}
                  className="mt-1 block w-full text-sm"
                  required
                />
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Button type="submit" icon="Upload" disabled={!file || uploading}>
                  {uploading ? 'A enviar…' : 'Anexar'}
                </Button>
                {file && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted dark:text-dmuted">
                    <Icon name="FileText" size={11} /> {file.name}
                  </span>
                )}
              </div>
              {uploadError && (
                <p role="alert" className="text-sm text-red-700 dark:text-red-300 inline-flex items-center gap-1.5">
                  <Icon name="AlertOctagon" size={12} /> {uploadError}
                </p>
              )}
              {uploadSuccess && (
                <p role="status" className="text-sm text-green-700 dark:text-green-300 inline-flex items-center gap-1.5">
                  <Icon name="CheckCircle" size={12} /> {uploadSuccess}
                </p>
              )}
            </form>
          </Card>

         
        </div>

        {/* ═════ COLUNA DIREITA (1/3) ═════ */}
        <div className="space-y-4">
          <Card className="p-5">
            <SectionTitle icon="MapPin" accent="bg-gradient-to-b from-blue-500 to-cyan-500" title="Localização" />
            <div className="h-48 rounded-xl overflow-hidden border border-bd dark:border-dborder">
              <MozambiqueMap ocorrencias={[mapOccurrence]} height={192} />
            </div>
            <p className="text-xs text-muted dark:text-dmuted mt-2 inline-flex items-start gap-1">
              <Icon name="MapPin" size={11} className="shrink-0 mt-0.5" />
              <span>
                {[occurrence.localizacao, location.bairro, location.distrito, location.provincia].filter(Boolean).join(', ') || 'Localização não disponível'}
              </span>
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default CidadaoDetalheOcorrencia;