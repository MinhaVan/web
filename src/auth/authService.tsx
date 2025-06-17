const baseUrl = import.meta.env.VITE_API_BASE_URL;
const empresaId = import.meta.env.VITE_EMPRESA_ID;

export const loginRequest = async (email: string, senha: string) => {
  const response = await fetch(baseUrl + "/Auth/v1/Token/Login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha, isMotorista: false, empresaId }),
  });

  if (!response.ok) return null;

  const data = await response.json();

  return data.data;
};
