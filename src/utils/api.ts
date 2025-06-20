import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { BaseResponse } from "../types/BaseResponse";

const baseUrl = import.meta.env.VITE_API_BASE_URL;

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

async function tryRefreshToken(refreshToken: string): Promise<any | null> {
  try {
    const response = await axios.post(`${baseUrl}/Auth/v1/Token/RefreshToken`, {
      RefreshToken: refreshToken,
    }, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    return response.data.data;
  } catch (error) {
    console.error("Erro ao tentar refresh token:", error);
    return null;
  }
}

// Instância principal do Axios
const api: AxiosInstance = axios.create({
  baseURL: baseUrl,
});

// Interceptor de request – adiciona o token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token && config.headers) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Interceptor de resposta – trata erro 401 com refresh automático
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async error => {
    const originalRequest = error.config;
    const refreshToken = localStorage.getItem("refreshToken");

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      refreshToken
    ) {
      if (isRefreshing) {
        return new Promise(resolve => {
          subscribeTokenRefresh((newToken: string) => {
            originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const newTokenData = await tryRefreshToken(refreshToken);
      isRefreshing = false;

      if (newTokenData) {
        const { accessToken, refreshToken: newRefreshToken } = newTokenData;

        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", newRefreshToken);

        onRefreshed(accessToken);

        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        return api(originalRequest);
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Métodos utilitários expostos
export async function get<T>(url: string): Promise<BaseResponse<T>> {
  const res = await api.get<BaseResponse<T>>(url);
  return res.data;
}

export async function post<T>(url: string, body: any): Promise<BaseResponse<T>> {
  const res = await api.post<BaseResponse<T>>(url, body);
  return res.data;
}

export async function put<T>(url: string, body: any): Promise<BaseResponse<T>> {
  const res = await api.put<BaseResponse<T>>(url, body);
  return res.data;
}

export async function del<T>(url: string): Promise<BaseResponse<T>> {
  const res = await api.delete<BaseResponse<T>>(url);
  return res.data;
}
