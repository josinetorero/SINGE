
import { Outlet, useLocation } from "react-router-dom";
import { Bell, ShieldCheck } from "lucide-react";
import CitizenSidebar from "../components/cidadao/CitizenSidebar";

const pageTitles = {
  "/cidadao/dashboard": "Página inicial",
  "/cidadao/nova-ocorrencia": "Comunicar ocorrência",
  "/cidadao/minhas-ocorrencias": "Minhas ocorrências",
  "/cidadao/alertas": "Alertas públicos",
};

export default function CitizenLayout() {
  const location = useLocation();

  const title =
    pageTitles[location.pathname] || "Área do cidadão";

  return (
    <div className="citizen-layout">
      <CitizenSidebar />

      <main className="citizen-main">
        <header className="citizen-header">
          <div>
            <h1>{title}</h1>
            <p>
              Comunica situações de risco e acompanha as informações
              de emergência.
            </p>
          </div>

          <div className="citizen-header-right">
            <ShieldCheck size={19} />
            <span>Portal do cidadão</span>

            <button
              type="button"
              aria-label="Consultar alertas"
              onClick={() => {
                window.location.href = "/cidadao/alertas";
              }}
            >
              <Bell size={20} />
            </button>
          </div>
        </header>

        <section className="citizen-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
