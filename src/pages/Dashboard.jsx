import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dashboardService } from "../api/services";
import { Spinner } from "../components/ui";

// Gráfico de barras simple con CSS
function BarChart({ data, title }) {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value));
  return (
    <div>
      {title && <h6 className="fw-semibold text-muted small mb-3">{title}</h6>}
      <div className="d-flex flex-column gap-2">
        {data.map((item, i) => (
          <div key={i}>
            <div className="d-flex justify-content-between small mb-1">
              <span className="text-truncate" style={{ maxWidth: 140 }}>{item.label}</span>
              <span className="fw-bold">{item.value}</span>
            </div>
            <div className="progress" style={{ height: 8, borderRadius: 4 }}>
              <div
                className="progress-bar"
                style={{
                  width: `${max > 0 ? (item.value / max) * 100 : 0}%`,
                  background: item.color || "#1a237e",
                  borderRadius: 4,
                  transition: "width 0.8s ease",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Card de métrica
function StatCard({ icon, label, value, color, to }) {
  const content = (
    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12, borderLeft: `4px solid ${color}` }}>
      <div className="card-body">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="text-muted small mb-1">{label}</p>
            <h3 className="fw-bold mb-0" style={{ color }}>{value ?? "—"}</h3>
          </div>
          <div
            className="d-flex align-items-center justify-content-center rounded-circle"
            style={{ width: 48, height: 48, background: `${color}18` }}
          >
            <i className={`bi bi-${icon} fs-4`} style={{ color }}></i>
          </div>
        </div>
      </div>
    </div>
  );
  return to ? <Link to={to} className="text-decoration-none">{content}</Link> : content;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch(() => setError("No se pudo cargar el dashboard"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: 300 }}>
      <Spinner />
    </div>
  );

  if (error) return (
    <div className="alert alert-warning d-flex align-items-center gap-2">
      <i className="bi bi-exclamation-triangle-fill"></i>
      {error} — Mostrando datos de ejemplo.
    </div>
  );

  // Datos por prioridad para el gráfico
  const prioridadData = [
    { label: "Alta", value: stats?.por_prioridad?.alta ?? 0, color: "#dc3545" },
    { label: "Media", value: stats?.por_prioridad?.media ?? 0, color: "#fd7e14" },
    { label: "Baja", value: stats?.por_prioridad?.baja ?? 0, color: "#198754" },
  ];

  // Datos por área
  const areaData = (stats?.por_area ?? []).map((a, i) => ({
    label: a.area,
    value: a.total,
    color: ["#1a237e", "#1565c0", "#0288d1", "#0097a7", "#00796b"][i % 5],
  }));

  return (
    <div>
      {/* Encabezado */}
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: "#1a237e" }}>
            <i className="bi bi-speedometer2 me-2"></i>Dashboard
          </h4>
          <p className="text-muted small mb-0">Resumen general del sistema de trámites</p>
        </div>
        <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2" style={{ borderRadius: 8 }}>
          <i className="bi bi-clock me-1"></i>
          {new Date().toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </span>
      </div>

      {/* Métricas principales */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard icon="folder2-open" label="Total Trámites" value={stats?.total_tramites} color="#1a237e" to="/tramites" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="hourglass-split" label="Pendientes" value={stats?.pendientes} color="#fd7e14" to="/tramites?estado=Pendiente" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="check-circle-fill" label="Aprobados" value={stats?.aprobados} color="#198754" to="/tramites?estado=Aprobado" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="x-circle-fill" label="Rechazados" value={stats?.rechazados} color="#dc3545" to="/tramites?estado=Rechazado" />
        </div>
      </div>

      {/* Segunda fila de métricas */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard icon="eye" label="En Revisión" value={stats?.en_revision} color="#0288d1" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="exclamation-circle" label="Observados" value={stats?.observados} color="#6f42c1" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="people-fill" label="Ciudadanos" value={stats?.total_ciudadanos} color="#0097a7" to="/ciudadanos" />
        </div>
        <div className="col-6 col-md-3">
          <StatCard icon="clock-history" label="Tiempo Prom. (días)" value={stats?.tiempo_promedio_atencion?.toFixed(1)} color="#e91e63" />
        </div>
      </div>

      {/* Gráficos */}
      <div className="row g-3">
        {/* Prioridad */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                <i className="bi bi-bar-chart-fill me-2"></i>Trámites por Prioridad
              </h6>
              <BarChart data={prioridadData} />
              <hr className="my-3" />
              <div className="d-flex justify-content-around">
                {prioridadData.map((p) => (
                  <div key={p.label} className="text-center">
                    <div className="fw-bold fs-5" style={{ color: p.color }}>{p.value}</div>
                    <div className="text-muted" style={{ fontSize: 11 }}>{p.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Por área */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                <i className="bi bi-diagram-3-fill me-2"></i>Trámites por Área
              </h6>
              {areaData.length > 0 ? (
                <BarChart data={areaData} />
              ) : (
                <p className="text-muted small">Sin datos por área</p>
              )}
            </div>
          </div>
        </div>

        {/* Estados donut visual */}
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100" style={{ borderRadius: 12 }}>
            <div className="card-body">
              <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                <i className="bi bi-pie-chart-fill me-2"></i>Distribución de Estados
              </h6>
              {[
                { label: "Pendiente", value: stats?.pendientes ?? 0, color: "#fd7e14", icon: "hourglass-split" },
                { label: "En revisión", value: stats?.en_revision ?? 0, color: "#0288d1", icon: "eye" },
                { label: "Aprobado", value: stats?.aprobados ?? 0, color: "#198754", icon: "check-circle" },
                { label: "Rechazado", value: stats?.rechazados ?? 0, color: "#dc3545", icon: "x-circle" },
                { label: "Observado", value: stats?.observados ?? 0, color: "#6f42c1", icon: "exclamation-circle" },
              ].map((item) => (
                <div key={item.label} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                  <div className="d-flex align-items-center gap-2">
                    <i className={`bi bi-${item.icon}`} style={{ color: item.color }}></i>
                    <span className="small">{item.label}</span>
                  </div>
                  <span className="badge rounded-pill" style={{ background: `${item.color}20`, color: item.color, fontWeight: 700 }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Acciones rápidas */}
      <div className="card border-0 shadow-sm mt-4" style={{ borderRadius: 12 }}>
        <div className="card-body">
          <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
            <i className="bi bi-lightning-fill me-2"></i>Acciones Rápidas
          </h6>
          <div className="d-flex flex-wrap gap-2">
            <Link to="/tramites/nuevo" className="btn btn-primary btn-sm">
              <i className="bi bi-plus-circle me-1"></i>Nuevo Trámite
            </Link>
            <Link to="/ciudadanos/nuevo" className="btn btn-outline-primary btn-sm">
              <i className="bi bi-person-plus me-1"></i>Registrar Ciudadano
            </Link>
            <Link to="/tramites" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-list-ul me-1"></i>Ver Todos los Trámites
            </Link>
            <Link to="/usuarios" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-people me-1"></i>Gestionar Usuarios
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
