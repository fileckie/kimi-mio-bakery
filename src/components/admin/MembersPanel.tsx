import { useState, useEffect } from "react";
import { Search, User, ShoppingBag } from "lucide-react";
import { api } from "../../lib/api";
import type { Customer } from "../../types";

interface MemberWithStats extends Customer {
  orderCount: number;
  totalSpent: number;
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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input className="input-field pl-9 py-2 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="搜索姓名或手机号" />
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((member) => (
          <div key={member.id} className="rounded-2xl border border-border bg-white p-5 shadow-soft transition hover:shadow-elevated">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ash">
                  <User className="h-5 w-5 text-kiln" />
                </div>
                <div>
                  <p className="font-semibold text-kiln">{member.name}</p>
                  <p className="text-xs text-muted">{member.phone}</p>
                </div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-muted">
                <ShoppingBag className="h-3.5 w-3.5" />
                <span>{member.orderCount} 单</span>
              </div>
              <div className="text-kiln font-semibold">
                ¥{member.totalSpent}
              </div>
            </div>
            {member.createdAt && (
              <p className="mt-2 text-[11px] text-muted">
                注册于 {new Date(member.createdAt).toLocaleDateString("zh-CN")}
              </p>
            )}
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="mt-8 text-center py-8">
          <p className="font-hand text-muted">没有找到会员</p>
        </div>
      )}
    </div>
  );
}
