import type { BootstrapPayload, Customer, InventoryMap, Order, Product, StoreLocation, BatchSale, ProductionSheet } from "../types";

const API_BASE = "";

async function apiRequest<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "content-type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || "请求失败");
  }
  return data as T;
}

export const api = {
  bootstrap: () => apiRequest<BootstrapPayload>("/api/bootstrap"),
  
  // Customers
  registerCustomer: (body: { name: string; phone: string; password: string }) =>
    apiRequest<Customer>("/api/customers/register", { method: "POST", body: JSON.stringify(body) }),
  loginCustomer: (body: { phone: string; password: string }) =>
    apiRequest<Customer>("/api/customers/login", { method: "POST", body: JSON.stringify(body) }),
  
  // Orders
  createOrder: (order: Order) =>
    apiRequest<{ order: Order; inventory: InventoryMap }>("/api/orders", { method: "POST", body: JSON.stringify(order) }),
  createPosOrder: (order: Order) =>
    apiRequest<{ order: Order; inventory: InventoryMap }>("/api/admin/pos-orders", { method: "POST", body: JSON.stringify(order) }),
  lookupOrder: (code: string) =>
    apiRequest<Order>(`/api/orders/lookup?code=${encodeURIComponent(code)}`),
  
  // Admin
  updateProduct: (id: string, patch: Partial<Product>) =>
    apiRequest<Product>(`/api/admin/products/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }),
  createProduct: (product: Omit<Product, "id">) =>
    apiRequest<{ product: Product; inventory: InventoryMap }>("/api/admin/products", { method: "POST", body: JSON.stringify(product) }),
  updateStore: (id: string, patch: Partial<StoreLocation>) =>
    apiRequest<StoreLocation>(`/api/admin/stores/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(patch) }),
  updateBatchSale: (patch: Partial<BatchSale>) =>
    apiRequest<BatchSale>("/api/admin/batch-sale", { method: "PATCH", body: JSON.stringify(patch) }),
  updateInventory: (productId: string, storeId: string, allocated: number) =>
    apiRequest<InventoryMap>("/api/admin/inventory", { method: "PATCH", body: JSON.stringify({ productId, storeId, allocated }) }),
  updateOrderStatus: (id: string, status: string) =>
    apiRequest<Order>(`/api/admin/orders/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updateOrderFulfillment: (id: string, patch: Partial<Order>) =>
    apiRequest<Order>(`/api/admin/orders/${encodeURIComponent(id)}/fulfillment`, { method: "PATCH", body: JSON.stringify(patch) }),
  
  // Production Sheets
  closeBatch: () =>
    apiRequest<{ sheet: ProductionSheet; batchSale: BatchSale; orders: Order[] }>("/api/admin/close-batch", { method: "POST" }),
  getProductionSheets: () => apiRequest<ProductionSheet[]>("/api/admin/production-sheets"),
  getProductionSheet: (id: string) => apiRequest<ProductionSheet>(`/api/admin/production-sheets/${encodeURIComponent(id)}`),
  updateProductionSheetStatus: (id: string, status: string) =>
    apiRequest<ProductionSheet>(`/api/admin/production-sheets/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
};
