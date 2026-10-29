
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ClipboardList,
  CheckCircle2,
  Clock3,
  ArrowRight,
  MapPin,
  ShieldAlert,
  FilePlus2,
} from "lucide-react";

const ocorrencias = [
  {
    codigo: "OC-2041",
    tipo: "Inundação",
    local: "Bairro Central",
    data: "26/10/2026",
    estado: "Em análise",
    classe: "analise",
  },
  {
    codigo: "OC-2032",
    tipo: "Incêndio",
    local: "Zona Industrial",
    data: "24/10/2026",
    estado: "Resolvida",
    classe: "resolvida",
  },
  {
    codigo: "OC-2025",
    tipo: "Acidente rodoviário",
    local: "Avenida Principal",
    data: "22/10/2026",
    estado: "Equipa mobilizada",
    classe: "mobilizada",
  },
];

const alertas = [
  {
    tipo: "Aviso de segurança",
    titulo: "Mantenha-se atento às informações oficiais",
    descricao:
      "Acompanhe os avisos publicados pelas autoridades e siga as recomendações de segurança.",
    nivel: "informativo",
  },
  {
    tipo: "Prevenção",
    titulo: "Comunique situações de risco",
    descricao:
      "Indique a localização e descreva a situação com clareza ao comunicar uma emergência.",
    nivel: "prevencao",
  },
];

export default function CitizenDashboard() {
  return (
    <div className="citizen-dashboard">
      <section className="citizen-welcome">
        <div>
          <span className="citizen-eyebrow">
            PORTAL DO CIDADÃO
          </span>

          <h2>A tua participação pode salvar vidas.</h2>

          <p>
            Comunica emergências, acompanha as tuas ocorrências
            e consulta informações importantes para a comunidade.
          </p>

          <Link
            to="/cidadao/nova-ocorrencia"
            className="citizen-primary-button"
          >
            <FilePlus2 size={18} />
            Comunicar ocorrência
          </Link>
        </div>

        <div className="citizen-welcome-icon">
          <ShieldAlert size={54} />
        </div>
      </section>

      <div className="citizen-stats">
        <article className="citizen-stat-card">
          <div className="citizen-stat-icon blue">
            <ClipboardList size={22} />
          </div>
          <p>Ocorrências comunicadas</p>
          <h3>3</h3>
        </article>

        <article className="citizen-stat-card">
          <div className="citizen-stat-icon orange">
            <Clock3 size={22} />
          </div>
          <p>Em acompanhamento</p>
          <h3>2</h3>
        </article>

        <article className="citizen-stat-card">
          <div className="citizen-stat-icon green">
            <CheckCircle2 size={22} />
          </div>
          <p>Ocorrências resolvidas</p>
          <h3>1</h3>
        </article>
      </div>

      <section className="citizen-section">
        <div className="citizen-section-heading">
          <div>
            <h2>Minhas ocorrências</h2>
            <p>Acompanha as situações que comunicaste.</p>
          </div>

          <Link to="/cidadao/minhas-ocorrencias">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>

        <div className="citizen-occurrence-list">
          {ocorrencias.map((ocorrencia) => (
            <article
              className="citizen-occurrence-row"
              key={ocorrencia.codigo}
            >
              <div className="citizen-occurrence-icon">
                <AlertTriangle size={21} />
              </div>

              <div className="citizen-occurrence-info">
                <strong>{ocorrencia.tipo}</strong>
                <span>{ocorrencia.codigo}</span>

                <small>
                  <MapPin size={13} />
                  {ocorrencia.local}
                </small>
              </div>

              <div className="citizen-occurrence-date">
                {ocorrencia.data}
              </div>

              <span
                className={`citizen-status ${ocorrencia.classe}`}
              >
                {ocorrencia.estado}
              </span>
            </article>
          ))}
        </div>
      </section>

      <section className="citizen-section">
        <div className="citizen-section-heading">
          <div>
            <h2>Informações de segurança</h2>
            <p>Recomendações para a comunidade.</p>
          </div>

          <Link to="/cidadao/alertas">
            Ver alertas <ArrowRight size={16} />
          </Link>
        </div>

        <div className="citizen-alert-grid">
          {alertas.map((alerta) => (
            <article
              className="citizen-alert-card"
              key={alerta.titulo}
            >
              <span className={`citizen-alert-label ${alerta.nivel}`}>
                {alerta.tipo}
              </span>

              <h3>{alerta.titulo}</h3>
              <p>{alerta.descricao}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="citizen-disclaimer">
        <ShieldAlert size={20} />
        <p>
          <strong>Importante:</strong> esta plataforma é um canal
          de comunicação e acompanhamento. Não assumas que uma
          ocorrência foi recebida por serviços de emergência reais
          enquanto o sistema não estiver integrado e operacional.
        </p>
      </div>
    </div>
  );
}
