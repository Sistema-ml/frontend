import { useState, useEffect, useCallback } from "react";
import { usuariosService } from "../api/services";
import { Spinner, ModalConfirm } from "../components/ui";

const ROLES = ["administrador", "empleado", "supervisor"];
const INITIAL_FORM = { nombre: "", apellido: "", email: "", password: "", rol: "empleado" };

function ModalUsuario({ usuario, onClose, onSaved }) {
  const esEdicion = Boolean(usuario?.id);
  const [form, setForm] = useState(
    esEdicion
      ? { nombre: usuario.nombre, apellido: usuario.apellido, email: usuario.email, rol: usuario.rol, password: "" }
      : INITIAL_FORM
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const payload = { ...form };
      if (esEdicion && !payload.password) delete payload.password;
      if (esEdicion) {
        await usuariosService.actualizar(usuario.id, payload);
      } else {
        await usuariosService.crear(payload);
      }
      onSaved();
    } catch (err) {
      setError(err.message || "Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ background: "rgba(0,0,0,0.5)" }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg" style={{ borderRadius: 12 }}>
          <div className="modal-header border-0 pb-0">
            <h5 className="modal-title fw-bold" style={{ color: "#1a237e" }}>
              <i className={`bi bi-person-${esEdicion ? "gear" : "plus"} me-2`}></i>
              {esEdicion ? "Editar Usuario" : "Nuevo Usuario"}
            </h5>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2 small">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Nombre *</label>
                  <input name="nombre" className="form-control" value={form.nombre} onChange={handleChange} required placeholder="Juan" />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Apellido *</label>
                  <input name="apellido" className="form-control" value={form.apellido} onChange={handleChange} required placeholder="Pérez" />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Email *</label>
                <input type="email" name="email" className="form-control" value={form.email} onChange={handleChange} required placeholder="correo@municipio.gob.pe" />
              </div>
              <div className="row g-3">
                <div className="col-6">
                  <label className="form-label small fw-semibold">Contraseña {esEdicion && "(dejar vacío para no cambiar)"}</label>
                  <input type="password" name="password" className="form-control" value={form.password} onChange={handleChange} required={!esEdicion} placeholder="••••••••" />
                </div>
                <div className="col-6">
                  <label className="form-label small fw-semibold">Rol *</label>
                  <select name="rol" className="form-select" value={form.rol} onChange={handleChange}>
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading && <span className="spinner-border spinner-border-sm me-2" />}
                  {esEdicion ? "Actualizar" : "Crear Usuario"}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={onClose}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

const COLOR_ROL = {
  administrador: { bg: "#dc354520", color: "#dc3545" },
  supervisor: { bg: "#0288d120", color: "#0288d1" },
  empleado: { bg: "#19875420", color: "#198754" },
};

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | {} (nuevo) | {id,...} (edición)
  const [modalEliminar, setModalEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usuariosService.listar();
      setUsuarios(data);
    } catch {
      setUsuarios([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await usuariosService.eliminar(modalEliminar.id);
      setModalEliminar(null);
      cargar();
    } catch {
      alert("No se pudo eliminar");
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: "#1a237e" }}>
            <i className="bi bi-shield-person me-2"></i>Gestión de Usuarios
          </h4>
          <p className="text-muted small mb-0">Administra los usuarios del sistema</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          <i className="bi bi-person-plus me-2"></i>Nuevo Usuario
        </button>
      </div>

      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5"><Spinner /></div>
          ) : usuarios.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-people fs-1 d-block mb-2"></i>Sin usuarios registrados
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th className="ps-3 py-3 small fw-semibold text-muted">Usuario</th>
                    <th className="py-3 small fw-semibold text-muted">Email</th>
                    <th className="py-3 small fw-semibold text-muted">Rol</th>
                    <th className="py-3 small fw-semibold text-muted">Estado</th>
                    <th className="pe-3 py-3 small fw-semibold text-muted text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((u) => {
                    const rolStyle = COLOR_ROL[u.rol] || { bg: "#6c757d20", color: "#6c757d" };
                    return (
                      <tr key={u.id}>
                        <td className="ps-3">
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                              style={{ width: 36, height: 36, background: "#1a237e", fontSize: 14, minWidth: 36 }}
                            >
                              {u.username?.[0]?.toUpperCase()}
                            </div>
                            <div>
                              <div className="small fw-semibold">{u.nombre_completo || u.username}</div>
                              <div className="text-muted" style={{ fontSize: 11 }}>@{u.username}</div>
                            </div>
                          </div>
                        </td>
                        <td className="small">{u.email}</td>
                        <td>
                          <span
                            className="badge px-2 py-1 rounded-pill"
                            style={{ background: rolStyle.bg, color: rolStyle.color, fontWeight: 600 }}
                          >
                            {u.rol}
                          </span>
                        </td>
                        <td>
                          <span className={`badge rounded-pill ${u.activo !== false ? "bg-success" : "bg-secondary"} bg-opacity-10 ${u.activo !== false ? "text-success" : "text-secondary"}`}>
                            {u.activo !== false ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="pe-3 text-end">
                          <div className="d-flex justify-content-end gap-1">
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => setModal(u)} title="Editar">
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => setModalEliminar(u)} title="Eliminar">
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {modal !== null && (
        <ModalUsuario
          usuario={modal?.id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); cargar(); }}
        />
      )}

      <ModalConfirm
        show={!!modalEliminar}
        title="Eliminar Usuario"
        message={`¿Confirma eliminar al usuario "${modalEliminar?.username}"?`}
        onConfirm={handleEliminar}
        onCancel={() => setModalEliminar(null)}
        loading={eliminando}
        variant="danger"
      />
    </div>
  );
}
