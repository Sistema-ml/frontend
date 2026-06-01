import { useState, useEffect, useCallback } from "react";
import { notificacionesService } from "../api/services";
import { Spinner } from "../components/ui";

const TIPO_ICON = {
  registro: { icon: "plus-circle-fill", color: "#0288d1" },
  cambio_estado: { icon: "arrow-repeat", color: "#fd7e14" },
  aprobacion: { icon: "check-circle-fill", color: "#198754" },
  rechazo: { icon: "x-circle-fill", color: "#dc3545" },
};

export default function Notificaciones() {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [soloNoLeidas, setSoloNoLeidas] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await notificacionesService.listar({ no_leidas: soloNoLeidas || undefined });
      setNotificaciones(data);
    } catch {
      setNotificaciones([]);
    } finally {
      setLoading(false);
    }
  }, [soloNoLeidas]);

  useEffect(() => { cargar(); }, [cargar]);

  const marcarLeida = async (id) => {
    try {
      await notificacionesService.marcarLeida(id);
      setNotificaciones((prev) =>
        prev.map((n) => (n.id === id ? { ...n, leida: true } : n))
      );
    } catch {}
  };

  const marcarTodasLeidas = async () => {
    try {
      await notificacionesService.marcarTodasLeidas();
      setNotificaciones((prev) => prev.map((n) => ({ ...n, leida: true })));
    } catch {}
  };

  const noLeidas = notificaciones.filter((n) => !n.leida).length;

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: "#1a237e" }}>
            <i className="bi bi-bell-fill me-2"></i>Notificaciones
            {noLeidas > 0 && (
              <span className="badge bg-danger ms-2" style={{ fontSize: 13 }}>{noLeidas}</span>
            )}
          </h4>
          <p className="text-muted small mb-0">Centro de notificaciones del sistema</p>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <div className="form-check form-switch mb-0">
            <input
              className="form-check-input"
              type="checkbox"
              id="soloNoLeidas"
              checked={soloNoLeidas}
              onChange={(e) => setSoloNoLeidas(e.target.checked)}
            />
            <label className="form-check-label small" htmlFor="soloNoLeidas">Solo no leídas</label>
          </div>
          {noLeidas > 0 && (
            <button className="btn btn-sm btn-outline-primary" onClick={marcarTodasLeidas}>
              <i className="bi bi-check2-all me-1"></i>Marcar todas como leídas
            </button>
          )}
        </div>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5"><Spinner /></div>
          ) : notificaciones.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-bell-slash fs-1 d-block mb-2"></i>
              <div className="fw-semibold">Sin notificaciones</div>
              <div className="small">No hay notificaciones {soloNoLeidas ? "no leídas" : "registradas"}</div>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {notificaciones.map((n) => {
                const tipo = TIPO_ICON[n.tipo] || { icon: "info-circle-fill", color: "#6c757d" };
                return (
                  <div
                    key={n.id}
                    className={`list-group-item list-group-item-action d-flex gap-3 py-3 px-4 ${!n.leida ? "border-start border-4 border-primary" : ""}`}
                    style={{ background: n.leida ? "transparent" : "#f0f4ff" }}
                  >
                    <div
                      className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                      style={{ width: 40, height: 40, background: `${tipo.color}18` }}
                    >
                      <i className={`bi bi-${tipo.icon}`} style={{ color: tipo.color, fontSize: 18 }}></i>
                    </div>
                    <div className="flex-grow-1 min-width-0">
                      <div className="d-flex align-items-start justify-content-between gap-2">
                        <div>
                          <div className={`small ${!n.leida ? "fw-bold" : "fw-semibold"}`}>
                            {n.titulo || n.mensaje?.slice(0, 60)}
                          </div>
                          <div className="small text-muted mt-1">{n.mensaje}</div>
                          {n.tramite_id && (
                            <div className="mt-1">
                              <a href={`/tramites/${n.tramite_id}`} className="small text-primary text-decoration-none">
                                <i className="bi bi-folder2-open me-1"></i>Ver trámite
                              </a>
                            </div>
                          )}
                        </div>
                        <div className="text-end flex-shrink-0">
                          <div className="text-muted" style={{ fontSize: 11, whiteSpace: "nowrap" }}>
                            {n.fecha ? new Date(n.fecha).toLocaleString("es-PE", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : ""}
                          </div>
                          {!n.leida && (
                            <button
                              className="btn btn-sm btn-link p-0 mt-1 text-primary"
                              style={{ fontSize: 11 }}
                              onClick={() => marcarLeida(n.id)}
                            >
                              Marcar leída
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
