
import { Outlet, useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import AdminSidebar from "../components/admin/AdminSidebar";

const pageTitles = {
  "/administrador/dashboard": "Dashboard administrativo",
  "/administrador/utilizadores": "Gestão de utilizadores",
  "/administrador/relatorios": "Relatórios",
  "/administrador/auditoria": "Auditoria do sistema",
  "/administrador/configuracoes": "Configurações",
};

export default function AdminLayout() {
  const location = useLocation();

  const title =
    pageTitles[location.pathname] || "Área administrativa";

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>{title}</h1>
            <p>Bem-vindo à área de administração do SINGE.</p>
          </div>

          <div className="admin-header-actions">
            <button
              type="button"
              className="admin-icon-button"
              aria-label="Pesquisar"
            >
              <Search size={20} />
            </button>

            <button
              type="button"
              className="admin-icon-button"
              aria-label="Notificações"
            >
              <Bell size={20} />
            </button>

            <div className="admin-avatar">AD</div>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
