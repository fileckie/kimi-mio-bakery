import { useState, useEffect } from "react";
import { Search, User, ShoppingBag, Download } from "lucide-react";
import { api } from "../../lib/api";
import type { Customer } from "../../types";

interface MemberWithStats extends Customer {
  orderCount: number;
  totalSpent: number;
}

function exportMembersCsv(members: MemberWithStats[]) {
  if (members.length === 0) {
    alert("当前没有会员数据可导出");
    return;
  }
  const rows = members.map((m) => ({
    姓名: m.name,
    手机号: m.phone,
    订单数: m.orderCount,
    消费总额: m.totalSpent,
    注册时间: m.createdAt ? new Date(m.createdAt).toLocaleString("zh-CN") : "-",
  }));
  const headers = Object.keys(rows[0]);
  const csv = [headers.join(","), ...rows.map((r) => headers.map((h) => `"${String((r as Record<string, unknown>)[h]).replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `窑烤会员_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function MembersPanel() {
  const [members, setMembers] = useState<MemberWithStats[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCustomers().then((data) => {
      setMembers(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = members.filter((m) =>
    !filter || m.name.includes(filter) || m.phone.includes(filter)
  );

  if (loading) {
    return (
      <div className="admin-panel text-center py-12">
        <p className="font-hand text-muted">加载会员中...</p>
      </div>
    );
  }

  return (
    <div className="admin-panel">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ember">会员管理</p>
          <h2 className="mt-1 font-brush text-3xl text-kiln">窑烤会员</h2>
          <p className="mt-1 font-hand text-sm text-muted">共 {members.length} 位会员</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input className="input-field pl-9 py-2 text-sm w-full sm:w-56" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="搜索姓名或手机号" />
          </div>
          <button
            onClick={() => exportMembersCsv(filtered)}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-kiln hover:bg-ash transition shadow-soft shrink-0"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">导出</span>
          </button>
        </div>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:mt-5 sm:block overflow-x-auto table-scroll-hint">
        <table className="min-w-[700px] w-full text-left text-sm">
          <thead className="text-muted">
            <tr>
              <th className="py-3 font-medium">会员</th>
              <th className="py-3 font-medium">手机号</th>
              <th className="py-3 font-medium">订单数</th>
              <th className="py-3 font-medium">消费总额</th>
              <th className="py-3 font-medium">注册时间</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((member) => (
              <tr key={member.id} className="border-t border-border hover:bg-ash/50 transition">
                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-ash">
                      <User className="h-4 w-4 text-kiln" />
                    </div>
                    <span className="font-semibold text-kiln">{member.name}</span>
                  </div>
                </td>
                <td className="py-4 text-muted font-mono">{member.phone}</td>
                <td className="py-4">
                  <div className="flex items-center gap-1.5 text-muted">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>{member.orderCount} 单</span>
                  </div>
                </td>
                <td className="py-4 font-semibold text-kiln">¥{member.totalSpent}</td>
                <td className="py-4 text-muted text-xs">
                  {member.createdAt ? new Date(member.createdAt).toLocaleDateString("zh-CN") : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-8 text-center font-hand text-muted">没有找到会员</p>
        )}
      </div>

      {/* Mobile card list */}
      <div className="mt-4 grid gap-3 sm:hidden">
        {filtered.map((member) => (
          <div key={member.id} className="rounded-xl border border-border bg-white p-4 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ash">
                  <User className="h-5 w-5 text-kiln" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-kiln truncate">{member.name}</p>
                  <p className="text-xs text-muted font-mono">{member.phone}</p>
                </div>
              </div>
              <div className="text-right shrink-0 ml-2">
                <p className="font-semibold text-kiln">¥{member.totalSpent}</p>
                <p className="text-xs text-muted">{member.orderCount} 单</p>
              </div>
            </div>
            {member.createdAt && (
              <p className="mt-2 text-[11px] text-muted">
                注册于 {new Date(member.createdAt).toLocaleDateString("zh-CN")}
              </p>
            )}
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-8 text-center">
            <p className="font-hand text-muted">没有找到会员</p>
          </div>
        )}
      </div>
    </div>
  );
}
