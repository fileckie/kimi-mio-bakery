import { Flame } from "lucide-react";
import { SaveButton, type SaveState } from "./SaveButton";

interface BatchDraft {
  isOpen: boolean;
  defaultDeadline: string;
  deadline: string;
  ovenBatch: string;
  freeShippingThreshold: number;
  baseShippingFee: number;
}

interface BatchSettingsProps {
  draft: BatchDraft;
  setDraft: React.Dispatch<React.SetStateAction<BatchDraft>>;
  saveState: SaveState;
  onSave: () => void;
}

export function BatchSettings({ draft, setDraft, saveState, onSave }: BatchSettingsProps) {
  return (
    <div className="admin-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-ember" />
          <div>
            <p className="text-sm font-semibold text-ember">批次</p>
            <h2 className="font-brush text-2xl text-kiln">本轮预订设置</h2>
          </div>
        </div>
        <SaveButton state={saveState} onClick={onSave} />
      </div>

      <div className="mt-5 space-y-4">
        <label className="flex items-center justify-between rounded-xl bg-ash p-4 cursor-pointer">
          <span>
            <span className="block font-semibold text-kiln">开放顾客下单</span>
            <span className="font-hand text-sm text-muted">关闭后只能浏览产品</span>
          </span>
          <input
            type="checkbox"
            checked={draft.isOpen}
            onChange={(e) => setDraft((d) => ({ ...d, isOpen: e.target.checked }))}
            className="h-5 w-5 accent-ember"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-2 block text-muted">默认截单时间</span>
            <input
              className="input-field"
              type="time"
              value={draft.defaultDeadline}
              onChange={(e) => setDraft((d) => ({ ...d, defaultDeadline: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="mb-2 block text-muted">本轮截止时间文案</span>
            <input
              className="input-field"
              value={draft.deadline}
              onChange={(e) => setDraft((d) => ({ ...d, deadline: e.target.value }))}
              placeholder="如今晚 21:30"
            />
          </label>
        </div>

        <label className="text-sm">
          <span className="mb-2 block text-muted">出炉批次描述</span>
          <input
            className="input-field"
            value={draft.ovenBatch}
            onChange={(e) => setDraft((d) => ({ ...d, ovenBatch: e.target.value }))}
            placeholder="如明日 10:30 / 16:30 出炉"
          />
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-2 block text-muted">免运门槛（元）</span>
            <input
              className="input-field"
              type="number"
              value={draft.freeShippingThreshold}
              onChange={(e) => setDraft((d) => ({ ...d, freeShippingThreshold: Number(e.target.value) }))}
            />
          </label>
          <label className="text-sm">
            <span className="mb-2 block text-muted">基础运费（元）</span>
            <input
              className="input-field"
              type="number"
              value={draft.baseShippingFee}
              onChange={(e) => setDraft((d) => ({ ...d, baseShippingFee: Number(e.target.value) }))}
            />
          </label>
        </div>
      </div>
    </div>
  );
}
