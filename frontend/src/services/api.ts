import axios, { AxiosInstance } from "axios";
import config from "../config";

// Create the API instance without store configuration
const api = axios.create({
  baseURL: config.API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
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
