import axios from "axios";
import { toast } from "react-toastify";
import { store } from "../app/store.js";
import { logout } from "../features/auth/authSlice.js";

// Pre-configured Axios instance for the ERP API.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach the JWT to every request if the user is logged in.
api.interceptors.request.use((config) => {
  const token = store.getState().auth.token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response handler: surface errors and auto-logout on 401 (expired session).
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message || error.message || "Something went wrong";

    if (status === 401) {
      // Token invalid or session expired -> force logout.
      const isLoggedIn = store.getState().auth.token;
      if (isLoggedIn) {
        store.dispatch(logout());
        toast.error("Session expired. Please log in again.");
      }
    }
    return Promise.reject(new Error(message));
  }
);

export default api;
