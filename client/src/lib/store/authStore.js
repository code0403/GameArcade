import { create } from "zustand";
import api from "@/lib/api";

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isHydrating: true,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  hydrate: async () => {
    try {
      const { data } = await api.get("/scores/me");
      set({ user: data, isAuthenticated: true, isHydrating: false });
    } catch {
      set({ user: null, isAuthenticated: false, isHydrating: false });
    }
  },

  logout: async () => {
    await api.post("/auth/logout");
    set({ user: null, isAuthenticated: false });
  },
}));
