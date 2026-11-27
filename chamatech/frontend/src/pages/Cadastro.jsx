import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Servico } from "../services";

function Cadastro() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleCadastro(event) {
    event.preventDefault();
    setErro("");

    if (senha !== confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setEnviando(true);

    try {
      const { usuario, token } = await Servico.cadastrar({
        nome,
        email,
        senha,
      });

      login(usuario, token);
      navigate("/chamados");
    } catch (error) {
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-brand">
          <h1>
            Chama<span>Tech</span>
          </h1>
        </div>

        <h2>Crie sua conta</h2>
        <p>Preencha seus dados para começar.</p>

        <form onSubmit={handleCadastro}>
          <div className="form-group">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Digite seu nome"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Digite seu e-mail"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              type="password"
              value={senha}
              onChange={(event) => setSenha(event.target.value)}
              placeholder="Crie uma senha"
              minLength={6}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <input
              id="confirmarSenha"
              type="password"
              value={confirmarSenha}
              onChange={(event) => setConfirmarSenha(event.target.value)}
              placeholder="Digite a senha novamente"
              required
            />
          </div>

          {erro && <div className="error-message">{erro}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={enviando}
          >
            {enviando ? "Criando conta..." : "Criar conta"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Já tem uma conta?{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("/")}
            >
              Entrar
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Cadastro;
