import { Settings2, ClipboardList, ReceiptText } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import type { RoleId, StoreLocation } from "../../types";

interface AdminHeaderProps {
  stores: StoreLocation[];
}

export function AdminHeader({ stores }: AdminHeaderProps) {
  const { route, setRoute, activeRole, setActiveRole } = useAppStore();

  const roleOptions = [
    { id: "hq" as RoleId, name: "总部账号" },
    ...stores.map((s) => ({ id: s.id as RoleId, name: s.name })),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-white/92 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-kiln text-ash">
            <Settings2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-kiln">Mio SLOWFIRE 窑房管理</p>
            <p className="font-hand text-xs text-muted">总部与门店共用的窑烤运营入口</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select className="input-field h-10 min-w-44 rounded-full py-0 text-sm" value={activeRole} onChange={(e) => setActiveRole(e.target.value as RoleId)}>
            {roleOptions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
          <button onClick={() => setRoute("/admin")} className={`admin-nav-button ${route === "/admin" ? "bg-kiln text-ash" : "bg-white text-kiln border border-border"}`}>
            <ClipboardList className="h-4 w-4" />后台
          </button>
          <button onClick={() => setRoute("/admin/pos")} className={`admin-nav-button ${route === "/admin/pos" ? "bg-kiln text-ash" : "bg-white text-kiln border border-border"}`}>
            <ReceiptText className="h-4 w-4" />收银
          </button>
        </div>
      </div>
    </header>
  );
}
