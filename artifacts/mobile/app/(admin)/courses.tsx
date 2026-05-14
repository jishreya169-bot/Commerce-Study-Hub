import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const COURSES = [
  { id: "c1", title: "Accountancy – Class 12", subject: "Accountancy", teacher: "Prof. Amit Sharma", enrolled: 42, totalLectures: 24, completionRate: 68, status: "published", rating: 4.9, color: "#5B9BD5", created: "Aug 2024" },
  { id: "c2", title: "Economics – Class 12", subject: "Economics", teacher: "Prof. Amit Sharma", enrolled: 38, totalLectures: 20, completionRate: 55, status: "published", rating: 4.8, color: "#5BAD9B", created: "Aug 2024" },
  { id: "c3", title: "Business Studies – Class 12", subject: "Business Studies", teacher: "Ms. Sunita Rao", enrolled: 45, totalLectures: 22, completionRate: 70, status: "published", rating: 4.7, color: "#7B8EBF", created: "Sep 2024" },
  { id: "c4", title: "English – Class 12", subject: "English", teacher: "Ms. Sunita Rao", enrolled: 52, totalLectures: 16, completionRate: 82, status: "published", rating: 4.6, color: "#BF7B5B", created: "Sep 2024" },
  { id: "c5", title: "Mathematics – Class 12", subject: "Mathematics", teacher: "Mr. Deepak Verma", enrolled: 30, totalLectures: 28, completionRate: 48, status: "draft", rating: 0, color: "#9B7BC4", created: "Nov 2024" },
  { id: "c6", title: "Accountancy – Class 11", subject: "Accountancy", teacher: "Mrs. Kavita Joshi", enrolled: 35, totalLectures: 18, completionRate: 82, status: "published", rating: 4.5, color: "#7B8EBF", created: "Aug 2024" },
];

const STATUS_FILTERS = ["All", "Published", "Draft"];

