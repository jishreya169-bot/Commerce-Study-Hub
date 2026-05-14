import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const MONTHLY_STATS = [
  { month: "Jan", students: 138, revenue: 142000, attendance: 88 },
  { month: "Feb", students: 142, revenue: 148000, attendance: 91 },
  { month: "Mar", students: 148, revenue: 152000, attendance: 87 },
  { month: "Apr", students: 150, revenue: 158000, attendance: 89 },
  { month: "May", students: 154, revenue: 162000, attendance: 92 },
  { month: "Jun", students: 156, revenue: 168000, attendance: 90 },
];

const TOP_COURSES = [
  { id: "c1", title: "Accountancy – Class 12", enrolled: 42, completion: 68, rating: 4.9, color: "#5B9BD5" },
  { id: "c2", title: "English – Class 12", enrolled: 52, completion: 82, rating: 4.6, color: "#BF7B5B" },
  { id: "c3", title: "Business Studies – Class 12", enrolled: 45, completion: 70, rating: 4.7, color: "#7B8EBF" },
  { id: "c4", title: "Economics – Class 12", enrolled: 38, completion: 55, rating: 4.8, color: "#5BAD9B" },
  { id: "c5", title: "Mathematics – Class 12", enrolled: 30, completion: 48, rating: 0, color: "#9B7BC4" },
];

const TOP_STUDENTS = [
  { name: "Ananya Kapoor", class: "XII-B", score: 93, progress: 91, color: "#9B7BC4", avatar: "AK" },
  { name: "Deepika Nair", class: "XII-B", score: 88, progress: 83, color: "#48BB78", avatar: "DN" },
  { name: "Priya Sharma", class: "XII-A", score: 82, progress: 78, color: "#5B9BD5", avatar: "PS" },
  { name: "Rahul Mehta", class: "XII-A", score: 74, progress: 65, color: "#5BAD9B", avatar: "RM" },
  { name: "Sneha Gupta", class: "XII-C", score: 77, progress: 70, color: "#BF7B5B", avatar: "SG" },
];

const REPORT_TYPES = [
  { key: "overview", label: "Overview", icon: "analytics" },
  { key: "students", label: "Students", icon: "people" },
  { key: "courses", label: "Courses", icon: "library" },
];

const MAX_BAR = 168000;

