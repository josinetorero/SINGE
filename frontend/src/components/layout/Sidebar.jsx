
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  AlertTriangle,
  Map,
  Users,
  Bell,
  FileBarChart,
  Settings,
  ShieldCheck,
  LogOut,
  Activity,
} from "lucide-react";

const menuItems = [
  {
    label: "Painel geral",
    path: "/operador/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Ocorrências",
    path: "/operador/ocorrencias",
    icon: AlertTriangle,
  },
  {
    label: "Mapa",
    path: "/operador/mapa",
    icon: Map,
  },
  {
    label: "Equipas e recursos",
    path: "/operador/equipas",
    icon: Users,
  },
  {
    label: "Notificações",
    path: "/operador/notificacoes",
    icon: Bell,
  },
  {
    label: "Relatórios",
    path: "/operador/relatorios",
    icon: FileBarChart,
  },
];

function Sidebar() {
  const navigate = useNavigate();

  function handleLogout() {
    // Demonstração: ainda não existe autenticação real.
    navigate("/login");
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Activity size={25} strokeWidth={2.5} />
        </div>

        <div className="brand-text">
          <h1>SINGE</h1>
          <span>Gestão de Emergências</span>
        </div>
      </div>

      <div className="sidebar-section-label">MENU PRINCIPAL</div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon size={19} strokeWidth={1.9} />
              <span>{item.label}</span>

              {item.label === "Ocorrências" && (
                <span className="nav-badge">4</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="security-note">
          <ShieldCheck size={19} />
          <div>
            <strong>Sistema operacional</strong>
            <span>Ambiente de demonstração</span>
          </div>
        </div>

        <button
          type="button"
          className="logout-button"
          onClick={handleLogout}
        >
          <LogOut size={18} />
          <span>Sair da conta</span>
        </button>

        <div className="sidebar-footer">
          SINGE · Protótipo académico
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
