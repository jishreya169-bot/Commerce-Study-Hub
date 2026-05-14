import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";
import { HeaderDecoBackground, DotGrid, WaveDivider } from "@/components/svg/DecorativeShapes";
import { MiniBarChart, MiniDonutChart } from "@/components/svg/MiniChart";
import { SubjectIcon } from "@/components/svg/SubjectIcon";

const ALERTS = [
  { id: "a1", type: "warning", msg: "Vikram Singh attendance dropped below 75%", time: "1 hr ago", icon: "warning", color: "#D69E2E" },
  { id: "a2", type: "info", msg: "New course 'Mathematics XII' pending approval", time: "2 hr ago", icon: "information-circle", color: "#5B9BD5" },
  { id: "a3", type: "success", msg: "Prof. Sunita Rao joined as new teacher", time: "Yesterday", icon: "person-add", color: "#48BB78" },
  { id: "a4", type: "error", msg: "3 students have unpaid fees this month", time: "Yesterday", icon: "card", color: "#E53E3E" },
];

const RECENT_ACTIVITY = [
  { id: "r1", user: "Priya Sharma", action: "completed Trial Balance lecture", time: "5 min ago", color: "#5B9BD5", icon: "school" },
  { id: "r2", user: "Prof. Amit Sharma", action: "posted answer in Doubt Forum", time: "20 min ago", color: "#48BB78", icon: "person-circle" },
  { id: "r3", user: "Rahul Mehta", action: "scored 90% in Economics Test 3", time: "30 min ago", color: "#5BAD9B", icon: "trophy" },
  { id: "r4", user: "Ananya Kapoor", action: "enrolled in Class 12 Accountancy", time: "1 hr ago", color: "#9B7BC4", icon: "book" },
  { id: "r5", user: "System", action: "Weekly backup completed successfully", time: "2 hr ago", color: "#48BB78", icon: "cloud-done" },
];

