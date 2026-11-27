const STATUS = {
  aberto: "Aberto",
  em_andamento: "Em andamento",
  resolvido: "Resolvido",
};

const PRIORIDADE = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
};

export const formatarStatus = (status) => STATUS[status] || status;

export const formatarPrioridade = (prioridade) =>
  PRIORIDADE[prioridade] || prioridade;

export const formatarData = (data) =>
  new Date(data).toLocaleDateString("pt-BR");

export const formatarDataHora = (data) =>
  new Date(data).toLocaleString("pt-BR");
