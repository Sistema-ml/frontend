// ─── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = "md", color = "#1a237e" }) {
  const s = size === "sm" ? 20 : size === "lg" ? 48 : 32;
  return (
    <div
      className="spinner-border"
      role="status"
      style={{ width: s, height: s, color, borderWidth: 3 }}
    >
      <span className="visually-hidden">Cargando...</span>
    </div>
  );
}

// ─── BadgeEstado ────────────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  Pendiente:    { bg: "#fd7e1420", color: "#fd7e14", icon: "hourglass-split" },
  "En revisión":{ bg: "#0288d120", color: "#0288d1", icon: "eye-fill" },
  Observado:    { bg: "#6f42c120", color: "#6f42c1", icon: "exclamation-circle-fill" },
  Aprobado:     { bg: "#19875420", color: "#198754", icon: "check-circle-fill" },
  Rechazado:    { bg: "#dc354520", color: "#dc3545", icon: "x-circle-fill" },
};

export function BadgeEstado({ estado }) {
  const cfg = ESTADO_CONFIG[estado] || { bg: "#6c757d20", color: "#6c757d", icon: "question-circle" };
  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
      style={{ background: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11 }}
    >
      <i className={`bi bi-${cfg.icon}`} style={{ fontSize: 10 }}></i>
      {estado}
    </span>
  );
}

// ─── BadgePrioridad ─────────────────────────────────────────────────────────────
const PRIORIDAD_CONFIG = {
  Alta:  { bg: "#dc354520", color: "#dc3545", icon: "arrow-up-circle-fill" },
  Media: { bg: "#fd7e1420", color: "#fd7e14", icon: "dash-circle-fill" },
  Baja:  { bg: "#19875420", color: "#198754", icon: "arrow-down-circle-fill" },
};

export function BadgePrioridad({ prioridad }) {
  if (!prioridad) return <span className="text-muted small">—</span>;
  const cfg = PRIORIDAD_CONFIG[prioridad] || { bg: "#6c757d20", color: "#6c757d", icon: "circle" };
  return (
    <span
      className="badge d-inline-flex align-items-center gap-1 px-2 py-1 rounded-pill"
      style={{ background: cfg.bg, color: cfg.color, fontWeight: 600, fontSize: 11 }}
    >
      <i className={`bi bi-${cfg.icon}`} style={{ fontSize: 10 }}></i>
      {prioridad}
    </span>
  );
}

// ─── ModalConfirm ───────────────────────────────────────────────────────────────
export function ModalConfirm({ show, title, message, onConfirm, onCancel, loading, variant = "danger" }) {
  if (!show) return null;
  const btnClass = `btn btn-${variant}`;
  const iconClass = variant === "danger" ? "exclamation-triangle-fill text-danger" : "question-circle-fill text-warning";
  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }} onClick={onCancel}>
      <div
        className="modal-dialog modal-dialog-centered modal-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 12 }}>
          <div className="modal-body p-4 text-center">
            <i className={`bi bi-${iconClass} fs-1 mb-3 d-block`}></i>
            <h6 className="fw-bold mb-2">{title}</h6>
            <p className="text-muted small mb-4">{message}</p>
            <div className="d-flex gap-2 justify-content-center">
              <button className={btnClass} onClick={onConfirm} disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                Confirmar
              </button>
              <button className="btn btn-outline-secondary" onClick={onCancel} disabled={loading}>
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── EmptyState ─────────────────────────────────────────────────────────────────
export function EmptyState({ icon = "inbox", title = "Sin datos", description = "", action }) {
  return (
    <div className="text-center py-5 text-muted">
      <i className={`bi bi-${icon} fs-1 d-block mb-2`}></i>
      <div className="fw-semibold mb-1">{title}</div>
      {description && <div className="small mb-3">{description}</div>}
      {action && action}
    </div>
  );
}

// ─── Alert ──────────────────────────────────────────────────────────────────────
export function Alert({ type = "info", message, onClose }) {
  if (!message) return null;
  const icons = { info: "info-circle-fill", success: "check-circle-fill", warning: "exclamation-triangle-fill", danger: "x-circle-fill" };
  return (
    <div className={`alert alert-${type} d-flex align-items-center gap-2 ${onClose ? "alert-dismissible" : ""}`}>
      <i className={`bi bi-${icons[type] || "info-circle-fill"}`}></i>
      <span>{message}</span>
      {onClose && (
        <button type="button" className="btn-close ms-auto" onClick={onClose} />
      )}
    </div>
  );
}
