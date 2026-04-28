// ============================================================
// Mio Bakery — Shared Type Definitions
// ============================================================

export type Category = "欧包/坚果" | "吐司" | "恰巴塔" | "贝果/海盐卷" | "软欧包";
export type DeliveryMethod = "门店自提" | "本地配送" | "顺丰快递";
export type PaymentMethod = "微信转账" | "微信支付" | "支付宝" | "到店付" | "现金";
export type OrderType = "online" | "pos";
export type OrderStatus = "待确认" | "待生产" | "待自提" | "待发货" | "已发货" | "已完成" | "已取消";
export type Route = "/" | "/admin" | "/admin/pos";
export type RoleId = "hq" | "store-a" | "store-b" | "store-c" | "store-d";
export type StoreId = "store-a" | "store-b" | "store-c" | "store-d";
export type AdminTab = "overview" | "orders" | "production" | "products" | "members" | "settings";

export interface Product {
  id: string;
  name: string;
  category: Category;
  weight: string;
  price: number;
  description: string;
  ingredients: string[];
  imageTone: string;
  imageUrl?: string;
  isPublished: boolean;
  featured: boolean;
  story?: string;           // 主理人故事
  baker?: string;           // 面包师
  bestBefore?: string;      // 最佳食用时间
  crossSectionImage?: string; // 切面图 URL
  texture?: string;          // 口感描述
  crust?: string;            // 外皮描述
  aroma?: string;            // 香气描述
  origin?: string;           // 原物料来源
}

export interface StoreLocation {
  id: StoreId;
  name: string;
  role: "central" | "pickup";
  address: string;
  pickupOpen: boolean;
  sourceCode: string;
}

export interface OvenBatch {
  id: string;
  label: string;
  time: string;
  productIds: string[];
}

export interface BatchSale {
  isOpen: boolean;
  batchSequence: number;
  deadline: string;
  defaultDeadline: string;
  ovenBatch: string;
  ovenBatches: OvenBatch[];
  featuredProductIds: string[];
  pickupStoreIds: StoreId[];
  freeShippingThreshold: number;
  baseShippingFee: number;
  note: string;
  paymentWechatId: string;
  paymentQrUrl: string;
  paymentInstruction: string;
  // Customizable copy
  checkoutTitle: string;
  checkoutSubtitle: string;
  checkoutEmptyHint: string;
  closedMessage: string;
  memberLabel: string;
  memberHint: string;
  successTitle: string;
  successMessage: string;
  footerTagline: string;
  printLogoUrl?: string;
  printPrimaryColor?: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  createdAt?: string;
}

export interface InventoryAllocation {
  centralStock: number;
  stores: Record<StoreId, number>;
  sold: Record<StoreId, number>;
}

export type InventoryMap = Record<string, InventoryAllocation>;

export interface OrderItem {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  type: OrderType;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
  deliveryMethod: DeliveryMethod;
  paymentMethod: PaymentMethod;
  status: OrderStatus;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  paymentStatus?: string;
  sourceStoreId: StoreId;
  pickupStoreId: StoreId;
  receiver?: string;
  phone?: string;
  address?: string;
  shippingCompany?: string;
  trackingNumber?: string;
  logisticsStatus?: string;
  deliveryNote?: string;
  pickupCode?: string;
  createdAt: string;
  batchSequence?: number;
}

export interface BootstrapPayload {
  products: Product[];
  stores: StoreLocation[];
  batchSale: BatchSale;
  inventory: InventoryMap;
  orders: Order[];
  changelog: ChangelogEntry[];
}

export interface DashboardMetrics {
  totalOrders: number;
  pickupOrders: number;
  shippingOrders: number;
  revenue: number;
  avgOrderValue: number;
  topProducts: { name: string; qty: number }[];
  storeContributions: { name: string; revenue: number }[];
}

// Production Sheet
export interface ProductionSheetItem {
  id: number;
  productId: string;
  name: string;
  category: string;
  totalQty: number;
  storeBreakdown: Record<string, number>;
}

export interface ProductionSheet {
  id: string;
  batchId: string;
  createdAt: string;
  totalItems: number;
  status: "生产中" | "已出炉" | "已完成";
  items: ProductionSheetItem[];
}

// Notification types
export interface ToastMessage {
  id: string;
  type: "success" | "error" | "info" | "warning";
  message: string;
  duration?: number;
}

export interface ChangelogEntry {
  id: string;
  date: string;
  version: string;
  title: string;
  items: string[];
  type: "feature" | "fix" | "improvement" | "breaking";
}
