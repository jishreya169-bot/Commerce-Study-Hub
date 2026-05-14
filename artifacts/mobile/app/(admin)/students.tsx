import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const ALL_CLASSES = ["XII-A", "XII-B", "XII-C", "XI-A", "XI-B", "XI-C"];

const INIT_STUDENTS = [
  { id: "s1", name: "Priya Sharma", email: "priya@student.in", roll: "2401", class: "XII-A", avatar: "PS", color: "#5B9BD5", progress: 78, attendance: 94, score: 82, status: "active", enrolled: 3, lastActive: "2 hr ago", joined: "Jul 2024" },
  { id: "s2", name: "Rahul Mehta", email: "rahul@student.in", roll: "2402", class: "XII-A", avatar: "RM", color: "#5BAD9B", progress: 65, attendance: 88, score: 74, status: "active", enrolled: 3, lastActive: "5 hr ago", joined: "Jul 2024" },
  { id: "s3", name: "Ananya Kapoor", email: "ananya@student.in", roll: "2403", class: "XII-B", avatar: "AK", color: "#9B7BC4", progress: 91, attendance: 98, score: 93, status: "active", enrolled: 4, lastActive: "1 hr ago", joined: "Jul 2024" },
  { id: "s4", name: "Vikram Singh", email: "vikram@student.in", roll: "2404", class: "XII-A", avatar: "VS", color: "#D69E2E", progress: 45, attendance: 72, score: 58, status: "at-risk", enrolled: 2, lastActive: "Yesterday", joined: "Jul 2024" },
  { id: "s5", name: "Deepika Nair", email: "deepika@student.in", roll: "2405", class: "XII-B", avatar: "DN", color: "#48BB78", progress: 83, attendance: 96, score: 88, status: "active", enrolled: 4, lastActive: "3 hr ago", joined: "Aug 2024" },
  { id: "s6", name: "Arjun Patel", email: "arjun@student.in", roll: "2406", class: "XII-C", avatar: "AP", color: "#7B8EBF", progress: 52, attendance: 79, score: 61, status: "active", enrolled: 3, lastActive: "2 days ago", joined: "Aug 2024" },
  { id: "s7", name: "Sneha Gupta", email: "sneha@student.in", roll: "2407", class: "XII-C", avatar: "SG", color: "#BF7B5B", progress: 70, attendance: 91, score: 77, status: "active", enrolled: 3, lastActive: "4 hr ago", joined: "Jul 2024" },
  { id: "s8", name: "Karan Verma", email: "karan@student.in", roll: "2408", class: "XI-A", avatar: "KV", color: "#5B9BD5", progress: 55, attendance: 68, score: 60, status: "at-risk", enrolled: 2, lastActive: "3 days ago", joined: "Jul 2024" },
  { id: "s9", name: "Pooja Mishra", email: "pooja@student.in", roll: "2409", class: "XI-B", avatar: "PM", color: "#7B8EBF", progress: 72, attendance: 90, score: 76, status: "active", enrolled: 2, lastActive: "1 day ago", joined: "Aug 2024" },
  { id: "s10", name: "Rohan Das", email: "rohan@student.in", roll: "2410", class: "XI-A", avatar: "RD", color: "#5BAD9B", progress: 60, attendance: 85, score: 68, status: "active", enrolled: 2, lastActive: "6 hr ago", joined: "Aug 2024" },
];

const STATUS_FILTERS = ["All", "Active", "At Risk"];

