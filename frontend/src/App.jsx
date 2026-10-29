
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login";
import MainLayout from "./components/layout/MainLayout";
import Dashboard from "./pages/operador/Dashboard";
import Occurrences from "./pages/operador/Ocorrencias";
import AdminLayout from "./layouts/AdminLayout";
import AdminDashboard from "./pages/administrador/AdminDashboard";
import CitizenLayout from "./layouts/CitizenLayout";
import CitizenDashboard from "./pages/cidadao/CitizenDashboard";
import EquipaLayout from "./layouts/EquipaLayout";
import EquipaDashboard from "./pages/equipa/EquipaDashboard";

function PlaceholderPage({ title }) {
  return (
    <section className="page-content">
      <div className="page-heading">
        <div>
          <p className="eyebrow">SINGE / EM DESENVOLVIMENTO</p>
          <h2>{title}</h2>
          <p className="muted">
            Esta tela será implementada na próxima etapa.
          </p>
        </div>
      </div>

      <div className="content-card placeholder-card">
        <div className="placeholder-icon">S</div>
        <h3>{title}</h3>
        <p>
          Estamos a preparar esta funcionalidade para integrar com a API
          Laravel.
        </p>
      </div>
    </section>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/operador" element={<MainLayout />}>
          <Route
            index
            element={<Navigate to="/operador/dashboard" replace />}
          />

          <Route path="dashboard" element={<Dashboard />} />

          <Route
            path="ocorrencias"
            element={<Occurrences />} 
          />

          <Route
            path="mapa"
            element={<PlaceholderPage title="Mapa de ocorrências" />}
          />

          <Route
            path="equipas"
            element={<PlaceholderPage title="Equipas e recursos" />}
          />

          <Route
            path="notificacoes"
            element={<PlaceholderPage title="Notificações" />}
          />

          <Route
            path="relatorios"
            element={<PlaceholderPage title="Relatórios" />}
          />
        </Route>

        <Route path="/administrador" element={<AdminLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />

          <Route
            path="utilizadores"
            element={<PlaceholderPage title="Gestão de utilizadores" />}
          />

          <Route
            path="relatorios"
            element={<PlaceholderPage title="Relatórios" />}
          />

          <Route
            path="auditoria"
            element={<PlaceholderPage title="Auditoria do sistema" />}
          />

          <Route
            path="configuracoes"
            element={<PlaceholderPage title="Configurações" />}
          />
        </Route>

        <Route path="/cidadao" element={<CitizenLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<CitizenDashboard />}
          />

          <Route
            path="nova-ocorrencia"
            element={<PlaceholderPage title="Comunicar ocorrência" />}
          />

          <Route
            path="minhas-ocorrencias"
            element={<PlaceholderPage title="Minhas ocorrências" />}
          />

          <Route
            path="alertas"
            element={<PlaceholderPage title="Alertas públicos" />}
          />
        </Route>
    
        <Route path="/equipa" element={<EquipaLayout />}>
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />

          <Route
            path="dashboard"
            element={<EquipaDashboard />}
          />

          <Route
            path="missoes"
            element={<PlaceholderPage title="Missões atribuídas" />}
          />

          <Route
            path="estado"
            element={<PlaceholderPage title="Estado da equipa" />}
          />

          <Route
            path="historico"
            element={<PlaceholderPage title="Histórico de intervenções" />}
          />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
