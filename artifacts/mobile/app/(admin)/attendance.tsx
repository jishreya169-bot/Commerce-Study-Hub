import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { FadeInDown, Layout } from "react-native-reanimated";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { turso } from "@/lib/turso";
import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import CalendarModal from "@/components/CalendarModal";

interface Teacher {
  id: string;
  name: string;
  status: "Present" | "Absent" | "Late" | "Leave" | "Pending";
}

export default function StaffAttendanceAdmin() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      // 1. Create table if not exists
      await turso.execute(`
        CREATE TABLE IF NOT EXISTS teacher_attendance (
          id TEXT PRIMARY KEY,
          teacherId TEXT,
          date TEXT,
          status TEXT,
          UNIQUE(teacherId, date)
        )
      `);

      // 2. Fetch all teachers
      const tRes = await turso.execute("SELECT id, name FROM users WHERE role = 'teacher'");
      
      // 3. Fetch today's attendance
      const aRes = await turso.execute({
        sql: "SELECT teacherId, status FROM teacher_attendance WHERE date = ?",
        args: [selectedDate]
      });

      const attMap: Record<string, string> = {};
      aRes.rows.forEach(r => {
        attMap[r[0] as string] = r[1] as string;
      });

      const data: Teacher[] = tRes.rows.map(r => ({
        id: r[0] as string,
        name: r[1] as string,
        status: (attMap[r[0] as string] as any) || "Pending"
      }));

      setTeachers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [selectedDate]);

  const markAttendance = async (teacherId: string, status: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      const id = teacherId + "_" + selectedDate;
      await turso.execute({
        sql: "INSERT INTO teacher_attendance (id, teacherId, date, status) VALUES (?, ?, ?, ?) ON CONFLICT(teacherId, date) DO UPDATE SET status = excluded.status",
        args: [id, teacherId, selectedDate, status]
      });
      setTeachers(prev => prev.map(t => t.id === teacherId ? { ...t, status: status as any } : t));
    } catch (e) {
      console.error("Attendance Error:", e);
      alert("Failed to mark attendance");
    }
  };

  const markAllPresent = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const pendingTeachers = teachers.filter(t => t.status !== "Present");
    
    // Optimistic UI Update
    setTeachers(prev => prev.map(t => ({ ...t, status: "Present" })));

    for (const t of pendingTeachers) {
      const id = t.id + "_" + selectedDate;
      await turso.execute({
        sql: "INSERT INTO teacher_attendance (id, teacherId, date, status) VALUES (?, ?, ?, ?) ON CONFLICT(teacherId, date) DO UPDATE SET status = excluded.status",
        args: [id, t.id, selectedDate, "Present"]
      });
    }
  };

  // Stats
  const present = teachers.filter(t => t.status === "Present").length;
  const absent = teachers.filter(t => t.status === "Absent").length;
  const late = teachers.filter(t => t.status === "Late").length;
  const leave = teachers.filter(t => t.status === "Leave").length;
  const total = teachers.length;

  const filtered = teachers.filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const StatusButton = ({ teacher, type, color, icon }: { teacher: Teacher, type: string, color: string, icon: string }) => {
    const isActive = teacher.status === type;
    return (
      <TouchableOpacity 
        style={[styles.statusBtn, { backgroundColor: isActive ? color : "#F3F4F6", borderColor: isActive ? color : "#E5E7EB" }]}
        onPress={() => markAttendance(teacher.id, type)}
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
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Staff Attendance</Text>
          <TouchableOpacity style={styles.dateBtn} onPress={() => { Haptics.selectionAsync(); setIsCalendarVisible(true); }}>
            <Ionicons name="calendar" size={20} color="#38BDF8" />
          </TouchableOpacity>
        </View>

        {/* DATE SELECTOR STRIP */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dateScroll}>
          {Array.from({ length: 15 }).map((_, i) => {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - i);
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
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* STATS OVERVIEW */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: "#38BDF8" }]}>
            <Ionicons name="school" size={24} color="#FFF" />
            <Text style={styles.statCardValWhite}>{total}</Text>
            <Text style={styles.statCardLabelWhite}>Total Staff</Text>
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
              placeholder="Search staff..." 
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
            {filtered.map((t, i) => (
              <Animated.View key={t.id} entering={FadeInDown.delay(i * 50).springify()} layout={Layout.springify()} style={styles.teacherCard}>
                <View style={styles.teacherInfo}>
                  <Image source={{ uri: `https://ui-avatars.com/api/?name=${encodeURIComponent(t.name)}&background=F3F4F6&color=38BDF8` }} style={styles.avatar} />
                  <View>
                    <Text style={styles.teacherName}>{t.name}</Text>
                    <Text style={styles.teacherId}>ID: {t.id.toUpperCase()}</Text>
                  </View>
                </View>
                
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.controlsScroll}>
                  <StatusButton teacher={t} type="Present" color="#22C55E" icon="checkmark-circle" />
                  <StatusButton teacher={t} type="Absent" color="#EF4444" icon="close-circle" />
                  <StatusButton teacher={t} type="Late" color="#F59E0B" icon="time" />
                  <StatusButton teacher={t} type="Leave" color="#8B5CF6" icon="medkit" />
                </ScrollView>
              </Animated.View>
            ))}
            
            {filtered.length === 0 && (
              <View style={styles.emptyBox}>
                <Ionicons name="people-outline" size={40} color="#9CA3AF" />
                <Text style={styles.emptyText}>No staff found.</Text>
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
  teacherCard: { backgroundColor: "#FFFFFF", borderRadius: 20, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.03, shadowRadius: 10, elevation: 2 },
  teacherInfo: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  teacherName: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#111827" },
  teacherId: { fontFamily: "Poppins_400Regular", fontSize: 12, color: "#6B7280" },
  
  controlsScroll: { gap: 8 },
  statusBtn: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100, borderWidth: 1, gap: 6 },
  statusBtnText: { fontFamily: "Poppins_600SemiBold", fontSize: 13 },

  emptyBox: { alignItems: "center", padding: 40 },
  emptyText: { fontFamily: "Poppins_500Medium", fontSize: 15, color: "#9CA3AF", marginTop: 12 }
});


