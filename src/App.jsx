import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import Login from "./pages/Login";
import Menu from "./pages/Menu";
import Dashboard from "./pages/Dashboard";
import ConfigurarRotaAlunos from "./pages/ConfigurarRotaAlunos";
import { PrivateRoute } from "./routes/PrivateRoute";
import ConfigurarRotaMotorista from "./pages/ConfigurarRotaMotorista";
import GerenciarMotoristas from "./pages/GerenciarMotoristas";

function ProtectedLayout() {
  return (
    <>
      <Menu />
      <div className="p-4">
        <Outlet />
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<PrivateRoute />}>
            <Route element={<ProtectedLayout />}>
              <Route
                path="/rota-motorista"
                element={<ConfigurarRotaMotorista />}
              />
              <Route path="/rota-alunos" element={<ConfigurarRotaAlunos />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/motorista" element={<GerenciarMotoristas />} />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
