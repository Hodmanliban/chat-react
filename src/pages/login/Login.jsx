import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../register/Register.css"; 

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) return;

    setSubmitting(true);
    try {
      await login({ username, password });
      navigate("/chat");
    } catch (err) {
      const msg =
        err?.message === "EXPIRED_TOKEN"
          ? "Din session har gått ut. Försök logga in igen."
          : err?.message || "Något gick fel vid inloggning.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="register-container">
      <h2>Logga in</h2>
      <form onSubmit={handleSubmit}>
        <div className="register-input-row">
          <input
            className="form-input"
            type="text"
            placeholder="Användarnamn"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoComplete="username"
          />
          <input
            className="form-input"
            type="password"
            placeholder="Lösenord"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <button type="submit" className="form-btn" disabled={submitting}>
            {submitting ? "Loggar in..." : "Logga in"}
          </button>
        </div>

        {error && <p className="error-message">{error}</p>}

        <p>
          Har du inget konto? <Link to="/register">Registrera dig här</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;
