import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const TEACHERS = [
  { id: "t1", name: "Prof. Amit Sharma", email: "teacher@vidyapath.in", avatar: "AS", subject: "Accountancy & Economics", qualification: "M.Com, B.Ed", experience: "8 Years", students: 45, courses: 3, rating: 4.9, status: "active", color: "#48BB78", joined: "Aug 2022" },
  { id: "t2", name: "Ms. Sunita Rao", email: "teacher2@vidyapath.in", avatar: "SR", subject: "Business Studies & English", qualification: "MBA, B.Ed", experience: "5 Years", students: 52, courses: 2, rating: 4.7, status: "active", color: "#5B9BD5", joined: "Jan 2023" },
  { id: "t3", name: "Mr. Deepak Verma", email: "deepak@vidyapath.in", avatar: "DV", subject: "Mathematics", qualification: "M.Sc Maths, B.Ed", experience: "10 Years", students: 30, courses: 2, rating: 4.8, status: "active", color: "#9B7BC4", joined: "Jun 2021" },
  { id: "t4", name: "Mrs. Kavita Joshi", email: "kavita@vidyapath.in", avatar: "KJ", subject: "Accountancy (Class 11)", qualification: "M.Com", experience: "3 Years", students: 35, courses: 1, rating: 4.5, status: "inactive", color: "#7B8EBF", joined: "Mar 2024" },
];

export default function AdminTeachers() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<typeof TEACHERS[0] | null>(null);
  const [teachers, setTeachers] = useState(TEACHERS);
  const [showAdd, setShowAdd] = useState(false);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = teachers.filter((t) =>
    search === "" || t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setTeachers((prev) => prev.map((t) => t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Teachers</Text>
        <TouchableOpacity
          onPress={() => setShowAdd(true)}
          style={[styles.addBtn, { backgroundColor: "#9B7BC4" }]}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>Add Teacher</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={[styles.summaryRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { val: teachers.filter((t) => t.status === "active").length, label: "Active", color: "#48BB78" },
          { val: teachers.filter((t) => t.status === "inactive").length, label: "Inactive", color: colors.mutedForeground },
          { val: teachers.reduce((a, t) => a + t.students, 0), label: "Students", color: colors.primary },
          { val: (teachers.reduce((a, t) => a + t.rating, 0) / teachers.length).toFixed(1), label: "Avg Rating", color: "#D69E2E" },
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
          <TextInput value={search} onChangeText={setSearch} placeholder="Search teachers or subject…" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.map((t) => (
          <TouchableOpacity
            key={t.id}
            onPress={() => setSelectedTeacher(t)}
            style={[styles.teacherCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.85}
          >
            <View style={[styles.avatar, { backgroundColor: t.color }]}>
              <Text style={styles.avatarText}>{t.avatar}</Text>
            </View>
            <View style={styles.teacherInfo}>
              <View style={styles.nameRow}>
                <Text style={[styles.teacherName, { color: colors.foreground }]}>{t.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: t.status === "active" ? "#48BB7818" : colors.muted, borderColor: t.status === "active" ? "#48BB7830" : colors.border }]}>
                  <View style={[styles.statusDot, { backgroundColor: t.status === "active" ? "#48BB78" : colors.mutedForeground }]} />
                  <Text style={[styles.statusText, { color: t.status === "active" ? "#48BB78" : colors.mutedForeground }]}>{t.status}</Text>
                </View>
              </View>
              <Text style={[styles.subject, { color: t.color }]}>{t.subject}</Text>
              <Text style={[styles.email, { color: colors.mutedForeground }]}>{t.email}</Text>
              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{t.students} students</Text>
                <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>•</Text>
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{t.courses} courses</Text>
                <Text style={[styles.metaDot, { color: colors.mutedForeground }]}>•</Text>
                <Ionicons name="star" size={11} color="#D69E2E" />
                <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{t.rating}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.border} />
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selectedTeacher} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            {selectedTeacher && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Teacher Details</Text>
                  <TouchableOpacity onPress={() => setSelectedTeacher(null)}>
                    <Ionicons name="close" size={22} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalProfile}>
                  <View style={[styles.bigAvatar, { backgroundColor: selectedTeacher.color }]}>
                    <Text style={styles.bigAvatarText}>{selectedTeacher.avatar}</Text>
                  </View>
                  <Text style={[styles.modalName, { color: colors.foreground }]}>{selectedTeacher.name}</Text>
                  <Text style={[styles.modalSubject, { color: selectedTeacher.color }]}>{selectedTeacher.subject}</Text>
                  <Text style={[styles.modalEmail, { color: colors.mutedForeground }]}>{selectedTeacher.email}</Text>
                </View>
                {[
                  { label: "Qualification", val: selectedTeacher.qualification },
                  { label: "Experience", val: selectedTeacher.experience },
                  { label: "Joined", val: selectedTeacher.joined },
                  { label: "Total Students", val: `${selectedTeacher.students}` },
                  { label: "Total Courses", val: `${selectedTeacher.courses}` },
                  { label: "Rating", val: `${selectedTeacher.rating} / 5.0` },
                ].map((r) => (
                  <View key={r.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                    <Text style={[styles.detailVal, { color: colors.foreground }]}>{r.val}</Text>
                  </View>
                ))}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => { toggleStatus(selectedTeacher.id); setSelectedTeacher(null); }}
                    style={[styles.actionBtn, { backgroundColor: selectedTeacher.status === "active" ? "#E53E3E18" : "#48BB7818", borderColor: selectedTeacher.status === "active" ? "#E53E3E30" : "#48BB7830" }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionBtnText, { color: selectedTeacher.status === "active" ? "#E53E3E" : "#48BB78" }]}>
                      {selectedTeacher.status === "active" ? "Deactivate" : "Activate"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#9B7BC418", borderColor: "#9B7BC430" }]} activeOpacity={0.8}>
                    <Text style={[styles.actionBtnText, { color: "#9B7BC4" }]}>Edit Profile</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Add Teacher Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add New Teacher</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {["Full Name", "Email Address", "Subject", "Qualification", "Experience"].map((f) => (
              <View key={f} style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f}</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput placeholder={`Enter ${f.toLowerCase()}…`} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} />
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={() => { setShowAdd(false); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
              style={[styles.submitBtn, { backgroundColor: "#9B7BC4" }]}
              activeOpacity={0.85}
            >
              <Text style={styles.submitBtnText}>Add Teacher</Text>
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
  scroll: { padding: 16, gap: 0 },
  teacherCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatarText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  teacherInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  teacherName: { flex: 1, fontSize: 13, fontFamily: "Poppins_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  subject: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  email: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  metaText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  metaDot: { fontSize: 10 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12, maxHeight: "85%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalProfile: { alignItems: "center", gap: 4, paddingVertical: 10 },
  bigAvatar: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  bigAvatarText: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold" },
  modalName: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalSubject: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  modalEmail: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  detailLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  detailVal: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginLeft: 2 },
  inputRow: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  input: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  submitBtn: { borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
});
