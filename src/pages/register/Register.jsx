import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { registerUser } from "../../services/api";
import "./Register.css";

function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("https://i.pravatar.cc/150?img=1");
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const navigate = useNavigate();
    const avatarOptions = [
        "https://i.pravatar.cc/150?img=1",
        "https://i.pravatar.cc/150?img=2",
        "https://i.pravatar.cc/150?img=3",
        "https://i.pravatar.cc/150?img=4",
        "https://i.pravatar.cc/150?img=5",
    ];

    async function handleSubmit(e) {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        try {
            await registerUser(username, email, password, avatar);
            setSuccess("Registrering lyckades!");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            setError(
                err?.response?.data?.message ||
                err.message ||
                "Något gick fel vid registrering."
            );
        }
    }

    return (
        <div className="register-container">
            <h2>Registrera dig</h2>
            <form onSubmit={handleSubmit}>
                {/* Användarnamn och e-post på samma rad */}
                <div className="register-input-row">
                    <input
                        className="form-input"
                        type="text"
                        placeholder="Användarnamn"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                    <input
                        className="form-input"
                        type="email"
                        placeholder="E-post"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                {/* Lösenord och knapp på nästa rad */}
                <div className="register-input-row">
                    <input
                        className="form-input"
                        type="password"
                        placeholder="Lösenord"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <button type="submit" className="form-btn">Registrera</button>
                </div>
                <div>
                    <p>Välj en avatar:</p>
                    <div className="avatar-options">
                        {avatarOptions.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Avatar ${index}`}
                                onClick={() => setAvatar(url)}
                                className={`avatar-img${avatar === url ? " selected" : ""}`}
                            />
                        ))}
                    </div>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <p>
                    Har du redan ett konto? <Link to="/login">Logga in här</Link>
                </p>
            </form>
        </div>
    );
}

export default Register;