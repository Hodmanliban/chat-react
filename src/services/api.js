// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // ex. "https://chatify-api.up.railway.app"
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// --- CSRF Token hantering ---
let csrfToken = localStorage.getItem("csrfToken");

async function fetchCsrfToken() {
  try {
    const res = await api.patch("/csrf");
    csrfToken = res.data.csrfToken;
    if (csrfToken) {
      localStorage.setItem("csrfToken", csrfToken);
      console.log("CSRF token fetched and stored:", csrfToken);
    }
  } catch (err) {
    console.error("Failed to fetch CSRF token:", err);
    throw err;
  }
  return csrfToken;
}

// --- Axios Interceptor ---
api.interceptors.request.use(async (config) => {
  if (config.url === "/csrf") return config;

  // för POST/PUT/PATCH/DELETE → lägg csrfToken i body
  if (["post", "put", "patch", "delete"].includes(config.method)) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }

    if (csrfToken) {
      // se till att body finns
      if (!config.data) config.data = {};
      if (typeof config.data === "object") {
        config.data.csrfToken = csrfToken;
      }
    }
  }

  // JWT → alltid i headers
  const token = sessionStorage.getItem("jwtToken") || localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// --- Helpers ---
function handleSuccess(response, msg) {
  console.log(`${msg} (Status ${response.status} ${response.statusText})`);
  return response.data;
}

function handleError(error, msg) {
  const res = error.response;
  let errorMessage = msg;
  if (res?.data?.message) {
    errorMessage += ` Server says: ${res.data.message}`;
  }
  console.error(`${errorMessage} (Status ${res?.status})`);
  throw new Error(errorMessage);
}

// --- Auth ---
export async function registerUser(username, password, email, avatar) {
  try {
    const res = await api.post("/auth/register", { username, password, email, avatar });
    return handleSuccess(res, "Registration successful");
  } catch (err) {
    return handleError(err, "Registration failed");
  }
}

export async function loginUser(username, password) {
  try {
    const res = await api.post("/auth/token", { username, password });
    const data = handleSuccess(res, "Login successful");
    if (data?.token) {
      sessionStorage.setItem("jwtToken", data.token);
    }
    return data;
  } catch (err) {
    return handleError(err, "Login failed");
  }
}

export function logoutUser() {
  sessionStorage.removeItem("jwtToken");
  localStorage.removeItem("csrfToken");
  console.log("Logged out successfully.");
}

// --- Messages ---
export async function getAllMessages() {
  try {
    const res = await api.get("/messages");
    return handleSuccess(res, "Fetched all messages");
  } catch (err) {
    return handleError(err, "Failed to fetch messages");
  }
}

export async function getUserMessages(conversationId) {
  try {
    const res = await api.get("/messages", { params: { conversationId } });
    return handleSuccess(res, "Fetched conversation messages");
  } catch (err) {
    return handleError(err, "Failed to fetch conversation messages");
  }
}

export async function postMessage(text, conversationId) {
  try {
    const res = await api.post("/messages", { text, conversationId });
    return handleSuccess(res, "Message sent");
  } catch (err) {
    return handleError(err, "Failed to send message");
  }
}

export async function deleteMessage(messageId) {
  try {
    const res = await api.delete(`/messages/${messageId}`);
    return handleSuccess(res, "Message deleted");
  } catch (err) {
    return handleError(err, "Failed to delete message");
  }
}

export default api;
