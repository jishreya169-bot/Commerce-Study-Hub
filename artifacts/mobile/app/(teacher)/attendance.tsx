import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeIn, Layout } from "react-native-reanimated";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { turso } from "@/lib/turso";
import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import CalendarModal from "@/components/CalendarModal";
import { triggerAbsentNotification } from "../../lib/notifications";

// Dynamic batches will be fetched from DB

interface Student {
  id: string;
  name: string;
  phone: string;
  status: "Present" | "Absent" | "Pending";
}

export default function StudentAttendanceAdmin() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [batches, setBatches] = useState<string[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchBatchesAndAttendance = async () => {
    setLoading(true);
    try {
      // 0. Fetch available batches
      const bRes = await turso.execute("SELECT DISTINCT batch FROM users WHERE role = 'student' AND batch IS NOT NULL AND batch != ''");
      const fetchedBatches = bRes.rows.map(r => r[0] as string);
      
      let currentBatch = selectedBatch;
      if (fetchedBatches.length > 0) {
        setBatches(fetchedBatches);
        if (!currentBatch || !fetchedBatches.includes(currentBatch)) {
          currentBatch = fetchedBatches[0];
          setSelectedBatch(currentBatch);
        }
      } else {
         setLoading(false);
         return; // No batches found
      }

      // 1. Fetch Students in Batch
      const sRes = await turso.execute({
        sql: "SELECT id, name, phone FROM users WHERE role = 'student' AND batch = ?",
        args: [currentBatch]
      });

      // 2. Fetch Attendance for Date & Batch
      const aRes = await turso.execute({
        sql: "SELECT studentId, status FROM student_attendance WHERE batch = ? AND date = ?",
        args: [currentBatch, selectedDate]
      });

      const attMap: Record<string, string> = {};
      aRes.rows.forEach(r => {
        attMap[r[0] as string] = r[1] as string;
      });

      const data: Student[] = sRes.rows.map(r => ({
        id: r[0] as string,
        name: r[1] as string,
        phone: (r[2] as string) || "",
        status: (attMap[r[0] as string] as any) || "Pending"
      }));

      setStudents(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBatchesAndAttendance();
  }, [selectedBatch, selectedDate]);

  const markAttendance = async (studentId: string, status: string, studentName: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const id = studentId + "_" + selectedDate;
      await turso.execute({
        sql: "INSERT INTO student_attendance (id, studentId, batch, date, status, markedBy) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(studentId, date) DO UPDATE SET status = excluded.status",
        args: [id, studentId, selectedBatch, selectedDate, status, user?.id || "admin"]
      });
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: status as any } : s));

      // Trigger push notification if marked absent
      if (status === "Absent") {
        triggerAbsentNotification(studentName, selectedDate).catch(console.error);
      }
    } catch (e) {
      console.error(e);
      alert("Failed to save attendance.");
    }
  };

  const markAllPresent = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const pendingStudents = students.filter(s => s.status !== "Present");
    
    // Optimistic UI Update
    setStudents(prev => prev.map(s => ({ ...s, status: "Present" })));

    for (const s of pendingStudents) {
      const id = s.id + "_" + selectedDate;
      await turso.execute({
        sql: "INSERT INTO student_attendance (id, studentId, batch, date, status, markedBy) VALUES (?, ?, ?, ?, ?, ?) ON CONFLICT(studentId, date) DO UPDATE SET status = excluded.status",
        args: [id, s.id, selectedBatch, selectedDate, "Present", user?.id || "admin"]
      });
    }
  };

  const handleSendAbsentSMS = (studentName: string, phone: string) => {
    if (!phone) {
      alert("No phone number registered for this student.");
      return;
    }
    const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
    const message = `Dear Parent, your child ${studentName} is absent from class today (${formattedDate}). Regards, Commerce Study Hub.`;
    const url = `sms:${phone}?body=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(err => console.error("Error opening SMS app", err));
  };

  // Stats
  const present = students.filter(s => s.status === "Present").length;
  const absent = students.filter(s => s.status === "Absent").length;
  const total = students.length;
  const attPercent = total > 0 ? Math.round((present / total) * 100) : 0;

  const filtered = students.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const StatusButton = ({ student, type, color, icon }: { student: Student, type: string, color: string, icon: string }) => {
    const isActive = student.status === type;
    return (
      <TouchableOpacity 
        style={[styles.statusBtn, { backgroundColor: isActive ? color : "#F3F4F6", borderColor: isActive ? color : "#E5E7EB" }]}
        onPress={() => markAttendance(student.id, type, student.name)}
      >
        <Ionicons name={icon as any} size={14} color={isActive ? "#FFF" : "#6B7280"} />
        <Text style={[styles.statusBtnText, { color: isActive ? "#FFF" : "#6B7280" }]}>{type}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* PREMIUM HEADER */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]}>
        <View style={styles.headerTop}>
          <View style={{ width: 44 }} />
          <Text style={styles.headerTitle}>Attendance</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => { Haptics.selectionAsync(); setIsCalendarVisible(true); }}>
            <Ionicons name="calendar" size={20} color="#38BDF8" />
          </TouchableOpacity>
        </View>

        {/* DATE SELECTOR STRIP */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {Array.from({ length: 15 }).map((_, i) => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - i); // Starts from selected date and goes backwards
            const dateStr = d.toISOString().split("T")[0];
            const isSelected = selectedDate === dateStr;
            const isToday = new Date().toISOString().split("T")[0] === dateStr;
            
            return (
              <TouchableOpacity 
                key={dateStr}
                style={[styles.dateCard, isSelected && styles.dateCardActive]}
                onPress={() => { Haptics.selectionAsync(); setSelectedDate(dateStr); }}
              >
                <Text style={[styles.dateDay, isSelected && styles.dateDayActive]}>{d.toLocaleDateString('en-US', { weekday: 'short' })}</Text>
                <Text style={[styles.dateNum, isSelected && styles.dateNumActive]}>{d.getDate()}</Text>
                {isToday && <View style={[styles.todayDot, isSelected && { backgroundColor: "#FFF" }]} />}
              </TouchableOpacity>
            )
          })}
        </ScrollView>

        {/* BATCH SELECTOR */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.batchScroll}>
          {batches.map((batch) => {
            const isActive = selectedBatch === batch;
            return (
              <TouchableOpacity 
                key={batch} 
                style={[styles.batchPill, isActive && styles.batchPillActive]}
                onPress={() => { Haptics.selectionAsync(); setSelectedBatch(batch); }}
              >
                <Text style={[styles.batchText, isActive && styles.batchTextActive]}>{batch}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* STATS OVERVIEW */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#38BDF8" }]}>
            <Ionicons name="people" size={24} color="#FFF" />
            <Text style={styles.statCardValWhite}>{total}</Text>
            <Text style={styles.statCardLabelWhite}>Total</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: "#DCFCE7" }]}>
              <Ionicons name="checkmark" size={16} color="#22C55E" />
            </View>
            <Text style={styles.statCardVal}>{present}</Text>
            <Text style={styles.statCardLabel}>Present</Text>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIconWrap, { backgroundColor: "#FEE2E2" }]}>
              <Ionicons name="close" size={16} color="#EF4444" />
            </View>
            <Text style={styles.statCardVal}>{absent}</Text>
            <Text style={styles.statCardLabel}>Absent</Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color="#9CA3AF" />
            <TextInput 
              style={styles.searchInput} 
              placeholder="Search student..." 
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#9CA3AF"
            />
          </View>
          <TouchableOpacity style={styles.markAllBtn} onPress={markAllPresent}>
            <Ionicons name="checkmark-done" size={18} color="#FFF" />
            <Text style={styles.markAllText}>Mark All</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator color="#38BDF8" style={{ marginTop: 40 }} />
        ) : (
          <View style={styles.listContainer}>
            {filtered.map((s, i) => (
              <Animated.View key={s.id} entering={FadeInDown.delay(i * 50).springify()} layout={Layout.springify()} style={styles.studentCard}>
                <View style={styles.studentInfo}>
                  <Image source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=F3F4F6&color=38BDF8` }} style={styles.avatar} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <Text style={styles.studentId}>ID: {s.id.toUpperCase()}</Text>
                  </View>
                  {s.status === "Absent" && (
                    <TouchableOpacity onPress={() => handleSendAbsentSMS(s.name, s.phone)} style={styles.smsBtn}>
                      <Ionicons name="chatbubble-ellipses" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  )}
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsScroll}>
                  <StatusButton student={s} type="Present" color="#22C55E" icon="checkmark-circle" />
                  <StatusButton student={s} type="Absent" color="#EF4444" icon="close-circle" />
                </ScrollView>
              </Animated.View>
            ))}
            
            {filtered.length === 0 && (
              <View style={styles.emptyBox}>
                <Ionicons name="people-outline" size={40} color="#9CA3AF" />
                <Text style={styles.emptyText}>No students found.</Text>
              </View>
            )}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      <CalendarModal 
        visible={isCalendarVisible} 
        onClose={() => setIsCalendarVisible(false)} 
        selectedDate={selectedDate} 
        onSelect={(date) => setSelectedDate(date)} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9FAFB" },
  header: {
    backgroundColor: "#FFFFFF",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.05, shadowRadius: 15, elevation: 5,
    paddingBottom: 20,
    zIndex: 10
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, marginBottom: 16 },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 20, color: "#111827" },
  dateBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E0F2FE", alignItems: "center", justifyContent: "center" },
  
  dateScroll: { paddingHorizontal: 20, gap: 12, paddingBottom: 16 },
  dateCard: { width: 55, height: 70, borderRadius: 16, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "center" },
  dateCardActive: { backgroundColor: "#38BDF8", shadowColor: "#38BDF8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  dateDay: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "#6B7280", textTransform: "uppercase" },
  dateDayActive: { color: "rgba(255,255,255,0.9)" },
  dateNum: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#111827", marginTop: 2 },
  dateNumActive: { color: "#FFFFFF" },
  todayDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#38BDF8", marginTop: 4 },

  batchScroll: { paddingHorizontal: 20, gap: 10, paddingBottom: 16 },
  batchPill: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 100, backgroundColor: "#F3F4F6", borderWidth: 1, borderColor: "#E5E7EB" },
  batchPillActive: { backgroundColor: "#38BDF8", borderColor: "#38BDF8" },
  batchText: { fontFamily: "Poppins_500Medium", fontSize: 14, color: "#4B5563" },
  batchTextActive: { color: "#FFFFFF", fontFamily: "Poppins_600SemiBold" },

  scroll: { padding: 20 },
  
  statsContainer: { flexDirection: "row", gap: 12, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2
  },
  statIconWrap: { width: 32, height: 32, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statCardVal: { fontFamily: "Poppins_700Bold", fontSize: 22, color: "#111827" },
  statCardLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "#6B7280" },
  statCardValWhite: { fontFamily: "Poppins_700Bold", fontSize: 22, color: "#FFFFFF", marginTop: 8 },
  statCardLabelWhite: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "rgba(255,255,255,0.9)" },

  actionRow: { flexDirection: "row", gap: 12, marginBottom: 20 },
  searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, height: 50, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 1 },
  searchInput: { flex: 1, marginLeft: 8, fontFamily: "Poppins_500Medium", fontSize: 14, color: "#111827" },
  markAllBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#38BDF8", borderRadius: 16, paddingHorizontal: 16, height: 50, gap: 6, shadowColor: "#38BDF8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  markAllText: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#FFFFFF" },

  listContainer: { gap: 16 },
  studentCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  studentInfo: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  studentName: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#111827" },
  studentId: { fontFamily: "Poppins_400Regular", fontSize: 12, color: "#6B7280" },
  smsBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FEF2F2", alignItems: "center", justifyContent: "center" },
  
  controlsScroll: { gap: 8 },
  statusBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, gap: 6 },
  statusBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },

  emptyBox: { alignItems: "center", padding: 40 },
  emptyText: { fontFamily: "Poppins_500Medium", fontSize: 15, color: "#9CA3AF", marginTop: 12 }
});


