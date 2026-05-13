import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { TestCard } from "@/components/TestCard";
import { SubjectChip } from "@/components/SubjectChip";

const SUBJECTS = ["All", "Accountancy", "Business Studies", "Economics", "Mathematics"];

export default function TestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tests } = useApp();
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [tab, setTab] = useState<"all" | "attempted">("all");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = tests.filter((t) => {
    const matchSubject = selectedSubject === "All" || t.subject === selectedSubject;
    const matchTab = tab === "all" ? true : t.attempted;
    return matchSubject && matchTab;
  });

  const attempted = tests.filter((t) => t.attempted);
  const avgScore = attempted.length > 0
    ? Math.round(attempted.reduce((acc, t) => acc + ((t.score ?? 0) / t.maxScore) * 100, 0) / attempted.length)
    : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Tests & Quizzes</Text>
        {/* Score Summary */}
        {attempted.length > 0 && (
          <View style={[styles.scoreSummary, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <Ionicons name="bar-chart" size={16} color={colors.primary} />
            <Text style={[styles.scoreAvg, { color: colors.primary }]}>Avg: {avgScore}%</Text>
          </View>
        )}
      </View>

      {/* Tab Toggle */}
      <View style={[styles.tabRow, { paddingHorizontal: 20, paddingVertical: 10 }]}>
        <View style={[styles.tabToggle, { backgroundColor: colors.muted }]}>
          <View style={[styles.tabBtn, tab === "all" && { backgroundColor: colors.primary }]}>
            <Text onPress={() => setTab("all")} style={[styles.tabBtnText, { color: tab === "all" ? "#FFFFFF" : colors.mutedForeground }]}>
              All Tests
            </Text>
          </View>
          <View style={[styles.tabBtn, tab === "attempted" && { backgroundColor: colors.primary }]}>
            <Text onPress={() => setTab("attempted")} style={[styles.tabBtnText, { color: tab === "attempted" ? "#FFFFFF" : colors.mutedForeground }]}>
              Attempted
            </Text>
          </View>
        </View>
      </View>

      {/* Subject Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 10 }}>
        {SUBJECTS.map((s) => (
          <SubjectChip key={s} label={s} selected={selectedSubject === s} onPress={() => setSelectedSubject(s)} />
        ))}
      </ScrollView>

      {/* Test List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 100 : 100 }]}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="clipboard-outline" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No tests found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Try a different filter</Text>
          </View>
        ) : (
          filtered.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onPress={() => router.push(`/test/${test.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 4,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  scoreSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  scoreAvg: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  tabRow: {},
  tabToggle: { flexDirection: "row", borderRadius: 12, padding: 3, alignSelf: "flex-start" },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 10 },
  tabBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  chipScroll: { maxHeight: 48 },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Poppins_600SemiBold" },
  emptySubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
});
