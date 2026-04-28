import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function DarkModeToggle() {
  const [isDark, setIsDark] = useState(() => {
    try {
      return localStorage.getItem("mio_dark_mode") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const html = document.documentElement;
    if (isDark) {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    try {
      localStorage.setItem("mio_dark_mode", String(isDark));
    } catch {}
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark((d) => !d)}
      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-white text-muted transition hover:border-kiln hover:text-kiln dark:bg-kiln-light dark:border-kiln-light dark:text-ash dark:hover:border-ember dark:hover:text-ember"
      title={isDark ? "切换亮色模式" : "切换暗色模式"}
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
