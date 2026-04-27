import { useState } from "react";
import { BadgeCheck, Store, Bike, Truck, QrCode, Smartphone, CreditCard, ShoppingBag, User, Flame, MapPin, Package } from "lucide-react";
import type { BatchSale, StoreLocation, StoreId, Order, PaymentMethod, Product } from "../../types";
import { useCartStore } from "../../stores/cartStore";
import { useAuthStore } from "../../stores/authStore";
import { useAppStore } from "../../stores/appStore";

interface CheckoutPanelProps {
  batchSale: BatchSale;
  stores: StoreLocation[];
  products: Product[];
  onOrderSuccess: (order: Order) => void;
}

const deliveryOptions = [
  { method: "门店自提" as const, icon: Store, en: "PICKUP" },
  { method: "本地配送" as const, icon: Bike, en: "LOCAL" },
  { method: "顺丰快递" as const, icon: Truck, en: "EXPRESS" },
];

const paymentMethods: { method: PaymentMethod; icon: typeof QrCode; en: string }[] = [
  { method: "微信转账", icon: QrCode, en: "WECHAT" },
  { method: "微信支付", icon: Smartphone, en: "PAY" },
  { method: "支付宝", icon: CreditCard, en: "ALIPAY" },
  { method: "到店付", icon: Store, en: "CASH" },
];

