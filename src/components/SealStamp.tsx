import React from "react";

interface SealStampProps {
  text?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "ember" | "kiln" | "wheat";
}

export const SealStamp: React.FC<SealStampProps> = ({
  text = "窑烤",
  className = "",
  size = "md",
  color = "ember",
}) => {
  const sizeMap = {
    sm: { w: 48, fz: "0.75rem", stroke: 2 },
    md: { w: 64, fz: "1rem", stroke: 2.5 },
    lg: { w: 80, fz: "1.25rem", stroke: 3 },
  };
  const s = sizeMap[size];

  const colorMap = {
    ember: { fill: "#C73E1D", text: "#FFF" },
    kiln: { fill: "#2A2118", text: "#F5F1EC" },
    wheat: { fill: "#C9A96E", text: "#2A2118" },
  };
  const c = colorMap[color];

  return (
    <div
      className={`inline-flex items-center justify-center ${className}`}
      style={{ width: s.w, height: s.w }}
      title={`${text}印章`}
    >
      <svg
        viewBox="0 0 100 100"
        style={{ width: "100%", height: "100%" }}
      >
        {/* 外框 — 不规则圆角矩形 */}
        <rect
          x="6"
          y="6"
          width="88"
          height="88"
          rx="18"
          ry="18"
          fill="none"
          stroke={c.fill}
          strokeWidth={s.stroke}
          style={{ filter: "url(#roughEdge)" }}
        />
        {/* 内框 */}
        <rect
          x="12"
          y="12"
          width="76"
          height="76"
          rx="12"
          ry="12"
          fill="none"
          stroke={c.fill}
          strokeWidth={s.stroke * 0.5}
          opacity="0.5"
        />
        {/* 文字 */}
        <text
          x="50"
          y="50"
          dominantBaseline="central"
          textAnchor="middle"
          fill={c.fill}
          fontSize="38"
          fontFamily="'Zhi Mang Xing', cursive"
          fontWeight="normal"
          style={{ letterSpacing: "2px" }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
};
