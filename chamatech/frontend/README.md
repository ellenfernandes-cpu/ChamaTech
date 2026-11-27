# ChamaTech — Frontend

Interface web do ChamaTech (plataforma de help desk), feita com **React + Vite** e **React Router**.

## Funcionalidades

- Cadastro e login (cliente e atendente)
- Cliente: abrir chamados, acompanhar status e comentar
- Atendente: ver todos os chamados, comentar e alterar o status
- Painel com totais por status e filtro por status

## Como executar

```bash
npm install
cp .env.example .env     # no Windows: copy .env.example .env
npm run dev
```

Acesse o endereço mostrado no terminal (normalmente http://localhost:5173).

### Modo simulado (sem backend)

Com `VITE_USE_MOCK=true` (padrão do `.env.example`), os dados ficam no navegador (`localStorage`).

| Perfil | E-mail | Senha |
|---|---|---|
| Cliente | cliente@chamatech.com | 123456 |
| Atendente | atendente@chamatech.com | 123456 |

### Com a API real

No `.env`, altere para:

```
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8000
```

Reinicie o `npm run dev` (o Vite só lê o `.env` ao iniciar). O backend precisa liberar **CORS** para a origem do frontend.
O contrato das rotas está em `docs/api-contrato.md`.

## Estrutura

```
src/
├── main.jsx              # ponto de entrada (Router + AuthProvider)
├── App.jsx               # rotas e proteção de rotas
├── config.js             # variáveis de ambiente (modo mock e URL da API)
├── components/Layout.jsx # cabeçalho e área de conteúdo
├── context/              # sessão do usuário (AuthProvider e useAuth)
├── pages/                # Login, Cadastro, Chamados, NovoChamado, DetalheChamado
├── services/
│   ├── index.js          # escolhe entre mock e API real
│   ├── api.js            # comunicação com o backend (fetch + token)
│   └── mock.js           # dados simulados
└── utils/formatadores.js # formatação de status, prioridade e datas
```

## Docker

```bash
docker build -t chamatech-frontend --build-arg VITE_API_URL=http://localhost:8000 .
docker run -p 8080:80 chamatech-frontend
```

O `Dockerfile` usa **build em duas etapas**: o Node compila o React e o Nginx serve apenas os arquivos estáticos.
O `nginx.conf` redireciona rotas desconhecidas para o `index.html`, necessário para o React Router.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Visualiza a versão de produção |
| `npm run lint` | Verifica o código com o ESLint |
