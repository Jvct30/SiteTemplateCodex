import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000",
});

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail) && typeof detail[0]?.msg === "string") {
      return detail[0].msg;
    }
  }

  return fallback;
}

export function getApiValidationErrors(error: unknown) {
  const errors: Record<string, string> = {};

  if (!axios.isAxiosError(error)) {
    return errors;
  }

  const detail = error.response?.data?.detail;
  if (!Array.isArray(detail)) {
    return errors;
  }

  for (const item of detail) {
    const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : null;
    if (typeof field === "string" && typeof item?.msg === "string") {
      errors[field] = item.msg;
    }
  }

  return errors;
}

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  }
);

export default api;
