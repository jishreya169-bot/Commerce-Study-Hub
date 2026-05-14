import React from "react";
import Svg, { Path, Rect, Circle, Line, G, Defs, LinearGradient, Stop, Polyline, Polygon } from "react-native-svg";

interface SubjectIconProps {
  subject: string;
  size?: number;
  color?: string;
}

const SUBJECT_COLORS: Record<string, string> = {
  accountancy: "#5B9BD5",
  "business studies": "#7B8EBF",
  economics: "#5BAD9B",
  mathematics: "#9B7BC4",
  english: "#BF7B5B",
  default: "#5B9BD5",
};

export function SubjectIcon({ subject, size = 40, color }: SubjectIconProps) {
  const key = subject.toLowerCase();
  const c = color ?? SUBJECT_COLORS[key] ?? SUBJECT_COLORS.default;
  const s = size;
  const vb = "0 0 40 40";

  if (key === "accountancy") {
    return (
      <Svg width={s} height={s} viewBox={vb}>
        {/* Ledger book */}
        <Rect x="6" y="5" width="22" height="28" rx="3" fill={c + "20"} stroke={c} strokeWidth="1.5" />
        <Rect x="6" y="5" width="5" height="28" rx="2" fill={c} opacity="0.5" />
        {/* Lines */}
        <Line x1="14" y1="13" x2="25" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="14" y1="18" x2="25" y2="18" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="14" y1="23" x2="25" y2="23" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        {/* Balance scale */}
        <Circle cx="32" cy="10" r="5" fill={c + "20"} stroke={c} strokeWidth="1.5" />
        <Line x1="29" y1="12" x2="35" y2="8" stroke={c} strokeWidth="1.2" />
        <Line x1="32" y1="10" x2="32" y2="6" stroke={c} strokeWidth="1.2" />
      </Svg>
    );
  }

  if (key === "economics") {
    return (
      <Svg width={s} height={s} viewBox={vb}>
        {/* Chart background */}
        <Rect x="4" y="8" width="32" height="22" rx="4" fill={c + "15"} />
        {/* Axes */}
        <Line x1="9" y1="26" x2="9" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        <Line x1="9" y1="26" x2="34" y2="26" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        {/* Trend line */}
        <Polyline points="11,23 16,19 21,21 27,14 33,12" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Dots */}
        <Circle cx="11" cy="23" r="2" fill={c} />
        <Circle cx="21" cy="21" r="2" fill={c} />
        <Circle cx="33" cy="12" r="2" fill={c} />
        {/* Arrow */}
        <Path d="M31 10 L34 12 L31 14" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        {/* Rupee symbol */}
        <Circle cx="32" cy="34" r="5" fill={c} opacity="0.8" />
        <Path d="M30 32 L34 32 M30 34 L34 34 M32 32 L32 37" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
      </Svg>
    );
  }

  if (key === "business studies") {
    return (
      <Svg width={s} height={s} viewBox={vb}>
        {/* Briefcase */}
        <Rect x="5" y="14" width="30" height="20" rx="4" fill={c + "20"} stroke={c} strokeWidth="1.5" />
        <Path d="M14 14 L14 10 Q14 8 16 8 L24 8 Q26 8 26 10 L26 14" stroke={c} strokeWidth="1.5" fill="none" strokeLinejoin="round" />
        <Line x1="5" y1="22" x2="35" y2="22" stroke={c} strokeWidth="1.5" />
        <Rect x="17" y="20" width="6" height="4" rx="1" fill={c} />
        {/* Growth arrows */}
        <Path d="M12 32 L18 26 L23 29 L30 22" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <Path d="M27 22 L30 22 L30 25" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </Svg>
    );
  }

  if (key === "mathematics") {
    return (
      <Svg width={s} height={s} viewBox={vb}>
        {/* Calculator body */}
        <Rect x="7" y="4" width="26" height="32" rx="4" fill={c + "18"} stroke={c} strokeWidth="1.5" />
        {/* Screen */}
        <Rect x="10" y="8" width="20" height="8" rx="2" fill={c + "30"} stroke={c} strokeWidth="1" />
        {/* Pi symbol on screen */}
        <Path d="M16 10 L24 10 M18 10 L18 14 M22 10 L22 14" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
        {/* Buttons */}
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Rect key={i} x={10 + (i % 3) * 7} y={20 + Math.floor(i / 3) * 7} width="5" height="5" rx="1.5" fill={c} opacity={i === 2 || i === 5 ? "0.9" : "0.35"} />
        ))}
      </Svg>
    );
  }

  if (key === "english") {
    return (
      <Svg width={s} height={s} viewBox={vb}>
        {/* Open book */}
        <Path d="M20 34 Q12 32 6 34 L6 10 Q12 8 20 10 Z" fill={c + "20"} stroke={c} strokeWidth="1.5" />
        <Path d="M20 34 Q28 32 34 34 L34 10 Q28 8 20 10 Z" fill={c + "35"} stroke={c} strokeWidth="1.5" />
        <Line x1="20" y1="10" x2="20" y2="34" stroke={c} strokeWidth="1.5" />
        {/* Lines on pages */}
        <Line x1="9" y1="15" x2="18" y2="14" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <Line x1="9" y1="19" x2="18" y2="18" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        <Line x1="9" y1="23" x2="16" y2="22" stroke={c} strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
        {/* Pen */}
        <Path d="M26 8 L30 12 L22 28 L20 28 L20 26 Z" fill={c} opacity="0.7" />
        <Path d="M20 26 L20 28 L22 28 L20 26Z" fill={c} />
        <Path d="M28 6 L32 10 L30 12 L26 8 Z" fill={c} />
      </Svg>
    );
  }

  // Default: generic book
  return (
    <Svg width={s} height={s} viewBox={vb}>
      <Rect x="7" y="5" width="20" height="28" rx="3" fill={c + "20"} stroke={c} strokeWidth="1.5" />
      <Rect x="7" y="5" width="4" height="28" rx="2" fill={c} opacity="0.5" />
      <Line x1="15" y1="13" x2="24" y2="13" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="15" y1="18" x2="24" y2="18" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="15" y1="23" x2="22" y2="23" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}
