import { useState } from "react";
import {
  Clock, Flame, PackageCheck, Truck, CheckCircle, XCircle,
  ArrowRight, Send, Search, MapPin, ChevronDown, ChevronUp,
} from "lucide-react";
import type { Order, StoreLocation, OrderStatus } from "../../types";
import { api } from "../../lib/api";
import { getStoreName } from "../../lib/utils";
import { useUIStore } from "../../stores/uiStore";

interface Props {
  orders: Order[];
  stores: StoreLocation[];
  onUpdate: () => void;
}

const statusConfig: Record<string, { label: string; color: string; bg: string; border: string; icon: typeof Clock; nextActions: { label: string; status: OrderStatus; style: string }[] }> = {
  "待确认": {
    label: "待确认",
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: Clock,
    nextActions: [
      { label: "确认订单", status: "待生产", style: "bg-kiln text-ash" },
      { label: "取消", status: "已取消", style: "bg-stone-100 text-stone-600" },
    ],
  },
  "待生产": {
    label: "待生产",
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: Flame,
    nextActions: [
      { label: "开始制作", status: "待自提", style: "bg-kiln text-ash" },
      { label: "标记为快递", status: "待发货", style: "bg-purple-100 text-purple-700" },
    ],
  },
  "待自提": {
    label: "待自提",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: PackageCheck,
    nextActions: [
      { label: "已取货", status: "已完成", style: "bg-green-600 text-white" },
    ],
  },
  "待发货": {
    label: "待发货",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: Truck,
    nextActions: [
      { label: "标记发货", status: "已发货", style: "bg-kiln text-ash" },
    ],
  },
  "已完成": {
    label: "已完成",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
    icon: CheckCircle,
    nextActions: [],
  },
};

