import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import "./Login.css";

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await loginWithGoogle();
    } catch (err) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    "AI-powered answer sheet grading",
    "Instant score reports with feedback",
    "Role-based access for teachers & students",
    "Bulk PDF upload & processing pipeline",
  ];

  return (
    <div className="login-container">
      {/* ── Left Illustration Panel ── */}
      <div className="login-left">
        {/* dot-grid texture */}
        <div className="login-dot-grid" />

        {/* floating geometric blobs */}
        <div className="login-geo login-geo-1" />
        <div className="login-geo login-geo-2" />
        <div className="login-geo login-geo-3" />
        <div className="login-geo login-geo-4" />

        {/* Brand mark top-left */}
        <div className="login-brand-mark">
          <img src="/grad-e.svg" alt="Grade-E" />
          <span>Grade-E</span>
        </div>

        {/* Headline copy */}
        <div className="login-left-headline">
          <h2>
            Grade smarter,<br />
            not <em>harder.</em>
          </h2>
          <p>
            Automate your grading workflow with AI — from PDF upload
            to detailed student feedback, in minutes.
          </p>
        </div>

        {/* Feature list */}
        <div className="login-features">
          {features.map((f, i) => (
            <div className="login-feature-item" key={i}>
              <div className="login-feature-dot" />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Login Card ── */}
      <div className="login-right">
        <div className="login-card">
          <img src="/grad-e.svg" alt="Grade-E Logo" className="brand-logo" />
          <h1 className="title">Grade-E</h1>
          <p className="subtitle">Your AI Grading Assistant</p>

          <div className="login-divider" />

          <div className="login-description">
            <p>
              Sign in to access your personalized grading dashboard
              and streamline your academic workflow.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="google-login-btn"
          >
            <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            {loading ? "Signing in…" : "Continue with Google"}
          </button>

          <p className="security-note">🔒 Secured with Firebase Auth</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
