import React, { useEffect, useState } from 'react';
import {
  User,
  Lock,
  ArrowLeftRight,
  Eye,
  EyeOff,
  ShieldAlert,
  Sun,
  Moon,
  Radio,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

// Input pill reutilizável (mantém o estilo original, mas centraliza a lógica)
function PillInput({
  icon: IconCmp,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  invalid,
  trailing,
}) {
  return (
    <div className="w-full bg-white/85 dark:bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5 sm:py-3 flex items-center border border-white/80 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-brand/40 focus-within:bg-white dark:focus-within:bg-white/15 transition-all">
      <IconCmp className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
      <div className="w-px h-4 bg-slate-400/60 dark:bg-slate-500/60 mx-3 shrink-0" />
      <input
        type={type}
        aria-label={label}
        aria-invalid={invalid || undefined}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        className="bg-transparent flex-1 text-xs sm:text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-500 font-medium"
      />
      {trailing}
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

  const handleToggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
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

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#E9EEF5] dark:bg-[#0B1220] transition-colors duration-300 overflow-hidden font-sans">
      {/* Formas de fundo institucionais */}
      {/* 1. Arco azul-institucional no topo esquerdo */}
      <div
        className="absolute -top-24 -left-24 w-80 sm:w-[28rem] h-80 sm:h-[28rem] rounded-full opacity-50 dark:opacity-20 pointer-events-none blur-sm"
        style={{
          background: 'radial-gradient(circle, #2B6079 0%, #1D4ED8 55%, transparent 100%)',
        }}
      />

      {/* 2. Forma orgânica verde INGD no canto inferior esquerdo */}
      <div
        className="absolute -bottom-10 left-8 sm:left-24 w-52 sm:w-80 h-44 sm:h-64 rounded-[40px] rotate-[15deg] opacity-70 dark:opacity-25 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #15803d 0%, #0f766e 100%)',
          clipPath: 'polygon(0% 0%, 100% 30%, 80% 100%, 10% 90%)',
        }}
      />

      {/* 3. Painel geométrico navy à direita */}
      <div className="absolute -right-24 top-1/2 -translate-y-1/2 w-[480px] sm:w-[650px] h-[85vh] rounded-[48px] bg-[#1e3a5f] dark:bg-[#0f1b2e] opacity-30 dark:opacity-50 pointer-events-none hidden md:block" />

      {/* Topo: logo + tema */}
      <header className="absolute top-4 left-4 sm:top-6 sm:left-8 z-30 flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl bg-brand text-white flex items-center justify-center shadow-md shadow-brand/30">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div>
          <span className="font-extrabold text-base tracking-wider text-navy dark:text-white">SINGE</span>
          <span className="hidden sm:inline-block text-[11px] text-slate-500 dark:text-slate-400 ml-2 border-l border-slate-300 dark:border-slate-700 pl-2">
            Gestão de Emergências • Moçambique
          </span>
        </div>
      </header>

      <div className="absolute top-4 right-4 sm:top-6 sm:right-8 z-30 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          type="button"
          aria-label={theme === 'dark' ? 'Activar modo claro' : 'Activar modo escuro'}
          className="p-2.5 rounded-full bg-white/80 dark:bg-dcard/80 backdrop-blur-md shadow-md text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all border border-slate-200/50 dark:border-white/10"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>
      </div>

      {/* Cartão dual-panel */}
      <div className="relative w-full max-w-[880px] min-h-[480px] sm:min-h-[510px] rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-[0_20px_50px_rgba(16,42,67,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.55)] border border-white/60 dark:border-white/10 grid grid-cols-1 md:grid-cols-12 z-20 transition-all duration-300">
        {/* ======================= PAINEL ESQUERDO ======================= */}
        <div
          className="md:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl transition-all duration-300"
          style={{
            background:
              theme === 'dark'
                ? 'linear-gradient(135deg, rgba(22, 34, 53, 0.95) 0%, rgba(16, 26, 42, 0.93) 50%, rgba(12, 20, 34, 0.97) 100%)'
                : 'linear-gradient(135deg, #DDE9EE 0%, #E7F0F3 40%, #CFE0E6 75%, #B9D3DA 100%)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 dark:from-white/5 to-transparent pointer-events-none" />

          {/* Cabeçalho */}
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-white leading-none">
              {mode === 'register' ? 'Criar Conta' : 'Faça Login'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 font-medium">
              {mode === 'register'
                ? 'Registe-se como Cidadão para aceder aos serviços disponíveis na plataforma.'
                : 'Aceda à plataforma de coordenação e resposta a emergências.'}
            </p>
          </div>

          {/* Alerta de erro */}
          {error && (
            <div
              role="alert"
              className="relative z-10 my-2 p-3 rounded-xl bg-red-100/80 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs border border-red-200 dark:border-red-800 flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <div className="min-w-0">
                <p className="font-semibold">{error}</p>
                {Object.entries(fieldErrors).length > 0 && (
                  <ul className="mt-1 list-disc pl-4 space-y-0.5">
                    {Object.entries(fieldErrors).map(([field, message]) => (
                      <li key={field}>{message}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* Formulários */}
          {mode === 'register' ? (
            <form onSubmit={handleRegisterSubmit} className="relative z-10 space-y-3.5 my-5" aria-busy={loading}>
              <PillInput
                icon={User}
                label="Nome completo"
                value={regNome}
                onChange={(e) => setRegNome(e.target.value)}
                placeholder="nome completo"
                autoComplete="name"
                required
                invalid={Boolean(fieldErrors.name)}
              />
              <PillInput
                icon={User}
                label="Email"
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="e-mail institucional ou pessoal"
                autoComplete="email"
                required
                invalid={Boolean(fieldErrors.email)}
              />
              <PillInput
                icon={Lock}
                label="Palavra-passe"
                type={showPass ? 'text' : 'password'}
                value={regPass}
                onChange={(e) => setRegPass(e.target.value)}
                placeholder="definir palavra-passe"
                autoComplete="new-password"
                required
                invalid={Boolean(fieldErrors.password)}
                trailing={
                  <button
                    type="button"
                    aria-label={showPass ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                    onClick={() => setShowPass(!showPass)}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                }
              />
              <PillInput
                icon={Lock}
                label="Confirmar palavra-passe"
                type="password"
                value={regPassConfirmation}
                onChange={(e) => setRegPassConfirmation(e.target.value)}
                placeholder="confirmar palavra-passe"
                autoComplete="new-password"
                required
              />

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-8 py-2.5 rounded-full bg-gradient-to-r from-brand to-navy text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      A criar conta…
                    </>
                  ) : (
                    'Registar e Aceder'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleLoginSubmit} className="relative z-10 space-y-4 my-5 sm:my-7" aria-busy={loading}>
              <PillInput
                icon={User}
                label="Email"
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e-mail"
                autoComplete="username"
                required
                invalid={Boolean(fieldErrors.email)}
              />
              <PillInput
                icon={Lock}
                label="Palavra-passe"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="senha"
                autoComplete="current-password"
                required
                invalid={Boolean(fieldErrors.password)}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label={showPass ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                    className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 transition-colors"
                  >
                    {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                }
              />

              <div className="flex items-center gap-2 pl-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="w-4 h-4 rounded text-brand focus:ring-brand"
                  />
                  <span>Lembrar de mim</span>
                </label>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-9 py-2.5 rounded-full bg-gradient-to-r from-brand to-navy text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all inline-flex items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/60 border-t-white animate-spin" />
                      A autenticar…
                    </>
                  ) : (
                    'Entrar'
                  )}
                </button>
              </div>

            </form>
          )}

          {/* Rodapé institucional */}
          <div className="relative z-10 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2">
           
          </div>
        </div>

        {/* Botão central flutuante */}
        <div className="hidden md:flex absolute top-1/2 left-[58.333%] -translate-x-1/2 -translate-y-1/2 z-30">
          <button
            type="button"
            onClick={handleToggleMode}
            className="w-11 h-11 rounded-full bg-white dark:bg-dcard shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-90 hover:text-brand dark:hover:text-blue-400 transition-all cursor-pointer group"
            title="Alternar entre Entrar e Criar Conta"
            aria-label="Alternar entre entrar e criar conta"
          >
            <ArrowLeftRight className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" />
          </button>
        </div>

        {/* ======================= PAINEL DIREITO ======================= */}
        <div className="md:col-span-5 p-7 sm:p-10 flex flex-col justify-between items-center text-center bg-gradient-to-br from-[#1e3a5f] via-navy to-[#0f1b2e] text-white relative overflow-hidden transition-all duration-300">
          {/* Efeitos de luz */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* Topo */}
          <div className="w-full relative z-10 pt-2">
            <h2
              className="text-3xl sm:text-4xl font-black tracking-wide leading-none"
              style={{
                WebkitTextStroke: '1.2px rgba(96, 165, 250, 0.85)',
                color: 'transparent',
              }}
            >
              Bem Vindo
            </h2>

            <div className="mt-3 flex flex-col items-center">
              <p className="text-xl sm:text-2xl tracking-tight text-white flex items-center gap-2">
                <span className="font-normal text-slate-100">
                  {mode === 'register' ? 'Já tem' : 'Novo'}
                </span>
                <span className="font-extrabold relative inline-block text-white">
                  {mode === 'register' ? 'Conta' : 'Login'}
                  <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-brand rounded-full" />
                </span>
              </p>
            </div>
          </div>

          {/* Centro */}
          <div className="w-full relative z-10 my-6 space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 mx-auto">
              <ShieldCheck className="w-6 h-6 text-white/90" />
            </div>

            <p className="text-xs text-slate-200/90 font-medium">
              {mode === 'register'
                ? 'Possui credenciais de acesso?'
                : 'Não tem uma conta?'}
            </p>

            <button
              type="button"
              onClick={handleToggleMode}
              className="px-6 py-2 rounded-full bg-white/15 hover:bg-white/25 text-white font-semibold text-xs backdrop-blur-md border border-white/25 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {mode === 'register' ? 'Fazer Login' : 'Criar conta'}
            </button>

            
          </div>

          {/* Rodapé do painel direito */}
          <div className="relative z-10 text-[10px] text-slate-300/70 flex items-center gap-1.5">
           
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;