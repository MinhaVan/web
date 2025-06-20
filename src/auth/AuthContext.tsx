import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "./authService.js";
import { Usuario } from "@/types/Usuario";

// Definindo a interface para o contexto
interface AuthContextType {
  user: Usuario | null;
  token: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

// Valor inicial do contexto
const defaultAuthContext: AuthContextType = {
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

export const AuthProvider = ({ children }: any) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState<Usuario>({} as Usuario);
  const navigate = useNavigate();

  const login = async (email: string, senha: string) => {
    const response = await loginRequest(email, senha);

    if (response?.accessToken) {
      localStorage.setItem("token", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      setToken(response.accessToken);
      setUser(response.user);
      navigate("/dashboard");
    } else {
      throw new Error("Login inválido");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setToken(null);
    setUser({} as Usuario);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
