import type { ReactNode } from "react";
import type { Category, Product } from "../../types";

/* ===== 窑烤色块风 SVG =====
 * 背景：波点女王（草间弥生）风格的融合色块 + 重复圆点
 * 每个类别有独特的背景图案，上方叠加缩小的矢量面包
 */

const KILN_COLORS = {
  char: "#9C5D2E",
  crust: "#B87333",
  mid: "#CD853F",
  light: "#D4A574",
  wheat: "#E8C39E",
  hole: "#8B5A2B",
  cream: "#FAF6F0",
  ash: "#F0E9E0",
};

/* ===== 背景图案 — 每个类别独特的波点+色块融合 ===== */
const bgPatterns: Record<Category, ReactNode> = {
  "欧包/坚果": (
    <g>
      <defs>
        <pattern id="pat-nut" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="3" fill={KILN_COLORS.char} opacity="0.08" />
          <circle cx="22" cy="18" r="2.5" fill={KILN_COLORS.crust} opacity="0.06" />
          <circle cx="14" cy="24" r="1.5" fill={KILN_COLORS.mid} opacity="0.07" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={KILN_COLORS.cream} />
      <rect width="100%" height="100%" fill="url(#pat-nut)" />
      {/* 融合大色块 */}
      <circle cx="25%" cy="35%" r="70" fill={KILN_COLORS.light} opacity="0.18" />
      <circle cx="72%" cy="65%" r="55" fill={KILN_COLORS.wheat} opacity="0.14" />
      <circle cx="50%" cy="15%" r="45" fill={KILN_COLORS.mid} opacity="0.10" />
      <circle cx="85%" cy="25%" r="35" fill={KILN_COLORS.crust} opacity="0.08" />
    </g>
  ),
  "吐司": (
    <g>
      <defs>
        <pattern id="pat-toast" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2.5" fill={KILN_COLORS.wheat} opacity="0.12" />
          <circle cx="26" cy="22" r="2" fill={KILN_COLORS.light} opacity="0.10" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={KILN_COLORS.cream} />
      {/* 吐司切片感的垂直条纹色块 */}
      <rect x="8%" y="0" width="18%" height="100%" fill={KILN_COLORS.wheat} opacity="0.12" rx="20" />
      <rect x="38%" y="0" width="18%" height="100%" fill={KILN_COLORS.light} opacity="0.10" rx="20" />
      <rect x="68%" y="0" width="18%" height="100%" fill={KILN_COLORS.ash} opacity="0.14" rx="20" />
      <rect width="100%" height="100%" fill="url(#pat-toast)" />
      {/* 融合圆 */}
      <circle cx="20%" cy="50%" r="60" fill={KILN_COLORS.wheat} opacity="0.12" />
      <circle cx="75%" cy="30%" r="50" fill={KILN_COLORS.light} opacity="0.10" />
    </g>
  ),
  "恰巴塔": (
    <g>
      <defs>
        <pattern id="pat-ciabatta" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
          <ellipse cx="12" cy="14" rx="5" ry="4" fill={KILN_COLORS.hole} opacity="0.06" />
          <ellipse cx="28" cy="26" rx="4" ry="3" fill={KILN_COLORS.mid} opacity="0.05" />
          <circle cx="22" cy="8" r="2" fill={KILN_COLORS.char} opacity="0.04" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={KILN_COLORS.cream} />
      <rect width="100%" height="100%" fill="url(#pat-ciabatta)" />
      {/* 大气泡色块 */}
      <ellipse cx="30%" cy="40%" rx="65" ry="50" fill={KILN_COLORS.light} opacity="0.14" />
      <ellipse cx="70%" cy="60%" rx="55" ry="45" fill={KILN_COLORS.ash} opacity="0.12" />
      <ellipse cx="50%" cy="20%" rx="40" ry="35" fill={KILN_COLORS.wheat} opacity="0.10" />
    </g>
  ),
  "贝果/海盐卷": (
    <g>
      <defs>
        <pattern id="pat-bagel" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="6" cy="6" r="1.5" fill="#FFF" opacity="0.25" />
          <circle cx="18" cy="16" r="1" fill="#FFF" opacity="0.18" />
          <circle cx="12" cy="20" r="1.2" fill={KILN_COLORS.wheat} opacity="0.15" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={KILN_COLORS.cream} />
      {/* 同心圆环色块 */}
      <circle cx="50%" cy="50%" r="90" fill={KILN_COLORS.wheat} opacity="0.14" />
      <circle cx="50%" cy="50%" r="65" fill={KILN_COLORS.light} opacity="0.10" />
      <circle cx="50%" cy="50%" r="40" fill={KILN_COLORS.ash} opacity="0.12" />
      <rect width="100%" height="100%" fill="url(#pat-bagel)" />
      <circle cx="25%" cy="30%" r="40" fill={KILN_COLORS.wheat} opacity="0.10" />
      <circle cx="78%" cy="70%" r="35" fill={KILN_COLORS.light} opacity="0.08" />
    </g>
  ),
  "软欧包": (
    <g>
      <defs>
        <pattern id="pat-soft" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="2" fill={KILN_COLORS.mid} opacity="0.06" />
          <circle cx="22" cy="20" r="2.5" fill={KILN_COLORS.light} opacity="0.05" />
          <circle cx="15" cy="25" r="1.5" fill={KILN_COLORS.wheat} opacity="0.07" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={KILN_COLORS.cream} />
      <rect width="100%" height="100%" fill="url(#pat-soft)" />
      {/* 柔软云朵色块 */}
      <circle cx="30%" cy="35%" r="75" fill={KILN_COLORS.wheat} opacity="0.16" />
      <circle cx="70%" cy="55%" r="60" fill={KILN_COLORS.light} opacity="0.12" />
      <circle cx="50%" cy="75%" r="50" fill={KILN_COLORS.ash} opacity="0.10" />
      <circle cx="80%" cy="25%" r="40" fill={KILN_COLORS.wheat} opacity="0.08" />
    </g>
  ),
};

