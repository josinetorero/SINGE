import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, 
  Home, 
  PlusCircle, 
  FileText, 
  Bell, 
  PhoneCall, 
  Sun, 
  Moon, 
  LogOut, 
  UserCheck, 
  ChevronDown,
  Menu,
  X,
  CheckCircle2
} from 'lucide-react';
import { useAuth, ROLES, DEMO_USERS } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export const CidadaoLayout = () => {
  const { user, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const navLinks = [
    { name: 'Início', path: '/cidadao/dashboard', icon: Home },
    { name: 'Comunicar Emergência', path: '/cidadao/reportar', icon: PlusCircle, highlight: true },
    { name: 'Minhas Ocorrências', path: '/cidadao/minhas-ocorrencias', icon: FileText },
    { name: 'Alertas & Segurança', path: '/cidadao/alertas', icon: Bell },
  ];

  const handleRoleChange = (roleKey) => {
    switchRole(roleKey);
    setShowRoleMenu(false);
    
    const targetRoute = {
      [ROLES.CIDADAO]: '/cidadao/dashboard',
      [ROLES.OPERADOR]: '/operador/dashboard',
      [ROLES.COORDENADOR]: '/coordenador/dashboard',
      [ROLES.AGENTE]: '/agente/missoes',
      [ROLES.ADMIN]: '/admin/utilizadores',
    }[roleKey];

    if (targetRoute) {
      navigate(targetRoute);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col bg-light dark:bg-dbg text-slate-800 dark:text-slate-100 transition-colors duration-200">
      {/* Faixa Superior de Emergência Nacional */}
      <div className="bg-navy text-white text-xs py-1.5 px-4 sm:px-8 flex items-center justify-between border-b border-navy-light/30">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
          </span>
          <span className="font-semibold text-slate-200">SINGE Nacional</span>
          <span className="hidden md:inline text-slate-400">| Instituto Nacional de Gestão e Redução do Risco de Desastres (INGD)</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-bold text-amber-300">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Linha Verde Gratuita: 198</span>
          </div>
        </div>
      </div>

      {/* Topbar Horizontal Principal */}
      <header className="sticky top-0 z-30 bg-white/95 dark:bg-dcard/95 backdrop-blur-md border-b border-slate-200 dark:border-dborder shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between py-3">
          {/* Logótipo */}
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-brand text-white shadow-glow">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-navy dark:text-white">SINGE</span>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 dark:bg-blue-900/50 text-brand dark:text-blue-300 rounded-full">
                  Cidadão
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 -mt-0.5">Portal Público de Emergências</p>
            </div>
          </div>

          {/* Links de Navegação Desktop */}
          <nav className="hidden md:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      link.highlight
                        ? 'bg-red-600 hover:bg-red-700 text-white shadow-md hover:shadow-lg'
                        : isActive
                        ? 'bg-brand/10 dark:bg-brand/20 text-brand dark:text-blue-400'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dhover'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Ações: Tema, RBAC Switcher, Perfil e Mobile Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Simulador RBAC Rápido */}
            <div className="relative">
              <button
                onClick={() => setShowRoleMenu(!showRoleMenu)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-dbg dark:hover:bg-dhover text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dborder transition-colors"
                title="Trocar perfil para testes"
              >
                <UserCheck className="w-3.5 h-3.5 text-brand" />
                <span className="hidden sm:inline">Modo:</span>
                <span className="font-bold underline text-brand">Cidadão</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showRoleMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dcard rounded-xl shadow-xl border border-slate-200 dark:border-dborder p-2 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-dborder mb-1">
                    Mudar para Perfil Institucional
                  </div>
                  {Object.keys(DEMO_USERS).map((key) => {
                    const demo = DEMO_USERS[key];
                    const isCurrent = user?.role === demo.role;
                    return (
                      <button
                        key={key}
                        onClick={() => handleRoleChange(key)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                          isCurrent 
                            ? 'bg-brand text-white font-semibold' 
                            : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dhover'
                        }`}
                      >
                        <div>
                          <div className="font-medium">{demo.roleTitle}</div>
                          <div className={`text-[10px] ${isCurrent ? 'text-blue-100' : 'text-slate-400'}`}>
                            {demo.name}
                          </div>
                        </div>
                        {isCurrent && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Toggle Tema */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dhover transition-colors"
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            {/* Avatar & Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-dborder">
              <img
                src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
                alt={user?.name || 'Cidadão'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-brand/30"
              />
              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                title="Terminar Sessão"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Menu Hambúrguer Mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dhover"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-dborder px-4 pt-2 pb-4 space-y-1 bg-white dark:bg-dcard">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                      link.highlight
                        ? 'bg-red-600 text-white'
                        : isActive
                        ? 'bg-brand/10 text-brand dark:bg-brand/20 dark:text-blue-400'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-dhover'
                    }`
                  }
                >
                  <Icon className="w-5 h-5" />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Conteúdo Principal do Cidadão */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8 animate-in fade-in duration-300">
        <Outlet />
      </main>

      {/* Rodapé Cidadão com Linhas de Emergência Nacionais */}
      <footer className="mt-auto bg-white dark:bg-dcard border-t border-slate-200 dark:border-dborder py-8 px-4 sm:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 font-bold text-navy dark:text-white">
              <ShieldAlert className="w-5 h-5 text-brand" />
              <span>SINGE - Sistema Inteligente de Gestão e Coordenação de Emergências</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Plataforma tecnológica de apoio ao CENOE e INGD para coordenação ágil e salvamento de vidas em Moçambique.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dbg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dborder">
              <span className="font-bold text-red-600 dark:text-red-400">198:</span> Bombeiros / SENSAP
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dbg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dborder">
              <span className="font-bold text-blue-600 dark:text-blue-400">112:</span> Polícia (PRM)
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-dbg text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-dborder">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">116:</span> Linha de Apoio
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CidadaoLayout;
