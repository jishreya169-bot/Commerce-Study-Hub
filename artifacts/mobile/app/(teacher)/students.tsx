import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const STUDENTS = [
  { id: "s1", name: "Priya Sharma", roll: "2401", class: "XII-A", avatar: "PS", progress: 78, lastActive: "2 hr ago", doubts: 3, testsAvg: 82, attendance: 94, color: "#5B9BD5" },
  { id: "s2", name: "Rahul Mehta", roll: "2402", class: "XII-A", avatar: "RM", progress: 65, lastActive: "5 hr ago", doubts: 1, testsAvg: 74, attendance: 88, color: "#5BAD9B" },
  { id: "s3", name: "Ananya Kapoor", roll: "2403", class: "XII-B", avatar: "AK", progress: 91, lastActive: "1 hr ago", doubts: 2, testsAvg: 93, attendance: 98, color: "#9B7BC4" },
  { id: "s4", name: "Vikram Singh", roll: "2404", class: "XII-A", avatar: "VS", progress: 45, lastActive: "Yesterday", doubts: 5, testsAvg: 58, attendance: 72, color: "#D69E2E" },
  { id: "s5", name: "Deepika Nair", roll: "2405", class: "XII-B", avatar: "DN", progress: 83, lastActive: "3 hr ago", doubts: 0, testsAvg: 88, attendance: 96, color: "#48BB78" },
  { id: "s6", name: "Arjun Patel", roll: "2406", class: "XII-C", avatar: "AP", progress: 52, lastActive: "2 days ago", doubts: 4, testsAvg: 61, attendance: 79, color: "#7B8EBF" },
  { id: "s7", name: "Sneha Gupta", roll: "2407", class: "XII-C", avatar: "SG", progress: 70, lastActive: "4 hr ago", doubts: 1, testsAvg: 77, attendance: 91, color: "#BF7B5B" },
];

const CLASSES = ["All", "XII-A", "XII-B", "XII-C"];

export default function TeacherStudents() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = STUDENTS.filter((s) => {
    const ms = search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search);
    const mc = classFilter === "All" || s.class === classFilter;
    return ms && mc;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Students</Text>
        <View style={[styles.countBadge, { backgroundColor: "#48BB7818" }]}>
          <Text style={[styles.countBadgeText, { color: "#48BB78" }]}>{STUDENTS.length} Total</Text>
        </View>
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={15} color={colors.mutedForeground} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by name or roll number" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
        {CLASSES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setClassFilter(c)}
            style={[styles.chip, { backgroundColor: classFilter === c ? "#48BB78" : colors.muted, borderColor: classFilter === c ? "#48BB78" : colors.border }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, { color: classFilter === c ? "#FFFFFF" : colors.mutedForeground }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Summary */}
      <View style={[styles.summaryBar, { backgroundColor: colors.muted }]}>
        <Text style={[styles.summaryText, { color: colors.mutedForeground }]}>
          Avg Progress: <Text style={{ color: "#48BB78", fontFamily: "Poppins_700Bold" }}>{Math.round(STUDENTS.reduce((a, s) => a + s.progress, 0) / STUDENTS.length)}%</Text>
          {"   "}Avg Attendance: <Text style={{ color: colors.primary, fontFamily: "Poppins_700Bold" }}>{Math.round(STUDENTS.reduce((a, s) => a + s.attendance, 0) / STUDENTS.length)}%</Text>
          {"   "}Avg Score: <Text style={{ color: colors.warning, fontFamily: "Poppins_700Bold" }}>{Math.round(STUDENTS.reduce((a, s) => a + s.testsAvg, 0) / STUDENTS.length)}%</Text>
        </Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => setExpanded(expanded === s.id ? null : s.id)}
            style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.85}
          >
            <View style={styles.studentTop}>
              <View style={[styles.avatar, { backgroundColor: s.color }]}>
                <Text style={styles.avatarText}>{s.avatar}</Text>
              </View>
              <View style={styles.studentInfo}>
                <View style={styles.nameRow}>
                  <Text style={[styles.studentName, { color: colors.foreground }]}>{s.name}</Text>
                  <View style={[styles.classBadge, { backgroundColor: s.color + "18" }]}>
                    <Text style={[styles.classBadgeText, { color: s.color }]}>{s.class}</Text>
                  </View>
                </View>
                <Text style={[styles.roll, { color: colors.mutedForeground }]}>Roll #{s.roll} • Last active {s.lastActive}</Text>
                <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                  <View style={[styles.progressFill, { backgroundColor: s.progress >= 75 ? "#48BB78" : s.progress >= 50 ? colors.warning : "#E53E3E", width: `${s.progress}%` as any }]} />
                </View>
                <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{s.progress}% overall progress</Text>
              </View>
              <Ionicons name={expanded === s.id ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
            </View>

            {expanded === s.id && (
              <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
                {[
                  { icon: "clipboard", label: "Avg Score", val: `${s.testsAvg}%`, color: colors.warning },
                  { icon: "calendar", label: "Attendance", val: `${s.attendance}%`, color: colors.primary },
                  { icon: "help-circle", label: "Doubts", val: s.doubts, color: "#48BB78" },
                ].map((d) => (
                  <View key={d.label} style={styles.detailItem}>
                    <Ionicons name={d.icon as any} size={15} color={d.color} />
                    <Text style={[styles.detailVal, { color: colors.foreground }]}>{d.val}</Text>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{d.label}</Text>
                  </View>
                ))}
                <TouchableOpacity style={[styles.messageBtn, { backgroundColor: "#48BB7818", borderColor: "#48BB7830" }]} activeOpacity={0.8}>
                  <Ionicons name="chatbubble-outline" size={14} color="#48BB78" />
                  <Text style={[styles.messageBtnText, { color: "#48BB78" }]}>Message</Text>
                </TouchableOpacity>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 20, fontFamily: "Poppins_700Bold" },
  countBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  countBadgeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  chipRow: { maxHeight: 52, borderBottomWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  summaryBar: { paddingHorizontal: 16, paddingVertical: 8 },
  summaryText: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  scroll: { padding: 16, gap: 0 },
  studentCard: { borderRadius: 14, borderWidth: 1, marginBottom: 10, padding: 14, gap: 0 },
  studentTop: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatarText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  studentInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  studentName: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  classBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  classBadgeText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  roll: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  progressBg: { height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 3 },
  progressText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  detailRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, marginTop: 12, paddingTop: 12, gap: 0 },
  detailItem: { flex: 1, alignItems: "center", gap: 2 },
  detailVal: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  detailLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  messageBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1 },
  messageBtnText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
});
