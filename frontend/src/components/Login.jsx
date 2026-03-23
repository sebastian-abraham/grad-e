import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";

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

  return (
    <div style={{ padding: "20px", fontFamily: "sans-serif" }}>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Login with Google"}
      </button>
    </div>
  );
};

export default Login;
