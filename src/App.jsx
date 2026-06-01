import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Tramites from "./pages/Tramites";
import TramiteForm from "./pages/TramiteForm";
import TramiteDetalle from "./pages/TramiteDetalle";
import Ciudadanos from "./pages/Ciudadanos";
import CiudadanoForm from "./pages/CiudadanoForm";
import CiudadanoDetalle from "./pages/CiudadanoDetalle";
import Usuarios from "./pages/Usuarios";
import Notificaciones from "./pages/Notificaciones";

// Ruta protegida: redirige a /login si no hay sesión
function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.rol)) return <Navigate to="/dashboard" replace />;
  return children;
}

// Ruta pública: redirige a /dashboard si ya hay sesión
function PublicRoute({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/dashboard" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Raíz → dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Login */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />

      {/* Rutas protegidas con Layout */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Trámites */}
        <Route path="/tramites" element={<Tramites />} />
        <Route path="/tramites/nuevo" element={<TramiteForm />} />
        <Route path="/tramites/:id" element={<TramiteDetalle />} />
        <Route path="/tramites/:id/editar" element={<TramiteForm />} />

        {/* Ciudadanos */}
        <Route path="/ciudadanos" element={<Ciudadanos />} />
        <Route path="/ciudadanos/nuevo" element={<CiudadanoForm />} />
        <Route path="/ciudadanos/:id" element={<CiudadanoDetalle />} />
        <Route path="/ciudadanos/:id/editar" element={<CiudadanoForm />} />

        {/* Usuarios — solo admin */}
        <Route
          path="/usuarios"
          element={
            <ProtectedRoute roles={["administrador"]}>
              <Usuarios />
            </ProtectedRoute>
          }
        />

        {/* Notificaciones */}
        <Route path="/notificaciones" element={<Notificaciones />} />
      </Route>

      {/* 404 → dashboard */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
