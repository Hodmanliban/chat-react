import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { updateUser, deleteUser } from "../../services/api";
import "./Profile.css";

function Profile() {
    const { user, logout, setUser } = useAuth();
    const navigate = useNavigate();

    // Sätt initialt till tomt, synka med user i useEffect
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [avatar, setAvatar] = useState("");
    const [preview, setPreview] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Synka fälten när user laddas in
    useEffect(() => {
        if (user) {
            setUsername(user.username || "");
            setEmail(user.email || "");
            setAvatar(user.avatar || "");
            setPreview(user.avatar || "");
        }
    }, [user]);

    if (!user) return <p>Laddar profil...</p>;

    async function handleUpdate(e) {
        e.preventDefault();
        setError("");
        setSuccess("");
        try {
            await updateUser({ username, email, avatar });
            setUser({ ...user, username, email, avatar });
            setSuccess("Profilen är uppdaterad!");
        } catch (err) {
            setError(err.message || "Kunde inte uppdatera profil.");
        }
    }

    async function handleDelete() {
        setError("");
        setSuccess("");
        try {
            await deleteUser(user.id);
            logout();
            navigate("/login");
        } catch (err) {
            setError(err.message || "Kunde inte radera användare.");
        }
    }

    function handleAvatarChange(e) {
        setAvatar(e.target.value);
        setPreview(e.target.value);
    }

    return (
        <div className="profile-container">
            <button className="back-btn" onClick={() => navigate("/chat")}>Tillbaka</button>
            <h2>Profilinställningar</h2>
            <form className="profile-form" onSubmit={handleUpdate}>
                <label>
                    Användarnamn:
                    <input
                        type="text"
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        required
                        autoComplete="username"
                    />
                </label>
                <label>
                    E-post:
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                    />
                </label>
                <label>
                    Avatar URL:
                    <input
                        type="text"
                        value={avatar}
                        onChange={handleAvatarChange}
                        required
                        autoComplete="off"
                    />
                </label>
                <div className="profile-avatar-preview">
                    <span>Förhandsvisning:</span>
                    <img
                        src={preview || "https://i.pravatar.cc/150?img=1"}
                        alt="Avatar preview"
                        className="profile-avatar-img"
                    />
                </div>
                <button type="submit">Uppdatera profil</button>
            </form>
            {success && <div className="success-message">{success}</div>}
            {error && <div className="error-message">{error}</div>}
            <div className="profile-delete">
                {!confirmDelete ? (
                    <button className="delete-btn" onClick={() => setConfirmDelete(true)}>
                        Radera användare
                    </button>
                ) : (
                    <div>
                        <p>Är du säker? Detta går inte att ångra.</p>
                        <button className="delete-btn" onClick={handleDelete}>Ja, radera</button>
                        <button onClick={() => setConfirmDelete(false)}>Avbryt</button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile;