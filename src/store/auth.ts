import { create } from "zustand";
import { AuthResponse } from "@/api/auth";

export type UserRole = "USER" | "CLUB" | "ADMIN";

interface User {
  userId: number;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (response: AuthResponse) => void;
  logout: () => void;
  isRole: (role: UserRole) => boolean;
  hasAnyRole: (roles: UserRole[]) => boolean;
}

export const useAuth = create<AuthState>((set, get) => {
  // Try to rehydrate from localStorage so the user stays logged in across reloads
  const storedToken =
    typeof window !== "undefined" ? localStorage.getItem("auth.token") : null;
  const storedUser =
    typeof window !== "undefined" ? localStorage.getItem("auth.user") : null;
  const initialUser = storedUser ? (JSON.parse(storedUser) as User) : null;
  const initialIsAuthenticated = !!storedToken && !!initialUser;

  return {
    user: initialUser,
    token: storedToken,
    isAuthenticated: initialIsAuthenticated,
    setAuth: (response) => {
      const { token, userId, email, name, role } = response;
      const roleTyped = role as UserRole;
      localStorage.setItem("auth.token", token);
      localStorage.setItem(
        "auth.user",
        JSON.stringify({ userId, email, name, role: roleTyped })
      );
      set({
        user: { userId, email, name, role: roleTyped },
        token,
        isAuthenticated: true,
      });
    },
    logout: () => {
      localStorage.removeItem("auth.token");
      localStorage.removeItem("auth.user");
      set({ user: null, token: null, isAuthenticated: false });
    },
    isRole: (role) => {
      const state = get();
      return state.user?.role === role;
    },
    hasAnyRole: (roles) => {
      const state = get();
      return state.user ? roles.includes(state.user.role) : false;
    },
  };
});
