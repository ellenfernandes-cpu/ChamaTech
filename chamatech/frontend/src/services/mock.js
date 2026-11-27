const DB_KEY = "chamatech_react_db";

const usuariosIniciais = [
  {
    id: 1,
    nome: "Cliente Teste",
    email: "cliente@chamatech.com",
    senha: "123456",
    perfil: "cliente",
  },
  {
    id: 2,
    nome: "Atendente Teste",
    email: "atendente@chamatech.com",
    senha: "123456",
    perfil: "atendente",
    cargo: "Atendente de Suporte",
    setor: "Suporte Técnico",
    matricula: "AT-002",
  },
];

function obterBanco() {
  const bancoSalvo = localStorage.getItem(DB_KEY);

  if (bancoSalvo) {
    const banco = JSON.parse(bancoSalvo);

    const atendente = banco.usuarios.find(
      (usuario) => usuario.email === "atendente@chamatech.com"
    );

    if (atendente) {
      if (!atendente.cargo) {
        atendente.cargo = "Atendente de Suporte";
      }

      if (!atendente.setor) {
        atendente.setor = "Suporte Técnico";
      }

      if (!atendente.matricula) {
        atendente.matricula = "AT-002";
      }

      salvarBanco(banco);
    }

    return banco;
  }

  const bancoInicial = {
    usuarios: usuariosIniciais,
    chamados: [],
    comentarios: [],
  };

  localStorage.setItem(DB_KEY, JSON.stringify(bancoInicial));

  return bancoInicial;
}

function salvarBanco(banco) {
  localStorage.setItem(DB_KEY, JSON.stringify(banco));
}

function gerarId(lista) {
  if (lista.length === 0) return 1;

  return Math.max(...lista.map((item) => item.id)) + 1;
}

function ehAtendente(usuario) {
  return usuario?.perfil === "atendente";
}

