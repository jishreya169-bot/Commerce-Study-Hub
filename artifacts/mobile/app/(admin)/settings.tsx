import React, { useState, useContext } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const PLATFORM_SECTIONS = [
  {
    title: "Platform",
    items: [
      { key: "maintenance", icon: "construct", label: "Maintenance Mode", desc: "Put the app in read-only mode", color: "#D69E2E", toggle: true },
      { key: "registration", icon: "person-add", label: "Student Registration", desc: "Allow new student sign-ups", color: "#48BB78", toggle: true },
      { key: "teacherSelfReg", icon: "person-circle", label: "Teacher Self-Registration", desc: "Allow teachers to self-register", color: "#5B9BD5", toggle: false },
    ],
  },
  {
    title: "Notifications",
    items: [
      { key: "emailNotifs", icon: "mail", label: "Email Notifications", desc: "Send email alerts to users", color: "#7B8EBF", toggle: true },
      { key: "liveAlerts", icon: "radio", label: "Live Class Alerts", desc: "Push reminders 10 min before class", color: "#E53E3E", toggle: true },
      { key: "doubtAlerts", icon: "help-circle", label: "Doubt Answer Alerts", desc: "Notify students when doubt is answered", color: "#9B7BC4", toggle: true },
    ],
  },
  {
    title: "Content",
    items: [
      { key: "moderation", icon: "shield-checkmark", label: "Content Moderation", desc: "Auto-flag inappropriate content", color: "#48BB78", toggle: true },
      { key: "comments", icon: "chatbubbles", label: "Student Comments", desc: "Allow comments on recorded lectures", color: "#5B9BD5", toggle: true },
      { key: "guestPreview", icon: "eye", label: "Guest Preview", desc: "Non-logged-in users can preview courses", color: "#BF7B5B", toggle: false },
    ],
  },
];

const COURSES_DATA = [
  { id: "c1", title: "Accountancy – Class 12", teacher: "Prof. Amit Sharma", enrolled: 42, status: "published", color: "#5B9BD5" },
  { id: "c2", title: "Economics – Class 12", teacher: "Prof. Amit Sharma", enrolled: 38, status: "published", color: "#5BAD9B" },
  { id: "c3", title: "Business Studies – Class 12", teacher: "Ms. Sunita Rao", enrolled: 45, status: "published", color: "#7B8EBF" },
  { id: "c4", title: "English – Class 12", teacher: "Ms. Sunita Rao", enrolled: 52, status: "published", color: "#BF7B5B" },
  { id: "c5", title: "Mathematics – Class 12", teacher: "Mr. Deepak Verma", enrolled: 30, status: "draft", color: "#9B7BC4" },
  { id: "c6", title: "Accountancy – Class 11", teacher: "Mrs. Kavita Joshi", enrolled: 35, status: "published", color: "#7B8EBF" },
  { id: "c7", title: "Business Studies – Class 11", teacher: "Ms. Sunita Rao", enrolled: 28, status: "published", color: "#5BAD9B" },
  { id: "c8", title: "Economics – Class 11", teacher: "Prof. Amit Sharma", enrolled: 22, status: "draft", color: "#D69E2E" },
];

const MONTHLY_STATS = [
  { month: "Jan", students: 138, revenue: 142 },
  { month: "Feb", students: 142, revenue: 148 },
  { month: "Mar", students: 148, revenue: 152 },
  { month: "Apr", students: 150, revenue: 158 },
  { month: "May", students: 154, revenue: 162 },
  { month: "Jun", students: 156, revenue: 168 },
];

