import React, { useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, EmptyState } from '../../components/common/CommonComponents';

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

// Mapa de ícones e cores por tipo de notificação
const TYPE_STYLES = {
  info:    { icon: 'Info',       cls: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300' },
  alerta:  { icon: 'AlertTriangle', cls: 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' },
  sucesso: { icon: 'CheckCircle2', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300' },
  erro:    { icon: 'XCircle',    cls: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-300' },
  default: { icon: 'Bell',       cls: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
};

function getTypeStyle(tipo) {
  if (!tipo) return TYPE_STYLES.default;
  const key = String(tipo).toLowerCase();
  return TYPE_STYLES[key] || TYPE_STYLES.default;
}

export function CidadaoNotificacoes({
  notifications = [],
  loading,
  error,
  onRefresh,
  onMarkAsRead,
}) {
  const [updating, setUpdating] = useState(null);
  const [actionError, setActionError] = useState('');

  const unreadCount = notifications.filter(n => !n.lida).length;

  const markAsRead = async (id) => {
    setUpdating(id);
    setActionError('');
    try {
      await onMarkAsRead(id);
    } catch (requestError) {
      setActionError(requestError.message || 'Não foi possível actualizar a notificação.');
    } finally {
      setUpdating(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-ink dark:text-dink">Notificações</h1>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[1.5rem] h-6 px-2 rounded-full bg-red-500 text-white text-xs font-bold">
                {unreadCount}
              </span>
            )}
          </div>
          <p className="text-sm text-muted dark:text-dmuted mt-0.5">
            {loading
              ? 'A sincronizar…'
              : notifications.length === 0
              ? 'Nenhuma notificação por agora'
              : `${notifications.length} notificaç${notifications.length === 1 ? 'ão' : 'ões'} · ${unreadCount} não lida${unreadCount === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="group inline-flex items-center justify-center gap-2 rounded-lg border border-bd dark:border-dborder bg-surface dark:bg-dsurface px-3.5 py-2 text-sm font-medium text-ink dark:text-dink hover:bg-lblue/40 dark:hover:bg-dblue/10 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Actualizar notificações"
        >
          <Icon
            name="RefreshCw"
            size={16}
            className={loading ? 'animate-spin' : 'transition-transform group-hover:rotate-90'}
          />
          Actualizar
        </button>
      </div>

      {/* Erro */}
      {(error || actionError) && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
        >
          <Icon name="AlertCircle" size={18} className="mt-0.5 shrink-0" />
          <p className="flex-1">{actionError || error}</p>
          {actionError && (
            <button
              type="button"
              onClick={() => setActionError('')}
              className="shrink-0 rounded-md p-1 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              aria-label="Fechar alerta"
            >
              <Icon name="X" size={14} />
            </button>
          )}
        </div>
      )}

      {/* Lista */}
      <Card className="overflow-hidden rounded-xl shadow-sm">
        {loading ? (
          <div className="divide-y divide-bd dark:divide-dborder" aria-busy="true" aria-live="polite">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-4 animate-pulse">
                <div className="w-9 h-9 rounded-full bg-lblue/40 dark:bg-dblue/20 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-24 rounded bg-lblue/40 dark:bg-dblue/20" />
                  <div className="h-3.5 w-3/4 rounded bg-lblue/40 dark:bg-dblue/20" />
                  <div className="h-3 w-full rounded bg-lblue/40 dark:bg-dblue/20" />
                  <div className="h-3 w-28 rounded bg-lblue/40 dark:bg-dblue/20" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10">
            <EmptyState
              icon="Bell"
              title="Sem notificações"
              description="As notificações recebidas aparecerão aqui."
            />
          </div>
        ) : (
          <ul role="list">
            {notifications.map((notification) => {
              const style = getTypeStyle(notification.tipo);
              const isUnread = !notification.lida;
              return (
                <li
                  key={notification.id}
                  className={`group relative flex gap-3 p-4 border-b border-bd dark:border-dborder last:border-0 transition-colors hover:bg-lblue/20 dark:hover:bg-dblue/5 ${
                    isUnread ? 'bg-lblue/30 dark:bg-dblue/10' : ''
                  }`}
                >
                  {/* Barra de "não lida" */}
                  {isUnread && (
                    <span
                      className="absolute left-0 top-0 bottom-0 w-1 bg-brand rounded-r"
                      aria-hidden="true"
                    />
                  )}

                  {/* Ícone do tipo */}
                  <div
                    className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center ${style.cls}`}
                  >
                    <Icon name={style.icon} size={16} />
                  </div>

                  {/* Conteúdo */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded ${style.cls}`}
                      >
                        {notification.tipo || 'Notificação'}
                      </span>
                      {notification.ocorrencia_id && (
                        <span className="text-xs text-muted dark:text-dmuted">
                          · Ocorrência #{notification.ocorrencia_id}
                        </span>
                      )}
                      {isUnread && (
                        <span className="text-[10px] font-semibold text-brand dark:text-brand">
                          NOVA
                        </span>
                      )}
                    </div>
                    <p
                      className={`text-sm ${
                        isUnread
                          ? 'font-semibold text-ink dark:text-dink'
                          : 'font-medium text-ink dark:text-dink'
                      }`}
                    >
                      {notification.titulo}
                    </p>
                    <p className="text-xs text-muted dark:text-dmuted mt-1 leading-relaxed">
                      {notification.mensagem}
                    </p>
                    <p className="text-[11px] text-muted dark:text-dmuted mt-1.5 flex items-center gap-1">
                      <Icon name="Clock" size={11} />
                      {formatDate(notification.created_at)}
                    </p>
                  </div>

                  {/* Acção */}
                  {isUnread && (
                    <div className="self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => markAsRead(notification.id)}
                        disabled={updating === notification.id}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-brand hover:text-brand/80 rounded-md px-2 py-1 hover:bg-brand/5 dark:hover:bg-brand/10 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        aria-label={`Marcar "${notification.titulo}" como lida`}
                      >
                        {updating === notification.id ? (
                          <>
                            <span className="w-3 h-3 rounded-full border-2 border-brand border-t-transparent animate-spin" />
                            <span className="hidden sm:inline">A actualizar…</span>
                          </>
                        ) : (
                          <>
                            <Icon name="Check" size={14} />
                            <span className="hidden sm:inline">Marcar como lida</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

export default CidadaoNotificacoes;