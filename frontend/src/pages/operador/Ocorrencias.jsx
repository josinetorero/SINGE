
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Plus,
  Eye,
  MapPin,
  AlertTriangle,
  Clock3,
  CheckCircle2,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const initialOccurrences = [
  {
    id: "OC-2041",
    tipo: "Inundação",
    localizacao: "Maxaquene, Maputo",
    prioridade: "Alta",
    estado: "Em resposta",
    data: "26/10/2026 21:45",
    pessoas: 35,
  },
  {
    id: "OC-2040",
    tipo: "Acidente rodoviário",
    localizacao: "Av. de Moçambique, Maputo",
    prioridade: "Média",
    estado: "Em validação",
    data: "26/10/2026 21:30",
    pessoas: 4,
  },
  {
    id: "OC-2039",
    tipo: "Incêndio",
    localizacao: "Matola, Maputo",
    prioridade: "Crítica",
    estado: "Equipa mobilizada",
    data: "26/10/2026 21:10",
    pessoas: 12,
  },
  {
    id: "OC-2038",
    tipo: "Deslizamento de terra",
    localizacao: "Marracuene, Maputo",
    prioridade: "Alta",
    estado: "Registada",
    data: "26/10/2026 20:50",
    pessoas: 18,
  },
  {
    id: "OC-2037",
    tipo: "Cheias",
    localizacao: "Boane, Maputo",
    prioridade: "Crítica",
    estado: "Resolvida",
    data: "26/10/2026 20:15",
    pessoas: 62,
  },
  {
    id: "OC-2036",
    tipo: "Assistência médica",
    localizacao: "Polana, Maputo",
    prioridade: "Baixa",
    estado: "Em resposta",
    data: "26/10/2026 19:55",
    pessoas: 1,
  },
  {
    id: "OC-2035",
    tipo: "Inundação",
    localizacao: "Costa do Sol, Maputo",
    prioridade: "Alta",
    estado: "Registada",
    data: "26/10/2026 19:20",
    pessoas: 27,
  },
];

