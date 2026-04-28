import { Printer, QrCode } from "lucide-react";
import { SaveButton, type SaveState } from "./SaveButton";
import { readImageFile } from "../../../lib/utils";

interface PrintDraft {
  printLogoUrl: string;
  printPrimaryColor: string;
}

interface PrintSettingsProps {
  draft: PrintDraft;
  setDraft: React.Dispatch<React.SetStateAction<PrintDraft>>;
  saveState: SaveState;
  onSave: () => void;
}

export function PrintSettings({ draft, setDraft, saveState, onSave }: PrintSettingsProps) {
  return (
    <div className="admin-panel">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Printer className="h-5 w-5 text-ember" />
          <div>
            <p className="text-sm font-semibold text-ember">打印</p>
            <h2 className="font-brush text-2xl text-kiln">打印模板</h2>
          </div>
        </div>
        <SaveButton state={saveState} onClick={onSave} />
      </div>
      <div className="mt-4 grid gap-3">
        <label className="text-sm">
          <span className="mb-1.5 block text-xs text-muted">主题色（用于生产单数量、印章等）</span>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={draft.printPrimaryColor}
              onChange={(e) => setDraft((d) => ({ ...d, printPrimaryColor: e.target.value }))}
              className="h-9 w-9 rounded-lg border border-border cursor-pointer"
            />
            <input
              className="input-field py-2 text-sm flex-1"
              value={draft.printPrimaryColor}
              onChange={(e) => setDraft((d) => ({ ...d, printPrimaryColor: e.target.value }))}
              placeholder="#E84A2E"
            />
          </div>
        </label>
        <div className="flex items-center gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold shadow-soft border border-border hover:bg-ash transition">
            <QrCode className="h-4 w-4" />上传 Logo
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] &&
                readImageFile(e.target.files[0]).then((url) => setDraft((d) => ({ ...d, printLogoUrl: url })))
              }
            />
          </label>
          {draft.printLogoUrl && (
            <button
              onClick={() => setDraft((d) => ({ ...d, printLogoUrl: "" }))}
              className="text-xs text-muted hover:text-ember transition"
            >
              移除 Logo
            </button>
          )}
        </div>
        {draft.printLogoUrl && (
          <img
            src={draft.printLogoUrl}
            alt="Logo 预览"
            className="h-16 w-auto rounded-xl border border-border object-contain bg-white"
          />
        )}
      </div>
    </div>
  );
}
