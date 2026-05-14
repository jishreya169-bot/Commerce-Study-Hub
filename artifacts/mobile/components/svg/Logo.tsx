import React from "react";
import Svg, { Path, Circle, Rect, G, Defs, LinearGradient, Stop } from "react-native-svg";

interface LogoProps {
  size?: number;
  color?: string;
}

export function VidyaPathLogo({ size = 48, color = "#5B9BD5" }: LogoProps) {
  const s = size;
  return (
    <Svg width={s} height={s} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id="logoGrad" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor={color} stopOpacity="0.7" />
        </LinearGradient>
      </Defs>
      {/* Background rounded square */}
      <Rect x="2" y="2" width="44" height="44" rx="13" fill={`url(#logoGrad)`} />
      {/* Book base */}
      <Rect x="10" y="28" width="28" height="4" rx="2" fill="rgba(255,255,255,0.9)" />
      {/* Book pages (left) */}
      <Path d="M14 16 Q14 12 18 12 L24 13 L24 28 L14 28 Q12 28 12 26 L12 18 Q12 16 14 16Z" fill="rgba(255,255,255,0.95)" />
      {/* Book pages (right) */}
      <Path d="M34 16 Q34 12 30 12 L24 13 L24 28 L34 28 Q36 28 36 26 L36 18 Q36 16 34 16Z" fill="rgba(255,255,255,0.75)" />
      {/* Spine line */}
      <Rect x="23" y="13" width="2" height="15" rx="1" fill="rgba(255,255,255,0.5)" />
      {/* Graduation cap dot */}
      <Circle cx="33" cy="11" r="4" fill="rgba(255,255,255,0.3)" />
      <Circle cx="33" cy="11" r="2" fill="rgba(255,255,255,0.85)" />
    </Svg>
  );
}

export function VidyaPathLogoFlat({ size = 32, light = false }: { size?: number; light?: boolean }) {
  const fill = light ? "#FFFFFF" : "#5B9BD5";
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32">
      <Path d="M5 21 Q5 8 16 8 Q27 8 27 21" stroke={fill} strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <Rect x="4" y="20" width="24" height="3" rx="1.5" fill={fill} />
      <Rect x="15" y="8" width="2" height="13" rx="1" fill={fill} opacity="0.5" />
      <Circle cx="22" cy="6" r="3" fill={fill} opacity="0.7" />
      <Path d="M20 6 L22 4 L24 6" stroke={fill} strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