/* ===== 矢量面包图 — 缩小版 ===== */
const breadSvg: Record<Category, ReactNode> = {
  "欧包/坚果": (
    <svg viewBox="0 0 160 100" className="h-14 w-24 sm:h-20 sm:w-32">
      <rect x="10" y="42" width="140" height="48" rx="4" fill={KILN_COLORS.char} />
      <rect x="14" y="38" width="132" height="44" rx="3" fill={KILN_COLORS.crust} />
      <rect x="18" y="34" width="124" height="40" rx="3" fill={KILN_COLORS.mid} />
      <rect x="22" y="30" width="116" height="36" rx="2" fill={KILN_COLORS.light} />
      <rect x="28" y="28" width="48" height="14" rx="2" fill={KILN_COLORS.wheat} opacity="0.7" />
      <rect x="88" y="30" width="36" height="10" rx="2" fill={KILN_COLORS.wheat} opacity="0.5" />
      <rect x="36" y="40" width="24" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.8" />
      <rect x="72" y="38" width="32" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.8" />
      <rect x="112" y="42" width="20" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.8" />
      <rect x="24" y="54" width="5" height="5" rx="1" fill="#5C3A1E" opacity="0.7" />
      <rect x="68" y="62" width="4" height="4" rx="1" fill="#5C3A1E" opacity="0.6" />
      <rect x="108" y="58" width="5" height="5" rx="1" fill="#5C3A1E" opacity="0.7" />
      <rect x="48" y="66" width="4" height="4" rx="1" fill="#5C3A1E" opacity="0.6" />
    </svg>
  ),
  "吐司": (
    <svg viewBox="0 0 120 100" className="h-16 w-20 sm:h-24 sm:w-28">
      <rect x="14" y="18" width="92" height="74" rx="10" fill={KILN_COLORS.char} />
      <rect x="18" y="22" width="84" height="66" rx="8" fill={KILN_COLORS.crust} />
      <rect x="22" y="26" width="76" height="58" rx="6" fill={KILN_COLORS.mid} />
      <rect x="24" y="24" width="72" height="20" rx="4" fill={KILN_COLORS.light} />
      <rect x="28" y="22" width="32" height="8" rx="2" fill={KILN_COLORS.wheat} opacity="0.6" />
      <rect x="26" y="20" width="68" height="6" rx="3" fill={KILN_COLORS.char} opacity="0.5" />
      <rect x="24" y="48" width="72" height="2" rx="1" fill={KILN_COLORS.crust} opacity="0.4" />
      <rect x="24" y="60" width="72" height="2" rx="1" fill={KILN_COLORS.crust} opacity="0.4" />
      <rect x="24" y="72" width="72" height="2" rx="1" fill={KILN_COLORS.crust} opacity="0.4" />
    </svg>
  ),
  "恰巴塔": (
    <svg viewBox="0 0 160 90" className="h-14 w-28 sm:h-20 sm:w-36">
      <rect x="12" y="38" width="136" height="40" rx="8" fill={KILN_COLORS.char} />
      <rect x="16" y="34" width="128" height="38" rx="6" fill={KILN_COLORS.crust} />
      <rect x="20" y="30" width="120" height="36" rx="5" fill={KILN_COLORS.mid} />
      <rect x="24" y="28" width="112" height="30" rx="4" fill={KILN_COLORS.light} />
      <rect x="32" y="26" width="40" height="10" rx="2" fill={KILN_COLORS.wheat} opacity="0.5" />
      <rect x="30" y="40" width="28" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.7" />
      <rect x="68" y="38" width="36" height="3" rx="1" fill={KILN_COLORS.char} opacity="0.7" />
      <rect x="42" y="50" width="10" height="10" rx="3" fill={KILN_COLORS.hole} opacity="0.35" />
      <rect x="82" y="56" width="12" height="12" rx="4" fill={KILN_COLORS.hole} opacity="0.3" />
    </svg>
  ),
  "贝果/海盐卷": (
    <svg viewBox="0 0 100 100" className="h-16 w-16 sm:h-24 sm:w-24">
      <rect x="12" y="12" width="76" height="76" rx="38" fill={KILN_COLORS.char} />
      <rect x="16" y="16" width="68" height="68" rx="34" fill={KILN_COLORS.crust} />
      <rect x="22" y="22" width="56" height="56" rx="28" fill={KILN_COLORS.mid} />
      <rect x="28" y="28" width="44" height="44" rx="22" fill={KILN_COLORS.light} />
      <rect x="36" y="36" width="28" height="28" rx="14" fill={KILN_COLORS.wheat} />
      <rect x="40" y="40" width="20" height="20" rx="10" fill={KILN_COLORS.cream} opacity="0.4" />
      <rect x="18" y="28" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.7" />
      <rect x="76" y="22" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.6" />
      <rect x="24" y="72" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.7" />
      <rect x="72" y="68" width="2" height="2" rx="0.5" fill="#FFF" opacity="0.5" />
      <rect x="30" y="14" width="40" height="6" rx="3" fill={KILN_COLORS.char} opacity="0.4" />
    </svg>
  ),
  "软欧包": (
    <svg viewBox="0 0 140 90" className="h-14 w-24 sm:h-20 sm:w-32">
      <rect x="10" y="32" width="120" height="50" rx="25" fill={KILN_COLORS.char} />
      <rect x="14" y="28" width="112" height="46" rx="23" fill={KILN_COLORS.crust} />
      <rect x="18" y="24" width="104" height="42" rx="21" fill={KILN_COLORS.mid} />
      <rect x="22" y="22" width="96" height="38" rx="19" fill={KILN_COLORS.light} />
      <rect x="28" y="18" width="44" height="14" rx="7" fill={KILN_COLORS.wheat} opacity="0.6" />
      <rect x="32" y="38" width="24" height="2.5" rx="1" fill={KILN_COLORS.char} opacity="0.6" />
      <rect x="68" y="36" width="30" height="2.5" rx="1" fill={KILN_COLORS.char} opacity="0.6" />
    </svg>
  ),
};

