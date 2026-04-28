import { useState } from "react";
import { Search, CheckSquare, Square, ArrowRight, Download, Calendar, Filter, ChevronDown, ChevronUp, Printer, Receipt, LayoutDashboard, List } from "lucide-react";
import type { Order, StoreLocation, OrderStatus } from "../../types";
import { api } from "../../lib/api";
import { getStoreName } from "../../lib/utils";
import { useUIStore } from "../../stores/uiStore";
import { OrderKanbanView } from "./OrderKanbanView";

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
  "已取消": "bg-stone-100 text-stone-500",
};

export function OrdersPanel({ orders, stores, isHq, onUpdate }: OrdersPanelProps) {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = orders.filter((o) => {
    const matchesSearch = !filter || o.id.includes(filter) || (o.customerName || "").includes(filter) || (o.pickupCode || "").includes(filter);
    const matchesStatus = statusFilter === "all" || o.status === statusFilter;
    const orderDate = (() => {
      if (!o.createdAt) return "";
      const d = new Date(o.createdAt);
      if (isNaN(d.getTime())) return "";
      return d.toISOString().slice(0, 10);
    })();
    const matchesDate = (!dateFrom || orderDate >= dateFrom) && (!dateTo || orderDate <= dateTo);
    return matchesSearch && matchesStatus && matchesDate;
  });

  const printOrders = () => {
    if (filtered.length === 0) {
      alert("当前筛选条件下没有订单可打印");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const rows = filtered.map((o) => `
      <tr>
        <td>${o.id}</td>
        <td>${o.customerName || o.receiver || "-"}<br/><span style="font-size:11px;color:#7A6E62">${o.customerPhone || o.phone || ""}</span></td>
        <td>${o.items.map((i) => `${i.name}×${i.qty}`).join(" / ")}</td>
        <td>${o.deliveryMethod}</td>
        <td style="text-align:right;font-weight:600;">¥${o.total}</td>
      </tr>
    `).join("");

    printWindow.document.write(`
      <html><head><title>订单清单</title>
      <link href="https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&family=Long+Cang&display=swap" rel="stylesheet">
      <style>
        @page { margin: 8mm; size: A4 portrait; }
        * { box-sizing: border-box; }
        body { font-family: Inter, sans-serif; padding: 10px 14px; color: #1E1712; background: #FAF6F0; margin: 0; }
        .header { text-align: center; border-bottom: 2px solid #1E1712; padding-bottom: 8px; margin-bottom: 10px; }
        h1 { margin: 0; font-family: 'Zhi Mang Xing', cursive; font-size: 24px; color: #1E1712; }
        .meta { font-family: 'Long Cang', cursive; color: #7A6E62; font-size: 13px; margin-top: 4px; }
        table { width: 100%; border-collapse: collapse; font-size: 12px; }
        th { text-align: left; border-bottom: 2px solid #1E1712; padding: 4px 2px; font-size: 11px; font-weight: 600; }
        td { padding: 5px 2px; border-bottom: 1px solid #E2D5C5; vertical-align: top; }
        tr { page-break-inside: avoid; }
        .total { font-weight: bold; font-size: 14px; margin-top: 8px; border-top: 2px solid #1E1712; padding-top: 6px; display: flex; justify-content: space-between; }
      </style></head><body>
      <div class="header">
        <h1>Mio 窑烤订单清单</h1>
        <div class="meta">共 ${filtered.length} 单 · 金额 ¥${filtered.reduce((s, o) => s + o.total, 0)}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>订单号</th>
            <th>顾客</th>
            <th>商品</th>
            <th>配送</th>
            <th style="text-align:right">金额</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
      </table>
      <div class="total">
        <span>合计 ${filtered.length} 单</span>
        <span>¥${filtered.reduce((s, o) => s + o.total, 0)}</span>
      </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const printTickets = () => {
    const validOrders = filtered.filter((o) => o.status !== "已取消");
    if (validOrders.length === 0) {
      alert("当前筛选条件下没有可打印的订单");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const tickets = validOrders.map((o) => {
      const storeName = stores.find((s) => s.id === o.pickupStoreId)?.name || o.pickupStoreId || "-";
      const itemsHtml = o.items.map((i) => `<div style="display:flex;justify-content:space-between;font-size:12px;padding:2px 0;"><span>${i.name}</span><span>×${i.qty}</span></div>`).join("");
      const pickupCode = o.pickupCode || o.id.slice(-6).toUpperCase();
      return `
        <div class="ticket">
          <div style="text-align:center;margin-bottom:6px;">
            <div style="font-family:'Zhi Mang Xing',cursive;font-size:20px;color:#1E1712;">Mio 窑烤</div>
            <div style="font-size:10px;color:#7A6E62;margin-top:2px;">${new Date().toLocaleDateString("zh-CN")} · ${o.deliveryMethod}</div>
          </div>
          <div style="border-top:1px dashed #E2D5C5;border-bottom:1px dashed #E2D5C5;padding:8px 0;margin:6px 0;">
            <div style="display:flex;justify-content:space-between;font-size:11px;color:#7A6E62;margin-bottom:4px;">
              <span>订单 ${o.id.slice(-8).toUpperCase()}</span>
              <span>${storeName}</span>
            </div>
            <div style="text-align:center;font-size:28px;font-weight:bold;color:#E84A2E;letter-spacing:2px;font-family:monospace;padding:4px 0;">
              ${pickupCode}
            </div>
            <div style="text-align:center;font-size:10px;color:#7A6E62;">取货暗号</div>
          </div>
          <div style="margin:6px 0;">
            <div style="font-size:11px;font-weight:600;color:#1E1712;margin-bottom:4px;">商品明细</div>
            ${itemsHtml}
          </div>
          <div style="border-top:1px dashed #E2D5C5;padding-top:6px;margin-top:6px;display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:11px;color:#7A6E62;">${o.customerName || o.receiver || "顾客"}</span>
            <span style="font-size:14px;font-weight:bold;color:#1E1712;">¥${o.total}</span>
          </div>
        </div>
        <div class="cut-line"></div>
      `;
    }).join("");

    printWindow.document.write(`
      <html><head><title>顾客小票</title>
      <link href="https://fonts.googleapis.com/css2?family=Zhi+Mang+Xing&display=swap" rel="stylesheet">
      <style>
        @page { margin: 0; size: 80mm auto; }
        * { box-sizing: border-box; }
        body { font-family: Inter, 'PingFang SC', sans-serif; margin: 0; padding: 4mm; color: #1E1712; background: #fff; width: 80mm; }
        .ticket { padding: 4mm 2mm; }
        .cut-line { border-top: 2px dashed #ccc; margin: 2mm 0; page-break-after: always; }
        .ticket:last-of-type + .cut-line { display: none; }
      </style></head><body>
      ${tickets}
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const exportCsv = () => {
    if (filtered.length === 0) {
      alert("当前筛选条件下没有订单可导出");
      return;
    }
    const rows = filtered.map((o) => ({
      订单号: o.id,
      时间: o.createdAt,
      顾客: o.customerName || o.receiver || "未登记",
      手机: o.customerPhone || o.phone || "-",
      商品: o.items.map((i) => `${i.name}×${i.qty}`).join(" / "),
      配送: o.deliveryMethod,
      状态: o.status,
      门店: stores.find((s) => s.id === o.pickupStoreId)?.name || o.pickupStoreId,
      金额: o.total,
    }));
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String((r as Record<string, unknown>)[h]).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `窑烤订单_${dateFrom || "全部"}_${dateTo || "全部"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

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
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-full border border-border bg-white p-1 shadow-soft">
            <button
              onClick={() => setViewMode("kanban")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${viewMode === "kanban" ? "bg-kiln text-ash" : "text-muted hover:text-kiln"}`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              工作流
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${viewMode === "list" ? "bg-kiln text-ash" : "text-muted hover:text-kiln"}`}
            >
              <List className="h-3.5 w-3.5" />
              列表
            </button>
          </div>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-3 py-2 text-sm font-semibold text-kiln hover:bg-ash transition shadow-soft sm:hidden"
          >
            <Filter className="h-4 w-4" />
            筛选
          </button>
          {isHq && (
            <button
              onClick={exportCsv}
              className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-kiln hover:bg-ash transition shadow-soft"
            >
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">导出 CSV</span>
            </button>
          )}
          <button
            onClick={printOrders}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-kiln hover:bg-ash transition shadow-soft"
          >
            <Printer className="h-4 w-4" />
            <span className="hidden sm:inline">打印</span>
          </button>
          <button
            onClick={printTickets}
            className="inline-flex items-center gap-1.5 rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white hover:bg-ember/90 transition shadow-soft"
          >
            <Receipt className="h-4 w-4" />
            <span className="hidden sm:inline">顾客小票</span>
          </button>
        </div>
      </div>

      {/* Kanban view */}
      {viewMode === "kanban" && (
        <div className="mt-4">
          <OrderKanbanView orders={orders} stores={stores} onUpdate={onUpdate} />
        </div>
      )}

      {/* List view */}
      {viewMode === "list" && (
        <>
      {/* Filters — collapsed on mobile by default */}
      <div className={`mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-2 ${showFilters ? "" : "hidden sm:flex"}`}>
        <div className="relative flex-1 sm:flex-initial">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input-field pl-9 py-2 text-sm w-full sm:w-56" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="搜索订单/顾客/取货码" />
        </div>
        <select className="input-field py-2 text-sm w-full sm:w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">全部状态</option>
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4 text-muted shrink-0" />
          <input type="date" className="input-field py-2 text-sm flex-1 sm:w-36" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <span className="text-muted text-xs shrink-0">-</span>
          <input type="date" className="input-field py-2 text-sm flex-1 sm:w-36" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
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

      {/* Desktop table */}
      <div className="hidden sm:mt-5 sm:block overflow-x-auto table-scroll-hint">
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

      {/* Mobile card list */}
      <div className="mt-4 grid gap-3 sm:hidden">
        {filtered.map((order) => (
          <MobileOrderCard
            key={order.id}
            order={order}
            stores={stores}
            selected={selected.has(order.id)}
            onToggleSelect={() => toggleSelect(order.id)}
            onUpdateStatus={(status) => updateStatus(order.id, status)}
          />
        ))}
        {filtered.length === 0 && <p className="py-8 text-center font-hand text-muted">没有找到订单</p>}
      </div>
        </>
      )}
    </div>
  );
}

function MobileOrderCard({
  order,
  stores,
  selected,
  onToggleSelect,
  onUpdateStatus,
}: {
  order: Order;
  stores: StoreLocation[];
  selected: boolean;
  onToggleSelect: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={`rounded-xl border bg-white p-4 shadow-soft transition ${selected ? "border-kiln ring-1 ring-kiln/10" : "border-border"}`}>
      <div className="flex items-start gap-3">
        <button onClick={onToggleSelect} className="mt-0.5 text-muted hover:text-kiln transition shrink-0">
          {selected ? <CheckSquare className="h-5 w-5 text-kiln" /> : <Square className="h-5 w-5" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <span className="font-semibold text-kiln text-sm">{order.id}</span>
            <span className="font-mono text-xs text-ember font-bold">{order.pickupCode}</span>
          </div>
          <p className="text-xs text-muted mt-0.5">{order.createdAt} · {getStoreName(stores, order.pickupStoreId)}</p>
          <p className="text-sm text-kiln mt-1 truncate">{order.customerName || order.receiver || "未登记"} · {order.customerPhone || order.phone || "-"}</p>
          <p className="text-xs text-muted mt-1 truncate">{order.items.map((i) => `${i.name}×${i.qty}`).join(" / ")}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-kiln">¥{order.total}</p>
          <p className="text-[11px] text-muted">{order.deliveryMethod}</p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <select
          value={order.status}
          onChange={(e) => onUpdateStatus(e.target.value as OrderStatus)}
          className={`rounded-full border-0 px-3 py-1.5 text-xs font-semibold outline-none cursor-pointer ${statusStyles[order.status]}`}
        >
          {statusOptions.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1 text-xs text-muted hover:text-kiln transition"
        >
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {expanded ? "收起" : "详情"}
        </button>
      </div>

      {expanded && (
        <div className="mt-3 rounded-lg bg-ash p-3 space-y-1.5 text-xs">
          <div className="flex justify-between"><span className="text-muted">商品小计</span><span className="text-kiln">¥{order.subtotal}</span></div>
          <div className="flex justify-between"><span className="text-muted">运费</span><span className="text-kiln">{order.shippingFee === 0 ? "免运费" : `¥${order.shippingFee}`}</span></div>
          {order.address && <p className="text-muted pt-1 border-t border-border/50">{order.address}</p>}
        </div>
      )}
    </div>
  );
}
