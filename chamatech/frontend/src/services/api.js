// Comunicação com a API real (FastAPI). Segue o contrato em docs/api-contrato.md.
// As funções devolvem os dados no formato que as páginas já usam (camelCase),
// então as páginas não precisam conhecer os nomes dos campos do backend.
import { API_URL } from "../config";

const TOKEN_KEY = "chamatech_token";
const USUARIO_KEY = "chamatech_usuario";

async function requisicao(caminho, { metodo = "GET", corpo } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  let resposta;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      method: metodo,
      headers,
      body: corpo ? JSON.stringify(corpo) : undefined,
    });
  } catch {
    throw new Error(
      "Não foi possível conectar ao servidor. Tente novamente em instantes."
    );
  }

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    // resposta sem corpo
  }

  if (!resposta.ok) {
    // Sessão inválida ou expirada (fora das rotas de login/cadastro): encerra a sessão.
    if (resposta.status === 401 && !caminho.startsWith("/auth")) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USUARIO_KEY);
      window.location.assign("/");
    }

    const detalhe = dados?.detail;
    throw new Error(
      Array.isArray(detalhe)
        ? "Dados inválidos. Revise os campos."
        : detalhe || `Erro ${resposta.status} ao falar com o servidor.`
    );
  }

  return dados;
}

// API (snake_case) -> formato usado nas páginas (camelCase)
function normalizarChamado(c) {
  return {
    id: c.id,
    codigo: `CH-${String(c.id).padStart(4, "0")}`,
    titulo: c.titulo,
    descricao: c.descricao,
    prioridade: c.prioridade,
    status: c.status,
    usuarioNome: c.autor_nome,
    criadoEm: c.criado_em,
    atualizadoEm: c.atualizado_em ?? c.criado_em,
  };
}

function normalizarComentario(c) {
  return {
    id: c.id,
    texto: c.texto,
    usuarioNome: c.autor_nome,
    perfil: c.autor_perfil,
    criadoEm: c.criado_em,
  };
}

async function login(email, senha) {
  const dados = await requisicao("/auth/login", {
    metodo: "POST",
    corpo: { email, senha },
  });
  return { usuario: dados.usuario, token: dados.access_token };
}

export const Api = {
  login,

  // Cadastra e já entra na conta (a API de cadastro não devolve token).
  async cadastrar({ nome, email, senha }) {
    await requisicao("/auth/register", {
      metodo: "POST",
      corpo: { nome: nome.trim(), email: email.trim(), senha },
    });
    return login(email.trim(), senha);
  },

  async listarChamados() {
    const lista = await requisicao("/chamados");
    return lista.map(normalizarChamado).sort((a, b) => b.id - a.id);
  },

  async criarChamado({ titulo, descricao, prioridade }) {
    const criado = await requisicao("/chamados", {
      metodo: "POST",
      corpo: { titulo: titulo.trim(), descricao: descricao.trim(), prioridade },
    });
    return normalizarChamado(criado);
  },

  async buscarChamado(id) {
    return normalizarChamado(await requisicao(`/chamados/${id}`));
  },

  async alterarStatus(id, status) {
    const atualizado = await requisicao(`/chamados/${id}`, {
      metodo: "PATCH",
      corpo: { status },
    });
    return normalizarChamado(atualizado);
  },

  async listarComentarios(id) {
    const lista = await requisicao(`/chamados/${id}/comentarios`);
    return lista.map(normalizarComentario);
  },

  async adicionarComentario(id, texto) {
    const criado = await requisicao(`/chamados/${id}/comentarios`, {
      metodo: "POST",
      corpo: { texto: texto.trim() },
    });
    return normalizarComentario(criado);
  },
};