interface ProductVisualProps {
  product: Product;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function ProductVisual({ product, size = "md", className }: ProductVisualProps) {
  const sizeClass = size === "sm" ? "h-20" : size === "lg" ? "h-48" : "h-36";
  const cat = product.category;

  return (
    <div className={`relative overflow-hidden flex items-center justify-center ${className || sizeClass}`}>
      {/* 背景图案层 — 波点女王风格融合色块 */}
      <svg className="absolute inset-0 w-full h-full overflow-hidden" viewBox="0 0 100 100" preserveAspectRatio="none">
        {bgPatterns[cat]}
      </svg>

      {/* 产品图（用户上传或矢量面包） */}
      {product.imageUrl ? (
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="relative z-10 h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      ) : (
        <div className="relative z-10 transform transition duration-500 group-hover:scale-105">
          {/* Simplified bread icon: single SVG instead of per-category complex SVG */}
          <svg viewBox="0 0 120 80" className="h-14 w-20 sm:h-20 sm:w-28" aria-hidden="true">
            <rect x="8" y="20" width="104" height="48" rx="12" fill={KILN_COLORS.char} opacity="0.15" />
            <rect x="12" y="24" width="96" height="40" rx="10" fill={KILN_COLORS.crust} opacity="0.25" />
            <rect x="16" y="28" width="88" height="32" rx="8" fill={KILN_COLORS.mid} opacity="0.35" />
            <rect x="20" y="18" width="80" height="8" rx="4" fill={KILN_COLORS.wheat} opacity="0.4" />
            <rect x="28" y="36" width="20" height="2" rx="1" fill={KILN_COLORS.char} opacity="0.5" />
            <rect x="56" y="34" width="28" height="2" rx="1" fill={KILN_COLORS.char} opacity="0.5" />
          </svg>
        </div>
      )}

      {product.featured && (
        <span className="absolute left-2 top-2 z-20 rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] sm:text-xs font-semibold text-kiln backdrop-blur-sm shadow-soft">
          本轮主推
        </span>
      )}
    </div>
  );
}
