import { useState, useEffect, useCallback } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { useUIStore } from "../../stores/uiStore";

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const styles = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
};

export function ToastContainer() {
  const toasts = useUIStore((s) => s.toasts);
  const removeToast = useUIStore((s) => s.removeToast);
  const [exitingIds, setExitingIds] = useState<Set<string>>(new Set());

  const handleRemove = useCallback(
    (id: string) => {
      if (exitingIds.has(id)) return;
      setExitingIds((prev) => new Set(prev).add(id));
      setTimeout(() => {
        removeToast(id);
        setExitingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }, 300);
    },
    [exitingIds, removeToast]
  );

  // Auto-dismiss with exit animation
  useEffect(() => {
    toasts.forEach((toast) => {
      if (exitingIds.has(toast.id)) return;
      const duration = toast.duration ?? 3500;
      const timer = setTimeout(() => handleRemove(toast.id), duration);
      return () => clearTimeout(timer);
    });
  }, [toasts, exitingIds, handleRemove]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[90] flex flex-col gap-2">
      {toasts.map((toast) => {
        const Icon = icons[toast.type];
        const isExiting = exitingIds.has(toast.id);
        return (
          <div
            key={toast.id}
            className={`flex items-center gap-3 rounded-xl border px-4 py-3 shadow-elevated ${
              isExiting ? "animate-toast-out" : "animate-toast-in"
            } ${styles[toast.type]}`}
          >
            <Icon className="h-5 w-5 shrink-0" />
            <span className="text-sm font-medium">{toast.message}</span>
            <button
              onClick={() => handleRemove(toast.id)}
              className="ml-2 shrink-0 opacity-60 hover:opacity-100 press-feedback"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
