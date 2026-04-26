import type { ReactNode } from "react";
import type { Category, Product } from "../../types";

/* ===== 精致窑烤面包 SVG =====
 * 用椭圆、路径和渐变模拟真实面包质感
 * 色调：焦褐 → 暖棕 → 麦黄，带径向渐变高光
 */

const defs = (
  <defs>
    <radialGradient id="crustGrad" cx="40%" cy="30%" r="65%">
      <stop offset="0%" stopColor="#D4A574" />
      <stop offset="50%" stopColor="#B87333" />
      <stop offset="100%" stopColor="#8B5A2B" />
    </radialGradient>
    <radialGradient id="toastGrad" cx="50%" cy="25%" r="70%">
      <stop offset="0%" stopColor="#E8C39E" />
      <stop offset="40%" stopColor="#CD853F" />
      <stop offset="100%" stopColor="#9C5D2E" />
    </radialGradient>
    <radialGradient id="ciabattaGrad" cx="45%" cy="35%" r="60%">
      <stop offset="0%" stopColor="#D4A574" />
      <stop offset="60%" stopColor="#B87333" />
      <stop offset="100%" stopColor="#8B5A2B" />
    </radialGradient>
    <radialGradient id="bagelGrad" cx="50%" cy="40%" r="55%">
      <stop offset="0%" stopColor="#E8C39E" />
      <stop offset="50%" stopColor="#CD853F" />
      <stop offset="100%" stopColor="#8B5A2B" />
    </radialGradient>
    <radialGradient id="softGrad" cx="40%" cy="30%" r="65%">
      <stop offset="0%" stopColor="#E8C39E" />
      <stop offset="45%" stopColor="#D4A574" />
      <stop offset="100%" stopColor="#B87333" />
    </radialGradient>
    <filter id="breadShadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#5C3A1E" floodOpacity="0.15" />
    </filter>
  </defs>
);

