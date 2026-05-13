import React, { useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

/**
 * Lecture router — dispatches to the correct screen based on chapter state:
 * - isLive and no recording → live-session
 * - hasRecording or completed → recorded screen (with comments/notes)
 * - otherwise → recorded screen as preview
 */
export default function LectureRouter() {
  const colors = useColors();
  const router = useRouter();
  const { id, courseId } = useLocalSearchParams<{ id: string; courseId: string }>();
  const { courses } = useApp();

  const course = courses.find((c) => c.id === courseId);
  const chapter = course?.chapters.find((ch) => ch.id === id);

  useEffect(() => {
    if (!chapter) {
      router.back();
      return;
    }
    if (chapter.isLive && !chapter.hasRecording) {
      router.replace(`/live-session/${courseId}`);
    } else {
      router.replace(`/recorded/${id}?courseId=${courseId}&chapterId=${id}`);
    }
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.text, { color: colors.mutedForeground }]}>Loading…</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 14, fontFamily: "Poppins_400Regular" },
});
