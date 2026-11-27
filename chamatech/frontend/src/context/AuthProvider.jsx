
import { useState } from "react";
import { AuthContext } from "./AuthContext";

const USUARIO_KEY = "chamatech_usuario";
const TOKEN_KEY = "chamatech_token";

// Recupera o usuário salvo no navegador com segurança.
function recuperarUsuario() {
  try {
    const usuarioSalvo = localStorage.getItem(USUARIO_KEY);

    if (!usuarioSalvo) {
      return null;
    }

    const usuario = JSON.parse(usuarioSalvo);

    // Verifica se os dados recuperados representam um objeto válido.
    if (
      usuario === null ||
      typeof usuario !== "object" ||
      Array.isArray(usuario)
    ) {
      throw new Error("Dados de usuário inválidos.");
    }

    return usuario;
  } catch (erro) {
    console.error("Erro ao recuperar sessão:", erro);

    localStorage.removeItem(USUARIO_KEY);
    localStorage.removeItem(TOKEN_KEY);

    return null;
  }
}

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(recuperarUsuario);

  function login(dadosUsuario, token) {
    setUsuario(dadosUsuario);

    localStorage.setItem(USUARIO_KEY, JSON.stringify(dadosUsuario));
    localStorage.setItem(TOKEN_KEY, token);
  }

  function logout() {
    setUsuario(null);

    localStorage.removeItem(USUARIO_KEY);
    localStorage.removeItem(TOKEN_KEY);
  }

  function atualizarUsuario(dadosUsuario) {
    setUsuario(dadosUsuario);

    localStorage.setItem(USUARIO_KEY, JSON.stringify(dadosUsuario));
  }

  return (
    <AuthContext.Provider value={{ usuario, login, logout, atualizarUsuario }}>
      {children}
    </AuthContext.Provider>
  );
}
