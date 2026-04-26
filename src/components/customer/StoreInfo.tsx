import { MapPin, Clock, Flame } from "lucide-react";
import type { StoreLocation } from "../../types";

interface StoreInfoProps {
  stores: StoreLocation[];
}

export function StoreInfo({ stores }: StoreInfoProps) {
  return (
    <section id="stores" className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mb-10">
          <p className="text-sm font-semibold text-ember">取货点位</p>
          <h2 className="mt-2 text-3xl font-semibold text-kiln">中央窑烤，就近自提</h2>
          <p className="mt-3 font-hand text-sm text-muted max-w-xl">
            面包从同一座窑中出炉，按订单分装到各门店。你选择最方便的点位，我们在约定时间把面包送到。
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((store, i) => (
            <div
              key={store.id}
              className={`group rounded-2xl border p-5 transition hover:shadow-card hover:-translate-y-0.5 hover-lift animate-rise ${
                store.role === "central"
                  ? "border-ember/30 bg-white ring-1 ring-ember/10"
                  : "border-border bg-ash"
              }`}
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="flex items-center gap-2 text-xs font-semibold text-smoke uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5" />
                {store.role === "central" ? "主门店" : "自提点"}
                {store.role === "central" && (
                  <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-ember/10 px-2 py-0.5 text-[10px] text-ember">
                    <Flame className="h-3 w-3 animate-flicker" />
                    窑烤主场
                  </span>
                )}
              </div>
              <p className="mt-3 text-lg font-semibold text-kiln">{store.name}</p>
              <p className="mt-1 text-sm text-muted">{store.address}</p>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted">
                <Clock className="h-3.5 w-3.5" />
                <span>取货暗号 {store.sourceCode}</span>
              </div>
              <div className="mt-3">
                <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${store.pickupOpen ? "bg-green-50 text-green-700" : "bg-stone-100 text-stone-600"}`}>
                  {store.pickupOpen ? "接受自提" : "暂停自提"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
