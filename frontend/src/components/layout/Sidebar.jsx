import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  AlertCircle, 
  PlusCircle, 
  BarChart3, 
  Sparkles, 
  Users, 
  Compass, 
  ShieldCheck, 
  UserCog, 
  History, 
  ChevronLeft, 
  ChevronRight,
  Radio
} from 'lucide-react';
import { useAuth, ROLES } from '../../contexts/AuthContext';

export const Sidebar = ({ isCollapsed, onToggleCollapse }) => {
  const { role } = useAuth();

  // Itens de navegação específicos para cada perfil de utilizador (RBAC)
  const navItemsByRole = {
    [ROLES.OPERADOR]: [
      {
        section: 'Operação Central',
        items: [
          { name: 'Dashboard', path: '/operador/dashboard', icon: LayoutDashboard },
          { name: 'Ocorrências', path: '/operador/ocorrencias', icon: AlertCircle },
          { name: 'Registar Ocorrência', path: '/operador/nova-ocorrencia', icon: PlusCircle },
        ]
      }
    ],
    [ROLES.COORDENADOR]: [
      {
        section: 'Coordenação Estratégica',
        items: [
          { name: 'Painel Geral', path: '/coordenador/dashboard', icon: BarChart3 },
          { name: 'Avaliação & IA', path: '/coordenador/prioridades', icon: Sparkles },
          { name: 'Gestão de Equipas', path: '/coordenador/equipas', icon: Users },
          { name: 'Gestão de Missões', path: '/coordenador/missoes', icon: Compass },
        ]
      }
    ],
    [ROLES.AGENTE]: [
      {
        section: 'Operações no Terreno',
        items: [
          { name: 'As Minhas Missões', path: '/agente/missoes', icon: ShieldCheck },
        ]
      }
    ],
    [ROLES.ADMIN]: [
      {
        section: 'Administração do Sistema',
        items: [
          { name: 'Utilizadores', path: '/admin/utilizadores', icon: UserCog },
          { name: 'Auditoria & Logs', path: '/admin/auditoria', icon: History },
        ]
      }
    ]
  };

  const sections = navItemsByRole[role] || [];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 z-40 flex flex-col bg-navy dark:bg-navy-dark text-slate-100 transition-all duration-300 ease-in-out shadow-2xl ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Cabeçalho da Sidebar / Logótipo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-navy-light/40">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand text-white shadow-glow flex-shrink-0">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-base tracking-wider text-white">SINGE</span>
              <span className="text-[10px] text-blue-200 font-medium tracking-tight truncate">
                INGD / CENOE Moçambique
              </span>
            </div>
          )}
        </div>

        {/* Botão de colapsar sidebar */}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-light/50 transition-colors"
          title={isCollapsed ? 'Expandir Menu' : 'Recolher Menu'}
        >
          {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Indicador de Status CENOE */}
      {!isCollapsed && (
        <div className="mx-3 mt-4 px-3 py-2 rounded-lg bg-navy-light/30 border border-navy-light/50 flex items-center gap-2.5">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <div className="text-[11px] leading-tight">
            <div className="font-semibold text-slate-200">Rede CENOE Conectada</div>
            <div className="text-[9px] text-emerald-400 font-mono">Modo Operacional Ativo</div>
          </div>
        </div>
      )}

      {/* Lista de Navegação Dinâmica */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
        {sections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed && (
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                {sec.section}
              </p>
            )}
            <div className="space-y-1 pt-1">
              {sec.items.map((item) => {
                const IconComponent = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-brand text-white shadow-card font-semibold'
                          : 'text-slate-300 hover:text-white hover:bg-navy-light/40'
                      } ${isCollapsed ? 'justify-center px-0' : ''}`
                    }
                    title={isCollapsed ? item.name : undefined}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Rodapé da Sidebar */}
      <div className="p-4 border-t border-navy-light/40">
        {!isCollapsed ? (
          <div className="text-center">
            <div className="text-[10px] text-slate-400">SINGE MVP v1.0.0</div>
            <div className="text-[9px] text-slate-500 mt-0.5">Engenharia de Software UEM</div>
          </div>
        ) : (
          <div className="text-center text-[10px] text-slate-400 font-mono">v1.0</div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
