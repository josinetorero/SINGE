import React, { useState } from 'react';
import Icon from '../common/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { ROLE_LABEL } from '../../data/mockData';

export const MENUS = {
  operador: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'ocorrencias', label: 'Ocorrências', icon: 'FileText' },
    { id: 'registar', label: 'Registar ocorrência', icon: 'PlusCircle' },
    { id: 'notificacoes', label: 'Notificações', icon: 'Bell' },
    { id: 'relatorios', label: 'Relatórios', icon: 'BarChart3' },
    { id: 'definicoes', label: 'Definições', icon: 'Settings' },
  ],
  coordenador: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'ocorrencias', label: 'Ocorrências', icon: 'FileText' },
    { id: 'prioridades', label: 'Avaliação de prioridades', icon: 'AlertTriangle' },
    { id: 'equipas', label: 'Equipas', icon: 'Users' },
    { id: 'missoes', label: 'Missões', icon: 'Target' },
    { id: 'relatorios', label: 'Relatórios', icon: 'BarChart3' },
    { id: 'historico', label: 'Histórico operacional', icon: 'History' },
    { id: 'notificacoes', label: 'Notificações', icon: 'Bell' },
    { id: 'definicoes', label: 'Definições', icon: 'Settings' },
  ],
  agente: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'missoes', label: 'As minhas missões', icon: 'Target' },
    { id: 'atualizar', label: 'Actualizações', icon: 'RefreshCw' },
    { id: 'notificacoes', label: 'Notificações', icon: 'Bell' },
    { id: 'definicoes', label: 'Definições', icon: 'Settings' },
  ],
  administrador: [
    { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { id: 'ocorrencias', label: 'Ocorrências', icon: 'FileText' },
    { id: 'missoes', label: 'Missões', icon: 'Target' },
    { id: 'equipas', label: 'Equipas', icon: 'Users' },
    { id: 'utilizadores', label: 'Utilizadores', icon: 'UserCog' },
    { id: 'relatorios', label: 'Relatórios', icon: 'BarChart3' },
    { id: 'historico', label: 'Histórico', icon: 'History' },
    { id: 'notificacoes', label: 'Notificações', icon: 'Bell' },
    { id: 'definicoes', label: 'Definições', icon: 'Settings' },
  ],
};

