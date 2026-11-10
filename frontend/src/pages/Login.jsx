import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import "./Login.css";

/**
 * Login screen — visual style aligned with AdminPages cards.
 */
export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { t, isRtl } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      const userData = await login(username, password);
      if (userData?.role === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/employee", { replace: true });
      }
    } catch {
      setError(t("loginError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-screen" dir={isRtl ? "rtl" : "ltr"}>
      <div className="auth-shell">
        <div className="auth-brand">
          <div className="auth-logo" aria-hidden="true">
            HR
          </div>
          <div>
            <h1 className="auth-app-name">{t("appName")}</h1>
            <p className="auth-subtitle">{t("loginTitle")}</p>
          </div>
        </div>

        <form className="auth-card admin-card-like" onSubmit={handleSubmit}>
          <label className="auth-label" htmlFor="login-username">
            {t("username")}
          </label>
          <input
            id="login-username"
            className="auth-input"
            placeholder={t("username")}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />

          <label className="auth-label" htmlFor="login-password">
            {t("password")}
          </label>
          <input
            id="login-password"
            className="auth-input"
            type="password"
            placeholder={t("password")}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button className="auth-submit primary-btn-like" type="submit" disabled={submitting}>
            {submitting ? t("loading") : t("login")}
          </button>
        </form>
      </div>
    </div>
  );
}
