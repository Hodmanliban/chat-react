
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let csrfToken = sessionStorage.getItem("csrfToken");

async function fetchCsrfToken() {
  const res = await api.patch("/csrf");
  csrfToken = res.data?.csrfToken;
  if (csrfToken) sessionStorage.setItem("csrfToken", csrfToken);
  return csrfToken;
}

api.interceptors.request.use(async (config) => {
  if (config.url !== "/csrf") {
    const m = (config.method || "").toLowerCase();
    if (!csrfToken && ["post", "put", "patch", "delete"].includes(m)) await fetchCsrfToken();

    const needsCsrf = ["/auth/register", "/auth/token", "/user"];
    if (needsCsrf.includes(config.url) && csrfToken) {
      if (!config.data || typeof config.data !== "object") config.data = {};
      config.data.csrfToken = csrfToken;
    }

    const token = sessionStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function handleSuccess(res, msg) {
  console.log(`${msg} (Status ${res.status} ${res.statusText})`);
  return res.data;
}
function handleError(error, msg) {
  const res = error.response;
  const detail = typeof res?.data === "string"
    ? res.data
    : (res?.data?.message || res?.data?.error || (Array.isArray(res?.data?.errors) ? res.data.errors.join(", ") : ""));
  const finalMsg = detail ? `${msg}. Server says: ${detail}` : msg;
  console.error(`${finalMsg} (Status ${res?.status})`);
  if ((res?.status === 401 || res?.status === 403) && String(detail).toLowerCase().includes("token")) {
    throw new Error("EXPIRED_TOKEN");
  }
  throw new Error(finalMsg);
}

export async function registerUser(username, email, password, avatar) {
  try { const res = await api.post("/auth/register", { username, email, password, avatar }); return res.data; }
  catch (err) { throw err; }
}

export async function loginUser(username, password) {
  try {
    const res = await api.post("/auth/token", { username, password });
    const data = handleSuccess(res, "Login successful");
    if (data?.token) sessionStorage.setItem("token", data.token);
    return data;
  } catch (err) { return handleError(err, "Login failed"); }
}

export function logoutUser() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("csrfToken");
  console.log("Logged out successfully.");
}

export async function deleteUser(userId) {
  try { const res = await api.delete(`/users/${userId}`); return handleSuccess(res, "User deleted"); }
  catch (err) { return handleError(err, "Failed to delete user"); }
}


export async function updateUser({ userId, username, email, avatar }) {
  try {
    if (!userId) throw new Error("Missing userId");
    const body = { userId, id: userId };
    if (typeof username === "string") body.username = username;
    if (typeof email === "string") body.email = email;
    if (typeof avatar === "string") body.avatar = avatar;

    const res = await api.put("/user", body);
    return handleSuccess(res, "User updated");
  } catch (err) { return handleError(err, "Failed to update user"); }
}

export async function getAllMessages() {
  try { const res = await api.get("/messages"); return handleSuccess(res, "Fetched all messages"); }
  catch (err) { return handleError(err, "Failed to fetch messages"); }
}

export async function getUserMessages(conversationId) {
  try { const res = await api.get("/messages", { params: { conversationId } }); return handleSuccess(res, "Fetched conversation messages"); }
  catch (err) { return handleError(err, "Failed to fetch conversation messages"); }
}

export async function postMessage(text, conversationId, avatar, username) {
  try { const res = await api.post("/messages", { text, conversationId, avatar, username }); return handleSuccess(res, "Message sent"); }
  catch (err) { return handleError(err, "Failed to send message"); }
}

export async function deleteMessage(messageId) {
  try { const res = await api.delete(`/messages/${messageId}`); return handleSuccess(res, "Message deleted"); }
  catch (err) { return handleError(err, "Failed to delete message"); }
}

export async function getUser(userId) {
  try { const res = await api.get(`/users/${userId}`); return handleSuccess(res, "User fetched"); }
  catch (err) { return handleError(err, "Failed to fetch user"); }
}

export default api;
