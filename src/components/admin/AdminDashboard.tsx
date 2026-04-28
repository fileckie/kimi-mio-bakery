import { useState } from "react";
import {
  LayoutDashboard,
  Clock,
  Flame,
  PackageCheck,
  Truck,
  CheckCircle,
  RefreshCw,
  ReceiptText,
  ArrowRight,
} from "lucide-react";
import { CountUp } from "../ui/CountUp";
import { useUIStore } from "../../stores/uiStore";
import { useAppStore } from "../../stores/appStore";
import type { Order, StoreLocation, BatchSale, Product, ProductionSheet } from "../../types";

interface Props {
  orders: Order[];
  stores: StoreLocation[];
  batchSale?: BatchSale;
  productionSheets: ProductionSheet[];
  products: Product[];
}

const iconButton =
  "inline-flex items-center gap-2 rounded-full bg-white border border-border text-sm font-semibold text-kiln px-5 py-2.5 transition hover:bg-kiln hover:text-white active:scale-95";

export function AdminDashboard({ orders, stores, batchSale, productionSheets, products }: Props) {
  const { setAdminTab } = useUIStore();
  const setRoute = useAppStore((s) => s.setRoute);
  const [updating, setUpdating] = useState(false);

  const todayStr = new Date().toISOString().slice(0, 10);
  const safeDate = (str?: string) => {
    if (!str) return "";
    const d = new Date(str);
    if (isNaN(d.getTime())) return "";
    return d.toISOString().slice(0, 10);
  };
  const isToday = (d?: string) => safeDate(d) === todayStr;

  const pending = orders.filter((o) => o.status === "待确认");
  const producing = orders.filter((o) => o.status === "待生产");
  const ready = orders.filter((o) => o.status === "待自提");
  const shipping = orders.filter((o) => o.status === "待发货");
  const completed = orders.filter((o) => o.status === "已完成");

  const currentSheet = productionSheets[0];

  const workflows = [
    { status: "待确认" as const, label: "待确认", count: pending.length, color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
    { status: "待生产" as const, label: "待生产", count: producing.length, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200", icon: Flame },
    { status: "待自提" as const, label: "待自提", count: ready.length, color: "text-blue-700", bg: "bg-blue-50", border: "border-blue-200", icon: PackageCheck },
    { status: "待发货" as const, label: "待发货", count: shipping.length, color: "text-purple-700", bg: "bg-purple-50", border: "border-purple-200", icon: Truck },
    { status: "已完成" as const, label: "今日完成", count: completed.filter((o) => isToday(o.createdAt)).length, color: "text-green-700", bg: "bg-green-50", border: "border-green-200", icon: CheckCircle },
  ];

  const goToOrders = () => setAdminTab("orders");

  const closeBatchNow = async () => {
    if (!confirm("封窑后，所有待确认订单将锁定为待生产，无法新增订单。确定封窑？")) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/close-batch", { method: "POST", headers: { "content-type": "application/json" } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "封窑失败");
      alert("封窑成功！生产单已生成");
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "封窑失败");
    } finally {
      setUpdating(false);
    }
  };

  const openBatchNow = async () => {
    if (!confirm("确定开窑？开启新批次后，客户可以下单。")) return;
    setUpdating(true);
    try {
      const res = await fetch("/api/admin/batch-sale", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ isOpen: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "开窑失败");
      alert("新批次已开启");
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "开窑失败");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick actions */}
      <div className="flex flex-wrap items-center gap-3">
        {batchSale?.isOpen ? (
          <button onClick={closeBatchNow} disabled={updating} className={`${iconButton} ${updating ? "opacity-50 cursor-not-allowed" : ""}`}>
            <Flame className="h-4 w-4" />
            封窑 · 生成生产单
          </button>
        ) : (
          <button onClick={openBatchNow} disabled={updating} className={`${iconButton} ${updating ? "opacity-50 cursor-not-allowed" : ""}`}>
            <RefreshCw className="h-4 w-4" />
            开窑 · 新批次
          </button>
        )}
        <button onClick={() => setRoute("/admin/pos")} className={iconButton}>
          <ReceiptText className="h-4 w-4" />
          现场收银
        </button>
      </div>

      {/* Today workflow board */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <LayoutDashboard className="h-5 w-5 text-ember" />
          <h2 className="font-brush text-2xl text-kiln">今日运营看板</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          {workflows.map((w) => {
            const Icon = w.icon;
            return (
              <button
                key={w.status}
                onClick={goToOrders}
                className={`rounded-xl border ${w.border} ${w.bg} p-4 text-left transition hover:shadow-soft hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`h-5 w-5 ${w.color}`} />
                  {w.count > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-xs font-bold text-ember shadow-soft">
                      {w.count}
                    </span>
                  )}
                </div>
                <p className="mt-3 text-2xl font-bold text-kiln">
                  <CountUp value={w.count} />
                </p>
                <p className="mt-1 text-xs text-muted font-hand">{w.label}</p>
                {w.count > 0 && (
                  <p className="mt-2 text-[11px] font-semibold text-kiln flex items-center gap-1">
                    去处理 <ArrowRight className="h-3 w-3" />
                  </p>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Current batch info */}
      <div className="admin-panel">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-ember">当前窑次</p>
            <h2 className="mt-1 font-brush text-3xl text-kiln">
              第 {batchSale?.batchSequence || 1} 窑
            </h2>
            <p className="mt-1 font-hand text-sm text-muted">
              {batchSale?.isOpen
                ? `开窑接单中 · 截单 ${batchSale?.deadline || "21:30"} · ${products.filter((p) => p.isPublished).length} 款在售`
                : `已封窑 · 共 ${orders.length} 单 · 生产单 ${currentSheet?.id || "无"}`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs text-muted">在售商品</p>
              <p className="text-xl font-bold text-kiln">{products.filter((p) => p.isPublished).length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">今日订单</p>
              <p className="text-xl font-bold text-kiln">{orders.filter((o) => isToday(o.createdAt)).length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted">生产单</p>
              <p className="text-xl font-bold text-kiln">{productionSheets.length}</p>
            </div>
          </div>
        </div>

        {currentSheet && (
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-kiln">最新生产单 · {currentSheet.id}</p>
                <p className="text-xs text-muted">{currentSheet.status} · {currentSheet.items.length} 款 · {currentSheet.totalItems} 个</p>
              </div>
              <button onClick={() => setAdminTab("production")} className="text-sm font-semibold text-ember hover:text-ember-dim transition flex items-center gap-1">
                查看生产详情 <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
