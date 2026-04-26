import { ShoppingBag, X } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";
import { useCartStore } from "../../stores/cartStore";
import type { ReactNode } from "react";

interface MobileCheckoutProps {
  total: number;
  children: ReactNode;
}

export function MobileCheckout({ total, children }: MobileCheckoutProps) {
  const { mobileCheckoutOpen, setMobileCheckoutOpen } = useUIStore();
  const cartCount = Object.values(useCartStore((s) => s.items)).reduce((a, b) => a + b, 0);

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 p-3 shadow-[0_-8px_32px_rgba(30,23,18,.10)] backdrop-blur-xl lg:hidden">
        <button
          onClick={() => setMobileCheckoutOpen(true)}
          className="flex w-full items-center justify-between rounded-full bg-kiln px-6 py-3.5 text-white shadow-card"
        >
          <span className="flex items-center gap-2.5 text-sm font-medium">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? `${cartCount} 件面包` : "选择今日面包"}
          </span>
          <span className="text-lg font-semibold">¥{total}</span>
        </button>
      </div>

      {mobileCheckoutOpen && (
        <div className="fixed inset-0 z-[60] bg-kiln/30 p-3 backdrop-blur-sm lg:hidden animate-fade-in">
          <div className="absolute inset-x-0 bottom-0 max-h-[88svh] overflow-y-auto rounded-t-3xl bg-white p-5 shadow-elevated animate-slide-up">
            <div className="mb-4 flex items-center justify-between">
              <p className="font-brush text-xl text-kiln">确认预订</p>
              <button onClick={() => setMobileCheckoutOpen(false)} className="flex h-9 w-9 items-center justify-center rounded-full bg-surface transition hover:bg-kiln hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            {children}
          </div>
        </div>
      )}
    </>
  );
}
