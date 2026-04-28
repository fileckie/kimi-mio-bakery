import { useState } from "react";
import { X, Sparkles, Zap, Wrench, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { useAppStore } from "../../stores/appStore";
import type { ChangelogEntry } from "../../types";

const typeConfig = {
  feature: { icon: Sparkles, color: "text-ember", bg: "bg-ember/10", label: "新功能" },
  improvement: { icon: Zap, color: "text-amber-600", bg: "bg-amber-50", label: "优化" },
  fix: { icon: Wrench, color: "text-sky-600", bg: "bg-sky-50", label: "修复" },
  breaking: { icon: AlertTriangle, color: "text-rose-600", bg: "bg-rose-50", label: "重大变更" },
};

function ChangelogCard({ entry }: { entry: ChangelogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const config = typeConfig[entry.type] || typeConfig.feature;
  const Icon = config.icon;
  const items = entry.items || [];

  return (
    <div className="rounded-xl border border-border bg-white p-5 shadow-soft transition hover:shadow-elevated">
      <div className="flex items-start gap-4">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${config.bg}`}>
          <Icon className={`h-5 w-5 ${config.color}`} />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${config.bg} ${config.color}`}>
              {config.label}
            </span>
            <span className="text-xs font-mono text-muted">{entry.version}</span>
            <span className="text-xs text-muted">·</span>
            <span className="text-xs text-muted">{entry.date}</span>
          </div>
          <h3 className="mt-1.5 font-semibold text-kiln">{entry.title}</h3>

          {items.length > 0 && (
            <div className="mt-2">
              {expanded || items.length <= 2 ? (
                <ul className="space-y-1.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-kiln/60" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted line-clamp-1">{items[0]}…</p>
              )}
              {items.length > 2 && (
                <button
                  onClick={() => setExpanded(!expanded)}
                  className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-kiln hover:text-kiln-light transition"
                >
                  {expanded ? (
                    <>收起 <ChevronUp className="h-3 w-3" /></>
                  ) : (
                    <>展开 {items.length} 项 <ChevronDown className="h-3 w-3" /></>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChangelogDrawer({ onClose }: { onClose: () => void }) {
  const { changelog } = useAppStore();
  const [filter, setFilter] = useState<"all" | ChangelogEntry["type"]>();

  const filtered = filter && filter !== "all"
    ? changelog.filter((c) => c.type === filter)
    : changelog;

  return (
    <div className="fixed inset-0 z-[60] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      {/* Drawer */}
      <div className="relative w-full max-w-lg sm:max-w-lg bg-ash shadow-2xl flex flex-col animate-slide-in-right">
        <div className="flex items-center justify-between border-b border-border bg-white px-6 py-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-ember" />
            <h2 className="font-brush text-2xl text-kiln">更新日志</h2>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-ash transition">
            <X className="h-5 w-5 text-muted" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            {(["all", "feature", "improvement", "fix", "breaking"] as const).map((key) => (
              <button
                key={key}
                onClick={() => setFilter(key === "all" ? undefined : key)}
                className={`rounded-full px-3 py-1.5 text-xs font-medium transition border ${
                  (filter === key) || (key === "all" && !filter)
                    ? "border-kiln bg-kiln text-ash"
                    : "border-border bg-white text-muted hover:text-kiln"
                }`}
              >
                {key === "all" ? "全部" : typeConfig[key]?.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center">
              <Sparkles className="mx-auto h-10 w-10 text-muted/40" />
              <p className="mt-4 font-brush text-xl text-muted">暂无更新记录</p>
              <p className="mt-1 font-hand text-sm text-muted">窑火正旺，敬请期待新功能</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {filtered.map((entry) => (
                <ChangelogCard key={entry.id} entry={entry} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
