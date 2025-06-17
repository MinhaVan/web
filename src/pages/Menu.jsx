import { NavLink } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function Menu() {
  const { logout, user } = useAuth();

  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between items-center">
      <div>
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            isActive ? "font-bold underline" : "hover:underline"
          }
        >
          Dashboard
        </NavLink>
        <NavLink to="/rota-alunos" className="ml-4 hover:underline">
          Rota x Alunos
        </NavLink>
        <NavLink to="/rota-motorista" className="ml-4 hover:underline">
          Rota x Motorista
        </NavLink>
        <NavLink to="/motorista" className="ml-4 hover:underline">
          Motorista
        </NavLink>
      </div>

      <div>
        <span className="mr-4">Olá, {user?.primeiroNome || "Usuário"}</span>
        <button
          onClick={logout}
          className="bg-red-600 px-3 py-1 rounded hover:bg-red-700"
        >
          Sair
        </button>
      </div>
    </nav>
  );
}
