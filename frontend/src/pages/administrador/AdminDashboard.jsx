
import {
  Users,
  AlertTriangle,
  ShieldCheck,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
} from "lucide-react";

const statistics = [
  {
    title: "Utilizadores registados",
    value: "128",
    change: "+12 este mês",
    positive: true,
    icon: Users,
    color: "blue",
  },
  {
    title: "Ocorrências registadas",
    value: "356",
    change: "+8,4% este mês",
    positive: true,
    icon: AlertTriangle,
    color: "orange",
  },
  {
    title: "Equipas de resposta",
    value: "24",
    change: "18 disponíveis",
    positive: true,
    icon: ShieldCheck,
    color: "green",
  },
  {
    title: "Atividade do sistema",
    value: "98,5%",
    change: "Disponibilidade",
    positive: true,
    icon: Activity,
    color: "purple",
  },
];

const activities = [
  {
    user: "Maria João",
    action: "Registou uma nova ocorrência",
    category: "Ocorrências",
    time: "Há 5 minutos",
    status: "Concluído",
  },
  {
    user: "Carlos Mateus",
    action: "Atualizou os dados de utilizador",
    category: "Utilizadores",
    time: "Há 18 minutos",
    status: "Concluído",
  },
  {
    user: "Ana Silva",
    action: "Consultou um relatório",
    category: "Relatórios",
    time: "Há 32 minutos",
    status: "Concluído",
  },
  {
    user: "Sistema",
    action: "Atualizou o estado de uma equipa",
    category: "Equipas",
    time: "Há 45 minutos",
    status: "Concluído",
  },
];

export default function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <div className="admin-welcome">
        <div>
          <span className="admin-eyebrow">
            VISÃO GERAL
          </span>

          <h2>Resumo do sistema</h2>

          <p>
            Acompanha os principais indicadores e a atividade
            geral da plataforma.
          </p>
        </div>

        <div className="admin-welcome-icon">
          <ShieldCheck size={35} />
        </div>
      </div>

      <div className="admin-stat-grid">
        {statistics.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              className="admin-stat-card"
              key={stat.title}
            >
              <div className="admin-stat-top">
                <div
                  className={`admin-stat-icon ${stat.color}`}
                >
                  <Icon size={22} />
                </div>

                <span className="admin-stat-trend">
                  {stat.positive ? (
                    <ArrowUpRight size={15} />
                  ) : (
                    <ArrowDownRight size={15} />
                  )}

                  {stat.change}
                </span>
              </div>

              <p>{stat.title}</p>
              <h3>{stat.value}</h3>
            </article>
          );
        })}
      </div>

      <div className="admin-section-heading">
        <div>
          <h2>Atividade recente</h2>
          <p>Últimas ações registadas na plataforma</p>
        </div>

        <span className="admin-live-label">
          <span className="admin-live-dot" />
          Dados demonstrativos
        </span>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Utilizador</th>
              <th>Atividade</th>
              <th>Categoria</th>
              <th>Data</th>
              <th>Estado</th>
            </tr>
          </thead>

          <tbody>
            {activities.map((activity, index) => (
              <tr key={`${activity.user}-${index}`}>
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar">
                      {activity.user
                        .split(" ")
                        .map((part) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>

                    <strong>{activity.user}</strong>
                  </div>
                </td>

                <td>{activity.action}</td>
                <td>
                  <span className="admin-category">
                    {activity.category}
                  </span>
                </td>

                <td>
                  <span className="admin-time">
                    <Clock size={14} />
                    {activity.time}
                  </span>
                </td>

                <td>
                  <span className="admin-status">
                    {activity.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-notice">
        <ShieldCheck size={21} />

        <div>
          <strong>Área administrativa</strong>
          <p>
            As estatísticas e atividades apresentadas são exemplos
            para a construção da interface. Ainda não representam
            dados reais da base de dados.
          </p>
        </div>
      </div>
    </div>
  );
}
