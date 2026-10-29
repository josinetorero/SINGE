
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  Users,
  FileBarChart,
  ClipboardList,
  Settings,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function AdminSidebar() {
  const navigate = useNavigate();

  const links = [
    {
      label: "Dashboard",
      path: "/administrador/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Utilizadores",
      path: "/administrador/utilizadores",
      icon: Users,
    },
    {
      label: "Relatórios",
      path: "/administrador/relatorios",
      icon: FileBarChart,
    },
    {
      label: "Auditoria",
      path: "/administrador/auditoria",
      icon: ClipboardList,
    },
    {
      label: "Configurações",
      path: "/administrador/configuracoes",
      icon: Settings,
    },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="admin-brand">
        <div className="admin-brand-icon">
          <Activity size={25} />
        </div>

        <div>
          <h2>SINGE</h2>
          <span>Gestão de Emergências</span>
        </div>
      </div>

      <div className="admin-profile">
        <div className="admin-profile-icon">
          <ShieldCheck size={23} />
        </div>

        <div>
          <strong>Administrador</strong>
          <span>Gestão do sistema</span>
        </div>
      </div>

      <p className="admin-menu-label">MENU PRINCIPAL</p>

      <nav className="admin-nav">
        {links.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `admin-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <button
        className="admin-logout"
        onClick={() => navigate("/login")}
      >
        <LogOut size={19} />
        <span>Terminar sessão</span>
      </button>
    </aside>
  );
}
