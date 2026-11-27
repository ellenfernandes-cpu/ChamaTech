// Ponto único de acesso aos dados. As páginas importam apenas "Servico".
// Em modo simulado usa o Mock (localStorage); caso contrário, a API real.
import { USAR_MOCK } from "../config";
import { Api } from "./api";
import { Mock } from "./mock";

const usuarioAtual = () =>
  JSON.parse(localStorage.getItem("chamatech_usuario"));

// Adapta o Mock (síncrono) para a mesma interface assíncrona da API real,
// com um pequeno atraso para que os estados de "carregando" apareçam.
const atraso = (valor) =>
  new Promise((resolve) => setTimeout(() => resolve(valor), 150));

const ServicoMock = {
  login: async (email, senha) =>
    atraso({ usuario: Mock.login(email, senha), token: "mock" }),

  cadastrar: async (dados) =>
    atraso({ usuario: Mock.cadastrar(dados), token: "mock" }),

  atualizarPerfil: async (dados) =>
    atraso(Mock.atualizarPerfil(usuarioAtual(), dados)),

  listarChamados: async () => atraso(Mock.listarChamados(usuarioAtual())),

  criarChamado: async (dados) =>
    atraso(Mock.criarChamado(usuarioAtual(), dados)),

  buscarChamado: async (id) =>
    atraso(Mock.buscarChamado(usuarioAtual(), id)),

  alterarStatus: async (id, status) =>
    atraso({ ...Mock.alterarStatus(usuarioAtual(), id, status) }),

  listarComentarios: async (id) =>
    atraso(Mock.listarComentarios(usuarioAtual(), id)),

  adicionarComentario: async (id, texto) =>
    atraso(Mock.adicionarComentario(usuarioAtual(), id, texto)),
};

export const Servico = USAR_MOCK ? ServicoMock : Api;
