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
  Accountancy: "#6200EE",
  Economics: "#00897B",
  "Business Studies": "#0288D1",
  Mathematics: "#AD1457",
  English: "#E65100",
};

const DIFFICULTY_COLORS = {
  Easy: "#00C853",
  Medium: "#FF8F00",
  Hard: "#B00020",
};

export function TestCard({ test, onPress }: Props) {
  const colors = useColors();
  const subjectColor = SUBJECT_COLORS[test.subject] ?? colors.primary;
  const diffColor = DIFFICULTY_COLORS[test.difficulty];
  const scorePercent = test.score !== undefined ? Math.round((test.score / test.maxScore) * 100) : null;

  return (
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.85}>
      <View style={[styles.iconCircle, { backgroundColor: subjectColor + "20" }]}>
        <Ionicons name="clipboard" size={24} color={subjectColor} />
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.subject, { color: subjectColor }]}>{test.subject}</Text>
          <View style={[styles.diffBadge, { backgroundColor: diffColor + "20" }]}>
            <Text style={[styles.diffText, { color: diffColor }]}>{test.difficulty}</Text>
          </View>
        </View>
        <Text style={[styles.title, { color: colors.foreground }]} numberOfLines={2}>{test.title}</Text>
        <View style={styles.meta}>
          <Ionicons name="help-circle-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{test.totalQuestions} Questions</Text>
          <Text style={[styles.dot, { color: colors.border }]}>•</Text>
          <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{test.duration}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {test.attempted && scorePercent !== null ? (
          <View style={styles.scoreContainer}>
            <Text style={[styles.score, { color: scorePercent >= 60 ? colors.success : colors.destructive }]}>{scorePercent}%</Text>
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>Score</Text>
          </View>
        ) : (
          <View style={[styles.startBtn, { backgroundColor: colors.primary }]}>
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
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subject: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  diffBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 20,
  },
  diffText: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
  },
  title: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 19,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  dot: {
    fontSize: 12,
  },
  right: {
    alignItems: "center",
  },
  scoreContainer: {
    alignItems: "center",
  },
  score: {
    fontSize: 18,
    fontFamily: "Poppins_700Bold",
  },
  scoreLabel: {
    fontSize: 10,
    fontFamily: "Poppins_400Regular",
  },
  startBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
