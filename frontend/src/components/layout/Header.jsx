
import { useLocation } from "react-router-dom";
import { Bell, ChevronDown, Search } from "lucide-react";

const pageTitles = {
  "/operador/dashboard": "Painel geral",
  "/operador/ocorrencias": "Ocorrências",
  "/operador/mapa": "Mapa de ocorrências",
  "/operador/equipas": "Equipas e recursos",
  "/operador/notificacoes": "Notificações",
  "/operador/relatorios": "Relatórios",
};

function Header() {
  const location = useLocation();
  const title = pageTitles[location.pathname] || "SINGE";

  const today = new Intl.DateTimeFormat("pt-PT", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <header className="topbar">
      <div className="topbar-heading">
        <span className="breadcrumb">SINGE / Operações</span>
        <h2>{title}</h2>
      </div>

      <div className="topbar-actions">
        <div className="header-date">{today}</div>

        <button
          type="button"
          className="icon-button search-button"
          aria-label="Pesquisar"
          title="Pesquisa — disponível em breve"
        >
          <Search size={19} />
        </button>

        <button
          type="button"
          className="icon-button notification-button"
          aria-label="Notificações"
          title="Notificações — disponível em breve"
        >
          <Bell size={19} />
          <span className="notification-dot" />
        </button>

        <div className="user-profile">
          <div className="user-avatar">OP</div>

          <div className="user-info">
            <strong>Operador</strong>
            <span>Gestão operacional</span>
          </div>

          <ChevronDown size={16} className="profile-chevron" />
        </div>
      </div>
    </header>
  );
}

export default Header;
