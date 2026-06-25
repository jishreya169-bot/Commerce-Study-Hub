import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, useWindowDimensions, TextInput, ActivityIndicator, Modal
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import { useTeacherContext } from "../../context/TeacherContext";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { turso } from "../../lib/turso";

const QUICK_ACTIONS = [
  { label: "Timetable", icon: "time", route: "/(teacher)/timetable", colors: ["#FEF2F2", "#FECACA"], iconColor: "#DC2626" },
  { label: "My Classes", icon: "list", route: "/(teacher)/classes", colors: ["#DBEAFE", "#BFDBFE"], iconColor: "#2563EB" },
  { label: "Attendance", icon: "calendar", route: "/(teacher)/attendance", colors: ["#F3E8FF", "#E9D5FF"], iconColor: "#7C3AED" },
  { label: "Add Homework", icon: "clipboard", route: "/(teacher)/upload", colors: ["#FCE7F3", "#FBCFE8"], iconColor: "#DB2777" },
  { label: "Exams & Results", icon: "document-text", route: "/(teacher)/exams", colors: ["#FEF3C7", "#FDE68A"], iconColor: "#D97706" },
  { label: "Answer Doubts", icon: "help-circle", route: "/(teacher)/doubts", colors: ["#D1FAE5", "#A7F3D0"], iconColor: "#059669" },
  { label: "Submissions", icon: "checkmark-done-circle", route: "/(teacher)/submissions", colors: ["#E0F2FE", "#BAE6FD"], iconColor: "#0284C7" },
];

