import { useState, useEffect, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import gsap from "gsap";
import "./Login.css";

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const blurBgRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!blurBgRef.current) return;

      const x = e.clientX;
      const y = e.clientY;

      // Animate the blur background to follow the cursor
      gsap.to(blurBgRef.current, {
        x: x - 150, // Center the blur blob
        y: y - 150,
        duration: 0.3,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

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

  return (
    <div className="login-container" ref={containerRef}>
      {/* Cursor-following blur background */}
      <div className="blur-background" ref={blurBgRef}></div>

      {/* Main content */}
      <div className="login-content">
        <div className="login-card">
          <div className="login-header">
            <img src="/grad-e.svg" alt="Grade-E Logo" className="brand-logo" />
            <h1 className="title">Grade-E</h1>
            <p className="subtitle">YOUR AI GRADING ASSISTANT</p>
          </div>

          <div className="login-description">
            <p>
              Access your personalized grading dashboard and streamline your academic workflow.
            </p>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="google-login-btn"
          >
            <svg
              className="google-icon"
              viewBox="0 0 24 24"
              width="20"
              height="20"
            >
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {loading ? "Signing in..." : "Sign in with Google"}
          </button>

        </div>
      </div>
    </div>
  );
};

export default Login;
