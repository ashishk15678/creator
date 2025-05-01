import axios, { AxiosInstance } from "axios";
import config from "../config";

// Create the API instance without store configuration
const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, DELETE, PATCH",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With",
  },
  withCredentials: false, // Changed to false since we're using token-based auth
});

// Function to configure the API with store
export const configureApi = (store: any) => {
  // Request interceptor
  api.interceptors.request.use(
    (config) => {
      const state = store.getState();
      const token = state.auth.token;

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      // Add CORS headers for production
      if (window.location.hostname === "creator-7553b.web.app") {
        config.headers["Access-Control-Allow-Origin"] = "*";
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        store.dispatch({ type: "auth/logout" });
      }
      return Promise.reject(error);
    }
  );
};

export default api;
