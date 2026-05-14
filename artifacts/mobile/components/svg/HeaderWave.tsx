import React from "react";
import Svg, { Path, Defs, LinearGradient, Stop } from "react-native-svg";
import { useWindowDimensions } from "react-native";

interface HeaderWaveProps {
  color: string;
  height?: number;
  flip?: boolean;
  style?: object;
}

export function HeaderWave({ color, height = 44, flip = false, style }: HeaderWaveProps) {
  const { width } = useWindowDimensions();
  const w = width + 2;
  const h = height;

  const path = flip
    ? `M0,${h} L0,0 Q${w * 0.25},${h * 0.3} ${w * 0.5},0 Q${w * 0.75},${-h * 0.3} ${w},0 L${w},${h} Z`
    : `M0,0 Q${w * 0.25},${h} ${w * 0.5},${h * 0.5} Q${w * 0.75},0 ${w},${h * 0.6} L${w},${h} L0,${h} Z`;

  return (
    <Svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      style={[{ position: "absolute", bottom: -1, left: -1 }, style]}
    >
      <Path d={path} fill={color} />
    </Svg>
  );
}

export function SoftWave({ bgColor, waveColor, height = 32 }: { bgColor: string; waveColor: string; height?: number }) {
  const { width } = useWindowDimensions();
  const w = width + 4;
  return (
    <Svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ marginLeft: -2 }}>
      <Path
        d={`M0,${height * 0.5} C${w * 0.2},0 ${w * 0.4},${height} ${w * 0.6},${height * 0.5} C${w * 0.8},0 ${w},${height * 0.8} ${w},${height * 0.5} L${w},${height} L0,${height} Z`}
        fill={waveColor}
      />
    </Svg>
  );
}

export function DiagonalCut({ color, height = 30 }: { color: string; height?: number }) {
  const { width } = useWindowDimensions();
  const w = width + 4;
  return (
    <Svg width={w} height={height} viewBox={`0 0 ${w} ${height}`} style={{ marginLeft: -2, marginBottom: -1 }}>
      <Path d={`M0,0 L${w},${height} L${w},${height} L0,${height} Z`} fill={color} />
    </Svg>
  );
}
