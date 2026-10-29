
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Users,
  ArrowUpRight,
  ArrowRight,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

const statistics = [
  {
    label: "Ocorrências ativas",
    value: "24",
    description: "Por acompanhar",
    icon: AlertTriangle,
    tone: "orange",
  },
  {
    label: "Em resposta",
    value: "08",
    description: "Equipas mobilizadas",
    icon: Users,
    tone: "blue",
  },
  {
    label: "Tempo médio",
    value: "18 min",
    description: "Tempo de resposta",
    icon: Clock3,
    tone: "purple",
  },
  {
    label: "Resolvidas hoje",
    value: "16",
    description: "Ocorrências concluídas",
    icon: CheckCircle2,
    tone: "green",
  },
];

const sampleOccurrences = [
  {
    id: "OC-2041",
    title: "Inundação",
    location: "Maxaquene, Maputo",
    priority: "Alta",
    status: "Em resposta",
    time: "Há 8 min",
  },
  {
    id: "OC-2040",
    title: "Acidente rodoviário",
    location: "Av. de Moçambique, Maputo",
    priority: "Média",
    status: "Em validação",
    time: "Há 15 min",
  },
  {
    id: "OC-2039",
    title: "Incêndio",
    location: "Matola, Maputo",
    priority: "Crítica",
    status: "Equipa mobilizada",
    time: "Há 22 min",
  },
];

function Dashboard() {
  return (
    <section className="dashboard-page">
      <div className="page-heading dashboard-heading">
        <div>
          <p className="eyebrow">VISÃO OPERACIONAL</p>
          <h2>Bom trabalho, Operador.</h2>
          <p className="muted">
            Acompanha as ocorrências e as operações de resposta.
          </p>
        </div>

        <Link to="/operador/ocorrencias" className="primary-button">
          <AlertTriangle size={17} />
          Ver ocorrências
        </Link>
      </div>

      <div className="statistics-grid">
        {statistics.map((item) => {
          const Icon = item.icon;

          return (
            <article className="stat-card" key={item.label}>
              <div className="stat-card-top">
                <span>{item.label}</span>
                <div className={`stat-icon ${item.tone}`}>
                  <Icon size={20} />
                </div>
              </div>

              <strong className="stat-value">{item.value}</strong>
              <span className="stat-description">
                {item.description}
              </span>
            </article>
          );
        })}
      </div>

      <div className="dashboard-main-grid">
        <section className="content-card occurrences-card">
          <div className="card-heading">
            <div>
              <h3>Ocorrências recentes</h3>
              <p>Resumo das situações registadas no sistema.</p>
            </div>

            <Link to="/operador/ocorrencias" className="text-link">
              Ver todas <ArrowRight size={16} />
            </Link>
          </div>

          <div className="table-wrapper">
            <table className="occurrences-table">
              <thead>
                <tr>
                  <th>Ocorrência</th>
                  <th>Localização</th>
                  <th>Prioridade</th>
                  <th>Estado</th>
                  <th>Registo</th>
                </tr>
              </thead>

              <tbody>
                {sampleOccurrences.map((occurrence) => (
                  <tr key={occurrence.id}>
                    <td>
                      <strong>{occurrence.title}</strong>
                      <span className="table-subtext">
                        {occurrence.id}
                      </span>
                    </td>

                    <td>
                      <span className="location-cell">
                        <MapPin size={14} />
                        {occurrence.location}
                      </span>
                    </td>

                    <td>
                      <span
                        className={`priority-badge ${occurrence.priority.toLowerCase()}`}
                      >
                        {occurrence.priority}
                      </span>
                    </td>

                    <td>
                      <span className="status-text">
                        <span className="status-dot" />
                        {occurrence.status}
                      </span>
                    </td>

                    <td className="time-cell">{occurrence.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="content-card quick-actions-card">
          <div className="card-heading">
            <div>
              <h3>Ações rápidas</h3>
              <p>Atalhos para a operação.</p>
            </div>
          </div>

          <Link to="/operador/ocorrencias" className="quick-action">
            <span className="quick-action-icon orange">
              <AlertTriangle size={19} />
            </span>
            <span className="quick-action-text">
              <strong>Gerir ocorrências</strong>
              <small>Consultar e acompanhar registos</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>

          <Link to="/operador/equipas" className="quick-action">
            <span className="quick-action-icon blue">
              <Users size={19} />
            </span>
            <span className="quick-action-text">
              <strong>Consultar equipas</strong>
              <small>Ver recursos de resposta</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>

          <Link to="/operador/mapa" className="quick-action">
            <span className="quick-action-icon green">
              <MapPin size={19} />
            </span>
            <span className="quick-action-text">
              <strong>Ver mapa</strong>
              <small>Explorar localização das ocorrências</small>
            </span>
            <ArrowUpRight size={17} />
          </Link>

          <div className="dashboard-notice">
            <div className="notice-indicator" />
            <div>
              <strong>Dados de demonstração</strong>
              <p>
                Os indicadores serão ligados à API Laravel numa próxima etapa.
              </p>
            </div>
          </div>
        </aside>
      </div>

      <footer className="page-footer">
        SINGE · Sistema Inteligente de Gestão e Coordenação de Emergências
      </footer>
    </section>
  );
}

export default Dashboard;
