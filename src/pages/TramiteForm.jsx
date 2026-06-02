import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { tramitesService, ciudadanosService, mlService } from "../api/services";
import { Spinner } from "../components/ui";

const TIPOS_TRAMITE = [
  "Licencia de Funcionamiento",
  "Licencia de Construcción",
  "Partida de Nacimiento",
  "Partida de Matrimonio",
  "Certificado de Residencia",
  "Autorización de Eventos",
  "Permiso de Demolición",
  "Inscripción de Defunción",
  "Certificado Catastral",
  "Reclamo Vecinal",
  "Otro",
];

const AREAS = [
  "Gerencia Municipal",
  "Rentas y Tributación",
  "Registro Civil",
  "Obras y Urbanismo",
  "Seguridad Ciudadana",
  "Desarrollo Social",
  "Medio Ambiente",
  "Logística",
];

const URGENCIAS = [1, 2, 3, 4, 5];

const INITIAL = {
  ciudadano_id: "",
  tipo_tramite: "",
  area_responsable: "",
  descripcion: "",
  estado: "Pendiente",
};

export default function TramiteForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState(INITIAL);
  const [ciudadanos, setCiudadanos] = useState([]);
  const [archivos, setArchivos] = useState([]);
  const [prediccion, setPrediccion] = useState(null);
  const [loadingPrediccion, setLoadingPrediccion] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(esEdicion);
  const [busquedaCiudadano, setBusquedaCiudadano] = useState("");
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    ciudadanosService.listar({ limit: 200 })
      .then(setCiudadanos)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!esEdicion) return;
    tramitesService.obtener(id)
      .then((data) => {
        setForm({
          ciudadano_id: data.ciudadano_id || "",
          tipo_tramite: data.tipo_tramite || "",
          area_responsable: data.area_responsable || "",
          descripcion: data.descripcion || "",
          estado: data.estado || "Pendiente",
        });
      })
      .catch(() => setError("No se pudo cargar el trámite"))
      .finally(() => setLoadingDatos(false));
  }, [id, esEdicion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // Auto-predecir cuando cambian los campos que afectan la prioridad
  useEffect(() => {
    if (!form.tipo_tramite || !form.area_responsable) return;
    const timer = setTimeout(() => { solicitarPrediccion(); }, 600);
    return () => clearTimeout(timer);
  }, [form.tipo_tramite, form.area_responsable, archivos.length]);

  const solicitarPrediccion = async () => {
    if (!form.tipo_tramite || !form.area_responsable) return;
    setLoadingPrediccion(true);
    setPrediccion(null);
    try {
      const result = await mlService.predecir({
        tipo_tramite: form.tipo_tramite,
        nivel_urgencia: 3,          // valor neutro fijo, ya no es input del usuario
        area_responsable: form.area_responsable,
        tiempo_espera_dias: 0,
        cantidad_documentos: archivos.length,
      });
      setPrediccion(result);
    } catch {
      setPrediccion({ prioridad: "media", confianza: null, error: true });
    } finally {
      setLoadingPrediccion(false);
    }
  };

  const validar = () => {
    const e = {};
    if (!form.ciudadano_id) e.ciudadano_id = "Selecciona un ciudadano";
    if (!form.tipo_tramite) e.tipo_tramite = "Selecciona el tipo de trámite";
    if (!form.area_responsable) e.area_responsable = "Selecciona el área responsable";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    setError("");
    try {
      const payload = { ...form };
      if (prediccion && !prediccion.error) payload.prioridad = prediccion.prioridad;

      let tramiteId;
      if (esEdicion) {
        await tramitesService.actualizar(id, payload);
        tramiteId = id;
      } else {
        const nuevo = await tramitesService.crear(payload);
        tramiteId = nuevo.id;
      }

      // Subir archivos si hay
      for (const archivo of archivos) {
        const fd = new FormData();
        fd.append("file", archivo);
        fd.append("tramite_id", tramiteId);
        await tramitesService.subirDocumento(tramiteId, fd);
      }

      navigate(`/tramites/${tramiteId}`);
    } catch (err) {
      setError(err.message || "Error al guardar el trámite");
    } finally {
      setLoading(false);
    }
  };

  if (loadingDatos) return <div className="d-flex justify-content-center py-5"><Spinner /></div>;

  const colorPrediccion = { alta: "#dc3545", media: "#fd7e14", baja: "#198754", Alta: "#dc3545", Media: "#fd7e14", Baja: "#198754" };

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div>
          <h4 className="fw-bold mb-0" style={{ color: "#1a237e" }}>
            <i className={`bi bi-${esEdicion ? "pencil-square" : "plus-circle"} me-2`}></i>
            {esEdicion ? "Editar Trámite" : "Nuevo Trámite"}
          </h4>
          <p className="text-muted small mb-0">
            {esEdicion ? "Modifica los datos del trámite" : "Completa el formulario para registrar un nuevo trámite"}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle-fill"></i>{error}
        </div>
      )}

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} noValidate>
                <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                  <i className="bi bi-person-fill me-2"></i>Datos del Ciudadano
                </h6>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Ciudadano *</label>
                  <input
                    type="text"
                    className="form-control mb-1"
                    placeholder="Buscar por nombre o DNI..."
                    value={busquedaCiudadano}
                    onChange={(e) => setBusquedaCiudadano(e.target.value)}
                  />
                  <select
                    name="ciudadano_id"
                    className={`form-select ${errors.ciudadano_id ? "is-invalid" : ""}`}
                    value={form.ciudadano_id}
                    onChange={handleChange}
                    size={4}
                  >
                    <option value="">— Selecciona —</option>
                    {ciudadanos
                      .filter((c) =>
                        `${c.nombre} ${c.apellido}`.toLowerCase().includes(busquedaCiudadano.toLowerCase()) ||
                        c.dni?.includes(busquedaCiudadano)
                      )
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.apellido}, {c.nombre} — DNI: {c.dni}
                        </option>
                      ))}
                  </select> 
                  {errors.ciudadano_id && <div className="invalid-feedback">{errors.ciudadano_id}</div>}
                </div>

                <hr className="my-4" />
                <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                  <i className="bi bi-file-earmark-text me-2"></i>Datos del Trámite
                </h6>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Tipo de Trámite *</label>
                    <select
                      name="tipo_tramite"
                      className={`form-select ${errors.tipo_tramite ? "is-invalid" : ""}`}
                      value={form.tipo_tramite}
                      onChange={handleChange}
                    >
                      <option value="">— Selecciona —</option>
                      {TIPOS_TRAMITE.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    {errors.tipo_tramite && <div className="invalid-feedback">{errors.tipo_tramite}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Área Responsable *</label>
                    <select
                      name="area_responsable"
                      className={`form-select ${errors.area_responsable ? "is-invalid" : ""}`}
                      value={form.area_responsable}
                      onChange={handleChange}
                    >
                      <option value="">— Selecciona —</option>
                      {AREAS.map((a) => (
                        <option key={a} value={a}>{a}</option>
                      ))}
                    </select>
                    {errors.area_responsable && <div className="invalid-feedback">{errors.area_responsable}</div>}
                  </div>

                  {esEdicion && (
                    <div className="col-md-6">
                      <label className="form-label fw-semibold small">Estado</label>
                      <select name="estado" className="form-select" value={form.estado} onChange={handleChange}>
                        {["Pendiente", "En revisión", "Observado", "Aprobado", "Rechazado"].map((e) => (
                          <option key={e} value={e}>{e}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="col-12">
                    <label className="form-label fw-semibold small">Descripción</label>
                    <textarea
                      name="descripcion"
                      className="form-control"
                      rows={3}
                      placeholder="Detalla el motivo o requerimiento del trámite..."
                      value={form.descripcion}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <hr className="my-4" />
                <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                  <i className="bi bi-paperclip me-2"></i>Documentos Adjuntos (PDF)
                </h6>

                <div
                  className="border border-dashed rounded p-4 text-center"
                  style={{ borderStyle: "dashed", cursor: "pointer", background: "#f8f9fa", borderRadius: 8 }}
                  onClick={() => document.getElementById("files-input").click()}
                >
                  <i className="bi bi-cloud-upload fs-2 text-muted d-block mb-2"></i>
                  <p className="text-muted small mb-1">Arrastra archivos PDF o haz clic para seleccionar</p>
                  <p className="text-muted" style={{ fontSize: 11 }}>Máximo 5 archivos, 10MB cada uno</p>
                  <input
                    id="files-input"
                    type="file"
                    accept=".pdf"
                    multiple
                    className="d-none"
                    onChange={(e) => setArchivos(Array.from(e.target.files))}
                  />
                </div>

                {archivos.length > 0 && (
                  <ul className="list-group mt-2">
                    {archivos.map((f, i) => (
                      <li key={i} className="list-group-item list-group-item-action d-flex align-items-center gap-2 py-2">
                        <i className="bi bi-file-earmark-pdf text-danger"></i>
                        <span className="small flex-grow-1">{f.name}</span>
                        <span className="text-muted" style={{ fontSize: 11 }}>{(f.size / 1024).toFixed(0)} KB</span>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger py-0"
                          onClick={() => setArchivos(archivos.filter((_, j) => j !== i))}
                        >
                          <i className="bi bi-x"></i>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                    {loading ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-save me-2"></i>}
                    {loading ? "Guardando..." : (esEdicion ? "Actualizar Trámite" : "Registrar Trámite")}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Panel ML */}
        <div className="col-lg-4">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12, position: "sticky", top: 80 }}>
            <div className="card-body p-4">
              <h6 className="fw-bold mb-1" style={{ color: "#1a237e" }}>
                <i className="bi bi-cpu-fill me-2"></i>Prioridad asignada por ML
              </h6>
              <p className="text-muted small mb-3">
                El modelo de Red Neuronal analiza los datos y <strong>asigna automáticamente</strong> la prioridad del trámite. No puede ser modificada manualmente.
              </p>

              {loadingPrediccion ? (
                <div className="text-center py-3">
                  <span className="spinner-border spinner-border-sm me-2 text-primary" />
                  <span className="small text-muted">Analizando con IA...</span>
                </div>
              ) : prediccion ? (
                <div
                  className="rounded p-3 text-center mb-3"
                  style={{
                    background: `${colorPrediccion[prediccion.prioridad] || "#6c757d"}15`,
                    border: `2px solid ${colorPrediccion[prediccion.prioridad] || "#6c757d"}`,
                  }}
                >
                  <div className="small text-muted mb-1">Prioridad determinada</div>
                  <div className="fw-bold fs-4" style={{ color: colorPrediccion[prediccion.prioridad] }}>
                    {prediccion.prioridad?.charAt(0).toUpperCase() + prediccion.prioridad?.slice(1)}
                  </div>
                  {prediccion.probabilidades && (
                    <div className="mt-2">
                      {Object.entries(prediccion.probabilidades).map(([clase, prob]) => (
                        <div key={clase} className="d-flex align-items-center gap-2 mb-1">
                          <span className="small text-muted" style={{ width: 50, textAlign: "right" }}>{clase}</span>
                          <div className="flex-grow-1 bg-light rounded" style={{ height: 6 }}>
                            <div
                              className="rounded"
                              style={{
                                width: `${(prob * 100).toFixed(0)}%`,
                                height: 6,
                                background: colorPrediccion[clase] || "#6c757d",
                              }}
                            />
                          </div>
                          <span className="small fw-semibold" style={{ width: 36 }}>{(prob * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-3 text-muted small">
                  <i className="bi bi-cpu d-block fs-3 mb-2"></i>
                  Selecciona tipo de trámite y área para activar el modelo
                </div>
              )}

              <hr />
              <h6 className="fw-semibold small mb-2">Variables consideradas:</h6>
              <ul className="list-unstyled mb-0">
                {[
                  ["Tipo de trámite", form.tipo_tramite || "—"],
                  ["Área responsable", form.area_responsable || "—"],
                  ["Documentos adjuntos", archivos.length],
                ].map(([k, v]) => (
                  <li key={k} className="d-flex justify-content-between small py-1 border-bottom">
                    <span className="text-muted">{k}</span>
                    <span className="fw-semibold text-truncate ms-2" style={{ maxWidth: 120 }}>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}