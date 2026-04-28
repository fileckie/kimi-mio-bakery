import { Flame, ClipboardList, ReceiptText } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import { DarkModeToggle } from "../ui/DarkModeToggle";
import type { RoleId, StoreLocation } from "../../types";

interface AdminHeaderProps {
  stores: StoreLocation[];
}

export function AdminHeader({ stores }: AdminHeaderProps) {
  const { route, setRoute, activeRole, setActiveRole, batchSale } = useAppStore();

  const roleOptions = [
    { id: "hq" as RoleId, name: "总部账号" },
    ...stores.map((s) => ({ id: s.id as RoleId, name: s.name })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/92 backdrop-blur-xl paper-texture">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-5 py-3 sm:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-kiln text-ash shadow-glow">
            <Flame className="h-4 w-4 animate-flicker" />
          </span>
          <div className="min-w-0">
            <p className="font-brush text-lg text-kiln truncate leading-tight">Mio 窑房</p>
            <p className="font-hand text-[11px] text-muted truncate">
              第 {batchSale.batchSequence || 1} 窑 · {batchSale.isOpen ? "开窑中" : "已封窑"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <select className="input-field h-9 min-w-0 max-w-[120px] sm:max-w-none sm:min-w-44 rounded-full py-0 text-xs sm:text-sm truncate" value={activeRole} onChange={(e) => setActiveRole(e.target.value as RoleId)}>
            {roleOptions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button onClick={() => setRoute("/admin")} className={`admin-nav-button hidden sm:inline-flex ${route === "/admin" ? "bg-kiln text-ash" : "bg-white text-kiln border border-border"}`}>
            <ClipboardList className="h-4 w-4" />后台
          </button>
          <button onClick={() => setRoute("/admin/pos")} className={`admin-nav-button ${route === "/admin/pos" ? "bg-kiln text-ash" : "bg-white text-kiln border border-border"}`}>
            <ReceiptText className="h-4 w-4" /><span className="hidden sm:inline">收银</span>
          </button>
          <DarkModeToggle />
        </div>
      </div>
    </header>
  );
}
