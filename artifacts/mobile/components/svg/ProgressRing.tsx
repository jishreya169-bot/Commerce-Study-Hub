import React from "react";
import Svg, { Circle, G, Defs, LinearGradient, Stop, Text as SvgText } from "react-native-svg";

interface ProgressRingProps {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  label?: string;
  fontSize?: number;
}

export function ProgressRing({
  progress,
  size = 80,
  strokeWidth = 8,
  color = "#5B9BD5",
  trackColor = "#EEF4FB",
  showLabel = true,
  label,
  fontSize = 14,
}: ProgressRingProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const clamped = Math.min(Math.max(progress, 0), 100);
  const dashOffset = circumference - (clamped / 100) * circumference;

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <LinearGradient id={`ringGrad_${color.replace("#", "")}`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="1" />
          <Stop offset="1" stopColor={color} stopOpacity="0.6" />
        </LinearGradient>
      </Defs>
      {/* Track */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={trackColor}
        strokeWidth={strokeWidth}
        fill="none"
      />
      {/* Progress arc */}
      <Circle
        cx={cx}
        cy={cy}
        r={r}
        stroke={`url(#ringGrad_${color.replace("#", "")})`}
        strokeWidth={strokeWidth}
        fill="none"
        strokeDasharray={`${circumference} ${circumference}`}
        strokeDashoffset={dashOffset}
        strokeLinecap="round"
        rotation="-90"
        origin={`${cx}, ${cy}`}
      />
      {/* Center label */}
      {showLabel && (
        <SvgText
          x={cx}
          y={cy + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight="700"
          fill={color}
          fontFamily="Poppins_700Bold"
        >
          {label ?? `${clamped}%`}
        </SvgText>
      )}
    </Svg>
  );
}

export function SmallProgressRing({ progress, size = 36, color = "#5B9BD5", trackColor = "#EEF4FB" }: ProgressRingProps) {
  const sw = 4;
  const r = (size - sw) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(Math.max(progress, 0), 100) / 100) * circ;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle cx={cx} cy={cy} r={r} stroke={trackColor} strokeWidth={sw} fill="none" />
      <Circle cx={cx} cy={cy} r={r} stroke={color} strokeWidth={sw} fill="none"
        strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset}
        strokeLinecap="round" rotation="-90" origin={`${cx},${cy}`} />
    </Svg>
  );
}
