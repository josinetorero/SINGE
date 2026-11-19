import React, { useState } from 'react';
import Icon from '../common/Icon';
import { useTheme } from '../../contexts/ThemeContext';

const ROLE_LABELS = {
  administrador: 'Administrador', coordenador: 'Coordenador', operador: 'Operador', agente: 'Agente', cidadao: 'Cidadão',
};

export function AuthenticatedLayout({ user, onLogout, navigation, activePage, onNavigate, title, children }) {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const initials = (user?.name || 'SINGE').split(/\s+/).slice(0, 2).map(part => part[0]).join('').toUpperCase();

  const navItems = (
    <nav aria-label="Navegação principal" className="space-y-1 px-3 py-4">
      {navigation.map(item => (
        <button
          key={item.id}
          type="button"
          data-testid={`nav-${item.id}`}
          aria-current={activePage === item.id ? 'page' : undefined}
          title={collapsed ? item.label : undefined}
          onClick={() => { onNavigate(item.id); setMobileOpen(false); }}
          className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${activePage === item.id ? 'bg-blue-600 font-semibold text-white shadow-sm' : 'text-slate-200 hover:bg-white/10 hover:text-white'} ${collapsed ? 'justify-center px-2' : ''}`}
        >
          <Icon name={item.icon || 'Circle'} size={18} />
          {!collapsed && <span className="truncate">{item.label}</span>}
          {collapsed && <span className="sr-only">{item.label}</span>}
        </button>
      ))}
    </nav>
  );

  const sidebar = (
    <aside className={`flex h-full flex-col bg-slate-950 text-white ${collapsed ? 'w-[76px]' : 'w-[260px]'}`}>
      <div className="flex h-[72px] items-center gap-3 border-b border-white/10 px-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600"><Icon name="ShieldAlert" size={22} /></div>
        {!collapsed && <div className="min-w-0"><p className="font-bold tracking-wide">SINGE</p><p className="truncate text-[11px] text-slate-400">Emergências · Moçambique</p></div>}
        <button type="button" onClick={() => setCollapsed(value => !value)} aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'} className="ml-auto hidden rounded p-1 text-slate-400 hover:bg-white/10 hover:text-white lg:block"><Icon name={collapsed ? 'ChevronRight' : 'ChevronLeft'} size={17} /></button>
      </div>
      <div className="border-b border-white/10 px-4 py-3">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Área de trabalho</p>
        {!collapsed && <p className="mt-1 text-xs font-medium text-blue-200">{ROLE_LABELS[user?.role] || user?.roleTitle || 'Utilizador'}</p>}
      </div>
      <div className="flex-1 overflow-y-auto">{navItems}</div>
      <div className="border-t border-white/10 p-3">
        <div className={`mb-2 flex items-center gap-3 rounded-lg bg-white/5 p-2 ${collapsed ? 'justify-center' : ''}`}>
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-700 text-xs font-bold">{initials}</span>
          {!collapsed && <span className="min-w-0"><span className="block truncate text-sm font-medium">{user?.name}</span><span className="block truncate text-xs text-slate-400">{user?.email}</span></span>}
        </div>
        <button type="button" onClick={toggleTheme} className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white ${collapsed ? 'justify-center' : ''}`} title="Alternar tema">
          <Icon name={theme === 'light' ? 'Moon' : 'Sun'} size={17} />{!collapsed && <span>{theme === 'light' ? 'Tema escuro' : 'Tema claro'}</span>}
        </button>
        <button type="button" onClick={onLogout} className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-200 hover:bg-red-500/15 hover:text-white ${collapsed ? 'justify-center' : ''}`}>
          <Icon name="LogOut" size={17} />{!collapsed && <span>Terminar sessão</span>}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 lg:flex">
      {mobileOpen && <button type="button" aria-label="Fechar menu" className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <div className={`fixed inset-y-0 left-0 z-50 transition-transform ${mobileOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>{sidebar}</div>
      <div className={`min-w-0 flex-1 transition-[margin] ${collapsed ? 'lg:ml-[76px]' : 'lg:ml-[260px]'}`}>
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center gap-3 border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95 md:px-6">
          <button type="button" aria-label="Abrir menu" onClick={() => setMobileOpen(true)} className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-slate-200 dark:hover:bg-slate-800 lg:hidden"><Icon name="Menu" size={20} /></button>
          <div className="min-w-0 flex-1"><h1 className="truncate text-lg font-semibold">{title}</h1><p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">Sistema Integrado de Gestão de Emergências</p></div>
          <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 sm:inline-flex"><span className="mr-2 mt-1 h-1.5 w-1.5 rounded-full bg-blue-600" />Área protegida</span>
        </header>
        <main className="mx-auto w-full max-w-[1600px] p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

export default AuthenticatedLayout;
