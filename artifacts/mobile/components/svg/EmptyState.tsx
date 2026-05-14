import React from "react";
import Svg, { Path, Rect, Circle, Line, G, Ellipse, Defs, LinearGradient, Stop } from "react-native-svg";

interface EmptyStateProps {
  variant?: "books" | "doubt" | "notes" | "tests" | "live" | "search" | "students";
  size?: number;
  color?: string;
}

export function EmptyStateIllustration({ variant = "books", size = 120, color = "#5B9BD5" }: EmptyStateProps) {
  const c = color;
  const s = size;

  if (variant === "books") {
    return (
      <Svg width={s} height={s} viewBox="0 0 120 120">
        {/* Shadow */}
        <Ellipse cx="60" cy="108" rx="40" ry="6" fill={c} opacity="0.08" />
        {/* Book 3 (back) */}
        <Rect x="25" y="40" width="35" height="60" rx="4" fill={c} opacity="0.15" />
        <Rect x="25" y="40" width="7" height="60" rx="3" fill={c} opacity="0.25" />
        {/* Book 2 (middle) */}
        <Rect x="40" y="30" width="35" height="68" rx="4" fill={c} opacity="0.25" />
        <Rect x="40" y="30" width="7" height="68" rx="3" fill={c} opacity="0.4" />
        {/* Book 1 (front) */}
        <Rect x="58" y="20" width="35" height="78" rx="4" fill={c} opacity="0.8" />
        <Rect x="58" y="20" width="7" height="78" rx="3" fill={c} />
        {/* Lines on front book */}
        <Line x1="70" y1="35" x2="88" y2="35" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
        <Line x1="70" y1="43" x2="88" y2="43" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
        <Line x1="70" y1="51" x2="88" y2="51" stroke="white" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        {/* Bookmark */}
        <Path d="M82 20 L82 30 L79 27 L76 30 L76 20 Z" fill="white" opacity="0.8" />
        {/* Question mark */}
        <Circle cx="30" cy="18" r="10" fill={c + "18"} />
        <Path d="M28 13 Q30 10 32 13 Q34 16 30 17 L30 19" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" />
        <Circle cx="30" cy="22" r="1.5" fill={c} />
      </Svg>
    );
  }

  if (variant === "doubt") {
    return (
      <Svg width={s} height={s} viewBox="0 0 120 120">
        <Ellipse cx="60" cy="108" rx="30" ry="5" fill={c} opacity="0.08" />
        {/* Chat bubble large */}
        <Path d="M15 20 Q15 10 25 10 L95 10 Q105 10 105 20 L105 65 Q105 75 95 75 L65 75 L55 90 L50 75 L25 75 Q15 75 15 65 Z" fill={c + "18"} stroke={c} strokeWidth="1.5" />
        {/* Question marks inside */}
        <Path d="M43 35 Q47 27 51 32 Q55 37 47 42 L47 45" stroke={c} strokeWidth="3" fill="none" strokeLinecap="round" />
        <Circle cx="47" cy="51" r="2.5" fill={c} />
        {/* Smaller bubbles */}
        <Circle cx="65" cy="40" r="4" fill={c} opacity="0.3" />
        <Path d="M70 32 Q76 26 78 32 Q80 38 74 39 L74 42" stroke={c} strokeWidth="2.5" fill="none" strokeLinecap="round" opacity="0.6" />
        <Circle cx="74" cy="47" r="2" fill={c} opacity="0.5" />
      </Svg>
    );
  }

  if (variant === "notes") {
    return (
      <Svg width={s} height={s} viewBox="0 0 120 120">
        <Ellipse cx="60" cy="108" rx="35" ry="5" fill={c} opacity="0.08" />
        {/* Notepad */}
        <Rect x="22" y="18" width="76" height="88" rx="6" fill={c + "15"} stroke={c} strokeWidth="1.5" />
        <Rect x="22" y="18" width="76" height="14" rx="6" fill={c} opacity="0.3" />
        {/* Rings */}
        {[34, 60, 86].map((x) => (
          <G key={x}>
            <Rect x={x - 5} y="12" width="10" height="14" rx="2" fill="white" stroke={c} strokeWidth="1.5" />
            <Ellipse cx={x} cy="19" rx="3" ry="3" fill={c} opacity="0.4" />
          </G>
        ))}
        {/* Lines */}
        <Line x1="32" y1="44" x2="88" y2="44" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
        <Line x1="32" y1="56" x2="88" y2="56" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
        <Line x1="32" y1="68" x2="75" y2="68" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.35" />
        <Line x1="32" y1="80" x2="80" y2="80" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
        {/* Pen */}
        <Path d="M78 78 L90 66 L96 72 L84 84 Z" fill={c} opacity="0.7" />
        <Path d="M84 84 L80 88 L78 86 L82 82 Z" fill={c} opacity="0.5" />
        <Path d="M90 66 L92 62 L96 66 L92 70 Z" fill={c} />
      </Svg>
    );
  }

  if (variant === "tests") {
    return (
      <Svg width={s} height={s} viewBox="0 0 120 120">
        <Ellipse cx="60" cy="108" rx="35" ry="5" fill={c} opacity="0.08" />
        {/* Clipboard */}
        <Rect x="22" y="22" width="76" height="88" rx="5" fill={c + "12"} stroke={c} strokeWidth="1.5" />
        {/* Clip */}
        <Rect x="42" y="14" width="36" height="16" rx="8" fill={c + "20"} stroke={c} strokeWidth="1.5" />
        <Rect x="50" y="18" width="20" height="8" rx="4" fill={c} opacity="0.3" />
        {/* Checklist */}
        {[["✓", 40], ["✓", 57], ["?", 74], ["?", 91]].map(([char, y], i) => (
          <G key={i}>
            <Rect x="32" y={Number(y) - 7} width="12" height="12" rx="3" fill={i < 2 ? c : "white"} stroke={c} strokeWidth="1.2" opacity={i < 2 ? 0.7 : 0.4} />
            {i < 2 && <Path d={`M35 ${Number(y)-(1)} L38 ${Number(y)+2} L42 ${Number(y)-4}`} stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />}
            <Rect x="50" y={Number(y) - 5} width="35" height="5" rx="2" fill={c} opacity={i < 2 ? 0.4 : 0.2} />
          </G>
        ))}
      </Svg>
    );
  }

  if (variant === "live") {
    return (
      <Svg width={s} height={s} viewBox="0 0 120 120">
        <Ellipse cx="60" cy="108" rx="30" ry="5" fill={c} opacity="0.08" />
        {/* Screen */}
        <Rect x="15" y="25" width="90" height="58" rx="7" fill={c + "15"} stroke={c} strokeWidth="1.5" />
        <Rect x="19" y="29" width="82" height="50" rx="5" fill={c} opacity="0.12" />
        {/* Play button */}
        <Circle cx="60" cy="54" r="18" fill={c} opacity="0.85" />
        <Path d="M55 47 L73 54 L55 61 Z" fill="white" />
        {/* Live dot */}
        <Circle cx="28" cy="37" r="4" fill="#E53E3E" opacity="0.8" />
        <Circle cx="28" cy="37" r="2" fill="#E53E3E" />
        {/* Stand */}
        <Rect x="52" y="82" width="16" height="8" rx="2" fill={c} opacity="0.3" />
        <Rect x="38" y="88" width="44" height="4" rx="2" fill={c} opacity="0.2" />
        {/* Signal arcs */}
        <Path d="M88 28 Q98 38 88 48" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5" />
        <Path d="M93 23 Q107 38 93 53" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
      </Svg>
    );
  }

  if (variant === "search") {
    return (
      <Svg width={s} height={s} viewBox="0 0 120 120">
        <Ellipse cx="60" cy="108" rx="30" ry="5" fill={c} opacity="0.08" />
        <Circle cx="52" cy="50" r="28" fill={c + "15"} stroke={c} strokeWidth="2" />
        <Circle cx="52" cy="50" r="18" fill={c + "10"} />
        <Line x1="73" y1="71" x2="95" y2="93" stroke={c} strokeWidth="6" strokeLinecap="round" opacity="0.5" />
        <Line x1="73" y1="71" x2="95" y2="93" stroke={c} strokeWidth="3" strokeLinecap="round" />
        {/* X inside */}
        <Line x1="44" y1="42" x2="60" y2="58" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
        <Line x1="60" y1="42" x2="44" y2="58" stroke={c} strokeWidth="2.5" strokeLinecap="round" opacity="0.5" />
      </Svg>
    );
  }

  if (variant === "students") {
    return (
      <Svg width={s} height={s} viewBox="0 0 120 120">
        <Ellipse cx="60" cy="108" rx="40" ry="5" fill={c} opacity="0.08" />
        {[25, 60, 95].map((cx, i) => (
          <G key={cx}>
            <Circle cx={cx} cy={42 - i * 3} r={12 + i} fill={c + "18"} />
            <Circle cx={cx} cy={38 - i * 3} r={9 + i} fill={c} opacity={0.15 + i * 0.07} />
            <Path d={`M${cx - 14 - i} ${78 - i} Q${cx} ${68 - i * 2} ${cx + 14 + i} ${78 - i}`} stroke={c} strokeWidth={7 + i * 1.5} fill="none" strokeLinecap="round" opacity={0.15 + i * 0.07} />
          </G>
        ))}
        {/* Plus icon */}
        <Circle cx="95" cy="85" r="12" fill={c} opacity="0.8" />
        <Line x1="89" y1="85" x2="101" y2="85" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
        <Line x1="95" y1="79" x2="95" y2="91" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
      </Svg>
    );
  }

  return null;
}
