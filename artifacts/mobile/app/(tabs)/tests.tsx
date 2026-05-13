import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { TestCard } from "@/components/TestCard";
import { SubjectChip } from "@/components/SubjectChip";
import { Skeleton } from "@/components/Skeleton";

const SUBJECTS = ["All", "Accountancy", "Business Studies", "Economics", "Mathematics"];

function TestSkeleton() {
  const colors = useColors();
  return (
    <View style={[{ backgroundColor: colors.card, borderColor: colors.border, borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 12, flexDirection: "row", gap: 12, alignItems: "center" }]}>
      <Skeleton width={50} height={50} borderRadius={14} />
      <View style={{ flex: 1, gap: 6 }}>
        <Skeleton width="30%" height={10} />
        <Skeleton width="80%" height={14} />
        <Skeleton width="50%" height={10} />
      </View>
      <Skeleton width={34} height={34} borderRadius={17} />
    </View>
  );
}

export default function TestsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { tests } = useApp();
  const { width } = useWindowDimensions();
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [tab, setTab] = useState<"all" | "attempted">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 850);
    return () => clearTimeout(t);
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = tests.filter((t) => {
    const matchSub = selectedSubject === "All" || t.subject === selectedSubject;
    const matchTab = tab === "all" ? true : t.attempted;
    return matchSub && matchTab;
  });

  const attempted = tests.filter((t) => t.attempted);
  const avgScore =
    attempted.length > 0
      ? Math.round(
          attempted.reduce((a, t) => a + ((t.score ?? 0) / t.maxScore) * 100, 0) /
            attempted.length
        )
      : 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>Tests & Quizzes</Text>
        {!loading && attempted.length > 0 && (
          <View style={[styles.avgPill, { backgroundColor: colors.primary + "15", borderColor: colors.primary + "30" }]}>
            <Ionicons name="bar-chart" size={14} color={colors.primary} />
            <Text style={[styles.avgText, { color: colors.primary }]}>Avg {avgScore}%</Text>
          </View>
        )}
      </View>

      {/* Summary row */}
      {!loading && (
        <View style={[styles.summaryRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: colors.foreground }]}>{tests.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Total</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: colors.success }]}>{attempted.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Done</Text>
          </View>
          <View style={[styles.summaryDivider, { backgroundColor: colors.border }]} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: colors.warning }]}>{tests.length - attempted.length}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>Pending</Text>
          </View>
        </View>
      )}

      {/* Tabs + Chips */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.toggle, { backgroundColor: colors.secondary }]}>
          {(["all", "attempted"] as const).map((t) => (
            <Text
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.toggleOpt,
                {
                  backgroundColor: tab === t ? colors.primary : "transparent",
                  color: tab === t ? "#FFFFFF" : colors.mutedForeground,
                },
              ]}
            >
              {t === "all" ? "All Tests" : "Attempted"}
            </Text>
          ))}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
      >
        {SUBJECTS.map((s) => (
          <SubjectChip
            key={s}
            label={s}
            selected={selectedSubject === s}
            onPress={() => setSelectedSubject(s)}
          />
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}
      >
        {loading ? (
          [1, 2, 3].map((i) => <TestSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="clipboard-outline" size={44} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No tests found</Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Try a different filter</Text>
          </View>
        ) : (
          filtered.map((t) => (
            <TestCard key={t.id} test={t} onPress={() => router.push(`/test/${t.id}`)} />
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  avgPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
  },
  avgText: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  summaryRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
    alignItems: "center",
  },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryVal: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  summaryLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  summaryDivider: { width: 1, height: 30 },
  filterBar: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  toggle: { flexDirection: "row", borderRadius: 12, padding: 3, alignSelf: "flex-start" },
  toggleOpt: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    overflow: "hidden",
  },
  chipRow: { maxHeight: 56, borderBottomWidth: 1 },
  list: { paddingHorizontal: 20, paddingTop: 12 },
  empty: { borderRadius: 16, borderWidth: 1, padding: 36, alignItems: "center", gap: 10, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular" },
});
