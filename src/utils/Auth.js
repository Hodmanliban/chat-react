import api from "../services/api";

async function getCsrfToken() {
  const response = await api.patch("/csrf");
  return response.data.csrfToken;
}

// register user
export async function register({ username, password, email, avatar }) {
  try {
    const csrfToken = await getCsrfToken();
    const response = await api.post("/auth/register", {
      username,
      password,
      email,
      avatar,
      csrfToken,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "något gick fel vid registrering." };
  }
}

// login user
export async function login({ username, password }) {
  try {
    const csrfToken = await getCsrfToken();
    const response = await api.post("/auth/token", {
      username,
      password,
      csrfToken,
    });
    return response.data; // förväntar att innehåller token
  } catch (error) {
    throw error.response?.data || { message: "något gick fel vid inloggning." };
  }
}
