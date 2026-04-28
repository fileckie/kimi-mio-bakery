import { useState } from "react";
import { Truck, PackageCheck, Search, Send, CheckCircle } from "lucide-react";
import type { Order, StoreLocation } from "../../types";
import { api } from "../../lib/api";
import { useUIStore } from "../../stores/uiStore";

interface Props {
  orders: Order[];
  stores: StoreLocation[];
}

export function ShippingPanel({ orders, stores }: Props) {
  const [statusFilter, setStatusFilter] = useState<"all" | "待发货" | "已发货">("all");
  const [searchKeyword, setSearchKeyword] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { company: string; number: string }>>({});
  const [updating, setUpdating] = useState<string | null>(null);

  const shippingOrders = orders.filter((o) => o.deliveryMethod !== "门店自提");

  const filteredOrders = shippingOrders.filter((o) => {
    if (statusFilter === "待发货") return o.status === "待发货";
    if (statusFilter === "已发货") return o.status === "已发货";
    return true;
  }).filter((o) => {
    if (!searchKeyword.trim()) return true;
    const kw = searchKeyword.trim().toLowerCase();
    return (
      o.id.toLowerCase().includes(kw) ||
      (o.receiver || "").toLowerCase().includes(kw) ||
      (o.phone || "").includes(kw) ||
      (o.trackingNumber || "").includes(kw)
    );
  });

  const startEdit = (o: Order) => {
    setEditingId(o.id);
    setTrackingInputs((prev) => ({
      ...prev,
      [o.id]: {
        company: o.shippingCompany || "",
        number: o.trackingNumber || "",
      },
    }));
  };

  const saveTracking = async (id: string) => {
    const input = trackingInputs[id];
    if (!input) return;
    setUpdating(id);
    try {
      await api.updateOrderFulfillment(id, {
        shippingCompany: input.company,
        trackingNumber: input.number,
      });
      useUIStore.getState().addToast({ type: "success", message: "快递信息已保存" });
      setEditingId(null);
    } catch {
      alert("保存失败");
    }
    setUpdating(null);
  };

  const markShipped = async (id: string) => {
    if (!confirm("确认标记为已发货？")) return;
    setUpdating(id);
    try {
      await api.updateOrderStatus(id, "已发货");
      useUIStore.getState().addToast({ type: "success", message: "已标记发货" });
    } catch {
      alert("操作失败");
    }
    setUpdating(null);
  };

  const statusCounts = {
    all: shippingOrders.length,
    待发货: shippingOrders.filter((o) => o.status === "待发货").length,
    已发货: shippingOrders.filter((o) => o.status === "已发货").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <Truck className="h-5 w-5 text-ember" />
          <h2 className="font-brush text-2xl text-kiln">发货管理</h2>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="搜索订单号/姓名/电话/快递单号"
            className="input-field py-2 text-sm w-64"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
          />
        </div>
      </div>

      {/* Status filters */}
      <div className="flex gap-2">
        {(["all", "待发货", "已发货"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              statusFilter === s
                ? "bg-kiln text-ash"
                : "bg-white border border-border text-muted hover:border-kiln"
            }`}
          >
            {s === "all" ? "全部" : s}
            <span className="ml-1.5 text-xs opacity-70">({statusCounts[s]})</span>
          </button>
        ))}
      </div>

      {/* Orders list */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="admin-panel text-center py-12">
            <PackageCheck className="mx-auto h-10 w-10 text-muted mb-3" />
            <p className="font-hand text-muted">暂无符合条件的配送订单</p>
          </div>
        ) : (
          filteredOrders.map((o) => (
            <div
              key={o.id}
              className="rounded-2xl border border-border bg-white p-5 shadow-soft transition hover:border-kiln/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-semibold text-kiln">{o.id}</span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        o.status === "已发货"
                          ? "bg-green-50 text-green-700"
                          : o.status === "待发货"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-stone-50 text-stone-600"
                      }`}
                    >
                      {o.status}
                    </span>
                    <span className="text-xs text-muted">{o.deliveryMethod}</span>
                  </div>
                  <div className="mt-2 text-sm text-kiln">
                    <span className="font-semibold">{o.receiver}</span>
                    <span className="ml-2 text-muted">{o.phone}</span>
                  </div>
                  <div className="mt-1 text-sm text-muted truncate">{o.address}</div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {o.items.map((it) => (
                      <span key={it.productId} className="rounded-full bg-ash px-2 py-0.5 text-xs text-muted">
                        {it.name} × {it.qty}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="sm:text-right shrink-0">
                  <p className="text-lg font-bold text-ember">¥{o.total}</p>
                  <p className="text-xs text-muted">
                    {o.createdAt}
                  </p>
                </div>
              </div>

              {/* Tracking info */}
              <div className="mt-4 pt-4 border-t border-border">
                {editingId === o.id ? (
                  <div className="flex flex-col sm:flex-row gap-3 items-start">
                    <input
                      type="text"
                      placeholder="快递公司"
                      className="input-field py-2 text-sm w-32"
                      value={trackingInputs[o.id]?.company || ""}
                      onChange={(e) =>
                        setTrackingInputs((prev) => ({
                          ...prev,
                          [o.id]: { ...prev[o.id], company: e.target.value },
                        }))
                      }
                    />
                    <input
                      type="text"
                      placeholder="快递单号"
                      className="input-field py-2 text-sm flex-1"
                      value={trackingInputs[o.id]?.number || ""}
                      onChange={(e) =>
                        setTrackingInputs((prev) => ({
                          ...prev,
                          [o.id]: { ...prev[o.id], number: e.target.value },
                        }))
                      }
                    />
                    <button
                      onClick={() => saveTracking(o.id)}
                      disabled={updating === o.id}
                      className="inline-flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition disabled:opacity-50"
                    >
                      <CheckCircle className="h-4 w-4" />
                      保存
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1.5 rounded-full bg-ash px-4 py-2 text-sm font-semibold text-muted border border-border hover:bg-stone-200 transition"
                    >
                      取消
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="text-sm">
                      {o.trackingNumber ? (
                        <div className="flex items-center gap-2">
                          <span className="text-muted">{o.shippingCompany || "快递"}:</span>
                          <span className="font-mono font-semibold text-kiln">{o.trackingNumber}</span>
                        </div>
                      ) : (
                        <span className="text-muted">未填写快递信息</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(o)}
                        className="inline-flex items-center gap-1.5 rounded-full bg-ember/10 px-3 py-1.5 text-xs font-semibold text-ember border border-ember/20 hover:bg-ember/20 transition"
                      >
                        {o.trackingNumber ? "修改快递" : "填写快递"}
                      </button>
                      {o.status === "待发货" && (
                        <button
                          onClick={() => markShipped(o.id)}
                          disabled={updating === o.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-kiln px-3 py-1.5 text-xs font-semibold text-ash hover:bg-kiln-light transition disabled:opacity-50"
                        >
                          <Send className="h-3 w-3" />
                          标记发货
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
