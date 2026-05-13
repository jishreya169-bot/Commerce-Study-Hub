import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

export default function CourseDetailScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses } = useApp();

  const course = courses.find((c) => c.id === id);
  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={[{ color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }]}>Course not found</Text>
      </View>
    );
  }

  const progress = course.totalLectures > 0 ? course.completedLectures / course.totalLectures : 0;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: course.thumbnailColor, paddingTop: topPad + 6 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={21} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.heroGlow}>
          <Ionicons name="book" size={width > 400 ? 72 : 56} color="rgba(255,255,255,0.15)" />
        </View>
        <View style={[styles.enrolledChip, { backgroundColor: course.enrolled ? colors.success + "DD" : "rgba(0,0,0,0.2)" }]}>
          <Text style={styles.enrolledChipText}>{course.enrolled ? "✓ Enrolled" : "Explore"}</Text>
        </View>
        <Text style={styles.heroSubject}>{course.subject}</Text>
        <Text style={styles.heroTitle}>{course.title}</Text>
        <View style={styles.heroMeta}>
          <Ionicons name="person-circle" size={15} color="rgba(255,255,255,0.8)" />
          <Text style={styles.heroMetaText}>{course.instructor}</Text>
          <Text style={styles.heroDot}>•</Text>
          <Ionicons name="star" size={13} color="#FBBF24" />
          <Text style={styles.heroMetaText}>{course.rating}</Text>
          <Text style={styles.heroDot}>•</Text>
          <Text style={styles.heroMetaText}>{course.language}</Text>
        </View>
        {/* Progress bar */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>{course.completedLectures} of {course.totalLectures} lectures</Text>
            <Text style={styles.progressPct}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 60 : 60 }]}
      >
        {/* About */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About this Course</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{course.description}</Text>
        </View>

        {/* Chapters */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            Chapters ({course.chapters.length})
          </Text>
          {course.chapters.map((ch, idx) => (
            <TouchableOpacity
              key={ch.id}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.push(`/lecture/${ch.id}?courseId=${course.id}`);
              }}
              style={[styles.chapterRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.chapterNum,
                  { backgroundColor: ch.completed ? course.thumbnailColor : colors.secondary },
                ]}
              >
                {ch.completed ? (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.chapterIdx, { color: colors.mutedForeground }]}>{idx + 1}</Text>
                )}
              </View>
              <View style={styles.chapterInfo}>
                <Text style={[styles.chapterTitle, { color: colors.foreground }]} numberOfLines={2}>
                  {ch.title}
                </Text>
                <View style={styles.chapterMeta}>
                  <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.chapterDuration, { color: colors.mutedForeground }]}>{ch.duration}</Text>
                </View>
              </View>
              <Ionicons
                name={ch.completed ? "checkmark-circle" : "play-circle-outline"}
                size={26}
                color={ch.completed ? course.thumbnailColor : colors.primary}
              />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 18, paddingBottom: 22, gap: 8, position: "relative", overflow: "hidden" },
  heroGlow: { position: "absolute", right: -10, top: 50 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.18)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  enrolledChip: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 4,
  },
  enrolledChipText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  heroSubject: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  heroTitle: { color: "#FFFFFF", fontSize: 20, fontFamily: "Poppins_700Bold", lineHeight: 28 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  heroMetaText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  heroDot: { color: "rgba(255,255,255,0.5)", fontSize: 13 },
  progressSection: { gap: 6, marginTop: 4 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  progressPct: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  progressTrack: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontFamily: "Poppins_700Bold", marginBottom: 12 },
  description: { fontSize: 14, fontFamily: "Poppins_400Regular", lineHeight: 22 },
  chapterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
  },
  chapterNum: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  chapterIdx: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  chapterInfo: { flex: 1, gap: 3 },
  chapterTitle: { fontSize: 13, fontFamily: "Poppins_600SemiBold", lineHeight: 18 },
  chapterMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  chapterDuration: { fontSize: 11, fontFamily: "Poppins_400Regular" },
});
