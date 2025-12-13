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
// import axios from "axios";
// import { toast } from "sonner";

// const api = axios.create({
//   //   baseURL: "/api/v1/",
//   baseURL: "/api/proxy",
//   headers: {
//     "Content-Type": "application/json",
//   },
//   withCredentials: true,
// });

// // ========================================
// // REQUEST — Auto attach token OR redirect if missing
// // ========================================
// api.interceptors.request.use((config) => {
//   if (typeof window !== "undefined") {
//     const match = document.cookie.match(/(^| )token=([^;]+)/);
//     const token = match ? match[2] : null;

//     // 🚨 TOKEN TIDAK ADA → LANGSUNG REDIRECT
//     if (!token) {
//       toast.error("Your session has expired. Please login again.", {
//         duration: 2000,
//       });

//       setTimeout(() => {
//         window.location.href = "/login";
//       }, 800);

//       // cegah request tetap dikirim ke backend
//       return Promise.reject({ message: "No token" });
//     }

//     // inject token
//     config.headers.Authorization = `Bearer ${token}`;
//   }

//   return config;
// });

// // ========================================
// // RESPONSE — Auto redirect when token expired
// // ========================================
// let hasShownExpiredToast = false;

// api.interceptors.response.use(
//   (res) => res,
//   (err) => {
//     const status = err.response?.status;

//     if (status === 401 || status === 403 || status === 500) {
//       if (!hasShownExpiredToast) {
//         hasShownExpiredToast = true;

//         toast.error("Your session has expired. Please login again.", {
//           duration: 2500,
//         });

//         // remove cookie
//         document.cookie = "token=; Max-Age=0; path=/; SameSite=Lax; Secure";

//         setTimeout(() => {
//           window.location.href = "/login";
//         }, 1000);
//       }
//     }

//     return Promise.reject(err);
//   }
// );

// export default api;
