import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { tramitesService } from "../api/services";
import { Spinner, BadgeEstado, BadgePrioridad } from "../components/ui";

const ESTADOS = [
  { value: "pendiente",   label: "Pendiente" },
  { value: "en_revision", label: "En revisión" },
  { value: "observado",   label: "Observado" },
  { value: "aprobado",    label: "Aprobado" },
  { value: "rechazado",   label: "Rechazado" },
];

export default function TramiteDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tramite, setTramite] = useState(null);
  const [documentos, setDocumentos] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState("");
  const [observacion, setObservacion] = useState("");

  const cargar = () => {
    setLoading(true);
    Promise.all([
      tramitesService.obtener(id),
      tramitesService.listarDocumentos(id).catch(() => []),
      tramitesService.listarHistorial(id).catch(() => []),
    ])
      .then(([t, docs, hist]) => {
        setTramite(t);
        setDocumentos(docs);
        setHistorial(hist);
        setNuevoEstado(t.estado);
      })
      .catch(() => setError("No se pudo cargar el trámite"))
      .finally(() => setLoading(false));
  };

  useEffect(cargar, [id]);

  const cambiarEstado = async () => {
    if (!nuevoEstado || nuevoEstado === tramite.estado) return;
    setCambiandoEstado(true);
    try {
      await tramitesService.cambiarEstado(id, { estado: nuevoEstado, observacion });
      setObservacion("");
      cargar();
    } catch {
      alert("No se pudo cambiar el estado");
    } finally {
      setCambiandoEstado(false);
    }
  };

  if (loading) return <div className="d-flex justify-content-center py-5"><Spinner /></div>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!tramite) return null;

  return (
    <div>
      {/* Encabezado */}
      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div className="flex-grow-1">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <h4 className="fw-bold mb-0" style={{ color: "#1a237e" }}>
              Trámite #{tramite.numero_tramite || id.slice(0, 8).toUpperCase()}
            </h4>
            <BadgeEstado estado={tramite.estado} />
            <BadgePrioridad prioridad={tramite.prioridad} />
          </div>
          <p className="text-muted small mb-0">{tramite.tipo_tramite}</p>
        </div>
        <Link to={`/tramites/${id}/editar`} className="btn btn-outline-primary btn-sm">
          <i className="bi bi-pencil me-1"></i>Editar
        </Link>
      </div>

      <div className="row g-4">
        {/* Info principal */}
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                <i className="bi bi-info-circle me-2"></i>Información del Trámite
              </h6>
              <div className="row g-3">
                {[
                  ["Tipo de Trámite", tramite.tipo_tramite],
                  ["Área Responsable", tramite.area_responsable],
                  ["Nivel de Urgencia", `${tramite.nivel_urgencia}/5`],
                  ["Fecha de Registro", tramite.fecha_registro ? new Date(tramite.fecha_registro).toLocaleString("es-PE") : "—"],
                  ["Ciudadano", tramite.ciudadanos ? `${tramite.ciudadanos.nombre} ${tramite.ciudadanos.apellido}` : tramite.ciudadano_id],
                  ["DNI Ciudadano", tramite.ciudadanos?.dni || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="col-md-6">
                    <div className="small text-muted">{k}</div>
                    <div className="fw-semibold">{v || "—"}</div>
                  </div>
                ))}
                {tramite.descripcion && (
                  <div className="col-12">
                    <div className="small text-muted">Descripción</div>
                    <div className="fw-semibold">{tramite.descripcion}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documentos */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                <i className="bi bi-paperclip me-2"></i>Documentos Adjuntos
                <span className="badge bg-primary ms-2">{documentos.length}</span>
              </h6>
              {documentos.length === 0 ? (
                <div className="text-center py-3 text-muted small">
                  <i className="bi bi-file-earmark-x d-block fs-2 mb-2"></i>
                  Sin documentos adjuntos
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {documentos.map((doc) => (
                    <div key={doc.id} className="list-group-item d-flex align-items-center gap-3 px-0">
                      <i className="bi bi-file-earmark-pdf text-danger fs-4"></i>
                      <div className="flex-grow-1">
                        <div className="small fw-semibold">{doc.nombre_archivo}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          {doc.tamanio_kb ? `${doc.tamanio_kb} KB` : ""} ·{" "}
                          {doc.fecha_subida ? new Date(doc.fecha_subida).toLocaleDateString("es-PE") : ""}
                        </div>
                      </div>
                      <div className="d-flex gap-1">
                        {doc.url && (
                          <>
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary"
                              title="Ver"
                            >
                              <i className="bi bi-eye"></i>
                            </a>
                              <button
                              className="btn btn-sm btn-outline-secondary"
                              title="Descargar"
                              onClick={async () => {
                                const res = await fetch(doc.url);
                                const blob = await res.blob();
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement("a");
                                a.href = url;
                                a.download = doc.nombre_archivo;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                            >
                              <i className="bi bi-download"></i>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Historial */}
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                <i className="bi bi-clock-history me-2"></i>Historial de Cambios
              </h6>
              {historial.length === 0 ? (
                <p className="text-muted small">Sin historial registrado</p>
              ) : (
                <div className="timeline">
                  {historial.map((h, i) => (
                    <div key={h.id || i} className="d-flex gap-3 mb-3">
                      <div className="d-flex flex-column align-items-center">
                        <div
                          className="rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: 32, height: 32, background: "#1a237e15", minWidth: 32 }}
                        >
                          <i className="bi bi-arrow-right-circle text-primary" style={{ fontSize: 14 }}></i>
                        </div>
                        {i < historial.length - 1 && (
                          <div style={{ width: 2, flex: 1, background: "#dee2e6", minHeight: 20 }} />
                        )}
                      </div>
                      <div className="pb-2">
                        <div className="small fw-semibold">
                          {h.estado_anterior && (
                            <>
                              <span className="text-muted">{h.estado_anterior}</span>
                              <i className="bi bi-arrow-right mx-1 text-muted"></i>
                            </>
                          )}
                          <span style={{ color: "#1a237e" }}>{h.estado_nuevo || h.accion}</span>
                        </div>
                        {h.observacion && (
                          <div className="small text-muted mt-1">"{h.observacion}"</div>
                        )}
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          {h.usuario_nombre || "Sistema"} ·{" "}
                          {h.fecha ? new Date(h.fecha).toLocaleString("es-PE") : ""}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel lateral */}
        <div className="col-lg-4">
          {/* Cambiar estado */}
          <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                <i className="bi bi-arrow-repeat me-2"></i>Cambiar Estado
              </h6>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nuevo Estado</label>
                <select
                  className="form-select"
                  value={nuevoEstado}
                  onChange={(e) => setNuevoEstado(e.target.value)}
                >
                  {ESTADOS.map((e) => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Observación (opcional)</label>
                <textarea
                  className="form-control"
                  rows={2}
                  placeholder="Agrega una observación..."
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary w-100"
                onClick={cambiarEstado}
                disabled={cambiandoEstado || nuevoEstado === tramite.estado}
              >
                {cambiandoEstado ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-check2-circle me-2"></i>
                )}
                Aplicar Cambio
              </button>
            </div>
          </div>

          {/* Ciudadano */}
          {tramite.ciudadano_id && (
            <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
              <div className="card-body p-4">
                <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                  <i className="bi bi-person-circle me-2"></i>Ciudadano
                </h6>
                <div className="mb-2">
                  <div className="small text-muted">Nombre completo</div>
                  <div className="fw-semibold">{tramite.ciudadanos ? `${tramite.ciudadanos.nombre} ${tramite.ciudadanos.apellido}` : "—"}</div>
                </div>
                <div className="mb-2">
                  <div className="small text-muted">DNI</div>
                  <div className="fw-semibold">{tramite.ciudadanos?.dni || "—"}</div>
                </div>
                <Link
                  to={`/ciudadanos/${tramite.ciudadano_id}`}
                  className="btn btn-outline-primary btn-sm w-100 mt-2"
                >
                  <i className="bi bi-person me-1"></i>Ver perfil completo
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}