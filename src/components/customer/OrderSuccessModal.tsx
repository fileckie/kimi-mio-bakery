import { useState } from "react";
import { X, BadgeCheck, Download, MessageCircle, Copy, Check } from "lucide-react";
import type { Order, StoreLocation, BatchSale } from "../../types";
import { getStoreName } from "../../lib/utils";

interface Props {
  order: Order;
  stores: StoreLocation[];
  batchSale: BatchSale;
  onClose: () => void;
}

export function OrderSuccessModal({ order, stores, batchSale, onClose }: Props) {
  const [copied, setCopied] = useState(false);

  const saveImage = () => {
    const canvas = document.createElement("canvas");
    const W = 640;
    const H = 900;
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = "#FAF6F0";
    ctx.fillRect(0, 0, W, H);

    // Border frame
    ctx.strokeStyle = "#E2D5C5";
    ctx.lineWidth = 1;
    ctx.strokeRect(24, 24, W - 48, H - 48);
    ctx.strokeStyle = "#1E1712";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, W - 60, H - 60);

    // Top accent line
    ctx.fillStyle = "#E84A2E";
    ctx.fillRect(30, 30, W - 60, 4);

    // Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#1E1712";
    ctx.font = "600 28px Inter, sans-serif";
    ctx.fillText("Mio", W / 2, 80);
    ctx.fillStyle = "#7A6E62";
    ctx.font = "italic 15px Cormorant Garamond, Georgia, serif";
    ctx.fillText("SLOWFIRE — HANDCRAFTED SOURDOUGH", W / 2, 105);

    // Divider
    ctx.strokeStyle = "#E2D5C5";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(60, 130); ctx.lineTo(W - 60, 130); ctx.stroke();

    // Success badge area
    ctx.fillStyle = "#1E1712";
    ctx.font = "600 13px Inter, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText(batchSale.successTitle, W / 2, 165);
    ctx.letterSpacing = "0";

    ctx.fillStyle = "#7A6E62";
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText(`${order.id} · ${order.createdAt}`, W / 2, 190);

    // Items
    let y = 240;
    ctx.textAlign = "left";
    ctx.fillStyle = "#7A6E62";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("YOUR ORDER", 60, y);
    ctx.letterSpacing = "0";

    y += 30;
    order.items.forEach((item) => {
      ctx.fillStyle = "#1E1712";
      ctx.font = "15px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(item.name, 60, y);
      ctx.textAlign = "right";
      ctx.fillStyle = "#7A6E62";
      ctx.font = "13px Inter, sans-serif";
      ctx.fillText(`${item.qty} × ¥${item.price}`, W - 60, y);
      y += 36;
    });

    // Divider before total
    y += 10;
    ctx.strokeStyle = "#E2D5C5";
    ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 60, y); ctx.stroke();

    // Total
    y += 40;
    ctx.textAlign = "left";
    ctx.fillStyle = "#7A6E62";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("TOTAL", 60, y);
    ctx.letterSpacing = "0";
    ctx.textAlign = "right";
    ctx.fillStyle = "#E84A2E";
    ctx.font = "bold 28px Inter, sans-serif";
    ctx.fillText(`¥${order.total}`, W - 60, y);

    // Pickup info
    y += 50;
    ctx.textAlign = "left";
    ctx.fillStyle = "#7A6E62";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("PICKUP", 60, y);
    ctx.letterSpacing = "0";

    y += 28;
    ctx.fillStyle = "#1E1712";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText(getStoreName(stores, order.pickupStoreId), 60, y);
    y += 22;
    ctx.fillStyle = "#7A6E62";
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText(`${order.deliveryMethod}`, 60, y);

    if (order.pickupCode) {
      y += 30;
      ctx.fillStyle = "#7A6E62";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("CODE", 60, y);
      ctx.letterSpacing = "0";
      y += 28;
      ctx.fillStyle = "#E84A2E";
      ctx.font = "bold 22px monospace";
      ctx.fillText(order.pickupCode, 60, y);
    }

    // Bottom divider
    y = H - 140;
    ctx.strokeStyle = "#E2D5C5";
    ctx.beginPath(); ctx.moveTo(60, y); ctx.lineTo(W - 60, y); ctx.stroke();

    // Bottom message
    y += 40;
    ctx.textAlign = "center";
    ctx.fillStyle = "#1E1712";
    ctx.font = "italic 17px Cormorant Garamond, Georgia, serif";
    ctx.fillText(batchSale.successMessage, W / 2, y);

    // Seal
    y += 35;
    ctx.strokeStyle = "#E84A2E";
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - 28, y, 56, 56);
    ctx.fillStyle = "#E84A2E";
    ctx.font = "22px serif";
    ctx.fillText("窑烤", W / 2, y + 38);

    // Footer
    y = H - 40;
    ctx.fillStyle = "#A89E94";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText("Mio SLOWFIRE · 不多做，只为你烤", W / 2, y);

    const link = document.createElement("a");
    link.download = `Mio-Order-${order.id}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const copyWechat = () => {
    navigator.clipboard.writeText(batchSale.paymentWechatId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[70] bg-kiln/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-white p-8 shadow-elevated animate-slide-up relative">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ember via-wheat to-ember" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-50">
              <BadgeCheck className="h-6 w-6 text-green-600" />
            </span>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">{batchSale.successTitle}</p>
              <h2 className="text-xl font-semibold text-kiln">预订成功</h2>
            </div>
          </div>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface hover:bg-kiln hover:text-white transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Order card */}
        <div className="mt-6 rounded-2xl border border-border bg-ash p-5 space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">Order No.</span>
            <span className="font-mono font-semibold text-kiln">{order.id}</span>
          </div>
          {order.items.map((i) => (
            <div key={i.productId} className="flex justify-between">
              <span className="text-kiln">{i.name} <span className="text-muted">× {i.qty}</span></span>
              <span className="font-semibold text-kiln">¥{i.qty * i.price}</span>
            </div>
          ))}
          <div className="flex justify-between border-t border-border pt-3">
            <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">Total</span>
            <span className="text-xl font-bold text-ember">¥{order.total}</span>
          </div>
          <div className="pt-1 text-muted text-xs space-y-1">
            <p>{getStoreName(stores, order.pickupStoreId)} · {order.deliveryMethod}</p>
            {order.pickupCode && (
              <p>
                <span className="text-[10px] tracking-wider text-muted uppercase mr-1">Pickup Code</span>
                <span className="font-mono font-bold text-kiln text-lg">{order.pickupCode}</span>
              </p>
            )}
          </div>
        </div>

        {/* Payment guidance */}
        <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-center gap-2 mb-3">
            <MessageCircle className="h-5 w-5 text-amber-700" />
            <p className="text-[10px] font-semibold tracking-wider text-amber-700 uppercase">Next Step</p>
          </div>

          {batchSale.paymentQrUrl ? (
            <div className="text-center">
              <img src={batchSale.paymentQrUrl} alt="微信二维码" className="mx-auto h-40 w-40 rounded-xl border border-amber-200 object-contain bg-white" />
              <p className="mt-2 text-xs text-amber-700">扫码添加主理人微信，发送订单截图转账</p>
              <button
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = batchSale.paymentQrUrl;
                  link.download = "mio-wechat-qr.png";
                  link.click();
                }}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-800 hover:text-amber-900"
              >
                <Download className="h-3.5 w-3.5" />保存二维码
              </button>
            </div>
          ) : (
            <p className="text-sm text-amber-800">{batchSale.paymentInstruction}</p>
          )}

          <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-4 py-3 border border-amber-200">
            <div>
              <p className="text-[10px] tracking-wider text-amber-500 uppercase">WeChat</p>
              <p className="font-mono font-bold text-amber-900">{batchSale.paymentWechatId}</p>
            </div>
            <button
              onClick={copyWechat}
              className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-200 transition"
            >
              {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? "已复制" : "复制"}
            </button>
          </div>
        </div>

        <p className="mt-5 text-center">
          <span className="font-serif text-lg italic text-ember">{batchSale.successMessage}</span>
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
