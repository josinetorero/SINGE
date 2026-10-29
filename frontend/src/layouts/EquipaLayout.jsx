
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Bell, ShieldCheck } from "lucide-react";
import EquipaSidebar from "../components/equipa/EquipaSidebar";

const pageTitles = {
  "/equipa/dashboard": "Dashboard operacional",
  "/equipa/missoes": "Missões atribuídas",
  "/equipa/estado": "Estado da equipa",
  "/equipa/historico": "Histórico de intervenções",
};

export default function EquipaLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const title =
    pageTitles[location.pathname] || "Área operacional";

  return (
    <div className="team-layout">
      <EquipaSidebar />

      <main className="team-main">
        <header className="team-header">
          <div>
            <h1>{title}</h1>
            <p>
              Consulta as tuas missões e acompanha as operações atribuídas.
            </p>
          </div>

          <div className="team-header-actions">
            <span className="team-online-indicator">
              <span />
              Operacional
            </span>

            <button
              type="button"
              aria-label="Consultar missões"
              className="team-header-button"
              onClick={() => navigate("/equipa/missoes")}
            >
              <Bell size={20} />
            </button>

            <div className="team-header-avatar">
              <ShieldCheck size={20} />
            </div>
          </div>
        </header>

        <section className="team-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
