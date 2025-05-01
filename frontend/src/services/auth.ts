import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    credits: number;
  };
  creditReward?: number;
  rewardMessage?: string;
}

interface RegisterResponse {
  message: string;
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    credits: number;
  };
}

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration and errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const login = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });
    const { token, ...data } = response.data;
    localStorage.setItem("token", token);
    return data;
  } catch (error: any) {
    console.error("Login error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Login failed"
    );
  }
};

export const register = async (
  username: string,
  email: string,
  password: string
): Promise<RegisterResponse> => {
  try {
    const response = await api.post("/auth/register", {
      username,
      email,
      password,
    });
    const { token, ...data } = response.data;
    localStorage.setItem("token", token);
    return data;
  } catch (error: any) {
    console.error("Registration error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Registration failed"
    );
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");
    return response.data;
  } catch (error: any) {
    console.error("Get user error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to get user"
    );
  }
};

export const logout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem("token");
};
