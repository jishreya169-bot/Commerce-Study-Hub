import React, { useEffect } from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8, style }: SkeletonProps) {
  const colors = useColors();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(withTiming(1, { duration: 1000 }), -1, true);
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [colors.shimmer1, colors.shimmer2]
    ),
  }));

  return (
    <Animated.View
      style={[
        { width: width as any, height, borderRadius },
        animStyle,
        style,
      ]}
    />
  );
}

export function CourseCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Skeleton height={120} borderRadius={0} />
      <View style={skeletonStyles.body}>
        <Skeleton width="40%" height={12} />
        <Skeleton width="80%" height={16} style={{ marginTop: 6 }} />
        <Skeleton width="60%" height={12} style={{ marginTop: 6 }} />
        <Skeleton width="100%" height={5} borderRadius={3} style={{ marginTop: 10 }} />
      </View>
    </View>
  );
}

export function LiveCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.liveCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Skeleton width={56} height={56} borderRadius={14} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="30%" height={10} />
        <Skeleton width="85%" height={14} />
        <Skeleton width="60%" height={11} />
      </View>
      <Skeleton width={36} height={36} borderRadius={18} />
    </View>
  );
}

export function StatCardSkeleton() {
  const colors = useColors();
  return (
    <View style={[skeletonStyles.statCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Skeleton width={40} height={40} borderRadius={12} />
      <Skeleton width="60%" height={20} style={{ marginTop: 6 }} />
      <Skeleton width="80%" height={11} style={{ marginTop: 4 }} />
    </View>
  );
}

const skeletonStyles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
  },
  body: {
    padding: 14,
  },
  liveCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 6,
  },
});
