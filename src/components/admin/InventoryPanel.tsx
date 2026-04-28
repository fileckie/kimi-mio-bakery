import type { Product, InventoryMap, StoreLocation } from "../../types";
import { api } from "../../lib/api";

interface InventoryPanelProps {
  products: Product[];
  inventory: InventoryMap;
  stores: StoreLocation[];
  isHq: boolean;
  onUpdate: () => void;
}

export function InventoryPanel({ products, inventory, stores, isHq, onUpdate }: InventoryPanelProps) {
  const updateStock = async (productId: string, storeId: string, value: number) => {
    if (!isHq) return;
    try { await api.updateInventory(productId, storeId, Math.max(0, value)); onUpdate(); } catch { alert("库存保存失败"); }
  };

  const displayProducts = products.slice(0, isHq ? products.length : 8);

  return (
    <div className="admin-panel">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ember">库存</p>
          <h2 className="mt-1 font-brush text-3xl text-kiln">库存分配</h2>
        </div>
        {!isHq && <span className="rounded-full bg-ash px-4 py-2 text-sm text-muted">门店只读</span>}
      </div>
      <p className="mt-2 font-hand text-sm text-muted">总部设置各产品总量，系统自动按门店汇总</p>

      {/* Desktop table */}
      <div className="hidden sm:mt-5 sm:block overflow-x-auto table-scroll-hint">
        <table className="min-w-[800px] w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-3 font-medium">商品</th>
              <th className="py-3 font-medium">已售/总量</th>
              {stores.map((s) => <th key={s.id} className="py-3 font-medium">{s.name}</th>)}
            </tr>
          </thead>
          <tbody>
            {displayProducts.map((p) => {
              const totalAlloc = Object.values(inventory[p.id]?.stores || {}).reduce((a, b) => a + b, 0);
              const totalSold = Object.values(inventory[p.id]?.sold || {}).reduce((a, b) => a + b, 0);
              return (
                <tr key={p.id} className="border-t border-border">
                  <td className="py-3">
                    <span className="font-medium text-kiln">{p.name}</span>
                    <span className="ml-2 text-xs text-muted">{p.weight}</span>
                  </td>
                  <td className="py-3 text-muted">
                    <span className={totalSold >= totalAlloc ? "text-ember font-semibold" : ""}>{totalSold}</span>
                    <span className="text-muted"> / {totalAlloc}</span>
                  </td>
                  {stores.map((s) => {
                    const alloc = inventory[p.id]?.stores[s.id] ?? 0;
                    const sold = inventory[p.id]?.sold[s.id] ?? 0;
                    const remaining = Math.max(0, alloc - sold);
                    return (
                      <td key={s.id} className="py-3">
                        {isHq ? (
                          <div className="flex items-center gap-2">
                            <input
                              className="input-field w-20 py-1.5 text-sm"
                              type="number"
                              min="0"
                              value={alloc}
                              onChange={(e) => updateStock(p.id, s.id, Number(e.target.value))}
                            />
                            <span className={`text-xs ${remaining <= 2 ? "text-ember font-semibold" : "text-muted"}`}>
                              余{remaining}
                            </span>
                          </div>
                        ) : (
                          <span className={remaining <= 2 ? "font-semibold text-ember" : "text-kiln"}>
                            {remaining} 剩余
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="mt-4 grid gap-3 sm:hidden">
        {displayProducts.map((p) => {
          const totalAlloc = Object.values(inventory[p.id]?.stores || {}).reduce((a, b) => a + b, 0);
          const totalSold = Object.values(inventory[p.id]?.sold || {}).reduce((a, b) => a + b, 0);
          const totalRemaining = Math.max(0, totalAlloc - totalSold);
          return (
            <div key={p.id} className="rounded-xl border border-border bg-white p-4 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-kiln">{p.name}</p>
                  <p className="text-xs text-muted">{p.weight}</p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-semibold ${totalRemaining <= 2 ? "text-ember" : "text-kiln"}`}>
                    余 {totalRemaining}
                  </p>
                  <p className="text-[11px] text-muted">已售 {totalSold} / {totalAlloc}</p>
                </div>
              </div>
              <div className="mt-3 grid gap-2">
                {stores.map((s) => {
                  const alloc = inventory[p.id]?.stores[s.id] ?? 0;
                  const sold = inventory[p.id]?.sold[s.id] ?? 0;
                  const remaining = Math.max(0, alloc - sold);
                  return (
                    <div key={s.id} className="flex items-center justify-between rounded-lg bg-ash px-3 py-2">
                      <span className="text-xs text-muted">{s.name}</span>
                      {isHq ? (
                        <div className="flex items-center gap-2">
                          <input
                            className="input-field w-16 py-1 text-xs text-center"
                            type="number"
                            min="0"
                            value={alloc}
                            onChange={(e) => updateStock(p.id, s.id, Number(e.target.value))}
                          />
                          <span className={`text-[11px] ${remaining <= 2 ? "text-ember font-semibold" : "text-muted"}`}>
                            余{remaining}
                          </span>
                        </div>
                      ) : (
                        <span className={`text-sm font-semibold ${remaining <= 2 ? "text-ember" : "text-kiln"}`}>
                          {remaining}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
