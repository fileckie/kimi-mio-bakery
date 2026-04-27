import { create } from "zustand";
import type { BatchSale, InventoryMap, Order, Product, ProductionSheet, StoreLocation, RoleId, Route } from "../types";
import { api } from "../lib/api";
import { useUIStore } from "./uiStore";

interface AppState {
  // Data
  products: Product[];
  stores: StoreLocation[];
  batchSale: BatchSale;
  inventory: InventoryMap;
  orders: Order[];
  productionSheets: ProductionSheet[];
  isLoading: boolean;
  error: string | null;
  
  // Navigation
  route: Route;
  activeRole: RoleId;
  
  // Actions
  setRoute: (route: Route) => void;
  setActiveRole: (role: RoleId) => void;
  refreshData: () => Promise<void>;
  setProducts: (products: Product[] | ((prev: Product[]) => Product[])) => void;
  setStores: (stores: StoreLocation[] | ((prev: StoreLocation[]) => StoreLocation[])) => void;
  setBatchSale: (batchSale: BatchSale | ((prev: BatchSale) => BatchSale)) => void;
  setInventory: (inventory: InventoryMap | ((prev: InventoryMap) => InventoryMap)) => void;
  setOrders: (orders: Order[] | ((prev: Order[]) => Order[])) => void;
  setError: (error: string | null) => void;
  createOrder: (order: Order) => Promise<Order | null>;
  closeBatch: () => Promise<ProductionSheet | null>;
  refreshProductionSheets: () => Promise<void>;
}

const emptyBatchSale: BatchSale = {
  isOpen: false,
  deadline: "",
  defaultDeadline: "21:30",
  ovenBatch: "",
  ovenBatches: [],
  featuredProductIds: [],
  pickupStoreIds: [],
  freeShippingThreshold: 150,
  baseShippingFee: 10,
  note: "",
  paymentWechatId: "mio220827",
  paymentQrUrl: "",
  paymentInstruction: "下单后请添加主理人微信，发送订购单并完成转账，后台确认后安排制作。",
  checkoutTitle: "YOUR ORDER",
  checkoutSubtitle: "本轮接受预订",
  checkoutEmptyHint: "从左侧挑选喜欢的窑烤面包",
  closedMessage: "本轮窑烤已结束，下一炉开启时会在社群通知。",
  memberLabel: "MEMBER",
  memberHint: "输入姓名和手机号即可预订",
  successTitle: "ORDER CONFIRMED",
  successMessage: "面团已入单，窑火为你而燃",
  footerTagline: "不多做，只为你烤",
};

function normalizeRoute(pathname: string): Route {
  if (pathname === "/admin" || pathname === "/admin/pos") return pathname;
  return "/";
}

export const useAppStore = create<AppState>((set, get) => ({
  products: [],
  stores: [],
  batchSale: emptyBatchSale,
  inventory: {},
  orders: [],
  productionSheets: [],
  isLoading: true,
  error: null,
  route: normalizeRoute(window.location.pathname),
  activeRole: "hq",

  setRoute: (route) => {
    window.history.pushState({}, "", route);
    set({ route });
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  setActiveRole: (activeRole) => set({ activeRole }),

  refreshData: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await api.bootstrap();
      set({
        products: data.products,
        stores: data.stores,
        batchSale: data.batchSale,
        inventory: data.inventory,
        orders: data.orders,
        isLoading: false,
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : "后端暂不可用",
        isLoading: false,
      });
    }
  },

  setProducts: (products) =>
    set((state) => ({
      products: typeof products === "function" ? products(state.products) : products,
    })),

  setStores: (stores) =>
    set((state) => ({
      stores: typeof stores === "function" ? stores(state.stores) : stores,
    })),

  setBatchSale: (batchSale) =>
    set((state) => ({
      batchSale: typeof batchSale === "function" ? batchSale(state.batchSale) : batchSale,
    })),

  setInventory: (inventory) =>
    set((state) => ({
      inventory: typeof inventory === "function" ? inventory(state.inventory) : inventory,
    })),

  setOrders: (orders) =>
    set((state) => ({
      orders: typeof orders === "function" ? orders(state.orders) : orders,
    })),

  closeBatch: async () => {
    try {
      const data = await api.closeBatch();
      set((state) => ({
        batchSale: data.batchSale,
        orders: data.orders,
        productionSheets: [data.sheet, ...state.productionSheets],
        error: null,
      }));
      useUIStore.getState().addToast({ type: "success", message: `生产单 ${data.sheet.id} 已生成，共 ${data.sheet.totalItems} 个面包` });
      return data.sheet;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "截单失败";
      set({ error: msg });
      useUIStore.getState().addToast({ type: "error", message: msg });
      return null;
    }
  },

  refreshProductionSheets: async () => {
    try {
      const sheets = await api.getProductionSheets();
      set({ productionSheets: sheets });
    } catch {
      // silently fail
    }
  },

  setError: (error) => set({ error }),

  createOrder: async (order) => {
    try {
      const endpoint = order.type === "pos" ? api.createPosOrder : api.createOrder;
      const data = await endpoint(order);
      set((state) => ({
        orders: [data.order, ...state.orders.filter((o) => o.id !== data.order.id)],
        inventory: data.inventory,
        error: null,
      }));
      useUIStore.getState().addToast({ type: "success", message: `订单 ${data.order.id} 创建成功` });
      return data.order;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "订单保存失败";
      set({ error: msg });
      useUIStore.getState().addToast({ type: "error", message: msg });
      return null;
    }
  },
}));
