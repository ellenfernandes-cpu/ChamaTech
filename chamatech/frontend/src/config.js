// Configuração lida das variáveis de ambiente do Vite (arquivo .env ou build do Docker).
// VITE_USE_MOCK=true  -> usa dados simulados no navegador (não precisa do backend)
// VITE_USE_MOCK=false -> conversa com a API real em VITE_API_URL
export const USAR_MOCK = import.meta.env?.VITE_USE_MOCK !== "false";
export const API_URL = import.meta.env?.VITE_API_URL ?? "http://localhost:8000";
