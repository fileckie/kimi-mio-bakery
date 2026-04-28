import { SkeletonCard } from "./SkeletonCard";

export function SkeletonGrid({ count = 6 }: { count?: number }) {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        {/* Header skeleton */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <div className="h-4 w-24 rounded-full bg-ash shimmer" />
            <div className="h-9 w-48 rounded-full bg-ash shimmer" />
            <div className="h-4 w-64 rounded-full bg-ash shimmer" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-9 w-20 rounded-full bg-ash shimmer" />
            ))}
          </div>
        </div>

        {/* Cards with stagger */}
        <div className="mt-6 sm:mt-8 grid grid-cols-1 gap-3 sm:gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: count }).map((_, i) => (
            <div
              key={i}
              className="animate-skeleton-stagger opacity-0"
              style={{ animationDelay: `${i * 100}ms`, animationFillMode: "forwards" }}
            >
              <SkeletonCard />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
