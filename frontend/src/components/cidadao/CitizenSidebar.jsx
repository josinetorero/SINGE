
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  LayoutDashboard,
  FilePlus2,
  ClipboardList,
  BellRing,
  LogOut,
  ShieldCheck,
} from "lucide-react";

export default function CitizenSidebar() {
  const navigate = useNavigate();

  const links = [
    {
      label: "Página inicial",
      path: "/cidadao/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Comunicar ocorrência",
      path: "/cidadao/nova-ocorrencia",
      icon: FilePlus2,
    },
    {
      label: "Minhas ocorrências",
      path: "/cidadao/minhas-ocorrencias",
      icon: ClipboardList,
    },
    {
      label: "Alertas públicos",
      path: "/cidadao/alertas",
      icon: BellRing,
    },
  ];

  return (
    <aside className="citizen-sidebar">
      <div className="citizen-brand">
        <div className="citizen-brand-icon">
          <Activity size={25} />
        </div>

        <div>
          <h2>SINGE</h2>
          <span>Emergências</span>
        </div>
      </div>

      <div className="citizen-profile">
        <div className="citizen-avatar">CI</div>

        <div>
          <strong>Cidadão</strong>
          <span>Área do cidadão</span>
        </div>
      </div>

      <p className="citizen-menu-label">MENU PRINCIPAL</p>

      <nav className="citizen-nav">
        {links.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end
            className={({ isActive }) =>
              `citizen-nav-link ${isActive ? "active" : ""}`
            }
          >
            <Icon size={19} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="citizen-help">
        <ShieldCheck size={20} />
        <p>
          <strong>Segurança em primeiro lugar</strong>
          <span>Em caso de perigo imediato, procura ajuda de emergência.</span>
        </p>
      </div>

      <button
        className="citizen-logout"
        onClick={() => navigate("/login")}
      >
        <LogOut size={19} />
        <span>Terminar sessão</span>
      </button>
    </aside>
  );
}
