import { useState, useEffect, useRef } from "react";

interface Props {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

export function CountUp({ value, duration = 600, className = "", prefix = "", suffix = "" }: Props) {
  const [display, setDisplay] = useState(value);
  const prevValue = useRef(value);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const start = prevValue.current;
    const end = value;
    const startTime = performance.now();

    if (start === end) return;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      setDisplay(current);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        prevValue.current = end;
      }
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return (
    <span className={`count-up ${className}`}>
      {prefix}{display}{suffix}
    </span>
  );
}
