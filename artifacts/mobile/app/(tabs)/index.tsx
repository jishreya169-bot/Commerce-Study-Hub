import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, useWindowDimensions, TextInput
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";
import Animated, { FadeInDown, FadeInRight, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { turso } from "../../lib/turso";
import { triggerImmediateOverdueAlert, scheduleClassReminders } from "../../lib/notifications";

// Dynamic data states will be used instead of static UPCOMING

const QUICK_ACTIONS = [
  { label: "Timetable", icon: "time", route: "/(tabs)/timetable", colors: ["#FEF2F2", "#FECACA"], iconColor: "#DC2626" },
  { label: "Notes", icon: "book", route: "/(tabs)/materials", colors: ["#DBEAFE", "#BFDBFE"], iconColor: "#2563EB" },
  { label: "Join Class", icon: "videocam", route: "/(tabs)/courses", colors: ["#F3E8FF", "#E9D5FF"], iconColor: "#7C3AED" },
  { label: "Ask Doubt", icon: "help-circle", route: "/(tabs)/doubts", colors: ["#FFEDD5", "#FDBA74"], iconColor: "#EA580C" },
  { label: "Homework", icon: "pencil", route: "/(tabs)/homework", colors: ["#FEF3C7", "#FDE68A"], iconColor: "#D97706" },
  { label: "Mock Tests", icon: "document-text", route: "/(tabs)/tests", colors: ["#FCE7F3", "#FBCFE8"], iconColor: "#DB2777" },
  { label: "Results", icon: "podium", route: "/(tabs)/results", colors: ["#D1FAE5", "#A7F3D0"], iconColor: "#059669" },
  { label: "Library", icon: "library", route: "/(tabs)/library", colors: ["#E0F2FE", "#BAE6FD"], iconColor: "#0284C7" },
  { label: "Leaderboard", icon: "trophy", route: "/(tabs)/leaderboard", colors: ["#FEF08A", "#FDE047"], iconColor: "#CA8A04" },
  { label: "Attendance", icon: "calendar", route: "/(tabs)/attendance", colors: ["#EEF2FF", "#C7D2FE"], iconColor: "#4F46E5" },
];

// OVERVIEW will be generated dynamically
const PERFORMANCE = [
  { id: "p1", label: "Strongest Subject", value: "Accountancy", subValue: "94% Avg", icon: "trophy", color: "#F59E0B" },
  { id: "p2", label: "Needs Improvement", value: "Business Studies", subValue: "68% Avg", icon: "trending-down", color: "#EF4444" },
  { id: "p3", label: "Current Rank", value: "Class 12 Commerce", subValue: "Rank #4", icon: "medal", color: "#10B981" },
];

// ── COMPONENT ─────────────────────────────────────────────────
export default function StudentDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [overdueFee, setOverdueFee] = useState<{amount: number, days: number} | null>(null);

  const [upcomingClasses, setUpcomingClasses] = useState<any[]>([]);
  const [pendingHw, setPendingHw] = useState(0);
  const [upcomingTests, setUpcomingTests] = useState(0);

  const [testsGivenCount, setTestsGivenCount] = useState(0);
  const [homeworkCount, setHomeworkCount] = useState(0);
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [attendancePercent, setAttendancePercent] = useState(85);
  const [unreadCount, setUnreadCount] = useState(0);

  const [chartScores, setChartScores] = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);
  const [chartSubjects, setChartSubjects] = useState<{name: string, val: number}[]>([
    {name: "Acc", val: 0}, {name: "Eco", val: 0}, {name: "Bus", val: 0}, {name: "Eng", val: 0}
  ]);
  const [perfStrong, setPerfStrong] = useState({ value: "N/A", subValue: "0%" });
  const [perfWeak, setPerfWeak] = useState({ value: "N/A", subValue: "0%" });
  const [perfRank, setPerfRank] = useState({ value: "Class", subValue: "N/A" });
  const [rank, setRank] = useState("N/A");
  const [courseProg, setCourseProg] = useState(0);

  const [childName, setChildName] = useState("");

  const getStatus = (timeStr: string) => {
    if (!timeStr || !timeStr.includes("-")) return { label: "Upcoming", color: "#0EA5E9", bg: "#F0F9FF" };
    const [startStr, endStr] = timeStr.split("-");
    
    const parseTime = (tStr: string) => {
      const match = tStr.trim().match(/(\d+):(\d+)\s*(AM|PM)/i);
      if (!match) return 0;
      let h = parseInt(match[1], 10);
      const m = parseInt(match[2], 10);
      const ampm = match[3].toUpperCase();
      if (ampm === "PM" && h < 12) h += 12;
      if (ampm === "AM" && h === 12) h = 0;
      return h * 60 + m;
    };
    
    const startMins = parseTime(startStr);
    const endMins = parseTime(endStr);
    
    const now = new Date();
    const currentMins = now.getHours() * 60 + now.getMinutes();

    if (currentMins < startMins) return { label: "Upcoming", color: "#0EA5E9", bg: "#F0F9FF" };
    if (currentMins >= startMins && currentMins <= endMins) return { label: "Running", color: "#10B981", bg: "#ECFDF5" };
    return { label: "Expired", color: "#EF4444", bg: "#FEF2F2" };
  };

  useFocusEffect(
    React.useCallback(() => {
    if (!user) return;
    
    const initGamification = async () => {
      try {
        let targetStudentId = user.id;
        
        if (user.role === 'parent') {
           const childRes = await turso.execute({
             sql: "SELECT id, name FROM users WHERE parentId = ?",
             args: [user.id]
           });
           if (childRes.rows.length > 0) {
              targetStudentId = childRes.rows[0][0] as string;
              setChildName(childRes.rows[0][1] as string);
           } else {
              targetStudentId = "s1";
              setChildName("Priya Sharma");
           }
        }

        const res = await turso.execute({
          sql: "SELECT points, streak, lastActiveDate FROM users WHERE id = ?",
          args: [targetStudentId]
        });
        
        if (res.rows.length > 0) {
          let currentPoints = (res.rows[0][0] as number) || 0;
          let currentStreak = (res.rows[0][1] as number) || 0;
          const lastActive = res.rows[0][2] as string;

          const today = new Date().toISOString().split("T")[0];
          
          if (lastActive !== today && user.role !== 'parent') {
            // New day login (only update if student)
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toISOString().split("T")[0];

            if (lastActive === yesterdayStr) {
              currentStreak += 1;
            } else {
              currentStreak = 1; // Reset streak
            }
            
            currentPoints += 10; // +10 points for daily login
            
            await turso.execute({
              sql: "UPDATE users SET points = ?, streak = ?, lastActiveDate = ? WHERE id = ?",
              args: [currentPoints, currentStreak, today, targetStudentId]
            });
          }
          
          setPoints(currentPoints);
          setStreak(currentStreak);
        }

        // Check Fees
        const feeRes = await turso.execute({
          sql: "SELECT totalAmount, paidAmount, nextDueDate, status FROM fees WHERE studentId = ? AND status != 'completed'",
          args: [targetStudentId]
        });

        if (feeRes.rows.length > 0) {
          const totalAmt = feeRes.rows[0][0] as number;
          const paidAmt = feeRes.rows[0][1] as number;
          const dueDateStr = feeRes.rows[0][2] as string;
          
          const due = new Date(dueDateStr);
          const now = new Date();

          if (now.getTime() > due.getTime() && (totalAmt - paidAmt) > 0) {
            // Overdue!
            const diffTime = Math.abs(now.getTime() - due.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setOverdueFee({ amount: totalAmt - paidAmt, days: diffDays });

            // Trigger Push Notification immediately
            triggerImmediateOverdueAlert(user.name || "Student", totalAmt - paidAmt);
            
            // Mark as overdue in DB
            await turso.execute({
              sql: "UPDATE fees SET status = 'overdue' WHERE studentId = ?",
              args: [targetStudentId]
            });
          }
        }

        // --- Fetch dynamic dashboard data ---
        const userRes = await turso.execute({
          sql: "SELECT batch FROM users WHERE id = ?",
          args: [targetStudentId]
        });
        let batch = "Class 12 - Commerce";
        if (userRes.rows.length > 0) {
          batch = (userRes.rows[0][0] as string) || batch;
        }

        // 1. Fetch Timetable
        const todayStr = new Date().toISOString().split("T")[0];
        const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const todayDay = days[new Date().getDay()];

        const ttRes = await turso.execute({
          sql: "SELECT id, title, time, color, (SELECT name FROM users WHERE id = teacherId), dayOfWeek, date, type FROM timetable WHERE batch = ?",
          args: [batch]
        });
        
        // Filter for Lectures Today
        const todaysClasses = ttRes.rows.filter(r => {
          const type = r[7] as string;
          if (type === 'one-time' && r[6] === todayStr) return true;
          if ((type === 'recurring' || !type) && r[5] === todayDay) return true;
          return false;
        }).map(r => ({
          id: r[0] as string,
          title: r[1] as string,
          time: r[2] as string,
          color: r[3] as string,
          teacher: (r[4] as string) || "Teacher",
          type: "Class"
        }));
        setUpcomingClasses(todaysClasses);
        
        // Background schedule notifications for upcoming classes
        scheduleClassReminders(todaysClasses);

        // 2. Fetch Pending HW
        const hwRes = await turso.execute({
          sql: "SELECT COUNT(*) FROM homework WHERE batch = ?",
          args: [batch]
        });
        const totalHw = (hwRes.rows[0]?.[0] as number) || 0;
        
        const hwSubRes = await turso.execute({
          sql: "SELECT COUNT(*) FROM homework_submissions WHERE studentId = ?",
          args: [targetStudentId]
        });
        const submittedHw = (hwSubRes.rows[0]?.[0] as number) || 0;
        setHomeworkCount(totalHw);
        setPendingHw(Math.max(0, totalHw - submittedHw));

        // 3. Fetch Exams (Upcoming only)
        const exRes = await turso.execute({
          sql: "SELECT COUNT(*) FROM exams WHERE classId = ? AND date >= ?",
          args: [batch, todayStr]
        });
        setUpcomingTests((exRes.rows[0]?.[0] as number) || 0);

        const resultsRes = await turso.execute({
          sql: "SELECT e.title, r.marksObtained, e.totalMarks FROM results r JOIN exams e ON r.examId = e.id WHERE r.studentId = ?",
          args: [targetStudentId]
        });
        
        const resultsData = resultsRes.rows.map(r => ({
           title: r[0] as string,
           perc: Math.round(((r[1] as number) / (r[2] as number)) * 100) || 0
        }));

        setTestsGivenCount(resultsData.length);
        
        // Fetch actual subjects from materials to map correctly
        const subRes = await turso.execute({
          sql: "SELECT DISTINCT subject FROM materials WHERE batch = ?",
          args: [batch]
        });
        const batchSubjects = subRes.rows.map(r => r[0] as string).filter(Boolean);
        if (batchSubjects.length === 0) {
           batchSubjects.push("Accountancy", "Economics", "Business Studies", "English");
        }

        const subjectMap: Record<string, {total: number, count: number}> = {};
        batchSubjects.forEach(s => {
           subjectMap[s] = {total: 0, count: 0};
        });

        resultsData.forEach(r => {
           let sub = batchSubjects.find(s => r.title.toLowerCase().includes(s.toLowerCase()));
           if (!sub) sub = r.title.split(" ")[0] || "General";
           if (!subjectMap[sub]) subjectMap[sub] = {total: 0, count: 0};
           subjectMap[sub].total += r.perc;
           subjectMap[sub].count += 1;
        });

        const subStats = Object.keys(subjectMap).map(k => ({
           name: k,
           avg: subjectMap[k].count > 0 ? Math.round(subjectMap[k].total / subjectMap[k].count) : 0
        })).sort((a,b) => b.avg - a.avg);

        if (resultsData.length > 0) {
           const scores = resultsData.map(r => r.perc).slice(-7);
           while(scores.length < 7) scores.unshift(0);
           setChartScores(scores);
           setCourseProg(Math.round(resultsData.reduce((a,b)=>a+b.perc, 0) / resultsData.length));
        } else {
           setChartScores([0,0,0,0,0,0,0]);
           setCourseProg(0);
        }

        const validStats = subStats.filter(s => subjectMap[s.name].count > 0);
        if (validStats.length > 0) {
           setPerfStrong({ value: validStats[0].name, subValue: `${validStats[0].avg}% Avg` });
           setPerfWeak({ value: validStats[validStats.length-1].name, subValue: `${validStats[validStats.length-1].avg}% Avg` });
        } else {
           setPerfStrong({ value: "N/A", subValue: "0%" });
           setPerfWeak({ value: "N/A", subValue: "0%" });
        }

        const top4 = subStats.slice(0, 4);
        while(top4.length < 4) top4.push({name: "N/A", avg: 0});
        setChartSubjects(top4.map(t => ({name: t.name.substring(0,3), val: t.avg})));
        // Fetch dynamic rank
        const rankRes = await turso.execute({
          sql: "SELECT r.studentId, SUM(r.marksObtained) as total FROM results r JOIN users u ON r.studentId = u.id WHERE u.batch = ? GROUP BY r.studentId ORDER BY total DESC",
          args: [batch]
        });
        let myRank = "N/A";
        rankRes.rows.forEach((r, i) => {
          if (r[0] === targetStudentId) myRank = `Rank #${i + 1}`;
        });
        setPerfRank({ value: batch, subValue: myRank });
        setRank(myRank);

        // Fetch Real Attendance
        const attRes = await turso.execute({
          sql: "SELECT status FROM student_attendance WHERE studentId = ?",
          args: [user.id]
        });
        if (attRes.rows.length > 0) {
          const present = attRes.rows.filter(r => r[0] === 'Present').length;
          setAttendancePercent(Math.round((present / attRes.rows.length) * 100));
        } else {
          setAttendancePercent(100); // Default if no attendance taken yet
        }

        // Fetch Unread Notifications
        const unreadRes = await turso.execute({
          sql: "SELECT COUNT(*) FROM notifications WHERE userId = ? AND read = 0",
          args: [targetStudentId]
        });
        setUnreadCount((unreadRes.rows[0]?.[0] as number) || 0);

      } catch (e) {
        console.error("Dashboard error:", e);
      }
    };
    
    initGamification();
  }, [user])
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
            <Text style={styles.adminName}>{user?.name ?? "Student"}</Text>
            {user?.role === 'parent' && childName ? (
              <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#FCD34D", marginTop: 2 }}>
                Viewing child: {childName}
              </Text>
            ) : null}
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push("/(tabs)/notifications")} activeOpacity={0.7}>
              <BlurView intensity={30} tint="light" style={styles.activityBtn}>
                <Ionicons name="notifications" size={22} color="#FFFFFF" />
                {unreadCount > 0 && <View style={styles.notificationDot} />}
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={styles.avatarWrap}>
              {user?.avatar === 'boy' ? (
                <Image source={{ uri: "https://avatar.iran.liara.run/public/boy" }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : user?.avatar === 'girl' ? (
                <Image source={{ uri: "https://avatar.iran.liara.run/public/girl" }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : user?.avatar && user.avatar.length > 2 ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" }]}>
                  <Text style={{ color: "#FFF", fontSize: 18, fontFamily: "Poppins_700Bold" }}>{user?.avatar || user?.name?.charAt(0) || "S"}</Text>
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
            placeholder="Search notes, tests, or classes..."
            placeholderTextColor="#94A3B8"
            editable={false}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* OVERDUE FEE ALERT */}
        {overdueFee && (
          <Animated.View entering={FadeInDown.springify()} style={{ paddingHorizontal: 20, marginTop: 16 }}>
            <View style={{ backgroundColor: "#FEF2F2", borderWidth: 2, borderColor: "#EF4444", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14 }}>
              <Ionicons name="warning" size={32} color="#EF4444" />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: "#991B1B" }}>Urgent: Fee Overdue</Text>
                <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: "#DC2626" }}>
                  Your fee of ₹{overdueFee.amount} is overdue by {overdueFee.days} day(s). Please clear it immediately.
                </Text>
              </View>
            </View>
          </Animated.View>
        )}
        
        {/* ── KPI SCROLL ── */}
        <View style={styles.kpiSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.kpiScroll}>
            {[
              { title: "Attendance", val: `${attendancePercent}%`, icon: "calendar", color: "#3B82F6", bg: "#EFF6FF", trend: "Good", route: "/(tabs)/attendance" },
              { title: "Tests Given", val: testsGivenCount.toString(), icon: "document-text", color: "#8B5CF6", bg: "#F5F3FF", trend: "Updated", route: "/(tabs)/tests" },
              { title: "Homework", val: homeworkCount.toString(), icon: "book", color: "#EC4899", bg: "#FDF2F8", trend: `${pendingHw} Pending`, route: "/(tabs)/homework" },
              { title: "Course Prog.", val: `${courseProg}%`, icon: "bar-chart", color: "#10B981", bg: "#ECFDF5", trend: "Active" },
            ].map((k, i) => (
              <Animated.View key={k.title} entering={FadeInRight.delay(100 + i * 100).springify()}>
                <TouchableOpacity 
                  activeOpacity={k.route ? 0.7 : 1}
                  onPress={() => {
                    if (k.route) {
                      Haptics.selectionAsync();
                      router.push(k.route as any);
                    }
                  }}
                  style={[styles.kpiCard, { borderTopColor: k.color, borderTopWidth: 4 }]}
                >
                  <View style={styles.kpiTop}>
                    <View style={[styles.kpiIconWrap, { backgroundColor: k.bg }]}>
                      <Ionicons name={k.icon as any} size={22} color={k.color} />
                    </View>
                    <View style={[styles.kpiBadge, { backgroundColor: k.trend.includes("Pending") ? "#FEF2F2" : "#F1F5F9" }]}>
                      <Text style={[styles.kpiBadgeText, { color: k.trend.includes("Pending") ? "#EF4444" : "#64748B" }]}>{k.trend}</Text>
                    </View>
                  </View>
                  <Text style={styles.kpiVal}>{k.val}</Text>
                  <Text style={styles.kpiTitle}>{k.title}</Text>
                </TouchableOpacity>
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



        {/* ── TODAY'S CLASSES ── */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Today's Classes</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/timetable")}><Text style={styles.seeAll}>Timetable</Text></TouchableOpacity>
          </View>
          <View style={styles.cardBlock}>
            {upcomingClasses.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No classes scheduled for today.</Text>
              </View>
            )}
            {upcomingClasses.map((u, i) => {
              const statusInfo = getStatus(u.time);
              return (
                <View key={i} style={[styles.listItem, i === upcomingClasses.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.timeBox, { backgroundColor: u.color + "15" }]}>
                    <Ionicons name="book" size={28} color={u.color} />
                  </View>
                  <View style={styles.listContent}>
                    <View style={styles.listRow}>
                      <Text style={styles.listTitle} numberOfLines={1}>{u.title}</Text>
                    </View>
                    <View style={styles.listRowMeta}>
                      <Text style={styles.listMeta}><Ionicons name="person-outline" size={12}/> {u.teacher}</Text>
                    </View>
                  </View>
                  <View style={[styles.statusIndicator, { backgroundColor: statusInfo.bg }]}>
                    <Text style={[styles.statusIndicatorText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Animated.View>

        {/* ── CHARTS SECTION (Moved from Admin) ── */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Analytics</Text>
          </View>
          
          <View style={styles.multiChartRow}>
            {/* Subject Growth Chart (Mock Sparkline) */}
            <View style={[styles.chartCardMini, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.miniChartTitle}>Test Scores</Text>
              <Text style={styles.miniChartVal}>+8% Improvement</Text>
              <View style={styles.sparkRow}>
                {chartScores.map((h, i) => (
                  <View key={i} style={[styles.sparkDot, { height: `${h}%`, backgroundColor: "#3B82F6" }]} />
                ))}
              </View>
            </View>

            {/* Attendance Trend (Mock Line) */}
            <View style={[styles.chartCardMini, { flex: 1 }]}>
              <Text style={styles.miniChartTitle}>Attendance</Text>
              <Text style={styles.miniChartVal}>Consistent</Text>
              <View style={styles.sparkRow}>
                {[95, 94, 91, 96, 92, 89, 94].map((h, i) => (
                  <View key={i} style={[styles.sparkDot, { height: `${h}%`, backgroundColor: "#F59E0B" }]} />
                ))}
              </View>
            </View>
          </View>

          {/* Subject Performance Chart */}
          <View style={[styles.chartCard, { marginTop: 14 }]}>
            <Text style={[styles.miniChartTitle, { marginBottom: 16 }]}>Subject Performance</Text>
            <View style={styles.chartBars}>
              {chartSubjects.map((s, i) => (
                <View key={i} style={styles.barCol}>
                  <Text style={styles.barVal}>{s.val}%</Text>
                  <View style={[styles.barTrack]}>
                    <View style={[styles.barFill, { height: `${s.val}%` }]} />
                  </View>
                  <Text style={styles.barLabel}>{s.name}</Text>
                </View>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* ── TODAY'S OVERVIEW (Moved from Admin) ── */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Today's Overview</Text>
          </View>
          <View style={styles.overviewGrid}>
            {[
              { title: "Pending HW", val: pendingHw.toString(), icon: "document-text", color: "#F59E0B" },
              { title: "Upcoming Tests", val: upcomingTests.toString(), icon: "clipboard", color: "#10B981" },
              { title: "Unread Notices", val: "1", icon: "megaphone", color: "#EF4444" },
            ].map((o, i) => (
              <View key={i} style={styles.overviewCard}>
                <View style={[styles.oIconWrap, { backgroundColor: o.color + "15" }]}>
                  <Ionicons name={o.icon as any} size={18} color={o.color} />
                </View>
                <View style={styles.oContent}>
                  <Text style={styles.oVal}>{o.val}</Text>
                  <Text style={styles.oTitle}>{o.title}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* ── PERFORMANCE SECTION (Moved from Admin) ── */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Personal Performance</Text>
          </View>
          <View style={styles.cardBlock}>
            {[
              { id: "p1", label: "Strongest Subject", value: perfStrong.value, subValue: perfStrong.subValue, icon: "trophy", color: "#F59E0B" },
              { id: "p2", label: "Needs Improvement", value: perfWeak.value, subValue: perfWeak.subValue, icon: "trending-down", color: "#EF4444" },
              { id: "p3", label: "Current Rank", value: perfRank.value, subValue: perfRank.subValue, icon: "medal", color: "#10B981" },
            ].map((p, i, arr) => (
              <View key={p.id} style={[styles.perfItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.perfIcon, { backgroundColor: p.color + "15" }]}>
                  <Ionicons name={p.icon as any} size={20} color={p.color} />
                </View>
                <View style={styles.perfTextWrap}>
                  <Text style={styles.perfTitle}>{p.label}</Text>
                  <Text style={styles.perfDesc}>{p.value}</Text>
                </View>
                <View style={[styles.badgePill, { backgroundColor: p.color + "10" }]}>
                  <Text style={[styles.badgeText, { color: p.color }]}>{p.subValue}</Text>
                </View>
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
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  badgeWrap: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  streakText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#FCA5A5" },
  pointsText: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#93C5FD" },
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
  avatarWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.25)", borderWidth: 2, borderColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, overflow: "hidden" },
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
  statusIndicator: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  statusIndicatorText: { fontSize: 11, fontFamily: "Poppins_700Bold", letterSpacing: 0.5 },

  /* Charts */
  multiChartRow: { flexDirection: "row", justifyContent: "space-between" },
  chartCardMini: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  miniChartTitle: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A" },
  miniChartVal: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B", marginBottom: 10 },
  sparkRow: { flexDirection: "row", alignItems: "flex-end", height: 40, gap: 4 },
  sparkDot: { width: 8, borderRadius: 4 },
  chartCard: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  chartBars: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 160 },
  barCol: { alignItems: "center", gap: 6 },
  barVal: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#64748B" },
  barTrack: { width: 14, height: 100, backgroundColor: "#F1F5F9", borderRadius: 7, justifyContent: "flex-end" },
  barFill: { width: 14, backgroundColor: "#0EA5E9", borderRadius: 7 },
  barLabel: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#94A3B8" },

  /* Overview */
  overviewGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 12 },
  overviewCard: { width: "48%", flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 14, borderRadius: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, gap: 12 },
  oIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  oContent: { flex: 1 },
  oVal: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" },
  oTitle: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B" },

  /* Performance */
  perfItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  perfIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  perfTextWrap: { flex: 1 },
  perfTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  perfDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  badgePill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
});



