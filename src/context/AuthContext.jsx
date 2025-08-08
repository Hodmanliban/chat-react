import React, { createContext, useState, useEffect, useContext } from "react";
import  { jwtDecode }from "jwt-decode";
import { login as loginApi } from "../utils/Auth";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            try {
                const decoded = jwtDecode(token);
                setUser({
                    id: decoded.id,
                    username: decoded.username,
                    avatar: decoded.avatar,
                    token,
                });
            } catch {
                localStorage.removeItem("token");
            }
        }
        setLoading(false);
    }, []);

    async function login({ username, password }) {
        try {
            const data = await loginApi({ username, password });
            const decoded = jwtDecode(data.token);
            localStorage.setItem("token", data.token);
            setUser({
                id: decoded.id,
                username: decoded.username,
                avatar: decoded.avatar,
                token: data.token,
            });
            return true;
        } catch (error) {
            throw error;
        }
    }

    function logout() {
        localStorage.removeItem("token");
        setUser(null);
    }

    if (loading) {
        return <p>Laddar användardata...</p>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
