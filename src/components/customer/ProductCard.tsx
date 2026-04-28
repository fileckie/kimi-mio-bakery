import { memo, useState, useCallback } from "react";
import { Plus, Minus, TrendingUp } from "lucide-react";
import type { Product } from "../../types";
import { ProductVisual } from "./ProductVisual";

interface ProductCardProps {
  product: Product;
  available: number;
  qty: number;
  canOrder: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onClickDetail?: () => void;
  hotRank?: number;
}

export const ProductCard = memo(function ProductCard({ product, available, qty, canOrder, onAdd, onRemove, onClickDetail, hotRank }: ProductCardProps) {
  const isLowStock = available > 0 && available <= 3;
  const isSoldOut = available === 0;

  return (
    <article
      className="group relative overflow-hidden rounded-2xl border border-border bg-white transition hover:shadow-elevated hover:-translate-y-0.5"
    >
      {/* ===== Mobile: compact horizontal card (tap to view detail) ===== */}
      <div className="flex items-stretch gap-0 sm:hidden">
        {/* Left: image, tap to detail */}
        <button
          type="button"
          onClick={onClickDetail}
          className="relative h-24 w-24 shrink-0 overflow-hidden rounded-l-2xl text-left"
        >
          <ProductVisual product={product} className="h-24 w-24" />
        </button>

        {/* Right: info + action */}
        <div className="flex-1 min-w-0 flex flex-col justify-between p-3">
          {/* Top: name + price */}
          <button type="button" onClick={onClickDetail} className="text-left min-w-0">
            <div className="flex items-baseline justify-between gap-2 min-w-0">
              <h3 className="text-base font-semibold text-kiln truncate min-w-0">{product.name}</h3>
              <span className="text-lg font-bold text-ember shrink-0">¥{product.price}</span>
            </div>
            <p className="text-xs text-muted mt-0.5">
              {product.weight}
              <span className="mx-1">·</span>
              <span className={isLowStock ? "text-ember font-brush" : ""}>
                {isSoldOut ? "已售罄" : isLowStock ? `仅剩 ${available}` : `余 ${available}`}
              </span>
            </p>
          </button>

          {/* Bottom: tags + add button */}
          <div className="flex items-end justify-between gap-2 mt-2 min-w-0">
            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex flex-wrap gap-1">
                {product.ingredients.slice(0, 2).map((ing) => (
                  <span key={ing} className="rounded-full bg-ash px-2 py-0.5 text-[10px] text-smoke truncate max-w-[80px]">
                    {ing}
                  </span>
                ))}
              </div>
              {hotRank && hotRank <= 3 && (
                <span className="inline-flex items-center gap-1 font-brush text-[11px] text-ember">
                  <TrendingUp className="h-3 w-3 shrink-0" />
                  热门第{hotRank}
                </span>
              )}
            </div>
            <AddButton
              qty={qty}
              canOrder={canOrder}
              isSoldOut={isSoldOut}
              available={available}
              onAdd={onAdd}
              onRemove={onRemove}
              compact
            />
          </div>
        </div>
      </div>

      {/* ===== Desktop: vertical card layout ===== */}
      <div className="hidden sm:block">
        <button type="button" onClick={onClickDetail} className="w-full text-left">
          <div className="relative h-36 overflow-hidden">
            <ProductVisual product={product} className="h-36 w-full" />
          </div>
        </button>
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <button type="button" onClick={onClickDetail} className="text-left min-w-0">
              <h3 className="text-base font-semibold text-kiln">{product.name}</h3>
              <p className="mt-0.5 text-xs text-muted">{product.weight}</p>
            </button>
            <span className="text-lg font-bold text-ember shrink-0">¥{product.price}</span>
          </div>
          <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">{product.description}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {product.ingredients.slice(0, 3).map((ing) => (
              <span key={ing} className="rounded-full bg-ash px-2 py-0.5 text-[10px] text-smoke">{ing}</span>
            ))}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="flex flex-col">
              {isSoldOut ? (
                <span className="text-sm font-brush text-smoke-light">已认领完</span>
              ) : (
                <>
                  <span className={`text-xs ${isLowStock ? "font-brush text-ember" : "text-muted"}`}>
                    {isLowStock ? `仅剩 ${available}` : `余 ${available}`}
                  </span>
                  {hotRank && hotRank <= 3 && (
                    <span className="mt-0.5 inline-flex items-center gap-1 font-brush text-[11px] text-ember">
                      <TrendingUp className="h-3 w-3" />窑火热门第{hotRank}
                    </span>
                  )}
                </>
              )}
            </div>
            <AddButton qty={qty} canOrder={canOrder} isSoldOut={isSoldOut} available={available} onAdd={onAdd} onRemove={onRemove} />
          </div>
        </div>
      </div>
    </article>
  );
});

function AddButton({ qty, canOrder, isSoldOut, available, onAdd, onRemove, compact }: {
  qty: number; canOrder: boolean; isSoldOut: boolean; available: number;
  onAdd: () => void; onRemove: () => void; compact?: boolean;
}) {
  const [bump, setBump] = useState(false);

  const handleAdd = useCallback(() => {
    if (!canOrder || isSoldOut || qty >= available) return;
    setBump(true);
    setTimeout(() => setBump(false), 200);
    onAdd();
  }, [canOrder, isSoldOut, available, qty, onAdd]);

  const handleRemove = useCallback(() => {
    setBump(true);
    setTimeout(() => setBump(false), 200);
    onRemove();
  }, [onRemove]);

  const btnSize = compact ? "h-9 w-9 min-h-[44px] min-w-[44px]" : "h-10 w-10 min-h-[44px] min-w-[44px]";
  const iconSize = compact ? "h-4 w-4" : "h-4 w-4";
  const bumpStyle = bump ? { animation: "btn-bump 0.2s ease" } : undefined;

  if (qty > 0) {
    return (
      <div className={`flex items-center gap-1 rounded-full bg-ash shrink-0 ${compact ? "p-1" : "p-1"}`}>
        <button type="button" onClick={handleRemove} className={`flex items-center justify-center rounded-full bg-white text-kiln transition active:scale-90 ${btnSize}`} aria-label="减少">
          <Minus className={iconSize} />
        </button>
        <span key={qty} className={`text-center font-bold text-kiln inline-block ${compact ? "w-6 text-sm" : "w-7 text-base"} animate-count-pop`}>{qty}</span>
        <button type="button" onClick={handleAdd} disabled={!canOrder || qty >= available}
          className={`flex items-center justify-center rounded-full bg-ember text-white transition active:scale-90 disabled:opacity-30 ${btnSize}`}
          style={bumpStyle}
          aria-label="增加">
          <Plus className={iconSize} />
        </button>
      </div>
    );
  }
  return (
    <button type="button" onClick={handleAdd} disabled={!canOrder || isSoldOut}
      className={`flex items-center justify-center rounded-full bg-kiln text-ash transition hover:bg-kiln-light active:scale-90 disabled:opacity-20 disabled:cursor-not-allowed shadow-soft shrink-0 ${compact ? "h-10 w-10 min-h-[44px] min-w-[44px]" : "h-11 w-11 min-h-[44px] min-w-[44px]"}`}
      style={bumpStyle}>
      <Plus className="h-5 w-5" />
    </button>
  );
}
