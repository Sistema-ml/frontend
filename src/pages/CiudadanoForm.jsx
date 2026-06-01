import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ciudadanosService } from "../api/services";
import { Spinner } from "../components/ui";

const INITIAL = {
  nombre: "",       // era: nombres
  apellido: "",     // era: apellidos
  dni: "",
  fecha_nac: "",    // era: fecha_nacimiento
  telefono: "",
  email: "",
  direccion: "",
  distrito: "",
};

export default function CiudadanoForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const esEdicion = Boolean(id);

  const [form, setForm] = useState(INITIAL);
  const [loading, setLoading] = useState(false);
  const [loadingDatos, setLoadingDatos] = useState(esEdicion);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!esEdicion) return;
    ciudadanosService.obtener(id)
      .then((data) => setForm({ ...INITIAL, ...data }))
      .catch(() => setError("No se pudo cargar el ciudadano"))
      .finally(() => setLoadingDatos(false));
  }, [id, esEdicion]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = "El nombre es obligatorio";
    if (!form.apellido.trim()) e.apellido = "El apellido es obligatorio";
    if (!form.dni.trim()) e.dni = "El DNI es obligatorio";
    else if (!/^\d{8}$/.test(form.dni)) e.dni = "El DNI debe tener 8 dígitos";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email inválido";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setLoading(true);
    setError("");
    try {
      if (esEdicion) {
        await ciudadanosService.actualizar(id, form);
      } else {
        await ciudadanosService.crear(form);
      }
      navigate("/ciudadanos");
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  if (loadingDatos) return <div className="d-flex justify-content-center py-5"><Spinner /></div>;

  return (
    <div>
      <div className="d-flex align-items-center gap-2 mb-4">
        <button className="btn btn-sm btn-outline-secondary" onClick={() => navigate(-1)}>
          <i className="bi bi-arrow-left"></i>
        </button>
        <div>
          <h4 className="fw-bold mb-0" style={{ color: "#1a237e" }}>
            <i className={`bi bi-person-${esEdicion ? "gear" : "plus"} me-2`}></i>
            {esEdicion ? "Editar Ciudadano" : "Registrar Ciudadano"}
          </h4>
          <p className="text-muted small mb-0">
            {esEdicion ? "Actualiza los datos del ciudadano" : "Completa el formulario de registro"}
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2">
          <i className="bi bi-exclamation-circle-fill"></i>{error}
        </div>
      )}

      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-4">
              <form onSubmit={handleSubmit} noValidate>
                <h6 className="fw-bold mb-3" style={{ color: "#1a237e" }}>
                  <i className="bi bi-person me-2"></i>Datos Personales
                </h6>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Nombres *</label>
                    <input
                      type="text"
                      name="nombre"
                      className={`form-control ${errors.nombre ? "is-invalid" : ""}`}
                      placeholder="Ingresa los nombre"
                      value={form.nombre}
                      onChange={handleChange}
                    />
                    {errors.nombre && <div className="invalid-feedback">{errors.nombre}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Apellidos *</label>
                    <input
                      type="text"
                      name="apellido"
                      className={`form-control ${errors.apellido ? "is-invalid" : ""}`}
                      placeholder="Ingresa los apellidos"
                      value={form.apellido}
                      onChange={handleChange}
                    />
                    {errors.apellido && <div className="invalid-feedback">{errors.apellido}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">DNI *</label>
                    <input
                      type="text"
                      name="dni"
                      className={`form-control ${errors.dni ? "is-invalid" : ""}`}
                      placeholder="12345678"
                      maxLength={8}
                      value={form.dni}
                      onChange={handleChange}
                    />
                    {errors.dni && <div className="invalid-feedback">{errors.dni}</div>}
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      name="fecha_nac"
                      className="form-control"
                      value={form.fecha_nac}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label fw-semibold small">Teléfono</label>
                    <input
                      type="tel"
                      name="telefono"
                      className="form-control"
                      placeholder="987654321"
                      value={form.telefono}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Correo Electrónico</label>
                    <input
                      type="email"
                      name="email"
                      className={`form-control ${errors.email ? "is-invalid" : ""}`}
                      placeholder="correo@ejemplo.com"
                      value={form.email}
                      onChange={handleChange}
                    />
                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold small">Distrito</label>
                    <input
                      type="text"
                      name="distrito"
                      className="form-control"
                      placeholder="Distrito de residencia"
                      value={form.distrito}
                      onChange={handleChange}
                    />
                  </div>

                  <div className="col-12">
                    <label className="form-label fw-semibold small">Dirección</label>
                    <input
                      type="text"
                      name="direccion"
                      className="form-control"
                      placeholder="Av. Principal 123, Yau"
                      value={form.direccion}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="d-flex gap-2 mt-4">
                  <button type="submit" className="btn btn-primary px-4" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" />
                    ) : (
                      <i className="bi bi-save me-2"></i>
                    )}
                    {loading ? "Guardando..." : (esEdicion ? "Actualizar" : "Registrar")}
                  </button>
                  <button type="button" className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
