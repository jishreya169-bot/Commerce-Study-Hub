import React from "react";
import Svg, {
  Path, Rect, Circle, Line, G, Defs, LinearGradient, Stop, Ellipse, Polygon, Polyline
} from "react-native-svg";
import { useWindowDimensions } from "react-native";

interface LoginIllustrationProps {
  color?: string;
  size?: number;
}

export function LoginIllustration({ color = "#5B9BD5", size = 220 }: LoginIllustrationProps) {
  const w = size;
  const h = size * 0.72;
  const c = color;

  return (
    <Svg width={w} height={h} viewBox="0 0 220 160">
      <Defs>
        <LinearGradient id="deskGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c} stopOpacity="0.12" />
          <Stop offset="1" stopColor={c} stopOpacity="0.04" />
        </LinearGradient>
        <LinearGradient id="screenGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={c} stopOpacity="0.9" />
          <Stop offset="1" stopColor={c} stopOpacity="0.6" />
        </LinearGradient>
      </Defs>

      {/* Desk */}
      <Rect x="10" y="118" width="200" height="8" rx="4" fill={c} opacity="0.2" />
      <Rect x="30" y="124" width="6" height="30" rx="3" fill={c} opacity="0.15" />
      <Rect x="184" y="124" width="6" height="30" rx="3" fill={c} opacity="0.15" />

      {/* Stack of books (left) */}
      <Rect x="14" y="104" width="38" height="8" rx="2" fill={c} opacity="0.5" />
      <Rect x="16" y="96" width="34" height="9" rx="2" fill={c} opacity="0.35" />
      <Rect x="12" y="89" width="40" height="8" rx="2" fill={c} opacity="0.6" />
      {/* Book spines */}
      <Rect x="14" y="89" width="4" height="8" rx="1" fill={c} opacity="0.4" />
      <Rect x="16" y="96" width="4" height="9" rx="1" fill={c} opacity="0.3" />

      {/* Laptop */}
      <Rect x="64" y="84" width="92" height="58" rx="5" fill={`url(#deskGrad)`} stroke={c} strokeWidth="1.5" />
      {/* Screen content */}
      <Rect x="68" y="88" width="84" height="48" rx="3" fill={`url(#screenGrad)`} opacity="0.8" />
      {/* Screen lines (content) */}
      <Rect x="74" y="96" width="50" height="4" rx="2" fill="white" opacity="0.7" />
      <Rect x="74" y="104" width="40" height="3" rx="1.5" fill="white" opacity="0.5" />
      <Rect x="74" y="111" width="45" height="3" rx="1.5" fill="white" opacity="0.4" />
      {/* Chart in laptop */}
      <Rect x="120" y="108" width="6" height="14" rx="1" fill="white" opacity="0.7" />
      <Rect x="129" y="103" width="6" height="19" rx="1" fill="white" opacity="0.5" />
      <Rect x="138" y="106" width="6" height="16" rx="1" fill="white" opacity="0.6" />
      {/* Laptop hinge */}
      <Rect x="60" y="118" width="100" height="5" rx="2.5" fill={c} opacity="0.3" />
      <Ellipse cx="110" cy="120" rx="8" ry="2" fill={c} opacity="0.15" />

      {/* Person (right side) */}
      {/* Body / Torso */}
      <Rect x="160" y="80" width="36" height="40" rx="10" fill={c} opacity="0.15" />
      {/* Shirt */}
      <Path d="M162 90 Q178 86 194 90 L196 118 L160 118 Z" fill={c} opacity="0.25" />
      {/* Head */}
      <Circle cx="178" cy="70" r="18" fill={c} opacity="0.18" />
      <Circle cx="178" cy="68" r="15" fill={c} opacity="0.22" />
      {/* Face */}
      <Circle cx="173" cy="66" r="2" fill={c} opacity="0.7" />
      <Circle cx="183" cy="66" r="2" fill={c} opacity="0.7" />
      <Path d="M173 73 Q178 77 183 73" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.8" />
      {/* Hair */}
      <Path d="M163 62 Q165 50 178 50 Q191 50 193 62" fill={c} opacity="0.4" />
      {/* Arm reaching to laptop */}
      <Path d="M162 98 Q145 108 138 112" stroke={c} strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.2" />
      {/* Graduation cap floating */}
      <G opacity="0.6">
        <Rect x="36" y="22" width="24" height="5" rx="1" fill={c} opacity="0.5" />
        <Polygon points="48,14 60,22 48,22 36,22" fill={c} opacity="0.4" />
        <Path d="M59 22 L59 30 Q54 33 48 30" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        <Circle cx="48" cy="30" r="2" fill={c} opacity="0.5" />
      </G>
      {/* Floating formula bubbles */}
      <Circle cx="205" cy="30" r="10" fill={c} opacity="0.08" />
      <Circle cx="205" cy="30" r="6" fill={c} opacity="0.12" />
      {/* π */}
      <Path d="M200 28 L210 28 M202 28 L202 33 M208 28 L208 33" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      <Circle cx="8" cy="50" r="7" fill={c} opacity="0.08" />
      {/* Stars */}
      <Path d="M96 18 L97.5 22 L102 22 L98.5 24.5 L100 28.5 L96 26 L92 28.5 L93.5 24.5 L90 22 L94.5 22 Z" fill={c} opacity="0.25" />
      <Path d="M130 8 L131 11 L134 11 L131.5 13 L132.5 16 L130 14.5 L127.5 16 L128.5 13 L126 11 L129 11 Z" fill={c} opacity="0.2" />
    </Svg>
  );
}

