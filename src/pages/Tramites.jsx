import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { tramitesService } from "../api/services";
import { Spinner, BadgeEstado, BadgePrioridad, ModalConfirm } from "../components/ui";

const ESTADOS = ["", "Pendiente", "En revisión", "Observado", "Aprobado", "Rechazado"];
const PRIORIDADES = ["", "Alta", "Media", "Baja"];

export default function Tramites() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [tramites, setTramites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [estado, setEstado] = useState(searchParams.get("estado") || "");
  const [prioridad, setPrioridad] = useState(searchParams.get("prioridad") || "");
  const [modalEliminar, setModalEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const cargarTramites = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (estado) params.estado = estado;
      if (prioridad) params.prioridad = prioridad;
      if (search) params.search = search;
      params.skip = (page - 1) * PER_PAGE;
      params.limit = PER_PAGE;
      const data = await tramitesService.listar(params);
      setTramites(data);
    } catch {
      setError("No se pudieron cargar los trámites");
    } finally {
      setLoading(false);
    }
  }, [estado, prioridad, search, page]);

  useEffect(() => {
    cargarTramites();
  }, [cargarTramites]);

  useEffect(() => {
    const p = {};
    if (estado) p.estado = estado;
    if (prioridad) p.prioridad = prioridad;
    if (search) p.search = search;
    setSearchParams(p, { replace: true });
  }, [estado, prioridad, search, setSearchParams]);

  const handleEliminar = async () => {
    if (!modalEliminar) return;
    setEliminando(true);
    try {
      await tramitesService.eliminar(modalEliminar.id);
      setModalEliminar(null);
      cargarTramites();
    } catch {
      alert("No se pudo eliminar el trámite");
    } finally {
      setEliminando(false);
    }
  };

  const limpiarFiltros = () => {
    setSearch("");
    setEstado("");
    setPrioridad("");
    setPage(1);
  };

  return (
    <div>
      {/* Encabezado */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-bold mb-1" style={{ color: "#1a237e" }}>
            <i className="bi bi-folder2-open me-2"></i>Gestión de Trámites
          </h4>
          <p className="text-muted small mb-0">Registro y seguimiento de trámites municipales</p>
        </div>
        <Link to="/tramites/nuevo" className="btn btn-primary">
          <i className="bi bi-plus-circle me-2"></i>Nuevo Trámite
        </Link>
      </div>

      {/* Filtros */}
      <div className="card border-0 shadow-sm mb-4" style={{ borderRadius: 12 }}>
        <div className="card-body">
          <div className="row g-2 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label small fw-semibold">Buscar</label>
              <div className="input-group">
                <span className="input-group-text bg-light">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="N° trámite, tipo, ciudadano..."
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                />
              </div>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Estado</label>
              <select className="form-select" value={estado} onChange={(e) => { setEstado(e.target.value); setPage(1); }}>
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>{e || "Todos los estados"}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label small fw-semibold">Prioridad</label>
              <select className="form-select" value={prioridad} onChange={(e) => { setPrioridad(e.target.value); setPage(1); }}>
                {PRIORIDADES.map((p) => (
                  <option key={p} value={p}>{p || "Todas las prioridades"}</option>
                ))}
              </select>
            </div>
            <div className="col-12 col-md-2">
              <button className="btn btn-outline-secondary w-100" onClick={limpiarFiltros}>
                <i className="bi bi-x-circle me-1"></i>Limpiar
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabla */}
      <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
        <div className="card-body p-0">
          {loading ? (
            <div className="d-flex justify-content-center py-5">
              <Spinner />
            </div>
          ) : error ? (
            <div className="alert alert-warning m-3 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-triangle-fill"></i>{error}
            </div>
          ) : tramites.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-inbox fs-1 d-block mb-2"></i>
              No se encontraron trámites
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead style={{ background: "#f8f9fa" }}>
                  <tr>
                    <th className="ps-3 py-3 small fw-semibold text-muted">N° / Tipo</th>
                    <th className="py-3 small fw-semibold text-muted">Ciudadano</th>
                    <th className="py-3 small fw-semibold text-muted">Área</th>
                    <th className="py-3 small fw-semibold text-muted">Estado</th>
                    <th className="py-3 small fw-semibold text-muted">Prioridad</th>
                    <th className="py-3 small fw-semibold text-muted">Fecha</th>
                    <th className="pe-3 py-3 small fw-semibold text-muted text-end">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {tramites.map((t) => (
                    <tr key={t.id}>
                      <td className="ps-3">
                        <div className="fw-semibold small" style={{ color: "#1a237e" }}>#{t.codigo || t.id.slice(0, 8).toUpperCase()}</div>
                        <div className="text-muted" style={{ fontSize: 12 }}>{t.tipo_tramite}</div>
                      </td>
                      <td>
                        <div className="small">
                          {t.ciudadanos
                            ? `${t.ciudadanos.nombre || ""} ${t.ciudadanos.apellido || ""}`.trim() || "—"
                            : "—"}
                        </div>
                        <div className="text-muted" style={{ fontSize: 11 }}>
                          {t.ciudadanos?.dni || ""}
                        </div>
                      </td>
                      <td><span className="small">{t.area_responsable}</span></td>
                      <td><BadgeEstado estado={t.estado} /></td>
                      <td><BadgePrioridad prioridad={t.prioridad} /></td>
                      <td className="small text-muted">
                        {t.fecha_registro ? new Date(t.fecha_registro).toLocaleDateString("es-PE") : "—"}
                      </td>
                      <td className="pe-3 text-end">
                        <div className="d-flex justify-content-end gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate(`/tramites/${t.id}`)}
                            title="Ver detalle"
                          >
                            <i className="bi bi-eye"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-secondary"
                            onClick={() => navigate(`/tramites/${t.id}/editar`)}
                            title="Editar"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setModalEliminar(t)}
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

        {/* Paginación */}
        {tramites.length > 0 && (
          <div className="card-footer bg-transparent border-top-0 d-flex align-items-center justify-content-between px-3 py-2">
            <span className="text-muted small">
              Mostrando {(page - 1) * PER_PAGE + 1}–{(page - 1) * PER_PAGE + tramites.length}
            </span>
            <div className="d-flex gap-1">
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
              >
                <i className="bi bi-chevron-left"></i>
              </button>
              <span className="btn btn-sm btn-primary disabled">{page}</span>
              <button
                className="btn btn-sm btn-outline-secondary"
                disabled={tramites.length < PER_PAGE}
                onClick={() => setPage(page + 1)}
              >
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        )}
      </div>

      <ModalConfirm
        show={!!modalEliminar}
        title="Eliminar Trámite"
        message={`¿Confirma que desea eliminar el trámite "${modalEliminar?.tipo_tramite}"? Esta acción no se puede deshacer.`}
        onConfirm={handleEliminar}
        onCancel={() => setModalEliminar(null)}
        loading={eliminando}
        variant="danger"
      />
    </div>
  );
}