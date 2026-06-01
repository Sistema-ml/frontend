import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { authService } from "../api/services";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await authService.login(form.email, form.password);
      login(data.access_token, data.user);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{ background: "linear-gradient(135deg, #1a237e 0%, #283593 50%, #0d47a1 100%)" }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-5 col-lg-4">
            {/* Logo y título */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                style={{ width: 72, height: 72, background: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.3)" }}
              >
                <i className="bi bi-building fs-2 text-white"></i>
              </div>
              <h4 className="text-white fw-bold mb-1">Municipalidad Provincial de Yau</h4>
              <p className="text-white-50 small">Sistema de Gestión de Trámites</p>
            </div>

            {/* Card de login */}
            <div className="card border-0 shadow-lg" style={{ borderRadius: 16 }}>
              <div className="card-body p-4">
                <h5 className="fw-bold mb-1 text-center" style={{ color: "#1a237e" }}>Iniciar Sesión</h5>
                <p className="text-muted small text-center mb-4">Ingresa tus credenciales de acceso</p>

                {error && (
                  <div className="alert alert-danger py-2 small d-flex align-items-center gap-2" role="alert">
                    <i className="bi bi-exclamation-circle-fill"></i>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold small">Usuario</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-person text-muted"></i>
                      </span>
                      <input
                        type="text"
                        name="email"
                        className="form-control border-start-0 ps-0"
                        placeholder="Correo electrónico"
                        value={form.email}
                        onChange={handleChange}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="form-label fw-semibold small">Contraseña</label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0">
                        <i className="bi bi-lock text-muted"></i>
                      </span>
                      <input
                        type="password"
                        name="password"
                        className="form-control border-start-0 ps-0"
                        placeholder="••••••••"
                        value={form.password}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="btn w-100 text-white fw-semibold py-2"
                    style={{ background: "linear-gradient(135deg, #1a237e, #1565c0)", borderRadius: 8 }}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" />
                    ) : (
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                    )}
                    {loading ? "Ingresando..." : "Ingresar"}
                  </button>
                </form>
              </div>
            </div>

            <p className="text-center text-white-50 small mt-3">
              © 2024 Municipalidad Provincial de Yau
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
