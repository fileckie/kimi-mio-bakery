import { MapPin, Clock } from "lucide-react";
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stores.map((store) => (
            <div key={store.id} className="group rounded-2xl border border-border bg-ash p-5 transition hover:shadow-card hover:-translate-y-0.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-smoke uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5" />
                {store.role === "central" ? "中央窑房" : "自提点"}
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
