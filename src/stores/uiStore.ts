import { create } from "zustand";
import type { ToastMessage, AdminTab } from "../types";

interface UIState {
  toasts: ToastMessage[];
  mobileMenuOpen: boolean;
  mobileCheckoutOpen: boolean;
  adminTab: AdminTab;
  scrolled: boolean;
  
  addToast: (toast: Omit<ToastMessage, "id">) => void;
  removeToast: (id: string) => void;
  setMobileMenuOpen: (open: boolean) => void;
  setMobileCheckoutOpen: (open: boolean) => void;
  setAdminTab: (tab: AdminTab) => void;
  setScrolled: (scrolled: boolean) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  toasts: [],
  mobileMenuOpen: false,
  mobileCheckoutOpen: false,
  adminTab: "overview",
  scrolled: false,

  addToast: (toast) => {
    const id = Math.random().toString(36).slice(2);
    const duration = toast.duration ?? 4000;
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => get().removeToast(id), duration);
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
  setMobileCheckoutOpen: (open) => set({ mobileCheckoutOpen: open }),
  setAdminTab: (tab) => set({ adminTab: tab }),
  setScrolled: (scrolled) => set({ scrolled }),
}));
