import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
// import Chat from "./pages/Chat"; // Om du har den
// import Profile from "./pages/Profile"; // Om du har den

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
     {/* <Route path="/chat" element={<Chat />} />}
      {/* <Route path="/profile" element={<Profile />} /> */}
    </Routes>
  );
}

export default App;