// ── COMPONENT ─────────────────────────────────────────────────
export default function TeacherDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeClass, setActiveClass, classesList } = useTeacherContext();
  const topPad = Platform.OS === "web" ? 50 : insets.top;
  
  const [showClassDropdown, setShowClassDropdown] = useState(false);

  // Dynamic state
  const [kpis, setKpis] = useState({ students: "...", classes: "...", doubts: "...", attendance: "..." });
  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [pendingDoubts, setPendingDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      const fetchAll = async () => {
      try {
        // KPI: Total students
        let sQuery = "SELECT COUNT(*) FROM users WHERE role = 'student'";
        let sArgs: any[] = [];
        if (activeClass !== "All") {
          sQuery += " AND batch = ?";
          sArgs.push(activeClass);
        }
        const sRes = await turso.execute({ sql: sQuery, args: sArgs });
        const totalStudents = sRes.rows[0]?.[0]?.toString() || "0";

        // KPI: Classes for this teacher
        let classCount = "0";
        let classRows: any[] = [];
        if (user?.id) {
          let cQuery = "SELECT id, title, batch, time, color FROM timetable WHERE teacherId = ?";
          let cArgs: any[] = [user.id];
          if (activeClass !== "All") {
            cQuery += " AND batch = ?";
            cArgs.push(activeClass);
          }
          const cRes = await turso.execute({ sql: cQuery, args: cArgs });
          classCount = cRes.rows.length.toString();
          classRows = cRes.rows.map(r => ({
            id: r[0] as string,
            title: r[1] as string,
            batch: r[2] as string,
            time: r[3] as string,
            color: r[4] as string || "#3B82F6",
            type: "Lecture"
          }));
        }
        setUpcomingClasses(classRows.slice(0, 3));

        // KPI: Pending doubts
        let dDataQuery = "SELECT id, studentName, batch, question, timestamp FROM doubts WHERE status = 'pending'";
        let dDataArgs: any[] = [];
        if (activeClass !== "All") {
          dDataQuery += " AND batch = ?";
          dDataArgs.push(activeClass);
        }
        dDataQuery += " ORDER BY timestamp DESC LIMIT 3";
        const dRes = await turso.execute({ sql: dDataQuery, args: dDataArgs });
        const doubtsData = dRes.rows.map(r => ({
          id: r[0] as string,
          student: r[1] as string,
          batch: r[2] as string,
          question: r[3] as string,
          time: r[4] as string || "Recently"
        }));
        setPendingDoubts(doubtsData);

        // KPI: Full pending count
        let dQuery = "SELECT COUNT(*) FROM doubts WHERE status = 'pending'";
        let dArgs: any[] = [];
        if (activeClass !== "All") {
          dQuery += " AND batch = ?";
          dArgs.push(activeClass);
        }
        const dCountRes = await turso.execute({ sql: dQuery, args: dArgs });
        const fullPendingCount = dCountRes.rows[0]?.[0]?.toString() || "0";

        setKpis({
          students: totalStudents,
          classes: classCount,
          doubts: fullPendingCount,
          attendance: "N/A"
        });
      } catch (e) {
        console.error("Teacher Dashboard Error:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [user?.id, activeClass])
  );

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0EA5E9" />
      </View>
    );
  }

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
            <Text style={styles.adminName}>{user?.name ?? "Teacher"}</Text>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.push("/(teacher)/notifications"); }} activeOpacity={0.7}>
              <BlurView intensity={30} tint="light" style={styles.activityBtn}>
                <Ionicons name="notifications" size={22} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(teacher)/profile")} style={styles.avatarWrap}>
              {user?.avatar === 'boy' ? (
                <Image source={{ uri: "https://avatar.iran.liara.run/public/boy" }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : user?.avatar === 'girl' ? (
                <Image source={{ uri: "https://avatar.iran.liara.run/public/girl" }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : user?.avatar && user.avatar.length > 2 ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" }]}>
                  <Text style={{ color: "#FFF", fontSize: 18, fontFamily: "Poppins_700Bold" }}>{user?.avatar || user?.name?.charAt(0) || "T"}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

      </LinearGradient>

      {/* DROPDOWN MODAL */}
      <Modal visible={showClassDropdown} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }} activeOpacity={1} onPress={() => setShowClassDropdown(false)}>
          <View style={{ width: "80%", backgroundColor: "#FFF", borderRadius: 24, padding: 20, maxHeight: "60%" }}>
            <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 16 }}>Select Active Class</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {classesList.map(c => (
                <TouchableOpacity 
                  key={c}
                  style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setActiveClass(c);
                    setShowClassDropdown(false);
                  }}
                >
                  <Text style={{ fontSize: 15, fontFamily: "Poppins_600SemiBold", color: activeClass === c ? "#0EA5E9" : "#334155" }}>{c}</Text>
                  {activeClass === c && <Ionicons name="checkmark-circle" size={20} color="#0EA5E9" />}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Floating Action Bar (Search & Active Class 50-50) */}
      <View style={styles.searchContainer}>
        <View style={{ flexDirection: "row", gap: 12, width: "100%" }}>
          
          {/* Active Class Dropdown (50%) */}
          <TouchableOpacity 
            style={[styles.searchBox, { flex: 1, justifyContent: "space-between" }]}
            onPress={() => { Haptics.selectionAsync(); setShowClassDropdown(true); }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Ionicons name="people" size={18} color="#0EA5E9" />
              <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }} numberOfLines={1}>
                {activeClass}
              </Text>
            </View>
            <Ionicons name="chevron-down" size={18} color="#64748B" />
          </TouchableOpacity>

          {/* Search Box (50%) */}
          <View style={[styles.searchBox, { flex: 1 }]}>
            <Ionicons name="search" size={18} color="#64748B" />
            <TextInput 
              style={[styles.searchInput, { fontSize: 13 }]}
              placeholder="Search..."
              placeholderTextColor="#94A3B8"
              editable={false}
            />
          </View>

        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* ── KPI SCROLL ── */}
        <View style={styles.kpiSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
            {[
              { title: "Total Students", val: kpis.students, icon: "people", color: "#3B82F6", bg: "#EFF6FF", trend: "All Enrolled" },
              { title: "My Classes", val: kpis.classes, icon: "book", color: "#8B5CF6", bg: "#F5F3FF", trend: "In Timetable" },
              { title: "Pending Doubts", val: kpis.doubts, icon: "help-circle", color: "#EF4444", bg: "#FEF2F2", trend: "Needs Reply" },
            ].map((k, i) => (
              <Animated.View key={k.title} entering={FadeInRight.delay(100 + i * 100).springify()} style={[styles.kpiCard, { borderTopColor: k.color, borderTopWidth: 4 }]}>
                <View style={styles.kpiTop}>
                  <View style={[styles.kpiIconWrap, { backgroundColor: k.bg }]}>
                    <Ionicons name={k.icon as any} size={22} color={k.color} />
                  </View>
                </View>
                <Text style={styles.kpiVal}>{k.val}</Text>
                <Text style={styles.kpiTitle}>{k.title}</Text>
                <Text style={styles.kpiTrend}>{k.trend}</Text>
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

        {/* ── TODAY'S SCHEDULE ── */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>My Classes Today</Text>
            <TouchableOpacity onPress={() => router.push("/(teacher)/classes")}><Text style={styles.seeAll}>Timetable</Text></TouchableOpacity>
          </View>
          <View style={styles.cardBlock}>
            {loading ? (
              <View style={{ padding: 20, alignItems: "center" }}><ActivityIndicator color="#0EA5E9" /></View>
            ) : upcomingClasses.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No classes scheduled yet.</Text>
              </View>
            ) : (
              upcomingClasses.map((u, i) => (
                <View key={u.id} style={[styles.listItem, i === upcomingClasses.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.timeBox, { backgroundColor: u.color + "15" }]}>
                    <Ionicons name="book" size={28} color={u.color} />
                  </View>
                  <View style={styles.listContent}>
                    <View style={styles.listRow}>
                      <Text style={styles.listTitle} numberOfLines={1}>{u.title}</Text>
                    </View>
                    <View style={styles.listRowMeta}>
                      <Text style={styles.listMeta}><Ionicons name="people-outline" size={12}/> {u.batch}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.actionPillBtn} onPress={() => router.push("/(teacher)/classes")}>
                    <Text style={styles.actionPillText}>View</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        </Animated.View>

        {/* ── PENDING DOUBTS ── */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Pending Doubts</Text>
            <TouchableOpacity onPress={() => router.push("/(teacher)/doubts")}><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.cardBlock}>
            {loading ? (
              <View style={{ padding: 20, alignItems: "center" }}><ActivityIndicator color="#0EA5E9" /></View>
            ) : pendingDoubts.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No pending doubts! 🎉</Text>
              </View>
            ) : (
              pendingDoubts.map((d, i) => (
                <View key={d.id} style={[styles.doubtItem, i === pendingDoubts.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={styles.doubtHeader}>
                    <View style={styles.doubtStudent}>
                      <Ionicons name="person-circle" size={18} color="#94A3B8" />
                      <Text style={styles.doubtStudentName}>{d.student}</Text>
                      <View style={styles.batchPill}>
                        <Text style={styles.batchPillText}>{d.batch}</Text>
                      </View>
                    </View>
                    <Text style={styles.doubtTime}>{d.time}</Text>
                  </View>
                  <Text style={styles.doubtQuestion} numberOfLines={2}>"{d.question}"</Text>
                  <TouchableOpacity style={styles.replyBtn} onPress={() => router.push("/(teacher)/doubts")}>
                    <Ionicons name="chatbubble-ellipses" size={14} color="#0EA5E9" />
                    <Text style={styles.replyBtnText}>Answer Now</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
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
  greeting: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.9)", marginBottom: 2 },
  adminName: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#FFFFFF", letterSpacing: -0.5 },
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
  kpiCard: { width: 160, backgroundColor: "#FFFFFF", padding: 16, borderRadius: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 3 },
  kpiTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  kpiIconWrap: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  kpiVal: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 2 },
  kpiTitle: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B", marginBottom: 4 },
  kpiTrend: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#94A3B8" },

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

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  timeBox: { width: 65, height: 65, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  timeMain: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  timeSub: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  listContent: { flex: 1, justifyContent: "center", gap: 6 },
  listRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  listTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0F172A", flex: 1 },
  listRowMeta: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  listMeta: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },
  typePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  listType: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  actionPillBtn: { backgroundColor: "#0EA5E9", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  actionPillText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_600SemiBold" },

  doubtItem: { paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  doubtHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  doubtStudent: { flexDirection: "row", alignItems: "center", gap: 6 },
  doubtStudentName: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A" },
  batchPill: { backgroundColor: "#F1F5F9", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  batchPillText: { fontSize: 9, fontFamily: "Poppins_700Bold", color: "#64748B" },
  doubtTime: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#94A3B8" },
  doubtQuestion: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#334155", lineHeight: 22, marginBottom: 12 },
  replyBtn: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", backgroundColor: "#F0F9FF", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, gap: 6 },
  replyBtnText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" },

  listIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B", lineHeight: 18 },
});


