import { ShoppingBag, Users, Store, Heart } from "lucide-react";

const items = [
  { icon: ShoppingBag, label: "窑烤预订", desc: "提前一晚预订，次日按炉次出炉", href: "#menu" },
  { icon: Users, label: "邻里拼单", desc: "和街坊一起凑满免运，分摊温情", href: "#menu" },
  { icon: Store, label: "多门店自提", desc: "中央窑烤，多点位就近取货", href: "#stores" },
  { icon: Heart, label: "窑烤故事", desc: "每款面包都有面团背后的时间", href: "#menu" },
];

export function FeatureEntrances() {
  return (
    <section className="bg-white py-14 border-y border-border">
      <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.label}
              href={item.href}
              className="group rounded-2xl bg-ash p-6 transition duration-500 hover:-translate-y-1 hover:shadow-elevated border border-border"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-kiln transition group-hover:bg-kiln group-hover:text-ash shadow-soft">
                <Icon className="h-5 w-5" />
              </span>
              <p className="mt-5 text-base font-semibold text-kiln">{item.label}</p>
              <p className="mt-2 font-hand text-sm leading-relaxed text-muted">{item.desc}</p>
            </a>
          );
        })}
      </div>
    </section>
  );
}
