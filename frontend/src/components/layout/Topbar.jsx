import React, { useState } from 'react';
import { 
  Sun, 
  Moon, 
  Bell, 
  Search, 
  LogOut, 
  ShieldAlert, 
  ChevronDown, 
  UserCheck, 
  AlertTriangle,
  Radio,
  CheckCircle2
} from 'lucide-react';
import { useAuth, ROLES, DEMO_USERS } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';

export const Topbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, role, switchRole, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Nova Ocorrência Crítica',
      desc: 'Inundação residencial em KaMaxakeni com pessoas ilhadas.',
      time: 'Há 5 min',
      type: 'critica'
    },
    {
      id: 2,
      title: 'Alerta Meteorológico',
      desc: 'Aviso de cheias emitido pelo INGD para Sofala.',
      time: 'Há 25 min',
      type: 'aviso'
    },
    {
      id: 3,
      title: 'Missão Aceite',
      desc: 'Equipa Alfa a caminho do local de intervenção.',
      time: 'Há 40 min',
      type: 'sucesso'
    }
  ];

  const handleRoleChange = (roleKey) => {
    switchRole(roleKey);
    setShowRoleMenu(false);
    
    // Redireciona para a página inicial do perfil selecionado
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
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white dark:bg-dcard border-b border-slate-200 dark:border-dborder shadow-soft transition-colors duration-200">
      {/* Lado Esquerdo: Pesquisa Rápida */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Pesquisar ocorrência, código (ex: OC-2026-001) ou equipa..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 dark:bg-dbg border border-transparent dark:border-dborder rounded-lg focus:outline-none focus:ring-2 focus:ring-brand/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
        </div>
      </div>

      {/* Lado Direito: Ações Globais */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Simulador Rápido de Perfil (RBAC Switcher) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleMenu(!showRoleMenu);
              setShowNotifications(false);
              setShowUserMenu(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg bg-brand/10 hover:bg-brand/20 text-brand dark:bg-brand/20 dark:hover:bg-brand/30 dark:text-blue-300 border border-brand/20 transition-colors"
            title="Simular outro perfil de acesso"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Perfil:</span>
            <span className="font-bold underline">{user?.roleTitle || role}</span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-dcard rounded-xl shadow-xl border border-slate-200 dark:border-dborder p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-dborder mb-1">
                Simulador RBAC (Trocar Perfil)
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

        {/* Toggle Dark Mode */}
        <button
          onClick={toggleTheme}
          aria-label="Alternar modo claro e escuro"
          className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dhover transition-colors"
          title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-amber-400 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-5 h-5 text-slate-600 transition-transform hover:-rotate-12" />
          )}
        </button>

        {/* Central de Notificações */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleMenu(false);
              setShowUserMenu(false);
            }}
            className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-dhover transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-dcard animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-dcard rounded-xl shadow-xl border border-slate-200 dark:border-dborder p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-dborder">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-brand animate-pulse" /> Alertas Operacionais
                </span>
                <span className="text-[11px] text-brand font-medium cursor-pointer hover:underline">
                  Marcar como lidas
                </span>
              </div>
              <div className="divide-y divide-slate-100 dark:divide-dborder mt-1">
                {notifications.map((n) => (
                  <div key={n.id} className="py-2.5 px-2 hover:bg-slate-50 dark:hover:bg-dhover rounded-lg transition-colors cursor-pointer">
                    <div className="flex items-start gap-2.5">
                      <div className={`p-1.5 rounded-md mt-0.5 ${
                        n.type === 'critica' ? 'bg-red-100 dark:bg-red-950/60 text-red-600' :
                        n.type === 'aviso' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-600' :
                        'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                      }`}>
                        {n.type === 'critica' ? <AlertTriangle className="w-3.5 h-3.5" /> : <ShieldAlert className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-800 dark:text-slate-100">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">{n.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Menu do Utilizador */}
        <div className="relative border-l border-slate-200 dark:border-dborder pl-2 md:pl-3">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowRoleMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-dhover transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'}
              alt={user?.name || 'Utilizador'}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-brand/30"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">{user?.roleTitle}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-dcard rounded-xl shadow-xl border border-slate-200 dark:border-dborder p-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-dborder mb-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-bold rounded bg-slate-100 dark:bg-dbg text-slate-600 dark:text-slate-300">
                  {user?.department}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Terminar Sessão
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Topbar;
