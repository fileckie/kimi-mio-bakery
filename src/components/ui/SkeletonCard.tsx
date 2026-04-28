export function SkeletonCard() {
  return (
    <article className="group relative overflow-hidden rounded-2xl border border-border bg-white">
      {/* Mobile: vertical layout */}
      <div className="sm:hidden">
        <div className="relative h-32 overflow-hidden bg-ash shimmer" />
        <div className="p-4">
          <div className="flex items-baseline justify-between gap-2">
            <div className="h-4 w-2/3 rounded-full bg-ash shimmer" />
            <div className="h-5 w-12 rounded-full bg-ash shimmer shrink-0" />
          </div>
          <div className="mt-1 h-3 w-16 rounded-full bg-ash shimmer" />
          <div className="mt-2 space-y-1.5">
            <div className="h-3 w-full rounded-full bg-ash shimmer" />
            <div className="h-3 w-3/4 rounded-full bg-ash shimmer" />
          </div>
          <div className="mt-1.5 flex gap-1">
            <div className="h-4 w-14 rounded-full bg-ash shimmer" />
            <div className="h-4 w-16 rounded-full bg-ash shimmer" />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="h-3.5 w-20 rounded-full bg-ash shimmer" />
            <div className="h-8 w-8 rounded-full bg-ash shimmer" />
          </div>
        </div>
      </div>

      {/* Desktop: vertical card layout */}
      <div className="hidden sm:block">
        <div className="relative h-36 overflow-hidden bg-ash shimmer" />
        <div className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 rounded-full bg-ash shimmer" />
              <div className="h-3 w-1/3 rounded-full bg-ash shimmer" />
            </div>
            <div className="h-5 w-12 rounded-full bg-ash shimmer shrink-0" />
          </div>
          <div className="mt-3 space-y-1.5">
            <div className="h-3 w-full rounded-full bg-ash shimmer" />
            <div className="h-3 w-2/3 rounded-full bg-ash shimmer" />
          </div>
          <div className="mt-3 flex gap-1.5">
            <div className="h-5 w-14 rounded-full bg-ash shimmer" />
            <div className="h-5 w-16 rounded-full bg-ash shimmer" />
            <div className="h-5 w-12 rounded-full bg-ash shimmer" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div className="h-3.5 w-20 rounded-full bg-ash shimmer" />
            <div className="h-9 w-9 rounded-full bg-ash shimmer" />
          </div>
        </div>
      </div>
    </article>
  );
}
