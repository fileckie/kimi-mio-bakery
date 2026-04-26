import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Customer } from "../types";
import { api } from "../lib/api";
import { useUIStore } from "./uiStore";

interface AuthState {
  customer: Customer | null;
  isLoading: boolean;
  error: string | null;
  
  login: (phone: string, password: string) => Promise<void>;
  register: (name: string, phone: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      customer: null,
      isLoading: false,
      error: null,

      login: async (phone, password) => {
        set({ isLoading: true, error: null });
        try {
          const customer = await api.loginCustomer({ phone, password });
          set({ customer, isLoading: false });
          useUIStore.getState().addToast({ type: "success", message: `欢迎回来，${customer.name}` });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "登录失败";
          set({ error: msg, isLoading: false });
          useUIStore.getState().addToast({ type: "error", message: msg });
        }
      },

      register: async (name, phone, password) => {
        set({ isLoading: true, error: null });
        try {
          const customer = await api.registerCustomer({ name, phone, password });
          set({ customer, isLoading: false });
          useUIStore.getState().addToast({ type: "success", message: `注册成功，欢迎 ${customer.name}` });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "注册失败";
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
