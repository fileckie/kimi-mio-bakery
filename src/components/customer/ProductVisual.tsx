import type { ReactNode } from "react";
import type { Category, Product } from "../../types";

/* ===== 窑烤色块风 SVG =====
 * 用不规则矩形色块拼接，模拟 risograph 印刷/木刻版画的质感
 * 色块间留缝隙，营造手工拼贴感
 * 色调：焦褐 → 暖棕 → 麦黄
 */

const KILN_COLORS = {
  char: "#9C5D2E",    // 焦痕色
  crust: "#B87333",   // 深 crust
  mid: "#CD853F",     // 中棕
  light: "#D4A574",   // 浅棕
  wheat: "#E8C39E",   // 麦黄
  hole: "#8B5A2B",    // 气孔阴影
};

const breadSvg: Record<Category, ReactNode> = {
  "欧包/坚果": (
    <svg viewBox="0 0 160 100" className="h-20 w-32">
      {/* 底层色块 — 焦痕底 */}
      <rect x="10" y="42" width="140" height="48" rx="4" fill={KILN_COLORS.char} />
      {/* 中层色块 — 深 crust */}
      <rect x="14" y="38" width="132" height="44" rx="3" fill={KILN_COLORS.crust} />
      {/* 主层色块 — 中棕 */}
      <rect x="18" y="34" width="124" height="40" rx="3" fill={KILN_COLORS.mid} />
      {/* 顶色块 — 浅棕 */}
      <rect x="22" y="30" width="116" height="36" rx="2" fill={KILN_COLORS.light} />
      {/* 高光色块 — 麦黄 */}
      <rect x="28" y="28" width="48" height="14" rx="2" fill={KILN_COLORS.wheat} opacity="0.7" />
      <rect x="88" y="30" width="36" height="10" rx="2" fill={KILN_COLORS.wheat} opacity="0.5" />
      {/* 割纹 — 手绘裂块 */}
      <rect x="36" y="40" width="24" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.8" />
      <rect x="72" y="38" width="32" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.8" />
      <rect x="112" y="42" width="20" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.8" />
      {/* 坚果 — 深色小方块 */}
      <rect x="24" y="54" width="5" height="5" rx="1" fill="#5C3A1E" opacity="0.7" />
      <rect x="68" y="62" width="4" height="4" rx="1" fill="#5C3A1E" opacity="0.6" />
      <rect x="108" y="58" width="5" height="5" rx="1" fill="#5C3A1E" opacity="0.7" />
      <rect x="132" y="52" width="4" height="4" rx="1" fill="#5C3A1E" opacity="0.5" />
      <rect x="48" y="66" width="4" height="4" rx="1" fill="#5C3A1E" opacity="0.6" />
      <rect x="92" y="68" width="3" height="3" rx="1" fill="#5C3A1E" opacity="0.5" />
    </svg>
  ),
  "吐司": (
    <svg viewBox="0 0 120 100" className="h-24 w-28">
      {/* 外框 — 焦底 */}
      <rect x="14" y="18" width="92" height="74" rx="10" fill={KILN_COLORS.char} />
      {/* 中框 */}
      <rect x="18" y="22" width="84" height="66" rx="8" fill={KILN_COLORS.crust} />
      {/* 内框 */}
      <rect x="22" y="26" width="76" height="58" rx="6" fill={KILN_COLORS.mid} />
      {/* 顶面 — 麦黄 */}
      <rect x="24" y="24" width="72" height="20" rx="4" fill={KILN_COLORS.light} />
      <rect x="28" y="22" width="32" height="8" rx="2" fill={KILN_COLORS.wheat} opacity="0.6" />
      {/* 顶部焦弧 */}
      <rect x="26" y="20" width="68" height="6" rx="3" fill={KILN_COLORS.char} opacity="0.5" />
      {/* 切片线 */}
      <rect x="24" y="48" width="72" height="2" rx="1" fill={KILN_COLORS.crust} opacity="0.4" />
      <rect x="24" y="60" width="72" height="2" rx="1" fill={KILN_COLORS.crust} opacity="0.4" />
      <rect x="24" y="72" width="72" height="2" rx="1" fill={KILN_COLORS.crust} opacity="0.4" />
      {/* 侧边焦痕 */}
      <rect x="14" y="32" width="6" height="40" rx="2" fill={KILN_COLORS.char} opacity="0.3" />
      <rect x="100" y="32" width="6" height="40" rx="2" fill={KILN_COLORS.char} opacity="0.3" />
    </svg>
  ),
  "恰巴塔": (
    <svg viewBox="0 0 160 90" className="h-20 w-36">
      {/* 恰巴塔 — 扁平不规则，像拖鞋 */}
      <rect x="12" y="38" width="136" height="40" rx="8" fill={KILN_COLORS.char} />
      <rect x="16" y="34" width="128" height="38" rx="6" fill={KILN_COLORS.crust} />
      <rect x="20" y="30" width="120" height="36" rx="5" fill={KILN_COLORS.mid} />
      <rect x="24" y="28" width="112" height="30" rx="4" fill={KILN_COLORS.light} />
      {/* 高光 */}
      <rect x="32" y="26" width="40" height="10" rx="2" fill={KILN_COLORS.wheat} opacity="0.5" />
      {/* 割纹 */}
      <rect x="30" y="40" width="28" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.7" />
      <rect x="68" y="38" width="36" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.7" />
      <rect x="112" y="42" width="20" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.7" />
      {/* 大气孔 — 深色块 */}
      <rect x="42" y="50" width="10" height="10" rx="3" fill={KILN_COLORS.hole} opacity="0.35" />
      <rect x="82" y="56" width="12" height="12" rx="4" fill={KILN_COLORS.hole} opacity="0.3" />
      <rect x="118" y="48" width="8" height="8" rx="2" fill={KILN_COLORS.hole} opacity="0.4" />
      <rect x="62" y="60" width="9" height="9" rx="3" fill={KILN_COLORS.hole} opacity="0.35" />
      <rect x="98" y="36" width="6" height="6" rx="2" fill={KILN_COLORS.hole} opacity="0.4" />
    </svg>
  ),
  "贝果/海盐卷": (
    <svg viewBox="0 0 100 100" className="h-24 w-24">
      {/* 贝果外圈 — 多层色块环 */}
      <rect x="12" y="12" width="76" height="76" rx="38" fill={KILN_COLORS.char} />
      <rect x="16" y="16" width="68" height="68" rx="34" fill={KILN_COLORS.crust} />
      {/* 内圈 — 形成环 */}
      <rect x="22" y="22" width="56" height="56" rx="28" fill={KILN_COLORS.mid} />
      <rect x="28" y="28" width="44" height="44" rx="22" fill={KILN_COLORS.light} />
      {/* 中心孔 */}
      <rect x="36" y="36" width="28" height="28" rx="14" fill={KILN_COLORS.wheat} />
      <rect x="40" y="40" width="20" height="20" rx="10" fill="#FAF6F0" opacity="0.4" />
      {/* 海盐粒 — 白色小方块 */}
      <rect x="18" y="28" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.7" />
      <rect x="76" y="22" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.6" />
      <rect x="24" y="72" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.7" />
      <rect x="72" y="68" width="2" height="2" rx="0.5" fill="#FFF" opacity="0.5" />
      <rect x="48" y="14" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.6" />
      <rect x="50" y="80" width="2" height="2" rx="0.5" fill="#FFF" opacity="0.5" />
      <rect x="14" y="50" width="2" height="2" rx="0.5" fill="#FFF" opacity="0.5" />
      <rect x="82" y="52" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.6" />
      {/* 顶部焦痕 */}
      <rect x="30" y="14" width="40" height="6" rx="3" fill={KILN_COLORS.char} opacity="0.4" />
    </svg>
  ),
  "软欧包": (
    <svg viewBox="0 0 140 90" className="h-20 w-32">
      {/* 软欧 — 圆润多层叠色 */}
      <rect x="10" y="32" width="120" height="50" rx="25" fill={KILN_COLORS.char} />
      <rect x="14" y="28" width="112" height="46" rx="23" fill={KILN_COLORS.crust} />
      <rect x="18" y="24" width="104" height="42" rx="21" fill={KILN_COLORS.mid} />
      <rect x="22" y="22" width="96" height="38" rx="19" fill={KILN_COLORS.light} />
      {/* 顶部高光 */}
      <rect x="28" y="18" width="44" height="14" rx="7" fill={KILN_COLORS.wheat} opacity="0.6" />
      <rect x="80" y="20" width="28" height="10" rx="5" fill={KILN_COLORS.wheat} opacity="0.4" />
      {/* 割纹 */}
      <rect x="32" y="38" width="24" height="2.5" rx="1" fill={KILN_COLORS.char} opacity="0.6" />
      <rect x="68" y="36" width="30" height="2.5" rx="1" fill={KILN_COLORS.char} opacity="0.6" />
      <rect x="104" y="40" width="18" height="2.5" rx="1" fill={KILN_COLORS.char} opacity="0.6" />
      {/* 底部焦 */}
      <rect x="20" y="72" width="100" height="8" rx="4" fill={KILN_COLORS.char} opacity="0.3" />
    </svg>
  ),
};

interface ProductVisualProps {
  product: Product;
  size?: "sm" | "md" | "lg";
}

export function ProductVisual({ product, size = "md" }: ProductVisualProps) {
  const sizeClass = size === "sm" ? "h-20" : size === "lg" ? "h-48" : "h-36";

  return (
    <div className={`relative ${sizeClass} overflow-hidden bg-gradient-to-br ${product.imageTone} flex items-center justify-center`}>
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="transform transition duration-500 group-hover:scale-105">
          {breadSvg[product.category]}
        </div>
      )}
      {product.featured && (
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-kiln backdrop-blur-sm shadow-soft">
          本轮主推
        </span>
      )}
    </div>
  );
}
