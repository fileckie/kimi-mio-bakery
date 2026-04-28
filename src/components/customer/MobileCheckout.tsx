import { useRef, useCallback, useState } from "react";
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

  // Swipe-to-dismiss state
  const sheetRef = useRef<HTMLDivElement>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startY = useRef(0);
  const startTime = useRef(0);

  const rafId = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    startY.current = e.touches[0].clientY;
    startTime.current = Date.now();
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging) return;
    const delta = e.touches[0].clientY - startY.current;
    if (delta > 0) {
      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => setDragY(delta));
    }
  }, [isDragging]);

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
    const delta = dragY;
    const elapsed = Date.now() - startTime.current;
    const velocity = delta / (elapsed || 1);

    if (delta > 100 || (delta > 40 && velocity > 0.5)) {
      setDragY(0);
      setMobileCheckoutOpen(false);
    } else {
      setDragY(0);
    }
    if (rafId.current) cancelAnimationFrame(rafId.current);
  }, [dragY, setMobileCheckoutOpen]);

  const sheetStyle = isDragging
    ? { transform: `translateY(${dragY}px)`, transition: "none", touchAction: "pan-y" as const }
    : { transform: "translateY(0)", transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)", touchAction: "pan-y" as const };

  return (
    <>
      {/* Bottom sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-white/95 p-3 shadow-[0_-8px_32px_rgba(30,23,18,.10)] backdrop-blur-xl lg:hidden animate-slide-up">
        <button
          onClick={() => setMobileCheckoutOpen(true)}
          className="press-feedback flex w-full items-center justify-between rounded-full bg-kiln px-6 py-3.5 text-white shadow-card"
        >
          <span className="flex items-center gap-2.5 text-sm font-medium">
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? `${cartCount} 件面包` : "选择今日面包"}
          </span>
          <span className="text-lg font-semibold">¥{total}</span>
        </button>
      </div>

      {/* Checkout overlay + sheet */}
      {mobileCheckoutOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden animate-fade-in">
          {/* Backdrop — tap to close */}
          <div
            className="absolute inset-0 bg-kiln/30 backdrop-blur-sm"
            onClick={() => setMobileCheckoutOpen(false)}
          />

          {/* Full-screen checkout sheet */}
          <div
            ref={sheetRef}
            className="absolute inset-x-0 bottom-0 h-[95svh] overflow-y-auto rounded-t-3xl bg-white shadow-elevated"
            style={sheetStyle}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Sticky header */}
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-border px-5 pt-4 pb-3">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-border" />
              <div className="flex items-center justify-between">
                <p className="font-brush text-xl text-kiln">确认预订</p>
                <button
                  onClick={() => setMobileCheckoutOpen(false)}
                  className="press-feedback flex h-9 w-9 items-center justify-center rounded-full bg-surface transition hover:bg-kiln hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="px-5 pb-8 pt-2">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
