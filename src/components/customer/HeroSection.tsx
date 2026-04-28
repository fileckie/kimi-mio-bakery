import { ArrowRight, Flame } from "lucide-react";
import { Countdown } from "../ui/Countdown";
import type { BatchSale, Product, InventoryMap } from "../../types";

interface HeroSectionProps {
  batchSale: BatchSale;
  featuredProducts: Product[];
  inventory: InventoryMap;
}

export function HeroSection({ batchSale, featuredProducts, inventory }: HeroSectionProps) {
  const getAvailable = (pid: string) => {
    const alloc = inventory[pid];
    if (!alloc) return 0;
    return Math.max(0, alloc.stores["store-a"] - alloc.sold["store-a"]);
  };

  return (
    <section id="today" className="relative overflow-hidden bg-ash pt-20 sm:pt-24">
      {/* Warm gradient background — simplified on mobile, full on desktop */}
      <div className="hidden sm:block absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-ember/5 blur-3xl" />
      <div className="hidden sm:block absolute -left-20 top-1/3 h-[400px] w-[400px] rounded-full bg-wheat/10 blur-3xl" />
      <div className="sm:hidden absolute -right-10 -top-10 h-[200px] w-[200px] rounded-full bg-ember/5 blur-2xl" />

      <div className="relative mx-auto flex min-h-0 sm:min-h-[calc(100svh-6rem)] max-w-7xl flex-col justify-center px-5 py-10 sm:py-16 sm:px-8">
        {/* Mobile: compact single-column layout */}
        <div className="sm:hidden text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-ember/20 bg-white px-3 py-1.5 text-[11px] font-semibold text-ember shadow-soft mb-4">
            <Flame className="h-3 w-3" />
            {batchSale.isOpen ? "本轮接受预订中" : "下一炉准备中"}
          </div>
          <h1 className="font-display text-6xl font-bold tracking-tighter text-kiln">Mio</h1>
          <p className="mt-1 font-brush text-2xl text-ember">慢火窑烤面包</p>
          <p className="mt-1 font-hand text-sm text-smoke">不多做，只为你烤</p>

          {batchSale.isOpen && batchSale.deadline.includes(":") && (
            <div className="mt-4">
              <Countdown targetTime={batchSale.deadline.split(" ").pop() || "21:30"} />
            </div>
          )}
        </div>

        {/* Desktop: full layout */}
        <div className="hidden sm:block animate-rise">
          <div className="inline-flex items-center gap-2 rounded-full border border-ember/20 bg-white px-4 py-2 text-xs font-semibold text-ember shadow-soft mb-8">
            <Flame className="h-3.5 w-3.5 animate-flicker" />
            {batchSale.isOpen ? "本轮窑火已点燃，接受预订中" : "窑火渐熄，下一炉准备中"}
          </div>

          <p className="font-serif text-lg italic text-smoke mb-3">SLOWFIRE BAKERY</p>
          <h1 className="font-display text-9xl font-bold tracking-tighter text-kiln break-words overflow-hidden">
            Mio
          </h1>
          <p className="mt-3 font-brush text-5xl text-ember">
            慢火窑烤面包
          </p>
          <p className="mt-2 font-hand text-xl text-smoke">
            不多做，只为你烤
          </p>
          <p className="mt-8 max-w-xl text-base leading-relaxed text-muted">
            我们相信面团需要时间来苏醒。天然酵母在低温中缓慢生长十二小时，
            入窑后以果木慢火烘烤，麦香与焦香在两百度的黑暗中交融。
            每一炉，都有主人。
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#menu"
              className="glow-button inline-flex items-center gap-2 rounded-full bg-ember px-7 py-3.5 text-sm font-semibold text-white transition hover:bg-ember-dim shadow-elevated animate-glow-pulse"
            >
              预订今日窑烤
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </a>
            {batchSale.isOpen && batchSale.deadline.includes(":") && (
              <Countdown targetTime={batchSale.deadline.split(" ").pop() || "21:30"} />
            )}
          </div>
        </div>

        {/* Featured bake cards — desktop only */}
        <div className="hidden sm:grid mt-16 gap-4 sm:grid-cols-2 lg:grid-cols-3 min-w-0">
          {featuredProducts.slice(0, 3).map((product, i) => (
            <a
              key={product.id}
              href="#menu"
              className="group animate-rise stagger-1"
              style={{ animationDelay: `${(i + 1) * 100}ms` }}
            >
              <div className="rounded-2xl border border-border bg-white p-5 transition hover:shadow-elevated hover:-translate-y-1 hover-lift">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ember">本轮窑烤</p>
                    <p className="mt-1 text-lg font-semibold text-kiln">{product.name}</p>
                    <p className="mt-1 text-sm text-muted">{product.weight} · ¥{product.price}</p>
                  </div>
                  <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${product.imageTone} flex items-center justify-center shadow-soft`}>
                    <span className="text-2xl">🍞</span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted">{getAvailable(product.id)} 个待认领</span>
                  <span className="font-semibold text-ember group-hover:underline">去预订 →</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
