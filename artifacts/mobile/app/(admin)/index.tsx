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

const ADMIN_COLOR = "#9B7BC4";

const ALERTS = [
  { id: "a1", msg: "Vikram Singh attendance dropped below 75%", time: "1 hr ago", icon: "warning", color: "#D69E2E" },
  { id: "a2", msg: "New course 'Mathematics XII' pending approval", time: "2 hr ago", icon: "information-circle", color: "#5B9BD5" },
  { id: "a3", msg: "Prof. Sunita Rao joined as new teacher", time: "Yesterday", icon: "person-add", color: "#48BB78" },
  { id: "a4", msg: "3 students have unpaid fees this month", time: "Yesterday", icon: "card", color: "#E53E3E" },
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

const QUICK_ACTIONS = [
  { label: "Teachers", icon: "person-circle", color: "#48BB78", route: "/(admin)/teachers", count: "12" },
  { label: "Students", icon: "people", color: "#5B9BD5", route: "/(admin)/students", count: "156" },
  { label: "Courses", icon: "library", color: "#9B7BC4", route: "/(admin)/settings", count: "8" },
  { label: "Fees", icon: "card", color: "#D69E2E", route: "/(admin)/fees", count: "3 due" },
  { label: "Reports", icon: "bar-chart", color: "#BF7B5B", route: "/(admin)/settings", count: "" },
  { label: "Settings", icon: "settings", color: "#7B8EBF", route: "/(admin)/settings", count: "" },
];

export default function AdminDashboard() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => { const t = setTimeout(() => setLoading(false), 700); return () => clearTimeout(t); }, []);

  const maxCompletion = Math.max(...SUBJECT_STATS.map((s) => s.students));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: ADMIN_COLOR }]}>
        <View style={styles.headerDeco1} />
        <View style={styles.headerDeco2} />

        <View style={styles.headerTop}>
          <View style={{ flex: 1 }}>
            <View style={[styles.rolePill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <View style={styles.roleDot} />
              <Text style={styles.roleText}>ADMIN PANEL</Text>
            </View>
            <Text style={styles.headerName}>{user?.name ?? "Administrator"}</Text>
            <Text style={styles.headerSub}>VidyaPath Management System</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={[styles.notifBtn, { backgroundColor: "rgba(255,255,255,0.2)" }]} activeOpacity={0.8}>
              <Ionicons name="notifications" size={17} color="#FFFFFF" />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{user?.avatar ?? "A"}</Text>
            </View>
          </View>
        </View>

        {/* KPI strip */}
        <View style={styles.kpiStrip}>
          {[
            { val: "156", label: "Students", icon: "people", color: "#FFFFFF" },
            { val: "12", label: "Teachers", icon: "person-circle", color: "#FFFFFF" },
            { val: "8", label: "Courses", icon: "book", color: "#FFFFFF" },
            { val: "23", label: "Online Now", icon: "radio", color: "#FBBF24" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && <View style={styles.kpiDiv} />}
              <View style={styles.kpiItem}>
                <Ionicons name={s.icon as any} size={12} color={s.color === "#FFFFFF" ? "rgba(255,255,255,0.8)" : s.color} />
                <Text style={[styles.kpiVal, { color: s.color }]}>{s.val}</Text>
                <Text style={styles.kpiLabel}>{s.label}</Text>
              </View>
            </React.Fragment>
          ))}
        </View>

        <View style={styles.waveWrap}>
          <View style={[styles.wave, { backgroundColor: colors.background }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>

        {/* Quick Actions */}
        <View style={styles.qaGrid}>
          {QUICK_ACTIONS.map((q) => (
            <TouchableOpacity
              key={q.label}
              onPress={() => { Haptics.selectionAsync(); router.push(q.route as any); }}
              style={[styles.qaCard, { backgroundColor: colors.card, borderColor: colors.border, width: (width - 48) / 3 - 2 }]}
              activeOpacity={0.82}
            >
              <View style={[styles.qaIconWrap, { backgroundColor: q.color + "15" }]}>
                <Ionicons name={q.icon as any} size={22} color={q.color} />
              </View>
              <Text style={[styles.qaLabel, { color: colors.foreground }]}>{q.label}</Text>
              {q.count ? (
                <View style={[styles.qaCount, { backgroundColor: q.color + "18" }]}>
                  <Text style={[styles.qaCountText, { color: q.color }]}>{q.count}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>

        {/* Alerts */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Alerts</Text>
            <View style={[styles.alertCountBadge, { backgroundColor: "#E53E3E" }]}>
              <Text style={styles.alertCountText}>{ALERTS.length}</Text>
            </View>
          </View>
          <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {ALERTS.map((a, i) => (
              <TouchableOpacity
                key={a.id}
                style={[styles.alertRow, { borderBottomColor: i === ALERTS.length - 1 ? "transparent" : colors.border, borderLeftColor: a.color, borderLeftWidth: 3 }]}
                activeOpacity={0.75}
                onPress={() => Haptics.selectionAsync()}
              >
                <View style={[styles.alertIcon, { backgroundColor: a.color + "18" }]}>
                  <Ionicons name={a.icon as any} size={14} color={a.color} />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text style={[styles.alertMsg, { color: colors.foreground }]}>{a.msg}</Text>
                  <Text style={[styles.alertTime, { color: colors.mutedForeground }]}>{a.time}</Text>
                </View>
                <Ionicons name="chevron-forward" size={14} color={colors.border} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Subject Overview */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Subject Overview</Text>
            <View style={[styles.sectionBadge, { backgroundColor: ADMIN_COLOR + "18" }]}>
              <Text style={[styles.sectionBadgeText, { color: ADMIN_COLOR }]}>{SUBJECT_STATS.length} subjects</Text>
            </View>
          </View>
          <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {SUBJECT_STATS.map((s, i) => (
              <View key={s.subject} style={[styles.subjectRow, { borderBottomColor: i === SUBJECT_STATS.length - 1 ? "transparent" : colors.border }]}>
                <View style={[styles.subjectDot, { backgroundColor: s.color }]} />
                <View style={{ flex: 1, gap: 5 }}>
                  <View style={styles.subjectHead}>
                    <Text style={[styles.subjectName, { color: colors.foreground }]}>{s.subject}</Text>
                    <Text style={[styles.subjectPct, { color: s.color }]}>{s.completion}%</Text>
                  </View>
                  <View style={[styles.subjectBg, { backgroundColor: colors.muted }]}>
                    <View style={[styles.subjectFill, { backgroundColor: s.color, width: `${s.completion}%` as any }]} />
                  </View>
                  <Text style={[styles.subjectStudents, { color: colors.mutedForeground }]}>{s.students} students enrolled</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
          <View style={[styles.listCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {RECENT_ACTIVITY.map((a, i) => (
              <View key={a.id} style={[styles.activityRow, { borderBottomColor: i === RECENT_ACTIVITY.length - 1 ? "transparent" : colors.border }]}>
                <View style={[styles.activityIcon, { backgroundColor: a.color + "18" }]}>
                  <Ionicons name={a.icon as any} size={14} color={a.color} />
                </View>
                <View style={{ flex: 1, gap: 1 }}>
                  <Text style={[styles.activityUser, { color: colors.foreground }]}>{a.user}</Text>
                  <Text style={[styles.activityAction, { color: colors.mutedForeground }]}>{a.action}</Text>
                  <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>{a.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Sign Out */}
        <TouchableOpacity onPress={async () => { await logout(); }} style={[styles.logoutBtn, { backgroundColor: "#E53E3E10", borderColor: "#E53E3E20" }]} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#E53E3E" />
          <Text style={[styles.logoutText, { color: "#E53E3E" }]}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 52, position: "relative", overflow: "hidden" },
  headerDeco1: { position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.07)" },
  headerDeco2: { position: "absolute", bottom: 10, left: -40, width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(255,255,255,0.06)" },
  headerTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 18 },
  rolePill: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, marginBottom: 5 },
  roleDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#FBBF24" },
  roleText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 1 },
  headerName: { color: "#FFFFFF", fontSize: 21, fontFamily: "Poppins_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  notifBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", position: "relative" },
  notifDot: { position: "absolute", top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: "#F59E0B", borderWidth: 1.5, borderColor: ADMIN_COLOR },
  headerAvatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "rgba(255,255,255,0.25)", borderWidth: 2, borderColor: "rgba(255,255,255,0.4)", justifyContent: "center", alignItems: "center" },
  headerAvatarText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  kpiStrip: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 16, paddingVertical: 11, paddingHorizontal: 8 },
  kpiItem: { flex: 1, alignItems: "center", gap: 2 },
  kpiDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.2)", marginVertical: 4 },
  kpiVal: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  kpiLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_400Regular" },
  waveWrap: { position: "absolute", bottom: -1, left: 0, right: 0, height: 38, overflow: "hidden" },
  wave: { position: "absolute", bottom: 0, left: -20, right: -20, height: 60, borderRadius: 30 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 0 },
  qaGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  qaCard: { alignItems: "center", borderRadius: 18, borderWidth: 1, paddingVertical: 16, paddingHorizontal: 8, gap: 7 },
  qaIconWrap: { width: 48, height: 48, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  qaLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  qaCount: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  qaCountText: { fontSize: 9, fontFamily: "Poppins_700Bold" },
  section: { marginBottom: 18 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 },
  sectionTitle: { flex: 1, fontSize: 16, fontFamily: "Poppins_700Bold" },
  sectionBadge: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 10 },
  sectionBadgeText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  alertCountBadge: { width: 22, height: 22, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  alertCountText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold" },
  listCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  alertRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderLeftWidth: 3 },
  alertIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  alertMsg: { fontSize: 12, fontFamily: "Poppins_500Medium", lineHeight: 16 },
  alertTime: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  subjectRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  subjectDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  subjectHead: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  subjectName: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  subjectPct: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  subjectBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  subjectFill: { height: 6, borderRadius: 3 },
  subjectStudents: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  activityRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1 },
  activityIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0, marginTop: 2 },
  activityUser: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  activityAction: { fontSize: 11, fontFamily: "Poppins_400Regular", lineHeight: 15 },
  activityTime: { fontSize: 10, fontFamily: "Poppins_400Regular", marginTop: 1 },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 14, marginBottom: 6 },
  logoutText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
});
