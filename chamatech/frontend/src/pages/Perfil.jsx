
import { useState } from "react";
import { useAuth } from "../context/useAuth";
import { Servico } from "../services";

function Perfil() {
  const { usuario, atualizarUsuario } = useAuth();

  const [nome, setNome] = useState(usuario?.nome || "");
  const [telefone, setTelefone] = useState(usuario?.telefone || "");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [salvando, setSalvando] = useState(false);

  const iniciais = usuario?.nome
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");

  async function salvarPerfil(event) {
    event.preventDefault();
    setMensagem("");
    setErro("");

    setSalvando(true);

    try {
      const usuarioAtualizado = await Servico.atualizarPerfil({
        nome,
        telefone,
      });

      atualizarUsuario(usuarioAtualizado);
      setMensagem("Perfil atualizado com sucesso!");
    } catch (error) {
      setErro(error.message || "Não foi possível atualizar o perfil.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Meu perfil</h1>
          <p>Visualize e atualize suas informações pessoais.</p>
        </div>
      </div>

      <div className="perfil-container">
        <div className="perfil-card">
          <div className="perfil-header">
            <div className="perfil-avatar">
              {iniciais || "U"}
            </div>

            <div>
              <h2>{usuario?.nome || "Usuário"}</h2>
              <span>
                    {usuario?.perfil === "atendente"
                      ? "Equipe de suporte"
                      : "Cliente"}
              </span>
            </div>
          </div>

          <form onSubmit={salvarPerfil}>
            <div className="form-group">
              <label htmlFor="nome">Nome completo</label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(event) => setNome(event.target.value)}
                placeholder="Digite seu nome completo"
                minLength={2}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                value={usuario?.email || ""}
                disabled
              />
              <small>O e-mail não pode ser alterado nesta versão.</small>
            </div>

            {usuario?.perfil === "atendente" && (
            <>
                <div className="form-group">
                <label>Cargo</label>
                <input type="text" value={usuario.cargo || ""} disabled />
                </div>

                <div className="form-group">
                <label>Setor</label>
                <input type="text" value={usuario.setor || ""} disabled />
                </div>

                <div className="form-group">
                <label>Identificação funcional</label>
                <input type="text" value={usuario.matricula || ""} disabled />
                </div>
            </>
            )}

            <div className="form-group">
              <label htmlFor="telefone">Telefone (opcional)</label>
              <input
                id="telefone"
                type="tel"
                value={telefone}
                onChange={(event) => setTelefone(event.target.value)}
                placeholder="(00) 00000-0000"
              />
            </div>

            {mensagem && (
              <div className="success-message">{mensagem}</div>
            )}

            {erro && (
              <div className="error-message">{erro}</div>
            )}

            <button
              type="submit"
              className="login-button"
              disabled={salvando}
            >
              {salvando ? "Salvando..." : "Salvar alterações"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Perfil;
