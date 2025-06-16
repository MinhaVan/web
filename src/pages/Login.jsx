import { useState } from "react";
import { useAuth } from "../hooks/useAuth";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("walterli.valadares@gmail.com");
  const [senha, setSenha] = useState("Walterli#10");
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");

    try {
      await login(email, senha);
    } catch (err) {
      console.error("Erro no login:", err);
      setErro("E-mail ou senha inválidos");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md w-full max-w-sm"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>

        {erro && <p className="text-red-600 text-sm mb-4">{erro}</p>}

        <div className="mb-4">
          <label className="block mb-1 font-medium">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        <div className="mb-6">
          <label className="block mb-1 font-medium">Senha</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
            className="w-full p-2 border rounded-md focus:outline-none focus:ring focus:border-blue-400"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 transition"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