const breadSvg: Record<Category, ReactNode> = {
  "欧包/坚果": (
    <svg viewBox="0 0 180 110" className="h-24 w-36">
      {defs}
      {/* 主面包体 — 椭圆外框 */}
      <ellipse cx="90" cy="62" rx="78" ry="38" fill="url(#crustGrad)" filter="url(#breadShadow)" />
      {/* 顶部高光区 */}
      <ellipse cx="75" cy="48" rx="50" ry="18" fill="#E8C39E" opacity="0.5" />
      <ellipse cx="60" cy="42" rx="28" ry="10" fill="#F5DEB3" opacity="0.4" />
      {/* 割纹 — 自然曲线 */}
      <path d="M42 52 Q55 45 68 52" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M78 50 Q95 43 112 50" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      <path d="M118 54 Q130 48 142 55" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.7" />
      {/* 坚果 — 不规则小椭圆 */}
      <ellipse cx="32" cy="68" rx="4" ry="3" fill="#5C3A1E" opacity="0.65" />
      <ellipse cx="58" cy="78" rx="3.5" ry="2.5" fill="#5C3A1E" opacity="0.55" />
      <ellipse cx="95" cy="74" rx="4" ry="3" fill="#5C3A1E" opacity="0.6" />
      <ellipse cx="128" cy="70" rx="3" ry="2.5" fill="#5C3A1E" opacity="0.55" />
      <ellipse cx="148" cy="64" rx="3.5" ry="3" fill="#5C3A1E" opacity="0.5" />
      {/* 底部焦痕 */}
      <ellipse cx="90" cy="92" rx="65" ry="6" fill="#6B3E1F" opacity="0.25" />
    </svg>
  ),
  "吐司": (
    <svg viewBox="0 0 120 120" className="h-28 w-28">
      {defs}
      {/* 外框 — 圆角矩形 */}
      <rect x="14" y="14" width="92" height="92" rx="18" fill="url(#toastGrad)" filter="url(#breadShadow)" />
      {/* 顶面 — 更浅的椭圆 */}
      <ellipse cx="60" cy="28" rx="38" ry="14" fill="#E8C39E" opacity="0.6" />
      <ellipse cx="48" cy="24" rx="20" ry="7" fill="#F5DEB3" opacity="0.5" />
      {/* 顶部焦弧 */}
      <path d="M22 22 Q60 8 98 22" stroke="#8B5A2B" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.4" />
      {/* 切片线 */}
      <line x1="20" y1="52" x2="100" y2="52" stroke="#8B5A2B" strokeWidth="1.5" opacity="0.25" strokeDasharray="4 3" />
      <line x1="20" y1="70" x2="100" y2="70" stroke="#8B5A2B" strokeWidth="1.5" opacity="0.25" strokeDasharray="4 3" />
      <line x1="20" y1="88" x2="100" y2="88" stroke="#8B5A2B" strokeWidth="1.5" opacity="0.25" strokeDasharray="4 3" />
      {/* 侧边微焦 */}
      <rect x="14" y="30" width="5" height="55" rx="2" fill="#8B5A2B" opacity="0.2" />
      <rect x="101" y="30" width="5" height="55" rx="2" fill="#8B5A2B" opacity="0.2" />
    </svg>
  ),
  "恰巴塔": (
    <svg viewBox="0 0 180 100" className="h-22 w-40">
      {defs}
      {/* 扁平拖鞋形 */}
      <ellipse cx="90" cy="55" rx="82" ry="32" fill="url(#ciabattaGrad)" filter="url(#breadShadow)" />
      {/* 顶部高光 */}
      <ellipse cx="70" cy="42" rx="48" ry="14" fill="#E8C39E" opacity="0.45" />
      <ellipse cx="55" cy="38" rx="24" ry="8" fill="#F5DEB3" opacity="0.35" />
      {/* 割纹 */}
      <path d="M38 48 Q52 42 66 48" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M76 46 Q94 40 112 46" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65" />
      <path d="M122 50 Q136 44 148 51" stroke="#5C3A1E" strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.65" />
      {/* 大气孔 — 深色椭圆 */}
      <ellipse cx="52" cy="62" rx="8" ry="7" fill="#6B3E1F" opacity="0.2" />
      <ellipse cx="88" cy="68" rx="10" ry="8" fill="#6B3E1F" opacity="0.18" />
      <ellipse cx="128" cy="60" rx="7" ry="6" fill="#6B3E1F" opacity="0.22" />
      <ellipse cx="68" cy="72" rx="6" ry="5" fill="#6B3E1F" opacity="0.15" />
      {/* 底部 */}
      <ellipse cx="90" cy="82" rx="70" ry="5" fill="#6B3E1F" opacity="0.2" />
    </svg>
  ),
  "贝果/海盐卷": (
    <svg viewBox="0 0 110 110" className="h-28 w-28">
      {defs}
      {/* 外圈 */}
      <ellipse cx="55" cy="55" rx="45" ry="45" fill="url(#bagelGrad)" filter="url(#breadShadow)" />
      {/* 中心孔 */}
      <ellipse cx="55" cy="55" rx="18" ry="18" fill="#FAF6F0" opacity="0.85" />
      {/* 顶部高光 */}
      <ellipse cx="45" cy="32" rx="22" ry="10" fill="#F5DEB3" opacity="0.5" />
      {/* 海盐粒 */}
      <rect x="22" y="30" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.75" />
      <rect x="80" y="24" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.65" />
      <rect x="28" y="78" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.7" />
      <rect x="74" y="74" width="2" height="2" rx="0.5" fill="#FFF" opacity="0.55" />
      <rect x="52" y="16" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.65" />
      <rect x="54" y="84" width="2" height="2" rx="0.5" fill="#FFF" opacity="0.5" />
      <rect x="16" y="52" width="2" height="2" rx="0.5" fill="#FFF" opacity="0.55" />
      <rect x="86" y="54" width="3" height="3" rx="0.5" fill="#FFF" opacity="0.65" />
      {/* 顶部焦痕 */}
      <ellipse cx="55" cy="16" rx="28" ry="5" fill="#6B3E1F" opacity="0.25" />
    </svg>
  ),
  "软欧包": (
    <svg viewBox="0 0 160 100" className="h-24 w-36">
      {defs}
      {/* 圆润主体 */}
      <ellipse cx="80" cy="55" rx="72" ry="38" fill="url(#softGrad)" filter="url(#breadShadow)" />
      {/* 顶部大高光 */}
      <ellipse cx="65" cy="38" rx="45" ry="16" fill="#E8C39E" opacity="0.55" />
      <ellipse cx="50" cy="32" rx="24" ry="9" fill="#F5DEB3" opacity="0.45" />
      {/* 割纹 */}
      <path d="M34 46 Q48 40 62 46" stroke="#5C3A1E" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M72 44 Q90 38 108 44" stroke="#5C3A1E" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      <path d="M116 48 Q130 42 142 49" stroke="#5C3A1E" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.6" />
      {/* 底部焦 */}
      <ellipse cx="80" cy="86" rx="58" ry="6" fill="#6B3E1F" opacity="0.22" />
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
        <div className="transform transition duration-500 group-hover:scale-105 drop-shadow-sm">
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
