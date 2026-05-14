import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const COURSES = [
  {
    id: "c1", title: "Accountancy – Class 12", subject: "Accountancy", color: "#5B9BD5",
    students: 42, completionRate: 68, totalLectures: 24, doneLectures: 16,
    nextClass: "Today, 10:00 AM", status: "active", rating: 4.9,
    chapters: ["Partnership Accounts", "Company Accounts", "Financial Statements", "Cash Flow Statement"],
  },
  {
    id: "c2", title: "Economics – Class 12", subject: "Economics", color: "#5BAD9B",
    students: 38, completionRate: 55, totalLectures: 20, doneLectures: 11,
    nextClass: "Today, 12:30 PM", status: "active", rating: 4.8,
    chapters: ["National Income", "Macro Economics", "Money & Banking", "Government Budget"],
  },
  {
    id: "c3", title: "Accountancy – Class 11", subject: "Accountancy", color: "#7B8EBF",
    students: 35, completionRate: 82, totalLectures: 18, doneLectures: 15,
    nextClass: "Tomorrow, 11:00 AM", status: "active", rating: 4.7,
    chapters: ["Introduction", "Journal Entries", "Ledger", "Trial Balance"],
  },
];

export default function TeacherClasses() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [expanded, setExpanded] = useState<string | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const totalStudents = COURSES.reduce((a, c) => a + c.students, 0);
  const totalDone = COURSES.reduce((a, c) => a + c.doneLectures, 0);
  const avgCompletion = Math.round(COURSES.reduce((a, c) => a + c.completionRate, 0) / COURSES.length);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── COLORED HEADER BANNER ── */}
      <View style={[styles.headerBanner, { paddingTop: topPad + 8, backgroundColor: "#48BB78", overflow: "hidden" }]}>
        <View style={[styles.dec1, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
        <View style={[styles.dec2, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        <View style={styles.bannerTop}>
          <View>
            <Text style={styles.bannerLabel}>TEACHER PORTAL</Text>
            <Text style={styles.bannerTitle}>My Courses</Text>
          </View>
          <View style={[styles.bannerBadge, { backgroundColor: "rgba(255,255,255,0.22)" }]}>
            <Ionicons name="book" size={12} color="#FFFFFF" />
            <Text style={styles.bannerBadgeText}>{COURSES.length} Active</Text>
          </View>
        </View>
        {/* Summary strip */}
        <View style={[styles.bannerStrip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          {[
            { val: totalStudents, label: "Students", icon: "people" },
            { val: totalDone, label: "Done", icon: "checkmark-circle" },
            { val: `${avgCompletion}%`, label: "Avg Done", icon: "trending-up" },
            { val: (COURSES.reduce((a, c) => a + c.rating, 0) / COURSES.length).toFixed(1), label: "Avg Rating", icon: "star" },
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

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {COURSES.map((c) => (
          <View key={c.id} style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: "#000" }]}>
            {/* Left accent stripe */}
            <View style={[styles.accentStripe, { backgroundColor: c.color }]} />

            {/* Header */}
            <TouchableOpacity
              onPress={() => { setExpanded(expanded === c.id ? null : c.id); Haptics.selectionAsync(); }}
              activeOpacity={0.85}
            >
              <View style={styles.courseHeader}>
                <View style={[styles.courseIcon, { backgroundColor: c.color + "18" }]}>
                  <Ionicons name="book" size={20} color={c.color} />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={[styles.courseTitle, { color: colors.foreground }]}>{c.title}</Text>
                  <View style={styles.courseMeta}>
                    <Text style={[styles.courseSubject, { color: c.color }]}>{c.subject}</Text>
                    <View style={[styles.ratingPill, { backgroundColor: "#D69E2E18" }]}>
                      <Ionicons name="star" size={10} color="#D69E2E" />
                      <Text style={[styles.ratingText, { color: "#D69E2E" }]}>{c.rating}</Text>
                    </View>
                  </View>
                </View>
                <View style={[styles.chevronWrap, { backgroundColor: colors.muted }]}>
                  <Ionicons name={expanded === c.id ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
                </View>
              </View>
            </TouchableOpacity>

            {/* Stats row */}
            <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
              {[
                { val: c.students, label: "Students", color: c.color, icon: "people" },
                { val: `${c.doneLectures}/${c.totalLectures}`, label: "Lectures", color: "#9B7BC4", icon: "play-circle" },
                { val: `${c.completionRate}%`, label: "Completion", color: "#48BB78", icon: "trending-up" },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  <View style={styles.statItem}>
                    <Ionicons name={s.icon as any} size={13} color={s.color} />
                    <Text style={[styles.statVal, { color: colors.foreground }]}>{s.val}</Text>
                    <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                  </View>
                  {i < 2 && <View style={[styles.statDiv, { backgroundColor: colors.border }]} />}
                </React.Fragment>
              ))}
            </View>

            {/* Progress bar */}
            <View style={styles.progressWrap}>
              <View style={styles.progressHeader}>
                <Text style={[styles.progressLabel, { color: colors.mutedForeground }]}>Course completion</Text>
                <Text style={[styles.progressPct, { color: c.color }]}>{c.completionRate}%</Text>
              </View>
              <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                <View style={[styles.progressFill, { backgroundColor: c.color, width: `${c.completionRate}%` as any }]} />
              </View>
            </View>

            {/* Next class + schedule */}
            <View style={styles.nextRow}>
              <View style={[styles.nextIcon, { backgroundColor: "#5B9BD518" }]}>
                <Ionicons name="calendar" size={12} color="#5B9BD5" />
              </View>
              <Text style={[styles.nextText, { color: colors.mutedForeground }]}>Next: {c.nextClass}</Text>
              <TouchableOpacity style={[styles.scheduleBtn, { backgroundColor: "#48BB7818", borderColor: "#48BB7830" }]} activeOpacity={0.8}>
                <Ionicons name="add" size={12} color="#48BB78" />
                <Text style={[styles.scheduleBtnText, { color: "#48BB78" }]}>Schedule</Text>
              </TouchableOpacity>
            </View>

            {/* Expanded chapters */}
            {expanded === c.id && (
              <View style={[styles.chaptersWrap, { borderTopColor: colors.border }]}>
                <View style={styles.chaptersHeader}>
                  <View style={[styles.chaptersIconWrap, { backgroundColor: c.color + "18" }]}>
                    <Ionicons name="list" size={12} color={c.color} />
                  </View>
                  <Text style={[styles.chaptersTitle, { color: colors.mutedForeground }]}>CHAPTERS</Text>
                </View>
                {c.chapters.map((ch, i) => (
                  <View key={i} style={[styles.chapterRow, { borderBottomColor: i === c.chapters.length - 1 ? "transparent" : colors.border }]}>
                    <View style={[styles.chapterNum, { backgroundColor: c.color + "18" }]}>
                      <Text style={[styles.chapterNumText, { color: c.color }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.chapterName, { color: colors.foreground }]}>{ch}</Text>
                    <View style={[styles.chapterStatus, { backgroundColor: i < c.doneLectures - 10 ? "#48BB7818" : colors.muted }]}>
                      <Ionicons name={i < (c.doneLectures - 10) ? "checkmark" : "time-outline"} size={12} color={i < (c.doneLectures - 10) ? "#48BB78" : colors.mutedForeground} />
                    </View>
                    <TouchableOpacity style={[styles.addLectureBtn, { backgroundColor: c.color + "18" }]} activeOpacity={0.8}>
                      <Ionicons name="add" size={14} color={c.color} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBanner: { paddingHorizontal: 16, paddingBottom: 30, position: "relative" },
  dec1: { position: "absolute", width: 200, height: 200, borderRadius: 100, top: -60, right: -40 },
  dec2: { position: "absolute", width: 120, height: 120, borderRadius: 60, bottom: -20, left: -20 },
  bannerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14, zIndex: 1 },
  bannerLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 1.2, marginBottom: 2 },
  bannerTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold" },
  bannerBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 20 },
  bannerBadgeText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  bannerStrip: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 12, zIndex: 1 },
  stripStat: { flex: 1, alignItems: "center", gap: 2 },
  stripVal: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  stripLabel: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontFamily: "Poppins_400Regular" },
  stripDiv: { width: 1, height: 28 },
  waveCut: { position: "absolute", bottom: 0, left: 0, right: 0, height: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 0 },
  courseCard: { borderRadius: 18, borderWidth: 1, marginBottom: 16, overflow: "hidden", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  accentStripe: { height: 4 },
  courseHeader: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14 },
  courseIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  courseInfo: { flex: 1, gap: 4 },
  courseTitle: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  courseMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  courseSubject: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  ratingPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  ratingText: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  chevronWrap: { width: 30, height: 30, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  statsRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingVertical: 10, paddingHorizontal: 8 },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  statDiv: { width: 1, height: 28 },
  progressWrap: { paddingHorizontal: 14, paddingBottom: 10, gap: 6 },
  progressHeader: { flexDirection: "row", justifyContent: "space-between" },
  progressLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  progressPct: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  progressBg: { height: 7, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 7, borderRadius: 4 },
  nextRow: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 14, paddingBottom: 14 },
  nextIcon: { width: 22, height: 22, borderRadius: 6, justifyContent: "center", alignItems: "center" },
  nextText: { flex: 1, fontSize: 11, fontFamily: "Poppins_400Regular" },
  scheduleBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  scheduleBtnText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  chaptersWrap: { borderTopWidth: 1, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 6 },
  chaptersHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 8 },
  chaptersIconWrap: { width: 20, height: 20, borderRadius: 6, justifyContent: "center", alignItems: "center" },
  chaptersTitle: { fontSize: 10, fontFamily: "Poppins_600SemiBold", letterSpacing: 0.8 },
  chapterRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1 },
  chapterNum: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  chapterNumText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  chapterName: { flex: 1, fontSize: 12, fontFamily: "Poppins_500Medium" },
  chapterStatus: { width: 24, height: 24, borderRadius: 7, justifyContent: "center", alignItems: "center" },
  addLectureBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
});
