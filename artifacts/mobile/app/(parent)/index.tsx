import React, { useCallback, useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { BlurView } from "expo-blur";
import { useAuth } from "@/context/AuthContext";
import { turso } from "@/lib/turso";

export default function ParentDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [childName, setChildName] = useState("Your Child");
  const [childId, setChildId] = useState("");
  const [batch, setBatch] = useState("N/A");

  const [overdueFee, setOverdueFee] = useState<{amount: number, days: number} | null>(null);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [performance, setPerformance] = useState("N/A");
  
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [classRank, setClassRank] = useState("N/A");
  const [pendingHw, setPendingHw] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      if (!user) return;
      
      const fetchParentData = async () => {
        try {
          let targetStudentId = "s1";
          let cName = "Student";
        
        // Find Child
        const childRes = await turso.execute({
          sql: "SELECT id, name, batch FROM users WHERE parentId = ?",
          args: [user.id]
        });
        if (childRes.rows.length > 0) {
          targetStudentId = childRes.rows[0][0] as string;
          cName = childRes.rows[0][1] as string;
          setBatch((childRes.rows[0][2] as string) || "N/A");
        } else {
          // Demo fallback
          targetStudentId = "s1";
          cName = "Priya Sharma";
          setBatch("Class 12 - Commerce");
        }
        
        setChildId(targetStudentId);
        setChildName(cName);

        // Fetch Fees
        const feeRes = await turso.execute({
          sql: "SELECT totalAmount, paidAmount, nextDueDate FROM fees WHERE studentId = ? AND status != 'completed'",
          args: [targetStudentId]
        });

        if (feeRes.rows.length > 0) {
          const totalAmt = feeRes.rows[0][0] as number;
          const paidAmt = feeRes.rows[0][1] as number;
          const due = new Date(feeRes.rows[0][2] as string);
          const now = new Date();
          
          if (now.getTime() > due.getTime()) {
            const diffTime = Math.abs(now.getTime() - due.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setOverdueFee({ amount: totalAmt - paidAmt, days: diffDays });
          }
        }

        // Fetch Performance
        const resRes = await turso.execute({
          sql: "SELECT r.marksObtained, e.totalMarks FROM results r JOIN exams e ON r.examId = e.id WHERE r.studentId = ?",
          args: [targetStudentId]
        });
        if (resRes.rows.length > 0) {
           let totalP = 0;
           resRes.rows.forEach(r => {
              const m = r[0] as number;
              const t = r[1] as number;
              totalP += t > 0 ? (m / t) * 100 : 0;
           });
           const avg = totalP / resRes.rows.length;
           if (avg >= 90) setPerformance("A+");
           else if (avg >= 80) setPerformance("A");
           else if (avg >= 70) setPerformance("B");
           else if (avg >= 60) setPerformance("C");
           else setPerformance("D");
        }

        // Fetch Today's Timetable
        const todayStr = new Date().toISOString().split("T")[0];
        const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const todayDay = days[new Date().getDay()];

        const ttRes = await turso.execute({
          sql: "SELECT id, title, time, color, (SELECT name FROM users WHERE id = teacherId), dayOfWeek, date, type FROM timetable WHERE batch = ?",
          args: [batch]
        });
        
        const classes = ttRes.rows.filter(r => {
          const type = r[7] as string;
          if (type === 'one-time' && r[6] === todayStr) return true;
          if ((type === 'recurring' || !type) && r[5] === todayDay) return true;
          return false;
        }).map(r => ({
          id: r[0] as string,
          title: r[1] as string,
          time: r[2] as string,
          color: r[3] as string,
          teacher: (r[4] as string) || "Teacher"
        }));
        setTodaysClasses(classes);

        // Fetch Class Rank
        const rankRes = await turso.execute({
          sql: "SELECT r.studentId, SUM(r.marksObtained) as total FROM results r JOIN users u ON r.studentId = u.id WHERE u.batch = ? GROUP BY r.studentId ORDER BY total DESC",
          args: [batch]
        });
        let myRank = "N/A";
        rankRes.rows.forEach((r, i) => {
          if (r[0] === targetStudentId) myRank = `#${i + 1}`;
        });
        setClassRank(myRank);

        // Fetch Pending HW
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
        setPendingHw(Math.max(0, totalHw - submittedHw));

        // Fetch Real Attendance
        const attRes = await turso.execute({
          sql: "SELECT status FROM student_attendance WHERE studentId = ?",
          args: [targetStudentId]
        });
        if (attRes.rows.length > 0) {
          const present = attRes.rows.filter(r => r[0] === 'Present').length;
          setAttendancePercent(Math.round((present / attRes.rows.length) * 100));
        } else {
          setAttendancePercent(100); // Default if no attendance taken yet
        }

      } catch (e) {
        console.error("Parent Dashboard error:", e);
      }
    };
    
    fetchParentData();
  }, [user, batch])
  );

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient 
        colors={["#F59E0B", "#D97706"]} 
        style={[styles.header, { paddingTop: topPad + 10 }]}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      >
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />

        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>Welcome, {user?.name?.split(" ")[0] ?? "Parent"}</Text>
            <View style={styles.childBadge}>
              <Ionicons name="person" size={12} color="#FFF" style={{marginRight: 4}} />
              <Text style={styles.childBadgeText}>Viewing: {childName}</Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            <TouchableOpacity onPress={() => router.push("/(parent)/notifications")} activeOpacity={0.7}>
              <BlurView intensity={30} tint="light" style={styles.activityBtn}>
                <Ionicons name="notifications" size={22} color="#FFFFFF" />
                <View style={styles.notificationDot} />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => router.push("/(parent)/profile")} style={styles.avatarWrap}>
              {user?.avatar === 'boy' ? (
                <Image source={{ uri: "https://avatar.iran.liara.run/public/boy" }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : user?.avatar === 'girl' ? (
                <Image source={{ uri: "https://avatar.iran.liara.run/public/girl" }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : user?.avatar && user.avatar.length > 2 ? (
                <Image source={{ uri: user.avatar }} style={styles.avatarImage} contentFit="cover" transition={200} />
              ) : (
                <View style={[styles.avatarImage, { backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" }]}>
                  <Text style={{ color: "#FFF", fontSize: 18, fontFamily: "Poppins_700Bold" }}>{user?.avatar || user?.name?.charAt(0) || "P"}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* OVERDUE ALERTS */}
        {overdueFee && (
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.alertCard}>
            <View style={styles.alertIconWrap}>
              <Ionicons name="alert-circle" size={24} color="#DC2626" />
            </View>
            <View style={styles.alertInfo}>
              <Text style={styles.alertTitle}>Fee Overdue</Text>
              <Text style={styles.alertDesc}>₹{overdueFee.amount} is overdue by {overdueFee.days} days.</Text>
            </View>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); router.push("/(parent)/fees"); }} style={styles.alertBtn}>
              <Text style={styles.alertBtnText}>Pay Now</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* QUICK STATS */}
        <View style={styles.statsGrid}>
          <Animated.View entering={FadeInRight.delay(200).springify()} style={[styles.statBox, { borderLeftColor: "#3B82F6" }]}>
            <Ionicons name="calendar" size={20} color="#3B82F6" />
            <Text style={styles.statVal}>{attendancePercent}%</Text>
            <Text style={styles.statLabel}>Attendance</Text>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(300).springify()} style={[styles.statBox, { borderLeftColor: "#10B981" }]}>
            <Ionicons name="podium" size={20} color="#10B981" />
            <Text style={styles.statVal}>{performance}</Text>
            <Text style={styles.statLabel}>Grade</Text>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(400).springify()} style={[styles.statBox, { borderLeftColor: "#8B5CF6" }]}>
            <Ionicons name="trophy" size={20} color="#8B5CF6" />
            <Text style={styles.statVal}>{classRank}</Text>
            <Text style={styles.statLabel}>Class Rank</Text>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(500).springify()} style={[styles.statBox, { borderLeftColor: "#EF4444" }]}>
            <Ionicons name="document-text" size={20} color="#EF4444" />
            <Text style={styles.statVal}>{pendingHw}</Text>
            <Text style={styles.statLabel}>Pending HW</Text>
          </Animated.View>
        </View>

        {/* TODAY'S SCHEDULE */}
        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Today's Lectures</Text>
            <Text style={styles.sectionSubtitle}>{todaysClasses.length} {todaysClasses.length === 1 ? 'class' : 'classes'} scheduled</Text>
          </View>
          
          {todaysClasses.length > 0 ? (
            todaysClasses.map((cls, i) => (
              <View key={cls.id} style={styles.classCard}>
                <View style={[styles.timeCol, { borderRightColor: cls.color }]}>
                  <Text style={styles.classTime}>{(cls.time || "TBD").split(" - ")[0]}</Text>
                  <Text style={styles.classTimeSub}>{(cls.time || "").split(" - ")[1] || ""}</Text>
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.classTitle}>{cls.title}</Text>
                  <Text style={styles.classTeacher}><Ionicons name="person" size={12}/> {cls.teacher}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyBox}>
              <Ionicons name="calendar-clear" size={32} color="#CBD5E1" />
              <Text style={styles.emptyText}>No classes scheduled for today.</Text>
            </View>
          )}
        </Animated.View>

        {/* QUICK NAVIGATION */}
        <Animated.View entering={FadeInDown.delay(600).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Links</Text>
          <View style={styles.quickGrid}>
            <TouchableOpacity onPress={() => router.push("/(parent)/results")} style={styles.quickItem}>
              <View style={[styles.quickIcon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="bar-chart" size={24} color="#3B82F6" />
              </View>
              <Text style={styles.quickText}>Full Results</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={() => router.push("/(parent)/fees")} style={styles.quickItem}>
              <View style={[styles.quickIcon, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="wallet" size={24} color="#F59E0B" />
              </View>
              <Text style={styles.quickText}>Fee Portal</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  decoCircle1: {
    position: "absolute", top: -50, right: -50,
    width: 150, height: 150, borderRadius: 75,
    backgroundColor: "rgba(255,255,255,0.15)",
  },
  decoCircle2: {
    position: "absolute", bottom: -30, left: -20,
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  greeting: { fontFamily: "Poppins_700Bold", fontSize: 22, color: "#FFFFFF", marginBottom: 6 },
  childBadge: { 
    flexDirection: "row", alignItems: "center", 
    backgroundColor: "rgba(0,0,0,0.2)", 
    paddingHorizontal: 10, paddingVertical: 4, 
    borderRadius: 12, alignSelf: "flex-start"
  },
  childBadgeText: { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: "#FFFFFF" },
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
  avatarWrap: {
    width: 44, height: 44, borderRadius: 22,
    borderWidth: 2, borderColor: "rgba(255,255,255,0.5)",
    overflow: "hidden"
  },
  avatarImage: { width: "100%", height: "100%" },
  scroll: { padding: 20 },
  
  alertCard: {
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FECACA",
    marginBottom: 20,
  },
  alertIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FEE2E2", alignItems: "center", justifyContent: "center", marginRight: 12 },
  alertInfo: { flex: 1 },
  alertTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#991B1B" },
  alertDesc: { fontFamily: "Poppins_400Regular", fontSize: 13, color: "#B91C1C" },
  alertBtn: { backgroundColor: "#DC2626", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  alertBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 13, color: "#FFF" },

  statsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 24 },
  statBox: {
    width: "48%", backgroundColor: "#FFF", borderRadius: 16,
    padding: 16, alignItems: "center",
    borderLeftWidth: 4,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  statVal: { fontFamily: "Poppins_700Bold", fontSize: 20, color: "#1E293B", marginTop: 8 },
  statLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "#64748B", textAlign: "center" },

  section: { marginBottom: 24 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 12 },
  sectionTitle: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#1E293B" },
  sectionSubtitle: { fontFamily: "Poppins_500Medium", fontSize: 13, color: "#64748B" },

  classCard: {
    flexDirection: "row", backgroundColor: "#FFF", borderRadius: 16,
    marginBottom: 12, overflow: "hidden",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  timeCol: { width: 85, padding: 16, backgroundColor: "#F8FAFC", borderRightWidth: 3, alignItems: "center", justifyContent: "center" },
  classTime: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#1E293B" },
  classTimeSub: { fontFamily: "Poppins_500Medium", fontSize: 11, color: "#64748B" },
  classInfo: { flex: 1, padding: 16, justifyContent: "center" },
  classTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#1E293B", marginBottom: 4 },
  classTeacher: { fontFamily: "Poppins_500Medium", fontSize: 13, color: "#64748B" },

  emptyBox: { alignItems: "center", padding: 30, backgroundColor: "#FFF", borderRadius: 16, borderStyle: "dashed", borderWidth: 1, borderColor: "#E2E8F0" },
  emptyText: { fontFamily: "Poppins_500Medium", fontSize: 14, color: "#94A3B8", marginTop: 8 },

  quickGrid: { flexDirection: "row", gap: 12 },
  quickItem: {
    flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 16, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  quickIcon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  quickText: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#1E293B" }
});