export const Mock = {
  // LOGIN
  login(email, senha) {
    const banco = obterBanco();

    const usuario = banco.usuarios.find(
      (item) =>
        item.email.toLowerCase() === email.trim().toLowerCase() &&
        item.senha === senha
    );

    if (!usuario) {
      throw new Error("E-mail ou senha incorretos.");
    }

    const usuarioSeguro = { ...usuario };
    delete usuarioSeguro.senha;

    return usuarioSeguro;
  },

  // CADASTRO
  cadastrar({ nome, email, senha }) {
    const banco = obterBanco();

    if (!nome || nome.trim().length < 2) {
      throw new Error("Informe um nome válido.");
    }

    if (!email || !email.includes("@")) {
      throw new Error("Informe um e-mail válido.");
    }

    if (!senha || senha.length < 6) {
      throw new Error("A senha deve ter pelo menos 6 caracteres.");
    }

    const emailExistente = banco.usuarios.some(
      (item) => item.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (emailExistente) {
      throw new Error("Este e-mail já está cadastrado.");
    }

    const novoUsuario = {
      id: gerarId(banco.usuarios),
      nome: nome.trim(),
      email: email.trim().toLowerCase(),
      senha,
      perfil: "cliente",
    };

    banco.usuarios.push(novoUsuario);
    salvarBanco(banco);

    const usuarioSeguro = { ...novoUsuario };
    delete usuarioSeguro.senha;

    return usuarioSeguro;
  },

   // ATUALIZAR PERFIL
  atualizarPerfil(usuario, dados) {
    const banco = obterBanco();

    const usuarioBanco = banco.usuarios.find(
      (item) => item.id === usuario.id
    );

    if (!usuarioBanco) {
      throw new Error("Usuário não encontrado.");
    }

    if (!dados.nome || dados.nome.trim().length < 2) {
      throw new Error("Informe um nome válido.");
    }

    usuarioBanco.nome = dados.nome.trim();
    usuarioBanco.telefone = dados.telefone?.trim() || "";

    salvarBanco(banco);

    const usuarioSeguro = { ...usuarioBanco };
    delete usuarioSeguro.senha;

    return usuarioSeguro;
  },
  
  // LISTAR CHAMADOS
  listarChamados(usuario, status = "") {
    const banco = obterBanco();

    let chamados = banco.chamados;

    if (!ehAtendente(usuario)) {
      chamados = chamados.filter(
        (item) => item.usuarioId === usuario.id
      );
    }

    if (status) {
      chamados = chamados.filter((item) => item.status === status);
    }

    return [...chamados].sort((a, b) => b.id - a.id);
  },

  // CRIAR CHAMADO
  criarChamado(usuario, dados) {
    const banco = obterBanco();

    if (!dados.titulo || dados.titulo.trim().length < 3) {
      throw new Error("O título deve ter pelo menos 3 caracteres.");
    }

    if (!dados.descricao || dados.descricao.trim().length < 5) {
      throw new Error("A descrição deve ter pelo menos 5 caracteres.");
    }

    const prioridadesValidas = ["baixa", "media", "alta"];

    if (!prioridadesValidas.includes(dados.prioridade)) {
      throw new Error("Selecione uma prioridade válida.");
    }

    const novoChamado = {
      id: gerarId(banco.chamados),
      codigo: `CH-${String(gerarId(banco.chamados)).padStart(4, "0")}`,
      titulo: dados.titulo.trim(),
      descricao: dados.descricao.trim(),
      prioridade: dados.prioridade,
      status: "aberto",
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      criadoEm: new Date().toISOString(),
      atualizadoEm: new Date().toISOString(),
    };

    banco.chamados.push(novoChamado);
    salvarBanco(banco);

    return novoChamado;
  },

  // BUSCAR CHAMADO POR ID
  buscarChamado(usuario, id) {
    const banco = obterBanco();

    const chamado = banco.chamados.find(
      (item) => item.id === Number(id)
    );

    if (!chamado) {
      throw new Error("Chamado não encontrado.");
    }

    if (!ehAtendente(usuario) && chamado.usuarioId !== usuario.id) {
      throw new Error("Você não tem permissão para acessar este chamado.");
    }

    return chamado;
  },

  // ALTERAR STATUS
  alterarStatus(usuario, id, status) {
    if (!ehAtendente(usuario)) {
      throw new Error("Somente atendentes podem alterar o status.");
    }

    const statusValidos = ["aberto", "em_andamento", "resolvido"];

    if (!statusValidos.includes(status)) {
      throw new Error("Status inválido.");
    }

    const banco = obterBanco();

    const chamado = banco.chamados.find(
      (item) => item.id === Number(id)
    );

    if (!chamado) {
      throw new Error("Chamado não encontrado.");
    }

    chamado.status = status;
    chamado.atualizadoEm = new Date().toISOString();

    salvarBanco(banco);

    return chamado;
  },

  // LISTAR COMENTÁRIOS
  listarComentarios(usuario, chamadoId) {
    this.buscarChamado(usuario, chamadoId);

    const banco = obterBanco();

    return banco.comentarios
      .filter((item) => item.chamadoId === Number(chamadoId))
      .sort((a, b) => new Date(a.criadoEm) - new Date(b.criadoEm));
  },

  // ADICIONAR COMENTÁRIO
  adicionarComentario(usuario, chamadoId, texto) {
    this.buscarChamado(usuario, chamadoId);

    if (!texto || !texto.trim()) {
      throw new Error("Digite um comentário.");
    }

    if (texto.trim().length > 2000) {
      throw new Error("O comentário ultrapassou 2000 caracteres.");
    }

    const banco = obterBanco();

    const novoComentario = {
      id: gerarId(banco.comentarios),
      chamadoId: Number(chamadoId),
      usuarioId: usuario.id,
      usuarioNome: usuario.nome,
      perfil: usuario.perfil,
      texto: texto.trim(),
      criadoEm: new Date().toISOString(),
    };

    banco.comentarios.push(novoComentario);
    salvarBanco(banco);

    return novoComentario;
  },
};