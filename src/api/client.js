const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    ...(options.body && !(options.body instanceof FormData)
      ? { "Content-Type": "application/json" }
      : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  // Sin contenido
  if (res.status === 204) return null;

  // No autorizado → limpiar sesión
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    throw new Error("Sesión expirada");
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const msg =
      (Array.isArray(data?.detail) ? data.detail.map((e) => e.msg).join(", ") : null) ||
      (typeof data?.detail === "string" ? data.detail : null) ||
      `Error ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

export const api = {
  get: (path, params) => {
    const url = params
      ? `${path}?${new URLSearchParams(
          Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
        )}`
      : path;
    return request(url, { method: "GET" });
  },
  post: (path, body) =>
    request(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (path, body) =>
    request(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (path, body) =>
    request(path, {
      method: "PATCH",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: (path) => request(path, { method: "DELETE" }),
};
