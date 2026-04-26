import { create } from "zustand";
import type { StoreId } from "../types";

interface CartItem {
  productId: string;
  qty: number;
}

interface CartState {
  items: Record<string, number>;
  pickupStoreId: StoreId;
  sourceStoreId: StoreId;
  deliveryMethod: "门店自提" | "本地配送" | "顺丰快递";
  paymentMethod: "微信转账" | "微信支付" | "支付宝" | "到店付" | "现金";
  receiver: string;
  phone: string;
  address: string;
  
  // Actions
  addItem: (productId: string, maxAvailable: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, delta: number, maxAvailable: number) => void;
  clearCart: () => void;
  setPickupStoreId: (id: StoreId) => void;
  setSourceStoreId: (id: StoreId) => void;
  setDeliveryMethod: (method: "门店自提" | "本地配送" | "顺丰快递") => void;
  setPaymentMethod: (method: "微信转账" | "微信支付" | "支付宝" | "到店付" | "现金") => void;
  setReceiver: (v: string) => void;
  setPhone: (v: string) => void;
  setAddress: (v: string) => void;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: {},
  pickupStoreId: "store-a",
  sourceStoreId: "store-a",
  deliveryMethod: "门店自提",
  paymentMethod: "微信转账",
  receiver: "",
  phone: "",
  address: "",

  addItem: (productId, maxAvailable) => {
    const current = get().items[productId] || 0;
    if (current >= maxAvailable) return;
    set({ items: { ...get().items, [productId]: current + 1 } });
  },

  removeItem: (productId) => {
    const next = { ...get().items };
    delete next[productId];
    set({ items: next });
  },

  updateQty: (productId, delta, maxAvailable) => {
    const current = get().items[productId] || 0;
    const nextQty = Math.max(0, Math.min(maxAvailable, current + delta));
    const next = { ...get().items, [productId]: nextQty };
    if (nextQty === 0) delete next[productId];
    set({ items: next });
  },

  clearCart: () => set({ items: {} }),
  setPickupStoreId: (id) => set({ pickupStoreId: id }),
  setSourceStoreId: (id) => set({ sourceStoreId: id }),
  setDeliveryMethod: (method) => set({ deliveryMethod: method }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),
  setReceiver: (v) => set({ receiver: v }),
  setPhone: (v) => set({ phone: v }),
  setAddress: (v) => set({ address: v }),
}));
