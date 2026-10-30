import React, { useState } from 'react';
import Icon from '../common/Icon';
import { useTheme } from '../../contexts/ThemeContext';
import { CIDADAO_NOTIFICACOES } from '../../data/mockData';

export function CitizenLayout({ user, page, setPage, onLogout, children }) {
  const { theme, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);

  const nav = [
    { id: 'dashboard', label: 'Início', icon: 'Home' },
    { id: 'comunicar', label: 'Comunicar emergência', icon: 'AlertCircle' },
    { id: 'minhas-ocorrencias', label: 'As minhas ocorrências', icon: 'FileText' },
    { id: 'alertas', label: 'Alertas e avisos', icon: 'Bell' },
    { id: 'informacoes', label: 'Informações de segurança', icon: 'BookOpen' },
  ];
  const closeAll = () => { setNotifOpen(false); setUserMenu(false); };

  return (
    <div className="min-h-screen flex flex-col bg-light dark:bg-dbg">
      <header className="sticky top-0 z-30 bg-white dark:bg-dcard border-b border-bd dark:border-dborder">
        <div className="h-16 flex items-center gap-3 px-4 md:px-6">
          <button onClick={() => setPage('dashboard')} className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-brand flex items-center justify-center text-white">
              <Icon name="ShieldAlert" size={20} />
            </div>
            <div className="hidden sm:block text-left">
              <p className="font-bold text-sm text-ink dark:text-dink leading-tight">SINGE</p>
              <p className="text-[10px] text-muted dark:text-dmuted leading-tight">Gestão de Emergências</p>
            </div>
          </button>

          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {nav.map(n => (
              <button 
                key={n.id} 
                data-testid={`nav-${n.id}`}
                onClick={() => setPage(n.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  page === n.id 
                    ? 'bg-lblue dark:bg-dblue/20 text-brand dark:text-dblue' 
                    : 'text-ink dark:text-dink hover:bg-light dark:hover:bg-dsidebar'
                }`}
              >
                {n.label}
              </button>
            ))}
          </nav>

          <div className="flex-1" />

          {/* Toggle de Tema */}
          <button 
            onClick={toggleTheme} 
            className="p-2 rounded-lg hover:bg-light dark:hover:bg-dsidebar text-ink dark:text-dink"
            title="Alternar tema"
          >
            <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={18} />
          </button>

          {/* Notificações do Cidadão */}
          <div className="relative">
            <button 
              onClick={() => { setNotifOpen(o => !o); setUserMenu(false); }} 
              className="p-2 rounded-lg hover:bg-light dark:hover:bg-dsidebar relative text-ink dark:text-dink"
            >
              <Icon name="Bell" size={18} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-full mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white dark:bg-dcard border border-bd dark:border-dborder rounded-xl shadow-xl p-3 z-40">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-sm text-ink dark:text-dink">Notificações</p>
                  <button onClick={() => { setPage('notificacoes'); setNotifOpen(false); }} className="text-xs text-brand dark:text-dblue hover:underline">
                    Ver todas
                  </button>
                </div>
                {CIDADAO_NOTIFICACOES.slice(0, 3).map(n => (
                  <button 
                    key={n.id} 
                    onClick={() => { setPage('notificacoes'); setNotifOpen(false); }} 
                    className="w-full text-left flex gap-2 p-2 rounded-lg hover:bg-light dark:hover:bg-dsidebar"
                  >
                    <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.lida ? 'bg-red-500' : 'bg-transparent'}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-ink dark:text-dink">{n.titulo}</p>
                      <p className="text-xs text-muted dark:text-dmuted truncate">{n.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Menu de Utilizador */}
          <div className="relative">
            <button 
              onClick={() => { setUserMenu(o => !o); setNotifOpen(false); }} 
              className="flex items-center gap-2 p-1 pl-2 rounded-lg hover:bg-light dark:hover:bg-dsidebar"
            >
              <div className="hidden sm:block text-right">
                <p className="text-sm font-medium text-ink dark:text-dink leading-tight truncate max-w-[110px]">{user.nome}</p>
                <p className="text-xs text-muted dark:text-dmuted leading-tight">Cidadão</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-navy text-white flex items-center justify-center font-semibold text-sm">
                {user.nome.split(' ').map(n => n[0]).slice(0, 2).join('')}
              </div>
            </button>
            {userMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-dcard border border-bd dark:border-dborder rounded-xl shadow-xl py-1 z-40">
                <button 
                  onClick={() => { setPage('perfil'); setUserMenu(false); }} 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-light dark:hover:bg-dsidebar text-ink dark:text-dink flex items-center gap-2"
                >
                  <Icon name="User" size={16} />O meu perfil
                </button>
                <button 
                  onClick={() => { setPage('notificacoes'); setUserMenu(false); }} 
                  className="w-full text-left px-4 py-2 text-sm hover:bg-light dark:hover:bg-dsidebar text-ink dark:text-dink flex items-center gap-2"
                >
                  <Icon name="Bell" size={16} />Notificações
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

          {/* Botão Mobile */}
          <button className="lg:hidden p-2 text-ink dark:text-dink" onClick={() => setMobileOpen(o => !o)}>
            <Icon name={mobileOpen ? 'X' : 'Menu'} size={20} />
          </button>
        </div>

        {mobileOpen && (
          <div className="lg:hidden border-t border-bd dark:border-dborder bg-white dark:bg-dcard">
            {nav.map(n => (
              <button 
                key={n.id} 
                onClick={() => { setPage(n.id); setMobileOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm border-b border-bd dark:border-dborder last:border-0 flex items-center gap-2 ${
                  page === n.id 
                    ? 'bg-lblue/50 dark:bg-dblue/10 text-brand dark:text-dblue font-medium' 
                    : 'text-ink dark:text-dink'
                }`}
              >
                <Icon name={n.icon} size={16} />
                <span>{n.label}</span>
              </button>
            ))}
          </div>
        )}
      </header>

      <main className="flex-1 p-4 md:p-6" onClick={() => { if (notifOpen || userMenu) closeAll(); }}>
        {children}
      </main>

      <footer className="bg-white dark:bg-dcard border-t border-bd dark:border-dborder py-4 px-4 text-center text-xs text-muted dark:text-dmuted">
        <p>© 2025 SINGE — República de Moçambique · <span className="font-medium">Dados de demonstração</span></p>
        <p className="mt-1">Em caso de perigo imediato, contacte os serviços de emergência competentes.</p>
      </footer>
    </div>
  );
}

export default CitizenLayout;
