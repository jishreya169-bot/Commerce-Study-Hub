import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { db } from "../../lib/firebase";
import { turso } from "../../lib/turso";
import { RefreshControl } from "react-native";
import { useAuth } from "@/context/AuthContext";
import DateTimePicker from "../../components/DateTimePicker";
import { Modal, KeyboardAvoidingView, Platform } from "react-native";

interface TimetableClass {
  id: string;
  title: string;
  batch: string;
  time: string;
  color: string;
  students?: number;
  completionRate?: number;
}

const QUICK_ACTIONS = [
  { label: "New Class", icon: "add-circle", colors: ["#DBEAFE", "#BFDBFE"], iconColor: "#2563EB" },
  { label: "Schedule", icon: "calendar", colors: ["#F3E8FF", "#E9D5FF"], iconColor: "#7C3AED" },
  { label: "Resources", icon: "folder", colors: ["#FCE7F3", "#FBCFE8"], iconColor: "#DB2777" },
];

export default function TeacherClasses() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<TimetableClass[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [newEndTime, setNewEndTime] = useState("");
  const [newType, setNewType] = useState<"permanent" | "one-time">("permanent");
  const [newDate, setNewDate] = useState("");
  const [newDays, setNewDays] = useState<string[]>(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
  const [dbClasses, setDbClasses] = useState<any[]>([]);

  const fetchClasses = async () => {
    if (!user?.id) return;
    try {
      let result;
      if (user.role === "admin") {
        result = await turso.execute("SELECT * FROM timetable");
      } else {
        result = await turso.execute({
          sql: "SELECT * FROM timetable WHERE teacherId = ?",
          args: [user.id]
        });
      }
      // Map Turso rows to objects
      const data = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj as TimetableClass;
      });
      setCourses(data);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    // Safely add columns if they don't exist
    const migrateDb = async () => {
      try { await turso.execute("ALTER TABLE timetable ADD COLUMN type TEXT"); } catch (e) {}
      try { await turso.execute("ALTER TABLE timetable ADD COLUMN date TEXT"); } catch (e) {}
      try { await turso.execute("ALTER TABLE timetable ADD COLUMN days TEXT"); } catch (e) {}
      try { await turso.execute("ALTER TABLE timetable ADD COLUMN startTime TEXT"); } catch (e) {}
      try { await turso.execute("ALTER TABLE timetable ADD COLUMN endTime TEXT"); } catch (e) {}
      try { await turso.execute("ALTER TABLE timetable ADD COLUMN dayOfWeek TEXT"); } catch (e) {}
      
      fetchClasses();
      // Fetch DB classes for the picker
      turso.execute("SELECT id, name, subject FROM classes ORDER BY createdAt DESC").then(res => {
        const data = res.rows.map(r => ({ id: r[0] as string, name: r[1] as string, subject: r[2] as string }));
        setDbClasses(data);
        if (data.length > 0 && !newBatch) setNewBatch(data[0].name);
      }).catch(console.error);
    };
    migrateDb();
  }, [user?.id]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchClasses();
    setRefreshing(false);
  }, [user?.id]);

  const handleAddClass = async () => {
    if (!newTitle || !newBatch || !newStartTime || !newEndTime || (newType === "one-time" && !newDate) || (newType === "permanent" && newDays.length === 0)) {
      alert("Please fill all required fields");
      return;
    }
    const timeRange = `${newStartTime} - ${newEndTime}`;
    const insertType = newType === "permanent" ? "recurring" : "one-time";
    
    try {
      if (insertType === "recurring") {
        // Insert a row for each day
        for (const day of newDays) {
          const id = Date.now().toString() + Math.random().toString(36).substring(7);
          await turso.execute({
            sql: "INSERT INTO timetable (id, title, batch, time, startTime, endTime, color, teacherId, type, dayOfWeek) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
              id, newTitle, newBatch, timeRange, newStartTime, newEndTime, "#0EA5E9", user?.id || "",
              insertType, day
            ]
          });
        }
      } else {
        // Insert a single row for one-time
        const id = Date.now().toString();
        await turso.execute({
          sql: "INSERT INTO timetable (id, title, batch, time, startTime, endTime, color, teacherId, type, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
          args: [
            id, newTitle, newBatch, timeRange, newStartTime, newEndTime, "#0EA5E9", user?.id || "",
            insertType, newDate
          ]
        });
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Class scheduled successfully!");
      setShowAddModal(false);
      setNewTitle("");
      setNewStartTime("");
      setNewEndTime("");
      setNewDate("");
      fetchClasses();
    } catch (e) {
      console.error(e);
      alert("Failed to schedule class. Database columns may be missing.");
    }
  };

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Classes</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput style={styles.searchInput} placeholder="Search classes or subjects..." placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />}
      >
        
        {/* QUICK ACTIONS */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Operations</Text>
          </View>
          <View style={styles.qaGrid}>
            {QUICK_ACTIONS.map((q, i) => (
              <TouchableOpacity key={i} onPress={() => {
                Haptics.selectionAsync();
                if (q.label === "New Class") setShowAddModal(true);
                else if (q.label === "Schedule") setShowAddModal(true);
                else if (q.label === "Resources") router.push("/(teacher)/upload");
              }} style={styles.qaCardWrapper}>
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

        {/* CLASSES LIST */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Active Classes</Text>
            <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.cardBlock}>
            {courses.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No classes scheduled.</Text>
              </View>
            )}
            {courses.map((c, i) => (
              <View key={c.id} style={[styles.listItem, i === courses.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listIcon, { backgroundColor: (c.color || "#3B82F6") + "15" }]}>
                  <Ionicons name="book" size={20} color={c.color || "#3B82F6"} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{c.title}</Text>
                  <Text style={styles.listDesc}>{c.batch} • {c.students || 0} Students</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.nextText}>Time</Text>
                  <Text style={[styles.timeText, { color: c.color || "#3B82F6" }]}>{c.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

      </ScrollView>

      {/* ADD CLASS MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" }}>Schedule New Class</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close-circle" size={28} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Class Title</Text>
                <TextInput style={styles.input} placeholder="e.g. Accounting Basics" value={newTitle} onChangeText={setNewTitle} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Batch / Grade</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 4 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {dbClasses.map(c => (
                      <TouchableOpacity 
                        key={c.id} 
                        style={{ paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: newBatch === c.name ? "#0EA5E9" : "#F1F5F9" }}
                        onPress={() => setNewBatch(c.name)}
                      >
                        <Text style={{ fontSize: 12, fontFamily: "Poppins_600SemiBold", color: newBatch === c.name ? "#FFF" : "#64748B" }}>{c.name}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                {dbClasses.length === 0 && (
                  <TextInput style={styles.input} placeholder="e.g. Class 12 - Commerce" value={newBatch} onChangeText={setNewBatch} />
                )}
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Class Type</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity 
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: newType === "permanent" ? "#0EA5E9" : "#F1F5F9", alignItems: "center" }}
                    onPress={() => setNewType("permanent")}
                  >
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: newType === "permanent" ? "#FFF" : "#64748B" }}>Permanent</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: newType === "one-time" ? "#0EA5E9" : "#F1F5F9", alignItems: "center" }}
                    onPress={() => setNewType("one-time")}
                  >
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: newType === "one-time" ? "#FFF" : "#64748B" }}>One-Time</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {newType === "one-time" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Date</Text>
                  <DateTimePicker value={newDate} onChange={setNewDate} mode="date" placeholder="Select Date" />
                </View>
              )}

              {newType === "permanent" && (
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>Days</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => {
                      const isSelected = newDays.includes(day);
                      return (
                        <TouchableOpacity 
                          key={day}
                          style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, backgroundColor: isSelected ? "#0EA5E9" : "#F1F5F9" }}
                          onPress={() => {
                            if (isSelected) setNewDays(prev => prev.filter(d => d !== day));
                            else setNewDays(prev => [...prev, day]);
                          }}
                        >
                          <Text style={{ fontSize: 12, fontFamily: "Poppins_600SemiBold", color: isSelected ? "#FFF" : "#64748B" }}>{day.substring(0,3)}</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Start Time</Text>
                  <DateTimePicker value={newStartTime} onChange={setNewStartTime} mode="time" placeholder="10:00 AM" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>End Time</Text>
                  <DateTimePicker value={newEndTime} onChange={setNewEndTime} mode="time" placeholder="11:30 AM" />
                </View>
              </View>

              <TouchableOpacity style={styles.modalSubmitBtn} onPress={handleAddClass}>
                <Text style={styles.modalSubmitText}>Save Class</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" }, 
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  
  searchContainer: { marginTop: -12, paddingHorizontal: 20, zIndex: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 },

  scroll: { paddingBottom: 100, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },
  seeAll: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" },

  qaGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  qaCardWrapper: { width: "31%", shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  qaCard: { paddingVertical: 18, borderRadius: 24, alignItems: "center" },
  qaIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  qaLabel: { fontSize: 11, fontFamily: "Poppins_700Bold" },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  listRight: { alignItems: "flex-end" },
  nextText: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#94A3B8", marginBottom: 2 },
  timeText: { fontSize: 13, fontFamily: "Poppins_700Bold" },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  modalSubmitBtn: { backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 10 },
  modalSubmitText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
});




