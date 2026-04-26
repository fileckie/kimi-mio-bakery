import { useEffect } from "react";
import { ReceiptText } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { useUIStore } from "../../stores/uiStore";
import { AdminHeader } from "./AdminHeader";
import { AdminDashboard } from "./AdminDashboard";
import { OrdersPanel } from "./OrdersPanel";
import { ProductsPanel } from "./ProductsPanel";
import { InventoryPanel } from "./InventoryPanel";
import { SettingsPanel } from "./SettingsPanel";
import { MembersPanel } from "./MembersPanel";

export function AdminPage() {
  const { products, stores, batchSale, inventory, orders, activeRole, refreshData, setRoute, refreshProductionSheets } = useAppStore();
  const { adminTab, setAdminTab } = useUIStore();

  useEffect(() => {
    refreshProductionSheets();
  }, []);
  const isHq = activeRole === "hq";

  const activeStoreId = activeRole === "hq" ? "store-a" : activeRole;
  const scopedOrders = isHq
    ? orders
    : orders.filter((o) => o.pickupStoreId === activeStoreId || o.sourceStoreId === activeStoreId);

  const tabs = [
    { id: "overview" as const, label: "概览" },
    { id: "orders" as const, label: "订单" },
    { id: "members" as const, label: "会员" },
    { id: "products" as const, label: "商品" },
    { id: "inventory" as const, label: "库存" },
    { id: "settings" as const, label: "设置" },
  ];

  return (
    <>
      <AdminHeader stores={stores} />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ember">{isHq ? "总部窑房" : "门店窑房"}</p>
            <h1 className="mt-2 font-brush text-4xl text-kiln sm:text-5xl">窑房运营</h1>
            <p className="mt-3 font-hand text-sm text-muted">
              {isHq ? "总部管理窑烤批次、商品、门店与入窑单。" : "门店处理本店订单、取货名单和现场收银。"}
            </p>
          </div>
          <button
            onClick={() => setRoute("/admin/pos")}
            className="inline-flex items-center gap-2 rounded-full bg-kiln px-5 py-3 text-sm font-semibold text-ash hover:bg-kiln-light transition shadow-soft"
          >
            <ReceiptText className="h-4 w-4" />
            进入现场收银
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-1 border-b border-border">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setAdminTab(tab.id)}
              className={`px-5 py-3 text-sm font-semibold transition border-b-2 ${
                adminTab === tab.id ? "border-kiln text-kiln" : "border-transparent text-muted hover:text-kiln"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          {adminTab === "overview" && <AdminDashboard orders={scopedOrders} stores={stores} isHq={isHq} batchSale={batchSale} products={products} />}
          {adminTab === "orders" && <OrdersPanel orders={scopedOrders} stores={stores} isHq={isHq} onUpdate={refreshData} />}
          {adminTab === "members" && <MembersPanel />}
          {adminTab === "products" && <ProductsPanel products={products} inventory={inventory} stores={stores} isHq={isHq} onUpdate={refreshData} />}
          {adminTab === "inventory" && <InventoryPanel products={products} inventory={inventory} stores={stores} isHq={isHq} onUpdate={refreshData} />}
          {adminTab === "settings" && isHq && <SettingsPanel batchSale={batchSale} stores={stores} products={products} onUpdate={refreshData} />}
          {adminTab === "settings" && !isHq && (
            <div className="admin-panel text-center py-12">
              <p className="font-brush text-xl text-muted">门店账号无设置权限</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