function Occurrences() {
  const [occurrences] = useState(initialOccurrences);
  const [search, setSearch] = useState("");
  const [priority, setPriority] = useState("Todas");
  const [status, setStatus] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOccurrence, setSelectedOccurrence] = useState(null);

  const itemsPerPage = 5;

  const filteredOccurrences = useMemo(() => {
    const term = search.trim().toLowerCase();

    return occurrences.filter((occurrence) => {
      const matchesSearch =
        occurrence.id.toLowerCase().includes(term) ||
        occurrence.tipo.toLowerCase().includes(term) ||
        occurrence.localizacao.toLowerCase().includes(term);

      const matchesPriority =
        priority === "Todas" || occurrence.prioridade === priority;

      const matchesStatus =
        status === "Todos" || occurrence.estado === status;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [occurrences, search, priority, status]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOccurrences.length / itemsPerPage)
  );

  const safePage = Math.min(currentPage, totalPages);

  const visibleOccurrences = filteredOccurrences.slice(
    (safePage - 1) * itemsPerPage,
    safePage * itemsPerPage
  );

  const activeCount = occurrences.filter(
    (item) => item.estado !== "Resolvida"
  ).length;

  const criticalCount = occurrences.filter(
    (item) => item.prioridade === "Crítica" && item.estado !== "Resolvida"
  ).length;

  const resolvedCount = occurrences.filter(
    (item) => item.estado === "Resolvida"
  ).length;

  function resetFilters() {
    setSearch("");
    setPriority("Todas");
    setStatus("Todos");
    setCurrentPage(1);
  }

  function handleSearch(value) {
    setSearch(value);
    setCurrentPage(1);
  }

  function handlePriority(value) {
    setPriority(value);
    setCurrentPage(1);
  }

  function handleStatus(value) {
    setStatus(value);
    setCurrentPage(1);
  }

  return (
    <section className="occurrences-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">GESTÃO OPERACIONAL</p>
          <h2>Ocorrências</h2>
          <p className="muted">
            Consulta, pesquisa e acompanha as ocorrências registadas no SINGE.
          </p>
        </div>

        <Link
          to="/operador/nova-ocorrencia"
          className="primary-button"
        >
          <Plus size={18} />
          Nova ocorrência
        </Link>
      </div>

      <div className="occurrence-summary">
        <article className="summary-card">
          <div className="summary-icon blue">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span>Total de registos</span>
            <strong>{occurrences.length}</strong>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-icon orange">
            <Clock3 size={20} />
          </div>
          <div>
            <span>Em acompanhamento</span>
            <strong>{activeCount}</strong>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-icon red">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span>Prioridade crítica</span>
            <strong>{criticalCount}</strong>
          </div>
        </article>

        <article className="summary-card">
          <div className="summary-icon green">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span>Resolvidas</span>
            <strong>{resolvedCount}</strong>
          </div>
        </article>
      </div>

      <section className="content-card occurrences-list-card">
        <div className="occurrences-list-heading">
          <div>
            <h3>Lista de ocorrências</h3>
            <p>
              {filteredOccurrences.length} registo(s) encontrado(s)
            </p>
          </div>

          <span className="demo-label">Dados de demonstração</span>
        </div>

        <div className="occurrence-filters">
          <div className="search-field">
            <Search size={18} />
            <input
              type="search"
              placeholder="Pesquisar código, tipo ou localização..."
              value={search}
              onChange={(event) => handleSearch(event.target.value)}
              aria-label="Pesquisar ocorrências"
            />
          </div>

          <div className="filter-field">
            <Filter size={16} />
            <select
              value={priority}
              onChange={(event) => handlePriority(event.target.value)}
              aria-label="Filtrar por prioridade"
            >
              <option value="Todas">Todas as prioridades</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>

          <div className="filter-field">
            <select
              value={status}
              onChange={(event) => handleStatus(event.target.value)}
              aria-label="Filtrar por estado"
            >
              <option value="Todos">Todos os estados</option>
              <option value="Registada">Registada</option>
              <option value="Em validação">Em validação</option>
              <option value="Em resposta">Em resposta</option>
              <option value="Equipa mobilizada">Equipa mobilizada</option>
              <option value="Resolvida">Resolvida</option>
            </select>
          </div>

          {(search || priority !== "Todas" || status !== "Todos") && (
            <button
              type="button"
              className="reset-filters-button"
              onClick={resetFilters}
            >
              <X size={15} />
              Limpar
            </button>
          )}
        </div>

        <div className="table-wrapper">
          <table className="occurrences-table full-occurrences-table">
            <thead>
              <tr>
                <th>Código / Tipo</th>
                <th>Localização</th>
                <th>Pessoas afetadas</th>
                <th>Prioridade</th>
                <th>Estado</th>
                <th>Data de registo</th>
                <th>Ação</th>
              </tr>
            </thead>

            <tbody>
              {visibleOccurrences.map((occurrence) => (
                <tr key={occurrence.id}>
                  <td>
                    <strong>{occurrence.id}</strong>
                    <span className="table-subtext">{occurrence.tipo}</span>
                  </td>

                  <td>
                    <span className="location-cell">
                      <MapPin size={14} />
                      {occurrence.localizacao}
                    </span>
                  </td>

                  <td>{occurrence.pessoas}</td>

                  <td>
                    <span
                      className={`priority-badge ${occurrence.prioridade.toLowerCase()}`}
                    >
                      {occurrence.prioridade}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`occurrence-status status-${statusClass(occurrence.estado)}`}
                    >
                      {occurrence.estado}
                    </span>
                  </td>

                  <td className="time-cell">{occurrence.data}</td>

                  <td>
                    <button
                      type="button"
                      className="table-action-button"
                      onClick={() => setSelectedOccurrence(occurrence)}
                      aria-label={`Consultar ${occurrence.id}`}
                      title="Consultar detalhes"
                    >
                      <Eye size={17} />
                    </button>
                  </td>
                </tr>
              ))}

              {visibleOccurrences.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-table">
                    <Search size={24} />
                    <strong>Nenhuma ocorrência encontrada</strong>
                    <span>
                      Experimenta alterar os termos de pesquisa ou os filtros.
                    </span>
                    <button
                      type="button"
                      className="text-link"
                      onClick={resetFilters}
                    >
                      Limpar filtros
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>
            A mostrar{" "}
            {filteredOccurrences.length === 0
              ? 0
              : (safePage - 1) * itemsPerPage + 1}
            {"–"}
            {Math.min(safePage * itemsPerPage, filteredOccurrences.length)}
            {" de "}
            {filteredOccurrences.length} ocorrências
          </span>

          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-button"
              disabled={safePage === 1}
              onClick={() => setCurrentPage(safePage - 1)}
              aria-label="Página anterior"
            >
              <ChevronLeft size={17} />
            </button>

            <span className="pagination-current">
              {safePage} / {totalPages}
            </span>

            <button
              type="button"
              className="pagination-button"
              disabled={safePage >= totalPages}
              onClick={() => setCurrentPage(safePage + 1)}
              aria-label="Página seguinte"
            >
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      </section>

      {selectedOccurrence && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedOccurrence(null);
            }
          }}
        >
          <section
            className="occurrence-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="occurrence-modal-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">DETALHES DA OCORRÊNCIA</p>
                <h3 id="occurrence-modal-title">
                  {selectedOccurrence.id}
                </h3>
              </div>

              <button
                type="button"
                className="icon-button"
                onClick={() => setSelectedOccurrence(null)}
                aria-label="Fechar detalhes"
              >
                <X size={19} />
              </button>
            </div>

            <div className="modal-details-grid">
              <Detail label="Tipo" value={selectedOccurrence.tipo} />
              <Detail
                label="Localização"
                value={selectedOccurrence.localizacao}
              />
              <Detail
                label="Pessoas afetadas"
                value={String(selectedOccurrence.pessoas)}
              />
              <Detail label="Data de registo" value={selectedOccurrence.data} />
              <Detail
                label="Prioridade"
                value={selectedOccurrence.prioridade}
              />
              <Detail label="Estado" value={selectedOccurrence.estado} />
            </div>

            <p className="modal-note">
              Estes dados são ilustrativos. O histórico, a classificação
              e a equipa responsável serão apresentados quando a API
              estiver integrada.
            </p>

            <div className="modal-footer">
              <button
                type="button"
                className="secondary-button"
                onClick={() => setSelectedOccurrence(null)}
              >
                Fechar
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}

function Detail({ label, value }) {
  return (
    <div className="detail-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function statusClass(value) {
  const classes = {
    Registada: "registered",
    "Em validação": "validation",
    "Em resposta": "response",
    "Equipa mobilizada": "assigned",
    Resolvida: "resolved",
  };

  return classes[value] || "registered";
}

export default Occurrences;
