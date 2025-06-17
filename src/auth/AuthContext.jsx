import { createContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "./authService";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(() => {
    return "";
  });
  const navigate = useNavigate();

  const login = async (email, senha) => {
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
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
