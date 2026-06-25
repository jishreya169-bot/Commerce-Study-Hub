import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform, KeyboardAvoidingView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { turso } from "../../lib/turso";
import DropdownSelector, { DropdownOption } from "../../components/DropdownSelector";
import DateTimePicker from "../../components/DateTimePicker";
import WeeklyTimetableGrid from "../../components/WeeklyTimetableGrid";
import { sendRemotePushNotification } from "../../lib/notifications";

// Generate dates for horizontal calendar
const generateDates = (days: number = 14) => {
  const dates = [];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push(d);
  }
  return dates;
};

const DAYS_OF_WEEK = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const COLORS = ["#0EA5E9", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#6366F1"];

export default function AdminTimetable() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // State
  const [viewMode, setViewMode] = useState<"calendar" | "recurring" | "weekly_grid">("weekly_grid");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const datesList = useState(generateDates())[0];
  
  const [schedule, setSchedule] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formTitle, setFormTitle] = useState("");
  const [formType, setFormType] = useState<"one-time" | "recurring">("one-time");
  const [formBatch, setFormBatch] = useState("");
  const [formTeacher, setFormTeacher] = useState("");
  const [formDayOfWeek, setFormDayOfWeek] = useState(DAYS_OF_WEEK[new Date().getDay()]);
  const [formDate, setFormDate] = useState(new Date().toISOString().split("T")[0]); // YYYY-MM-DD
  const [formStartTime, setFormStartTime] = useState("10:00 AM");
  const [formEndTime, setFormEndTime] = useState("11:00 AM");

  // Options
  const [classesList, setClassesList] = useState<DropdownOption[]>([]);
  const [teachersList, setTeachersList] = useState<DropdownOption[]>([]);

  useEffect(() => {
    fetchOptions();
    fetchSchedule();
  }, [selectedDate, viewMode]);

  const fetchOptions = async () => {
    try {
      const cRes = await turso.execute("SELECT name FROM classes");
      setClassesList(cRes.rows.map(r => ({ id: r[0] as string, label: r[0] as string })));

      const tRes = await turso.execute("SELECT id, name FROM users WHERE role = 'teacher'");
      setTeachersList(tRes.rows.map(r => ({ id: r[0] as string, label: r[1] as string })));
    } catch (e) {
      console.error("Fetch options error", e);
    }
  };

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      if (viewMode === "calendar") {
        const dateStr = selectedDate.toISOString().split("T")[0];
        const dayStr = DAYS_OF_WEEK[selectedDate.getDay()];
        
        const res = await turso.execute({
          sql: "SELECT t.id, t.title, t.batch, t.startTime, t.endTime, t.type, t.color, u.name as teacherName FROM timetable t LEFT JOIN users u ON t.teacherId = u.id WHERE (t.type = 'one-time' AND t.date = ?) OR (t.type = 'recurring' AND t.dayOfWeek = ?) ORDER BY t.startTime ASC",
          args: [dateStr, dayStr]
        });
        
        setSchedule(res.rows.map(r => ({
          id: r[0], title: r[1], batch: r[2], startTime: r[3], endTime: r[4], type: r[5], color: r[6], teacherName: r[7]
        })));
      } else {
        const res = await turso.execute("SELECT t.id, t.title, t.batch, t.startTime, t.endTime, t.type, t.color, u.name as teacherName, t.dayOfWeek FROM timetable t LEFT JOIN users u ON t.teacherId = u.id WHERE t.type = 'recurring' ORDER BY t.dayOfWeek ASC, t.startTime ASC");
        setSchedule(res.rows.map(r => ({
          id: r[0], title: r[1], batch: r[2], startTime: r[3], endTime: r[4], type: r[5], color: r[6], teacherName: r[7], dayOfWeek: r[8]
        })));
      }
    } catch (e) {
      console.error("Fetch schedule error", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveClass = async () => {
    if (!formTitle || !formBatch) {
      alert("Please enter title and select a batch.");
      return;
    }
    setSaving(true);
    try {
      const id = Date.now().toString() + Math.random().toString();
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      await turso.execute({
        sql: "INSERT INTO timetable (id, title, batch, type, date, dayOfWeek, startTime, endTime, color, teacherId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
        args: [
          id, formTitle, formBatch, formType, 
          formType === "one-time" ? formDate : null, 
          formType === "recurring" ? formDayOfWeek : null, 
          formStartTime, formEndTime, color, formTeacher || null
        ]
      });

      // Fetch tokens and send notification
      const usersRes = await turso.execute({
        sql: "SELECT pushToken FROM users WHERE pushToken IS NOT NULL AND role = 'student' AND batch = ?",
        args: [formBatch]
      });
      const tokens = usersRes.rows.map(r => r[0] as string);
      if (tokens.length > 0) {
        const classTime = formType === "one-time" ? `${formDate} at ${formStartTime}` : `Every ${formDayOfWeek} at ${formStartTime}`;
        await sendRemotePushNotification(
          tokens, 
          "📅 New Class Scheduled!", 
          `${formTitle} has been scheduled for ${classTime}.`, 
          { target: formBatch }
        );
      }
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowAddForm(false);
      setFormTitle("");
      fetchSchedule();
    } catch (e) {
      console.error(e);
      alert("Failed to save class");
    } finally {
      setSaving(false);
    }
  };

  const deleteClass = async (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      await turso.execute({ sql: "DELETE FROM timetable WHERE id = ?", args: [id] });
      fetchSchedule();
    } catch(e) { console.error(e); }
  };

  // ==========================
  // ADD FORM VIEW
  // ==========================
  if (showAddForm) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
        <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Schedule Class</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formCard}>
            
            <View style={styles.formToggleRow}>
              <TouchableOpacity style={[styles.formToggleBtn, formType === "one-time" && styles.formToggleActive]} onPress={() => setFormType("one-time")}>
                <Text style={[styles.formToggleText, formType === "one-time" && styles.formToggleTextActive]}>One-Time Class</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.formToggleBtn, formType === "recurring" && styles.formToggleActive]} onPress={() => setFormType("recurring")}>
                <Text style={[styles.formToggleText, formType === "recurring" && styles.formToggleTextActive]}>Recurring (Fixed)</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Class Title / Subject</Text>
              <TextInput style={styles.input} placeholder="e.g. Accounts Chapter 4" value={formTitle} onChangeText={setFormTitle} placeholderTextColor="#94A3B8" />
            </View>

            {formType === "one-time" ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Date</Text>
                <DateTimePicker
                  value={formDate}
                  onChange={setFormDate}
                  mode="date"
                  placeholder="Select Date"
                />
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Day of the Week</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: "row" }}>
                  {DAYS_OF_WEEK.map(day => (
                    <TouchableOpacity key={day} style={[styles.chip, formDayOfWeek === day && styles.chipActive]} onPress={() => setFormDayOfWeek(day)}>
                      <Text style={[styles.chipText, formDayOfWeek === day && styles.chipTextActive]}>{day}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Start Time</Text>
                <DateTimePicker
                  value={formStartTime}
                  onChange={setFormStartTime}
                  mode="time"
                  placeholder="10:00 AM"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>End Time</Text>
                <DateTimePicker
                  value={formEndTime}
                  onChange={setFormEndTime}
                  mode="time"
                  placeholder="11:30 AM"
                />
              </View>
            </View>

            <DropdownSelector
              label="Select Batch"
              placeholder="Select a batch..."
              options={classesList}
              selectedValue={formBatch}
              onSelect={setFormBatch}
              icon="school"
            />

            <DropdownSelector
              label="Assign Teacher (Optional)"
              placeholder="Select a teacher..."
              options={[{ id: "", label: "None" }, ...teachersList]}
              selectedValue={formTeacher}
              onSelect={setFormTeacher}
              icon="person"
            />

            <TouchableOpacity style={[styles.submitBtn, saving && { opacity: 0.7 }]} onPress={handleSaveClass} disabled={saving}>
              {saving ? (
                <Text style={styles.submitText}>Saving...</Text>
              ) : (
                <Text style={styles.submitText}>Save Class to Timetable</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ==========================
  // LIST VIEW
  // ==========================
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
          <Text style={styles.headerTitle}>Timetable</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => { Haptics.selectionAsync(); setShowAddForm(true); }}>
            <Ionicons name="add" size={24} color="#0EA5E9" />
          </TouchableOpacity>
        </View>

        {/* View Toggle */}
        <View style={styles.toggleRow}>
          <TouchableOpacity style={[styles.toggleBtn, viewMode === "calendar" && styles.toggleActive]} onPress={() => { Haptics.selectionAsync(); setViewMode("calendar"); }}>
            <Text style={[styles.toggleText, viewMode === "calendar" && styles.toggleTextActive]}>Daily</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, viewMode === "recurring" && styles.toggleActive]} onPress={() => { Haptics.selectionAsync(); setViewMode("recurring"); }}>
            <Text style={[styles.toggleText, viewMode === "recurring" && styles.toggleTextActive]}>Fixed</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, viewMode === "weekly_grid" && styles.toggleActive]} onPress={() => { Haptics.selectionAsync(); setViewMode("weekly_grid"); }}>
            <Text style={[styles.toggleText, viewMode === "weekly_grid" && styles.toggleTextActive]}>Grid View</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* HORIZONTAL CALENDAR (Only in Calendar View) */}
      {viewMode === "calendar" && (
        <View style={styles.calendarStrip}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
            {datesList.map((d, i) => {
              const isSelected = d.toDateString() === selectedDate.toDateString();
              const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
              const dayNum = d.getDate();
              return (
                <TouchableOpacity 
                  key={i} 
                  style={[styles.dateCard, isSelected && styles.dateCardActive]}
                  onPress={() => { Haptics.selectionAsync(); setSelectedDate(d); }}
                >
                  <Text style={[styles.dateDayName, isSelected && { color: "#FFFFFF" }]}>{dayName}</Text>
                  <Text style={[styles.dateNum, isSelected && { color: "#FFFFFF" }]}>{dayNum}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* SCHEDULE LIST OR GRID */}
      {viewMode === "weekly_grid" ? (
        <View style={{ flex: 1, padding: 20 }}>
          <WeeklyTimetableGrid schedule={schedule} />
        </View>
      ) : (
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {viewMode === "calendar" ? selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : "All Recurring Classes"}
          </Text>
          
          {loading ? (
            <Text style={{ padding: 20, textAlign: "center", color: "#94A3B8" }}>Loading schedule...</Text>
          ) : schedule.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={48} color="#CBD5E1" />
              <Text style={styles.emptyText}>No classes scheduled.</Text>
            </View>
          ) : (
            <View style={{ gap: 16 }}>
              {schedule.map((s, i) => (
                <Animated.View key={s.id as string} entering={FadeInRight.delay(i * 100).springify()} style={styles.classCard}>
                  <View style={[styles.classColorStrip, { backgroundColor: (s.color as string) || "#0EA5E9" }]} />
                  <View style={styles.classContent}>
                    <View style={styles.classHeader}>
                      <Text style={styles.classTime}>{s.startTime} - {s.endTime}</Text>
                      {viewMode === "recurring" && <View style={styles.badge}><Text style={styles.badgeText}>{s.dayOfWeek}</Text></View>}
                    </View>
                    <Text style={styles.classTitle}>{s.title}</Text>
                    <View style={styles.classMeta}>
                      <View style={styles.metaBadge}><Text style={styles.metaBadgeText}>{s.batch}</Text></View>
                      {s.teacherName && <Text style={styles.teacherName}><Ionicons name="person" size={12}/> {s.teacherName}</Text>}
                    </View>
                  </View>
                  <TouchableOpacity style={styles.deleteBtn} onPress={() => deleteClass(s.id as string)}>
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" }, 
  
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  
  toggleRow: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 16, padding: 6 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 12 },
  toggleActive: { backgroundColor: "#FFFFFF" },
  toggleText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "rgba(255,255,255,0.8)" },
  toggleTextActive: { color: "#0EA5E9" },

  calendarStrip: { marginTop: -10, zIndex: 10, paddingBottom: 10 },
  dateCard: { width: 56, height: 72, backgroundColor: "#FFFFFF", borderRadius: 16, justifyContent: "center", alignItems: "center", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3, borderWidth: 1, borderColor: "#F1F5F9" },
  dateCardActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  dateDayName: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B", marginBottom: 4, textTransform: "uppercase" },
  dateNum: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" },

  scroll: { paddingBottom: 100, paddingTop: 16 },
  section: { paddingHorizontal: 20 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 16 },
  
  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 40 },
  emptyText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#94A3B8", marginTop: 12 },

  classCard: { flexDirection: "row", backgroundColor: "#FFFFFF", borderRadius: 20, overflow: "hidden", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  classColorStrip: { width: 6 },
  classContent: { flex: 1, padding: 16 },
  classHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 6 },
  classTime: { fontSize: 13, fontFamily: "Poppins_700Bold", color: "#64748B" },
  badge: { backgroundColor: "#F1F5F9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  badgeText: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#475569" },
  classTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 10 },
  classMeta: { flexDirection: "row", alignItems: "center", gap: 10 },
  metaBadge: { backgroundColor: "#F0FDF4", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },
  metaBadgeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#16A34A" },
  teacherName: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },
  deleteBtn: { padding: 16, justifyContent: "center", alignItems: "center" },

  // FORM STYLES
  formScroll: { padding: 20, paddingBottom: 60 },
  formCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },

  formToggleRow: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 12, padding: 4, marginBottom: 20 },
  formToggleBtn: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
  formToggleActive: { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  formToggleText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748B" },
  formToggleTextActive: { color: "#0EA5E9" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  
  chip: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: "#F1F5F9", borderWidth: 1, borderColor: "#E2E8F0", marginRight: 8, marginBottom: 8 },
  chipActive: { backgroundColor: "#0EA5E9", borderColor: "#0EA5E9" },
  chipText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#64748B" },
  chipTextActive: { color: "#FFFFFF" },

  submitBtn: { backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
});




