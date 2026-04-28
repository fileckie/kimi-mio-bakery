import { useState } from "react";
import { X, BadgeCheck, Download, MessageCircle, Copy, Check, Eye, Share2, ChevronRight } from "lucide-react";
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
  const [receiptImg, setReceiptImg] = useState<string | null>(null);
  const [showFullImg, setShowFullImg] = useState(false);

  const generateReceipt = (): string => {
    const canvas = document.createElement("canvas");
    const W = 640;
    const H = 960;
    canvas.width = W * 2;
    canvas.height = H * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    ctx.scale(2, 2);

    // Background
    ctx.fillStyle = "#FAF6F0";
    ctx.fillRect(0, 0, W, H);

    // Border frame
    ctx.strokeStyle = "#E2D5C5";
    ctx.lineWidth = 1;
    ctx.strokeRect(20, 20, W - 40, H - 40);
    ctx.strokeStyle = "#1E1712";
    ctx.lineWidth = 2;
    ctx.strokeRect(26, 26, W - 52, H - 52);

    // Top accent line
    ctx.fillStyle = "#E84A2E";
    ctx.fillRect(26, 26, W - 52, 4);

    // Header
    ctx.textAlign = "center";
    ctx.fillStyle = "#1E1712";
    ctx.font = "600 30px Inter, sans-serif";
    ctx.fillText("Mio", W / 2, 82);
    ctx.fillStyle = "#7A6E62";
    ctx.font = "italic 15px Cormorant Garamond, Georgia, serif";
    ctx.fillText("SLOWFIRE — HANDCRAFTED SOURDOUGH", W / 2, 108);

    // Divider
    ctx.strokeStyle = "#E2D5C5";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(56, 134); ctx.lineTo(W - 56, 134); ctx.stroke();

    // Success badge area
    ctx.fillStyle = "#1E1712";
    ctx.font = "600 13px Inter, sans-serif";
    ctx.letterSpacing = "3px";
    ctx.fillText(batchSale.successTitle, W / 2, 168);
    ctx.letterSpacing = "0";

    ctx.fillStyle = "#7A6E62";
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText(`${order.id} · ${order.createdAt}`, W / 2, 192);

    // Items
    let y = 240;
    ctx.textAlign = "left";
    ctx.fillStyle = "#7A6E62";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("YOUR ORDER", 56, y);
    ctx.letterSpacing = "0";

    y += 30;
    order.items.forEach((item) => {
      ctx.fillStyle = "#1E1712";
      ctx.font = "15px Inter, sans-serif";
      ctx.textAlign = "left";
      ctx.fillText(item.name, 56, y);
      ctx.textAlign = "right";
      ctx.fillStyle = "#7A6E62";
      ctx.font = "13px Inter, sans-serif";
      ctx.fillText(`${item.qty} × ¥${item.price}`, W - 56, y);
      y += 38;
    });

    // Divider before total
    y += 10;
    ctx.strokeStyle = "#E2D5C5";
    ctx.beginPath(); ctx.moveTo(56, y); ctx.lineTo(W - 56, y); ctx.stroke();

    // Dashed divider (ticket style)
    y += 20;
    ctx.strokeStyle = "#E2D5C5";
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(56, y); ctx.lineTo(W - 56, y); ctx.stroke();
    ctx.setLineDash([]);

    // Total
    y += 36;
    ctx.textAlign = "left";
    ctx.fillStyle = "#7A6E62";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("TOTAL", 56, y);
    ctx.letterSpacing = "0";
    ctx.textAlign = "right";
    ctx.fillStyle = "#E84A2E";
    ctx.font = "bold 30px Inter, sans-serif";
    ctx.fillText(`¥${order.total}`, W - 56, y);

    // Pickup info
    y += 52;
    ctx.textAlign = "left";
    ctx.fillStyle = "#7A6E62";
    ctx.font = "600 11px Inter, sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillText("PICKUP", 56, y);
    ctx.letterSpacing = "0";

    y += 28;
    ctx.fillStyle = "#1E1712";
    ctx.font = "14px Inter, sans-serif";
    ctx.fillText(getStoreName(stores, order.pickupStoreId), 56, y);
    y += 22;
    ctx.fillStyle = "#7A6E62";
    ctx.font = "13px Inter, sans-serif";
    ctx.fillText(`${order.deliveryMethod}`, 56, y);

    if (order.pickupCode) {
      y += 30;
      ctx.fillStyle = "#7A6E62";
      ctx.font = "600 11px Inter, sans-serif";
      ctx.letterSpacing = "2px";
      ctx.fillText("CODE", 56, y);
      ctx.letterSpacing = "0";
      y += 28;
      ctx.fillStyle = "#E84A2E";
      ctx.font = "bold 24px monospace";
      ctx.fillText(order.pickupCode, 56, y);
    }

    // Bottom divider
    y = H - 140;
    ctx.strokeStyle = "#E2D5C5";
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(56, y); ctx.lineTo(W - 56, y); ctx.stroke();
    ctx.setLineDash([]);

    // Bottom message
    y += 36;
    ctx.textAlign = "center";
    ctx.fillStyle = "#1E1712";
    ctx.font = "italic 17px Cormorant Garamond, Georgia, serif";
    ctx.fillText(batchSale.successMessage, W / 2, y);

    // Seal
    y += 38;
    ctx.strokeStyle = "#E84A2E";
    ctx.lineWidth = 2;
    ctx.strokeRect(W / 2 - 28, y, 56, 56);
    ctx.fillStyle = "#E84A2E";
    ctx.font = "22px serif";
    ctx.fillText("窑烤", W / 2, y + 38);

    // Footer
    y = H - 32;
    ctx.fillStyle = "#A89E94";
    ctx.font = "10px Inter, sans-serif";
    ctx.fillText("Mio SLOWFIRE · 不多做，只为你烤", W / 2, y);

    return canvas.toDataURL("image/png");
  };

  const showReceipt = () => {
    const img = generateReceipt();
    if (img) setReceiptImg(img);
  };

  const copyWechat = () => {
    navigator.clipboard.writeText(batchSale.paymentWechatId).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  return (
    <div className="fixed inset-0 z-[70] bg-kiln/40 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="w-full max-w-md max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-elevated animate-slide-up relative">
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ember via-wheat to-ember" />

        <div className="p-6 sm:p-8">
          {/* Header */}
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

          {/* Ticket-style order card */}
          <div className="mt-6 relative">
            <div className="rounded-t-2xl border border-border bg-ash px-5 pt-5 pb-4">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">Order No.</span>
                <span className="font-mono font-semibold text-kiln">{order.id}</span>
              </div>
              {order.items.map((i) => (
                <div key={i.productId} className="mt-2.5 flex justify-between text-sm">
                  <span className="text-kiln">{i.name} <span className="text-muted">× {i.qty}</span></span>
                  <span className="font-semibold text-kiln">¥{i.qty * i.price}</span>
                </div>
              ))}
            </div>
            {/* Dashed divider */}
            <div className="relative h-3 bg-ash border-x border-border">
              <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-border" />
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-5 w-5 rounded-full bg-white border border-border" />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-5 w-5 rounded-full bg-white border border-border" />
            </div>
            <div className="rounded-b-2xl border border-t-0 border-border bg-ash px-5 pb-5 pt-3">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">Total</span>
                <span className="text-2xl font-bold text-ember">¥{order.total}</span>
              </div>
              <div className="mt-3 pt-3 border-t border-border/60 text-xs text-muted space-y-1">
                <p>{getStoreName(stores, order.pickupStoreId)} · {order.deliveryMethod}</p>
                {order.pickupCode && (
                  <p className="flex items-center gap-2">
                    <span className="text-[10px] tracking-wider text-muted uppercase">Pickup Code</span>
                    <span className="font-mono font-bold text-kiln text-lg">{order.pickupCode}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Payment guidance */}
          <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageCircle className="h-5 w-5 text-amber-700" />
              <p className="text-[10px] font-semibold tracking-wider text-amber-700 uppercase">Next Step</p>
            </div>

            {batchSale.paymentQrUrl ? (
              <div className="text-center">
                <img src={batchSale.paymentQrUrl} alt="微信二维码" className="mx-auto h-44 w-44 rounded-xl border border-amber-200 object-contain bg-white" />
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

          {/* Receipt preview */}
          {receiptImg && (
            <div className="mt-5 rounded-2xl border border-border bg-ash p-3">
              <p className="text-center text-xs text-muted mb-2">
                {isMobile ? "长按下方图片保存到相册" : "右键图片另存为"}
              </p>
              <button onClick={() => setShowFullImg(true)} className="w-full">
                <img src={receiptImg} alt="窑烤凭证" className="w-full rounded-xl border border-border bg-white" />
              </button>
              <div className="mt-2 flex gap-2">
                {!isMobile && (
                  <a
                    href={receiptImg}
                    download={`Mio-Order-${order.id}.png`}
                    className="flex-1 rounded-full bg-kiln py-2.5 text-sm font-semibold text-ash hover:bg-kiln-light transition flex items-center justify-center gap-1.5"
                  >
                    <Download className="h-4 w-4" />下载图片
                  </a>
                )}
                <button onClick={() => setReceiptImg(null)} className="flex-1 rounded-full bg-surface py-2.5 text-sm font-semibold text-kiln hover:bg-ash transition">
                  收起凭证
                </button>
              </div>
            </div>
          )}

          {!receiptImg && (
            <button onClick={showReceipt} className="mt-5 w-full rounded-full bg-kiln py-3 text-sm font-semibold text-ash hover:bg-kiln-light transition flex items-center justify-center gap-2">
              <Eye className="h-4 w-4" />查看窑烤凭证
            </button>
          )}

          {/* Share tip */}
          <div className="mt-4 flex items-start gap-2 rounded-xl bg-ash p-3 text-xs text-muted">
            <Share2 className="h-4 w-4 shrink-0 mt-0.5" />
            <p>截图本页或保存凭证，发送给主理人微信完成转账。后台确认后会安排窑烤制作。</p>
          </div>

          <button onClick={onClose} className="mt-4 w-full rounded-full bg-surface py-3 text-sm font-semibold text-kiln hover:bg-ash transition">
            继续浏览
          </button>
        </div>
      </div>

      {/* Full-screen image viewer for mobile save */}
      {showFullImg && receiptImg && (
        <div className="fixed inset-0 z-[80] bg-kiln/90 flex flex-col items-center justify-center p-4 animate-fade-in" onClick={() => setShowFullImg(false)}>
          <p className="text-ash text-sm mb-3">{isMobile ? "长按图片 → 保存到相册" : "右键图片另存为"}</p>
          <img src={receiptImg} alt="窑烤凭证" className="max-w-full max-h-[80vh] rounded-xl shadow-elevated" />
          <button onClick={() => setShowFullImg(false)} className="mt-4 rounded-full bg-white/10 px-5 py-2 text-sm text-ash hover:bg-white/20 transition">
            关闭
          </button>
        </div>
      )}
    </div>
  );
}
