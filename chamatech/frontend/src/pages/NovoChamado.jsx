import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Servico } from "../services";

function NovoChamado() {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await Servico.criarChamado({
        titulo,
        descricao,
        prioridade,
      });

      navigate("/chamados");
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="new-ticket-page">
      <div className="page-heading">
        <div>
          <h1>Novo chamado</h1>
          <p>Descreva o problema que você está enfrentando.</p>
        </div>
      </div>

      <div className="ticket-form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="titulo">Título do chamado</label>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(event) => setTitulo(event.target.value)}
              placeholder="Ex.: Problema ao acessar o sistema"
              required
              minLength={3}
            />
          </div>

          <div className="form-group">
            <label htmlFor="descricao">Descrição do problema</label>
            <textarea
              id="descricao"
              value={descricao}
              onChange={(event) => setDescricao(event.target.value)}
              placeholder="Explique o problema com detalhes..."
              required
              minLength={5}
              rows={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="prioridade">Prioridade</label>
            <select
              id="prioridade"
              value={prioridade}
              onChange={(event) => setPrioridade(event.target.value)}
            >
              <option value="baixa">Baixa</option>
              <option value="media">Média</option>
              <option value="alta">Alta</option>
            </select>
          </div>

          {erro && <div className="error-message">{erro}</div>}

          <div className="form-actions">
            <Link to="/chamados" className="cancel-button">
              Cancelar
            </Link>

            <button
              type="submit"
              className="new-ticket-button"
              disabled={enviando}
            >
              {enviando ? "Enviando..." : "Enviar chamado"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default NovoChamado;
