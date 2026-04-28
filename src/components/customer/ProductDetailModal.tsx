import { useRef, useCallback, useState } from "react";
import { X, Plus, Minus, Wheat, Flame, Leaf, MapPin } from "lucide-react";
import type { Product } from "../../types";
import { ProductVisual } from "./ProductVisual";

interface Props {
  product: Product;
  available: number;
  qty: number;
  canOrder: boolean;
  onClose: () => void;
  onAdd: () => void;
  onRemove: () => void;
}

export function ProductDetailModal({ product, available, qty, canOrder, onClose, onAdd, onRemove }: Props) {
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
    const elapsed = Date.now() - startTime.current;
    const velocity = dragY / (elapsed || 1);
    if (dragY > 100 || (dragY > 40 && velocity > 0.5)) {
      setDragY(0);
      onClose();
    } else {
      setDragY(0);
    }
    if (rafId.current) cancelAnimationFrame(rafId.current);
  }, [dragY, onClose]);

  const sheetStyle = isDragging
    ? { transform: `translateY(${dragY}px)`, transition: "none", touchAction: "pan-y" as const }
    : { transform: "translateY(0)", transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)", touchAction: "pan-y" as const };

  const isSoldOut = available === 0;
  const isLowStock = available > 0 && available <= 3;

  return (
    <div className="fixed inset-0 z-[60] animate-fade-in">
      <div className="absolute inset-0 bg-kiln/40 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={sheetRef}
        className="absolute inset-x-0 bottom-0 h-[95svh] overflow-y-auto rounded-t-3xl bg-white shadow-elevated"
        style={sheetStyle}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Sticky header with drag handle + close */}
        <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm pt-3 pb-2 px-5">
          <div className="mx-auto h-1 w-10 rounded-full bg-border" />
          <div className="mt-2 flex items-center justify-between">
            <p className="font-brush text-lg text-kiln">{product.name}</p>
            <button
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-kiln hover:bg-kiln hover:text-white transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Header image */}
        <div className="relative h-56 sm:h-72 overflow-hidden">
          <ProductVisual product={product} size="lg" className="h-56 sm:h-72 w-full" />
        </div>

        {/* Info */}
        <div className="px-5 pb-8 pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs font-semibold text-ember">{product.category}</p>
              <h2 className="mt-1 text-2xl font-semibold text-kiln">{product.name}</h2>
              <p className="mt-1 text-sm text-muted">{product.weight}</p>
            </div>
            <span className="text-2xl font-bold text-ember shrink-0">¥{product.price}</span>
          </div>

          <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>

          {/* Specs */}
          <div className="mt-5 grid grid-cols-2 gap-3">
            {product.texture && (
              <div className="rounded-xl bg-ash p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Wheat className="h-3.5 w-3.5" />口感
                </div>
                <p className="mt-1 text-sm font-medium text-kiln">{product.texture}</p>
              </div>
            )}
            {product.crust && (
              <div className="rounded-xl bg-ash p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Flame className="h-3.5 w-3.5" />外皮
                </div>
                <p className="mt-1 text-sm font-medium text-kiln">{product.crust}</p>
              </div>
            )}
            {product.aroma && (
              <div className="rounded-xl bg-ash p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <Leaf className="h-3.5 w-3.5" />香气
                </div>
                <p className="mt-1 text-sm font-medium text-kiln">{product.aroma}</p>
              </div>
            )}
            {product.origin && (
              <div className="rounded-xl bg-ash p-3">
                <div className="flex items-center gap-1.5 text-xs text-muted">
                  <MapPin className="h-3.5 w-3.5" />原物料
                </div>
                <p className="mt-1 text-sm font-medium text-kiln">{product.origin}</p>
              </div>
            )}
          </div>

          {/* Cross section image */}
          {product.crossSectionImage && (
            <div className="mt-5">
              <p className="text-xs font-semibold text-muted tracking-wider uppercase">Cross Section</p>
              <div className="mt-2 rounded-xl border border-border overflow-hidden">
                <img src={product.crossSectionImage} alt={`${product.name} 切面`} className="w-full h-40 object-cover" />
              </div>
            </div>
          )}

          {/* Story */}
          {product.story && (
            <div className="mt-5 rounded-xl border border-border bg-ash p-4">
              <p className="text-xs font-semibold text-muted tracking-wider uppercase">Story</p>
              <p className="mt-2 font-hand text-sm leading-relaxed text-kiln">{product.story}</p>
              {product.baker && <p className="mt-2 text-xs text-muted text-right">— {product.baker}</p>}
            </div>
          )}

          {/* Ingredients */}
          <div className="mt-5">
            <p className="text-xs font-semibold text-muted tracking-wider uppercase">Ingredients</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.ingredients.map((ing) => (
                <span key={ing} className="rounded-full bg-ash px-3 py-1 text-xs text-smoke">{ing}</span>
              ))}
            </div>
          </div>

          {/* Stock & Add */}
          <div className="mt-6 flex items-center justify-between border-t border-border pt-5">
            <div>
              {isSoldOut ? (
                <span className="text-sm font-brush text-smoke-light">已认领完</span>
              ) : (
                <span className={`text-sm ${isLowStock ? "font-brush text-ember" : "text-muted"}`}>
                  {isLowStock ? `仅剩 ${available}` : `余 ${available}`}
                </span>
              )}
            </div>
            <AddButton qty={qty} canOrder={canOrder} isSoldOut={isSoldOut} available={available} onAdd={onAdd} onRemove={onRemove} />
          </div>
        </div>
      </div>
    </div>
  );
}

function AddButton({ qty, canOrder, isSoldOut, available, onAdd, onRemove }: {
  qty: number; canOrder: boolean; isSoldOut: boolean; available: number;
  onAdd: () => void; onRemove: () => void;
}) {
  if (qty > 0) {
    return (
      <div className="flex items-center gap-1 rounded-full bg-ash p-1">
        <button type="button" onClick={onRemove} className="flex items-center justify-center rounded-full bg-white text-kiln transition active:scale-90 h-10 w-10 min-h-[44px] min-w-[44px]" aria-label="减少">
          <Minus className="h-4 w-4" />
        </button>
        <span className="text-center font-bold text-kiln w-7 text-base">{qty}</span>
        <button type="button" onClick={onAdd} disabled={!canOrder || qty >= available}
          className="flex items-center justify-center rounded-full bg-ember text-white transition active:scale-90 disabled:opacity-30 h-10 w-10 min-h-[44px] min-w-[44px]" aria-label="增加">
          <Plus className="h-4 w-4" />
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={onAdd} disabled={!canOrder || isSoldOut}
      className="flex items-center justify-center rounded-full bg-kiln text-ash transition hover:bg-kiln-light active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed shadow-soft h-11 w-11 min-h-[44px] min-w-[44px]">
      <Plus className="h-5 w-5" />
    </button>
  );
}
