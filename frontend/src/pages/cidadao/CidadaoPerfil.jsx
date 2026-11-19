import React, { useEffect, useMemo, useState } from 'react';
import Icon from '../../components/common/Icon';
import { Card, Button, Field, inputCls } from '../../components/common/CommonComponents';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';
import { useAuth } from '../../contexts/AuthContext';

// Iniciais a partir do nome
function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .map(part => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

// Estilo do badge de estado de verificação
function getIdentityStyle(status) {
  const raw = (status?.estado || (status?.elegivel ? 'Aprovada' : 'Pendente')).toLowerCase();
  if (raw.includes('aprov') || raw.includes('verific')) {
    return {
      icon: 'CheckCircle2',
      label: status?.estado || 'Aprovada',
      cls: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900',
    };
  }
  if (raw.includes('rejeit') || raw.includes('recus')) {
    return {
      icon: 'XCircle',
      label: status?.estado || 'Rejeitada',
      cls: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-900',
    };
  }
  return {
    icon: 'Clock',
    label: status?.estado || 'Pendente',
    cls: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900',
  };
}

export function CidadaoPerfil({ user, identityStatus, setPage, showIdentity = true }) {
  const { theme, toggleTheme } = useTheme();
  const { updateProfile } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    setName(user.name);
    setEmail(user.email);
  }, [user.name, user.email]);

  const dirty = useMemo(
    () => name.trim() !== (user.name || '').trim() || email.trim() !== (user.email || '').trim(),
    [name, email, user.name, user.email]
  );

  const createdAt = user.createdAt
    ? new Intl.DateTimeFormat('pt-MZ', { dateStyle: 'long' }).format(new Date(user.createdAt))
    : 'Não disponibilizada pela API';

  const identity = getIdentityStyle(identityStatus);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setFieldErrors({});
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      toast.success('Perfil actualizado.');
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível actualizar o perfil.');
      setFieldErrors(requestError.errors || {});
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-ink dark:text-dink">Meu Perfil</h1>
        <p className="text-sm text-muted dark:text-dmuted mt-0.5">
          Gerir os seus dados pessoais e preferências de conta.
        </p>
      </div>

      {/* Card de perfil */}
      <Card className="overflow-hidden rounded-xl shadow-sm">
        {/* Banner superior */}
        <div className="h-20 bg-gradient-to-r from-navy via-navy to-blue-700 dark:from-navy dark:to-blue-900" />

        <div className="p-6 -mt-10">
          <div className="flex items-end gap-4 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-navy text-white flex items-center justify-center text-2xl font-semibold ring-4 ring-surface dark:ring-dsurface shadow-lg">
                {getInitials(user.name)}
              </div>
              <span
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-surface dark:border-dsurface"
                title="Conta activa"
                aria-label="Conta activa"
              />
            </div>
            <div className="flex-1 min-w-0 pb-1">
              <p className="font-semibold text-lg text-ink dark:text-dink truncate">{user.name}</p>
              <p className="text-sm text-muted dark:text-dmuted truncate">{user.roleTitle}</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" aria-busy={saving}>
            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-3.5 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
              >
                <Icon name="AlertCircle" size={18} className="mt-0.5 shrink-0" />
                <div className="flex-1 space-y-1">
                  <p>{error}</p>
                  {Object.values(fieldErrors).map((message, index) => (
                    <p key={index} className="text-xs opacity-80">{message}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Secção: Dados pessoais */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-dmuted mb-3">
                Dados pessoais
              </h3>
              <div className="space-y-4">
                <Field label="Nome completo" htmlFor="perfil-name" error={fieldErrors.name}>
                  <input
                    id="perfil-name"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    className={inputCls}
                    autoComplete="name"
                    required
                  />
                </Field>
                <Field label="Email" htmlFor="perfil-email" error={fieldErrors.email}>
                  <input
                    id="perfil-email"
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    className={inputCls}
                    autoComplete="email"
                    required
                  />
                </Field>
              </div>
            </div>

            {/* Secção: Conta (read-only) */}
            <div className="pt-2 border-t border-bd dark:border-dborder">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-dmuted mb-3 mt-4">
                Conta
              </h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Perfil">
                  <input
                    value={user.roleTitle}
                    readOnly
                    className={`${inputCls} opacity-60 cursor-not-allowed`}
                  />
                </Field>
                <Field label="Conta criada em">
                  <input
                    value={createdAt}
                    readOnly
                    className={`${inputCls} opacity-60 cursor-not-allowed`}
                  />
                </Field>
              </div>
            </div>

            {/* Acções */}
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-bd dark:border-dborder">
              <p className="text-xs text-muted dark:text-dmuted">
                A alteração de palavra-passe e outros dados não está disponível na API.
              </p>
              <Button
                type="submit"
                icon={saving ? undefined : 'Save'}
                disabled={saving || !dirty}
                className="shrink-0"
              >
                {saving ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    A guardar…
                  </span>
                ) : dirty ? (
                  'Guardar alterações'
                ) : (
                  'Sem alterações'
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Verificação de identidade */}
      {showIdentity && (
        <Card className="p-6 rounded-xl shadow-sm">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-300 shrink-0">
                <Icon name="ShieldCheck" size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-ink dark:text-dink">Verificação de identidade</h3>
                <p className="text-sm text-muted dark:text-dmuted mt-0.5">
                  Consulte o estado da verificação da sua conta.
                </p>
              </div>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${identity.cls}`}
            >
              <Icon name={identity.icon} size={13} />
              {identity.label}
            </span>
          </div>
          <div className="mt-4 flex justify-end">
            <Button type="button" onClick={() => setPage?.('verificacao')}>
              Consultar verificação
            </Button>
          </div>
        </Card>
      )}

      {/* Aparência */}
      <Card className="p-6 rounded-xl shadow-sm">
        <h3 className="font-semibold text-ink dark:text-dink mb-3 flex items-center gap-2">
          <Icon name="Palette" size={18} /> Aparência
        </h3>
        <button
          type="button"
          onClick={toggleTheme}
          className="group inline-flex items-center gap-3 rounded-xl border border-bd dark:border-dborder bg-surface dark:bg-dsurface px-4 py-2.5 text-sm font-medium text-ink dark:text-dink hover:bg-lblue/40 dark:hover:bg-dblue/10 transition-colors"
          aria-pressed={theme === 'dark'}
        >
          <span className="w-8 h-8 rounded-lg bg-lblue/50 dark:bg-dblue/30 flex items-center justify-center text-brand dark:text-blue-300 transition-transform group-hover:scale-105">
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={18} />
          </span>
          <span>
            Activar modo <strong>{theme === 'light' ? 'escuro' : 'claro'}</strong>
          </span>
        </button>
        <p className="mt-3 text-xs text-muted dark:text-dmuted flex items-start gap-1.5">
          <Icon name="Info" size={13} className="mt-0.5 shrink-0" />
          Esta preferência fica guardada neste navegador e separada por conta neste dispositivo.
        </p>
      </Card>
    </div>
  );
}

export default CidadaoPerfil;