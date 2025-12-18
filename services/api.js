import axios from "axios";

const api = axios.create({
  baseURL: "/api/v1/",
  //   baseURL: "/api/proxy",
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor untuk tambahkan token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const match = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    const token = match ? match[2] : null;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;
