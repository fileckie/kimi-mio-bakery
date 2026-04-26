import { useState } from "react";
import { Search, CheckSquare, Square, ArrowRight } from "lucide-react";
import type { Order, StoreLocation, OrderStatus } from "../../types";
import { api } from "../../lib/api";
import { getStoreName } from "../../lib/utils";
import { useUIStore } from "../../stores/uiStore";

interface OrdersPanelProps {
  orders: Order[];
  stores: StoreLocation[];
  isHq: boolean;
  onUpdate: () => void;
}

const statusOptions: OrderStatus[] = ["待确认", "待生产", "待自提", "待发货", "已发货", "已完成"];
const statusStyles: Record<OrderStatus, string> = {
  "待确认": "bg-amber-50 text-amber-800",
  "待生产": "bg-orange-50 text-orange-800",
  "待自提": "bg-blue-50 text-blue-800",
  "待发货": "bg-purple-50 text-purple-800",
  "已发货": "bg-sky-50 text-sky-800",
  "已完成": "bg-green-50 text-green-800",
};

export function OrdersPanel({ orders, stores, isHq, onUpdate }: OrdersPanelProps) {
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);

  const filtered = orders.filter((o) => {
    const matchesSearch = !filter || o.id.includes(filter) || (o.customerName || "").includes(filter) || (o.pickupCode || "").includes(filter);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((o) => o.id)));
    }
  };

  const updateStatus = async (id: string, status: OrderStatus) => {
    try {
      await api.updateOrderStatus(id, status);
      onUpdate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "更新失败");
    }
  };

  const batchUpdateStatus = async (status: OrderStatus) => {
    if (selected.size === 0) return;
    setBatchLoading(true);
    try {
      await api.batchUpdateOrderStatus(Array.from(selected), status);
      useUIStore.getState().addToast({ type: "success", message: `已批量更新 ${selected.size} 个订单为「${status}」` });
      setSelected(new Set());
      onUpdate();
    } catch (e) {
      alert(e instanceof Error ? e.message : "批量更新失败");
    }
    setBatchLoading(false);
  };

  return (
    <div className="admin-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ember">订单追踪</p>
          <h2 className="mt-1 font-brush text-3xl text-kiln">窑烤订单</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input-field pl-9 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="搜索订单/顾客/取货码" />
          </div>
          <select className="input-field py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">全部状态</option>
            {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Batch action bar */}
      {selected.size > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-kiln/5 border border-kiln/10 p-3 animate-fade-in">
          <span className="text-sm font-semibold text-kiln">已选 {selected.size} 单</span>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <button
                key={s}
                onClick={() => batchUpdateStatus(s)}
                disabled={batchLoading}
                className={`press-feedback inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${statusStyles[s]} hover:opacity-80`}
              >
                <ArrowRight className="h-3 w-3" />
                改为{s}
              </button>
            ))}
          </div>
          <button onClick={() => setSelected(new Set())} className="ml-auto text-xs text-muted hover:text-kiln">
            取消选择
          </button>
        </div>
      )}

      <div className="mt-5 overflow-x-auto">
        <table className="min-w-[1000px] w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-3 pr-2">
                <button onClick={toggleAll} className="inline-flex items-center gap-1 text-xs font-medium hover:text-kiln transition">
                  {selected.size === filtered.length && filtered.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                  全选
                </button>
              </th>
              <th className="py-3 font-medium">订单</th>
              <th className="py-3 font-medium">时间</th>
              <th className="py-3 font-medium">顾客</th>
              <th className="py-3 font-medium">商品</th>
              <th className="py-3 font-medium">配送</th>
              <th className="py-3 font-medium">状态</th>
              <th className="py-3 font-medium">门店</th>
              <th className="py-3 text-right font-medium">金额</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((order) => (
              <tr key={order.id} className={`border-t border-border transition ${selected.has(order.id) ? "bg-kiln/5" : "hover:bg-ash/50"}`}>
                <td className="py-4 pr-2">
                  <button onClick={() => toggleSelect(order.id)} className="text-muted hover:text-kiln transition">
                    {selected.has(order.id) ? <CheckSquare className="h-4 w-4 text-kiln" /> : <Square className="h-4 w-4" />}
                  </button>
                </td>
                <td className="py-4 font-semibold text-kiln">{order.id}<div className="text-xs text-muted font-normal">取货码 {order.pickupCode}</div></td>
                <td className="py-4 text-muted">{order.createdAt}</td>
                <td className="py-4">
                  <span className="block font-medium text-kiln">{order.customerName || order.receiver || "未登记"}</span>
                  <span className="text-xs text-muted">{order.customerPhone || order.phone || "-"}</span>
                </td>
                <td className="py-4 text-muted max-w-[200px] truncate">{order.items.map((i) => `${i.name}×${i.qty}`).join(" / ")}</td>
                <td className="py-4 text-muted">{order.deliveryMethod}</td>
                <td className="py-4">
                  <select value={order.status} onChange={(e) => updateStatus(order.id, e.target.value as OrderStatus)} className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer ${statusStyles[order.status]}`}>
                    {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
                <td className="py-4 text-muted">{getStoreName(stores, order.pickupStoreId)}</td>
                <td className="py-4 text-right font-semibold text-kiln">¥{order.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="py-8 text-center font-hand text-muted">没有找到订单</p>}
      </div>
    </div>
  );
}
