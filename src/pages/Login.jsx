import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";


function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const { login } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            await login({ username, password });
            navigate("/chat");
        } catch (err) {
            setError(err.message || "Något gick fel vid inloggning.");
        }
    }

    return (
        <div>
            <h2>Logga in</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Användarnamn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Lösenord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Logga in</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
                {/* Lägg till denna rad */}
                <p>Har du inget konto? <Link to="/register">Registrera dig här</Link></p>
            </form>
        </div>
    );
}

export default Login;
