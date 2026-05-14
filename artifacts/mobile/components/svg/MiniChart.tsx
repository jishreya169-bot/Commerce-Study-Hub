import React from "react";
import Svg, {
  Path, Rect, Line, Circle, Defs, LinearGradient, Stop, G, Text as SvgText,
} from "react-native-svg";

interface BarChartProps {
  data: { value: number; label: string; color?: string }[];
  width?: number;
  height?: number;
  color?: string;
  showLabels?: boolean;
  animated?: boolean;
}

export function MiniBarChart({ data, width = 200, height = 80, color = "#5B9BD5", showLabels = false }: BarChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const barWidth = (width - (data.length - 1) * 6) / data.length;
  const chartH = showLabels ? height - 16 : height;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        {data.map((d, i) => (
          <LinearGradient key={i} id={`barGrad${i}`} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={d.color ?? color} stopOpacity="1" />
            <Stop offset="1" stopColor={d.color ?? color} stopOpacity="0.5" />
          </LinearGradient>
        ))}
      </Defs>
      {data.map((d, i) => {
        const bh = Math.max((d.value / maxVal) * chartH, 4);
        const x = i * (barWidth + 6);
        const y = chartH - bh;
        return (
          <G key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={bh}
              rx={barWidth * 0.25}
              fill={`url(#barGrad${i})`}
            />
            {showLabels && (
              <SvgText
                x={x + barWidth / 2}
                y={height - 2}
                textAnchor="middle"
                fontSize={8}
                fill={d.color ?? color}
                opacity={0.7}
                fontFamily="Poppins_400Regular"
              >
                {d.label}
              </SvgText>
            )}
          </G>
        );
      })}
    </Svg>
  );
}

interface LineChartProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  filled?: boolean;
}

export function MiniLineChart({ data, width = 120, height = 40, color = "#5B9BD5", filled = true }: LineChartProps) {
  if (data.length < 2) return null;
  const maxVal = Math.max(...data, 1);
  const minVal = Math.min(...data, 0);
  const range = maxVal - minVal || 1;
  const step = width / (data.length - 1);
  const pad = 4;
  const h = height - pad * 2;

  const pts = data.map((v, i) => ({
    x: i * step,
    y: pad + h - ((v - minVal) / range) * h,
  }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const fillPath = `${linePath} L${pts[pts.length - 1].x},${height} L0,${height} Z`;

  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <Defs>
        <LinearGradient id="lineAreaGrad" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={color} stopOpacity="0.3" />
          <Stop offset="1" stopColor={color} stopOpacity="0" />
        </LinearGradient>
      </Defs>
      {filled && <Path d={fillPath} fill="url(#lineAreaGrad)" />}
      <Path d={linePath} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r="3" fill={color} />
    </Svg>
  );
}

interface DonutChartProps {
  segments: { value: number; color: string }[];
  size?: number;
  strokeWidth?: number;
}

export function MiniDonutChart({ segments, size = 60, strokeWidth = 10 }: DonutChartProps) {
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;

  let offset = 0;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} rotation="-90" origin={`${cx},${cy}`}>
      {segments.map((seg, i) => {
        const dash = (seg.value / total) * circ;
        const el = (
          <Circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            stroke={seg.color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${dash - 1} ${circ - dash + 1}`}
            strokeDashoffset={-offset}
            strokeLinecap="butt"
          />
        );
        offset += dash;
        return el;
      })}
    </Svg>
  );
}
