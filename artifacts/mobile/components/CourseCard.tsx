import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Course } from "@/context/AppContext";

const { width } = Dimensions.get("window");

interface Props {
  course: Course;
  onPress: () => void;
  compact?: boolean;
}

export function CourseCard({ course, onPress, compact = false }: Props) {
  const colors = useColors();
  const progress = course.totalLectures > 0 ? course.completedLectures / course.totalLectures : 0;
  const progressPercent = Math.round(progress * 100);

  if (compact) {
    return (
      <TouchableOpacity onPress={onPress} style={[styles.compactCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.8}>
        <View style={[styles.compactThumb, { backgroundColor: course.thumbnailColor }]}>
          <Ionicons name="book" size={22} color="#FFFFFF" />
        </View>
        <View style={styles.compactInfo}>
          <Text style={[styles.compactSubject, { color: colors.primary }]} numberOfLines={1}>{course.subject}</Text>
          <Text style={[styles.compactTitle, { color: colors.foreground }]} numberOfLines={1}>{course.title}</Text>
          <View style={styles.compactProgress}>
            <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
              <View style={[styles.progressBarFill, { backgroundColor: course.thumbnailColor, width: `${progressPercent}%` as any }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{progressPercent}%</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.85}>
      <View style={[styles.thumbnail, { backgroundColor: course.thumbnailColor }]}>
        <Ionicons name="book-outline" size={36} color="rgba(255,255,255,0.9)" />
        <View style={styles.ratingBadge}>
          <Ionicons name="star" size={10} color="#FFD700" />
          <Text style={styles.ratingText}>{course.rating}</Text>
        </View>
      </View>
      <View style={styles.info}>
        <View style={styles.subjectRow}>
          <Text style={[styles.subject, { color: course.thumbnailColor }]}>{course.subject}</Text>
          <View style={[styles.langBadge, { backgroundColor: colors.muted }]}>
            <Text style={[styles.langText, { color: colors.mutedForeground }]}>{course.language}</Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{course.title}</Text>
        <Text style={[styles.instructor, { color: colors.mutedForeground }]} numberOfLines={1}>{course.instructor}</Text>
        <View style={styles.footer}>
          <View style={[styles.progressBarBg, { backgroundColor: colors.muted, flex: 1, marginRight: 8 }]}>
            <View style={[styles.progressBarFill, { backgroundColor: course.thumbnailColor, width: `${progressPercent}%` as any }]} />
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
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 14,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  thumbnail: {
    height: 120,
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
    backgroundColor: "rgba(0,0,0,0.3)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
  },
  ratingText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
  },
  info: {
    padding: 14,
    gap: 6,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subject: {
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  langBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  langText: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
  },
  title: {
    fontSize: 15,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 22,
  },
  instructor: {
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  progressBarBg: {
    height: 5,
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: 5,
    borderRadius: 3,
  },
  lectureCount: {
    fontSize: 11,
    fontFamily: "Poppins_500Medium",
  },
  compactCard: {
    flexDirection: "row",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 12,
    marginBottom: 10,
    alignItems: "center",
  },
  compactThumb: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  compactInfo: {
    flex: 1,
    gap: 4,
  },
  compactSubject: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  compactTitle: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
  },
  compactProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
  },
});
