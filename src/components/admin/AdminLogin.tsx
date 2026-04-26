import { useState } from "react";
import { Flame, Lock } from "lucide-react";

interface AdminLoginProps {
  onLogin: () => void;
}

export function AdminLogin({ onLogin }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) throw new Error("账号或密码错误");
      const data = await res.json();
      sessionStorage.setItem("mio_admin_token", data.token);
      onLogin();
    } catch {
      setError("账号或密码错误");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-ash flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Animated kiln illustration */}
        <div className="relative mx-auto mb-8 flex h-24 w-24 items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-ember/10 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-2 rounded-full bg-ember/20 animate-pulse" style={{ animationDuration: "2s" }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-kiln text-ash shadow-elevated">
            <Flame className="h-8 w-8 animate-flicker" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-white p-8 shadow-elevated animate-page-enter">
          <div className="text-center">
            <h1 className="font-brush text-2xl text-kiln">窑房管理</h1>
            <p className="mt-1 font-hand text-sm text-muted">Mio SLOWFIRE 运营入口</p>
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-kiln mb-1.5">账号</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="off"
                  data-lpignore="true"
                  className="input-field w-full pl-9"
                  placeholder="输入账号"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-kiln mb-1.5">密码</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="off"
                  data-lpignore="true"
                  className="input-field w-full pl-9"
                  placeholder="输入密码"
                />
              </div>
            </div>

            {error && (
              <p className="text-center text-sm text-ember font-medium animate-shake">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-kiln px-6 py-3 text-sm font-semibold text-ash shadow-soft hover:bg-kiln-light transition disabled:opacity-50 active:scale-[0.98]"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 rounded-full border-2 border-ash/30 border-t-ash animate-spin" />
                  验证中...
                </span>
              ) : (
                <>
                  <Flame className="h-4 w-4" />
                  进入窑房
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center font-hand text-xs text-muted">
          测试账号密码均为 1
        </p>
      </div>
    </div>
  );
}
