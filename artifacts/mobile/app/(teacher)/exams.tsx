import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "../../lib/turso";
import { useAuth } from "../../context/AuthContext";
import { useTeacherContext } from "../../context/TeacherContext";
import DateTimePicker from "../../components/DateTimePicker";

interface Exam {
  id: string;
  title: string;
  classId: string;
  date: string;
  totalMarks: number;
}

export default function TeacherExams() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeClass } = useTeacherContext();

  const [exams, setExams] = useState<Exam[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  
  // Create exam fields
  const [newTitle, setNewTitle] = useState("");
  const [newClassId, setNewClassId] = useState(activeClass === "All" ? "" : activeClass);
  const [newDate, setNewDate] = useState("");
  const [newMarks, setNewMarks] = useState("");

  // Add Result state
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [marks, setMarks] = useState<Record<string, string>>({});

  const fetchExams = async () => {
    try {
      let q = "SELECT id, title, classId, date, totalMarks FROM exams WHERE teacherId = ?";
      let args: any[] = [user?.id || ""];
      if (activeClass !== "All") {
        q += " AND classId = ?";
        args.push(activeClass);
      }
      q += " ORDER BY createdAt DESC";
      
      const result = await turso.execute({ sql: q, args });
      const data = result.rows.map(r => ({
        id: r[0] as string,
        title: r[1] as string,
        classId: r[2] as string,
        date: r[3] as string,
        totalMarks: r[4] as number
      }));
      setExams(data);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchExams();
    if (activeClass !== "All") setNewClassId(activeClass);
  }, [user, activeClass]);

  const handleAddExam = async () => {
    if (!newTitle || !newClassId || !newDate || !newMarks) {
      alert("Please fill all fields.");
      return;
    }
    try {
      if (editingExam) {
        await turso.execute({
          sql: "UPDATE exams SET title = ?, classId = ?, date = ?, totalMarks = ? WHERE id = ?",
          args: [newTitle, newClassId, newDate, parseInt(newMarks), editingExam.id]
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alert("Exam updated successfully!");
      } else {
        const id = Date.now().toString();
        const createdAt = new Date().toISOString();
        await turso.execute({
          sql: "INSERT INTO exams (id, title, classId, date, totalMarks, teacherId, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
          args: [id, newTitle, newClassId, newDate, parseInt(newMarks), user?.id || "", createdAt]
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alert("Exam created successfully!");
      }
      setShowAddModal(false);
      setEditingExam(null);
      setNewTitle("");
      setNewClassId("");
      setNewDate("");
      setNewMarks("");
      fetchExams();
    } catch (e) {
      console.error(e);
      alert(editingExam ? "Failed to update exam." : "Failed to create exam.");
    }
  };

  const openResultModal = async (exam: Exam) => {
    setSelectedExam(exam);
    try {
      // Fetch students for this batch
      const stuRes = await turso.execute({
        sql: "SELECT id, name FROM users WHERE role = 'student' AND batch = ?",
        args: [exam.classId]
      });
      const stus = stuRes.rows.map(r => ({ id: r[0] as string, name: r[1] as string }));
      setStudents(stus);

      // Fetch existing marks
      const markRes = await turso.execute({
        sql: "SELECT studentId, marksObtained FROM results WHERE examId = ?",
        args: [exam.id]
      });
      const existingMarks: Record<string, string> = {};
      markRes.rows.forEach(r => {
        existingMarks[r[0] as string] = String(r[1]);
      });
      setMarks(existingMarks);
      setShowResultModal(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveMarks = async () => {
    if (!selectedExam) return;
    try {
      await turso.execute({
        sql: "DELETE FROM results WHERE examId = ?",
        args: [selectedExam.id]
      });
      for (const student of students) {
        const m = marks[student.id];
        if (m) {
          const id = Date.now().toString() + Math.random().toString();
          await turso.execute({
            sql: "INSERT INTO results (id, examId, studentId, marksObtained, remarks, createdAt) VALUES (?, ?, ?, ?, ?, ?)",
            args: [id, selectedExam.id, student.id, parseInt(m), "", new Date().toISOString()]
          });
        }
      }
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Results saved successfully!");
      setShowResultModal(false);
      setSelectedExam(null);
      setStudents([]);
      setMarks({});
    } catch (e) {
      console.error(e);
      alert("Failed to save results.");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#D97706", "#B45309"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Exams & Results</Text>
          <TouchableOpacity onPress={() => {
            setEditingExam(null);
            setNewTitle("");
            setNewClassId(activeClass === "All" ? "" : activeClass);
            setNewDate("");
            setNewMarks("");
            setShowAddModal(true);
          }} style={styles.addBtn}>
            <Ionicons name="add" size={24} color="#D97706" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>All Exams</Text>
            <Text style={styles.countBadge}>{exams.length} Exams</Text>
          </View>
          <View style={styles.cardBlock}>
            {exams.length === 0 && (
              <View style={{ padding: 24, alignItems: "center" }}>
                <Ionicons name="document-text-outline" size={40} color="#CBD5E1" />
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8", marginTop: 10 }}>No exams created yet.</Text>
                <Text style={{ fontFamily: "Poppins_400Regular", color: "#CBD5E1", fontSize: 12 }}>Tap + to create your first exam</Text>
              </View>
            )}
            {exams.map((e, i) => (
              <TouchableOpacity key={e.id} style={[styles.listItem, i === exams.length - 1 && { borderBottomWidth: 0 }]} onPress={() => openResultModal(e)}>
                <View style={[styles.listIcon, { backgroundColor: "#FEF3C7" }]}>
                  <Ionicons name="document-text" size={20} color="#D97706" />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{e.title}</Text>
                  <Text style={styles.listDesc}>{e.classId} • {e.date}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.marksLabel}>{e.totalMarks} Marks</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TouchableOpacity onPress={() => {
                      Haptics.selectionAsync();
                      setEditingExam(e);
                      setNewTitle(e.title);
                      setNewClassId(e.classId);
                      setNewDate(e.date);
                      setNewMarks(String(e.totalMarks));
                      setShowAddModal(true);
                    }} style={[styles.addMarksBtn, { backgroundColor: "#F1F5F9" }]}>
                      <Ionicons name="pencil" size={14} color="#64748B" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.addMarksBtn} onPress={() => openResultModal(e)}>
                      <Text style={styles.addMarksBtnText}>Add Results</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* CREATE EXAM MODAL */}
      <Modal visible={showAddModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={styles.modalSheet}>
              <View style={styles.modalHeaderRow}>
                <Text style={styles.modalTitle}>{editingExam ? "Edit Exam" : "Create New Exam"}</Text>
                <TouchableOpacity onPress={() => {
                  setShowAddModal(false);
                  setEditingExam(null);
                }}>
                  <Ionicons name="close-circle" size={28} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Exam Title</Text>
                <TextInput style={styles.input} placeholder="e.g. Accounts Chapter 1 Test" value={newTitle} onChangeText={setNewTitle} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Class / Batch</Text>
                <TextInput style={styles.input} placeholder="e.g. Class 12 - Commerce" value={newClassId} onChangeText={setNewClassId} />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Exam Date</Text>
                <DateTimePicker value={newDate} onChange={setNewDate} mode="date" placeholder="Select Exam Date" />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Total Marks</Text>
                <TextInput style={styles.input} placeholder="e.g. 50" value={newMarks} onChangeText={setNewMarks} keyboardType="numeric" />
              </View>
              <TouchableOpacity style={styles.submitBtn} onPress={handleAddExam}>
                <Text style={styles.submitBtnText}>{editingExam ? "Save Changes" : "Create Exam"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ADD RESULTS MODAL */}
      <Modal visible={showResultModal} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={styles.modalOverlay}>
            <View style={[styles.modalSheet, { maxHeight: "85%" }]}>
              <View style={styles.modalHeaderRow}>
                <View>
                  <Text style={styles.modalTitle}>Add Results</Text>
                  {selectedExam && (
                    <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" }}>
                      {selectedExam.title} • {selectedExam.totalMarks} Marks
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => { setShowResultModal(false); setSelectedExam(null); }}>
                  <Ionicons name="close-circle" size={28} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 400 }}>
                {students.length === 0 && (
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No students found in this class.</Text>
                  </View>
                )}
                {students.map((s, i) => (
                  <View key={s.id} style={[styles.studentRow, i === students.length - 1 && { borderBottomWidth: 0 }]}>
                    <View style={styles.studentAvatar}>
                      <Text style={styles.studentAvatarText}>{s.name.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <Text style={styles.studentName}>{s.name}</Text>
                    <TextInput
                      style={styles.marksInput}
                      placeholder="Marks"
                      placeholderTextColor="#94A3B8"
                      keyboardType="numeric"
                      value={marks[s.id] || ""}
                      onChangeText={(val) => setMarks(prev => ({ ...prev, [s.id]: val }))}
                    />
                  </View>
                ))}
              </ScrollView>

              <TouchableOpacity style={[styles.submitBtn, { backgroundColor: "#D97706" }]} onPress={handleSaveMarks}>
                <Text style={styles.submitBtnText}>Save Results</Text>
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
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },

  scroll: { paddingBottom: 100, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },
  countBadge: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#D97706" },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  listRight: { alignItems: "flex-end", gap: 6 },
  marksLabel: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B" },
  addMarksBtn: { backgroundColor: "#D97706", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  addMarksBtnText: { color: "#FFF", fontSize: 10, fontFamily: "Poppins_600SemiBold" },

  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalSheet: { backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32 },
  modalHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A" },

  submitBtn: { backgroundColor: "#D97706", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 10 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },

  // Result modal student rows
  studentRow: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 12 },
  studentAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", justifyContent: "center", alignItems: "center" },
  studentAvatarText: { fontSize: 14, fontFamily: "Poppins_700Bold", color: "#64748B" },
  studentName: { flex: 1, fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A" },
  marksInput: { width: 75, backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", textAlign: "center" },
});



