import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ciudadanosService } from "../api/services";
import { Spinner, ModalConfirm } from "../components/ui";

export default function Ciudadanos() {
  const navigate = useNavigate();
  const [ciudadanos, setCiudadanos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [modalEliminar, setModalEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  const cargar = useCallback(async () => {
    setLoading(true);
    try {
      const data = await ciudadanosService.listar({
        search: search || undefined,
        skip: (page - 1) * PER_PAGE,
        limit: PER_PAGE,
      });
      setCiudadanos(data);
    } catch {
      setError("No se pudieron cargar los ciudadanos");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => { cargar(); }, [cargar]);

  const handleEliminar = async () => {
    setEliminando(true);
    try {
      await ciudadanosService.eliminar(modalEliminar.id);
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
            <i className="bi bi-people-fill me-2"></i>Gestión de Ciudadanos
          </h4>
          <p className="text-muted small mb-0">Directorio de ciudadanos registrados</p>
        </div>
        <Link to="/ciudadanos/nuevo" className="btn btn-primary">
          <i className="bi bi-person-plus me-2"></i>Nuevo Ciudadano
        </Link>
      </div>

      {/* Buscador */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <div className="card-body">
          <div className="row g-2">
            <div className="col-md-6">
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Buscar por nombre, apellido o DNI..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
                {search && (
                  <button className="btn btn-outline-secondary" onClick={() => { setSearch(""); setPage(1); }}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5"><Spinner /></div>
          ) : error ? (
            <div className="alert alert-warning m-3">{error}</div>
          ) : ciudadanos.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-person-x fs-1 d-block mb-2"></i>
              No se encontraron ciudadanos
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th className="ps-3 py-3 small fw-semibold text-muted">Ciudadano</th>
                    <th className="py-3 small fw-semibold text-muted">DNI</th>
                    <th className="py-3 small fw-semibold text-muted">Teléfono</th>
                    <th className="py-3 small fw-semibold text-muted">Email</th>
                    <th className="py-3 small fw-semibold text-muted">Trámites</th>
                    <th className="pe-3 py-3 small fw-semibold text-muted text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {ciudadanos.map((c) => (
                    <tr key={c.id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold"
                            style={{
                              width: 36,
                              height: 36,
                              background: "#1a237e",
                              fontSize: 14,
                              minWidth: 36,
                            }}
                          >
                            {c.nombre?.[0]}{c.apellido?.[0]}
                          </div>
                          <div>
                            <div className="small fw-semibold">
                              {c.apellido}, {c.nombre}
                            </div>
                            <div className="text-muted" style={{ fontSize: 11 }}>
                              {c.direccion || ""}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">{c.dni}</span>
                      </td>
                      <td className="small">{c.telefono || "—"}</td>
                      <td className="small text-truncate" style={{ maxWidth: 160 }}>{c.email || "—"}</td>
                      <td>
                        <span className="badge bg-primary bg-opacity-10 text-primary">
                          {c.total_tramites ?? 0}
                        </span>
                      </td>
                      <td className="pe-3 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/ciudadanos/${c.id}`)}
                            title="Ver perfil"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(`/ciudadanos/${c.id}/editar`)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setModalEliminar(c)}
                            title="Eliminar"
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {ciudadanos.length > 0 && (
          <div className="card-footer bg-transparent border-top-0 d-flex align-items-center justify-content-between px-3 py-2">
            <span className="text-muted small">
              Mostrando {(page - 1) * PER_PAGE + 1}–{(page - 1) * PER_PAGE + ciudadanos.length}
            </span>
            <div className="d-flex gap-1">
              <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="btn btn-sm btn-primary disabled">{page}</span>
              <button className="btn btn-sm btn-outline-secondary" disabled={ciudadanos.length < PER_PAGE} onClick={() => setPage(page + 1)}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalConfirm
        show={!!modalEliminar}
        title="Eliminar Ciudadano"
        message={`¿Confirma eliminar a "${modalEliminar?.nombre} ${modalEliminar?.apellido}"...?`}
        onConfirm={handleEliminar}
        onCancel={() => setModalEliminar(null)}
        loading={eliminando}
        variant="danger"
      />
    </div>
  );
}