const SUBJECT_STATS = [
  { subject: "Accountancy", students: 77, completion: 72, color: "#5B9BD5" },
  { subject: "Economics", students: 38, completion: 55, color: "#5BAD9B" },
  { subject: "Business Studies", students: 45, completion: 68, color: "#7B8EBF" },
  { subject: "Mathematics", students: 30, completion: 61, color: "#9B7BC4" },
  { subject: "English", students: 52, completion: 80, color: "#BF7B5B" },
];

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => { const t = setTimeout(() => setLoading(false), 800); return () => clearTimeout(t); }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Admin Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, paddingBottom: 24, overflow: "hidden" }]}>
        <HeaderDecoBackground color="#9B7BC4" width={width} height={topPad + 130} />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerRole}>ADMIN PANEL</Text>
            <Text style={styles.headerName}>{user?.name ?? "Admin"}</Text>
            <Text style={styles.headerSub}>VidyaPath Management</Text>
          </View>
          <View style={styles.headerRight}>
            <View style={[styles.alertBadge, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <Ionicons name="notifications" size={16} color="#FFFFFF" />
              <Text style={styles.alertBadgeText}>4</Text>
            </View>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatar ?? "A"}</Text>
            </View>
          </View>
        </View>
        {/* System Stats */}
        <View style={styles.sysStats}>
          {[
            { val: "156", label: "Students", icon: "people", color: "#FFFFFF" },
            { val: "12", label: "Teachers", icon: "person-circle", color: "#FFFFFF" },
            { val: "38", label: "Courses", icon: "book", color: "#FFFFFF" },
            { val: "23", label: "Active Now", icon: "radio", color: "#FBBF24" },
          ].map((s) => (
            <View key={s.label} style={styles.sysStat}>
              <Ionicons name={s.icon as any} size={13} color={s.color === "#FFFFFF" ? "rgba(255,255,255,0.8)" : s.color} />
              <Text style={[styles.sysStatVal, { color: s.color }]}>{s.val}</Text>
              <Text style={styles.sysStatLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        <WaveDivider color={colors.background} height={28} style={{ position: "absolute", bottom: 0, left: 0 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {/* Quick Actions */}
        <View style={styles.quickGrid}>
          {[
            { label: "Teachers", icon: "person-circle", color: "#48BB78", route: "/(admin)/teachers" },
            { label: "Students", icon: "people", color: "#5B9BD5", route: "/(admin)/students" },
            { label: "Courses", icon: "library", color: "#9B7BC4", route: "/(admin)/courses" },
            { label: "Settings", icon: "settings", color: "#7B8EBF", route: "/(admin)/settings" },
            { label: "Reports", icon: "bar-chart", color: "#D69E2E", route: "/(admin)/reports" },
            { label: "Fees", icon: "card", color: "#BF7B5B", route: "/(admin)/fees" },
          ].map((q) => (
            <TouchableOpacity
              key={q.label}
              onPress={() => { Haptics.selectionAsync(); router.push(q.route as any); }}
              style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.82}
            >
              <View style={[styles.quickIcon, { backgroundColor: q.color + "18" }]}>
                <Ionicons name={q.icon as any} size={22} color={q.color} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Alerts</Text>
            <View style={[styles.alertCount, { backgroundColor: "#E53E3E" }]}>
              <Text style={styles.alertCountText}>{ALERTS.length}</Text>
            </View>
          </View>
          <View style={[styles.alertsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {ALERTS.map((a, i) => (
              <View key={a.id} style={[styles.alertRow, { borderBottomColor: i === ALERTS.length - 1 ? "transparent" : colors.border }]}>
                <View style={[styles.alertIcon, { backgroundColor: a.color + "18" }]}>
                  <Ionicons name={a.icon as any} size={14} color={a.color} />
                </View>
                <View style={styles.alertInfo}>
                  <Text style={[styles.alertMsg, { color: colors.foreground }]}>{a.msg}</Text>
                  <Text style={[styles.alertTime, { color: colors.mutedForeground }]}>{a.time}</Text>
                </View>
                <TouchableOpacity>
                  <Ionicons name="chevron-forward" size={14} color={colors.border} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Subject Performance */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Subject Overview</Text>
            <MiniDonutChart
              segments={SUBJECT_STATS.map((s) => ({ value: s.completion, color: s.color }))}
              size={44}
              strokeWidth={8}
            />
          </View>
          <View style={[styles.subjectsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {SUBJECT_STATS.map((s, i) => (
              <View key={s.subject} style={[styles.subjectRow, { borderBottomColor: i === SUBJECT_STATS.length - 1 ? "transparent" : colors.border }]}>
                <SubjectIcon subject={s.subject} size={30} color={s.color} />
                <View style={styles.subjectInfo}>
                  <Text style={[styles.subjectName, { color: colors.foreground }]}>{s.subject}</Text>
                  <Text style={[styles.subjectStudents, { color: colors.mutedForeground }]}>{s.students} students</Text>
                </View>
                <MiniBarChart
                  data={[{ value: s.completion, color: s.color }, { value: 100 - s.completion, color: colors.muted }]}
                  width={50}
                  height={28}
                />
                <Text style={[styles.subjectPct, { color: s.color }]}>{s.completion}%</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
          <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {RECENT_ACTIVITY.map((a, i) => (
              <View key={a.id} style={[styles.activityRow, { borderBottomColor: i === RECENT_ACTIVITY.length - 1 ? "transparent" : colors.border }]}>
                <View style={[styles.activityIcon, { backgroundColor: a.color + "18" }]}>
                  <Ionicons name={a.icon as any} size={14} color={a.color} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityUser, { color: colors.foreground }]}>{a.user}</Text>
                  <Text style={[styles.activityAction, { color: colors.mutedForeground }]}>{a.action}</Text>
                  <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>{a.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity
          onPress={async () => { await logout(); }}
          style={[styles.logoutBtn, { backgroundColor: "#E53E3E18", borderColor: "#E53E3E30" }]}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={18} color="#E53E3E" />
          <Text style={[styles.logoutText, { color: "#E53E3E" }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, backgroundColor: "#9B7BC4" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerRole: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 1.2 },
  headerName: { color: "#FFFFFF", fontSize: 20, fontFamily: "Poppins_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  alertBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  alertBadgeText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  sysStats: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12 },
  sysStat: { alignItems: "center", gap: 2 },
  sysStatVal: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  sysStatLabel: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontFamily: "Poppins_400Regular" },
  scroll: { padding: 16, gap: 0 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  quickCard: { width: "30.5%", alignItems: "center", borderRadius: 16, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 8, gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  quickIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  quickLabel: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  section: { marginBottom: 18 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  alertCount: { width: 20, height: 20, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  alertCountText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold" },
  alertsCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1 },
  alertIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  alertInfo: { flex: 1, gap: 2 },
  alertMsg: { fontSize: 12, fontFamily: "Poppins_500Medium", lineHeight: 16 },
  alertTime: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  subjectsCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  subjectRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderBottomWidth: 1 },
  subjectInfo: { flex: 1 },
  subjectName: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  subjectStudents: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  subjectPct: { width: 34, fontSize: 11, fontFamily: "Poppins_700Bold", textAlign: "right" },
  activityCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  activityRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 12, borderBottomWidth: 1 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  activityInfo: { flex: 1, gap: 1 },
  activityUser: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  activityAction: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  activityTime: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 13 },
  logoutText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
});
