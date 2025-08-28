import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import "./SideNav.css";

function SideNav() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [open, setOpen] = useState(false);

    function handleLogout() {
        logout();
        navigate("/login");
    }

    return (
        <>
            <button className="sidenav-toggle" onClick={() => setOpen(!open)}>
                ☰
            </button>
            <aside className={`sidenav-drawer ${open ? "open" : ""}`}>
                <button className="sidenav-close" onClick={() => setOpen(false)}>×</button>
                {/* Visa avatar och namn bara när man är inloggad */}
                {user && (
                    <div className="sidenav-profile">
                        <img
                            src={user.avatar}
                            alt="Avatar"
                            className="sidenav-avatar"
                        />
                        <div className="sidenav-username">{user.username}</div>
                    </div>
                )}
                <nav className="sidenav-links">
                    <button onClick={() => navigate("/contact")}>Contact</button>
                    {user && (
                        <>
                            <button onClick={() => navigate("/profile")}>Profile</button>
                            <button className="sidenav-logout" onClick={handleLogout}>Log out</button>
                        </>
                    )}
                </nav>
            </aside>
        </>
    );
}

export default SideNav;