import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/useAuth";
import { Servico } from "../services";
import {
  formatarData,
  formatarPrioridade,
  formatarStatus,
} from "../utils/formatadores";

// Cria uma chave de data no formato local: AAAA-MM-DD
function chaveData(data) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")}`;
}

// Monta os últimos 7 dias, incluindo hoje
function criarUltimosSeteDias() {
  const dias = [];
  const hoje = new Date();

  for (let i = 6; i >= 0; i--) {
    const data = new Date(hoje);
    data.setDate(hoje.getDate() - i);

    dias.push({
      chave: chaveData(data),
      label: data.toLocaleDateString("pt-BR", { weekday: "short" }),
      dia: data.getDate(),
      total: 0,
    });
  }

  return dias;
}

// Gráfico de barras por status
function GraficoStatus({ dados }) {
  const maiorValor = Math.max(...dados.map((item) => item.total), 1);

  return (
    <div className="status-chart">
      {dados.map((item) => (
        <div className="status-chart-column" key={item.label}>
          <span className="status-chart-value">{item.total}</span>

          <div className="status-chart-track">
            <div
              className={`status-chart-bar ${item.cor}`}
              style={{
                height: `${(item.total / maiorValor) * 100}%`,
              }}
            />
          </div>

          <span className="status-chart-label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

// Gráfico de barras por prioridade
function GraficoPrioridade({ dados }) {
  const maiorValor = Math.max(...dados.map((item) => item.total), 1);

  return (
    <div className="priority-chart">
      {dados.map((item) => (
        <div className="priority-chart-row" key={item.label}>
          <span className="priority-chart-label">{item.label}</span>

          <div className="priority-chart-track">
            <div
              className={`priority-chart-bar ${item.cor}`}
              style={{
                width: `${(item.total / maiorValor) * 100}%`,
              }}
            />
          </div>

          <span className="priority-chart-value">{item.total}</span>
        </div>
      ))}
    </div>
  );
}

// Gráfico de evolução dos últimos 7 dias
function GraficoEvolucao({ dados }) {
  const largura = 600;
  const altura = 220;
  const margem = 25;

  const maiorValor = Math.max(...dados.map((item) => item.total), 1);

  const pontos = dados.map((item, index) => {
    const x =
      margem +
      (index * (largura - margem * 2)) / (dados.length - 1);

    const y =
      altura -
      margem -
      (item.total / maiorValor) * (altura - margem * 2);

    return { x, y, ...item };
  });

  const linha = pontos.map((ponto) => `${ponto.x},${ponto.y}`).join(" ");

  return (
    <div className="trend-chart">
      <svg
        viewBox={`0 0 ${largura} ${altura}`}
        className="trend-chart-svg"
        role="img"
        aria-label="Gráfico de chamados criados nos últimos sete dias"
      >
        {[0, 1, 2, 3].map((linha) => {
          const y = margem + linha * ((altura - margem * 2) / 3);

          return (
            <line
              key={linha}
              x1={margem}
              y1={y}
              x2={largura - margem}
              y2={y}
              className="trend-grid-line"
            />
          );
        })}

        <polyline
          points={linha}
          className="trend-chart-line"
        />

        {pontos.map((ponto) => (
          <circle
            key={ponto.chave}
            cx={ponto.x}
            cy={ponto.y}
            r="5"
            className="trend-chart-dot"
          />
        ))}
      </svg>

      <div className="trend-chart-labels">
        {pontos.map((ponto) => (
          <div key={ponto.chave} className="trend-chart-label-item">
            <span>{ponto.label}</span>
            <strong>{ponto.dia}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function Dashboard() {
  const { usuario } = useAuth();

  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const ehAtendente = usuario?.perfil === "atendente";

  useEffect(() => {
    let cancelado = false;

    Servico.listarChamados()
      .then((dados) => {
        if (!cancelado) setChamados(dados);
      })
      .catch((error) => {
        if (!cancelado) setErro(error.message);
      })
      .finally(() => {
        if (!cancelado) setCarregando(false);
      });

    return () => {
      cancelado = true;
    };
  }, []);

  const totalAbertos = chamados.filter(
    (item) => item.status === "aberto"
  ).length;

  const totalEmAndamento = chamados.filter(
    (item) => item.status === "em_andamento"
  ).length;

  const totalResolvidos = chamados.filter(
    (item) => item.status === "resolvido"
  ).length;

  const totalAlta = chamados.filter(
    (item) => item.prioridade === "alta"
  ).length;

  const totalMedia = chamados.filter(
    (item) => item.prioridade === "media"
  ).length;

  const totalBaixa = chamados.filter(
    (item) => item.prioridade === "baixa"
  ).length;

  const chamadosRecentes = [...chamados]
    .sort(
      (a, b) =>
        new Date(b.criadoEm).getTime() -
        new Date(a.criadoEm).getTime()
    )
    .slice(0, 5);

  // Dados para o gráfico de status
  const dadosStatus = [
    { label: "Abertos", total: totalAbertos, cor: "bar-open" },
    { label: "Em andamento", total: totalEmAndamento, cor: "bar-progress" },
    { label: "Resolvidos", total: totalResolvidos, cor: "bar-resolved" },
  ];

  // Dados para o gráfico de prioridade
  const dadosPrioridade = [
    { label: "Alta", total: totalAlta, cor: "priority-high" },
    { label: "Média", total: totalMedia, cor: "priority-medium" },
    { label: "Baixa", total: totalBaixa, cor: "priority-low" },
  ];

  // Agrupa os chamados por data de criação nos últimos 7 dias
  const dadosEvolucao = criarUltimosSeteDias();

  chamados.forEach((chamado) => {
    if (!chamado.criadoEm) return;

    const data = new Date(chamado.criadoEm);
    if (Number.isNaN(data.getTime())) return;

    const chave = chaveData(data);
    const diaEncontrado = dadosEvolucao.find(
      (item) => item.chave === chave
    );

    if (diaEncontrado) diaEncontrado.total++;
  });

  if (carregando) {
    return <div className="dashboard-page">Carregando painel...</div>;
  }

  if (erro) {
    return <div className="dashboard-page error-message">{erro}</div>;
  }

  // DASHBOARD DO CLIENTE
  if (!ehAtendente) {
    return (
      <div className="dashboard-page">
        <div className="page-heading">
          <div>
            <h1>Olá, {usuario?.nome || "cliente"}! </h1>
            <p>Acompanhe suas solicitações de suporte.</p>
          </div>

          <Link to="/novo-chamado" className="new-ticket-button">
            + Abrir chamado
          </Link>
        </div>

        <section className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Meus chamados</h3>
            <span>{chamados.length}</span>
          </div>

          <div className="dashboard-card">
            <h3>Abertos</h3>
            <span>{totalAbertos}</span>
          </div>

          <div className="dashboard-card">
            <h3>Em andamento</h3>
            <span>{totalEmAndamento}</span>
          </div>

          <div className="dashboard-card">
            <h3>Resolvidos</h3>
            <span>{totalResolvidos}</span>
          </div>
        </section>

        <section className="ticket-list-section">
          <div className="ticket-list-heading">
            <h2>Minhas solicitações recentes</h2>
            <Link to="/chamados" className="dashboard-see-all">
              Ver todos
            </Link>
          </div>

          {chamadosRecentes.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum chamado por enquanto</h3>
              <p>Quando você abrir um chamado, ele aparecerá aqui.</p>
              <Link to="/novo-chamado" className="new-ticket-button">
                Abrir meu primeiro chamado
              </Link>
            </div>
          ) : (
            <div className="ticket-list">
              {chamadosRecentes.map((chamado) => (
                <Link
                  key={chamado.id}
                  to={`/chamado/${chamado.id}`}
                  className="ticket-item"
                >
                  <div className="ticket-main">
                    <span className="ticket-code">{chamado.codigo}</span>
                    <h3>{chamado.titulo}</h3>
                    <p>{chamado.descricao}</p>
                  </div>

                  <div className="ticket-details">
                    <span className={`ticket-status status-${chamado.status}`}>
                      {formatarStatus(chamado.status)}
                    </span>

                    <span
                      className={`ticket-priority priority-${chamado.prioridade}`}
                    >
                      Prioridade: {formatarPrioridade(chamado.prioridade)}
                    </span>

                    <span className="ticket-date">
                      {formatarData(chamado.criadoEm)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    );
  }

  // DASHBOARD DO ATENDENTE
  return (
    <div className="dashboard-page attendant-dashboard">
      <div className="page-heading">
        <div>
          <h1>Central de atendimento</h1>
          <p>Visão geral das solicitações e operação de suporte.</p>
        </div>

        <Link to="/chamados" className="new-ticket-button">
          Ver fila de chamados
        </Link>
      </div>

      {/* Indicadores */}
      <section className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Total de chamados</h3>
          <span>{chamados.length}</span>
        </div>

        <div className="dashboard-card">
          <h3>Abertos</h3>
          <span>{totalAbertos}</span>
        </div>

        <div className="dashboard-card">
          <h3>Em andamento</h3>
          <span>{totalEmAndamento}</span>
        </div>

        <div className="dashboard-card">
          <h3>Resolvidos</h3>
          <span>{totalResolvidos}</span>
        </div>
      </section>

      {/* Gráficos */}
      <section className="dashboard-charts">
        <div className="dashboard-chart-card">
          <h2>Chamados por status</h2>
          <p>Distribuição atual das solicitações</p>
          <GraficoStatus dados={dadosStatus} />
        </div>

        <div className="dashboard-chart-card">
          <h2>Chamados por prioridade</h2>
          <p>Volume por nível de prioridade</p>
          <GraficoPrioridade dados={dadosPrioridade} />
        </div>

        <div className="dashboard-chart-card dashboard-trend-card">
          <h2>Volume de chamados</h2>
          <p>Chamados criados nos últimos 7 dias</p>
          <GraficoEvolucao dados={dadosEvolucao} />
        </div>
      </section>

      {/* Chamados recentes */}
      <section className="ticket-list-section">
        <div className="ticket-list-heading">
          <h2>Chamados recentes</h2>
          <Link to="/chamados" className="dashboard-see-all">
            Ver todos
          </Link>
        </div>

        {chamadosRecentes.length === 0 ? (
          <div className="empty-state">
            <h3>Nenhum chamado registrado</h3>
            <p>Quando houver solicitações, elas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="ticket-list">
            {chamadosRecentes.map((chamado) => (
              <Link
                key={chamado.id}
                to={`/chamado/${chamado.id}`}
                className="ticket-item"
              >
                <div className="ticket-main">
                  <span className="ticket-code">{chamado.codigo}</span>
                  <h3>{chamado.titulo}</h3>
                  <p>{chamado.descricao}</p>
                </div>

                <div className="ticket-details">
                  <span className={`ticket-status status-${chamado.status}`}>
                    {formatarStatus(chamado.status)}
                  </span>

                  <span
                    className={`ticket-priority priority-${chamado.prioridade}`}
                  >
                    Prioridade: {formatarPrioridade(chamado.prioridade)}
                  </span>

                  <span className="ticket-date">
                    {formatarData(chamado.criadoEm)}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Dashboard;