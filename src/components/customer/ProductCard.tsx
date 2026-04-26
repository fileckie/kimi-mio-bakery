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
  hotRank?: number;
}

export function ProductCard({ product, available, qty, canOrder, onAdd, onRemove, hotRank }: ProductCardProps) {
  const isLowStock = available > 0 && available <= 3;
  const isSoldOut = available === 0;

  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-white transition hover:shadow-elevated hover:-translate-y-0.5">
      <ProductVisual product={product} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-base font-semibold text-kiln">{product.name}</h3>
            <p className="mt-0.5 text-xs text-muted">{product.weight}</p>
          </div>
          <span className="text-lg font-bold text-ember">¥{product.price}</span>
        </div>

        <p className="mt-2 text-xs text-muted line-clamp-2 leading-relaxed">{product.description}</p>

        <div className="mt-1 flex flex-wrap gap-1">
          {product.ingredients.slice(0, 3).map((ing) => (
            <span key={ing} className="rounded-full bg-ash px-2 py-0.5 text-[10px] text-smoke">
              {ing}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex flex-col">
            {isSoldOut ? (
              <span className="font-brush text-sm text-smoke-light">已认领完</span>
            ) : (
              <>
                <span className={`text-xs ${isLowStock ? "font-brush text-ember" : "text-muted"}`}>
                  {isLowStock ? `仅剩 ${available} 个` : `待认领 ${available}`}
                </span>
                {hotRank && hotRank <= 3 && (
                  <span className="mt-0.5 inline-flex items-center gap-1 font-brush text-[11px] text-ember">
                    <TrendingUp className="h-3 w-3" />
                    窑火热门第{hotRank}
                  </span>
                )}
              </>
            )}
          </div>

          {qty > 0 ? (
            <div className="flex items-center gap-1.5 rounded-full bg-ash p-1">
              <button type="button" onClick={onRemove} className="counter-button h-8 w-8" aria-label="减少">
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="w-6 text-center text-sm font-bold text-kiln">{qty}</span>
              <button
                type="button"
                onClick={onAdd}
                disabled={!canOrder || qty >= available}
                className="counter-button h-8 w-8 bg-ember text-white hover:bg-ember-dim disabled:opacity-30"
                aria-label="增加"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onAdd}
              disabled={!canOrder || isSoldOut}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-kiln text-ash transition hover:bg-kiln-light disabled:opacity-20 disabled:cursor-not-allowed shadow-soft"
            >
              <Plus className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
