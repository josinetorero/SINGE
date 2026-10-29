
import { Link } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  CheckCircle2,
  Navigation,
  MapPin,
  ArrowRight,
  AlertTriangle,
  Radio,
} from "lucide-react";

const missoes = [
  {
    codigo: "MIS-1042",
    tipo: "Inundação",
    local: "Bairro Central",
    prioridade: "Crítica",
    estado: "Em deslocação",
    classe: "deslocacao",
    hora: "21:35",
  },
  {
    codigo: "MIS-1038",
    tipo: "Acidente rodoviário",
    local: "Avenida Principal",
    prioridade: "Alta",
    estado: "No local",
    classe: "local",
    hora: "20:50",
  },
  {
    codigo: "MIS-1029",
    tipo: "Queda de árvore",
    local: "Bairro da Liberdade",
    prioridade: "Média",
    estado: "Concluída",
    classe: "concluida",
    hora: "18:15",
  },
];

export default function EquipaDashboard() {
  const ativas = missoes.filter(
    (missao) => missao.estado !== "Concluída"
  ).length;

  const concluidas = missoes.filter(
    (missao) => missao.estado === "Concluída"
  ).length;

  return (
    <div className="team-dashboard">
      <section className="team-welcome">
        <div>
          <span className="team-eyebrow">CENTRO OPERACIONAL</span>

          <h2>Prontos para responder.</h2>

          <p>
            Consulta as missões atribuídas à tua equipa e mantém
            os estados das intervenções atualizados.
          </p>

          <Link
            to="/equipa/missoes"
            className="team-primary-button"
          >
            <ClipboardList size={18} />
            Consultar missões
          </Link>
        </div>

        <div className="team-welcome-icon">
          <Radio size={43} />
        </div>
      </section>

      <div className="team-stats">
        <article className="team-stat-card">
          <div className="team-stat-icon blue">
            <ClipboardList size={22} />
          </div>
          <p>Missões atribuídas</p>
          <h3>{missoes.length}</h3>
        </article>

        <article className="team-stat-card">
          <div className="team-stat-icon orange">
            <Clock3 size={22} />
          </div>
          <p>Missões em curso</p>
          <h3>{ativas}</h3>
        </article>

        <article className="team-stat-card">
          <div className="team-stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <p>Missões concluídas</p>
          <h3>{concluidas}</h3>
        </article>
      </div>

      <section className="team-section">
        <div className="team-section-heading">
          <div>
            <h2>Missões recentes</h2>
            <p>Consulta as informações das últimas intervenções.</p>
          </div>

          <Link to="/equipa/missoes">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        <div className="team-mission-list">
          {missoes.map((missao) => (
            <article
              className="team-mission-row"
              key={missao.codigo}
            >
              <div className="team-mission-icon">
                <AlertTriangle size={21} />
              </div>

              <div className="team-mission-info">
                <strong>{missao.tipo}</strong>
                <span>{missao.codigo}</span>
                <small>
                  <MapPin size={13} />
                  {missao.local}
                </small>
              </div>

              <div className="team-mission-priority">
                <span>Prioridade</span>
                <strong
                  className={`team-priority ${missao.prioridade.toLowerCase()}`}
                >
                  {missao.prioridade}
                </strong>
              </div>

              <div className="team-mission-state">
                <span className={`team-status ${missao.classe}`}>
                  {missao.estado}
                </span>
                <small>{missao.hora}</small>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="team-notice">
        <Navigation size={21} />

        <div>
          <strong>Atualiza o estado das intervenções</strong>
          <p>
            Quando a equipa aceitar uma missão, iniciar o deslocamento,
            chegar ao local ou concluir a intervenção, o estado deverá
            ser atualizado no sistema.
          </p>
        </div>
      </div>

      <p className="team-demo-note">
        Os dados apresentados são demonstrativos e ainda não vêm
        do backend Laravel.
      </p>
    </div>
  );
}
