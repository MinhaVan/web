import { BaseResponse } from "../interfaces/BaseResponse";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

async function tryRefreshToken(refreshToken: string): Promise<any | null> {
  try {
    const res = await fetch(baseUrl + "/Auth/v1/Token/RefreshToken", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ RefreshToken: refreshToken }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.data.data;
  } catch {
    return null;
  }
}

async function fetchWithAuth<T>(
  url: string,
  options: RequestInit = {}
): Promise<BaseResponse<T>> {
  let token = localStorage.getItem("token");
  const refreshToken = localStorage.getItem("refreshToken");

  const headers = new Headers(options.headers || {});
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response = await fetch(baseUrl + url, {
    ...options,
    headers,
  });

  if (response.status === 401 && refreshToken) {
    console.log("Erro 401", response);

    const newToken = await tryRefreshToken(refreshToken);
    console.log("Tentando refresh token", newToken);

    if (newToken) {
      localStorage.setItem("token", newToken.accessToken);
      localStorage.setItem("refreshToken", newToken.refreshToken);

      token = newToken;
      headers.set("Authorization", `Bearer ${newToken}`);

      response = await fetch(baseUrl + url, {
        ...options,
        headers,
      });
    } else {
      // Refresh falhou -> limpa e redireciona
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    console.error("Deu erro dnv:", response);
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json: BaseResponse<T> = await response.json();
  return json;
}

// Métodos expostos

export async function get<T>(url: string): Promise<BaseResponse<T>> {
  return fetchWithAuth<T>(url, { method: "GET" });
}

export async function post<T>(
  url: string,
  body: any
): Promise<BaseResponse<T>> {
  return fetchWithAuth<T>(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function put<T>(url: string, body: any): Promise<BaseResponse<T>> {
  return fetchWithAuth<T>(url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function del<T>(url: string): Promise<BaseResponse<T>> {
  return fetchWithAuth<T>(url, { method: "DELETE" });
}
