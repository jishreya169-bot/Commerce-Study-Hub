import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, useWindowDimensions, TextInput
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";
import { turso } from "../../lib/turso";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";

// Notifications will be dynamically loaded via state
// ── COMPONENT ─────────────────────────────────────────────────
const QUICK_ACTIONS = [
  { label: "Students", icon: "people", route: "/(admin)/students", colors: ["#DBEAFE", "#BFDBFE"], iconColor: "#2563EB" },
  { label: "Teachers", icon: "school", route: "/(admin)/teachers", colors: ["#F3E8FF", "#E9D5FF"], iconColor: "#7C3AED" },
  { label: "Classes", icon: "grid", route: "/(admin)/courses", colors: ["#FCE7F3", "#FBCFE8"], iconColor: "#DB2777" },
  { label: "Timetable", icon: "time", route: "/(admin)/timetable", colors: ["#E0F2FE", "#BAE6FD"], iconColor: "#0284C7" },
  { label: "Broadcasts", icon: "megaphone", route: "/(admin)/communication", colors: ["#FDE68A", "#FCD34D"], iconColor: "#D97706" },
  { label: "Library", icon: "library", route: "/(admin)/library", colors: ["#D1FAE5", "#A7F3D0"], iconColor: "#059669" },
  { label: "Attendance", icon: "calendar-outline", route: "/(admin)/attendance", colors: ["#FEF3C7", "#FDE68A"], iconColor: "#D97706" },
  { label: "Reports", icon: "bar-chart", route: "/(admin)/reports", colors: ["#E0E7FF", "#C7D2FE"], iconColor: "#4F46E5" },
];

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [stats, setStats] = useState({ students: 0, teachers: 0, courses: 0 });
  const [defaulters, setDefaulters] = useState<any[]>([]);
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [topStudents, setTopStudents] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  useFocusEffect(
    React.useCallback(() => {
    const fetchStats = async () => {
      try {
        const studentRes = await turso.execute("SELECT COUNT(*) FROM users WHERE role = 'student'");
        const teacherRes = await turso.execute("SELECT COUNT(*) FROM users WHERE role = 'teacher'");
        const courseRes = await turso.execute("SELECT COUNT(*) FROM classes");
        
        setStats({
          students: (studentRes.rows[0][0] as number) || 0,
          teachers: (teacherRes.rows[0][0] as number) || 0,
          courses: (courseRes.rows[0][0] as number) || 0,
        });

        // Fetch recent enrollments
        const recentRes = await turso.execute("SELECT id, name, batch, createdAt FROM users WHERE role = 'student' ORDER BY createdAt DESC LIMIT 3");
        const recents = recentRes.rows.map(r => {
          const d = new Date(r[3] as string);
          let timeLabel = d.toLocaleDateString();
          if (new Date().toDateString() === d.toDateString()) timeLabel = "Today";
          return {
            id: r[0] as string,
            student: r[1] as string,
            course: r[2] as string || "N/A",
            time: timeLabel,
            avatar: (r[1] as string).slice(0, 2).toUpperCase(),
            color: "#0EA5E9"
          };
        });
        setRecentStudents(recents);

        // Fetch fee defaulters
        const feeRes = await turso.execute(`
          SELECT f.id, u.name, u.batch, f.totalAmount, f.paidAmount, f.nextDueDate 
          FROM fees f 
          JOIN users u ON f.studentId = u.id 
          WHERE f.status != 'completed'
        `);
        
        const now = new Date().getTime();
        const defs: any[] = [];
        
        feeRes.rows.forEach(r => {
          const dueStr = r[5] as string;
          const due = new Date(dueStr).getTime();
          const amtDue = (r[3] as number) - (r[4] as number);
          
          if (now > due && amtDue > 0) {
            const diffDays = Math.ceil(Math.abs(now - due) / (1000 * 60 * 60 * 24));
            defs.push({
              id: r[0] as string,
              student: r[1] as string,
              course: r[2] as string || "N/A",
              amount: "₹" + amtDue,
              due: "Overdue by " + diffDays + " days",
              avatar: (r[1] as string).slice(0, 2).toUpperCase(),
              color: "#EF4444"
            });
          }
        });
        
        setDefaulters(defs.slice(0, 3)); // Show top 3
        
        const newAlerts = [];
        if (defs.length > 0) {
          newAlerts.push({
            id: "alert1",
            title: "Pending Fee Reminders",
            desc: `${defs.length} student(s) have overdue fees.`,
            icon: "warning",
            color: "#EF4444"
          });
        }
        try {
          const doubtRes = await turso.execute("SELECT COUNT(*) FROM doubts WHERE status != 'resolved'");
          const pendingDoubts = doubtRes.rows[0][0] as number;
          if (pendingDoubts > 0) {
            newAlerts.push({
              id: "alert2",
              title: "Unresolved Doubts",
              desc: `${pendingDoubts} doubt(s) require attention.`,
              icon: "help-circle",
              color: "#F59E0B"
            });
          }
        } catch(e) {}
        
        if (newAlerts.length === 0) {
          newAlerts.push({
            id: "alert-ok",
            title: "All Good!",
            desc: "No important alerts at the moment.",
            icon: "checkmark-circle",
            color: "#10B981"
          });
        }
        setAlerts(newAlerts);
        
        // Fetch top students
        const topRes = await turso.execute(`
          SELECT u.id, u.name, SUM(r.marksObtained) as obtained, SUM(e.totalMarks) as total
          FROM users u
          JOIN results r ON u.id = r.studentId
          JOIN exams e ON r.examId = e.id
          GROUP BY u.id
          ORDER BY (SUM(r.marksObtained) * 100.0 / SUM(e.totalMarks)) DESC
          LIMIT 4
        `);
        
        const topColors = ["#EC4899", "#3B82F6", "#10B981", "#8B5CF6"];
        const tops = topRes.rows.map((r, i) => {
          const obt = r[2] as number;
          const tot = r[3] as number;
          const percentage = tot > 0 ? Math.round((obt / tot) * 100) : 0;
          return {
            id: r[0] as string,
            name: r[1] as string,
            score: percentage + "%",
            avatar: (r[1] as string).slice(0, 2).toUpperCase(),
            color: topColors[i % topColors.length]
          };
        });
        setTopStudents(tops);

      } catch (e) {
        console.error("Stats Error:", e);
      }
    };
    fetchStats();
  }, [])
  );

  return (
    <View style={styles.container}>
      
      {/* ── COLORFUL HEADER ── */}
      <LinearGradient 
        colors={["#0EA5E9", "#2563EB"]} 
        style={[styles.header, { paddingTop: topPad + 10 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome Back 👋</Text>
            <Text style={styles.adminName}>{user?.name ?? "Administrator"}</Text>
          </View>
          
          {/* Header Right Actions */}
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.push("/(admin)/communication"); }} activeOpacity={0.7}>
              <BlurView intensity={30} tint="light" style={styles.activityBtn}>
                <Ionicons name="notifications" size={22} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(admin)/profile")} style={styles.avatarWrap}>
              {user?.avatar === 'boy' ? (
                <Image source={{ uri: "https://avatar.iran.liara.run/public/boy" }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : user?.avatar === 'girl' ? (
                <Image source={{ uri: "https://avatar.iran.liara.run/public/girl" }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : user?.avatar && user.avatar.length > 2 ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" }]}>
                  <Text style={{ color: "#FFF", fontSize: 18, fontFamily: "Poppins_700Bold" }}>{user?.avatar || user?.name?.charAt(0) || "A"}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* Floating Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search students, classes, or fee records..."
            placeholderTextColor="#94A3B8"
            editable={false}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* ── KPI SCROLL ── */}
        <View style={styles.kpiSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
            {[
              { title: "Total Students", val: stats.students || 0, icon: "people", color: "#3B82F6", bg: "#EFF6FF", trend: "+12%" },
              { title: "Active Teachers", val: stats.teachers || 0, icon: "school", color: "#8B5CF6", bg: "#F5F3FF", trend: "0%" },
              { title: "Total Classes", val: stats.courses || 0, icon: "grid", color: "#EC4899", bg: "#FDF2F8", trend: "+2" },
              { title: "Revenue (MTD)", val: "₹1.2L", icon: "wallet", color: "#10B981", bg: "#ECFDF5", trend: "+5%" },
            ].map((k, i) => (
              <Animated.View key={k.title} entering={FadeInRight.delay(100 + i * 100).springify()} style={[styles.kpiCard, { borderTopColor: k.color, borderTopWidth: 4 }]}>
                <View style={styles.kpiTop}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: k.bg }]}>
                    <Ionicons name={k.icon as any} size={22} color={k.color} />
                  </View>
                  <View style={[styles.kpiBadge, { backgroundColor: k.trend.includes("+") ? "#D1FAE5" : "#F1F5F9" }]}>
                    <Text style={[styles.kpiBadgeText, { color: k.trend.includes("+") ? "#059669" : "#64748B" }]}>{k.trend}</Text>
                  </View>
                </View>
                <Text style={styles.kpiVal}>{k.val}</Text>
                <Text style={styles.kpiTitle}>{k.title}</Text>
              </Animated.View>
            ))}
          </ScrollView>
        </View>

        {/* ── QUICK ACTIONS ── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Dashboard Hub</Text>
          </View>
          <View style={styles.qaGrid}>
            {QUICK_ACTIONS.map((q, i) => (
              <TouchableOpacity key={i} onPress={() => { Haptics.selectionAsync(); router.push(q.route as any); }} style={styles.qaCardWrapper}>
                <LinearGradient colors={q.colors as any} style={styles.qaCard} start={{x:0, y:0}} end={{x:1, y:1}}>
                  <View style={styles.qaIconWrap}>
                    <Ionicons name={q.icon as any} size={24} color={q.iconColor} />
                  </View>
                  <Text style={[styles.qaLabel, { color: q.iconColor }]}>{q.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* ── TOP STUDENTS ── */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Top Students</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Leaderboard</Text></TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.studentScroll}>
            {topStudents.length === 0 && (
              <View style={{ padding: 10, alignItems: "center" }}><Text style={{ color: "#94A3B8" }}>No exams recorded yet</Text></View>
            )}
            {topStudents.map((s, i) => (
              <View key={s.id} style={styles.studentCard}>
                <View style={[styles.studentAvatar, { backgroundColor: s.color }]}>
                  <Text style={styles.studentAvatarText}>{s.avatar}</Text>
                </View>
                <Text style={styles.studentName} numberOfLines={1}>{s.name}</Text>
                <View style={[styles.scorePill, { backgroundColor: s.color + "15" }]}>
                  <Text style={[styles.scoreText, { color: s.color }]}>{s.score}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

        {/* ── PENDING FEE FOLLOW-UPS ── */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Pending Fee Follow-ups</Text>
            <TouchableOpacity onPress={() => router.push("/(admin)/finance")}><Text style={styles.seeAll}>View Finance</Text></TouchableOpacity>
          </View>
          <View style={styles.cardBlock}>
            {defaulters.length === 0 && (
              <View style={{ padding: 10, alignItems: "center" }}><Text style={{ color: "#94A3B8" }}>No pending dues!</Text></View>
            )}
            {defaulters.map((f, i) => (
              <View key={f.id} style={[styles.feeItem, i === defaulters.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.feeAvatar, { backgroundColor: f.color + "15" }]}>
                  <Text style={[styles.feeAvatarText, { color: f.color }]}>{f.avatar}</Text>
                </View>
                <View style={styles.feeContent}>
                  <Text style={styles.feeName}>{f.student}</Text>
                  <Text style={styles.feeCourse}>{f.course}</Text>
                  <Text style={[styles.feeDue, { color: f.color }]}>{f.due}</Text>
                </View>
                <View style={styles.feeRight}>
                  <Text style={styles.feeAmount}>{f.amount}</Text>
                  <TouchableOpacity style={styles.remindBtn} onPress={() => Haptics.selectionAsync()}>
                    <Ionicons name="notifications" size={14} color="#FFFFFF" />
                    <Text style={styles.remindText}>Remind</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── RECENT ENROLLMENTS ── */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Enrollments</Text>
            <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.cardBlock}>
            {recentStudents.length === 0 && (
              <View style={{ padding: 10, alignItems: "center" }}><Text style={{ color: "#94A3B8" }}>No recent enrollments</Text></View>
            )}
            {recentStudents.map((e, i) => (
              <View key={e.id} style={[styles.enrollItem, i === recentStudents.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.enrollAvatar, { backgroundColor: e.color + "15" }]}>
                  <Text style={[styles.enrollAvatarText, { color: e.color }]}>{e.avatar}</Text>
                </View>
                <View style={styles.enrollContent}>
                  <Text style={styles.enrollName}>{e.student}</Text>
                  <Text style={styles.enrollCourse}>{e.course}</Text>
                </View>
                <View style={styles.enrollRight}>
                  <Text style={styles.enrollTime}>{e.time}</Text>
                  <View style={[styles.badgePill, { backgroundColor: e.color + "15" }]}>
                    <Text style={[styles.badgeText, { color: e.color }]}>New</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── NOTIFICATIONS & ALERTS ── */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Important Alerts</Text>
          </View>
          <View style={styles.cardBlock}>
            {alerts.map((n, i) => (
              <View key={n.id} style={[styles.listItem, i === alerts.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listIcon, { backgroundColor: n.color + "15" }]}>
                  <Ionicons name={n.icon as any} size={20} color={n.color} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{n.title}</Text>
                  <Text style={styles.listDesc}>{n.desc}</Text>
                </View>
                <TouchableOpacity style={styles.actionBtn}>
                  <Text style={styles.actionBtnText}>View</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

// ── STYLES ────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" }, 
  
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, zIndex: 2 },
  greeting: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.9)", marginBottom: 4 },
  adminName: { fontSize: 32, fontFamily: "Poppins_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  activityBtn: { 
    width: 44, 
    height: 44, 
    borderRadius: 22, 
    justifyContent: "center", 
    alignItems: "center", 
    borderWidth: 1, 
    borderColor: "rgba(255, 255, 255, 0.3)",
    overflow: "hidden"
  },
  notificationDot: {
    position: "absolute",
    top: 10,
    right: 12,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#EF4444",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.8)"
  },
  avatarWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.25)", borderWidth: 2, borderColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: "hidden" },
  avatarImage: { width: "100%", height: "100%" },

  searchContainer: { marginTop: -12, paddingHorizontal: 20, zIndex: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 },

  kpiSection: { marginTop: 16, marginBottom: 26 },
  kpiScroll: { paddingHorizontal: 20, gap: 14 },
  kpiCard: { width: 150, backgroundColor: "#FFFFFF", padding: 16, borderRadius: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  kpiTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  kpiIconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  kpiBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  kpiBadgeText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  kpiVal: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 2 },
  kpiTitle: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },

  scroll: { paddingBottom: 100 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },
  seeAll: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" },

  qaGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  qaCardWrapper: { width: "31%", shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  qaCard: { paddingVertical: 18, borderRadius: 24, alignItems: "center" },
  qaIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  qaLabel: { fontSize: 11, fontFamily: "Poppins_700Bold" },

  studentScroll: { gap: 12 },
  studentCard: { width: 110, backgroundColor: "#FFFFFF", padding: 14, borderRadius: 20, alignItems: "center", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10, elevation: 2 },
  studentAvatar: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  studentAvatarText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
  studentName: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 6 },
  scorePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  scoreText: { fontSize: 11, fontFamily: "Poppins_700Bold" },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  
  enrollItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  enrollAvatar: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  enrollAvatarText: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  enrollContent: { flex: 1, justifyContent: "center", gap: 4 },
  enrollName: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0F172A" },
  enrollCourse: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },
  enrollRight: { alignItems: "flex-end", gap: 6 },
  enrollTime: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#94A3B8" },
  badgePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  badgeText: { fontSize: 10, fontFamily: "Poppins_700Bold" },

  feeItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  feeAvatar: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
  feeAvatarText: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  feeContent: { flex: 1, justifyContent: "center", gap: 3 },
  feeName: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0F172A" },
  feeCourse: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },
  feeDue: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginTop: 2 },
  feeRight: { alignItems: "flex-end", gap: 8 },
  feeAmount: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#0F172A" },
  remindBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#0EA5E9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, gap: 4 },
  remindText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_600SemiBold" },

  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B", lineHeight: 18 },
  listTime: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#94A3B8" },
  actionBtn: { backgroundColor: "#F1F5F9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  actionBtnText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#0F172A" },
});


