import { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { deleteUser } from "../../services/api";
import "./Sidenav.css";

function SideNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const drawerRef = useRef(null);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/login");
  }

  async function handleDelete() {
    if (!user) return;
    const ok = window.confirm("Är du säker på att du vill radera kontot? Detta går inte att ångra.");
    if (!ok) return;
    try {
      await deleteUser(user.id);
      logout();
      navigate("/register");
    } catch (err) {
      alert(err?.message || "Kunde inte radera användare.");
    }
  }

  useEffect(() => {
    function onKey(e) { if (e.key === "Escape") setOpen(false); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <button className="sidenav-toggle" onClick={() => setOpen((v) => !v)} aria-label="Öppna sidomeny" aria-expanded={open} aria-controls="sidenav-drawer">☰</button>
      <div className={`sidenav-backdrop ${open ? "open" : ""}`} onClick={() => setOpen(false)} />
      <aside id="sidenav-drawer" ref={drawerRef} className={`sidenav-drawer ${open ? "open" : ""}`} role="dialog" aria-modal="true">
        <button className="sidenav-close" onClick={() => setOpen(false)}>×</button>
        <nav className="sidenav-links">
          {user && (
            <>
              <button className="sidenav-logout" onClick={handleLogout}>Log out</button>
              <button className="sidenav-danger" onClick={handleDelete}>Radera konto</button>
            </>
          )}
        </nav>
      </aside>
    </>
  );
}

export default SideNav;