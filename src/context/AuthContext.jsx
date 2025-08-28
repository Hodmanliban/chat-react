import React, { createContext, useState, useEffect, useContext } from "react";
import { jwtDecode } from "jwt-decode";
import { loginUser, logoutUser, getUser } from "../services/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        async function fetchUserFromToken(token) {
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    const fullUser = await getUser(decoded.id);
                    setUser({
                        id: fullUser.id,
                        username: fullUser.username,
                        email: fullUser.email,
                        avatar: fullUser.avatar,
                        token,
                    });
                } catch {
                    localStorage.removeItem("token");
                }
            }
            setLoading(false);
        }
        fetchUserFromToken(token);
    }, []);

    async function login({ username, password }) {
        try {
            const data = await loginUser(username, password);
            if (data?.token) {
                localStorage.setItem("token", data.token);
                const decoded = jwtDecode(data.token);
                const fullUser = await getUser(decoded.id);
                setUser({
                    id: fullUser.id,
                    username: fullUser.username,
                    email: fullUser.email,
                    avatar: fullUser.avatar,
                    token: data.token,
                });
                return true;
            }
            return false;
        } catch (error) {
            throw error;
        }
    }

    function logout() {
        logoutUser();
        localStorage.removeItem("token");
        setUser(null);
    }

    if (loading) {
        return <p>Laddar användardata...</p>;
    }

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, setUser }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}