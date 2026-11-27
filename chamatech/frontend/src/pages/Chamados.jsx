import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Servico } from "../services";
import {
  formatarData,
  formatarPrioridade,
  formatarStatus,
} from "../utils/formatadores";

function Chamados() {
  const { usuario } = useAuth();
  const [filtro, setFiltro] = useState("");
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const ehAtendente = usuario?.perfil === "atendente";

  useEffect(() => {
    let cancelado = false;

    Servico.listarChamados()
      .then((dados) => {
        if (!cancelado) setChamados(dados);
      })
      .catch((error) => {
        if (!cancelado) setErro(error.message);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const chamadosFiltrados = filtro
    ? chamados.filter((item) => item.status === filtro)
    : chamados;

  const totalAbertos = chamados.filter(
    (item) => item.status === "aberto"
  ).length;

  const totalEmAndamento = chamados.filter(
    (item) => item.status === "em_andamento"
  ).length;

  const totalResolvidos = chamados.filter(
    (item) => item.status === "resolvido"
  ).length;

  return (
    <div className="chamados-page">
      <div className="page-heading">
        <div>
          <h1>{ehAtendente ? "Painel de atendimento" : "Meus chamados"}</h1>

          <p>
            {ehAtendente
              ? "Visualize e gerencie as solicitações de suporte."
              : "Acompanhe e gerencie suas solicitações de suporte."}
          </p>
        </div>

        {!ehAtendente && (
          <Link to="/novo-chamado" className="new-ticket-button">
            + Novo chamado
          </Link>
        )}
      </div>

      <section className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total de chamados</h3>
          <span>{chamados.length}</span>
        </div>

        <div className="dashboard-card">
          <h3>Abertos</h3>
          <span>{totalAbertos}</span>
        </div>

        <div className="dashboard-card">
          <h3>Em andamento</h3>
          <span>{totalEmAndamento}</span>
        </div>

        <div className="dashboard-card">
          <h3>Resolvidos</h3>
          <span>{totalResolvidos}</span>
        </div>
      </section>

      <section className="ticket-list-section">
        <div className="ticket-list-heading">
          <h2>Solicitações</h2>

          <select
            value={filtro}
            onChange={(event) => setFiltro(event.target.value)}
          >
            <option value="">Todos os status</option>
            <option value="aberto">Aberto</option>
            <option value="em_andamento">Em andamento</option>
            <option value="resolvido">Resolvido</option>
          </select>
        </div>

        {carregando ? (
          <p className="empty-comments">Carregando chamados...</p>
        ) : erro ? (
          <div className="error-message">{erro}</div>
        ) : chamadosFiltrados.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum chamado encontrado</h3>
            <p>
              {filtro
                ? "Não existem chamados com esse status."
                : ehAtendente
                  ? "Ainda não há chamados abertos."
                  : "Você ainda não abriu nenhum chamado."}
            </p>
            {!ehAtendente && (
              <Link to="/novo-chamado" className="new-ticket-button">
                Abrir meu primeiro chamado
              </Link>
            )}
          </div>
        ) : (
          <div className="ticket-list">
            {chamadosFiltrados.map((chamado) => (
              <Link
                key={chamado.id}
                to={`/chamado/${chamado.id}`}
                className="ticket-item"
              >
                <div className="ticket-main">
                  <span className="ticket-code">{chamado.codigo}</span>
                  <h3>{chamado.titulo}</h3>
                  <p>{chamado.descricao}</p>
                </div>

                <div className="ticket-details">
                  <span className={`ticket-status status-${chamado.status}`}>
                    {formatarStatus(chamado.status)}
                  </span>

                  <span className={`ticket-priority priority-${chamado.prioridade}`}>
                    Prioridade: {formatarPrioridade(chamado.prioridade)}
                  </span>

                  <span className="ticket-date">
                    {formatarData(chamado.criadoEm)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Chamados; 
