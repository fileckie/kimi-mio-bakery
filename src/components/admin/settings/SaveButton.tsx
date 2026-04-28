import { Save, Loader2 } from "lucide-react";

export type SaveState = "idle" | "saving" | "saved";

interface SaveButtonProps {
  state: SaveState;
  onClick: () => void;
}

export function SaveButton({ state, onClick }: SaveButtonProps) {
  const base = "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition shadow-soft";
  if (state === "saved") {
    return (
      <span className={`${base} bg-green-50 text-green-700`}>
        <Save className="h-4 w-4" />已保存
      </span>
    );
  }
  if (state === "saving") {
    return (
      <span className={`${base} bg-ash text-muted cursor-not-allowed`}>
        <Loader2 className="h-4 w-4 animate-spin" />保存中...
      </span>
    );
  }
  return (
    <button onClick={onClick} className={`${base} bg-kiln text-ash hover:bg-kiln-light`}>
      <Save className="h-4 w-4" />保存
    </button>
  );
}