export function TeacherIllustration({ color = "#48BB78", size = 180 }: LoginIllustrationProps) {
  const c = color;
  return (
    <Svg width={size} height={size * 0.65} viewBox="0 0 180 117">
      {/* Whiteboard */}
      <Rect x="20" y="8" width="140" height="70" rx="6" fill={c + "18"} stroke={c} strokeWidth="1.5" />
      <Rect x="24" y="12" width="132" height="62" rx="4" fill={c + "10"} />
      {/* Board content: chart */}
      <Line x1="35" y1="65" x2="35" y2="22" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <Line x1="35" y1="65" x2="145" y2="65" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <Polyline points="40,58 55,45 70,50 90,35 115,28 140,20" stroke={c} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="115" cy="28" r="3" fill={c} />
      <Circle cx="140" cy="20" r="3" fill={c} />
      {/* Equations */}
      <Rect x="40" y="22" width="28" height="5" rx="2" fill={c} opacity="0.3" />
      <Rect x="40" y="30" width="22" height="4" rx="2" fill={c} opacity="0.2" />
      {/* Teacher */}
      <Circle cx="90" cy="100" r="13" fill={c} opacity="0.2" />
      <Rect x="78" y="95" width="24" height="20" rx="6" fill={c} opacity="0.2" />
      <Path d="M78 103 Q62 100 58 95" stroke={c} strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.2" />
      {/* Pointer */}
      <Line x1="58" y1="95" x2="82" y2="68" stroke={c} strokeWidth="1.5" strokeLinecap="round" opacity="0.4" />
      <Circle cx="82" cy="68" r="2" fill={c} opacity="0.5" />
    </Svg>
  );
}

export function AdminIllustration({ color = "#9B7BC4", size = 180 }: LoginIllustrationProps) {
  const c = color;
  return (
    <Svg width={size} height={size * 0.65} viewBox="0 0 180 117">
      {/* Shield */}
      <Path d="M90 10 L145 30 L145 65 Q145 95 90 110 Q35 95 35 65 L35 30 Z" fill={c + "15"} stroke={c} strokeWidth="2" />
      <Path d="M90 20 L133 36 L133 64 Q133 87 90 100 Q47 87 47 64 L47 36 Z" fill={c + "10"} />
      {/* Checkmark */}
      <Path d="M68 65 L82 79 L112 49" stroke={c} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Stars around shield */}
      <Circle cx="22" cy="35" r="4" fill={c} opacity="0.2" />
      <Circle cx="158" cy="45" r="5" fill={c} opacity="0.15" />
      <Circle cx="160" cy="90" r="3" fill={c} opacity="0.2" />
      <Circle cx="18" cy="80" r="3" fill={c} opacity="0.15" />
      {/* People icons */}
      <Circle cx="28" cy="100" r="7" fill={c + "25"} />
      <Circle cx="28" cy="97" r="3" fill={c} opacity="0.4" />
      <Path d="M22 107 Q28 103 34 107" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
      <Circle cx="152" cy="105" r="7" fill={c + "25"} />
      <Circle cx="152" cy="102" r="3" fill={c} opacity="0.4" />
      <Path d="M146 112 Q152 108 158 112" stroke={c} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.4" />
    </Svg>
  );
}