export function InstitutionalLayout({ role, user, page, setPage, onLogout, children }) {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const menu = MENUS[role] || [];
  const title = menu.find(m => m.id === page)?.label || 'Dashboard';
  const closeAll = () => { setNotifOpen(false); setUserMenu(false); };

  return (
    <div className="min-h-screen flex bg-light dark:bg-dbg">
      {/* Backdrop Mobile */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden" 
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Esquerda Fixa */}
      <aside 
        className={`fixed md:sticky top-0 h-screen z-40 bg-navy dark:bg-dsidebar text-white flex flex-col transition-all duration-200 ${
          collapsed ? 'md:w-16' : 'md:w-64'
        } w-64 ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="h-16 flex items-center gap-2 px-4 border-b border-white/10 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center shrink-0">
            <Icon name="ShieldAlert" size={20} />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="font-bold text-sm leading-tight">SINGE</p>
              <p className="text-[10px] text-white/60 leading-tight">Gestão de Emergências</p>
            </div>
          )}
        </div>

        <nav className="flex-1 py-3 overflow-y-auto">
          {menu.map(m => {
            const active = page === m.id;
            return (
              <button 
                key={m.id} 
                onClick={() => { setPage(m.id); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors border-l-2 ${
                  active 
                    ? 'bg-white/10 border-brand text-white' 
                    : 'border-transparent text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon name={m.icon} size={18} />
                {!collapsed && <span className="truncate">{m.label}</span>}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-white/10 space-y-1">
          <button 
            onClick={() => setCollapsed(c => !c)} 
            className="hidden md:flex w-full items-center gap-2 px-2 py-2 text-xs text-white/60 hover:text-white rounded"
          >
            <Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={16} />
            {!collapsed && <span>Recolher menu</span>}
          </button>
          <button 
            onClick={onLogout} 
            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-white/70 hover:text-white rounded"
          >
            <Icon name="LogOut" size={18} />
            {!collapsed && <span>Terminar sessão</span>}
          </button>
        </div>
      </aside>

      {/* Conteúdo à Direita */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 h-16 bg-white dark:bg-dcard border-b border-bd dark:border-dborder flex items-center gap-2 md:gap-3 px-3 md:px-6">
          <button className="md:hidden p-2 text-ink dark:text-dink" onClick={() => setMobileOpen(true)}>
            <Icon name="Menu" size={20} />
          </button>
          
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-ink dark:text-dink truncate text-sm md:text-base">{title}</h1>
            <p className="text-xs text-muted dark:text-dmuted hidden sm:block">SINGE · Moçambique</p>
          </div>

          <div className="hidden lg:flex items-center relative">
            <Icon name="Search" size={16} className="absolute left-3 text-muted dark:text-dmuted pointer-events-none" />
            <input 
              placeholder="Pesquisar..." 
              className="w-56 xl:w-64 pl-9 pr-3 py-2 text-sm rounded-lg border border-bd dark:border-dborder bg-light dark:bg-dbg text-ink dark:text-dink focus:outline-none focus:ring-2 focus:ring-brand/40" 
            />
          </div>

          {/* Toggle de Tema */}
          <button 
            onClick={toggleTheme} 
            title="Alternar tema" 
            className="p-2 rounded-lg hover:bg-light dark:hover:bg-dsidebar text-ink dark:text-dink"
          >
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={18} />
          </button>

          {/* Notificações */}
          <div className="relative">
            <button 
              onClick={() => { setNotifOpen(o => !o); setUserMenu(false); }} 
              className="p-2 rounded-lg hover:bg-light dark:hover:bg-dsidebar relative text-ink dark:text-dink"
            >
              <Icon name="Bell" size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-dcard border border-bd dark:border-dborder rounded-xl shadow-xl p-3 z-30">
                <p className="font-semibold text-sm mb-2 text-ink dark:text-dink">Notificações</p>
                {[
                  ['Nova missão atribuída', 'MS-2025-0030 · Agente', 'warning'],
                  ['Ocorrência crítica', 'OC-2025-0142 · Ciclone Filipe', 'error'],
                  ['Actualização de missão', 'MS-2025-0031 concluída', 'ok']
                ].map(([t, d], i) => (
                  <div key={i} className="flex gap-2 p-2 rounded-lg hover:bg-light dark:hover:bg-dsidebar">
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${i === 1 ? 'bg-red-500' : i === 0 ? 'bg-orange-500' : 'bg-green-500'}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-ink dark:text-dink">{t}</p>
                      <p className="text-xs text-muted dark:text-dmuted truncate">{d}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Menu do Utilizador */}
          <div className="relative">
            <button 
              onClick={() => { setUserMenu(o => !o); setNotifOpen(false); }} 
              className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-light dark:hover:bg-dsidebar"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-ink dark:text-dink leading-tight truncate max-w-[120px]">{user.nome}</p>
                <p className="text-xs text-muted dark:text-dmuted leading-tight truncate max-w-[120px]">{ROLE_LABEL[role]}</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-semibold text-sm">
                {user.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            </button>
            {userMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dcard border border-bd dark:border-dborder rounded-xl shadow-xl py-1 z-30">
                <button 
                  onClick={() => { setPage('definicoes'); setUserMenu(false); }} 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-light dark:hover:bg-dsidebar text-ink dark:text-dink flex items-center gap-2"
                >
                  <Icon name="User" size={16} />Ver perfil
                </button>
                <button 
                  onClick={onLogout} 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-light dark:hover:bg-dsidebar text-red-600 flex items-center gap-2"
                >
                  <Icon name="LogOut" size={16} />Terminar sessão
                </button>
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 p-3 md:p-6 overflow-x-hidden" onClick={() => { if (notifOpen || userMenu) closeAll(); }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default InstitutionalLayout;
