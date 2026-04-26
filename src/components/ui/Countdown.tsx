import { useEffect, useState } from "react";

interface CountdownProps {
  targetTime: string;
  label?: string;
}

export function Countdown({ targetTime, label = "截单倒计时" }: CountdownProps) {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => forceUpdate((n) => n + 1), 60000);
    return () => clearInterval(interval);
  }, []);

  const now = new Date();
  const [hours, minutes] = targetTime.split(":").map(Number);
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);
  if (target < now) target.setDate(target.getDate() + 1);

  const diffMins = Math.floor((target.getTime() - now.getTime()) / 60000);
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;

  const isUrgent = diffMins <= 60 && diffMins > 0;

  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
      isUrgent ? "bg-ember/10 text-ember urgency-pulse" : "bg-kiln/5 text-kiln"
    }`}>
      <span className="relative flex h-2 w-2">
        <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${isUrgent ? "animate-ping bg-ember" : "bg-green-500"}`} />
        <span className={`relative inline-flex h-2 w-2 rounded-full ${isUrgent ? "bg-ember" : "bg-green-500"}`} />
      </span>
      <span>{label}</span>
      <span className="tabular-nums">{h > 0 ? `${h}h ${m}m` : `${m}m`}</span>
    </div>
  );
}
