import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const ALL_CLASSES = ["XII-A", "XII-B", "XII-C", "XI-A", "XI-B", "XI-C"];

const INIT_TEACHERS = [
  { id: "t1", name: "Prof. Amit Sharma", email: "teacher@vidyapath.in", avatar: "AS", subject: "Accountancy & Economics", qualification: "M.Com, B.Ed", experience: "8 Years", students: 45, courses: 3, rating: 4.9, status: "active", color: "#48BB78", joined: "Aug 2022", assignedClasses: ["XII-A", "XII-B"] },
  { id: "t2", name: "Ms. Sunita Rao", email: "teacher2@vidyapath.in", avatar: "SR", subject: "Business Studies & English", qualification: "MBA, B.Ed", experience: "5 Years", students: 52, courses: 2, rating: 4.7, status: "active", color: "#5B9BD5", joined: "Jan 2023", assignedClasses: ["XII-B", "XII-C"] },
  { id: "t3", name: "Mr. Deepak Verma", email: "deepak@vidyapath.in", avatar: "DV", subject: "Mathematics", qualification: "M.Sc Maths, B.Ed", experience: "10 Years", students: 30, courses: 2, rating: 4.8, status: "active", color: "#9B7BC4", joined: "Jun 2021", assignedClasses: ["XII-A"] },
  { id: "t4", name: "Mrs. Kavita Joshi", email: "kavita@vidyapath.in", avatar: "KJ", subject: "Accountancy (Class 11)", qualification: "M.Com", experience: "3 Years", students: 35, courses: 1, rating: 4.5, status: "inactive", color: "#7B8EBF", joined: "Mar 2024", assignedClasses: ["XI-A", "XI-B"] },
];

