import { Type } from "lucide-react";
import { SaveButton, type SaveState } from "./SaveButton";

interface CopyDraft {
  checkoutTitle: string;
  checkoutSubtitle: string;
  checkoutEmptyHint: string;
  closedMessage: string;
  memberLabel: string;
  memberHint: string;
  successTitle: string;
  successMessage: string;
  footerTagline: string;
}

interface CopySettingsProps {
  draft: CopyDraft;
  setDraft: React.Dispatch<React.SetStateAction<CopyDraft>>;
  saveState: SaveState;
  onSave: () => void;
}

export function CopySettings({ draft, setDraft, saveState, onSave }: CopySettingsProps) {
  return (
    <div className="admin-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Type className="h-5 w-5 text-ember" />
          <div>
            <p className="text-sm font-semibold text-ember">文案</p>
            <h2 className="font-brush text-2xl text-kiln">页面文案定制</h2>
          </div>
        </div>
        <SaveButton state={saveState} onClick={onSave} />
      </div>

      <div className="mt-4 grid gap-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-xs text-muted">下单面板英文标题</span>
            <input
              className="input-field py-2 text-sm"
              value={draft.checkoutTitle}
              onChange={(e) => setDraft((d) => ({ ...d, checkoutTitle: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-xs text-muted">下单面板中文副标题</span>
            <input
              className="input-field py-2 text-sm"
              value={draft.checkoutSubtitle}
              onChange={(e) => setDraft((d) => ({ ...d, checkoutSubtitle: e.target.value }))}
            />
          </label>
        </div>
        <label className="text-sm">
          <span className="mb-1.5 block text-xs text-muted">空购物车提示</span>
          <input
            className="input-field py-2 text-sm"
            value={draft.checkoutEmptyHint}
            onChange={(e) => setDraft((d) => ({ ...d, checkoutEmptyHint: e.target.value }))}
          />
        </label>
        <label className="text-sm">
          <span className="mb-1.5 block text-xs text-muted">截单后提示文案</span>
          <input
            className="input-field py-2 text-sm"
            value={draft.closedMessage}
            onChange={(e) => setDraft((d) => ({ ...d, closedMessage: e.target.value }))}
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-xs text-muted">会员区英文标签</span>
            <input
              className="input-field py-2 text-sm"
              value={draft.memberLabel}
              onChange={(e) => setDraft((d) => ({ ...d, memberLabel: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-xs text-muted">会员区提示文案</span>
            <input
              className="input-field py-2 text-sm"
              value={draft.memberHint}
              onChange={(e) => setDraft((d) => ({ ...d, memberHint: e.target.value }))}
            />
          </label>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-xs text-muted">成功弹窗英文标题</span>
            <input
              className="input-field py-2 text-sm"
              value={draft.successTitle}
              onChange={(e) => setDraft((d) => ({ ...d, successTitle: e.target.value }))}
            />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-xs text-muted">成功弹窗底部文案</span>
            <input
              className="input-field py-2 text-sm"
              value={draft.successMessage}
              onChange={(e) => setDraft((d) => ({ ...d, successMessage: e.target.value }))}
            />
          </label>
        </div>
        <label className="text-sm">
          <span className="mb-1.5 block text-xs text-muted">页脚标语</span>
          <input
            className="input-field py-2 text-sm"
            value={draft.footerTagline}
            onChange={(e) => setDraft((d) => ({ ...d, footerTagline: e.target.value }))}
          />
        </label>
      </div>
    </div>
  );
}
