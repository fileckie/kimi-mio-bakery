import { useRef, useCallback } from "react";

interface SwipeConfig {
  threshold?: number;
  direction?: "left" | "right" | "both";
  onSwipe?: (direction: "left" | "right") => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
}

export function useSwipe({ threshold = 80, direction = "both", onSwipe, onSwipeStart, onSwipeEnd }: SwipeConfig) {
  const startX = useRef(0);
  const currentX = useRef(0);
  const isSwiping = useRef(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      startX.current = e.touches[0].clientX;
      currentX.current = startX.current;
      isSwiping.current = true;
      onSwipeStart?.();
    },
    [onSwipeStart]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isSwiping.current) return;
      currentX.current = e.touches[0].clientX;
    },
    []
  );

  const handleTouchEnd = useCallback(() => {
    if (!isSwiping.current) return;
    isSwiping.current = false;

    const delta = currentX.current - startX.current;
    const absDelta = Math.abs(delta);

    if (absDelta < threshold) {
      onSwipeEnd?.();
      return;
    }

    if (delta < 0 && (direction === "left" || direction === "both")) {
      onSwipe?.("left");
    } else if (delta > 0 && (direction === "right" || direction === "both")) {
      onSwipe?.("right");
    }
    onSwipeEnd?.();
  }, [threshold, direction, onSwipe, onSwipeEnd]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}