export default function AdminCourses() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [courses, setCourses] = useState(COURSES);
  const [selected, setSelected] = useState<typeof COURSES[0] | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = courses.filter((c) => {
    const ms = search === "" || c.title.toLowerCase().includes(search.toLowerCase()) || c.teacher.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "All" || c.status === statusFilter.toLowerCase();
    return ms && mf;
  });

  const toggleStatus = (id: string) => {
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "published" ? "draft" : "published" } : c));
    setSelected(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Courses</Text>
        <TouchableOpacity style={[styles.addBtn, { backgroundColor: "#9B7BC4" }]} activeOpacity={0.85}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addBtnText}>New Course</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.summaryRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { val: courses.filter((c) => c.status === "published").length, label: "Published", color: "#48BB78" },
          { val: courses.filter((c) => c.status === "draft").length, label: "Draft", color: colors.warning },
          { val: courses.reduce((a, c) => a + c.enrolled, 0), label: "Enrollments", color: colors.primary },
          { val: (courses.filter((c) => c.rating > 0).reduce((a, c) => a + c.rating, 0) / courses.filter((c) => c.rating > 0).length).toFixed(1), label: "Avg Rating", color: "#D69E2E" },
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
          <TextInput value={search} onChangeText={setSearch} placeholder="Search courses or teachers…" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} />
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
        {STATUS_FILTERS.map((f) => (
          <TouchableOpacity key={f} onPress={() => setStatusFilter(f)} style={[styles.chip, { backgroundColor: statusFilter === f ? "#9B7BC4" : colors.muted, borderColor: statusFilter === f ? "#9B7BC4" : colors.border }]} activeOpacity={0.8}>
            <Text style={[styles.chipText, { color: statusFilter === f ? "#FFFFFF" : colors.mutedForeground }]}>{f}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.map((c) => (
          <TouchableOpacity key={c.id} onPress={() => setSelected(c)} style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.85}>
            <View style={[styles.courseColorBar, { backgroundColor: c.color }]} />
            <View style={styles.courseContent}>
              <View style={styles.courseTop}>
                <View style={styles.courseTitle}>
                  <Text style={[styles.courseTitleText, { color: colors.foreground }]}>{c.title}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: c.status === "published" ? "#48BB7818" : "#D69E2E18", borderColor: c.status === "published" ? "#48BB7830" : "#D69E2E30" }]}>
                    <Text style={[styles.statusBadgeText, { color: c.status === "published" ? "#48BB78" : "#D69E2E" }]}>{c.status}</Text>
                  </View>
                </View>
                <Text style={[styles.courseTeacher, { color: c.color }]}>{c.teacher}</Text>
                <Text style={[styles.courseSubject, { color: colors.mutedForeground }]}>{c.subject}</Text>
              </View>
              <View style={styles.courseStats}>
                <View style={styles.courseStat}>
                  <Ionicons name="people" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.courseStatText, { color: colors.mutedForeground }]}>{c.enrolled} students</Text>
                </View>
                <View style={styles.courseStat}>
                  <Ionicons name="play-circle" size={12} color={colors.mutedForeground} />
                  <Text style={[styles.courseStatText, { color: colors.mutedForeground }]}>{c.totalLectures} lectures</Text>
                </View>
                {c.rating > 0 && (
                  <View style={styles.courseStat}>
                    <Ionicons name="star" size={12} color="#D69E2E" />
                    <Text style={[styles.courseStatText, { color: colors.mutedForeground }]}>{c.rating}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.progressBg, { backgroundColor: colors.muted }]}>
                <View style={[styles.progressFill, { backgroundColor: c.color, width: `${c.completionRate}%` as any }]} />
              </View>
              <Text style={[styles.progressText, { color: colors.mutedForeground }]}>{c.completionRate}% avg completion</Text>
            </View>
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
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Course Details</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}><Ionicons name="close" size={22} color={colors.mutedForeground} /></TouchableOpacity>
                </View>
                <View style={[styles.modalHero, { backgroundColor: selected.color + "18" }]}>
                  <View style={[styles.subjectIcon, { backgroundColor: selected.color }]}>
                    <Ionicons name="book" size={22} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={[styles.modalName, { color: colors.foreground }]}>{selected.title}</Text>
                    <Text style={[styles.modalSub, { color: selected.color }]}>{selected.subject}</Text>
                  </View>
                </View>
                {[
                  { label: "Teacher", val: selected.teacher },
                  { label: "Status", val: selected.status.charAt(0).toUpperCase() + selected.status.slice(1) },
                  { label: "Enrolled Students", val: `${selected.enrolled}` },
                  { label: "Total Lectures", val: `${selected.totalLectures}` },
                  { label: "Avg Completion", val: `${selected.completionRate}%` },
                  { label: "Rating", val: selected.rating > 0 ? `${selected.rating} / 5.0` : "Not rated yet" },
                  { label: "Created", val: selected.created },
                ].map((r) => (
                  <View key={r.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                    <Text style={[styles.detailVal, { color: colors.foreground }]}>{r.val}</Text>
                  </View>
                ))}
                <View style={styles.modalActions}>
                  <TouchableOpacity onPress={() => toggleStatus(selected.id)} style={[styles.actionBtn, { backgroundColor: selected.status === "published" ? "#D69E2E18" : "#48BB7818", borderColor: selected.status === "published" ? "#D69E2E30" : "#48BB7830" }]} activeOpacity={0.8}>
                    <Text style={[styles.actionBtnText, { color: selected.status === "published" ? "#D69E2E" : "#48BB78" }]}>
                      {selected.status === "published" ? "Unpublish" : "Publish"}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionBtn, { backgroundColor: "#E53E3E18", borderColor: "#E53E3E30" }]} activeOpacity={0.8}>
                    <Text style={[styles.actionBtnText, { color: "#E53E3E" }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
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
  scroll: { padding: 16, gap: 0 },
  courseCard: { flexDirection: "row", borderRadius: 14, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
  courseColorBar: { width: 5 },
  courseContent: { flex: 1, padding: 14, gap: 6 },
  courseTop: { gap: 3 },
  courseTitle: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  courseTitleText: { flex: 1, fontSize: 13, fontFamily: "Poppins_700Bold" },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8, borderWidth: 1, flexShrink: 0 },
  statusBadgeText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  courseTeacher: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  courseSubject: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  courseStats: { flexDirection: "row", gap: 12, alignItems: "center" },
  courseStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  courseStatText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  progressBg: { height: 5, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: 5, borderRadius: 3 },
  progressText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 10 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  modalTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalHero: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14 },
  subjectIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  modalName: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  modalSub: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1 },
  detailLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  detailVal: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, alignItems: "center", paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 13, fontFamily: "Poppins_700Bold" },
});
