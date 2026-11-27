
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function Layout({ children }) {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const ehAtendente = usuario?.perfil === "atendente";

  function sair() {
    logout();
    navigate("/", { replace: true });
  }

  const iniciais = usuario?.nome
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((nome) => nome[0].toUpperCase())
    .join("");

  return (
    <div className="app-layout">
      <aside className="sidebar">

        <Link to="/dashboard" className="sidebar-brand">
          <span className="brand-icon">C</span>
          <span className="brand-name">
            Chama<span>Tech</span>
          </span>
        </Link>

        <div className="sidebar-section">
          <nav className="sidebar-nav">
            <NavLink to="/dashboard" className="sidebar-link">
              Dashboard
            </NavLink>

            <NavLink to="/chamados" className="sidebar-link">
              {ehAtendente ? "Todos os chamados" : "Meus chamados"}
            </NavLink>

            {!ehAtendente && (
            <>
            <NavLink to="/novo-chamado" className="sidebar-link">
              Abrir chamado
            </NavLink>
          </>
        )}
          </nav>
        </div>

        <div className="sidebar-bottom">
          <Link
            to="/perfil"
            className="sidebar-profile"
            style={{ textDecoration: "none", color: "inherit", cursor: "pointer" }}
          >
            <div className="profile-avatar">
              {iniciais || "U"}
            </div>

            <div className="profile-info">
              <span className="profile-name">
                {usuario?.nome || "Usuário"}
              </span>

              <span className="profile-role">
                {ehAtendente ? "Atendente" : "Cliente"}
              </span>
            </div>
          </Link>

          <button
            type="button"
            className="sidebar-logout"
            onClick={sair}
          >
            Sair da conta
          </button>
        </div>
      </aside>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
}

export default Layout;
