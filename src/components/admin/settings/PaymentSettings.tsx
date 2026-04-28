import { CreditCard, QrCode } from "lucide-react";
import { SaveButton, type SaveState } from "./SaveButton";
import { readImageFile } from "../../../lib/utils";

interface PaymentDraft {
  paymentWechatId: string;
  paymentInstruction: string;
  paymentQrUrl: string;
}

interface PaymentSettingsProps {
  draft: PaymentDraft;
  setDraft: React.Dispatch<React.SetStateAction<PaymentDraft>>;
  saveState: SaveState;
  onSave: () => void;
}

export function PaymentSettings({ draft, setDraft, saveState, onSave }: PaymentSettingsProps) {
  return (
    <div className="admin-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-ember" />
          <div>
            <p className="text-sm font-semibold text-ember">付款</p>
            <h2 className="font-brush text-2xl text-kiln">付款设置</h2>
          </div>
        </div>
        <SaveButton state={saveState} onClick={onSave} />
      </div>

      <div className="mt-4 grid gap-3">
        <label className="text-sm">
          <span className="mb-2 block text-muted">微信号</span>
          <input
            className="input-field"
            value={draft.paymentWechatId}
            onChange={(e) => setDraft((d) => ({ ...d, paymentWechatId: e.target.value }))}
            placeholder="mio220827"
          />
        </label>
        <label className="text-sm">
          <span className="mb-2 block text-muted">付款说明</span>
          <textarea
            className="input-field min-h-20 resize-none"
            value={draft.paymentInstruction}
            onChange={(e) => setDraft((d) => ({ ...d, paymentInstruction: e.target.value }))}
            placeholder="顾客下单后看到的付款指引"
          />
        </label>
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-soft border border-border hover:bg-ash transition">
            <QrCode className="h-4 w-4" />上传微信二维码
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] &&
                readImageFile(e.target.files[0]).then((url) => setDraft((d) => ({ ...d, paymentQrUrl: url })))
              }
            />
          </label>
          {draft.paymentQrUrl && (
            <button
              onClick={() => setDraft((d) => ({ ...d, paymentQrUrl: "" }))}
              className="text-xs text-muted hover:text-ember transition"
            >
              移除二维码
            </button>
          )}
        </div>
        {draft.paymentQrUrl && (
          <img
            src={draft.paymentQrUrl}
            alt="二维码预览"
            className="h-24 w-24 rounded-xl border border-border object-contain bg-white"
          />
        )}
      </div>
    </div>
  );
}