export default function AdminStudents() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [classFilter, setClassFilter] = useState("All");
  const [selected, setSelected] = useState<typeof INIT_STUDENTS[0] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showAssignClass, setShowAssignClass] = useState(false);
  const [assignTarget, setAssignTarget] = useState<typeof INIT_STUDENTS[0] | null>(null);
  const [students, setStudents] = useState(INIT_STUDENTS);

  // Add student form state
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRoll, setNewRoll] = useState("");
  const [newClass, setNewClass] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const classOptions = ["All", ...Array.from(new Set(students.map((s) => s.class))).sort()];

  const filtered = students.filter((s) => {
    const ms = search === "" || s.name.toLowerCase().includes(search.toLowerCase()) || s.roll.includes(search);
    const mf = statusFilter === "All" || (statusFilter === "Active" && s.status === "active") || (statusFilter === "At Risk" && s.status === "at-risk");
    const mc = classFilter === "All" || s.class === classFilter;
    return ms && mf && mc;
  });

  const assignClass = (studentId: string, cls: string) => {
    setStudents((prev) => prev.map((s) => s.id === studentId ? { ...s, class: cls } : s));
    if (assignTarget?.id === studentId) {
      setAssignTarget((prev) => prev ? { ...prev, class: cls } : prev);
    }
    Haptics.selectionAsync();
  };

  const addStudent = () => {
    if (!newName.trim() || !newRoll.trim()) return;
    const s = {
      id: `s${Date.now()}`, name: newName.trim(), email: newEmail.trim() || "",
      roll: newRoll.trim(), class: newClass.trim() || "XII-A",
      avatar: newName.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
      color: "#9B7BC4", progress: 0, attendance: 0, score: 0,
      status: "active", enrolled: 0, lastActive: "Just joined", joined: "May 2025",
    };
    setStudents((prev) => [...prev, s]);
    setNewName(""); setNewEmail(""); setNewRoll(""); setNewClass("");
    setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Students</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)} style={[styles.addBtn, { backgroundColor: "#9B7BC4" }]} activeOpacity={0.85}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Student</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { val: students.length, label: "Total", color: colors.primary },
          { val: students.filter((s) => s.status === "active").length, label: "Active", color: "#48BB78" },
          { val: students.filter((s) => s.status === "at-risk").length, label: "At Risk", color: "#E53E3E" },
          { val: Math.round(students.filter((s) => s.attendance > 0).reduce((a, s) => a + s.attendance, 0) / students.filter((s) => s.attendance > 0).length) + "%", label: "Avg Attend.", color: "#D69E2E" },
        ].map((s) => (
          <View key={s.label} style={styles.summaryItem}>
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.val}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={15} color={colors.mutedForeground} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search name or roll number…" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setStatusFilter(f)} style={[styles.chip, { backgroundColor: statusFilter === f ? "#9B7BC4" : colors.muted, borderColor: statusFilter === f ? "#9B7BC4" : colors.border }]} activeOpacity={0.8}>
            <Text style={[styles.chipText, { color: statusFilter === f ? "#FFFFFF" : colors.mutedForeground }]}>{f}</Text>
          </TouchableOpacity>
        ))}
        <View style={[styles.chipDivider, { backgroundColor: colors.border }]} />
        {classOptions.map((c) => (
          <TouchableOpacity key={c} onPress={() => setClassFilter(c)} style={[styles.chip, { backgroundColor: classFilter === c ? "#5B9BD5" : colors.muted, borderColor: classFilter === c ? "#5B9BD5" : colors.border }]} activeOpacity={0.8}>
            <Text style={[styles.chipText, { color: classFilter === c ? "#FFFFFF" : colors.mutedForeground }]}>{c}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.map((s) => (
          <TouchableOpacity key={s.id} onPress={() => setSelected(s)} style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: s.status === "at-risk" ? "#E53E3E" : colors.border, borderLeftWidth: s.status === "at-risk" ? 4 : 1 }]} activeOpacity={0.85}>
            <View style={[styles.avatar, { backgroundColor: s.color }]}>
              <Text style={styles.avatarText}>{s.avatar}</Text>
            </View>
            <View style={styles.studentInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.studentName, { color: colors.foreground }]}>{s.name}</Text>
                <View style={[styles.classBadge, { backgroundColor: s.color + "18" }]}>
                  <Text style={[styles.classBadgeText, { color: s.color }]}>{s.class}</Text>
                </View>
                {s.status === "at-risk" && (
                  <View style={[styles.riskBadge, { backgroundColor: "#FFF5F5", borderColor: "#FED7D7" }]}>
                    <Ionicons name="warning" size={9} color="#E53E3E" />
                    <Text style={[styles.riskText, { color: "#E53E3E" }]}>At Risk</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.rollClass, { color: colors.mutedForeground }]}>Roll #{s.roll} • {s.lastActive}</Text>
              <View style={styles.miniStats}>
                <Text style={[styles.miniStat, { color: colors.primary }]}>📊 {s.progress}%</Text>
                <Text style={[styles.miniStat, { color: "#48BB78" }]}>✅ {s.attendance}%</Text>
                <Text style={[styles.miniStat, { color: colors.warning }]}>📝 {s.score}%</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.border} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Student Details</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Ionicons name="close" size={22} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalProfile}>
                  <View style={[styles.bigAvatar, { backgroundColor: selected.color }]}><Text style={styles.bigAvatarText}>{selected.avatar}</Text></View>
                  <Text style={[styles.modalName, { color: colors.foreground }]}>{selected.name}</Text>
                  <View style={[styles.classBadge, { backgroundColor: selected.color + "18" }]}>
                    <Text style={[styles.classBadgeText, { color: selected.color }]}>{selected.class}</Text>
                  </View>
                  <Text style={[styles.modalClass, { color: colors.mutedForeground }]}>Roll #{selected.roll}</Text>
                </View>
                {[
                  { label: "Email", val: selected.email || "—" },
                  { label: "Enrolled Courses", val: `${selected.enrolled}` },
                  { label: "Overall Progress", val: `${selected.progress}%` },
                  { label: "Attendance", val: `${selected.attendance}%` },
                  { label: "Avg Test Score", val: `${selected.score}%` },
                  { label: "Joined", val: selected.joined },
                ].map((r) => (
                  <View key={r.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                    <Text style={[styles.detailVal, { color: colors.foreground }]}>{r.val}</Text>
                  </View>
                ))}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => { setAssignTarget(selected); setSelected(null); setShowAssignClass(true); }}
                    style={[styles.actionBtn, { backgroundColor: "#5B9BD518", borderColor: "#5B9BD530" }]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="school" size={14} color="#5B9BD5" />
                    <Text style={[styles.actionBtnText, { color: "#5B9BD5" }]}>Change Class</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionBtn, { backgroundColor: "#9B7BC418", borderColor: "#9B7BC430" }]}
                    activeOpacity={0.8}
                    onPress={() => setSelected(null)}
                  >
                    <Ionicons name="mail-outline" size={14} color="#9B7BC4" />
                    <Text style={[styles.actionBtnText, { color: "#9B7BC4" }]}>Message</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Assign Class Modal */}
      <Modal visible={showAssignClass} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Assign Class</Text>
              <TouchableOpacity onPress={() => { setShowAssignClass(false); setAssignTarget(null); }}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {assignTarget && (
              <Text style={[styles.assignHint, { color: colors.mutedForeground }]}>
                Select a class for {assignTarget.name} (currently {assignTarget.class})
              </Text>
            )}
            <View style={styles.classGrid}>
              {ALL_CLASSES.map((cls) => {
                const isCurrent = assignTarget?.class === cls;
                return (
                  <TouchableOpacity
                    key={cls}
                    onPress={() => { assignTarget && assignClass(assignTarget.id, cls); }}
                    style={[styles.classOption, { backgroundColor: isCurrent ? "#9B7BC4" : colors.muted, borderColor: isCurrent ? "#9B7BC4" : colors.border }]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={isCurrent ? "checkmark-circle" : "ellipse-outline"} size={15} color={isCurrent ? "#FFFFFF" : colors.mutedForeground} />
                    <Text style={[styles.classOptionText, { color: isCurrent ? "#FFFFFF" : colors.foreground }]}>{cls}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={() => { setShowAssignClass(false); setAssignTarget(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
              style={[styles.submitBtn, { backgroundColor: "#9B7BC4" }]}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Confirm Assignment</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Add Student Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add New Student</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {[
              { label: "Full Name *", val: newName, set: setNewName, ph: "e.g. Ritu Sharma" },
              { label: "Email Address", val: newEmail, set: setNewEmail, ph: "student@school.in" },
              { label: "Roll Number *", val: newRoll, set: setNewRoll, ph: "e.g. 2411" },
              { label: "Class", val: newClass, set: setNewClass, ph: "e.g. XII-A" },
            ].map((f) => (
              <View key={f.label} style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} />
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={addStudent}
              style={[styles.submitBtn, { backgroundColor: "#9B7BC4", opacity: newName.trim() && newRoll.trim() ? 1 : 0.5 }]}
              activeOpacity={0.85}
              disabled={!newName.trim() || !newRoll.trim()}
            >
              <Text style={styles.submitBtnText}>Add Student</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 20, fontFamily: "Poppins_700Bold" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  summaryRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1 },
  summaryItem: { flex: 1, alignItems: "center" },
  summaryVal: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  summaryLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  chipRow: { maxHeight: 52, borderBottomWidth: 1 },
  chip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  chipDivider: { width: 1, marginVertical: 8 },
  scroll: { padding: 16, gap: 0 },
  studentCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatarText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  studentInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  studentName: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  classBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  classBadgeText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  riskBadge: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8, borderWidth: 1 },
  riskText: { fontSize: 9, fontFamily: "Poppins_700Bold" },
  rollClass: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  miniStats: { flexDirection: "row", gap: 10 },
  miniStat: { fontSize: 10, fontFamily: "Poppins_500Medium" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10, maxHeight: "90%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  modalTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalProfile: { alignItems: "center", gap: 3, paddingVertical: 8 },
  bigAvatar: { width: 60, height: 60, borderRadius: 30, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  bigAvatarText: { color: "#FFFFFF", fontSize: 20, fontFamily: "Poppins_700Bold" },
  modalName: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalClass: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1 },
  detailLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  detailVal: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  assignHint: { fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: -4 },
  classGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  classOption: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, minWidth: "28%" },
  classOptionText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginLeft: 2 },
  inputRow: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  input: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  submitBtn: { borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
});
