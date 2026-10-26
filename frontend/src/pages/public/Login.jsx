import React, { useState } from 'react';
import { 
  User, 
  Lock, 
  ArrowLeftRight, 
  Eye, 
  EyeOff, 
  ShieldAlert, 
  Check, 
  Sun, 
  Moon, 
  Sparkles, 
  Shield, 
  Users, 
  Activity,
  ArrowRight,
  Radio,
  FileText,
  Target,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useToast } from '../../contexts/ToastContext';

export function Login({ onLogin }) {
  const { theme, toggleTheme } = useTheme();
  const toast = useToast();

  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'demo'
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Campos de login
  const [username, setUsername] = useState('ana.sitoe@singe.gov.mz');
  const [password, setPassword] = useState('demo1234');

  // Campos de registo
  const [regNome, setRegNome] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPass, setRegPass] = useState('');
  const [regRole, setRegRole] = useState('cidadao');

  // Perfis institucionais de demonstração rápida (SINGE)
  const demoProfiles = [
    { id: 'operador', name: 'Ana Sitoe', role: 'Operador de Emergência', tag: 'CENOE Sala de Operações', icon: FileText, color: 'text-blue-500' },
    { id: 'coordenador', name: 'Carlos Mabunda', role: 'Coordenador Operacional', tag: 'Direcção INGD', icon: ShieldAlert, color: 'text-indigo-500' },
    { id: 'cidadao', name: 'Maria João Tembe', role: 'Cidadão / Munícipe', tag: 'Comunidade & Alertas', icon: Users, color: 'text-emerald-500' },
    { id: 'agente', name: 'João Nhampossa', role: 'Agente de Resposta', tag: 'SENSAP / Bombeiros', icon: Target, color: 'text-amber-500' },
    { id: 'administrador', name: 'Pedro Chirindza', role: 'Administrador do Sistema', tag: 'Segurança & Auditoria', icon: ShieldCheck, color: 'text-purple-500' },
  ];

  // Alternar entre modo login e modo registo
  const handleToggleMode = () => {
    setMode(prev => (prev === 'login' ? 'register' : 'login'));
  };

  // Submissão do login
  const handleLoginSubmit = (e) => {
    e.preventDefault();

    if (!username.trim() || !password.trim()) {
      toast?.error ? toast.error('Por favor, preencha o utilizador e a senha.') : alert('Preencha utilizador e senha.');
      return;
    }

    // Detectar perfil com base no email ou padrão operador
    const emailLower = username.toLowerCase();
    let selectedRole = 'operador';

    if (emailLower.includes('coordenador') || emailLower.includes('carlos') || emailLower.includes('fatima')) {
      selectedRole = 'coordenador';
    } else if (emailLower.includes('agente') || emailLower.includes('joao') || emailLower.includes('mateus') || emailLower.includes('bombeiros')) {
      selectedRole = 'agente';
    } else if (emailLower.includes('admin') || emailLower.includes('pedro') || emailLower.includes('yumin')) {
      selectedRole = 'administrador';
    } else if (emailLower.includes('cidadao') || emailLower.includes('maria') || emailLower.includes('amelia') || emailLower.includes('gmail')) {
      selectedRole = 'cidadao';
    }

    if (onLogin) {
      onLogin(selectedRole);
    }
  };

  // Submissão de registo de cidadão
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regNome.trim() || !regEmail.trim() || !regPass.trim()) {
      toast?.error ? toast.error('Por favor, preencha todos os campos.') : alert('Preencha todos os campos.');
      return;
    }
    toast?.success ? toast.success(`Conta criada com sucesso! Bem-vindo(a), ${regNome}.`) : alert('Conta criada!');
    if (onLogin) {
      onLogin(regRole);
    }
  };

  // Login com 1 clique num perfil específico
  const handleQuickLogin = (roleId) => {
    if (onLogin) {
      onLogin(roleId);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-[#E9EEF5] dark:bg-[#0B1220] transition-colors duration-300 overflow-hidden font-sans select-none">
      
      {/* Elementos Orgânicos de Fundo conforme a imagem de referência */}
      {/* 1. Forma curva roxa/lavanda no topo esquerdo */}
      <div 
        className="absolute -top-16 -left-16 sm:-top-24 sm:-left-24 w-72 sm:w-96 h-72 sm:h-96 rounded-full opacity-60 dark:opacity-25 pointer-events-none blur-sm"
        style={{
          background: 'radial-gradient(circle, #9d8ec7 0%, #7c6ca7 60%, transparent 100%)'
        }}
      />

      {/* 2. Forma orgânica verde/esmeralda no canto inferior esquerdo */}
      <div 
        className="absolute -bottom-10 left-8 sm:left-24 w-52 sm:w-80 h-44 sm:h-64 rounded-[40px] rotate-[15deg] opacity-75 dark:opacity-30 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, #2ea378 0%, #15803d 100%)',
          clipPath: 'polygon(0% 0%, 100% 30%, 80% 100%, 10% 90%)'
        }}
      />

      {/* 3. Painel geométrico ardósia/navy de fundo à direita */}
      <div 
        className="absolute -right-24 top-1/2 -translate-y-1/2 w-[480px] sm:w-[650px] h-[85vh] rounded-[48px] bg-[#617482] dark:bg-[#131d2e] opacity-40 dark:opacity-50 pointer-events-none hidden md:block"
      />

      {/* Top Bar com Logo SINGE e Botão de Tema */}
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
          className="p-2.5 rounded-full bg-white/80 dark:bg-dcard/80 backdrop-blur-md shadow-md text-slate-700 dark:text-slate-200 hover:scale-105 active:scale-95 transition-all border border-slate-200/50 dark:border-white/10"
          title="Alternar Tema Claro / Escuro"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* CARTÃO CENTRAL DUAL-PANEL (Estilo idêntico à imagem de referência com cores do sistema) */}
      <div className="relative w-full max-w-[880px] min-h-[480px] sm:min-h-[510px] rounded-[32px] sm:rounded-[36px] overflow-hidden shadow-[0_20px_50px_rgba(16,42,67,0.18)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.55)] border border-white/60 dark:border-white/10 grid grid-cols-1 md:grid-cols-12 z-20 transition-all duration-300">
        
        {/* ========================================================
            LADO ESQUERDO: PAINEL PRINCIPAL (Glassmorphism & Inputs)
            ======================================================== */}
        <div 
          className="md:col-span-7 p-7 sm:p-10 lg:p-12 flex flex-col justify-between relative overflow-hidden backdrop-blur-xl transition-all duration-300"
          style={{
            background: theme === 'dark'
              ? 'linear-gradient(135deg, rgba(22, 34, 53, 0.94) 0%, rgba(16, 26, 42, 0.92) 50%, rgba(12, 20, 34, 0.96) 100%)'
              : 'linear-gradient(135deg, #C2DFE3 0%, #CFE6E8 35%, #B7D9DD 70%, #9BC4C9 100%)'
          }}
        >
          {/* Reflexo sutil de vidro interno */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/30 dark:from-white/5 to-transparent pointer-events-none" />

          {/* Cabeçalho do Painel Esquerdo */}
          <div className="relative z-10">
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-navy dark:text-white leading-none">
              {mode === 'register' ? 'Criar Conta' : 'Faça Login'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1.5 font-medium">
              {mode === 'register' 
                ? 'Registe-se como cidadão para reportar e acompanhar alertas.'
                : 'Aceda à plataforma de coordenação e resposta a emergências.'}
            </p>
          </div>

          {/* Formulário Principal */}
          {mode === 'register' ? (
            /* Formulário de Registo */
            <form onSubmit={handleRegisterSubmit} className="relative z-10 space-y-3.5 my-5">
              {/* Input Nome */}
              <div className="w-full bg-white/75 dark:bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5 sm:py-3 flex items-center border border-white/80 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-brand/40 focus-within:bg-white dark:focus-within:bg-white/15 transition-all">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                <div className="w-[1.5px] h-3.5 bg-slate-400/50 dark:bg-slate-500/50 mx-3 shrink-0" />
                <input
                  type="text"
                  value={regNome}
                  onChange={(e) => setRegNome(e.target.value)}
                  placeholder="nome completo"
                  className="bg-transparent flex-1 text-xs sm:text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-500 font-medium"
                  required
                />
              </div>

              {/* Input Email */}
              <div className="w-full bg-white/75 dark:bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5 sm:py-3 flex items-center border border-white/80 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-brand/40 focus-within:bg-white dark:focus-within:bg-white/15 transition-all">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                <div className="w-[1.5px] h-3.5 bg-slate-400/50 dark:bg-slate-500/50 mx-3 shrink-0" />
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="e-mail institucional ou pessoal"
                  className="bg-transparent flex-1 text-xs sm:text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-500 font-medium"
                  required
                />
              </div>

              {/* Input Senha */}
              <div className="w-full bg-white/75 dark:bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5 sm:py-3 flex items-center border border-white/80 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-brand/40 focus-within:bg-white dark:focus-within:bg-white/15 transition-all">
                <Lock className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                <div className="w-[1.5px] h-3.5 bg-slate-400/50 dark:bg-slate-500/50 mx-3 shrink-0" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={regPass}
                  onChange={(e) => setRegPass(e.target.value)}
                  placeholder="definir palavra-passe"
                  className="bg-transparent flex-1 text-xs sm:text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-500 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 transition-colors"
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Botão Registar */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-8 py-2.5 rounded-full bg-gradient-to-r from-[#2B6079] via-brand to-navy text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Registar e Aceder
                </button>
              </div>
            </form>
          ) : (
            /* Formulário Clássico de Login (Estilo do print) */
            <form onSubmit={handleLoginSubmit} className="relative z-10 space-y-4 my-5 sm:my-7">
              {/* Campo Usuário com ícone de perfil e divisória | */}
              <div className="w-full bg-white/75 dark:bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5 sm:py-3 flex items-center border border-white/80 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-brand/40 focus-within:bg-white dark:focus-within:bg-white/15 transition-all">
                <User className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                <div className="w-[1.5px] h-4 bg-slate-400/60 dark:bg-slate-500/60 mx-3 shrink-0" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="usuário ou e-mail"
                  className="bg-transparent flex-1 text-xs sm:text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-500 font-medium"
                  required
                />
              </div>

              {/* Campo Senha com ícone de cadeado e divisória | */}
              <div className="w-full bg-white/75 dark:bg-white/10 backdrop-blur-md rounded-full px-4 py-2.5 sm:py-3 flex items-center border border-white/80 dark:border-white/10 shadow-sm focus-within:ring-2 focus-within:ring-brand/40 focus-within:bg-white dark:focus-within:bg-white/15 transition-all">
                <Lock className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />
                <div className="w-[1.5px] h-4 bg-slate-400/60 dark:bg-slate-500/60 mx-3 shrink-0" />
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="senha"
                  className="bg-transparent flex-1 text-xs sm:text-sm outline-none text-slate-800 dark:text-white placeholder:text-slate-500 font-medium"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 p-1 transition-colors"
                  title={showPass ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
                >
                  {showPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {/* Checkbox Lembrar de mim */}
              <div className="flex items-center gap-2 pl-1">
                <label 
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-700 dark:text-slate-300 font-medium"
                >
                  <span className={`w-4 h-4 rounded flex items-center justify-center border transition-all ${
                    rememberMe 
                      ? 'bg-navy dark:bg-brand border-navy dark:border-brand text-white' 
                      : 'border-slate-400 dark:border-slate-600 bg-white/50'
                  }`}>
                    {rememberMe && <Check className="w-3 h-3 stroke-[3]" />}
                  </span>
                  <span>Lembrar de mim</span>
                </label>
              </div>

              {/* Botão Entrar arredondado (Pill Button no estilo do print) */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="px-9 py-2.5 rounded-full bg-gradient-to-r from-[#3D7A80] via-[#2A6570] to-navy text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  Entrar
                </button>
              </div>

              {/* Link Esqueci minha senha */}
              <div>
                <button
                  type="button"
                  onClick={() => toast?.info ? toast.info('A recuperação requer contacto com o administrador do CENOE / INGD.') : alert('Contacto institucional: suporte@singe.gov.mz')}
                  className="text-[11px] sm:text-xs text-navy dark:text-blue-300 hover:text-brand font-semibold underline underline-offset-2 transition-colors cursor-pointer"
                >
                  Esqueci minha senha
                </button>
              </div>
            </form>
          )}

          {/* Rodapé institucional discreto no lado esquerdo */}
          <div className="relative z-10 text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-2">
            <Radio className="w-3 h-3 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>Sistema Operacional de Emergência • INGD / CENOE</span>
          </div>
        </div>

        {/* ========================================================
            BOTÃO CENTRAL CIRCULAR FLUTUANTE DE TROCA (⇄)
            ======================================================== */}
        <div className="hidden md:flex absolute top-1/2 left-[58.333%] -translate-x-1/2 -translate-y-1/2 z-30">
          <button
            type="button"
            onClick={handleToggleMode}
            className="w-11 h-11 rounded-full bg-white dark:bg-dcard shadow-xl border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200 hover:scale-110 active:scale-90 hover:text-brand dark:hover:text-blue-400 transition-all cursor-pointer group"
            title="Alternar entre Entrar e Criar Conta"
          >
            <ArrowLeftRight className="w-5 h-5 transition-transform group-hover:rotate-180 duration-300" />
          </button>
        </div>

        {/* ========================================================
            LADO DIREITO: PAINEL SECUNDÁRIO (Cores do Sistema / Navy)
            ======================================================== */}
        <div className="md:col-span-5 p-7 sm:p-10 flex flex-col justify-between items-center text-center bg-[#425866] dark:bg-navy text-white relative overflow-hidden transition-all duration-300">
          
          {/* Efeitos de luz no fundo do lado direito */}
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-brand/25 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-400/15 rounded-full blur-3xl pointer-events-none" />

          {/* Topo do Lado Direito */}
          <div className="w-full relative z-10 pt-2">
            {/* Texto "Bem Vindo" vazado / contorno (Outline text conforme print) */}
            <h2 
              className="text-3xl sm:text-4xl font-black tracking-wide leading-none"
              style={{
                WebkitTextStroke: '1.2px rgba(255, 255, 255, 0.8)',
                color: 'transparent'
              }}
            >
              Bem Vindo
            </h2>

            {/* Texto "Novo Login" com traço exatamente sob Login conforme imagem de referência */}
            <div className="mt-3 flex flex-col items-center">
              <p className="text-xl sm:text-2xl tracking-tight text-white flex items-center gap-2">
                <span className="font-normal text-slate-100">{mode === 'register' ? 'Já tem' : 'Novo'}</span>
                <span className="font-extrabold relative inline-block text-white">
                  {mode === 'register' ? 'Conta' : 'Login'}
                  <span className="absolute left-0 -bottom-1 w-full h-[3px] bg-white rounded-full" />
                </span>
              </p>
            </div>
          </div>

          {/* Secção Central: Alternância e Botão Criar Conta */}
          <div className="w-full relative z-10 my-6 space-y-4">
            <p className="text-xs text-slate-200/90 font-medium">
              {mode === 'register' ? 'Possui credenciais de acesso?' : 'Não tem uma conta?'}
            </p>

            <button
              type="button"
              onClick={handleToggleMode}
              className="px-6 py-2 rounded-full bg-white/20 hover:bg-white/30 text-white font-semibold text-xs backdrop-blur-md border border-white/25 shadow-sm hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {mode === 'register' ? 'Fazer Login' : 'Criar conta'}
            </button>

            {/* Divisor "ou" */}
            <div className="flex items-center justify-center gap-2.5 pt-2 text-slate-300">
              <div className="w-8 h-[1px] bg-white/20" />
              <span className="text-[11px] font-medium text-slate-200">ou</span>
              <div className="w-8 h-[1px] bg-white/20" />
            </div>

            {/* Ícones de redes sociais conforme imagem de referência (Facebook e Google) */}
            <div className="flex items-center justify-center gap-3 pt-1">
              {/* Facebook Icon */}
              <button
                type="button"
                onClick={() => toast?.info ? toast.info('Autenticação com Facebook') : null}
                className="w-7 h-7 rounded-md bg-[#1877F2] hover:bg-[#166fe5] text-white flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all font-bold text-xs"
                title="Autenticar com Facebook"
              >
                f
              </button>

              {/* Google Icon */}
              <button
                type="button"
                onClick={() => toast?.info ? toast.info('Autenticação com Google') : null}
                className="w-7 h-7 rounded-full bg-white hover:bg-slate-100 text-slate-800 flex items-center justify-center shadow-md hover:scale-110 active:scale-90 transition-all font-bold text-xs"
                title="Autenticar com Google"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Secção de Atalho Rápido para os 5 Perfis RBAC (SINGE Demo) */}
          <div className="w-full relative z-10 pt-3 border-t border-white/10">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300/80 mb-2">
              Acesso Rápido de Teste (1 Clique)
            </p>
            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {demoProfiles.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleQuickLogin(p.id)}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-[10px] font-medium transition-all hover:scale-105 active:scale-95 border border-white/15"
                  title={`Entrar como ${p.name} (${p.role})`}
                >
                  {p.role.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Login;
