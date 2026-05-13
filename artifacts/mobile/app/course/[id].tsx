import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const { courses, markLectureComplete } = useApp();

  const course = courses.find((c) => c.id === id);

  if (!course) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Course not found</Text>
      </View>
    );
  }

  const progress = course.totalLectures > 0 ? course.completedLectures / course.totalLectures : 0;
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const handleChapterPress = (chapterId: string, isCompleted: boolean) => {
    router.push(`/lecture/${chapterId}?courseId=${course.id}`);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: course.thumbnailColor, paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.heroIcon}>
          <Ionicons name="book" size={52} color="rgba(255,255,255,0.3)" />
        </View>
        <Text style={styles.heroSubject}>{course.subject}</Text>
        <Text style={styles.heroTitle}>{course.title}</Text>
        <View style={styles.heroMeta}>
          <Ionicons name="person-circle" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.heroInstructor}>{course.instructor}</Text>
          <Text style={styles.heroDot}>•</Text>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.heroRating}>{course.rating}</Text>
          <Text style={styles.heroDot}>•</Text>
          <Ionicons name="language" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.heroLang}>{course.language}</Text>
        </View>
        {/* Progress */}
        <View style={styles.progressSection}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressText}>{course.completedLectures}/{course.totalLectures} Lectures</Text>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={[styles.progressBg]}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` as any }]} />
          </View>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 100 : 60 }]}>
        {/* Description */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About Course</Text>
          <Text style={[styles.description, { color: colors.mutedForeground }]}>{course.description}</Text>
        </View>

        {/* Chapters */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Chapters ({course.chapters.length})</Text>
          {course.chapters.map((chapter, idx) => (
            <TouchableOpacity
              key={chapter.id}
              onPress={() => handleChapterPress(chapter.id, chapter.completed)}
              style={[styles.chapterRow, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[
                styles.chapterNumber,
                { backgroundColor: chapter.completed ? course.thumbnailColor : colors.muted },
              ]}>
                {chapter.completed ? (
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                ) : (
                  <Text style={[styles.chapterIdx, { color: colors.mutedForeground }]}>{idx + 1}</Text>
                )}
              </View>
              <View style={styles.chapterInfo}>
                <Text style={[styles.chapterTitle, { color: colors.foreground }]} numberOfLines={2}>{chapter.title}</Text>
                <View style={styles.chapterMeta}>
                  <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.chapterDuration, { color: colors.mutedForeground }]}>{chapter.duration}</Text>
                </View>
              </View>
              <Ionicons
                name={chapter.completed ? "checkmark-circle" : "play-circle-outline"}
                size={26}
                color={chapter.completed ? course.thumbnailColor : colors.primary}
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
  hero: { padding: 20, paddingBottom: 24, gap: 8 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  heroIcon: { position: "absolute", right: 20, top: 80, opacity: 0.4 },
  heroSubject: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 1 },
  heroTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold", lineHeight: 30 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  heroInstructor: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  heroDot: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  heroRating: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_500Medium" },
  heroLang: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  progressSection: { gap: 6, marginTop: 6 },
  progressInfo: { flexDirection: "row", justifyContent: "space-between" },
  progressText: { color: "rgba(255,255,255,0.85)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  progressPercent: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  progressBg: { height: 6, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.25)", overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", marginBottom: 12 },
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
  chapterNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  chapterIdx: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  chapterInfo: { flex: 1, gap: 4 },
  chapterTitle: { fontSize: 13, fontFamily: "Poppins_600SemiBold", lineHeight: 18 },
  chapterMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  chapterDuration: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  errorText: { fontSize: 16, fontFamily: "Poppins_400Regular" },
});
