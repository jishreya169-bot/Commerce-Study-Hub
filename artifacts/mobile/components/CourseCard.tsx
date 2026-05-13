import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Course } from "@/context/AppContext";

interface Props {
  course: Course;
  onPress: () => void;
  compact?: boolean;
}

export function CourseCard({ course, onPress, compact = false }: Props) {
  const colors = useColors();
  const { width } = useWindowDimensions();
  const progress = course.totalLectures > 0 ? course.completedLectures / course.totalLectures : 0;
  const progressPercent = Math.round(progress * 100);

  if (compact) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        activeOpacity={0.8}
      >
        <View style={[styles.compactThumb, { backgroundColor: course.thumbnailColor }]}>
          <Ionicons name="book" size={20} color="#FFFFFF" />
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.compactSubject, { color: course.thumbnailColor }]} numberOfLines={1}>
            {course.subject}
          </Text>
          <Text style={[styles.compactTitle, { color: colors.foreground }]} numberOfLines={1}>
            {course.title}
          </Text>
          <View style={styles.compactProgressRow}>
            <View style={[styles.progressBg, { backgroundColor: colors.secondary, flex: 1 }]}>
              <View
                style={[
                  styles.progressFill,
                  { backgroundColor: course.thumbnailColor, width: `${progressPercent}%` as any },
                ]}
              />
            </View>
            <Text style={[styles.progressPct, { color: colors.mutedForeground }]}>{progressPercent}%</Text>
          </View>
        </View>
        <Ionicons name="chevron-forward" size={16} color={colors.border} />
      </TouchableOpacity>
    );
  }

  const isWide = width >= 600;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
    >
      <View style={[styles.thumbnail, { backgroundColor: course.thumbnailColor, height: isWide ? 160 : 120 }]}>
        <Ionicons name="book-outline" size={isWide ? 48 : 36} color="rgba(255,255,255,0.85)" />
        <View style={[styles.ratingBadge, { backgroundColor: "rgba(0,0,0,0.25)" }]}>
          <Ionicons name="star" size={10} color="#FBBF24" />
          <Text style={styles.ratingText}>{course.rating}</Text>
        </View>
        <View style={[styles.enrolledBadge, { backgroundColor: course.enrolled ? colors.success + "EE" : "rgba(0,0,0,0.25)" }]}>
          <Text style={styles.enrolledText}>{course.enrolled ? "Enrolled" : "Explore"}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.subjectRow}>
          <Text style={[styles.subject, { color: course.thumbnailColor }]}>{course.subject}</Text>
          <View style={[styles.langBadge, { backgroundColor: colors.secondary }]}>
            <Text style={[styles.langText, { color: colors.secondaryForeground }]}>{course.language}</Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {course.title}
        </Text>
        <Text style={[styles.instructor, { color: colors.mutedForeground }]} numberOfLines={1}>
          {course.instructor}
        </Text>
        <View style={styles.footerRow}>
          <View style={[styles.progressBg, { backgroundColor: colors.secondary, flex: 1, marginRight: 8 }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: course.thumbnailColor, width: `${progressPercent}%` as any },
              ]}
            />
          </View>
          <Text style={[styles.lectureCount, { color: colors.mutedForeground }]}>
            {course.completedLectures}/{course.totalLectures}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  ratingBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  enrolledBadge: {
    position: "absolute",
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  enrolledText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  info: { padding: 14, gap: 6 },
  subjectRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  subject: { fontSize: 11, fontFamily: "Poppins_600SemiBold", letterSpacing: 0.5, textTransform: "uppercase" },
  langBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  langText: { fontSize: 10, fontFamily: "Poppins_500Medium" },
  title: { fontSize: 15, fontFamily: "Poppins_700Bold", lineHeight: 22 },
  instructor: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  footerRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  lectureCount: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  progressBg: { height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 3 },
  compactCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginBottom: 10,
    alignItems: "center",
    shadowColor: "#0EA5E9",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  compactThumb: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  compactInfo: { flex: 1, gap: 4 },
  compactSubject: { fontSize: 10, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  compactTitle: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  compactProgressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressPct: { fontSize: 10, fontFamily: "Poppins_500Medium", minWidth: 28 },
});
