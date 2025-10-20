import { create } from "zustand";
import { AuthResponse } from "@/api/auth";

interface User {
  userId: number;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (response: AuthResponse) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => {
  // Try to rehydrate from localStorage so the user stays logged in across reloads
  const storedToken =
    typeof window !== "undefined" ? localStorage.getItem("auth.token") : null;
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("auth.user") : null;
  const initialUser = storedUser ? JSON.parse(storedUser) : null;
  const initialIsAuthenticated = !!storedToken && !!initialUser;

  return {
    user: initialUser,
    token: storedToken,
    isAuthenticated: initialIsAuthenticated,
    setAuth: (response) => {
      const { token, userId, email, name, role } = response;
      localStorage.setItem("auth.token", token);
      localStorage.setItem(
        "auth.user",
        JSON.stringify({ userId, email, name, role })
      );
      set({
        user: { userId, email, name, role },
        token,
        isAuthenticated: true,
      });
    },
    logout: () => {
      localStorage.removeItem("auth.token");
      localStorage.removeItem("auth.user");
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
