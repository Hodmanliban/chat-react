import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register as registerApi } from "../utils/Auth"

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

        console.log("handleSubmit startar");
        console.log({ username, email, password, avatar });

        try {
            await registerApi({ username, password, email, avatar });
            setSuccess("Registrering lyckades!");
            setTimeout(() => {
                navigate("/login");
            }, 2000);
        } catch (err) {
            console.log("registerApi failed", err);
            setError(err.message || "Något gick fel vid registrering.")
        }
    }
    return (
        <div>
            <h2>Registrera dig</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Användarnamn"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="E-post"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Lösenord"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <div>
                    <p>Välj en avatar:</p>
                    <div style={{ display: "flex", gap: "10px", flexwrap: "wrap" }}>
                        {avatarOptions.map((url, index) => (
                            <img
                                key={index}
                                src={url}
                                alt={`Avatar ${index}`}
                                onClick={() => setAvatar(url)}
                                style={{
                                    width: "60px",
                                    height: "60px",
                                    border: avatar == url ? "3px solid blue" : "1px solid gray",
                                    borderRadius: "50%",
                                    cursor: "pointer",
                                }}
                            />
                        ))}
                    </div>
                </div>
                <button type="submit">Registrera</button>

                {error && <p style={{ color: "red" }}>{error}</p>}
                {success && <p style={{ color: "green" }}>{success}</p>}
            </form>
        </div>

    );
}

export default Register;