export function CheckoutPanel({ batchSale, stores, products, onOrderSuccess }: CheckoutPanelProps) {
  const cart = useCartStore();
  const { customer, authenticate, logout, error: authError, clearError } = useAuthStore();
  const createOrder = useAppStore((s) => s.createOrder);
  const [memberName, setMemberName] = useState(customer?.name || "");
  const [memberPhone, setMemberPhone] = useState(customer?.phone || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const cartItems = Object.entries(cart.items)
    .map(([productId, qty]) => {
      const product = products.find((p) => p.id === productId);
      return product && qty > 0 ? { productId, name: product.name, qty, price: product.price } : null;
    })
    .filter(Boolean) as Order["items"];

  const subtotal = cartItems.reduce((sum, item) => sum + item.qty * item.price, 0);
  const shippingFee = cart.deliveryMethod === "门店自提" || subtotal >= batchSale.freeShippingThreshold
    ? 0 : batchSale.baseShippingFee;
  const total = subtotal + shippingFee;

  const pickupStore = stores.find((s) => s.id === cart.pickupStoreId) ?? stores[0];

  const handleSubmit = async () => {
    if (!batchSale.isOpen || cartItems.length === 0 || !customer) return;
    setIsSubmitting(true);
    const order: Order = {
      id: "",
      type: "online",
      items: cartItems,
      subtotal,
      shippingFee,
      total,
      deliveryMethod: cart.deliveryMethod,
      paymentMethod: cart.paymentMethod,
      status: cart.deliveryMethod === "门店自提" ? "待生产" : "待发货",
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      paymentStatus: "待付款确认",
      sourceStoreId: cart.sourceStoreId,
      pickupStoreId: cart.pickupStoreId,
      receiver: cart.deliveryMethod === "门店自提" ? customer.name : cart.receiver || customer.name,
      phone: cart.deliveryMethod === "门店自提" ? customer.phone : cart.phone || customer.phone,
      address: cart.deliveryMethod === "门店自提" ? undefined : cart.address,
      createdAt: new Date().toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }),
    };
    const saved = await createOrder(order);
    setIsSubmitting(false);
    if (saved) {
      cart.clearCart();
      onOrderSuccess(saved);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-white p-6 shadow-soft relative overflow-hidden">
      {/* 顶部装饰线 */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ember via-wheat to-ember opacity-60" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">{batchSale.checkoutTitle}</p>
          <h2 className="mt-1 text-2xl font-semibold text-kiln">
            {batchSale.isOpen ? batchSale.checkoutSubtitle : "本轮已截单"}
          </h2>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ash">
          <ShoppingBag className="h-5 w-5 text-ember" />
        </div>
      </div>

      {!batchSale.isOpen && (
        <div className="mt-5 rounded-xl bg-ash p-4 text-sm text-muted">
          {batchSale.closedMessage}
        </div>
      )}

      {/* Cart */}
      <div className="mt-5 space-y-3">
        {cartItems.length === 0 ? (
          <div className="rounded-xl bg-ash/50 p-5 text-center">
            <Package className="mx-auto h-8 w-8 text-muted/40" />
            <p className="mt-2 text-sm text-muted">{batchSale.checkoutEmptyHint}</p>
          </div>
        ) : (
          cartItems.map((item) => (
            <div key={item.productId} className="flex items-center justify-between border-b border-border pb-3 text-sm">
              <span className="text-kiln">{item.name} <span className="text-muted">× {item.qty}</span></span>
              <span className="font-semibold text-kiln">¥{item.qty * item.price}</span>
            </div>
          ))
        )}
      </div>

      {/* Member */}
      {customer ? (
        <div className="mt-5 rounded-xl bg-ash p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-kiln" />
              <div>
                <p className="font-semibold text-kiln">{customer.name}</p>
                <p className="text-xs text-muted">{customer.phone}</p>
              </div>
            </div>
            <button onClick={logout} className="text-xs font-semibold text-muted hover:text-kiln transition">切换</button>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-border bg-ash p-4">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-ember" />
            <p className="text-[10px] font-semibold tracking-[0.15em] text-muted uppercase">{batchSale.memberLabel}</p>
          </div>
          <p className="mt-1 text-xs text-muted">{batchSale.memberHint}</p>
          <div className="mt-3 grid gap-2.5">
            <input className="input-field" value={memberName} onChange={(e) => setMemberName(e.target.value)} placeholder="姓名" />
            <input className="input-field" value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} placeholder="手机号" />
          </div>
          {authError && <p className="mt-2 text-sm text-ember">{authError}</p>}
          <button
            onClick={() => authenticate(memberName, memberPhone)}
            disabled={!memberName.trim() || !memberPhone.trim()}
            className="mt-3 w-full rounded-full bg-kiln py-2.5 text-sm font-semibold text-ash hover:bg-kiln-light transition disabled:opacity-40"
          >
            确认并继续
          </button>
        </div>
      )}

      {/* Pickup store */}
      <p className="mb-2 mt-5 text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">Pickup Location</p>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <select className="input-field pl-9" value={cart.pickupStoreId} onChange={(e) => { cart.setPickupStoreId(e.target.value as StoreId); cart.setSourceStoreId(e.target.value as StoreId); }}>
          {stores.filter((s) => s.pickupOpen && batchSale.pickupStoreIds.includes(s.id)).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Delivery */}
      <p className="mb-2 mt-5 text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">Delivery</p>
      <div className="grid gap-2">
        {deliveryOptions.map((opt) => {
          const Icon = opt.icon;
          const active = cart.deliveryMethod === opt.method;
          return (
            <button key={opt.method} onClick={() => cart.setDeliveryMethod(opt.method)} className={`press-feedback flex items-center gap-3 rounded-xl border p-3 text-left transition ${active ? "border-kiln bg-kiln text-ash" : "border-border bg-white hover:bg-ash"}`}>
              <Icon className="h-5 w-5" />
              <span>
                <span className="block text-sm font-semibold">{opt.method}</span>
                <span className={`text-[10px] tracking-wider uppercase ${active ? "text-ash/60" : "text-muted"}`}>
                  {opt.method === "门店自提" ? pickupStore.address : `满${batchSale.freeShippingThreshold}免运`}
                </span>
              </span>
              <span className={`ml-auto text-[10px] font-bold tracking-wider ${active ? "text-ash/50" : "text-muted/40"}`}>{opt.en}</span>
            </button>
          );
        })}
      </div>

      {cart.deliveryMethod !== "门店自提" && (
        <>
          <p className="mb-2 mt-5 text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">Shipping Info</p>
          <div className="grid gap-2.5">
            <input className="input-field" value={cart.receiver} onChange={(e) => cart.setReceiver(e.target.value)} placeholder="收件人" />
            <input className="input-field" value={cart.phone} onChange={(e) => cart.setPhone(e.target.value)} placeholder="手机号" />
            <textarea className="input-field min-h-20 resize-none" value={cart.address} onChange={(e) => cart.setAddress(e.target.value)} placeholder="详细地址" />
          </div>
        </>
      )}

      {/* Payment */}
      <p className="mb-2 mt-5 text-[10px] font-semibold tracking-[0.2em] text-muted uppercase">Payment</p>
      <div className="grid grid-cols-2 gap-2">
        {paymentMethods.map((opt) => {
          const Icon = opt.icon;
          const active = cart.paymentMethod === opt.method;
          return (
            <button key={opt.method} onClick={() => cart.setPaymentMethod(opt.method)} className={`press-feedback flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-3 text-sm font-semibold transition ${active ? "bg-ember text-white shadow-glow" : "bg-ash text-kiln/70 hover:bg-ash-deep"}`}>
              <Icon className="h-4 w-4" />
              <span>{opt.method}</span>
              <span className={`text-[9px] tracking-wider ${active ? "text-white/60" : "text-muted/50"}`}>{opt.en}</span>
            </button>
          );
        })}
      </div>
      {cart.paymentMethod === "微信转账" && (
        <div className="mt-3 rounded-xl bg-amber-50 p-4 text-xs text-amber-800 border border-amber-100">
          <p className="text-[10px] font-semibold tracking-wider uppercase text-amber-600 mb-1">Payment Note</p>
          <p>{batchSale.paymentInstruction}</p>
          <p className="mt-1 font-mono font-bold text-amber-900">{batchSale.paymentWechatId}</p>
        </div>
      )}

      {/* Total */}
      <div className="mt-6 space-y-2 border-t border-border pt-5 text-sm">
        <div className="flex justify-between text-muted"><span>商品小计</span><span>¥{subtotal}</span></div>
        <div className="flex justify-between text-muted"><span>运费</span><span>{shippingFee === 0 ? "免运费" : `¥${shippingFee}`}</span></div>
        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-semibold tracking-wider text-muted uppercase">Total</span>
          <span className="text-3xl font-semibold text-ember">¥{total}</span>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={!batchSale.isOpen || cartItems.length === 0 || !customer || isSubmitting}
        className="mt-5 w-full rounded-full bg-ember py-3.5 text-sm font-semibold text-white transition hover:bg-ember-dim disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-elevated"
      >
        <BadgeCheck className="h-4 w-4" />
        {isSubmitting ? "SLOWFIRE BAKING..." : batchSale.isOpen ? "CONFIRM ORDER" : "ROUND CLOSED"}
      </button>
    </div>
  );
}
