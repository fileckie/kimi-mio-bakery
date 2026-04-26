import { X, BadgeCheck, Download } from "lucide-react";
import type { Order, StoreLocation } from "../../types";
import { getStoreName } from "../../lib/utils";

interface Props {
  order: Order;
  stores: StoreLocation[];
  onClose: () => void;
}

export function OrderSuccessModal({ order, stores, onClose }: Props) {
  const saveImage = () => {
    const canvas = document.createElement("canvas");
    canvas.width = 600;
    canvas.height = 700;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "#FAF6F0";
    ctx.fillRect(0, 0, 600, 700);

    ctx.fillStyle = "#1E1712";
    ctx.textAlign = "center";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("Mio", 300, 70);
    ctx.font = "italic 16px serif";
    ctx.fillStyle = "#7A6E62";
    ctx.fillText("SLOWFIRE — 慢火窑烤", 300, 95);

    ctx.strokeStyle = "#E2D5C5";
    ctx.beginPath(); ctx.moveTo(40, 120); ctx.lineTo(560, 120); ctx.stroke();

    let y = 160;
    ctx.textAlign = "left";
    ctx.fillStyle = "#7A6E62"; ctx.font = "13px sans-serif";
    ctx.fillText(`订单号: ${order.id}`, 40, y); y += 28;
    ctx.fillText(`下单时间: ${order.createdAt}`, 40, y); y += 40;

    ctx.fillStyle = "#1E1712"; ctx.font = "16px sans-serif";
    order.items.forEach((item) => {
      ctx.textAlign = "left"; ctx.fillText(item.name, 40, y);
      ctx.textAlign = "right"; ctx.fillText(`¥${item.price} × ${item.qty}`, 560, y);
      y += 32;
    });

    y += 20;
    ctx.strokeStyle = "#E2D5C5"; ctx.beginPath(); ctx.moveTo(40, y); ctx.lineTo(560, y); ctx.stroke();
    y += 35;
    ctx.textAlign = "right"; ctx.font = "bold 22px sans-serif"; ctx.fillStyle = "#1E1712";
    ctx.fillText(`合计 ¥${order.total}`, 560, y);

    y += 50;
    ctx.textAlign = "left"; ctx.font = "14px sans-serif"; ctx.fillStyle = "#7A6E62";
    ctx.fillText(`取货门店: ${getStoreName(stores, order.pickupStoreId)}`, 40, y); y += 26;
    ctx.fillText(`配送方式: ${order.deliveryMethod}`, 40, y); y += 26;
    if (order.pickupCode) ctx.fillText(`取货暗号: ${order.pickupCode}`, 40, y);

    y += 60;
    ctx.textAlign = "center"; ctx.fillStyle = "#E84A2E"; ctx.font = "italic 18px serif";
    ctx.fillText("面团已入单，窑火为你而燃", 300, y);

    const link = document.createElement("a");
    link.download = `Mio-订单-${order.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-kiln/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-elevated animate-slide-up">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <BadgeCheck className="h-6 w-6 text-green-600" />
            </span>
            <h2 className="text-xl font-semibold text-kiln">预订成功</h2>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface hover:bg-kiln hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-6 space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-muted">订单号</span><span className="font-mono font-semibold text-kiln">{order.id}</span></div>
          {order.items.map((i) => (
            <div key={i.productId} className="flex justify-between">
              <span className="text-kiln">{i.name} <span className="text-muted">× {i.qty}</span></span>
              <span className="font-semibold text-kiln">¥{i.qty * i.price}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3">
            <span className="font-semibold text-kiln">合计</span>
            <span className="text-xl font-bold text-ember">¥{order.total}</span>
          </div>
          <div className="pt-2 text-muted">
            <p>{getStoreName(stores, order.pickupStoreId)} · {order.deliveryMethod}</p>
            {order.pickupCode && <p className="mt-1">取货暗号 <span className="font-mono font-bold text-kiln">{order.pickupCode}</span></p>}
          </div>
        </div>

        <p className="mt-5 font-brush text-center text-xl text-ember">
          面团已入单，窑火为你而燃
        </p>

        <button onClick={saveImage} className="mt-5 w-full rounded-full bg-kiln py-3 text-sm font-semibold text-ash hover:bg-kiln-light transition flex items-center justify-center gap-2">
          <Download className="h-4 w-4" />保存窑烤凭证
        </button>
        <button onClick={onClose} className="mt-3 w-full rounded-full bg-surface py-3 text-sm font-semibold text-kiln hover:bg-ash transition">
          继续浏览
        </button>
      </div>
    </div>
  );
}
