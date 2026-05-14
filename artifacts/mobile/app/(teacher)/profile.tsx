import React, { useContext, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import * as Haptics from "expo-haptics";

const ACHIEVEMENTS = [
  { icon: "star", label: "Top Rated", color: "#D69E2E", desc: "4.9 avg stars" },
  { icon: "people", label: "45 Students", color: "#5B9BD5", desc: "Active learners" },
  { icon: "ribbon", label: "CBSE Expert", color: "#9B7BC4", desc: "Certified" },
  { icon: "trophy", label: "Best Teacher", color: "#48BB78", desc: "March 2026" },
  { icon: "chatbubbles", label: "Quick Reply", color: "#BF7B5B", desc: "< 30 min avg" },
  { icon: "flame", label: "60 Day Streak", color: "#E53E3E", desc: "Teaching streak" },
];

const SUBJECTS_TAUGHT = [
  { name: "Accountancy XII", students: 42, completion: 68, color: "#5B9BD5" },
  { name: "Economics XII", students: 38, completion: 55, color: "#5BAD9B" },
  { name: "Accountancy XI", students: 35, completion: 82, color: "#7B8EBF" },
];

export default function TeacherProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState<"info" | "courses">("info");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 110 : 110 }}>

        {/* ── HERO BANNER ── */}
        <View style={[styles.heroBanner, { paddingTop: topPad + 16, backgroundColor: "#48BB78" }]}>
          <View style={[styles.decCircle1, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
          <View style={[styles.decCircle2, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
          {/* Edit button */}
          <TouchableOpacity style={styles.editBtn} activeOpacity={0.8}>
            <Ionicons name="pencil" size={14} color="#FFFFFF" />
          </TouchableOpacity>
          {/* Avatar ring */}
          <View style={[styles.avatarRing, { borderColor: "rgba(255,255,255,0.4)" }]}>
            <View style={[styles.avatarInner, { backgroundColor: "rgba(255,255,255,0.25)" }]}>
              <Text style={styles.avatarText}>{user?.avatar ?? "T"}</Text>
            </View>
          </View>
          <Text style={styles.heroName}>{user?.name}</Text>
          <Text style={styles.heroSub}>{user?.subject}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>
          {/* Qualification pills */}
          <View style={styles.heroPills}>
            {[user?.qualification, user?.experience + " Exp."].map((p) => (
              <View key={p} style={[styles.heroPill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                <Text style={styles.heroPillText}>{p}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── FLOATING STATS ── */}
        <View style={styles.statsWrap}>
          <View style={[styles.statsCard, { backgroundColor: colors.card, shadowColor: "#000" }]}>
            {[
              { val: "45", label: "Students", color: "#5B9BD5", icon: "people" },
              { val: "3", label: "Courses", color: "#48BB78", icon: "book" },
              { val: "4.9", label: "Rating", color: "#D69E2E", icon: "star" },
              { val: "127", label: "Doubts", color: "#9B7BC4", icon: "checkmark-circle" },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.statItem}>
                  <View style={[styles.statIconWrap, { backgroundColor: s.color + "18" }]}>
                    <Ionicons name={s.icon as any} size={14} color={s.color} />
                  </View>
                  <Text style={[styles.statVal, { color: colors.foreground }]}>{s.val}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
                {i < 3 && <View style={[styles.statDiv, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          {/* ── TABS ── */}
          <View style={[styles.tabToggle, { backgroundColor: colors.muted }]}>
            {(["info", "courses"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => { setActiveTab(t); Haptics.selectionAsync(); }}
                style={[styles.tabBtn, { backgroundColor: activeTab === t ? "#48BB78" : "transparent" }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabBtnText, { color: activeTab === t ? "#FFFFFF" : colors.mutedForeground }]}>
                  {t === "info" ? "Profile" : "My Courses"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "info" ? (
            <>
              {/* About */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: "#48BB7818" }]}>
                    <Ionicons name="person" size={15} color="#48BB78" />
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>About Me</Text>
                </View>
                <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
                  Passionate Commerce educator with {user?.experience} of teaching experience. Specialized in making complex Accountancy and Economics concepts easy to understand for Class 11-12 students.
                </Text>
              </View>

              {/* Achievements */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: "#D69E2E18" }]}>
                    <Ionicons name="trophy" size={15} color="#D69E2E" />
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>Achievements</Text>
                  <View style={[styles.countBadge, { backgroundColor: "#48BB7818" }]}>
                    <Text style={[styles.countBadgeText, { color: "#48BB78" }]}>{ACHIEVEMENTS.length}</Text>
                  </View>
                </View>
                <View style={styles.achieveGrid}>
                  {ACHIEVEMENTS.map((a) => (
                    <View key={a.label} style={[styles.achieveCard, { backgroundColor: a.color + "10", borderColor: a.color + "25" }]}>
                      <View style={[styles.achieveIcon, { backgroundColor: a.color + "20" }]}>
                        <Ionicons name={a.icon as any} size={18} color={a.color} />
                      </View>
                      <Text style={[styles.achieveLabel, { color: colors.foreground }]}>{a.label}</Text>
                      <Text style={[styles.achieveDesc, { color: colors.mutedForeground }]}>{a.desc}</Text>
                    </View>
                  ))}
                </View>
              </View>

              {/* Settings */}
              <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.cardHeader}>
                  <View style={[styles.cardIcon, { backgroundColor: "#7B8EBF18" }]}>
                    <Ionicons name="settings" size={15} color="#7B8EBF" />
                  </View>
                  <Text style={[styles.cardTitle, { color: colors.foreground }]}>Preferences</Text>
                </View>
                <TouchableOpacity onPress={toggleTheme} style={[styles.settingRow, { borderBottomColor: colors.border }]} activeOpacity={0.8}>
                  <View style={[styles.settingIcon, { backgroundColor: "#6366F118" }]}>
                    <Ionicons name={isDark ? "moon" : "sunny"} size={15} color="#6366F1" />
                  </View>
                  <Text style={[styles.settingLabel, { color: colors.foreground }]}>Dark Mode</Text>
                  <View style={[styles.toggle, { backgroundColor: isDark ? "#48BB78" : colors.muted }]}>
                    <View style={[styles.toggleThumb, { transform: [{ translateX: isDark ? 18 : 2 }] }]} />
                  </View>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.settingRow, { borderBottomColor: "transparent" }]} activeOpacity={0.8} onPress={async () => { await logout(); }}>
                  <View style={[styles.settingIcon, { backgroundColor: "#E53E3E18" }]}>
                    <Ionicons name="log-out-outline" size={15} color="#E53E3E" />
                  </View>
                  <Text style={[styles.settingLabel, { color: "#E53E3E" }]}>Sign Out</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.border} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* My Courses tab */}
              {SUBJECTS_TAUGHT.map((s) => (
                <View key={s.name} style={[styles.courseCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: s.color, borderLeftWidth: 4 }]}>
                  <View style={styles.courseTop}>
                    <View style={[styles.courseIcon, { backgroundColor: s.color + "18" }]}>
                      <Ionicons name="book" size={18} color={s.color} />
                    </View>
                    <View style={styles.courseInfo}>
                      <Text style={[styles.courseName, { color: colors.foreground }]}>{s.name}</Text>
                      <Text style={[styles.courseMeta, { color: colors.mutedForeground }]}>{s.students} students enrolled</Text>
                    </View>
                    <Text style={[styles.coursePct, { color: s.color }]}>{s.completion}%</Text>
                  </View>
                  <View style={[styles.courseTrack, { backgroundColor: colors.muted }]}>
                    <View style={[styles.courseFill, { width: `${s.completion}%` as any, backgroundColor: s.color }]} />
                  </View>
                  <Text style={[styles.courseCaption, { color: colors.mutedForeground }]}>Course completion</Text>
                </View>
              ))}
            </>
          )}

          {/* Version row */}
          <View style={[styles.versionRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="ribbon" size={12} color="#48BB78" />
            <Text style={[styles.versionText, { color: colors.mutedForeground }]}>CBSE Certified Educator • VidyaPath v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroBanner: { paddingHorizontal: 16, paddingBottom: 36, alignItems: "center", gap: 5, position: "relative", overflow: "hidden" },
  decCircle1: { position: "absolute", width: 220, height: 220, borderRadius: 110, top: -60, right: -50 },
  decCircle2: { position: "absolute", width: 120, height: 120, borderRadius: 60, bottom: -30, left: -20 },
  editBtn: { position: "absolute", right: 16, top: 16, width: 32, height: 32, borderRadius: 16, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  avatarRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  avatarInner: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 26, fontFamily: "Poppins_700Bold" },
  heroName: { color: "#FFFFFF", fontSize: 21, fontFamily: "Poppins_700Bold" },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Poppins_500Medium" },
  heroEmail: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  heroPills: { flexDirection: "row", gap: 8, marginTop: 6 },
  heroPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  heroPillText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  statsWrap: { paddingHorizontal: 16, marginTop: -24 },
  statsCard: { flexDirection: "row", alignItems: "center", borderRadius: 18, paddingVertical: 14, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  statItem: { flex: 1, alignItems: "center", gap: 4 },
  statIconWrap: { width: 28, height: 28, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  statVal: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  statDiv: { width: 1, height: 30 },
  body: { padding: 16, gap: 14 },
  tabToggle: { flexDirection: "row", borderRadius: 14, padding: 3 },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 12 },
  tabBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  card: { borderRadius: 18, borderWidth: 1, padding: 16, gap: 12 },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  cardIcon: { width: 30, height: 30, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  cardTitle: { flex: 1, fontSize: 15, fontFamily: "Poppins_700Bold" },
  countBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countBadgeText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  aboutText: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20 },
  achieveGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  achieveCard: { width: "31%", borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center", gap: 5 },
  achieveIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  achieveLabel: { fontSize: 11, fontFamily: "Poppins_700Bold", textAlign: "center" },
  achieveDesc: { fontSize: 9, fontFamily: "Poppins_400Regular", textAlign: "center" },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1 },
  settingIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  settingLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium" },
  toggle: { width: 40, height: 24, borderRadius: 12, justifyContent: "center", paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFFFFF" },
  courseCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  courseTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  courseIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  courseInfo: { flex: 1 },
  courseName: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  courseMeta: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  coursePct: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  courseTrack: { height: 7, borderRadius: 4, overflow: "hidden" },
  courseFill: { height: 7, borderRadius: 4 },
  courseCaption: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  versionRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, borderWidth: 1, padding: 10 },
  versionText: { fontSize: 11, fontFamily: "Poppins_400Regular" },
});
