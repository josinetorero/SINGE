/**
 * Utilitários de Formatação para o SINGE
 */

// Formatar data e hora em padrão amigável (ex: 26 Out 2026, 14:30)
export const formatDateTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return new Intl.DateTimeFormat('pt-PT', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(d);
  } catch {
    return dateString;
  }
};

// Formatar tempo relativo (ex: "há 15 minutos", "há 2 horas")
export const formatRelativeTime = (dateString) => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'agora mesmo';
    if (diffInSeconds < 3600) return `há ${Math.floor(diffInSeconds / 60)} min`;
    if (diffInSeconds < 86400) return `há ${Math.floor(diffInSeconds / 3600)} h`;
    return formatDateTime(dateString);
  } catch {
    return dateString;
  }
};

// Cores e estilos para Prioridades
export const getPriorityConfig = (priority) => {
  switch (priority) {
    case 'Crítica':
      return {
        bg: 'bg-red-100 dark:bg-red-950/60',
        text: 'text-red-700 dark:text-red-400',
        border: 'border-red-300 dark:border-red-800',
        dot: 'bg-red-600',
        badge: 'bg-priority-critica text-white'
      };
    case 'Alta':
      return {
        bg: 'bg-orange-100 dark:bg-orange-950/60',
        text: 'text-orange-700 dark:text-orange-400',
        border: 'border-orange-300 dark:border-orange-800',
        dot: 'bg-orange-500',
        badge: 'bg-priority-alta text-white'
      };
    case 'Média':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/60',
        text: 'text-amber-700 dark:text-amber-400',
        border: 'border-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500',
        badge: 'bg-priority-media text-white'
      };
    case 'Baixa':
    default:
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/60',
        text: 'text-emerald-700 dark:text-emerald-400',
        border: 'border-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500',
        badge: 'bg-priority-baixa text-white'
      };
  }
};

// Cores e estilos para Estados de Ocorrência
export const getStatusConfig = (status) => {
  switch (status) {
    case 'Por validar':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/50',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-300 dark:border-amber-800',
        dot: 'bg-amber-500'
      };
    case 'Validada':
      return {
        bg: 'bg-sky-100 dark:bg-sky-950/50',
        text: 'text-sky-700 dark:text-sky-300',
        border: 'border-sky-300 dark:border-sky-800',
        dot: 'bg-sky-500'
      };
    case 'Classificada':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-950/50',
        text: 'text-indigo-700 dark:text-indigo-300',
        border: 'border-indigo-300 dark:border-indigo-800',
        dot: 'bg-indigo-500'
      };
    case 'Em Atendimento':
      return {
        bg: 'bg-purple-100 dark:bg-purple-950/50',
        text: 'text-purple-700 dark:text-purple-300',
        border: 'border-purple-300 dark:border-purple-800',
        dot: 'bg-purple-500 animate-pulse'
      };
    case 'Em Resolução':
      return {
        bg: 'bg-pink-100 dark:bg-pink-950/50',
        text: 'text-pink-700 dark:text-pink-300',
        border: 'border-pink-300 dark:border-pink-800',
        dot: 'bg-pink-500 animate-pulse'
      };
    case 'Resolvida':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/50',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-300 dark:border-emerald-800',
        dot: 'bg-emerald-500'
      };
    case 'Rejeitada':
    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800',
        text: 'text-slate-600 dark:text-slate-400',
        border: 'border-slate-300 dark:border-slate-700',
        dot: 'bg-slate-400'
      };
  }
};
