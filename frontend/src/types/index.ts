export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  credits: number;
  createdAt: string;
  updatedAt: string;
  savedPosts?: string[];
  totalInteractions?: number;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiError {
  error: string;
  details?: string;
}

export interface RootState {
  auth: {
    user: User | null;
    token: string | null;
    loading: boolean;
    error: string | null;
  };
}
