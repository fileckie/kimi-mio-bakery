import { useState } from "react";
import { ClipboardList, Store, Truck, Wallet, PackageCheck, TrendingUp, Flame, Clock, Lock, Printer, Unlock, Calendar } from "lucide-react";
import type { Order, StoreLocation, BatchSale, Product, ProductionSheet } from "../../types";
import { useAppStore } from "../../stores/appStore";
import { ProductionSheetPrint } from "./ProductionSheetPrint";
import { PickupSheetPrint } from "./PickupSheetPrint";
import { getStoreName } from "../../lib/utils";
import { api } from "../../lib/api";

interface DashboardProps {
  orders: Order[];
  stores: StoreLocation[];
  isHq: boolean;
  batchSale?: BatchSale;
  products?: Product[];
}

export function AdminDashboard({ orders, stores, isHq, batchSale, products }: DashboardProps) {
  const { closeBatch, productionSheets } = useAppStore();
  const [closing, setClosing] = useState(false);
  const [activeSheetId, setActiveSheetId] = useState<string | null>(null);
  const [sheetDateFrom, setSheetDateFrom] = useState("");
  const [sheetDateTo, setSheetDateTo] = useState("");

  const filteredSheets = productionSheets.filter((s) => {
    const sheetDate = s.createdAt ? new Date(s.createdAt).toISOString().slice(0, 10) : "";
    return (!sheetDateFrom || sheetDate >= sheetDateFrom) && (!sheetDateTo || sheetDate <= sheetDateTo);
  });

  const totalRevenue = orders.reduce((s, o) => s + o.total, 0);
  const pickupCount = orders.filter((o) => o.deliveryMethod === "门店自提").length;
  const shippingCount = orders.filter((o) => o.deliveryMethod !== "门店自提").length;
  const productionOrders = orders.filter((o) => o.status === "待确认" || o.status === "待生产");
  const pickupOrders = orders.filter((o) => o.deliveryMethod === "门店自提" && o.status !== "已完成" && o.status !== "已发货");
  const shippingOrders = orders.filter((o) => o.deliveryMethod !== "门店自提" && o.status !== "已完成");

  const handleCloseBatch = async () => {
    setClosing(true);
    await closeBatch();
    setClosing(false);
  };

  const [reopening, setReopening] = useState(false);
  const handleReopenBatch = async () => {
    setReopening(true);
    try {
      await api.updateBatchSale({ isOpen: true });
      useAppStore.getState().refreshData();
    } catch {
      alert("重新开窑失败");
    }
    setReopening(false);
  };

  const activeSheet = productionSheets.find((s) => s.id === activeSheetId);

  // Top products
  const productSales: Record<string, { name: string; qty: number }> = {};
  orders.forEach((o) => o.items.forEach((i) => {
    if (!productSales[i.name]) productSales[i.name] = { name: i.name, qty: 0 };
    productSales[i.name].qty += i.qty;
  }));
  const topProducts = Object.values(productSales).sort((a, b) => b.qty - a.qty).slice(0, 5);

  // 按炉次分组生产清单
  const batchGroups = batchSale?.ovenBatches?.map((batch) => {
    const batchOrders = productionOrders.filter((o) =>
      o.items.some((item) => batch.productIds.includes(item.productId))
    );
    const batchItems: Record<string, number> = {};
    batchOrders.forEach((o) => {
      o.items.forEach((item) => {
        if (batch.productIds.includes(item.productId)) {
          batchItems[item.name] = (batchItems[item.name] || 0) + item.qty;
        }
      });
    });
    return { batch, items: batchItems, orders: batchOrders };
  }) || [];

  if (activeSheet && batchSale) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => setActiveSheetId(null)}
          className="print:hidden inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-kiln transition"
        >
          ← 返回概览
        </button>
        <ProductionSheetPrint sheet={activeSheet} stores={stores} batchSale={batchSale} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Batch control banner */}
      {batchSale?.isOpen && productionOrders.length > 0 && (
        <div className="rounded-2xl border border-ember/20 bg-ember/5 p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold text-kiln">窑中有 {productionOrders.length} 单待入窑</p>
            <p className="font-hand text-sm text-muted">截单后生成窑烤单，面包师按单慢火烘烤</p>
          </div>
          <button
            onClick={handleCloseBatch}
            disabled={closing}
            className="inline-flex items-center gap-2 rounded-full bg-ember px-6 py-3 text-sm font-semibold text-white hover:bg-ember-dim transition disabled:opacity-50 shadow-soft"
          >
            <Lock className="h-4 w-4" />
            {closing ? "封窑中..." : "封窑截单 · 生成窑烤单"}
          </button>
        </div>
      )}
      {!batchSale?.isOpen && (
        <div className="rounded-2xl border border-border bg-ash p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="font-semibold text-kiln">本轮已封窑</p>
            <p className="font-hand text-sm text-muted">如需临时加单，可重新开窑，顾客即可继续下单</p>
          </div>
          <button
            onClick={handleReopenBatch}
            disabled={reopening}
            className="inline-flex items-center gap-2 rounded-full bg-kiln px-6 py-3 text-sm font-semibold text-ash hover:bg-kiln-light transition disabled:opacity-50 shadow-soft"
          >
            <Unlock className="h-4 w-4" />
            {reopening ? "开窑中..." : "重新开窑"}
          </button>
        </div>
      )}

      {/* Production sheets history */}
      {productionSheets.length > 0 && (
        <div className="admin-panel">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 className="text-xl font-semibold text-kiln flex items-center gap-2">
              <Printer className="h-5 w-5 text-ember" />
              窑烤单记录
            </h2>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4 text-muted" />
              <input type="date" className="input-field py-2 text-sm w-36" value={sheetDateFrom} onChange={(e) => setSheetDateFrom(e.target.value)} />
              <span className="text-muted text-xs">-</span>
              <input type="date" className="input-field py-2 text-sm w-36" value={sheetDateTo} onChange={(e) => setSheetDateTo(e.target.value)} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredSheets.map((sheet) => (
              <button
                key={sheet.id}
                onClick={() => setActiveSheetId(sheet.id)}
                className="text-left rounded-xl border border-border bg-ash p-4 transition hover:border-kiln hover:shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-kiln">{sheet.id}</p>
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    sheet.status === "已完成" ? "bg-green-50 text-green-700" :
                    sheet.status === "已出炉" ? "bg-amber-50 text-amber-700" :
                    "bg-blue-50 text-blue-700"
                  }`}>{sheet.status}</span>
                </div>
                <p className="mt-2 text-sm text-muted">{sheet.items.length} 款 · {sheet.totalItems} 个</p>
                <p className="mt-1 text-xs text-muted">{new Date(sheet.createdAt).toLocaleString("zh-CN")}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="今日窑单" value={`${orders.length} 单`} icon={ClipboardList} />
        <MetricCard label="到店自提" value={`${pickupCount} 单`} icon={Store} />
        <MetricCard label="待配送" value={`${shippingCount} 单`} icon={Truck} />
        <MetricCard label="窑烤金额" value={`¥${totalRevenue}`} icon={Wallet} />
      </div>

      {/* Oven batch production view */}
      {batchGroups.length > 0 && (
        <div className="admin-panel">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="h-5 w-5 text-ember" />
            <h2 className="font-brush text-2xl text-kiln">炉次生产看板</h2>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {batchGroups.map((group) => (
              <div key={group.batch.id} className="rounded-xl border border-border bg-ash p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-ember" />
                    <span className="font-semibold text-kiln">{group.batch.label} · {group.batch.time}</span>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-muted">{group.orders.length} 单</span>
                </div>
                {Object.keys(group.items).length === 0 ? (
                  <p className="mt-3 font-hand text-sm text-muted">暂无预订</p>
                ) : (
                  <div className="mt-3 space-y-2">
                    {Object.entries(group.items).map(([name, qty]) => (
                      <div key={name} className="flex items-center justify-between text-sm">
                        <span className="text-kiln">{name}</span>
                        <span className="font-bold text-ember">{qty} 个</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pickup sheets */}
      <PickupSheetPrint orders={orders} stores={stores} />

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="admin-panel lg:col-span-2">
          <h2 className="font-brush text-2xl text-kiln">待入窑清单</h2>
          <p className="mt-1 font-hand text-sm text-muted">{isHq ? "总部看全部待入窑订单" : "本店待入窑订单"}</p>
          <div className="mt-4 space-y-3 max-h-96 overflow-y-auto">
            {productionOrders.length === 0 ? (
              <p className="rounded-xl bg-ash p-4 font-hand text-sm text-muted">暂无待入窑订单</p>
            ) : (
              productionOrders.map((o) => (
                <div key={o.id} className="rounded-xl border border-border bg-ash p-4 hover:border-kiln/20 transition">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-kiln">{o.id} <span className="text-muted text-sm font-normal">取货码 {o.pickupCode}</span></p>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800">{o.status}</span>
                  </div>
                  <p className="mt-2 text-sm text-muted">{o.items.map((i) => `${i.name} × ${i.qty}`).join(" / ")}</p>
                  <p className="mt-1 text-xs text-muted">{getStoreName(stores, o.pickupStoreId)} · {o.createdAt}</p>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="admin-panel">
          <h2 className="font-brush text-2xl text-kiln flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-ember" />
            窑火热门
          </h2>
          <div className="mt-4 space-y-3">
            {topProducts.length === 0 ? (
              <p className="font-hand text-sm text-muted">暂无数据</p>
            ) : (
              topProducts.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${i === 0 ? "bg-ember text-white" : "bg-ash text-kiln"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-kiln truncate">{p.name}</span>
                      <span className="text-muted">{p.qty} 个</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-ash overflow-hidden">
                      <div className="h-full rounded-full bg-ember transition-all" style={{ width: `${Math.min(100, (p.qty / (topProducts[0]?.qty || 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pickup & Shipping */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="admin-panel">
          <h2 className="font-brush text-2xl text-kiln">取货名单</h2>
          <p className="mt-1 font-hand text-sm text-muted">{isHq ? "全部门店待取货" : "本店待取货"}</p>
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
            {pickupOrders.length === 0 ? <p className="font-hand text-sm text-muted">暂无待自提</p> : pickupOrders.map((o) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl border border-border bg-ash p-4 hover:border-kiln/20 transition">
                <div>
                  <p className="font-semibold text-sm text-kiln">{o.customerName || "顾客"} · <span className="font-mono text-ember">{o.pickupCode}</span></p>
                  <p className="text-xs text-muted mt-1">{o.items.map((i) => `${i.name} × ${i.qty}`).join(" / ")}</p>
                </div>
                <PackageCheck className="h-5 w-5 text-muted" />
              </div>
            ))}
          </div>
        </div>
        <div className="admin-panel">
          <h2 className="font-brush text-2xl text-kiln">配送队列</h2>
          <p className="mt-1 font-hand text-sm text-muted">快递和同城配送订单</p>
          <div className="mt-4 space-y-3 max-h-80 overflow-y-auto">
            {shippingOrders.length === 0 ? <p className="font-hand text-sm text-muted">暂无待发货</p> : shippingOrders.map((o) => (
              <div key={o.id} className="rounded-xl border border-border bg-ash p-4 hover:border-kiln/20 transition">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-kiln">{o.id}</p>
                  <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-purple-800">{o.status}</span>
                </div>
                <p className="text-xs text-muted mt-1">{o.receiver} · {o.phone} · ¥{o.total}</p>
                <p className="text-xs text-muted mt-1 truncate">{o.address}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof ClipboardList }) {
  return (
    <div className="rounded-2xl border border-border bg-white p-5 shadow-soft transition hover:shadow-card">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
        <Icon className="h-5 w-5 text-ember" />
      </div>
      <p className="mt-3 text-3xl font-semibold text-kiln">{value}</p>
    </div>
  );
}
