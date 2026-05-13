import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Animated,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

export default function LectureScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, courseId } = useLocalSearchParams<{ id: string; courseId: string }>();
  const { courses, markLectureComplete } = useApp();
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [completed, setCompleted] = useState(false);
  const pulseAnim = new Animated.Value(1);

  const course = courses.find((c) => c.id === courseId);
  const chapter = course?.chapters.find((ch) => ch.id === id);

  useEffect(() => {
    if (chapter?.completed) {
      setCompleted(true);
      setProgress(100);
    }
  }, [chapter]);

  useEffect(() => {
    if (isPlaying && progress < 100) {
      const interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) {
            setIsPlaying(false);
            handleComplete();
            clearInterval(interval);
            return 100;
          }
          return p + 1;
        });
      }, 300);
      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    if (isPlaying) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.08, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isPlaying]);

  const handleComplete = async () => {
    if (!completed && courseId && id) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setCompleted(true);
      await markLectureComplete(courseId, id);
    }
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.courseTitle, { color: colors.mutedForeground }]} numberOfLines={1}>{course?.title}</Text>
          <Text style={[styles.chapterTitle, { color: colors.foreground }]} numberOfLines={1}>{chapter?.title}</Text>
        </View>
        {completed && (
          <View style={[styles.completedBadge, { backgroundColor: colors.success + "20" }]}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          </View>
        )}
      </View>

      {/* Video Player Area */}
      <View style={[styles.playerArea, { backgroundColor: "#0A0014" }]}>
        <Animated.View style={[styles.playerCenter, { transform: [{ scale: pulseAnim }] }]}>
          <TouchableOpacity
            onPress={() => {
              setIsPlaying(!isPlaying);
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }}
            style={[styles.playButton, { backgroundColor: course?.thumbnailColor ?? colors.primary }]}
            activeOpacity={0.85}
          >
            <Ionicons name={isPlaying ? "pause" : "play"} size={32} color="#FFFFFF" />
          </TouchableOpacity>
        </Animated.View>
        {isPlaying && (
          <View style={styles.waveContainer}>
            {[1, 2, 3, 4, 5, 4, 3, 2, 1].map((h, i) => (
              <View
                key={i}
                style={[styles.waveBars, { height: h * 8 + 8, backgroundColor: (course?.thumbnailColor ?? colors.primary) + "80" }]}
              />
            ))}
          </View>
        )}
        <View style={styles.playerInfo}>
          <Ionicons name="headset" size={16} color="rgba(255,255,255,0.6)" />
          <Text style={styles.playerInfoText}>{isPlaying ? "Playing audio lecture..." : "Tap to play"}</Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={[styles.progressContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.progressRow}>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>
            {Math.round(progress / 100 * (chapter ? parseInt(chapter.duration) : 45))} min
          </Text>
          <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>{chapter?.duration}</Text>
        </View>
        <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
          <View style={[styles.progressBarFill, { backgroundColor: course?.thumbnailColor ?? colors.primary, width: `${progress}%` as any }]} />
        </View>
      </View>

      {/* Chapter Info */}
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[styles.infoTitle, { color: colors.foreground }]}>{chapter?.title ?? "Lecture"}</Text>
        {course && (
          <View style={styles.infoMeta}>
            <Ionicons name="person-circle-outline" size={15} color={colors.mutedForeground} />
            <Text style={[styles.infoInstructor, { color: colors.mutedForeground }]}>{course.instructor}</Text>
            <Text style={[styles.infoDot, { color: colors.border }]}>•</Text>
            <Text style={[styles.infoDuration, { color: colors.mutedForeground }]}>{chapter?.duration}</Text>
          </View>
        )}
        {completed ? (
          <View style={[styles.completedBanner, { backgroundColor: colors.success + "15" }]}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={[styles.completedText, { color: colors.success }]}>Lecture Completed!</Text>
          </View>
        ) : (
          <TouchableOpacity
            onPress={handleComplete}
            style={[styles.markDoneBtn, { backgroundColor: course?.thumbnailColor ?? colors.primary }]}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={18} color="#FFFFFF" />
            <Text style={styles.markDoneText}>Mark as Complete</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    justifyContent: "center",
    alignItems: "center",
  },
  headerInfo: { flex: 1 },
  courseTitle: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  chapterTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  completedBadge: { padding: 8, borderRadius: 20 },
  playerArea: {
    height: 220,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  playerCenter: { alignItems: "center", gap: 16 },
  playButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  waveContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  waveBars: {
    width: 4,
    borderRadius: 2,
  },
  playerInfo: {
    position: "absolute",
    bottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  playerInfoText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 12,
    fontFamily: "Poppins_400Regular",
  },
  progressContainer: {
    padding: 16,
    gap: 8,
    borderBottomWidth: 1,
  },
  progressRow: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  progressBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: 6, borderRadius: 3 },
  infoCard: {
    margin: 20,
    borderRadius: 18,
    borderWidth: 1,
    padding: 18,
    gap: 12,
  },
  infoTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  infoMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  infoInstructor: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  infoDot: { fontSize: 14 },
  infoDuration: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  completedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    padding: 12,
    justifyContent: "center",
  },
  completedText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  markDoneBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
  },
  markDoneText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold" },
});
