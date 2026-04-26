import { useMemo, useState } from "react";
import type { Product, InventoryMap, StoreId } from "../../types";
import { ProductCard } from "./ProductCard";
import { useCartStore } from "../../stores/cartStore";
import { SkeletonGrid } from "../ui/SkeletonGrid";
import { EmptyState } from "../ui/EmptyState";

const categories = ["欧包/坚果", "吐司", "恰巴塔", "贝果/海盐卷", "软欧包"] as const;

interface ProductGridProps {
  products: Product[];
  inventory: InventoryMap;
  batchSaleOpen: boolean;
  pickupStoreId: StoreId;
  isLoading?: boolean;
}

export function ProductGrid({ products, inventory, batchSaleOpen, pickupStoreId, isLoading }: ProductGridProps) {
  const [activeCategory, setActiveCategory] = useState<string>("全部");
  const cartItems = useCartStore((s) => s.items);
  const updateQty = useCartStore((s) => s.updateQty);

  const published = products.filter((p) => p.isPublished);
  const filtered = activeCategory === "全部" ? published : published.filter((p) => p.category === activeCategory);

  const hotRanks = useMemo(() => {
    const sales: Record<string, number> = {};
    Object.entries(inventory).forEach(([pid, alloc]) => {
      sales[pid] = Object.values(alloc.sold).reduce((a, b) => a + b, 0);
    });
    const sorted = Object.entries(sales).sort((a, b) => b[1] - a[1]);
    const ranks: Record<string, number> = {};
    sorted.forEach(([pid], i) => { ranks[pid] = i + 1; });
    return ranks;
  }, [inventory]);

  const getAvailable = (pid: string) => {
    const alloc = inventory[pid];
    if (!alloc) return 0;
    return Math.max(0, alloc.stores[pickupStoreId] - alloc.sold[pickupStoreId]);
  };

  // Show skeleton while loading or no products yet
  if (isLoading || (products.length === 0 && !batchSaleOpen)) {
    return <SkeletonGrid count={6} />;
  }

  return (
    <div className="animate-page-enter">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ember">窑烤面包单</p>
          <h2 className="mt-2 text-3xl font-semibold text-kiln sm:text-4xl">今日可预订</h2>
          <p className="mt-2 font-hand text-sm text-muted">
            {published.length} 款慢火窑烤 · 每款限量，售完即止
          </p>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {["全部", ...categories].map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`press-feedback min-w-fit rounded-full px-4 py-2 text-sm font-medium transition whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-kiln text-ash shadow-soft"
                  : "bg-surface text-kiln/70 hover:bg-dough"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          preset="soldOut"
          action={{ label: "看看其他分类", onClick: () => setActiveCategory("全部") }}
        />
      ) : (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product, i) => (
            <div
              key={product.id}
              className="animate-skeleton-stagger opacity-0"
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}
            >
              <ProductCard
                product={product}
                available={getAvailable(product.id)}
                qty={cartItems[product.id] || 0}
                canOrder={batchSaleOpen}
                onAdd={() => updateQty(product.id, 1, getAvailable(product.id))}
                onRemove={() => updateQty(product.id, -1, getAvailable(product.id))}
                hotRank={hotRanks[product.id]}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
