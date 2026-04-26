import { useState, useEffect } from "react";
import { X, Package, Clock } from "lucide-react";
import type { Order } from "../../types";
import { api } from "../../lib/api";
import { useAuthStore } from "../../stores/authStore";

const statusStyles: Record<Order["status"], string> = {
  "待确认": "bg-amber-50 text-amber-800",
  "待生产": "bg-orange-50 text-orange-800",
  "待自提": "bg-blue-50 text-blue-800",
  "待发货": "bg-purple-50 text-purple-800",
  "已发货": "bg-sky-50 text-sky-800",
  "已完成": "bg-green-50 text-green-800",
};

const statusLabels: Record<Order["status"], string> = {
  "待确认": "订单已收到",
  "待生产": "已入生产单",
  "待自提": "已出炉，待领取",
  "待发货": "已出炉，待配送",
  "已发货": "配送中",
  "已完成": "已完成",
};

interface Props {
  open: boolean;
  onClose: () => void;
}

export function MyOrdersDrawer({ open, onClose }: Props) {
  const { customer } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !customer) return;
    setLoading(true);
    api.getCustomerOrders(customer.id)
      .then(setOrders)
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [open, customer]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] lg:hidden animate-fade-in">
      <div className="absolute inset-0 bg-kiln/30 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white shadow-elevated animate-slide-from-bottom overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-border px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-ember" />
            <h2 className="font-brush text-xl text-kiln">我的窑烤</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface hover:bg-kiln hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {!customer ? (
            <div className="text-center py-12">
              <p className="font-hand text-muted">请先登录查看订单</p>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <p className="font-hand text-muted">加载中...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-10 w-10 text-clay mx-auto" />
              <p className="mt-4 font-brush text-lg text-kiln">还没有订单</p>
              <p className="mt-1 font-hand text-sm text-muted">去挑几款喜欢的面包吧</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="rounded-2xl border border-border bg-ash p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-semibold text-kiln">{order.id}</span>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>{order.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{statusLabels[order.status]}</p>
                  <div className="mt-3 space-y-1 text-sm text-kiln/80">
                    {order.items.map((item) => (
                      <div key={item.productId} className="flex justify-between">
                        <span>{item.name} × {item.qty}</span>
                        <span>¥{item.qty * item.price}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
                    <span className="text-xs text-muted">{order.createdAt}</span>
                    <span className="font-bold text-ember">¥{order.total}</span>
                  </div>
                  {order.pickupCode && (
                    <p className="mt-2 text-xs">
                      取货暗号 <span className="font-mono font-bold text-kiln">{order.pickupCode}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
