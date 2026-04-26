import { Flame } from "lucide-react";

export function LoadingShell() {
  return (
    <main className="flex min-h-[70svh] items-center justify-center px-4 py-24">
      <div className="relative rounded-2xl border border-border bg-white p-10 text-center shadow-soft overflow-hidden">
        {/* 背景暖光 */}
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-ember/10 blur-2xl" />
        <div className="relative">
          <div className="relative mx-auto h-14 w-14">
            <Flame className="h-14 w-14 text-ember animate-flicker" />
          </div>
          <p className="mt-6 font-brush text-2xl text-kiln">正在唤醒窑火</p>
          <p className="mt-2 font-hand text-sm text-muted">面团需要等待，数据也是</p>
        </div>
      </div>
    </main>
  );
}