export function OrderKanbanView({ orders, stores, onUpdate }: Props) {
  const [search, setSearch] = useState("");
  const [expandedPickup, setExpandedPickup] = useState(true);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { company: string; number: string }>>({});
  const [editingTracking, setEditingTracking] = useState<string | null>(null);
  const addToast = useUIStore((s) => s.addToast);

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(id, status);
      addToast({ type: "success", message: `订单已更新为「${status}」` });
      onUpdate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "更新失败");
    }
  };

  const saveTracking = async (id: string) => {
    const input = trackingInputs[id];
    if (!input) return;
    try {
      await api.updateOrderFulfillment(id, { shippingCompany: input.company, trackingNumber: input.number });
      addToast({ type: "success", message: "快递信息已保存" });
      setEditingTracking(null);
      onUpdate();
    } catch {
      alert("保存失败");
    }
  };

  const filteredOrders = orders.filter((o) => {
    if (!search.trim()) return true;
    const kw = search.trim().toLowerCase();
    return (
      o.id.toLowerCase().includes(kw) ||
      (o.customerName || "").toLowerCase().includes(kw) ||
      (o.phone || "").includes(kw) ||
      (o.pickupCode || "").toLowerCase().includes(kw)
    );
  });

  const columns = ["待确认", "待生产", "待自提", "待发货", "已完成"] as const;

  // Pickup summary for 待自提 column
  const pickupOrders = filteredOrders.filter((o) => o.status === "待自提");
  const pickupStores = stores.filter((s) => pickupOrders.some((o) => o.pickupStoreId === s.id));

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            className="input-field pl-9 py-2 text-sm w-full sm:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索订单/顾客/取货码"
          />
        </div>
      </div>

      {/* Kanban columns */}
      <div className="grid gap-4 lg:grid-cols-5">
        {columns.map((status) => {
          const config = statusConfig[status];
          const Icon = config.icon;
          const columnOrders = filteredOrders.filter((o) => o.status === status);

          return (
            <div key={status} className={`rounded-xl border ${config.border} ${config.bg} p-3 flex flex-col min-h-[200px]`}>
              {/* Column header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1.5">
                  <Icon className={`h-4 w-4 ${config.color}`} />
                  <span className={`text-sm font-semibold ${config.color}`}>{config.label}</span>
                </div>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-bold text-kiln shadow-soft">
                  {columnOrders.length}
                </span>
              </div>

              {/* Column actions */}
              {status === "待自提" && pickupOrders.length > 0 && (
                <div className="mb-3">
                  <button
                    onClick={() => setExpandedPickup(!expandedPickup)}
                    className="flex w-full items-center justify-between rounded-lg bg-white px-3 py-2 text-xs font-semibold text-kiln shadow-soft"
                  >
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-ember" />取货名单</span>
                    {expandedPickup ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  {expandedPickup && (
                    <div className="mt-2 space-y-2">
                      {pickupStores.map((store) => {
                        const storeOrders = pickupOrders.filter((o) => o.pickupStoreId === store.id);
                        const grouped = storeOrders.reduce<Record<string, number>>((acc, o) => {
                          o.items.forEach((it) => { acc[it.name] = (acc[it.name] || 0) + it.qty; });
                          return acc;
                        }, {});
                        return (
                          <div key={store.id} className="rounded-lg bg-white p-2 shadow-soft">
                            <p className="text-xs font-semibold text-kiln">{store.name} · {storeOrders.length} 单</p>
                            <div className="mt-1 space-y-0.5">
                              {Object.entries(grouped).map(([name, qty]) => (
                                <div key={name} className="flex justify-between text-[11px]">
                                  <span className="text-muted">{name}</span>
                                  <span className="font-bold text-ember">{qty}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Order cards */}
              <div className="space-y-2 flex-1">
                {columnOrders.map((order) => (
                  <KanbanCard
                    key={order.id}
                    order={order}
                    stores={stores}
                    config={config}
                    onUpdateStatus={updateStatus}
                    trackingInput={trackingInputs[order.id]}
                    isEditingTracking={editingTracking === order.id}
                    onStartEditTracking={() => {
                      setEditingTracking(order.id);
                      setTrackingInputs((prev) => ({
                        ...prev,
                        [order.id]: { company: order.shippingCompany || "", number: order.trackingNumber || "" },
                      }));
                    }}
                    onTrackingChange={(field, value) =>
                      setTrackingInputs((prev) => ({
                        ...prev,
                        [order.id]: { ...prev[order.id], [field]: value },
                      }))
                    }
                    onSaveTracking={() => saveTracking(order.id)}
                    onCancelTracking={() => setEditingTracking(null)}
                  />
                ))}
                {columnOrders.length === 0 && (
                  <p className="text-center text-xs text-muted/60 py-4 font-hand">无订单</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanCard({
  order,
  stores,
  config,
  onUpdateStatus,
  trackingInput,
  isEditingTracking,
  onStartEditTracking,
  onTrackingChange,
  onSaveTracking,
  onCancelTracking,
}: {
  order: Order;
  stores: StoreLocation[];
  config: (typeof statusConfig)["待确认"];
  onUpdateStatus: (id: string, status: OrderStatus) => void;
  trackingInput?: { company: string; number: string };
  isEditingTracking: boolean;
  onStartEditTracking: () => void;
  onTrackingChange: (field: "company" | "number", value: string) => void;
  onSaveTracking: () => void;
  onCancelTracking: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-lg bg-white p-3 shadow-soft border border-border/50">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-mono font-semibold text-kiln">{order.id.slice(-8).toUpperCase()}</span>
            {order.pickupCode && (
              <span className="text-[10px] font-mono font-bold text-ember bg-ember/10 px-1.5 py-0.5 rounded">{order.pickupCode}</span>
            )}
          </div>
          <p className="text-xs text-muted mt-0.5">{order.customerName || order.receiver || "未登记"}</p>
        </div>
        <p className="text-sm font-bold text-kiln shrink-0">¥{order.total}</p>
      </div>

      {/* Items */}
      <p className="text-[11px] text-muted mt-1.5 truncate">
        {order.items.map((i) => `${i.name}×${i.qty}`).join(" / ")}
      </p>

      {/* Delivery info */}
      <div className="flex items-center gap-1 mt-1.5">
        <span className="text-[10px] text-muted">{order.deliveryMethod}</span>
        <span className="text-[10px] text-muted">·</span>
        <span className="text-[10px] text-muted">{getStoreName(stores, order.pickupStoreId)}</span>
      </div>

      {/* Tracking editor for 待发货 */}
      {order.status === "待发货" && (
        <div className="mt-2 pt-2 border-t border-border/40">
          {isEditingTracking ? (
            <div className="space-y-1.5">
              <input
                className="input-field py-1.5 text-xs"
                value={trackingInput?.company || ""}
                onChange={(e) => onTrackingChange("company", e.target.value)}
                placeholder="快递公司"
              />
              <input
                className="input-field py-1.5 text-xs"
                value={trackingInput?.number || ""}
                onChange={(e) => onTrackingChange("number", e.target.value)}
                placeholder="快递单号"
              />
              <div className="flex gap-1.5">
                <button onClick={onSaveTracking} className="flex-1 rounded-full bg-kiln py-1.5 text-[11px] font-semibold text-ash">保存</button>
                <button onClick={onCancelTracking} className="flex-1 rounded-full bg-ash py-1.5 text-[11px] font-semibold text-muted border border-border">取消</button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              {order.trackingNumber ? (
                <span className="text-[10px] text-muted">{order.shippingCompany || "快递"}: <span className="font-mono font-semibold text-kiln">{order.trackingNumber}</span></span>
              ) : (
                <span className="text-[10px] text-muted">未填快递</span>
              )}
              <button onClick={onStartEditTracking} className="text-[10px] font-semibold text-ember hover:text-ember-dim">{order.trackingNumber ? "修改" : "填写"}</button>
            </div>
          )}
        </div>
      )}

      {/* Next actions */}
      {config.nextActions.length > 0 && (
        <div className="mt-2 pt-2 border-t border-border/40 flex flex-wrap gap-1.5">
          {config.nextActions.map((action) => (
            <button
              key={action.status}
              onClick={() => {
                if (action.status === "已取消" && !confirm("确定取消此订单？")) return;
                onUpdateStatus(order.id, action.status);
              }}
              className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[11px] font-semibold transition active:scale-95 ${action.style}`}
            >
              {action.label}
              <ArrowRight className="h-3 w-3" />
            </button>
          ))}
        </div>
      )}

      {/* Expand details */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="mt-2 w-full text-center text-[10px] text-muted hover:text-kiln transition"
      >
        {expanded ? "收起详情" : "查看详情"}
      </button>

      {expanded && (
        <div className="mt-2 space-y-1 text-[11px]">
          <p className="text-muted">手机: {order.customerPhone || order.phone || "-"}</p>
          <p className="text-muted">时间: {order.createdAt}</p>
          {order.address && <p className="text-muted">地址: {order.address}</p>}
          <div className="pt-1 border-t border-border/30">
            {order.items.map((i) => (
              <div key={i.productId} className="flex justify-between">
                <span className="text-kiln">{i.name}</span>
                <span className="text-muted">×{i.qty} · ¥{i.qty * i.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