export default function AdminTeachers() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<typeof INIT_TEACHERS[0] | null>(null);
  const [teachers, setTeachers] = useState(INIT_TEACHERS);
  const [showAdd, setShowAdd] = useState(false);
  const [showAssignClass, setShowAssignClass] = useState(false);
  const [assignTarget, setAssignTarget] = useState<typeof INIT_TEACHERS[0] | null>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newQual, setNewQual] = useState("");
  const [newExp, setNewExp] = useState("");

  const filtered = teachers.filter((t) =>
    search === "" || t.name.toLowerCase().includes(search.toLowerCase()) || t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const toggleStatus = (id: string) => {
    setTeachers((prev) => prev.map((t) => t.id === id ? { ...t, status: t.status === "active" ? "inactive" : "active" } : t));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const toggleClass = (teacherId: string, cls: string) => {
    setTeachers((prev) => prev.map((t) => {
      if (t.id !== teacherId) return t;
      const has = t.assignedClasses.includes(cls);
      return { ...t, assignedClasses: has ? t.assignedClasses.filter((c) => c !== cls) : [...t.assignedClasses, cls] };
    }));
    if (assignTarget?.id === teacherId) {
      setAssignTarget((prev) => {
        if (!prev) return prev;
        const has = prev.assignedClasses.includes(cls);
        return { ...prev, assignedClasses: has ? prev.assignedClasses.filter((c) => c !== cls) : [...prev.assignedClasses, cls] };
      });
    }
    Haptics.selectionAsync();
  };

  const addTeacher = () => {
    if (!newName.trim() || !newEmail.trim()) return;
    const t = {
      id: `t${Date.now()}`, name: newName.trim(), email: newEmail.trim(),
      avatar: newName.trim().split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2),
      subject: newSubject.trim() || "General", qualification: newQual.trim() || "—",
      experience: newExp.trim() || "—", students: 0, courses: 0, rating: 0,
      status: "active", color: "#48BB78", joined: "May 2025", assignedClasses: [],
    };
    setTeachers((prev) => [...prev, t]);
    setNewName(""); setNewEmail(""); setNewSubject(""); setNewQual(""); setNewExp("");
    setShowAdd(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const activeCount = teachers.filter((t) => t.status === "active").length;
  const totalStudents = teachers.reduce((a, t) => a + t.students, 0);
  const avgRating = (teachers.filter((t) => t.rating > 0).reduce((a, t) => a + t.rating, 0) / teachers.filter((t) => t.rating > 0).length).toFixed(1);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── COLORED BANNER ── */}
      <View style={[styles.headerBanner, { paddingTop: topPad + 8, backgroundColor: "#9B7BC4", overflow: "hidden" }]}>
        <View style={[styles.dec1, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
        <View style={[styles.dec2, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        <View style={styles.bannerTop}>
          <View>
            <Text style={styles.bannerLabel}>ADMIN PANEL</Text>
            <Text style={styles.bannerTitle}>Teachers</Text>
          </View>
          <TouchableOpacity onPress={() => setShowAdd(true)} style={[styles.addBtn, { backgroundColor: "rgba(255,255,255,0.22)" }]} activeOpacity={0.85}>
            <Ionicons name="add" size={16} color="#FFFFFF" />
            <Text style={styles.addBtnText}>Add Teacher</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.bannerStrip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          {[
            { val: teachers.length, label: "Total", icon: "person-circle" },
            { val: activeCount, label: "Active", icon: "checkmark-circle" },
            { val: totalStudents, label: "Students", icon: "people" },
            { val: avgRating, label: "Avg Rating", icon: "star" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.stripStat}>
                <Ionicons name={s.icon as any} size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.stripVal}>{s.val}</Text>
                <Text style={styles.stripLabel}>{s.label}</Text>
              </View>
              {i < 3 && <View style={[styles.stripDiv, { backgroundColor: "rgba(255,255,255,0.2)" }]} />}
            </React.Fragment>
          ))}
        </View>
        <View style={[styles.waveCut, { backgroundColor: colors.background }]} />
      </View>

      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={15} color={colors.mutedForeground} />
          <TextInput value={search} onChangeText={setSearch} placeholder="Search teachers or subject…" placeholderTextColor={colors.mutedForeground} style={[styles.searchInput, { color: colors.foreground }]} />
          {search.length > 0 && <TouchableOpacity onPress={() => setSearch("")}><Ionicons name="close-circle" size={16} color={colors.mutedForeground} /></TouchableOpacity>}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.map((t) => (
          <TouchableOpacity key={t.id} onPress={() => { setSelectedTeacher(t); Haptics.selectionAsync(); }} style={[styles.teacherCard, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: "#000" }]} activeOpacity={0.85}>
            {/* Colored top accent */}
            <View style={[styles.cardAccent, { backgroundColor: t.color }]} />
            <View style={styles.cardBody}>
              {/* Avatar + info */}
              <View style={styles.cardTop}>
                <View style={[styles.avatarRing, { borderColor: t.color + "40" }]}>
                  <View style={[styles.avatar, { backgroundColor: t.color }]}>
                    <Text style={styles.avatarText}>{t.avatar}</Text>
                  </View>
                </View>
                <View style={styles.teacherInfo}>
                  <View style={styles.nameRow}>
                    <Text style={[styles.teacherName, { color: colors.foreground }]}>{t.name}</Text>
                    <View style={[styles.statusBadge, {
                      backgroundColor: t.status === "active" ? "#48BB7818" : colors.muted,
                      borderColor: t.status === "active" ? "#48BB7830" : colors.border,
                    }]}>
                      <View style={[styles.statusDot, { backgroundColor: t.status === "active" ? "#48BB78" : colors.mutedForeground }]} />
                      <Text style={[styles.statusText, { color: t.status === "active" ? "#48BB78" : colors.mutedForeground }]}>{t.status}</Text>
                    </View>
                  </View>
                  <Text style={[styles.subject, { color: t.color }]}>{t.subject}</Text>
                  <Text style={[styles.email, { color: colors.mutedForeground }]}>{t.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.border} />
              </View>

              {/* Assigned classes */}
              {t.assignedClasses.length > 0 && (
                <View style={styles.classPillRow}>
                  {t.assignedClasses.map((c) => (
                    <View key={c} style={[styles.classPill, { backgroundColor: t.color + "18", borderColor: t.color + "30" }]}>
                      <Text style={[styles.classPillText, { color: t.color }]}>{c}</Text>
                    </View>
                  ))}
                </View>
              )}

              {/* Stats row */}
              <View style={[styles.statsRow, { borderTopColor: colors.border }]}>
                <View style={styles.statItem}>
                  <Ionicons name="people" size={12} color="#5B9BD5" />
                  <Text style={[styles.statVal, { color: colors.foreground }]}>{t.students}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Students</Text>
                </View>
                <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Ionicons name="book" size={12} color="#9B7BC4" />
                  <Text style={[styles.statVal, { color: colors.foreground }]}>{t.courses}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Courses</Text>
                </View>
                <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Ionicons name="star" size={12} color="#D69E2E" />
                  <Text style={[styles.statVal, { color: colors.foreground }]}>{t.rating > 0 ? t.rating : "—"}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Rating</Text>
                </View>
                <View style={[styles.statDiv, { backgroundColor: colors.border }]} />
                <View style={styles.statItem}>
                  <Ionicons name="time" size={12} color="#48BB78" />
                  <Text style={[styles.statVal, { color: colors.foreground }]}>{t.experience}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Exp.</Text>
                </View>
              </View>
            </View>
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
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Teacher Profile</Text>
                  <TouchableOpacity onPress={() => setSelectedTeacher(null)}>
                    <Ionicons name="close" size={22} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.modalHero, { backgroundColor: selectedTeacher.color + "12" }]}>
                  <View style={[styles.bigAvatar, { backgroundColor: selectedTeacher.color }]}>
                    <Text style={styles.bigAvatarText}>{selectedTeacher.avatar}</Text>
                  </View>
                  <Text style={[styles.modalName, { color: colors.foreground }]}>{selectedTeacher.name}</Text>
                  <Text style={[styles.modalSubject, { color: selectedTeacher.color }]}>{selectedTeacher.subject}</Text>
                  <Text style={[styles.modalEmail, { color: colors.mutedForeground }]}>{selectedTeacher.email}</Text>
                </View>
                {selectedTeacher.assignedClasses.length > 0 && (
                  <View style={styles.assignSection}>
                    <Text style={[styles.assignLabel, { color: colors.mutedForeground }]}>ASSIGNED CLASSES</Text>
                    <View style={styles.classPillRow}>
                      {selectedTeacher.assignedClasses.map((c) => (
                        <View key={c} style={[styles.classPill, { backgroundColor: selectedTeacher.color + "18", borderColor: selectedTeacher.color + "30" }]}>
                          <Text style={[styles.classPillText, { color: selectedTeacher.color }]}>{c}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
                {[
                  { label: "Qualification", val: selectedTeacher.qualification },
                  { label: "Experience", val: selectedTeacher.experience },
                  { label: "Joined", val: selectedTeacher.joined },
                  { label: "Total Students", val: `${selectedTeacher.students}` },
                  { label: "Rating", val: selectedTeacher.rating > 0 ? `${selectedTeacher.rating} / 5.0` : "Not rated yet" },
                ].map((r) => (
                  <View key={r.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                    <Text style={[styles.detailVal, { color: colors.foreground }]}>{r.val}</Text>
                  </View>
                ))}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    onPress={() => { setAssignTarget(selectedTeacher); setSelectedTeacher(null); setShowAssignClass(true); }}
                    style={[styles.actionBtn, { backgroundColor: "#5B9BD518", borderColor: "#5B9BD530" }]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="school" size={14} color="#5B9BD5" />
                    <Text style={[styles.actionBtnText, { color: "#5B9BD5" }]}>Assign Class</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { toggleStatus(selectedTeacher.id); setSelectedTeacher(null); }}
                    style={[styles.actionBtn, { backgroundColor: selectedTeacher.status === "active" ? "#E53E3E18" : "#48BB7818", borderColor: selectedTeacher.status === "active" ? "#E53E3E30" : "#48BB7830" }]}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.actionBtnText, { color: selectedTeacher.status === "active" ? "#E53E3E" : "#48BB78" }]}>
                      {selectedTeacher.status === "active" ? "Deactivate" : "Activate"}
                    </Text>
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
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Assign Classes</Text>
              <TouchableOpacity onPress={() => { setShowAssignClass(false); setAssignTarget(null); }}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {assignTarget && <Text style={[styles.assignHint, { color: colors.mutedForeground }]}>Tap classes to assign or remove for {assignTarget.name}</Text>}
            <View style={styles.classGrid}>
              {ALL_CLASSES.map((cls) => {
                const assigned = assignTarget?.assignedClasses.includes(cls) ?? false;
                return (
                  <TouchableOpacity
                    key={cls}
                    onPress={() => assignTarget && toggleClass(assignTarget.id, cls)}
                    style={[styles.classOption, { backgroundColor: assigned ? "#9B7BC4" : colors.muted, borderColor: assigned ? "#9B7BC4" : colors.border }]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name={assigned ? "checkmark-circle" : "ellipse-outline"} size={15} color={assigned ? "#FFFFFF" : colors.mutedForeground} />
                    <Text style={[styles.classOptionText, { color: assigned ? "#FFFFFF" : colors.foreground }]}>{cls}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <TouchableOpacity
              onPress={() => { setShowAssignClass(false); setAssignTarget(null); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
              style={[styles.submitBtn, { backgroundColor: "#9B7BC4" }]}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Save Assignment</Text>
            </TouchableOpacity>
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
            {[
              { label: "Full Name *", val: newName, set: setNewName, ph: "e.g. Dr. Ramesh Kumar" },
              { label: "Email Address *", val: newEmail, set: setNewEmail, ph: "teacher@school.in" },
              { label: "Subject", val: newSubject, set: setNewSubject, ph: "e.g. Physics & Chemistry" },
              { label: "Qualification", val: newQual, set: setNewQual, ph: "e.g. M.Sc, B.Ed" },
              { label: "Experience", val: newExp, set: setNewExp, ph: "e.g. 5 Years" },
            ].map((f) => (
              <View key={f.label} style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} />
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={addTeacher}
              style={[styles.submitBtn, { backgroundColor: "#9B7BC4", opacity: newName.trim() && newEmail.trim() ? 1 : 0.5 }]}
              activeOpacity={0.85}
              disabled={!newName.trim() || !newEmail.trim()}
            >
              <Ionicons name="person-add" size={16} color="#FFFFFF" />
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
  headerBanner: { paddingHorizontal: 16, paddingBottom: 30, position: "relative" },
  dec1: { position: "absolute", width: 220, height: 220, borderRadius: 110, top: -60, right: -50 },
  dec2: { position: "absolute", width: 130, height: 130, borderRadius: 65, bottom: -30, left: -20 },
  bannerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14, zIndex: 1 },
  bannerLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 1.2, marginBottom: 2 },
  bannerTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold" },
  addBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  addBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  bannerStrip: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 12, zIndex: 1 },
  stripStat: { flex: 1, alignItems: "center", gap: 2 },
  stripVal: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  stripLabel: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontFamily: "Poppins_400Regular" },
  stripDiv: { width: 1, height: 28 },
  waveCut: { position: "absolute", bottom: 0, left: 0, right: 0, height: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  scroll: { paddingHorizontal: 16, paddingTop: 14, gap: 0 },
  teacherCard: { borderRadius: 18, borderWidth: 1, marginBottom: 12, overflow: "hidden", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  cardAccent: { height: 4 },
  cardBody: { padding: 14 },
  cardTop: { flexDirection: "row", alignItems: "flex-start", gap: 12, marginBottom: 10 },
  avatarRing: { width: 54, height: 54, borderRadius: 27, borderWidth: 2, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  avatar: { width: 46, height: 46, borderRadius: 23, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  teacherInfo: { flex: 1, gap: 3 },
  nameRow: { flexDirection: "row", alignItems: "center", gap: 8, flexWrap: "wrap" },
  teacherName: { flex: 1, fontSize: 13, fontFamily: "Poppins_700Bold" },
  statusBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20, borderWidth: 1 },
  statusDot: { width: 5, height: 5, borderRadius: 3 },
  statusText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  subject: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  email: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  classPillRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginBottom: 10 },
  classPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1 },
  classPillText: { fontSize: 9, fontFamily: "Poppins_700Bold" },
  statsRow: { flexDirection: "row", alignItems: "center", borderTopWidth: 1, paddingTop: 10 },
  statItem: { flex: 1, alignItems: "center", gap: 2 },
  statVal: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  statDiv: { width: 1, height: 24 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, gap: 12, maxHeight: "92%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalHero: { alignItems: "center", gap: 5, borderRadius: 16, paddingVertical: 16, paddingHorizontal: 20 },
  bigAvatar: { width: 66, height: 66, borderRadius: 33, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  bigAvatarText: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold" },
  modalName: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalSubject: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  modalEmail: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  assignSection: { gap: 6 },
  assignLabel: { fontSize: 9, fontFamily: "Poppins_600SemiBold", letterSpacing: 0.8 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 1 },
  detailLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  detailVal: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 12, borderRadius: 13, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  assignHint: { fontSize: 11, fontFamily: "Poppins_400Regular", marginTop: -4 },
  classGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  classOption: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12, borderWidth: 1, minWidth: "28%" },
  classOptionText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginLeft: 2 },
  inputRow: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  input: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 7, borderRadius: 14, paddingVertical: 14, marginTop: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
});
