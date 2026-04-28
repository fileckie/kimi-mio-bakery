import type { BootstrapPayload, Customer, InventoryMap, Order, Product, StoreLocation, BatchSale, ProductionSheet, ChangelogEntry } from "../types";

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
  
  // Customers — simplified: no password required
  authenticateCustomer: (body: { name: string; phone: string }) =>
    apiRequest<Customer>("/api/customers/authenticate", { method: "POST", body: JSON.stringify(body) }),
  registerCustomer: (body: { name: string; phone: string; password?: string }) =>
    apiRequest<Customer>("/api/customers/register", { method: "POST", body: JSON.stringify(body) }),
  loginCustomer: (body: { phone: string; password?: string }) =>
    apiRequest<Customer>("/api/customers/login", { method: "POST", body: JSON.stringify(body) }),
  getCustomerOrders: (customerId: string) =>
    apiRequest<Order[]>(`/api/customers/${encodeURIComponent(customerId)}/orders`),
  getCustomers: () => apiRequest<(Customer & { orderCount: number; totalSpent: number })[]>("/api/admin/customers"),
  
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
  createStore: (store: Partial<StoreLocation> & { name: string }) =>
    apiRequest<StoreLocation>("/api/admin/stores", { method: "POST", body: JSON.stringify(store) }),
  updateBatchSale: (patch: Partial<BatchSale>) =>
    apiRequest<BatchSale>("/api/admin/batch-sale", { method: "PATCH", body: JSON.stringify(patch) }),
  updateInventory: (productId: string, storeId: string, allocated: number) =>
    apiRequest<InventoryMap>("/api/admin/inventory", { method: "PATCH", body: JSON.stringify({ productId, storeId, allocated }) }),
  updateOrderStatus: (id: string, status: string) =>
    apiRequest<Order>(`/api/admin/orders/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  cancelOrder: (id: string) =>
    apiRequest<Order>(`/api/orders/${encodeURIComponent(id)}/cancel`, { method: "POST" }),
  updateOrderFulfillment: (id: string, patch: Partial<Order>) =>
    apiRequest<Order>(`/api/admin/orders/${encodeURIComponent(id)}/fulfillment`, { method: "PATCH", body: JSON.stringify(patch) }),
  
  // Production Sheets
  closeBatch: () =>
    apiRequest<{ sheet: ProductionSheet; batchSale: BatchSale; orders: Order[] }>("/api/admin/close-batch", { method: "POST" }),
  getProductionSheets: () => apiRequest<ProductionSheet[]>("/api/admin/production-sheets"),
  getProductionSheet: (id: string) => apiRequest<ProductionSheet>(`/api/admin/production-sheets/${encodeURIComponent(id)}`),
  updateProductionSheetStatus: (id: string, status: string) =>
    apiRequest<ProductionSheet>(`/api/admin/production-sheets/${encodeURIComponent(id)}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  updateProductionSheetItems: (id: string, items: { productId: string; name: string; category: string; totalQty: number; storeBreakdown?: Record<string, number> }[]) =>
    apiRequest<ProductionSheet>(`/api/admin/production-sheets/${encodeURIComponent(id)}/items`, { method: "PATCH", body: JSON.stringify({ items }) }),
  batchUpdateOrderStatus: (ids: string[], status: string) =>
    apiRequest<{ updated: number; status: string }>("/api/admin/orders/batch-status", { method: "POST", body: JSON.stringify({ ids, status }) }),
  
  // Backups
  getBackups: () => apiRequest<{ name: string; path: string; size: number; createdAt: string }[]>("/api/admin/backups"),
  createBackup: () => apiRequest<{ success: boolean; name: string; path: string; size: number }>("/api/admin/backup", { method: "POST" }),
  // Changelog
  getChangelog: () => apiRequest<ChangelogEntry[]>("/api/admin/changelog"),
  createChangelogEntry: (entry: Omit<ChangelogEntry, "items"> & { items: string[] }) =>
    apiRequest<ChangelogEntry>("/api/admin/changelog", { method: "POST", body: JSON.stringify(entry) }),
};
