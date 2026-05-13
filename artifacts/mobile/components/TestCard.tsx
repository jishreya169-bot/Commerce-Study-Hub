import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { Test } from "@/context/AppContext";

interface Props {
  test: Test;
  onPress: () => void;
}

const SUBJECT_COLORS: Record<string, string> = {
  Accountancy: "#0EA5E9",
  Economics: "#10B981",
  "Business Studies": "#8B5CF6",
  Mathematics: "#F59E0B",
  English: "#EF4444",
};

const DIFFICULTY_BG: Record<string, string> = {
  Easy: "#10B98118",
  Medium: "#F59E0B18",
  Hard: "#EF444418",
};
const DIFFICULTY_COLOR: Record<string, string> = {
  Easy: "#10B981",
  Medium: "#F59E0B",
  Hard: "#EF4444",
};

export function TestCard({ test, onPress }: Props) {
  const colors = useColors();
  const subjectColor = SUBJECT_COLORS[test.subject] ?? colors.primary;
  const scorePercent =
    test.score !== undefined ? Math.round((test.score / test.maxScore) * 100) : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      activeOpacity={0.85}
    >
      <View style={[styles.iconCircle, { backgroundColor: subjectColor + "18" }]}>
        <Ionicons name="clipboard" size={22} color={subjectColor} />
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.subject, { color: subjectColor }]}>{test.subject}</Text>
          <View
            style={[
              styles.diffBadge,
              { backgroundColor: DIFFICULTY_BG[test.difficulty] ?? colors.secondary },
            ]}
          >
            <Text
              style={[
                styles.diffText,
                { color: DIFFICULTY_COLOR[test.difficulty] ?? colors.primary },
              ]}
            >
              {test.difficulty}
            </Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>
          {test.title}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="help-circle-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>
            {test.totalQuestions} Qs
          </Text>
          <Text style={[styles.dot, { color: colors.border }]}>•</Text>
          <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{test.duration}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {test.attempted && scorePercent !== null ? (
          <View style={styles.scoreBox}>
            <Text
              style={[
                styles.scorePct,
                { color: scorePercent >= 60 ? colors.success : colors.destructive },
              ]}
            >
              {scorePercent}%
            </Text>
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Score</Text>
          </View>
        ) : (
          <View style={[styles.playBtn, { backgroundColor: colors.primary }]}>
            <Ionicons name="play" size={14} color="#FFFFFF" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  info: { flex: 1, gap: 4 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  subject: { fontSize: 10, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  diffBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 20 },
  diffText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  title: { fontSize: 13, fontFamily: "Poppins_600SemiBold", lineHeight: 19 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  dot: { fontSize: 11 },
  right: { alignItems: "center" },
  scoreBox: { alignItems: "center" },
  scorePct: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  scoreLabel: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  playBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
  },
});
