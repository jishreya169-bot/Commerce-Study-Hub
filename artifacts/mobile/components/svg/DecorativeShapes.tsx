import React from "react";
import Svg, { Path, Circle, Ellipse, Defs, LinearGradient, Stop, Rect, G } from "react-native-svg";
import { useWindowDimensions } from "react-native";

/** Decorative blob in top-right or top-left of a card/screen */
export function DecoBlob({ color = "#5B9BD5", size = 100, opacity = 0.12, style }: { color?: string; size?: number; opacity?: number; style?: any }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100" style={style}>
      <Path
        d="M70,20 Q95,10 90,40 Q85,70 65,80 Q45,90 25,75 Q5,60 15,35 Q25,10 55,15 Q65,17 70,20Z"
        fill={color}
        opacity={opacity}
      />
    </Svg>
  );
}

/** Dots pattern grid */
export function DotGrid({ color = "#5B9BD5", cols = 6, rows = 4, gap = 12, opacity = 0.15, style }: { color?: string; cols?: number; rows?: number; gap?: number; opacity?: number; style?: any }) {
  const w = cols * gap;
  const h = rows * gap;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={style}>
      {Array.from({ length: rows }).map((_, r) =>
        Array.from({ length: cols }).map((_, c) => (
          <Circle key={`${r}-${c}`} cx={c * gap + gap / 2} cy={r * gap + gap / 2} r={1.5} fill={color} opacity={opacity} />
        ))
      )}
    </Svg>
  );
}

/** Circle ring decoration */
export function CircleRingDeco({ color = "#5B9BD5", size = 80, opacity = 0.1, style }: { color?: string; size?: number; opacity?: number; style?: any }) {
  const c = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={style}>
      <Circle cx={c} cy={c} r={c - 6} stroke={color} strokeWidth={10} fill="none" opacity={opacity} />
      <Circle cx={c} cy={c} r={c - 18} stroke={color} strokeWidth={6} fill="none" opacity={opacity * 0.6} />
    </Svg>
  );
}

/** Wave divider between sections */
export function WaveDivider({ color, bgColor = "transparent", height = 32, inverted = false, style }: { color: string; bgColor?: string; height?: number; inverted?: boolean; style?: any }) {
  const { width } = useWindowDimensions();
  const w = width + 4;
  const h = height;
  const path = inverted
    ? `M0,${h} Q${w * 0.25},0 ${w * 0.5},${h * 0.5} Q${w * 0.75},${h} ${w},${h * 0.3} L${w},0 L0,0 Z`
    : `M0,${h * 0.5} Q${w * 0.25},0 ${w * 0.5},${h * 0.6} Q${w * 0.75},${h} ${w},${h * 0.3} L${w},${h} L0,${h} Z`;
  return (
    <Svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={[{ marginLeft: -2 }, style]}>
      {bgColor !== "transparent" && <Rect x={0} y={0} width={w} height={h} fill={bgColor} />}
      <Path d={path} fill={color} />
    </Svg>
  );
}

/** Subtle gradient header background with decorative circles */
export function HeaderDecoBackground({ color, width, height, style }: { color: string; width: number; height: number; style?: any }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={[{ position: "absolute", top: 0, left: 0 }, style]}>
      <Defs>
        <LinearGradient id="headerBg" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor={color} stopOpacity="0.75" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width={width} height={height} fill={`url(#headerBg)`} />
      {/* Decorative circles */}
      <Circle cx={width * 0.85} cy={height * 0.15} r={height * 0.55} fill="rgba(255,255,255,0.06)" />
      <Circle cx={width * 0.9} cy={height * 0.5} r={height * 0.35} fill="rgba(255,255,255,0.04)" />
      <Circle cx={width * 0.05} cy={height * 0.85} r={height * 0.45} fill="rgba(255,255,255,0.04)" />
      {/* Wave at bottom */}
      <Path
        d={`M0,${height * 0.75} Q${width * 0.3},${height * 0.55} ${width * 0.6},${height * 0.8} Q${width * 0.8},${height} ${width},${height * 0.7} L${width},${height} L0,${height} Z`}
        fill="rgba(255,255,255,0.07)"
      />
    </Svg>
  );
}
