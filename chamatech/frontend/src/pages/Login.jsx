import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Servico } from "../services";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleLogin(event) {
    event.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      const { usuario, token } = await Servico.login(email, senha);

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

        <h2>Bem-vindo de volta!</h2>
        <p>Entre na sua conta para acompanhar seus chamados.</p>

        <form onSubmit={handleLogin}>
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
              placeholder="Digite sua senha"
              required
            />
          </div>

          {erro && <div className="error-message">{erro}</div>}

          <button
            type="submit"
            className="login-button"
            disabled={enviando}
          >
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Ainda não tem uma conta?{" "}
            <button
              type="button"
              className="text-button"
              onClick={() => navigate("/cadastro")}
            >
              Cadastre-se
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