export default function AdminSettings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const router = useRouter();
  const isDark = theme === "dark";
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    maintenance: false, registration: true, teacherSelfReg: false,
    emailNotifs: true, liveAlerts: true, doubtAlerts: true,
    moderation: true, comments: true, guestPreview: false,
  });
  const [coursesOpen, setCoursesOpen] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [courses, setCourses] = useState(COURSES_DATA);
  const [addCourseModal, setAddCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseTeacher, setNewCourseTeacher] = useState("");

  const flip = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    Haptics.selectionAsync();
  };

  const toggleCourseStatus = (id: string) => {
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: c.status === "published" ? "draft" : "published" } : c));
    Haptics.selectionAsync();
  };

  const addCourse = () => {
    if (!newCourseTitle.trim()) return;
    const newC = {
      id: `c${Date.now()}`, title: newCourseTitle.trim(),
      teacher: newCourseTeacher.trim() || "Unassigned",
      enrolled: 0, status: "draft", color: "#9B7BC4",
    };
    setCourses((prev) => [...prev, newC]);
    setNewCourseTitle(""); setNewCourseTeacher(""); setAddCourseModal(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const maxBar = Math.max(...MONTHLY_STATS.map((m) => m.revenue));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── COLORED BANNER ── */}
      <View style={[styles.headerBanner, { paddingTop: topPad + 8, backgroundColor: "#9B7BC4", overflow: "hidden" }]}>
        <View style={[styles.dec1, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
        <View style={[styles.dec2, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        <View style={styles.bannerTop}>
          <View>
            <Text style={styles.bannerLabel}>ADMIN PANEL</Text>
            <Text style={styles.bannerTitle}>Settings</Text>
          </View>
          <View style={[styles.adminBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        </View>
        <View style={[styles.waveCut, { backgroundColor: colors.background }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>

        {/* Admin Info */}
        <View style={[styles.adminCard, { backgroundColor: "#9B7BC410", borderColor: "#9B7BC420" }]}>
          <View style={[styles.adminAvatar, { backgroundColor: "#9B7BC4" }]}>
            <Text style={styles.adminAvatarText}>{user?.avatar ?? "A"}</Text>
          </View>
          <View style={styles.adminInfo}>
            <Text style={[styles.adminName, { color: colors.foreground }]}>{user?.name}</Text>
            <Text style={[styles.adminEmail, { color: colors.mutedForeground }]}>{user?.email}</Text>
            <Text style={[styles.adminRole, { color: "#9B7BC4" }]}>Super Administrator</Text>
          </View>
          <TouchableOpacity style={[styles.editBtn, { backgroundColor: "#9B7BC4" }]} activeOpacity={0.8}>
            <Ionicons name="pencil" size={14} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* ── COURSES SECTION ── */}
        <TouchableOpacity
          onPress={() => { setCoursesOpen(!coursesOpen); Haptics.selectionAsync(); }}
          style={[styles.sectionToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.85}
        >
          <View style={[styles.sectionToggleIcon, { backgroundColor: "#9B7BC418" }]}>
            <Ionicons name="library" size={16} color="#9B7BC4" />
          </View>
          <View style={styles.sectionToggleInfo}>
            <Text style={[styles.sectionToggleTitle, { color: colors.foreground }]}>Courses</Text>
            <Text style={[styles.sectionToggleDesc, { color: colors.mutedForeground }]}>
              {courses.filter((c) => c.status === "published").length} published · {courses.filter((c) => c.status === "draft").length} draft
            </Text>
          </View>
          <View style={[styles.countPill, { backgroundColor: "#9B7BC418" }]}>
            <Text style={[styles.countPillText, { color: "#9B7BC4" }]}>{courses.length}</Text>
          </View>
          <Ionicons name={coursesOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {coursesOpen && (
          <View style={[styles.expandedSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.expandedHeader}>
              <Text style={[styles.expandedTitle, { color: colors.foreground }]}>All Courses</Text>
              <TouchableOpacity onPress={() => setAddCourseModal(true)} style={[styles.miniAddBtn, { backgroundColor: "#9B7BC4" }]} activeOpacity={0.85}>
                <Ionicons name="add" size={13} color="#FFFFFF" />
                <Text style={styles.miniAddBtnText}>Add</Text>
              </TouchableOpacity>
            </View>
            {courses.map((c, i) => (
              <View key={c.id} style={[styles.courseRow, { borderBottomColor: i === courses.length - 1 ? "transparent" : colors.border }]}>
                <View style={[styles.courseDot, { backgroundColor: c.color }]} />
                <View style={styles.courseRowInfo}>
                  <Text style={[styles.courseRowTitle, { color: colors.foreground }]} numberOfLines={1}>{c.title}</Text>
                  <Text style={[styles.courseRowTeacher, { color: colors.mutedForeground }]}>{c.teacher} · {c.enrolled} students</Text>
                </View>
                <TouchableOpacity onPress={() => toggleCourseStatus(c.id)} style={[styles.statusPill, { backgroundColor: c.status === "published" ? "#48BB7818" : "#D69E2E18" }]} activeOpacity={0.8}>
                  <Text style={[styles.statusPillText, { color: c.status === "published" ? "#48BB78" : "#D69E2E" }]}>
                    {c.status}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* ── REPORTS SECTION ── */}
        <TouchableOpacity
          onPress={() => { setReportsOpen(!reportsOpen); Haptics.selectionAsync(); }}
          style={[styles.sectionToggle, { backgroundColor: colors.card, borderColor: colors.border }]}
          activeOpacity={0.85}
        >
          <View style={[styles.sectionToggleIcon, { backgroundColor: "#D69E2E18" }]}>
            <Ionicons name="bar-chart" size={16} color="#D69E2E" />
          </View>
          <View style={styles.sectionToggleInfo}>
            <Text style={[styles.sectionToggleTitle, { color: colors.foreground }]}>Reports & Analytics</Text>
            <Text style={[styles.sectionToggleDesc, { color: colors.mutedForeground }]}>Monthly trends, revenue & attendance</Text>
          </View>
          <Ionicons name={reportsOpen ? "chevron-up" : "chevron-down"} size={16} color={colors.mutedForeground} />
        </TouchableOpacity>

        {reportsOpen && (
          <View style={[styles.expandedSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {/* KPI row */}
            <View style={styles.kpiRow}>
              {[
                { val: "156", label: "Students", color: "#5B9BD5" },
                { val: "12", label: "Teachers", color: "#48BB78" },
                { val: "87%", label: "Attendance", color: "#D69E2E" },
                { val: "₹168k", label: "Revenue", color: "#9B7BC4" },
              ].map((k) => (
                <View key={k.label} style={[styles.kpiCard, { backgroundColor: k.color + "10" }]}>
                  <Text style={[styles.kpiVal, { color: k.color }]}>{k.val}</Text>
                  <Text style={[styles.kpiLabel, { color: colors.mutedForeground }]}>{k.label}</Text>
                </View>
              ))}
            </View>
            {/* Mini bar chart */}
            <Text style={[styles.chartTitle, { color: colors.foreground }]}>Revenue (₹k) — 2025</Text>
            <View style={styles.miniChart}>
              {MONTHLY_STATS.map((m) => (
                <View key={m.month} style={styles.miniBarCol}>
                  <Text style={[styles.miniBarVal, { color: "#9B7BC4" }]}>{m.revenue}</Text>
                  <View style={styles.miniBarTrack}>
                    <View style={[styles.miniBarFill, { height: `${Math.round((m.revenue / maxBar) * 100)}%` as any }]} />
                  </View>
                  <Text style={[styles.miniBarLabel, { color: colors.mutedForeground }]}>{m.month}</Text>
                </View>
              ))}
            </View>
            {/* Subject enrollment */}
            <Text style={[styles.chartTitle, { color: colors.foreground, marginTop: 12 }]}>Subject Enrollment</Text>
            {[
              { subject: "Accountancy", enrolled: 77, color: "#5B9BD5" },
              { subject: "English", enrolled: 52, color: "#BF7B5B" },
              { subject: "Business Studies", enrolled: 45, color: "#7B8EBF" },
              { subject: "Economics", enrolled: 38, color: "#5BAD9B" },
              { subject: "Mathematics", enrolled: 30, color: "#9B7BC4" },
            ].map((s) => (
              <View key={s.subject} style={styles.enrollRow}>
                <Text style={[styles.enrollSubject, { color: colors.foreground }]}>{s.subject}</Text>
                <View style={[styles.enrollBg, { backgroundColor: colors.muted }]}>
                  <View style={[styles.enrollFill, { width: `${Math.round((s.enrolled / 77) * 100)}%` as any, backgroundColor: s.color }]} />
                </View>
                <Text style={[styles.enrollCount, { color: s.color }]}>{s.enrolled}</Text>
              </View>
            ))}
          </View>
        )}

        {/* System Stats */}
        <View style={[styles.sysCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sysCardTitle, { color: colors.foreground }]}>System Health</Text>
          <View style={styles.sysRow}>
            {[
              { label: "DB Status", val: "Healthy", color: "#48BB78", icon: "server" },
              { label: "Uptime", val: "99.9%", color: "#48BB78", icon: "cloud-done" },
              { label: "Storage", val: "42% used", color: "#D69E2E", icon: "analytics" },
              { label: "Last Backup", val: "2h ago", color: colors.primary, icon: "time" },
            ].map((s) => (
              <View key={s.label} style={[styles.sysStat, { backgroundColor: s.color + "10" }]}>
                <Ionicons name={s.icon as any} size={14} color={s.color} />
                <Text style={[styles.sysStatVal, { color: s.color }]}>{s.val}</Text>
                <Text style={[styles.sysStatLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Dark Mode */}
        <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={[styles.settingRow, { borderBottomColor: "transparent" }]}>
            <View style={[styles.settingIcon, { backgroundColor: "#6366F118" }]}>
              <Ionicons name={isDark ? "moon" : "sunny"} size={16} color="#6366F1" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Dark Mode</Text>
              <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>Toggle dark/light interface</Text>
            </View>
            <TouchableOpacity onPress={() => { toggleTheme(); Haptics.selectionAsync(); }} style={[styles.toggle, { backgroundColor: isDark ? "#9B7BC4" : colors.muted }]} activeOpacity={0.85}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: isDark ? 18 : 2 }] }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Platform Settings */}
        {PLATFORM_SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
            <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, i) => (
                <View key={item.key} style={[styles.settingRow, { borderBottomColor: i === section.items.length - 1 ? "transparent" : colors.border }]}>
                  <View style={[styles.settingIcon, { backgroundColor: item.color + "18" }]}>
                    <Ionicons name={item.icon as any} size={16} color={item.color} />
                  </View>
                  <View style={styles.settingInfo}>
                    <Text style={[styles.settingLabel, { color: colors.foreground }]}>{item.label}</Text>
                    <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>{item.desc}</Text>
                  </View>
                  {item.toggle && (
                    <TouchableOpacity onPress={() => flip(item.key)} style={[styles.toggle, { backgroundColor: toggles[item.key] ? item.color : colors.muted }]} activeOpacity={0.85}>
                      <View style={[styles.toggleThumb, { transform: [{ translateX: toggles[item.key] ? 18 : 2 }] }]} />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Quick Actions */}
        <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>QUICK ACTIONS</Text>
        <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {[
            { icon: "download", label: "Export Data", desc: "Download all data as CSV", color: "#5B9BD5" },
            { icon: "refresh", label: "Clear Cache", desc: "Clear app cache and temp files", color: "#7B8EBF" },
            { icon: "cloud-upload", label: "Backup Now", desc: "Run manual database backup", color: "#48BB78" },
          ].map((a, i) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.settingRow, { borderBottomColor: i === 2 ? "transparent" : colors.border }]}
              activeOpacity={0.8}
              onPress={() => Haptics.selectionAsync()}
            >
              <View style={[styles.settingIcon, { backgroundColor: a.color + "18" }]}>
                <Ionicons name={a.icon as any} size={16} color={a.color} />
              </View>
              <View style={styles.settingInfo}>
                <Text style={[styles.settingLabel, { color: colors.foreground }]}>{a.label}</Text>
                <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>{a.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={14} color={colors.border} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out */}
        <TouchableOpacity onPress={async () => { await logout(); }} style={[styles.logoutBtn, { backgroundColor: "#E53E3E18", borderColor: "#E53E3E30" }]} activeOpacity={0.8}>
          <Ionicons name="log-out-outline" size={18} color="#E53E3E" />
          <Text style={[styles.logoutText, { color: "#E53E3E" }]}>Sign Out</Text>
        </TouchableOpacity>

        <View style={[styles.versionRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="ribbon" size={12} color="#9B7BC4" />
          <Text style={[styles.versionText, { color: colors.mutedForeground }]}>VidyaPath LMS Admin · v1.0.0 · CBSE 2025–26</Text>
        </View>
      </ScrollView>

      {/* Add Course Modal */}
      <Modal visible={addCourseModal} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Add New Course</Text>
              <TouchableOpacity onPress={() => setAddCourseModal(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {[
              { label: "Course Title", val: newCourseTitle, set: setNewCourseTitle, ph: "e.g. Physics – Class 12" },
              { label: "Assign Teacher", val: newCourseTeacher, set: setNewCourseTeacher, ph: "e.g. Mr. Deepak Verma" },
            ].map((f) => (
              <View key={f.label} style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} />
                </View>
              </View>
            ))}
            <TouchableOpacity onPress={addCourse} style={[styles.submitBtn, { backgroundColor: "#9B7BC4", opacity: newCourseTitle.trim() ? 1 : 0.5 }]} activeOpacity={0.85} disabled={!newCourseTitle.trim()}>
              <Text style={styles.submitBtnText}>Add Course</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBanner: { paddingHorizontal: 16, paddingBottom: 20, position: "relative" },
  dec1: { position: "absolute", width: 200, height: 200, borderRadius: 100, top: -60, right: -40 },
  dec2: { position: "absolute", width: 120, height: 120, borderRadius: 60, bottom: -30, left: -20 },
  bannerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 2, zIndex: 1 },
  bannerLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 1.2, marginBottom: 2 },
  bannerTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold" },
  waveCut: { position: "absolute", bottom: 0, left: 0, right: 0, height: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  adminBadgeText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  scroll: { padding: 16, gap: 12 },
  adminCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  adminAvatar: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  adminAvatarText: { color: "#FFFFFF", fontSize: 17, fontFamily: "Poppins_700Bold" },
  adminInfo: { flex: 1, gap: 2 },
  adminName: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  adminEmail: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  adminRole: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  editBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  sectionToggle: { flexDirection: "row", alignItems: "center", gap: 10, borderRadius: 14, borderWidth: 1, padding: 14 },
  sectionToggleIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  sectionToggleInfo: { flex: 1 },
  sectionToggleTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  sectionToggleDesc: { fontSize: 10, fontFamily: "Poppins_400Regular", marginTop: 1 },
  countPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  countPillText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  expandedSection: { borderRadius: 14, borderWidth: 1, padding: 14, marginTop: -6 },
  expandedHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10 },
  expandedTitle: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  miniAddBtn: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10 },
  miniAddBtnText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold" },
  courseRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 9, borderBottomWidth: 1 },
  courseDot: { width: 10, height: 10, borderRadius: 5, flexShrink: 0 },
  courseRowInfo: { flex: 1 },
  courseRowTitle: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  courseRowTeacher: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusPillText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  kpiRow: { flexDirection: "row", gap: 8, marginBottom: 14 },
  kpiCard: { flex: 1, borderRadius: 10, padding: 8, alignItems: "center", gap: 2 },
  kpiVal: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  kpiLabel: { fontSize: 8, fontFamily: "Poppins_400Regular" },
  chartTitle: { fontSize: 12, fontFamily: "Poppins_600SemiBold", marginBottom: 8 },
  miniChart: { flexDirection: "row", alignItems: "flex-end", height: 100, gap: 4 },
  miniBarCol: { flex: 1, alignItems: "center", gap: 3, height: "100%" },
  miniBarVal: { fontSize: 7, fontFamily: "Poppins_600SemiBold" },
  miniBarTrack: { flex: 1, width: "70%", justifyContent: "flex-end", borderRadius: 3, overflow: "hidden" },
  miniBarFill: { width: "100%", borderRadius: 3, backgroundColor: "#9B7BC4", minHeight: 4 },
  miniBarLabel: { fontSize: 9, fontFamily: "Poppins_500Medium" },
  enrollRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 5 },
  enrollSubject: { width: 110, fontSize: 11, fontFamily: "Poppins_400Regular" },
  enrollBg: { flex: 1, height: 6, borderRadius: 3, overflow: "hidden" },
  enrollFill: { height: 6, borderRadius: 3 },
  enrollCount: { width: 24, fontSize: 11, fontFamily: "Poppins_700Bold", textAlign: "right" },
  sysCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  sysCardTitle: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  sysRow: { flexDirection: "row", gap: 8 },
  sysStat: { flex: 1, borderRadius: 10, padding: 8, alignItems: "center", gap: 3 },
  sysStatVal: { fontSize: 10, fontFamily: "Poppins_700Bold", textAlign: "center" },
  sysStatLabel: { fontSize: 8, fontFamily: "Poppins_400Regular", textAlign: "center" },
  sectionBlock: { gap: 6 },
  sectionLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", letterSpacing: 0.8, marginLeft: 2 },
  settingCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1 },
  settingIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  settingInfo: { flex: 1, gap: 1 },
  settingLabel: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  settingDesc: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  toggle: { width: 40, height: 24, borderRadius: 12, justifyContent: "center", paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFFFFF" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, borderWidth: 1, paddingVertical: 13 },
  logoutText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  versionRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, borderWidth: 1, padding: 10 },
  versionText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginLeft: 2 },
  inputRow: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  input: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  submitBtn: { borderRadius: 14, paddingVertical: 13, alignItems: "center", marginTop: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
});
