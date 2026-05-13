import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

/**
 * Live class router — dispatches to live-session or recorded screen.
 */
export default function LiveRouter() {
  const colors = useColors();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { liveClasses } = useApp();

  const cls = liveClasses.find((l) => l.id === id);

  React.useEffect(() => {
    if (!cls) { router.back(); return; }
    if (cls.isLive) {
      router.replace(`/live-session/${id}`);
    } else if (cls.hasRecording) {
      router.replace(`/recorded/${cls.recordingId ?? id}`);
    } else {
      router.replace(`/live-session/${id}`);
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
