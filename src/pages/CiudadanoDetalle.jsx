import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ciudadanosService } from "../api/services";
import { Spinner, BadgeEstado, BadgePrioridad } from "../components/ui";

export default function CiudadanoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ciudadano, setCiudadano] = useState(null);
  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      ciudadanosService.obtener(id),
      ciudadanosService.tramites(id).catch(() => []),
    ])
      .then(([c, t]) => { setCiudadano(c); setTramites(t); })
      .catch(() => setError("No se pudo cargar el ciudadano"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner /></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!ciudadano) return null;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <h4 className="fw-bold mb-0" style={{ color: "#1a237e" }}>
          <i className="bi bi-person-circle me-2"></i>Perfil del Ciudadano
        </h4>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm text-center p-4" style={{ borderRadius: 12 }}>
            <div
              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold mx-auto mb-3"
              style={{ width: 80, height: 80, background: "linear-gradient(135deg,#1a237e,#1565c0)", fontSize: 28 }}
            >
              {ciudadano.nombres?.[0]}{ciudadano.apellidos?.[0]}
            </div>
            <h5 className="fw-bold mb-1">{ciudadano.apellidos}, {ciudadano.nombres}</h5>
            <span className="badge bg-primary bg-opacity-10 text-primary mb-3">DNI: {ciudadano.dni}</span>

            <div className="text-start">
              {[
                ["bi-telephone", ciudadano.telefono],
                ["bi-envelope", ciudadano.email],
                ["bi-geo-alt", ciudadano.direccion],
                ["bi-map", ciudadano.distrito],
                ["bi-calendar3", ciudadano.fecha_nacimiento ? new Date(ciudadano.fecha_nacimiento).toLocaleDateString("es-PE") : null],
              ].filter(([, v]) => v).map(([icon, val]) => (
                <div key={icon} className="d-flex align-items-center gap-2 mb-2 small text-muted">
                  <i className={`bi ${icon}`}></i>
                  <span>{val}</span>
                </div>
              ))}
            </div>

            <hr />
            <div className="d-flex justify-content-around">
              <div className="text-center">
                <div className="fw-bold fs-4" style={{ color: "#1a237e" }}>{tramites.length}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Trámites</div>
              </div>
              <div className="text-center">
                <div className="fw-bold fs-4 text-success">{tramites.filter((t) => t.estado === "Aprobado").length}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Aprobados</div>
              </div>
              <div className="text-center">
                <div className="fw-bold fs-4 text-warning">{tramites.filter((t) => t.estado === "Pendiente").length}</div>
                <div className="text-muted" style={{ fontSize: 11 }}>Pendientes</div>
              </div>
            </div>

            <Link to={`/ciudadanos/${id}/editar`} className="btn btn-outline-primary btn-sm mt-3">
              <i className="bi bi-pencil me-1"></i>Editar datos
            </Link>
          </div>
        </div>

        <div className="col-md-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h6 className="fw-bold mb-0" style={{ color: "#1a237e" }}>
                  <i className="bi bi-clock-history me-2"></i>Historial de Trámites
                </h6>
                <Link to={`/tramites/nuevo?ciudadano=${id}`} className="btn btn-sm btn-primary">
                  <i className="bi bi-plus me-1"></i>Nuevo Trámite
                </Link>
              </div>

              {tramites.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <i className="bi bi-folder2 fs-2 d-block mb-2"></i>
                  Sin trámites registrados
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle mb-0">
                    <thead>
                      <tr>
                        <th className="small text-muted fw-semibold py-2">Tipo</th>
                        <th className="small text-muted fw-semibold py-2">Estado</th>
                        <th className="small text-muted fw-semibold py-2">Prioridad</th>
                        <th className="small text-muted fw-semibold py-2">Fecha</th>
                        <th className="small text-muted fw-semibold py-2"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {tramites.map((t) => (
                        <tr key={t.id}>
                          <td className="small">{t.tipo_tramite}</td>
                          <td><BadgeEstado estado={t.estado} /></td>
                          <td><BadgePrioridad prioridad={t.prioridad} /></td>
                          <td className="small text-muted">
                            {t.fecha_registro ? new Date(t.fecha_registro).toLocaleDateString("es-PE") : "—"}
                          </td>
                          <td>
                            <Link to={`/tramites/${t.id}`} className="btn btn-sm btn-outline-primary">
                              <i className="bi bi-eye"></i>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
