
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/useAuth";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Cadastro from "./pages/Cadastro";
import Dashboard from "./pages/Dashboard";
import Chamados from "./pages/Chamados";
import NovoChamado from "./pages/NovoChamado";
import DetalheChamado from "./pages/DetalheChamado";
import Perfil from "./pages/Perfil";

function RotaProtegida({ children }) {
  const { usuario } = useAuth();

  if (!usuario) {
    return <Navigate to="/" replace />;
  }

  return <Layout>{children}</Layout>;
}

function App() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route
        path="/"
        element={
          usuario ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />

      <Route
        path="/cadastro"
        element={
          usuario ? <Navigate to="/dashboard" replace /> : <Cadastro />
        }
      />

      <Route
        path="/dashboard"
        element={
          <RotaProtegida>
            <Dashboard />
          </RotaProtegida>
        }
      />

      <Route
        path="/chamados"
        element={
          <RotaProtegida>
            <Chamados />
          </RotaProtegida>
        }
      />

      <Route
        path="/novo-chamado"
        element={
          <RotaProtegida>
            <NovoChamado />
          </RotaProtegida>
        }
      />

      <Route
        path="/chamado/:id"
        element={
          <RotaProtegida>
            <DetalheChamado />
          </RotaProtegida>
        }
      />

      <Route
        path="/perfil"
        element={
          <RotaProtegida>
            <Perfil />
          </RotaProtegida>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
