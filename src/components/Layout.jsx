import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "speedometer2", label: "Dashboard" },
  { to: "/tramites", icon: "folder2-open", label: "Trámites" },
  { to: "/ciudadanos", icon: "people-fill", label: "Ciudadanos" },
  { to: "/usuarios", icon: "shield-person", label: "Usuarios", roles: ["administrador"] },
  { to: "/notificaciones", icon: "bell-fill", label: "Notificaciones" },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.roles || item.roles.includes(user?.rol)
  );

  const Sidebar = ({ mobile = false }) => (
    <aside
      style={{
        width: 240,
        background: "linear-gradient(180deg, #1a237e 0%, #283593 60%, #1565c0 100%)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: mobile ? "fixed" : "sticky",
        top: 0,
        zIndex: mobile ? 1050 : 1,
        height: "100vh",
        overflowY: "auto",
        ...(mobile ? { left: sidebarOpen ? 0 : -260, transition: "left 0.25s ease" } : {}),
      }}
    >
      {/* Logo */}
      <div className="p-4 pb-3 border-bottom border-white border-opacity-10">
        <div className="d-flex align-items-center gap-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-15"
            style={{ width: 40, height: 40, minWidth: 40 }}
          >
            <i className="bi bi-building text-white fs-5"></i>
          </div>
          <div>
            <div className="text-white fw-bold" style={{ fontSize: 13, lineHeight: 1.2 }}>Municipalidad</div>
            <div className="text-white-50" style={{ fontSize: 11 }}>Prov. de Yau</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-grow-1 py-3 px-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `d-flex align-items-center gap-3 px-3 py-2 rounded mb-1 text-decoration-none transition ${
                isActive
                  ? "d-flex align-items-center gap-3 px-3 py-2 rounded mb-1 text-decoration-none text-white fw-semibold"
                  : "d-flex align-items-center gap-3 px-3 py-2 rounded mb-1 text-decoration-none text-white-50"
              }`
            }
            style={({ isActive }) => ({
              fontSize: 14,
              borderRadius: 8,
              backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "transparent",
            })}
          >
            <i className={`bi bi-${item.icon}`} style={{ fontSize: 16, width: 20 }}></i>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Usuario */}
      <div className="p-3 border-top border-white border-opacity-10">
        <div className="d-flex align-items-center gap-2 mb-2">
          <div
            className="rounded-circle d-flex align-items-center justify-content-center bg-white bg-opacity-20 text-white fw-bold"
            style={{ width: 36, height: 36, fontSize: 14, minWidth: 36 }}
          >
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="overflow-hidden">
            <div className="text-white small fw-semibold text-truncate">{user?.nombre_completo || user?.username}</div>
            <div className="text-white-50" style={{ fontSize: 11 }}>{user?.rol}</div>
          </div>
        </div>
        <button
          className="btn btn-sm w-100 text-white border-white border-opacity-25 bg-white bg-opacity-10"
          onClick={handleLogout}
          style={{ borderRadius: 6 }}
        >
          <i className="bi bi-box-arrow-right me-2"></i>Cerrar Sesión
        </button>
      </div>
    </aside>
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh", background: "#f4f6fb" }}>
      {/* Sidebar desktop */}
      <div className="d-none d-md-block">
        <Sidebar />
      </div>

      {/* Sidebar mobile */}
      <div className="d-md-none">
        <Sidebar mobile />
        {sidebarOpen && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,0.5)", zIndex: 1049 }}
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </div>

      {/* Contenido principal */}
      <div className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0 }}>
        {/* Topbar mobile */}
        <header
          className="d-md-none d-flex align-items-center justify-content-between px-3 py-2 bg-white shadow-sm"
          style={{ position: "sticky", top: 0, zIndex: 100 }}
        >
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={() => setSidebarOpen(true)}
          >
            <i className="bi bi-list fs-5"></i>
          </button>
          <span className="fw-bold small" style={{ color: "#1a237e" }}>
            <i className="bi bi-building me-1"></i>Mun. Yau
          </span>
          <div style={{ width: 32 }} />
        </header>

        {/* Contenido */}
        <main className="flex-grow-1 p-3 p-md-4" style={{ width: "100%" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
