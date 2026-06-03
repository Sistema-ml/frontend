import { api } from "./client";

// ─── Auth ───────────────────────────────────────────────────────────────────────
export const authService = {
  login: async (email, password) => {
    const res = await fetch(
      `${import.meta.env.VITE_API_URL || "http://localhost:8000"}/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Credenciales incorrectas");
    }
    return res.json();
  },
  me: () => api.get("/auth/me"),
};

// ─── Usuarios ───────────────────────────────────────────────────────────────────
export const usuariosService = {
  listar: (params) => api.get("/auth/usuarios", params),
  obtener: (id) => api.get(`/auth/usuarios/${id}`),
  crear: (data) => api.post("/auth/usuarios", data),
  actualizar: (id, data) => api.patch(`/auth/usuarios/${id}`, data),
  eliminar: (id) => api.delete(`/auth/usuarios/${id}`),
};

// ─── Ciudadanos ─────────────────────────────────────────────────────────────────
export const ciudadanosService = {
  listar: (params) => api.get("/ciudadanos/", params),
  obtener: (id) => api.get(`/ciudadanos/${id}`),
  crear: (data) => api.post("/ciudadanos/", data),
  actualizar: (id, data) => api.patch(`/ciudadanos/${id}`, data),
  eliminar: (id) => api.delete(`/ciudadanos/${id}`),
  tramites: (id) => api.get(`/ciudadanos/${id}/historial`),
};

// ─── Trámites ───────────────────────────────────────────────────────────────────
export const tramitesService = {
  listar: (params) => api.get("/tramites/", params),
  obtener: (id) => api.get(`/tramites/${id}`),
  crear: (data) => api.post("/tramites/", data),
  actualizar: (id, data) => api.patch(`/tramites/${id}`, data),
  eliminar: (id) => api.delete(`/tramites/${id}`),
  cambiarEstado: (id, data) => api.patch(`/tramites/${id}/estado`, data),

  // Documentos del trámite
  listarDocumentos: (tramiteId) => api.get(`/documentos/${tramiteId}`),
  subirDocumento: (tramiteId, formData) =>
    api.post(`/documentos/${tramiteId}`, formData),
  eliminarDocumento: (tramiteId, docId) =>
    api.delete(`/tramites/${tramiteId}/documentos/${docId}`),

  // Historial
  listarHistorial: (tramiteId) => api.get(`/tramites/${tramiteId}/historial`),
};

// ─── Documentos ─────────────────────────────────────────────────────────────────
export const documentosService = {
  obtener: (id) => api.get(`/documentos/${id}`),
  eliminar: (id) => api.delete(`/documentos/${id}`),
};

// ─── Dashboard ──────────────────────────────────────────────────────────────────
export const dashboardService = {
  getStats: () => api.get("/tramites/dashboard"),
  getTramitesPorArea: () => api.get("/tramites/dashboard"),
  getTramitesPorEstado: () => api.get("/tramites/dashboard"),
};

// ─── Notificaciones ─────────────────────────────────────────────────────────────
export const notificacionesService = {
  listar: (params) => api.get("/notificaciones", params),
  marcarLeida: (id) => api.patch(`/notificaciones/${id}/leida`, {}),
  marcarTodasLeidas: () => api.patch("/notificaciones/marcar-todas-leidas", {}),
};

// ─── Machine Learning ───────────────────────────────────────────────────────────
export const mlService = {
  predecir: (data) => api.post("/ml/predecir", data),
  reentrenar: () => api.post("/ml/reentrenar", {}),
  metricas: () => api.get("/ml/metricas"),
};
