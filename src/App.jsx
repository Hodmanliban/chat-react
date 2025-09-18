
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import Chat from "./pages/chat/Chat";

import Sidenav from "./pages/sidenav/Sidenav";
import { useAuth } from "./context/AuthContext";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <p>Laddar...</p>;
  return user ? children : <Navigate to="/login" />;
}

function App() {
  const { user } = useAuth();

  return (
    <>
    
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/chat" : "/login"} />} />

        <Route
          path="/login"
          element={!user ? <Login /> : <Navigate to="/chat" />}
        />
        <Route
          path="/register"
          element={!user ? <Register /> : <Navigate to="/chat" />}
        />

        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<div style={{ padding: 16 }}>Sidan finns inte</div>} />
      </Routes>
    </>
  );
}

export default App;
