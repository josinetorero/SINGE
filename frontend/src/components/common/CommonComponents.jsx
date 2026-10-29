import React from 'react';
import Icon from './Icon';

export const PRIO_MAP = {
  'Crítico': { bg: 'bg-red-100 dark:bg-red-950/50', text: 'text-red-700 dark:text-red-300', dot: 'bg-red-500' },
  'Alto':    { bg: 'bg-orange-100 dark:bg-orange-950/50', text: 'text-orange-700 dark:text-orange-300', dot: 'bg-orange-500' },
  'Médio':   { bg: 'bg-yellow-100 dark:bg-yellow-950/50', text: 'text-yellow-800 dark:text-yellow-300', dot: 'bg-yellow-500' },
  'Baixo':   { bg: 'bg-green-100 dark:bg-green-950/50', text: 'text-green-700 dark:text-green-300', dot: 'bg-green-500' },
};

export const EST_MAP = {
  'Nova': 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  'Em análise': 'bg-amber-100 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
  'Validada': 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  'Em resposta': 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  'Em curso': 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  'Atribuída': 'bg-sky-100 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300',
  'Resolvida': 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  'Concluída': 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  'Encerrada': 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Disponível': 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  'Em missão': 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
  'Indisponível': 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Activo': 'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-300',
  'Inactivo': 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  'Submetida': 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300',
  'Em acompanhamento': 'bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300',
};

export const PrioBadge = ({ p }) => !p ? (
  <span className="text-xs text-muted dark:text-dmuted">—</span>
) : (
  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${PRIO_MAP[p]?.bg || 'bg-slate-100 dark:bg-slate-800'} ${PRIO_MAP[p]?.text || 'text-slate-700'}`}>
    <span className={`w-1.5 h-1.5 rounded-full ${PRIO_MAP[p]?.dot || 'bg-slate-400'}`} />
    {p}
  </span>
);

export const StatusBadge = ({ s }) => (
  <span className={`inline-flex px-2 py-1 rounded-md text-xs font-medium ${EST_MAP[s] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
    {s}
  </span>
);

export const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-dcard border border-bd dark:border-dborder rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

export const Button = ({ variant = 'primary', size = 'md', icon, children, className = '', ...props }) => {
  const base = 'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed';
  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2 text-sm', lg: 'px-5 py-2.5 text-sm' };
  const variants = {
    primary: 'bg-brand hover:bg-blue-700 text-white shadow-sm',
    secondary: 'bg-white dark:bg-dcard border border-bd dark:border-dborder text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    ghost: 'text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar',
  };
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {icon && <Icon name={icon} size={16} />}
      {children}
    </button>
  );
};

export const StatCard = ({ icon, label, value, hint, tone = 'brand' }) => {
  const tones = {
    brand: 'bg-blue-50 dark:bg-blue-950/40 text-brand dark:text-dblue',
    red: 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300',
    orange: 'bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-300',
    green: 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-300',
  };
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted dark:text-dmuted uppercase tracking-wide truncate">{label}</p>
          <p className="mt-2 text-2xl font-bold text-ink dark:text-dink">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted dark:text-dmuted truncate">{hint}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${tones[tone]}`}>
          <Icon name={icon} size={20} />
        </div>
      </div>
    </Card>
  );
};

