import axios from "axios";

const api = axios.create({
  baseURL: "https://chatify-api.up.railway.app/",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let csrfToken = null;
api.interceptors.request.use(async (config) => {
  // Om anropet är till /csrf, hoppa över CSRF-token-hämtning för att undvika loop
  if (config.url === "/csrf") {
    return config;
  }

  if (["post", "put", "patch", "delete"].includes(config.method)) {
    if (!csrfToken) {
      const response = await api.patch("/csrf");
      csrfToken = response.data.csrfToken;
    }
    config.headers["X-CSRF-Token"] = csrfToken;
  }

  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;

