import { useState, useMemo } from "react";
import { Plus, Minus, BadgeCheck, ReceiptText, ChevronRight, Wallet, CreditCard, Smartphone, QrCode, Store } from "lucide-react";
import type { Product, StoreLocation, InventoryMap, RoleId, StoreId, Order, PaymentMethod } from "../../types";
import { useAppStore } from "../../stores/appStore";

interface PosTerminalProps {
  products: Product[];
  stores: StoreLocation[];
  inventory: InventoryMap;
}

const paymentMethods: { method: PaymentMethod; icon: typeof Wallet }[] = [
  { method: "现金", icon: Wallet },
  { method: "微信转账", icon: QrCode },
  { method: "微信支付", icon: Smartphone },
  { method: "支付宝", icon: CreditCard },
  { method: "到店付", icon: Store },
];

export function PosTerminal({ products, stores, inventory }: PosTerminalProps) {
  const { activeRole, createOrder, setRoute } = useAppStore();
  const storeId = activeRole === "hq" ? "store-a" : (activeRole as StoreId);
  const store = stores.find((s) => s.id === storeId) ?? stores[0];
  const [cart, setCart] = useState<Record<string, number>>({});
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("现金");
  const [lastOrder, setLastOrder] = useState<Order | null>(null);

  const availableForStore = (pid: string) => {
    const alloc = inventory[pid];
    if (!alloc) return 0;
    return Math.max(0, alloc.stores[storeId] - alloc.sold[storeId]);
  };

  const updateCart = (pid: string, delta: number) => {
    const avail = availableForStore(pid);
    setCart((c) => {
      const nextQty = Math.max(0, Math.min(avail, (c[pid] || 0) + delta));
      const next = { ...c, [pid]: nextQty };
      if (nextQty === 0) delete next[pid];
      return next;
    });
  };

  const cartItems = useMemo(() => Object.entries(cart).map(([pid, qty]) => {
    const p = products.find((x) => x.id === pid);
    return p && qty > 0 ? { productId: pid, name: p.name, qty, price: p.price } : null;
  }).filter(Boolean) as Order["items"], [cart, products]);

  const subtotal = cartItems.reduce((s, i) => s + i.qty * i.price, 0);

  const checkout = async () => {
    if (cartItems.length === 0) return;
    const order: Order = {
      id: "", type: "pos", items: cartItems, subtotal, shippingFee: 0, total: subtotal,
      deliveryMethod: "门店自提", paymentMethod, status: "已完成",
      sourceStoreId: storeId, pickupStoreId: storeId, createdAt: "刚刚",
    };
    const saved = await createOrder(order);
    if (saved) { setLastOrder(saved); setCart({}); }
  };

  const quickProducts = products.filter((p) => p.isPublished);

  return (
    <main className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ember">{store.name}</p>
          <h1 className="mt-2 font-brush text-4xl text-kiln sm:text-5xl">现场收银台</h1>
          <p className="mt-3 font-hand text-sm text-muted">门店现场拿货结账</p>
        </div>
        <button onClick={() => setRoute("/admin")} className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-semibold text-kiln shadow-soft hover:bg-ash transition">
          <ChevronRight className="h-5 w-5 rotate-180" />返回后台
        </button>
      </div>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {quickProducts.map((p) => (
            <button key={p.id} onClick={() => updateCart(p.id, 1)} className="group rounded-2xl border border-border bg-white text-left shadow-soft transition hover:-translate-y-1 hover:shadow-elevated overflow-hidden">
              <div className={`h-32 bg-gradient-to-br ${p.imageTone} flex items-center justify-center`}>
                {p.imageUrl ? <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" /> : <span className="text-4xl">🍞</span>}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-lg font-semibold text-kiln">{p.name}</p>
                    <p className="text-sm text-muted">{p.weight} · 剩余 {availableForStore(p.id)}</p>
                  </div>
                  <span className="text-xl font-semibold text-ember">¥{p.price}</span>
                </div>
                <span className="mt-4 inline-flex items-center gap-2 rounded-full bg-kiln px-4 py-2 text-sm font-semibold text-ash">
                  <Plus className="h-4 w-4" />加到收银单
                </span>
              </div>
            </button>
          ))}
        </div>

        <aside className="rounded-2xl border border-border bg-white p-6 shadow-soft lg:sticky lg:top-24 lg:self-start">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-kiln">收银单</h2>
            <ReceiptText className="h-6 w-6 text-ember" />
          </div>
          <div className="mt-5 space-y-3">
            {cartItems.length === 0 ? <p className="rounded-xl bg-ash p-4 text-sm text-muted text-center">选择商品</p> : cartItems.map((i) => (
              <div key={i.productId} className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <p className="font-semibold text-kiln">{i.name}</p>
                  <p className="text-sm text-muted">¥{i.price} × {i.qty}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateCart(i.productId, -1)} className="counter-button"><Minus className="h-4 w-4" /></button>
                  <span className="w-5 text-center font-semibold text-kiln">{i.qty}</span>
                  <button onClick={() => updateCart(i.productId, 1)} className="counter-button"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>

          <p className="mb-2 mt-5 text-xs font-semibold uppercase text-muted">收款方式</p>
          <div className="grid grid-cols-2 gap-2">
            {paymentMethods.map((opt) => {
              const Icon = opt.icon;
              const active = paymentMethod === opt.method;
              return (
                <button key={opt.method} onClick={() => setPaymentMethod(opt.method)} className={`flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold transition ${active ? "bg-ember text-white" : "bg-ash text-kiln/70"}`}>
                  <Icon className="h-4 w-4" />{opt.method}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <span className="text-muted">应收</span>
            <span className="text-4xl font-semibold text-kiln">¥{subtotal}</span>
          </div>
          <button onClick={checkout} disabled={cartItems.length === 0} className="mt-4 w-full rounded-full bg-kiln py-3.5 font-semibold text-ash hover:bg-kiln-light transition disabled:opacity-30 flex items-center justify-center gap-2">
            <BadgeCheck className="h-5 w-5" />完成收银
          </button>
          {lastOrder && (
            <div className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-900">
              {lastOrder.id} 已完成，归属 {store.name}{lastOrder.pickupCode ? `，取货码 ${lastOrder.pickupCode}` : ""}
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
