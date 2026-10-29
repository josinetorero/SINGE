
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  ClipboardList,
  Radio,
  History,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function EquipaSidebar() {
  const navigate = useNavigate();

  const links = [
    {
      label: "Dashboard",
      path: "/equipa/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Missões atribuídas",
      path: "/equipa/missoes",
      icon: ClipboardList,
    },
    {
      label: "Estado da equipa",
      path: "/equipa/estado",
      icon: Radio,
    },
    {
      label: "Histórico",
      path: "/equipa/historico",
      icon: History,
    },
  ];

  return (
    <aside className="team-sidebar">
      <div className="team-brand">
        <div className="team-brand-icon">
          <Activity size={25} />
        </div>

        <div>
          <h2>SINGE</h2>
          <span>Resposta a emergências</span>
        </div>
      </div>

      <div className="team-profile">
        <div className="team-profile-icon">
          <ShieldCheck size={23} />
        </div>

        <div>
          <strong>Equipa de resposta</strong>
          <span>Equipa operacional</span>
        </div>
      </div>

      <p className="team-menu-label">ÁREA OPERACIONAL</p>

      <nav className="team-nav">
        {links.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `team-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="team-sidebar-note">
        <ShieldCheck size={20} />
        <p>
          <strong>Segurança operacional</strong>
          <span>Segue os procedimentos de segurança durante cada missão.</span>
        </p>
      </div>

      <button
        className="team-logout"
        onClick={() => navigate("/login")}
      >
        <LogOut size={19} />
        <span>Terminar sessão</span>
      </button>
    </aside>
  );
}
