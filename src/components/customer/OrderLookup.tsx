import { useState } from "react";
import { Search } from "lucide-react";
import type { Order, StoreLocation } from "../../types";
import { api } from "../../lib/api";
import { getStoreName } from "../../lib/utils";

interface OrderLookupProps {
  stores: StoreLocation[];
}

const statusStyles: Record<Order["status"], string> = {
  "待确认": "bg-amber-50 text-amber-800",
  "待生产": "bg-orange-50 text-orange-800",
  "待自提": "bg-blue-50 text-blue-800",
  "待发货": "bg-purple-50 text-purple-800",
  "已发货": "bg-sky-50 text-sky-800",
  "已完成": "bg-green-50 text-green-800",
};

const statusLabels: Record<Order["status"], string> = {
  "待确认": "订单已收到，等待确认",
  "待生产": "已入生产单，窑火准备中",
  "待自提": "已出炉，等待到店领取",
  "待发货": "已出炉，等待配送",
  "已发货": "配送中",
  "已完成": "已完成",
};

export function OrderLookup({ stores }: OrderLookupProps) {
  const [code, setCode] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const lookup = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    setOrder(null);
    try {
      const result = await api.lookupOrder(code.trim());
      setOrder(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "未找到订单");
    }
    setLoading(false);
  };

  const progressSteps = ["待确认", "待生产", "待自提", "已完成"];

  return (
    <section id="order-lookup" className="border-y border-border bg-ash py-16 paper-texture">
      <div className="mx-auto grid max-w-7xl gap-8 px-5 sm:px-8 lg:grid-cols-[.8fr_1.2fr]">
        <div>
          <p className="text-sm font-semibold text-ember">订单追踪</p>
          <h2 className="mt-2 text-3xl font-semibold text-kiln">查询你的窑烤订单</h2>
          <p className="mt-3 font-hand text-sm text-muted">
            输入订单号或 6 位取货暗号，查看面包从面团到出炉的进度。
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-white p-5 shadow-soft">
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input className="input-field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="订单号或取货暗号" onKeyDown={(e) => e.key === "Enter" && lookup()} />
            <button onClick={lookup} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-full bg-kiln px-6 py-3 text-sm font-semibold text-ash hover:bg-kiln-light transition disabled:opacity-50">
              <Search className="h-4 w-4" />
              {loading ? "查询中..." : "查询"}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-ember">{error}</p>}
          {order && (
            <div className="mt-5 rounded-xl border border-border bg-ash p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-semibold text-kiln">订单 {order.id}</p>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>{order.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{statusLabels[order.status]}</p>
              <p className="mt-2 text-sm text-muted">
                取货暗号 <span className="font-mono font-bold text-kiln">{order.pickupCode}</span> · {getStoreName(stores, order.pickupStoreId)} · ¥{order.total}
              </p>
              <div className="mt-3 space-y-1 text-sm text-kiln/70">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex justify-between">
                    <span>{item.name} × {item.qty}</span>
                    <span>¥{item.qty * item.price}</span>
                  </div>
                ))}
              </div>
              {/* Progress bar */}
              <div className="mt-5">
                <div className="flex justify-between text-xs text-muted mb-2">
                  {progressSteps.map((s, i, arr) => {
                    const stepIndex = arr.indexOf(order.status);
                    const isActive = i <= stepIndex;
                    return <span key={s} className={isActive ? "font-semibold text-kiln" : ""}>{s}</span>;
                  })}
                </div>
                <div className="h-2 rounded-full bg-border overflow-hidden">
                  <div className="h-full rounded-full bg-ember transition-all duration-700" style={{
                    width: `${(() => {
                      const idx = progressSteps.indexOf(order.status);
                      return idx >= 0 ? ((idx + 1) / progressSteps.length) * 100 : 0;
                    })()}%`,
                  }} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
