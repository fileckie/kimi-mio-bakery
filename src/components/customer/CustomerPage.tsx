import { useState } from "react";
import type { Order } from "../../types";
import { useAppStore } from "../../stores/appStore";
import { useCartStore } from "../../stores/cartStore";
import { useShallow } from "zustand/shallow";
import { CustomerHeader } from "./CustomerHeader";
import { HeroSection } from "./HeroSection";
import { FeatureEntrances } from "./FeatureEntrances";
import { ProductGrid } from "./ProductGrid";
import { CheckoutPanel } from "./CheckoutPanel";
import { MobileCheckout } from "./MobileCheckout";
import { OrderLookup } from "./OrderLookup";
import { StoreInfo } from "./StoreInfo";
import { OrderSuccessModal } from "./OrderSuccessModal";
import { MyOrdersDrawer } from "./MyOrdersDrawer";

export function CustomerPage() {
  const { products, stores, batchSale, inventory } = useAppStore();
  const { items: cartItems, pickupStoreId } = useCartStore(useShallow((s) => ({ items: s.items, pickupStoreId: s.pickupStoreId })));
  const [successOrder, setSuccessOrder] = useState<Order | null>(null);
  const [myOrdersOpen, setMyOrdersOpen] = useState(false);

  const featuredProducts = batchSale.featuredProductIds
    .map((pid) => products.find((p) => p.id === pid))
    .filter(Boolean) as typeof products;

  const cartSubtotal = Object.entries(cartItems).reduce((sum, [pid, qty]) => {
    const p = products.find((x) => x.id === pid);
    return sum + (p ? p.price * qty : 0);
  }, 0);

  return (
    <>
      <CustomerHeader onOpenMyOrders={() => setMyOrdersOpen(true)} />
      <main className="pb-24 lg:pb-0">
        <HeroSection batchSale={batchSale} featuredProducts={featuredProducts} inventory={inventory} />
        <FeatureEntrances />
        <OrderLookup stores={stores} />

        <section id="menu" className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-10 lg:grid-cols-[1fr_400px]">
              <ProductGrid
                products={products}
                inventory={inventory}
                batchSaleOpen={batchSale.isOpen}
                pickupStoreId={pickupStoreId}
              />
              <aside className="hidden lg:sticky lg:top-6 lg:block lg:self-start">
                <CheckoutPanel
                  batchSale={batchSale}
                  stores={stores}
                  products={products}
                  onOrderSuccess={setSuccessOrder}
                />
              </aside>
            </div>
          </div>
        </section>

        <StoreInfo stores={stores} />

        {/* Footer */}
        <footer className="border-t border-border bg-ash py-16">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 text-center">
            <p className="font-display text-3xl font-bold text-kiln">Mio</p>
            <p className="font-script text-lg italic text-smoke mt-1">slowfire</p>
            <p className="font-brush text-2xl text-ember mt-3">慢火窑烤面包</p>
            <p className="mt-6 font-hand text-sm text-muted">{batchSale.footerTagline} · 加微信 {batchSale.paymentWechatId}</p>
          </div>
        </footer>
      </main>

      <MobileCheckout total={cartSubtotal}>
        <CheckoutPanel batchSale={batchSale} stores={stores} products={products} onOrderSuccess={setSuccessOrder} />
      </MobileCheckout>

      {successOrder && <OrderSuccessModal order={successOrder} stores={stores} batchSale={batchSale} onClose={() => setSuccessOrder(null)} />}
      <MyOrdersDrawer open={myOrdersOpen} onClose={() => setMyOrdersOpen(false)} />
    </>
  );
}
