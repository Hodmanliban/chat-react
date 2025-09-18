import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { loginUser, logoutUser, getUser } from "../services/api";

const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

export function AuthProvider({ children }) {

  const cachedToken = sessionStorage.getItem("token");
  const cachedUsername = sessionStorage.getItem("username") || "";
  const cachedAvatar = sessionStorage.getItem("avatar") || "";
  let cachedId = "";
  if (cachedToken) {
    try {
      const d = jwtDecode(cachedToken);
      cachedId = d.id || d.userId || d.sub || "";
    } catch { }
  }

 
  const [user, setUser] = useState(
    cachedToken && cachedId
      ? { id: cachedId, username: cachedUsername, avatar: cachedAvatar, token: cachedToken }
      : null
  );
  const [loading, setLoading] = useState(!!(cachedToken && cachedId && !cachedUsername));

  useEffect(() => {
    
    if (user && (!user.username || !user.avatar)) {
      (async () => {
        try {
          const full = await getUser(user.id);
          const safe = {
            ...user,
            username: full?.username || user.username,
            avatar: full?.avatar || user.avatar,
            email: full?.email || "",
          };
          setUser(safe);
          sessionStorage.setItem("username", safe.username || "");
          sessionStorage.setItem("avatar", safe.avatar || "");
        } catch {
          setUser(null);
        }
        setLoading(false);
      })();
    } else {
      setLoading(false);
    }
   
  }, []);


 
  async function login({ username, password }) {
    try {
    
      const { token } = await loginUser(username, password);
      const decoded = jwtDecode(token);
      const id = decoded.id || decoded.userId || decoded.sub || "";
   
      const full = await getUser(id);
      const userObj = {
        id,
        username: full?.username || username,
        avatar: full?.avatar || "",
        token,
        email: full?.email || "",
      };
     
      setUser(userObj);
      sessionStorage.setItem("token", token);
      sessionStorage.setItem("username", userObj.username || "");
      sessionStorage.setItem("avatar", userObj.avatar || "");
      return userObj;
    } catch (err) {
      throw err;
    }
  }


  function logout() {
   
    setUser(null);
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("avatar");
    logoutUser(); 
  }

  

  if (loading) return <p>Laddar användardata...</p>;
  return (
    <AuthContext.Provider value={{ user, setUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}