export const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-dcard rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-bd dark:border-dborder">
          <h3 className="font-semibold text-ink dark:text-dink">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-light dark:hover:bg-dsidebar text-ink dark:text-dink">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5 overflow-y-auto">{children}</div>
        {footer && <div className="p-4 border-t border-bd dark:border-dborder flex justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

export const ConfirmModal = ({ open, onClose, onConfirm, title, description, danger = true, confirmLabel = 'Confirmar' }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-dcard rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95" onClick={e => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full mx-auto flex items-center justify-center ${danger ? 'bg-red-100 dark:bg-red-950/50 text-red-600' : 'bg-blue-100 dark:bg-blue-950/50 text-brand'}`}>
          <Icon name={danger ? 'AlertTriangle' : 'Info'} size={22} />
        </div>
        <h3 className="text-center font-semibold text-ink dark:text-dink mt-3">{title}</h3>
        <p className="text-center text-sm text-muted dark:text-dmuted mt-1">{description}</p>
        <div className="flex gap-2 mt-6 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={() => { onConfirm(); onClose(); }}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
};

export const Field = ({ label, children, required, hint, error, errorTestId, htmlFor }) => (
  <label className="block" htmlFor={htmlFor}>
    <span className="block text-sm font-medium text-ink dark:text-dink mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </span>
    {children}
    {hint && <span className="block text-xs text-muted dark:text-dmuted mt-1">{hint}</span>}
    {error && (
      <span 
        role="alert" 
        data-testid={errorTestId || (htmlFor ? `${htmlFor}-error` : undefined)} 
        className="block text-xs text-red-600 mt-1"
      >
        {error}
      </span>
    )}
  </label>
);

export const inputCls = "w-full px-3 py-2 rounded-lg border border-bd dark:border-dborder bg-white dark:bg-dcard text-ink dark:text-dink text-sm focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand";

export const Timeline = ({ items }) => (
  <ol className="relative border-l-2 border-bd dark:border-dborder ml-2 space-y-4">
    {items.map((it, i) => (
      <li key={i} className="ml-4">
        <span className="absolute -left-2 w-3 h-3 rounded-full bg-brand border-2 border-white dark:border-dcard" />
        <p className="text-xs text-muted dark:text-dmuted">{it.data}</p>
        <p className="text-sm text-ink dark:text-dink">{it.txt}</p>
      </li>
    ))}
  </ol>
);

export const Pagination = ({ total, page, pageSize, onChange }) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) pages.push(i);
    else if (pages[pages.length - 1] !== '...') pages.push('...');
  }
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 border-t border-bd dark:border-dborder text-sm">
      <p className="text-muted dark:text-dmuted">{total === 0 ? 'Sem resultados' : `${start}–${end} de ${total}`}</p>
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => onChange(Math.max(1, page - 1))} disabled={page === 1}>
          <Icon name="ChevronLeft" size={14} />
        </Button>
        {pages.map((p, i) => p === '...' ? (
          <span key={i} className="px-1 text-muted">…</span>
        ) : (
          <button 
            key={i} 
            onClick={() => onChange(p)} 
            className={`min-w-[32px] h-8 rounded-lg text-xs font-medium ${p === page ? 'bg-brand text-white' : 'text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar'}`}
          >
            {p}
          </button>
        ))}
        <Button variant="ghost" size="sm" onClick={() => onChange(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
          <Icon name="ChevronRight" size={14} />
        </Button>
      </div>
    </div>
  );
};

export const EmptyState = ({ icon = 'Inbox', title = 'Sem dados', description = 'Não existem registos a apresentar.', action }) => (
  <div className="p-12 text-center">
    <div className="w-14 h-14 rounded-full bg-light dark:bg-dsidebar text-muted dark:text-dmuted mx-auto flex items-center justify-center">
      <Icon name={icon} size={24} />
    </div>
    <p className="mt-4 font-medium text-ink dark:text-dink">{title}</p>
    <p className="text-sm text-muted dark:text-dmuted mt-1">{description}</p>
    {action && <div className="mt-4">{action}</div>}
  </div>
);

export const LoadingState = ({ label = 'A carregar...' }) => (
  <div className="p-12 flex items-center justify-center gap-3 text-muted dark:text-dmuted text-sm">
    <div className="w-5 h-5 border-2 border-brand border-t-transparent rounded-full animate-spin" />
    <span>{label}</span>
  </div>
);

export const ErrorState = ({ onRetry }) => (
  <div className="p-12 text-center">
    <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-950/50 text-red-600 mx-auto flex items-center justify-center">
      <Icon name="AlertCircle" size={24} />
    </div>
    <p className="mt-4 font-medium text-ink dark:text-dink">Não foi possível carregar</p>
    <p className="text-sm text-muted dark:text-dmuted mt-1">Verifique a ligação e tente novamente.</p>
    {onRetry && (
      <Button className="mt-4" variant="secondary" icon="RefreshCw" onClick={onRetry}>
        Tentar novamente
      </Button>
    )}
  </div>
);