export default function AdminReports() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("overview");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Reports</Text>
        <TouchableOpacity
          onPress={() => Haptics.selectionAsync()}
          style={[styles.exportBtn, { backgroundColor: "#9B7BC4" }]}
          activeOpacity={0.85}
        >
          <Ionicons name="download-outline" size={14} color="#FFFFFF" />
          <Text style={styles.exportBtnText}>Export</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10, gap: 8 }}>
        {REPORT_TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            onPress={() => { setActiveTab(t.key); Haptics.selectionAsync(); }}
            style={[styles.tab, { backgroundColor: activeTab === t.key ? "#9B7BC4" : colors.muted, borderColor: activeTab === t.key ? "#9B7BC4" : colors.border }]}
            activeOpacity={0.8}
          >
            <Ionicons name={t.icon as any} size={13} color={activeTab === t.key ? "#FFFFFF" : colors.mutedForeground} />
            <Text style={[styles.tabText, { color: activeTab === t.key ? "#FFFFFF" : colors.mutedForeground }]}>{t.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>

        {/* KPI Summary */}
        <View style={styles.kpiGrid}>
          {[
            { val: "156", label: "Total Students", icon: "people", color: "#5B9BD5", delta: "+4%" },
            { val: "12", label: "Total Teachers", icon: "person-circle", color: "#48BB78", delta: "+0%" },
            { val: "38", label: "Total Courses", icon: "library", color: "#9B7BC4", delta: "+2" },
            { val: "87%", label: "Avg Attendance", icon: "checkmark-circle", color: "#D69E2E", delta: "+2%" },
          ].map((k) => (
            <View key={k.label} style={[styles.kpiCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.kpiIcon, { backgroundColor: k.color + "18" }]}>
                <Ionicons name={k.icon as any} size={18} color={k.color} />
              </View>
              <Text style={[styles.kpiVal, { color: colors.foreground }]}>{k.val}</Text>
              <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{k.label}</Text>
              <View style={[styles.kpiDelta, { backgroundColor: "#48BB7818" }]}>
                <Ionicons name="trending-up" size={9} color="#48BB78" />
                <Text style={[styles.kpiDeltaText, { color: "#48BB78" }]}>{k.delta}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Monthly Revenue Chart */}
        {(activeTab === "overview") && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Monthly Revenue (₹)</Text>
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.barChart}>
                {MONTHLY_STATS.map((m) => {
                  const barH = Math.round((m.revenue / MAX_BAR) * 100);
                  return (
                    <View key={m.month} style={styles.barCol}>
                      <Text style={[styles.barValLabel, { color: "#9B7BC4" }]}>
                        ₹{(m.revenue / 1000).toFixed(0)}k
                      </Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${barH}%` as any, backgroundColor: "#9B7BC4" }]} />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{m.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Attendance Trend */}
        {(activeTab === "overview" || activeTab === "students") && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Monthly Attendance %</Text>
            <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.barChart}>
                {MONTHLY_STATS.map((m) => {
                  const barH = Math.round((m.attendance / 100) * 100);
                  return (
                    <View key={m.month} style={styles.barCol}>
                      <Text style={[styles.barValLabel, { color: "#48BB78" }]}>{m.attendance}%</Text>
                      <View style={styles.barTrack}>
                        <View style={[styles.barFill, { height: `${barH}%` as any, backgroundColor: "#48BB78" }]} />
                      </View>
                      <Text style={[styles.barLabel, { color: colors.mutedForeground }]}>{m.month}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Top Performing Courses */}
        {(activeTab === "overview" || activeTab === "courses") && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Course Performance</Text>
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {TOP_COURSES.map((c, i) => (
                <View key={c.id} style={[styles.listRow, { borderBottomColor: i === TOP_COURSES.length - 1 ? "transparent" : colors.border }]}>
                  <View style={[styles.rankBadge, { backgroundColor: i < 3 ? "#D69E2E18" : colors.muted }]}>
                    <Text style={[styles.rankText, { color: i < 3 ? "#D69E2E" : colors.mutedForeground }]}>#{i + 1}</Text>
                  </View>
                  <View style={[styles.courseDot, { backgroundColor: c.color }]} />
                  <View style={styles.rowInfo}>
                    <Text style={[styles.rowName, { color: colors.foreground }]} numberOfLines={1}>{c.title}</Text>
                    <View style={styles.rowMeta}>
                      <Text style={[styles.rowMetaText, { color: colors.mutedForeground }]}>{c.enrolled} students</Text>
                      <Text style={[styles.rowMetaText, { color: c.color }]}>{c.completion}% done</Text>
                      {c.rating > 0 && <Text style={[styles.rowMetaText, { color: "#D69E2E" }]}>★ {c.rating}</Text>}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Top Students */}
        {(activeTab === "overview" || activeTab === "students") && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Top Students</Text>
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {TOP_STUDENTS.map((s, i) => (
                <View key={s.name} style={[styles.listRow, { borderBottomColor: i === TOP_STUDENTS.length - 1 ? "transparent" : colors.border }]}>
                  <View style={[styles.rankBadge, { backgroundColor: i < 3 ? "#D69E2E18" : colors.muted }]}>
                    <Text style={[styles.rankText, { color: i < 3 ? "#D69E2E" : colors.mutedForeground }]}>#{i + 1}</Text>
                  </View>
                  <View style={[styles.studentAvatar, { backgroundColor: s.color }]}>
                    <Text style={styles.studentAvatarText}>{s.avatar}</Text>
                  </View>
                  <View style={styles.rowInfo}>
                    <Text style={[styles.rowName, { color: colors.foreground }]}>{s.name}</Text>
                    <View style={styles.rowMeta}>
                      <Text style={[styles.rowMetaText, { color: colors.mutedForeground }]}>{s.class}</Text>
                      <Text style={[styles.rowMetaText, { color: "#48BB78" }]}>Score: {s.score}%</Text>
                      <Text style={[styles.rowMetaText, { color: "#5B9BD5" }]}>Progress: {s.progress}%</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Subject-wise Enrollment */}
        {(activeTab === "overview" || activeTab === "courses") && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Subject Enrollment</Text>
            <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {[
                { subject: "Accountancy", enrolled: 77, pct: 49, color: "#5B9BD5" },
                { subject: "English", enrolled: 52, pct: 33, color: "#BF7B5B" },
                { subject: "Business Studies", enrolled: 45, pct: 29, color: "#7B8EBF" },
                { subject: "Economics", enrolled: 38, pct: 24, color: "#5BAD9B" },
                { subject: "Mathematics", enrolled: 30, pct: 19, color: "#9B7BC4" },
              ].map((s, i) => (
                <View key={s.subject} style={[styles.progressRow, { borderBottomColor: i === 4 ? "transparent" : colors.border }]}>
                  <View style={styles.progressHead}>
                    <Text style={[styles.progressLabel, { color: colors.foreground }]}>{s.subject}</Text>
                    <Text style={[styles.progressCount, { color: s.color }]}>{s.enrolled}</Text>
                  </View>
                  <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                    <View style={[styles.progressFill, { width: `${s.pct}%` as any, backgroundColor: s.color }]} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 20, fontFamily: "Poppins_700Bold" },
  exportBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  exportBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  tabRow: { maxHeight: 58, borderBottomWidth: 1 },
  tab: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  tabText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  scroll: { padding: 16, gap: 0 },
  kpiGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  kpiCard: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 12, gap: 4, alignItems: "flex-start" },
  kpiIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 2 },
  kpiVal: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  kpiLabel: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  kpiDelta: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, marginTop: 2 },
  kpiDeltaText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", marginBottom: 10 },
  chartCard: { borderRadius: 14, borderWidth: 1, padding: 14 },
  barChart: { flexDirection: "row", alignItems: "flex-end", height: 130, gap: 4 },
  barCol: { flex: 1, alignItems: "center", gap: 4, height: "100%" },
  barValLabel: { fontSize: 7, fontFamily: "Poppins_600SemiBold", textAlign: "center" },
  barTrack: { flex: 1, width: "70%", backgroundColor: "transparent", justifyContent: "flex-end", borderRadius: 4, overflow: "hidden" },
  barFill: { width: "100%", borderRadius: 4, minHeight: 4 },
  barLabel: { fontSize: 9, fontFamily: "Poppins_500Medium" },
  listCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  listRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1 },
  rankBadge: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  rankText: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  courseDot: { width: 10, height: 10, borderRadius: 5 },
  studentAvatar: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  studentAvatarText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold" },
  rowInfo: { flex: 1, gap: 3 },
  rowName: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  rowMeta: { flexDirection: "row", gap: 8 },
  rowMetaText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  progressRow: { paddingHorizontal: 14, paddingVertical: 10, gap: 6, borderBottomWidth: 1 },
  progressHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressLabel: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  progressCount: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  progressBg: { height: 6, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 6, borderRadius: 4 },
});
