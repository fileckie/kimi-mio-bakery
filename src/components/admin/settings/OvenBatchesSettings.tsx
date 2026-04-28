import { Plus } from "lucide-react";
import type { OvenBatch, Product } from "../../../types";
import { SaveButton, type SaveState } from "./SaveButton";

interface OvenBatchesSettingsProps {
  draft: OvenBatch[];
  setDraft: React.Dispatch<React.SetStateAction<OvenBatch[]>>;
  products: Product[];
  saveState: SaveState;
  onSave: () => void;
}

export function OvenBatchesSettings({ draft, setDraft, products, saveState, onSave }: OvenBatchesSettingsProps) {
  const addBatch = () => {
    setDraft((prev) => [
      ...prev,
      { id: `batch-${Date.now()}`, label: `第${prev.length + 1}炉`, time: "18:30", productIds: [] },
    ]);
  };

  const removeBatch = (id: string) => setDraft((prev) => prev.filter((b) => b.id !== id));

  const updateBatchField = (id: string, patch: Partial<OvenBatch>) => {
    setDraft((prev) => prev.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  };

  const toggleBatchProduct = (batchId: string, productId: string) => {
    setDraft((prev) =>
      prev.map((b) => {
        if (b.id !== batchId) return b;
        const has = b.productIds.includes(productId);
        return { ...b, productIds: has ? b.productIds.filter((id) => id !== productId) : [...b.productIds, productId] };
      })
    );
  };

  return (
    <div className="admin-panel">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-ember">炉次</p>
          <h2 className="font-brush text-2xl text-kiln">出炉批次管理</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={addBatch}
            className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow-soft border border-border hover:bg-ash transition"
          >
            <Plus className="h-3 w-3" />增加
          </button>
          <SaveButton state={saveState} onClick={onSave} />
        </div>
      </div>

      <div className="mt-4 space-y-4">
        {draft.map((batch) => (
          <div key={batch.id} className="rounded-xl border border-border bg-white p-3">
            <div className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
              <input
                className="input-field py-2 text-sm"
                value={batch.label}
                onChange={(e) => updateBatchField(batch.id, { label: e.target.value })}
                placeholder="炉次名称"
              />
              <input
                className="input-field py-2 text-sm"
                value={batch.time}
                onChange={(e) => updateBatchField(batch.id, { time: e.target.value })}
                placeholder="时间"
              />
              <button
                onClick={() => removeBatch(batch.id)}
                className="rounded-full bg-surface px-3 py-2 text-xs font-semibold text-muted hover:text-ember transition"
              >
                删除
              </button>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {products.map((p) => (
                <button
                  key={p.id}
                  onClick={() => toggleBatchProduct(batch.id, p.id)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    batch.productIds.includes(p.id) ? "bg-kiln text-ash" : "bg-ash text-muted hover:bg-clay"
                  }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
