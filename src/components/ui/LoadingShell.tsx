export function LoadingShell() {
  return (
    <main className="flex min-h-[80svh] items-center justify-center px-4 py-24 relative overflow-hidden">
      {/* 背景暖光层叠 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-ember/5 blur-[100px] animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-wheat/8 blur-[80px] animate-pulse-slow" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative text-center">
        {/* 窑火动画组 */}
        <div className="relative mx-auto h-24 w-24">
          {/* 外圈光晕 */}
          <div className="absolute inset-0 rounded-full bg-ember/10 animate-ping" style={{ animationDuration: "3s" }} />
          <div className="absolute inset-2 rounded-full bg-ember/15 animate-pulse" style={{ animationDuration: "2.5s" }} />
          {/* 中圈 */}
          <div className="absolute inset-4 rounded-full bg-gradient-to-br from-ember/20 to-wheat/10 animate-breath" />
          {/* 核心火焰 */}
          <div className="absolute inset-6 flex items-center justify-center rounded-full bg-gradient-to-br from-ember to-ember-dim shadow-glow animate-flicker">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" className="text-white">
              <path d="M12 2C8 6 6 9 6 12c0 3.31 2.69 6 6 6s6-2.69 6-6c0-3-2-6-6-10z" fill="currentColor" opacity="0.9" />
              <path d="M12 6C10 8.5 9 10.5 9 12c0 1.66 1.34 3 3 3s3-1.34 3-3c0-1.5-1-3.5-3-6z" fill="currentColor" opacity="0.5" />
            </svg>
          </div>
          {/* 火星粒子 */}
          <div className="absolute -top-1 left-1/2 w-1 h-1 rounded-full bg-ember-glow animate-spark" style={{ "--spark-x": "12px", "--spark-y": "-32px" } as React.CSSProperties} />
          <div className="absolute top-2 right-1 w-1.5 h-1.5 rounded-full bg-wheat animate-spark" style={{ "--spark-x": "-16px", "--spark-y": "-28px", animationDelay: "0.5s" } as React.CSSProperties} />
          <div className="absolute top-0 left-2 w-1 h-1 rounded-full bg-ember animate-spark" style={{ "--spark-x": "20px", "--spark-y": "-24px", animationDelay: "1.1s" } as React.CSSProperties} />
        </div>

        {/* 文案 */}
        <div className="mt-8">
          <p className="font-brush text-2xl text-kiln animate-fade-in">正在唤醒窑火</p>
          <p className="mt-3 font-hand text-sm text-muted animate-fade-in" style={{ animationDelay: "0.2s" }}>
            面团需要等待，数据也是
          </p>
        </div>

        {/* 进度条 */}
        <div className="mt-6 mx-auto w-48 h-1 rounded-full bg-clay/40 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-ember to-wheat animate-shimmer" style={{ backgroundSize: "200% 100%" }} />
        </div>
      </div>
    </main>
  );
}
