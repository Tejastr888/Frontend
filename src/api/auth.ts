import axios from "axios";
import { z } from "zod";

export const AUTH_SERVICE_URL =
  import.meta.env.VITE_AUTH_SERVICE_URL || "http://localhost:8081";

const api = axios.create({
  baseURL: AUTH_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("auth.token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Schema
export const AuthResponseSchema = z.object({
  token: z.string(),
  type: z.string(),
  userId: z.number(),
  email: z.string(),
  name: z.string(),
  role: z.string(),
});

export type AuthResponse = z.infer<typeof AuthResponseSchema>;

// Login
export const loginUser = async (email: string, password: string) => {
  const response = await api.post<AuthResponse>("/api/auth/login", {
    email,
    password,
  });
  return AuthResponseSchema.parse(response.data);
};

// Register
export type RegisterData = {
  name: string;
  email: string;
  password: string;
  phoneNumber?: string;
  role?: string;
};

export const registerUser = async (data: RegisterData) => {
  const response = await api.post<AuthResponse>("/api/auth/register", data);
  return AuthResponseSchema.parse(response.data);
};

// Validate Token
export const validateToken = async (token: string) => {
  const response = await api.get<boolean>("/api/auth/validate", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export default api;
