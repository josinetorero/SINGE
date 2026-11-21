import React, { useEffect, useState } from 'react';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  Sun,
  Moon,
  Radio,
  AlertCircle,
  ShieldCheck,
  Mail,
  ArrowRight,
  Building2,
  Lock as LockIcon,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Input institucional (reto, com borda e ícone)
function Field({
  icon: IconCmp,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  invalid,
  error,
  trailing,
  hint,
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <div
        className={`w-full flex items-center rounded-lg bg-white dark:bg-slate-900/60 border transition-colors ${
          invalid
            ? 'border-red-400 dark:border-red-700 focus-within:ring-2 focus-within:ring-red-200 dark:focus-within:ring-red-900/40'
            : 'border-slate-300 dark:border-slate-700 focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/20'
        }`}
      >
        <span className="pl-3.5 text-slate-400 dark:text-slate-500">
          <IconCmp className="w-4 h-4" />
        </span>
        <input
          type={type}
          aria-label={label}
          aria-invalid={invalid || undefined}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          className="flex-1 bg-transparent px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder:text-slate-400 outline-none"
        />
        {trailing && <span className="pr-2">{trailing}</span>}
      </div>
      {hint && !error && (
        <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">{hint}</p>
      )}
      {error && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}

export function Login({ onLogin, authError = '' }) {
  const { theme, toggleTheme } = useTheme();
  const { login, register, clearAuthError } = useAuth();

  const [mode, setMode] = useState('login');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regPassConfirmation, setRegPassConfirmation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (authError) setError(authError);
  }, [authError]);

  const switchMode = (next) => {
    setMode(next);
    setError('');
    setFieldErrors({});
    clearAuthError();
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    clearAuthError();
    try {
      const user = await login(username, password, rememberMe);
      onLogin?.(user);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível iniciar sessão.');
      setFieldErrors(requestError.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setFieldErrors({});
    clearAuthError();
    try {
      const user = await register({
        name: regNome,
        email: regEmail,
        password: regPass,
        password_confirmation: regPassConfirmation,
      });
      onLogin?.(user);
    } catch (requestError) {
      setError(requestError.message || 'Não foi possível criar a conta.');
      setFieldErrors(requestError.errors || {});
    } finally {
      setLoading(false);
    }
  };

  const showPasswordToggle = (
    <button
      type="button"
      onClick={() => setShowPass(!showPass)}
      aria-label={showPass ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
      className="p-1.5 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
    >
      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-[#0a1320] font-sans">
      {/* Barra superior institucional */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1b2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand text-white flex items-center justify-center shadow-sm">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="leading-tight">
              <p className="font-bold text-sm tracking-wider text-navy dark:text-white">
                SINGE
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Sistema Integrado de Gestão de Emergências
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <Building2 className="w-3.5 h-3.5" />
              INGD · CENOE
            </span>
            <button
              onClick={toggleTheme}
              type="button"
              aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo escuro'}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Conteúdo principal */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1b2e]">
          {/* Painel esquerdo — informação institucional pública */}
          <aside className="hidden lg:flex flex-col justify-between p-10 bg-gradient-to-br from-[#1e3a5f] via-navy to-[#0f1b2e] text-white relative">
            {/* Grelha de fundo sutil */}
            <div
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)',
                backgroundSize: '32px 32px',
              }}
            />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-[11px] font-medium tracking-wide uppercase">
                <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                Plataforma oficial
              </div>

              <h1 className="mt-6 text-3xl font-bold leading-tight">
                Comunique ocorrências e acompanhe a resposta às emergências
              </h1>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed">
                Registe situações de emergência, acompanhe o estado das suas comunicações
                e receba alertas oficiais das autoridades.
              </p>
            </div>

            {/* Funcionalidades públicas (sem revelar perfis) */}
            <div className="relative z-10 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Comunicação segura</p>
                  <p className="text-xs text-slate-400">
                    Os seus dados são protegidos e as comunicações validadas pelas autoridades.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-md bg-white/10 border border-white/15 flex items-center justify-center shrink-0">
                  <LockIcon className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Ligação cifrada</p>
                  <p className="text-xs text-slate-400">
                    Comunicação protegida por TLS. Apenas pessoal autorizado acede aos detalhes.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 text-[11px] text-slate-400 flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3" />
              Acesso seguro · INGD / CENOE · Moçambique
            </div>
          </aside>

          {/* Painel direito — formulário */}
          <section className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
            {/* Tabs de modo */}
            <div className="flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800/60 mb-6">
              <button
                type="button"
                onClick={() => switchMode('login')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                  mode === 'login'
                    ? 'bg-white dark:bg-slate-900 text-navy dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => switchMode('register')}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
                  mode === 'register'
                    ? 'bg-white dark:bg-slate-900 text-navy dark:text-white shadow-sm'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
              >
                Registar
              </button>
            </div>

            {/* Cabeçalho do formulário */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-navy dark:text-white">
                {mode === 'register' ? 'Criar conta de cidadão' : 'Iniciar sessão'}
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                {mode === 'register'
                  ? 'Registe-se gratuitamente para comunicar ocorrências e acompanhar o estado das mesmas.'
                  : 'Introduza as suas credenciais de acesso.'}
              </p>
            </div>

            {/* Erro */}
            {error && (
              <div
                role="alert"
                className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-sm text-red-700 dark:text-red-300 flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-semibold">{error}</p>
                  {Object.entries(fieldErrors).length > 0 && (
                    <ul className="mt-1 list-disc pl-4 space-y-0.5 text-xs">
                      {Object.entries(fieldErrors).map(([field, message]) => (
                        <li key={field}>{message}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* Formulário */}
            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="space-y-4" aria-busy={loading}>
                <Field
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="nome@exemplo.mz"
                  autoComplete="username"
                  required
                  invalid={Boolean(fieldErrors.email)}
                  error={fieldErrors.email}
                />
                <Field
                  icon={Lock}
                  label="Palavra-passe"
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  invalid={Boolean(fieldErrors.password)}
                  error={fieldErrors.password}
                  trailing={showPasswordToggle}
                />

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(event) => setRememberMe(event.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-brand focus:ring-brand"
                    />
                    <span>Manter sessão iniciada</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-semibold py-2.5 px-4 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      A autenticar…
                    </>
                  ) : (
                    <>
                      Entrar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegisterSubmit} className="space-y-3.5" aria-busy={loading}>
                <Field
                  icon={User}
                  label="Nome completo"
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  placeholder="Nome e apelido"
                  autoComplete="name"
                  required
                  invalid={Boolean(fieldErrors.name)}
                  error={fieldErrors.name}
                />
                <Field
                  icon={Mail}
                  label="Email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="nome@exemplo.mz"
                  autoComplete="email"
                  required
                  invalid={Boolean(fieldErrors.email)}
                  error={fieldErrors.email}
                />
                <Field
                  icon={Lock}
                  label="Palavra-passe"
                  type={showPass ? 'text' : 'password'}
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  autoComplete="new-password"
                  required
                  invalid={Boolean(fieldErrors.password)}
                  error={fieldErrors.password}
                  trailing={showPasswordToggle}
                  hint="Use pelo menos 8 caracteres."
                />
                <Field
                  icon={Lock}
                  label="Confirmar palavra-passe"
                  type="password"
                  value={regPassConfirmation}
                  onChange={(e) => setRegPassConfirmation(e.target.value)}
                  placeholder="Repita a palavra-passe"
                  autoComplete="new-password"
                  required
                  invalid={Boolean(fieldErrors.password_confirmation)}
                  error={fieldErrors.password_confirmation}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-brand hover:bg-brand/90 text-white text-sm font-semibold py-2.5 px-4 shadow-sm transition-colors disabled:opacity-70 disabled:cursor-wait"
                >
                  {loading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      A criar conta…
                    </>
                  ) : (
                    <>
                      Criar conta
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed pt-1">
                  Ao criar conta declara que as informações fornecidas são verdadeiras.
                  Após o registo, poderá comunicar ocorrências e acompanhar o estado
                  das mesmas na plataforma.
                </p>
              </form>
            )}

            <p className="mt-6 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              Ao continuar, declara que tem autorização para acessar o sistema e que as suas
              acções serão registadas em auditoria.
            </p>
          </section>
        </div>
      </main>

      {/* Rodapé institucional */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0f1b2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
          <span>© {new Date().getFullYear()} INGD · CENOE · República de Moçambique</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
            Ligação segura · TLS 1.3
          </span>
        </div>
      </footer>
    </div>
  );
}

export default Login;