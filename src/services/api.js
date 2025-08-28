import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

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

api.interceptors.request.use(async (config) => {
  if (config.url === "/csrf") return config;

  if (["post", "put", "patch", "delete"].includes(config.method)) {
    if (!csrfToken) {
      await fetchCsrfToken();
    }
    if (csrfToken) {
      if (!config.data) config.data = {};
      if (typeof config.data === "object") {
        config.data.csrfToken = csrfToken;
      }
    }
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

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

  // Handle expired/invalid token (403 or 401)
  if (
    (res?.status === 403 || res?.status === 401) &&
    res?.data?.message?.toLowerCase().includes("token")
  ) {
    throw new Error("EXPIRED_TOKEN");
  }

  throw new Error(errorMessage);
}

// Registrera användare
export async function registerUser(username, email, password, avatar) {
  try {
    const res = await api.post("/auth/register", { username, email, password, avatar });
    return res.data;
  } catch (err) {
    throw err;
  }
}

// Logga in användare
export async function loginUser(username, password) {
  try {
    const res = await api.post("/auth/token", { username, password });
    const data = handleSuccess(res, "Login successful");
    if (data?.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  } catch (err) {
    return handleError(err, "Login failed");
  }
}

// Logga ut användare
export function logoutUser() {
  localStorage.removeItem("token");
  localStorage.removeItem("csrfToken");
  console.log("Logged out successfully.");
}

// Radera användare
export async function deleteUser(userId) {
  try {
    const res = await api.delete(`/users/${userId}`);
    return handleSuccess(res, "User deleted");
  } catch (err) {
    return handleError(err, "Failed to delete user");
  }
}

// Uppdatera användare
export async function updateUser(data) {
  try {
    const res = await api.put("/user", data);
    return handleSuccess(res, "User updated");
  } catch (err) {
    return handleError(err, "Failed to update user");
  }
}

// Hämta alla meddelanden
export async function getAllMessages() {
  try {
    const res = await api.get("/messages");
    return handleSuccess(res, "Fetched all messages");
  } catch (err) {
    return handleError(err, "Failed to fetch messages");
  }
}

// Hämta meddelanden för en konversation
export async function getUserMessages(conversationId) {
  try {
    const res = await api.get("/messages", { params: { conversationId } });
    return handleSuccess(res, "Fetched conversation messages");
  } catch (err) {
    return handleError(err, "Failed to fetch conversation messages");
  }
}

// Skapa meddelande
export async function postMessage(text, conversationId, avatar) {
  try {
    const res = await api.post("/messages", { text, conversationId, avatar });
    return handleSuccess(res, "Message sent");
  } catch (err) {
    return handleError(err, "Failed to send message");
  }
}

// Radera meddelande
export async function deleteMessage(messageId) {
  try {
    const res = await api.delete(`/messages/${messageId}`);
    return handleSuccess(res, "Message deleted");
  } catch (err) {
    return handleError(err, "Failed to delete message");
  }
}

// Hämta specifik användare
export async function getUser(userId) {
  try {
    const res = await api.get(`/users/${userId}`);
    return handleSuccess(res, "User fetched");
  } catch (err) {
    return handleError(err, "Failed to fetch user");
  }
}

export default api;
