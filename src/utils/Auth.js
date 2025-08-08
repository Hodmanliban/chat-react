import api from "../services/api";

// register user
export async function register({ username, password, email, avatar }) {
    try {
        const response = await api.post("/auth/register", {
            username,
            password,
            email,
            avatar,
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { message: "något gick fel vid registrering." };
    }
}

// login user
export async function login({ username, password }) {
    try {
        const response = await api.post("/auth/token", { username, password });
        return response.data; // förväntar att innehåller token
    } catch (error) {
        throw error.response?.data || { message: "något gick fel vid inloggning." };
    }
}
