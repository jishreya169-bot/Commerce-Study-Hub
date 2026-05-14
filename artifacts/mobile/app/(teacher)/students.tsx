import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

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

const getProgressColor = (p: number) => p >= 75 ? "#48BB78" : p >= 50 ? "#D69E2E" : "#E53E3E";

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

  const avgProgress = Math.round(STUDENTS.reduce((a, s) => a + s.progress, 0) / STUDENTS.length);
  const atRisk = STUDENTS.filter((s) => s.attendance < 80 || s.progress < 50).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── COLORED BANNER ── */}
      <View style={[styles.headerBanner, { paddingTop: topPad + 8, backgroundColor: "#48BB78", overflow: "hidden" }]}>
        <View style={[styles.dec1, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
        <View style={[styles.dec2, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        <View style={styles.bannerRow}>
          <View>
            <Text style={styles.bannerLabel}>TEACHER PORTAL</Text>
            <Text style={styles.bannerTitle}>My Students</Text>
          </View>
          <View style={styles.bannerBadges}>
            <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name="people" size={11} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>{STUDENTS.length} total</Text>
            </View>
            {atRisk > 0 && (
              <View style={[styles.heroBadge, { backgroundColor: "#E53E3E90" }]}>
                <Ionicons name="warning" size={11} color="#FFFFFF" />
                <Text style={styles.heroBadgeText}>{atRisk} at risk</Text>
              </View>
            )}
          </View>
        </View>
        <View style={[styles.bannerStrip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          {[
            { val: STUDENTS.length, label: "Students", icon: "people" },
            { val: `${avgProgress}%`, label: "Avg Progress", icon: "trending-up" },
            { val: Math.round(STUDENTS.reduce((a, s) => a + s.attendance, 0) / STUDENTS.length) + "%", label: "Avg Attend.", icon: "calendar" },
            { val: Math.round(STUDENTS.reduce((a, s) => a + s.testsAvg, 0) / STUDENTS.length) + "%", label: "Avg Score", icon: "clipboard" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.stripStat}>
                <Ionicons name={s.icon as any} size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.stripVal}>{s.val}</Text>
                <Text style={styles.stripLabel}>{s.label}</Text>
              </View>
              {i < 3 && <View style={[styles.stripDiv, { backgroundColor: "rgba(255,255,255,0.2)" }]} />}
            </React.Fragment>
          ))}
        </View>
        <View style={[styles.waveCut, { backgroundColor: colors.background }]} />
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={15} color={colors.mutedForeground} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search by name or roll…" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch("")}>
              <Ionicons name="close-circle" size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Class filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
        {CLASSES.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => { setClassFilter(c); Haptics.selectionAsync(); }}
            style={[styles.chip, { backgroundColor: classFilter === c ? "#48BB78" : colors.muted, borderColor: classFilter === c ? "#48BB78" : colors.border }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, { color: classFilter === c ? "#FFFFFF" : colors.mutedForeground }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="people-outline" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No students found</Text>
          </View>
        )}
        {filtered.map((s) => {
          const isAtRisk = s.attendance < 80 || s.progress < 50;
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => { setExpanded(expanded === s.id ? null : s.id); Haptics.selectionAsync(); }}
              style={[styles.studentCard, { backgroundColor: colors.card, borderColor: isAtRisk ? "#E53E3E40" : colors.border, shadowColor: "#000" }]}
              activeOpacity={0.85}
            >
              {isAtRisk && <View style={[styles.riskStripe, { backgroundColor: "#E53E3E" }]} />}
              <View style={styles.studentTop}>
                <View style={[styles.avatarRing, { borderColor: s.color + "40" }]}>
                  <View style={[styles.avatar, { backgroundColor: s.color }]}>
                    <Text style={styles.avatarText}>{s.avatar}</Text>
                  </View>
                </View>
                <View style={styles.studentInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.studentName, { color: colors.foreground }]}>{s.name}</Text>
                    <View style={[styles.classBadge, { backgroundColor: s.color + "18" }]}>
                      <Text style={[styles.classBadgeText, { color: s.color }]}>{s.class}</Text>
                    </View>
                    {isAtRisk && (
                      <View style={[styles.riskBadge, { backgroundColor: "#FFF5F5" }]}>
                        <Ionicons name="warning" size={9} color="#E53E3E" />
                        <Text style={[styles.riskText, { color: "#E53E3E" }]}>At Risk</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.roll, { color: colors.mutedForeground }]}>Roll #{s.roll} • Last active {s.lastActive}</Text>
                  <View style={styles.progressRow}>
                    <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                      <View style={[styles.progressFill, { backgroundColor: getProgressColor(s.progress), width: `${s.progress}%` as any }]} />
                    </View>
                    <Text style={[styles.progressText, { color: getProgressColor(s.progress) }]}>{s.progress}%</Text>
                  </View>
                </View>
                <View style={[styles.expandIcon, { backgroundColor: colors.muted }]}>
                  <Ionicons name={expanded === s.id ? "chevron-up" : "chevron-down"} size={14} color={colors.mutedForeground} />
                </View>
              </View>

              {expanded === s.id && (
                <View style={[styles.detailBlock, { borderTopColor: colors.border }]}>
                  <View style={styles.detailStats}>
                    {[
                      { icon: "clipboard", label: "Avg Score", val: `${s.testsAvg}%`, color: "#D69E2E" },
                      { icon: "calendar", label: "Attendance", val: `${s.attendance}%`, color: "#5B9BD5" },
                      { icon: "help-circle", label: "Doubts", val: `${s.doubts}`, color: "#48BB78" },
                    ].map((d, i) => (
                      <React.Fragment key={d.label}>
                        <View style={styles.detailItem}>
                          <View style={[styles.detailIcon, { backgroundColor: d.color + "18" }]}>
                            <Ionicons name={d.icon as any} size={14} color={d.color} />
                          </View>
                          <Text style={[styles.detailVal, { color: colors.foreground }]}>{d.val}</Text>
                          <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{d.label}</Text>
                        </View>
                        {i < 2 && <View style={[styles.detailDiv, { backgroundColor: colors.border }]} />}
                      </React.Fragment>
                    ))}
                  </View>
                  <TouchableOpacity style={[styles.messageBtn, { backgroundColor: "#48BB7818", borderColor: "#48BB7830" }]} activeOpacity={0.8}>
                    <Ionicons name="chatbubble-outline" size={14} color="#48BB78" />
                    <Text style={[styles.messageBtnText, { color: "#48BB78" }]}>Send Message</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBanner: { paddingHorizontal: 16, paddingBottom: 30, position: "relative" },
  dec1: { position: "absolute", width: 200, height: 200, borderRadius: 100, top: -60, right: -40 },
  dec2: { position: "absolute", width: 120, height: 120, borderRadius: 60, bottom: -20, left: -20 },
  bannerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, zIndex: 1 },
  bannerLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 1.2, marginBottom: 2 },
  bannerTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold" },
  bannerBadges: { gap: 6, alignItems: "flex-end" },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  bannerStrip: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 12, zIndex: 1 },
  stripStat: { flex: 1, alignItems: "center", gap: 2 },
  stripVal: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold" },
  stripLabel: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontFamily: "Poppins_400Regular", textAlign: "center" },
  stripDiv: { width: 1, height: 26 },
  waveCut: { position: "absolute", bottom: 0, left: 0, right: 0, height: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  chipRow: { maxHeight: 52, borderBottomWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  scroll: { paddingHorizontal: 16, paddingTop: 14, gap: 0 },
  emptyBox: { borderRadius: 16, borderWidth: 1, padding: 36, alignItems: "center", gap: 10, marginTop: 20 },
  emptyTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold" },
  studentCard: { borderRadius: 16, borderWidth: 1, marginBottom: 10, overflow: "hidden", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  riskStripe: { height: 3 },
  studentTop: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14 },
  avatarRing: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  studentInfo: { flex: 1, gap: 4 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  studentName: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  classBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  classBadgeText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  riskBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 7 },
  riskText: { fontSize: 9, fontFamily: "Poppins_700Bold" },
  roll: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressBg: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 3 },
  progressText: { fontSize: 10, fontFamily: "Poppins_700Bold", width: 30 },
  expandIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  detailBlock: { borderTopWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 14, gap: 12 },
  detailStats: { flexDirection: "row", alignItems: "center" },
  detailItem: { flex: 1, alignItems: "center", gap: 4 },
  detailIcon: { width: 30, height: 30, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  detailVal: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  detailLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  detailDiv: { width: 1, height: 32 },
  messageBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 10, borderRadius: 12, borderWidth: 1 },
  messageBtnText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
});
