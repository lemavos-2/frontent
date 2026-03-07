// ─────────────────────────────────────────────────────────────────────────────

import { create } from "zustand";
import { authService } from "@/services/authService";
import type { User } from "@/types/models";

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { username: string; email: string; password: string }) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  logout: () => void;
  hydrate: () => Promise<void>;
  updateUser: (u: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: localStorage.getItem("token"),
  isLoading: false,

  login: async (email, password) => {
    const res = await authService.login({ email, password });
    localStorage.setItem("token", res.token);
    set({ token: res.token });
    const user = await authService.me();
    set({ user });
  },

  register: async (data) => {
    await authService.register(data);
  },

  resendVerification: async (email) => {
    await authService.resendVerification(email);
  },

  verifyEmail: async (token) => {
    await authService.verifyEmail(token);
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },

  hydrate: async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      set({ isLoading: true });
      const user = await authService.me();
      set({ user, token });
    } catch {
      localStorage.removeItem("token");
      set({ user: null, token: null });
    } finally {
      set({ isLoading: false });
    }
  },

  updateUser: (u) => set((s) => ({ user: s.user ? { ...s.user, ...u } : null })),
}));

// ─────────────────────────────────────────────────────────────────────────────
