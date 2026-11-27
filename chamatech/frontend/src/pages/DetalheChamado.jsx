import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Servico } from "../services";
import {
  formatarDataHora,
  formatarPrioridade,
  formatarStatus,
} from "../utils/formatadores";

function DetalheChamado() {
  const { id } = useParams();
  const { usuario } = useAuth();

  const [chamado, setChamado] = useState(null);
  const [comentarios, setComentarios] = useState([]);
  const [texto, setTexto] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const ehAtendente = usuario?.perfil === "atendente";

  useEffect(() => {
    let cancelado = false;

    Promise.all([Servico.buscarChamado(id), Servico.listarComentarios(id)])
      .then(([dadosChamado, dadosComentarios]) => {
        if (cancelado) return;
        setChamado(dadosChamado);
        setComentarios(dadosComentarios);
      })
      .catch((error) => {
        if (!cancelado) setErro(error.message);
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  async function handleComentario(event) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await Servico.adicionarComentario(id, texto);

      setComentarios(await Servico.listarComentarios(id));
      setTexto("");
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  async function handleStatus(event) {
    const novoStatus = event.target.value;
    setErro("");

    try {
      const chamadoAtualizado = await Servico.alterarStatus(id, novoStatus);

      setChamado(chamadoAtualizado);
    } catch (error) {
      setErro(error.message);
    }
  }

  if (erro && !chamado) {
    return (
      <div className="ticket-detail-page">
        <div className="error-message">{erro}</div>
        <Link to="/chamados" className="cancel-button">
          Voltar aos chamados
        </Link>
      </div>
    );
  }

  if (!chamado) {
    return <p>Carregando chamado...</p>;
  }

  return (
    <div className="ticket-detail-page">
      <Link to="/chamados" className="back-link">
        ← Voltar aos chamados
      </Link>

      <section className="ticket-detail-card">
        <div className="ticket-detail-header">
          <div>
            <span className="ticket-code">{chamado.codigo}</span>
            <h1>{chamado.titulo}</h1>
          </div>

          <span className={`ticket-status status-${chamado.status}`}>
            {formatarStatus(chamado.status)}
          </span>
        </div>

        <div className="ticket-detail-info">
          <div>
            <strong>Solicitante</strong>
            <span>{chamado.usuarioNome}</span>
          </div>

          <div>
            <strong>Prioridade</strong>
            <span>{formatarPrioridade(chamado.prioridade)}</span>
          </div>

          <div>
            <strong>Data de abertura</strong>
            <span>{formatarDataHora(chamado.criadoEm)}</span>
          </div>

          <div>
            <strong>Última atualização</strong>
            <span>{formatarDataHora(chamado.atualizadoEm)}</span>
          </div>
        </div>

        <div className="ticket-description">
          <h2>Descrição do problema</h2>
          <p>{chamado.descricao}</p>
        </div>

        {ehAtendente && (
          <div className="ticket-status-control">
            <label htmlFor="status">Alterar status do chamado</label>

            <select
              id="status"
              value={chamado.status}
              onChange={handleStatus}
            >
              <option value="aberto">Aberto</option>
              <option value="em_andamento">Em andamento</option>
              <option value="resolvido">Resolvido</option>
            </select>
          </div>
        )}
      </section>

      <section className="comments-section">
        <h2>Comentários</h2>

        {comentarios.length === 0 ? (
          <p className="empty-comments">
            Nenhum comentário ainda. Inicie a conversa!
          </p>
        ) : (
          <div className="comments-list">
            {comentarios.map((comentario) => (
              <div className="comment-item" key={comentario.id}>
                <div className="comment-header">
                  <strong>{comentario.usuarioNome}</strong>
                  <span>
                    {comentario.perfil === "atendente"
                      ? "Atendente"
                      : "Cliente"}
                  </span>
                  <time>{formatarDataHora(comentario.criadoEm)}</time>
                </div>

                <p>{comentario.texto}</p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleComentario} className="comment-form">
          <div className="form-group">
            <label htmlFor="comentario">Adicionar comentário</label>
            <textarea
              id="comentario"
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder="Escreva uma mensagem..."
              rows={4}
              maxLength={2000}
              required
            />
          </div>

          {erro && <div className="error-message">{erro}</div>}

          <button
            type="submit"
            className="new-ticket-button"
            disabled={enviando}
          >
            {enviando ? "Enviando..." : "Enviar comentário"}
          </button>
        </form>
      </section>
    </div>
  );
}

export default DetalheChamado;
