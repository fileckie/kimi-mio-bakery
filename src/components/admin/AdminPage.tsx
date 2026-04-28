import { useEffect, useState } from "react";
import { ReceiptText, Sparkles } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { useUIStore } from "../../stores/uiStore";
import { AdminHeader } from "./AdminHeader";
import { AdminDashboard } from "./AdminDashboard";
import { OrdersPanel } from "./OrdersPanel";
import { ProductsPanel } from "./ProductsPanel";
import { SettingsPanel } from "./SettingsPanel";
import { MembersPanel } from "./MembersPanel";
import { ProductionPanel } from "./ProductionPanel";
import { ChangelogDrawer } from "./ChangelogDrawer";

export function AdminPage() {
  const { products, stores, batchSale, inventory, orders, activeRole, refreshData, setRoute, refreshProductionSheets, changelog, productionSheets } = useAppStore();
  const { adminTab, setAdminTab } = useUIStore();
  const [seenCount, setSeenCount] = useState(() => {
    try { return Number(localStorage.getItem("mio_changelog_seen") || "0"); } catch { return 0; }
  });
  const hasNewChangelog = changelog.length > seenCount;
  const [showChangelog, setShowChangelog] = useState(false);

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
    { id: "production" as const, label: "生产" },
    { id: "products" as const, label: "商品库存" },
    { id: "members" as const, label: "会员" },
    ...(isHq ? [{ id: "settings" as const, label: "设置" }] : []),
  ];

  return (
    <>
      <AdminHeader stores={stores} />
      <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8 paper-texture">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-ember">{isHq ? "总部窑房" : "门店窑房"}</p>
            <h1 className="mt-2 font-brush text-4xl text-kiln sm:text-5xl">窑房运营</h1>
            <p className="mt-3 font-hand text-sm text-muted">
              {isHq ? "总部管理窑烤批次、商品、门店与入窑单。" : "门店处理本店订单、取货名单和现场收银。"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setShowChangelog(true); setSeenCount(changelog.length); try { localStorage.setItem("mio_changelog_seen", String(changelog.length)); } catch {} }}
              className="relative inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2.5 text-sm font-semibold text-kiln hover:bg-ash transition shadow-soft"
              title="更新日志"
            >
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">更新</span>
              {hasNewChangelog && (
                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-ember border-2 border-white" />
              )}
            </button>
            <button
              onClick={() => setRoute("/admin/pos")}
              className="inline-flex items-center gap-2 rounded-full bg-kiln px-5 py-3 text-sm font-semibold text-ash hover:bg-kiln-light transition shadow-soft"
            >
              <ReceiptText className="h-4 w-4" />
              进入现场收银
            </button>
          </div>
        </div>

        <div className="mt-6 -mx-5 px-5 sm:mx-0 sm:px-0 border-b border-border">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide snap-x">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id)}
                className={`relative shrink-0 snap-start px-4 py-3 text-sm font-semibold transition border-b-2 ${
                  adminTab === tab.id ? "border-kiln text-kiln" : "border-transparent text-muted hover:text-kiln"
                }`}
              >
                {tab.label}
                {tab.id === "overview" && hasNewChangelog && (
                  <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-ember" />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8">
          {adminTab === "overview" && <AdminDashboard orders={scopedOrders} stores={stores} batchSale={batchSale} productionSheets={productionSheets} products={products} />}
          {adminTab === "orders" && <OrdersPanel orders={scopedOrders} stores={stores} isHq={isHq} onUpdate={refreshData} />}
          {adminTab === "production" && <ProductionPanel orders={scopedOrders} stores={stores} isHq={isHq} batchSale={batchSale} products={products} productionSheets={productionSheets} />}
          {adminTab === "products" && <ProductsPanel products={products} inventory={inventory} stores={stores} isHq={isHq} onUpdate={refreshData} />}
          {adminTab === "members" && <MembersPanel />}
          {adminTab === "settings" && isHq && <SettingsPanel batchSale={batchSale} stores={stores} products={products} onUpdate={refreshData} />}
        </div>
      </main>

      {showChangelog && (
        <ChangelogDrawer onClose={() => setShowChangelog(false)} />
      )}
    </>
  );
}
