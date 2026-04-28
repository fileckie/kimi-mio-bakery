import { useState } from "react";
import { Plus, Store } from "lucide-react";
import type { StoreLocation } from "../../../types";
import { api } from "../../../lib/api";
import { useUIStore } from "../../../stores/uiStore";
import { SaveButton, type SaveState } from "./SaveButton";

interface StoreSettingsProps {
  draft: StoreLocation[];
  setDraft: React.Dispatch<React.SetStateAction<StoreLocation[]>>;
  saveState: SaveState;
  onSave: () => void;
  onUpdate: () => void;
}

export function StoreSettings({ draft, setDraft, saveState, onSave, onUpdate }: StoreSettingsProps) {
  const addToast = useUIStore((s) => s.addToast);
  const [newStore, setNewStore] = useState({ name: "", address: "", sourceCode: "", pickupOpen: true });
  const [creatingStore, setCreatingStore] = useState(false);

  return (
    <div className="admin-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="h-5 w-5 text-ember" />
          <div>
            <p className="text-sm font-semibold text-ember">门店</p>
            <h2 className="font-brush text-2xl text-kiln">门店与账号</h2>
          </div>
        </div>
        <SaveButton state={saveState} onClick={onSave} />
      </div>

      <div className="mt-5 grid gap-3">
        {draft.map((s, i) => (
          <div key={s.id} className="rounded-xl bg-ash p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-muted uppercase">{s.id}</span>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  s.role === "central" ? "bg-ember/10 text-ember" : "bg-white text-muted"
                }`}
              >
                {s.role === "central" ? "主门店" : "自提点"}
              </span>
            </div>
            <div className="grid gap-3">
              <input
                className="input-field py-2 text-sm"
                value={s.name}
                onChange={(e) =>
                  setDraft((prev) => prev.map((st, idx) => (idx === i ? { ...st, name: e.target.value } : st)))
                }
                placeholder="门店名称"
              />
              <input
                className="input-field py-2 text-sm"
                value={s.address}
                onChange={(e) =>
                  setDraft((prev) => prev.map((st, idx) => (idx === i ? { ...st, address: e.target.value } : st)))
                }
                placeholder="地址"
              />
              <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
                <input
                  type="checkbox"
                  checked={s.pickupOpen}
                  onChange={(e) =>
                    setDraft((prev) =>
                      prev.map((st, idx) => (idx === i ? { ...st, pickupOpen: e.target.checked } : st))
                    )
                  }
                  className="h-4 w-4 accent-ember"
                />
                开放自提
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Add new store */}
      <div className="mt-5 rounded-xl border-2 border-dashed border-border bg-white p-4">
        <p className="text-sm font-semibold text-kiln mb-3">新增门店</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            className="input-field py-2 text-sm"
            value={newStore.name}
            onChange={(e) => setNewStore((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="门店名称"
          />
          <input
            className="input-field py-2 text-sm"
            value={newStore.sourceCode}
            onChange={(e) => setNewStore((prev) => ({ ...prev, sourceCode: e.target.value }))}
            placeholder="取货码前缀（如 SZ）"
          />
          <input
            className="input-field py-2 text-sm sm:col-span-2"
            value={newStore.address}
            onChange={(e) => setNewStore((prev) => ({ ...prev, address: e.target.value }))}
            placeholder="地址"
          />
        </div>
        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm text-muted cursor-pointer">
            <input
              type="checkbox"
              checked={newStore.pickupOpen}
              onChange={(e) => setNewStore((prev) => ({ ...prev, pickupOpen: e.target.checked }))}
              className="h-4 w-4 accent-ember"
            />
            开放自提
          </label>
          <button
            onClick={async () => {
              if (!newStore.name.trim()) {
                addToast({ type: "error", message: "请输入门店名称" });
                return;
              }
              setCreatingStore(true);
              try {
                await api.createStore({
                  name: newStore.name,
                  address: newStore.address,
                  sourceCode: newStore.sourceCode,
                  pickupOpen: newStore.pickupOpen,
                });
                addToast({ type: "success", message: "门店创建成功" });
                setNewStore({ name: "", address: "", sourceCode: "", pickupOpen: true });
                onUpdate();
              } catch {
                addToast({ type: "error", message: "创建失败" });
              }
              setCreatingStore(false);
            }}
            disabled={creatingStore}
            className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-kiln px-4 py-2 text-sm font-semibold text-ash hover:bg-kiln-light transition disabled:opacity-50"
          >
            <Plus className="h-4 w-4" />
            {creatingStore ? "创建中..." : "创建门店"}
          </button>
        </div>
      </div>
    </div>
  );
}
