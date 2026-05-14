import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

const COURSES = [
  {
    id: "c1", title: "Accountancy – Class 12", subject: "Accountancy", color: "#5B9BD5",
    students: 42, completionRate: 68, totalLectures: 24, doneLectures: 16,
    nextClass: "Today, 10:00 AM", status: "active", rating: 4.9,
    chapters: ["Partnership Accounts", "Company Accounts", "Financial Statements", "Cash Flow"],
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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Classes</Text>
        <View style={[styles.badge, { backgroundColor: "#48BB7818" }]}>
          <Text style={[styles.badgeText, { color: "#48BB78" }]}>{COURSES.length} Active</Text>
        </View>
      </View>

      {/* Summary */}
      <View style={[styles.summaryRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { val: COURSES.reduce((a, c) => a + c.students, 0), label: "Total Students", color: "#48BB78" },
          { val: COURSES.reduce((a, c) => a + c.doneLectures, 0), label: "Lectures Done", color: colors.primary },
          { val: Math.round(COURSES.reduce((a, c) => a + c.completionRate, 0) / COURSES.length) + "%", label: "Avg Completion", color: colors.warning },
          { val: (COURSES.reduce((a, c) => a + c.rating, 0) / COURSES.length).toFixed(1), label: "Avg Rating", color: "#9B7BC4" },
        ].map((s) => (
          <View key={s.label} style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.val}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {COURSES.map((c) => (
          <View key={c.id} style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: c.color, borderLeftWidth: 4 }]}>
            {/* Header Row */}
            <TouchableOpacity onPress={() => setExpanded(expanded === c.id ? null : c.id)} activeOpacity={0.85}>
              <View style={styles.courseHeader}>
                <View style={[styles.subjectIcon, { backgroundColor: c.color + "18" }]}>
                  <Ionicons name="book" size={18} color={c.color} />
                </View>
                <View style={styles.courseInfo}>
                  <Text style={[styles.courseTitle, { color: colors.foreground }]}>{c.title}</Text>
                  <Text style={[styles.courseSubject, { color: c.color }]}>{c.subject}</Text>
                </View>
                <Ionicons name={expanded === c.id ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
              </View>
            </TouchableOpacity>

            {/* Stats */}
            <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
              <View style={styles.stat}><Text style={[styles.statVal, { color: colors.foreground }]}>{c.students}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Students</Text></View>
              <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
              <View style={styles.stat}><Text style={[styles.statVal, { color: colors.foreground }]}>{c.doneLectures}/{c.totalLectures}</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Lectures</Text></View>
              <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
              <View style={styles.stat}><Text style={[styles.statVal, { color: colors.foreground }]}>{c.completionRate}%</Text><Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Completion</Text></View>
              <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
              <View style={styles.stat}><Ionicons name="star" size={12} color={colors.warning} /><Text style={[styles.statVal, { color: colors.foreground }]}>{c.rating}</Text></View>
            </View>

            {/* Progress bar */}
            <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
              <View style={[styles.progressFill, { backgroundColor: c.color, width: `${c.completionRate}%` as any }]} />
            </View>

            {/* Next class */}
            <View style={styles.nextRow}>
              <Ionicons name="calendar-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.nextText, { color: colors.mutedForeground }]}>Next: {c.nextClass}</Text>
              <TouchableOpacity style={[styles.scheduleBtn, { backgroundColor: "#48BB7818", borderColor: "#48BB7830" }]} activeOpacity={0.8}>
                <Text style={[styles.scheduleBtnText, { color: "#48BB78" }]}>+ Schedule</Text>
              </TouchableOpacity>
            </View>

            {/* Expanded chapter list */}
            {expanded === c.id && (
              <View style={[styles.chaptersWrap, { borderTopColor: colors.border }]}>
                <Text style={[styles.chaptersTitle, { color: colors.mutedForeground }]}>CHAPTERS</Text>
                {c.chapters.map((ch, i) => (
                  <View key={i} style={[styles.chapterRow, { borderBottomColor: i === c.chapters.length - 1 ? "transparent" : colors.border }]}>
                    <View style={[styles.chapterNum, { backgroundColor: c.color + "18" }]}>
                      <Text style={[styles.chapterNumText, { color: c.color }]}>{i + 1}</Text>
                    </View>
                    <Text style={[styles.chapterName, { color: colors.foreground }]}>{ch}</Text>
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
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 20, fontFamily: "Poppins_700Bold" },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  summaryRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryVal: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  summaryLabel: { fontSize: 9, fontFamily: "Poppins_400Regular", textAlign: "center" },
  scroll: { padding: 16, gap: 0 },
  courseCard: { borderRadius: 14, borderWidth: 1, marginBottom: 14, overflow: "hidden" },
  courseHeader: { flexDirection: "row", alignItems: "center", gap: 10, padding: 14 },
  subjectIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  courseInfo: { flex: 1 },
  courseTitle: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  courseSubject: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  statsRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingVertical: 8 },
  stat: { flex: 1, alignItems: "center", gap: 1 },
  statVal: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  statDiv: { width: 1, height: 24 },
  progressBg: { height: 5, marginHorizontal: 14, marginVertical: 8, borderRadius: 3 },
  progressFill: { height: 5, borderRadius: 3 },
  nextRow: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingBottom: 12 },
  nextText: { flex: 1, fontSize: 11, fontFamily: "Poppins_400Regular" },
  scheduleBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, borderWidth: 1 },
  scheduleBtnText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  chaptersWrap: { borderTopWidth: 1, padding: 14, gap: 0 },
  chaptersTitle: { fontSize: 9, fontFamily: "Poppins_600SemiBold", letterSpacing: 0.8, marginBottom: 8 },
  chapterRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1 },
  chapterNum: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  chapterNumText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  chapterName: { flex: 1, fontSize: 12, fontFamily: "Poppins_500Medium" },
  addLectureBtn: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
});
