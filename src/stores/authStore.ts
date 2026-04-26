import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer } from "../types";
import { api } from "../lib/api";
import { useUIStore } from "./uiStore";

interface AuthState {
  customer: Customer | null;
  isLoading: boolean;
  error: string | null;
  
  authenticate: (name: string, phone: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      customer: null,
      isLoading: false,
      error: null,

      authenticate: async (name, phone) => {
        set({ isLoading: true, error: null });
        try {
          const customer = await api.authenticateCustomer({ name, phone });
          set({ customer, isLoading: false });
          useUIStore.getState().addToast({ type: "success", message: `欢迎，${customer.name}` });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "登录失败";
          set({ error: msg, isLoading: false });
          useUIStore.getState().addToast({ type: "error", message: msg });
        }
      },

      logout: () => {
        set({ customer: null, error: null });
        useUIStore.getState().addToast({ type: "info", message: "已退出登录" });
      },
      clearError: () => set({ error: null }),
    }),
    {
      name: "mio-auth",
      partialize: (state) => ({ customer: state.customer }),
    }
  )
);
