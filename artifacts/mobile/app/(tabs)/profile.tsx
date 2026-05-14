import React, { useContext, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ThemeContext } from "@/context/ThemeContext";
import * as Haptics from "expo-haptics";

const ACHIEVEMENTS = [
  { icon: "flame" as const, label: "14 Day Streak", desc: "Keep it up!", color: "#F59E0B", bg: "#FEF3C7" },
  { icon: "trophy" as const, label: "Top 50 Rank", desc: "Class topper", color: "#0EA5E9", bg: "#E0F2FE" },
  { icon: "star" as const, label: "3850 Points", desc: "XP earned", color: "#10B981", bg: "#D1FAE5" },
  { icon: "ribbon" as const, label: "Tests Cleared", desc: "12 completed", color: "#8B5CF6", bg: "#EDE9FE" },
  { icon: "book" as const, label: "5 Courses", desc: "Enrolled", color: "#5B9BD5", bg: "#EFF6FF" },
  { icon: "checkmark-circle" as const, label: "90% Avg", desc: "Test scores", color: "#48BB78", bg: "#F0FFF4" },
];

const SUBJECT_PROGRESS = [
  { subject: "Accountancy", progress: 78, color: "#5B9BD5", icon: "calculator" },
  { subject: "Economics", progress: 65, color: "#5BAD9B", icon: "trending-up" },
  { subject: "Business Studies", progress: 82, color: "#9B7BC4", icon: "briefcase" },
  { subject: "English", progress: 91, color: "#BF7B5B", icon: "book" },
];

interface RowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightEl?: React.ReactNode;
  accent?: string;
  last?: boolean;
}

function SettingRow({ icon, label, value, onPress, rightEl, accent, last }: RowProps) {
  const colors = useColors();
  const color = accent ?? colors.primary;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      style={[styles.row, { borderBottomColor: last ? "transparent" : colors.border }]}
    >
      <View style={[styles.rowIcon, { backgroundColor: color + "18" }]}>
        <Ionicons name={icon} size={17} color={color} />
      </View>
      <Text style={[styles.rowLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && <Text style={[styles.rowValue, { color: colors.mutedForeground }]}>{value}</Text>}
        {rightEl}
        {onPress && !rightEl && <Ionicons name="chevron-forward" size={15} color={colors.border} />}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, language, setLanguage, courses, tests } = useApp();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { width } = useWindowDimensions();
  const [activeTab, setActiveTab] = useState<"overview" | "progress">("overview");
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const enrolled = courses.filter((c) => c.enrolled).length;
  const completedTests = tests.filter((t) => t.attempted).length;
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: Platform.OS === "web" ? 110 : 110 }}>

        {/* ── HERO ── */}
        <View style={[styles.heroWrap, { paddingTop: topPad }]}>
          {/* Purple gradient banner */}
          <View style={[styles.heroBanner, { backgroundColor: "#5B9BD5" }]}>
            {/* Decorative circles */}
            <View style={[styles.decCircle1, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
            <View style={[styles.decCircle2, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
            <View style={[styles.decCircle3, { backgroundColor: "rgba(255,255,255,0.05)" }]} />
          </View>

          {/* Profile card floating over banner */}
          <View style={[styles.profileCard, { backgroundColor: colors.card, shadowColor: "#000" }]}>
            {/* Avatar */}
            <View style={[styles.avatarRing, { borderColor: "#5B9BD5" + "40" }]}>
              <View style={[styles.avatarInner, { backgroundColor: "#5B9BD5" }]}>
                <Text style={styles.avatarText}>{user.avatar}</Text>
              </View>
            </View>

            <Text style={[styles.heroName, { color: colors.foreground }]}>{user.name}</Text>
            <Text style={[styles.heroClass, { color: "#5B9BD5" }]}>{user.class}</Text>
            <Text style={[styles.heroSchool, { color: colors.mutedForeground }]}>{user.school}</Text>

            {/* Rank + streak pill row */}
            <View style={styles.pillRow}>
              <View style={[styles.pill, { backgroundColor: "#F59E0B18", borderColor: "#F59E0B30" }]}>
                <Ionicons name="flame" size={12} color="#F59E0B" />
                <Text style={[styles.pillText, { color: "#F59E0B" }]}>{user.streak} day streak</Text>
              </View>
              <View style={[styles.pill, { backgroundColor: "#0EA5E918", borderColor: "#0EA5E930" }]}>
                <Ionicons name="podium" size={12} color="#0EA5E9" />
                <Text style={[styles.pillText, { color: "#0EA5E9" }]}>Rank #{user.rank}</Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={[styles.statsStrip, { backgroundColor: colors.muted }]}>
              {[
                { val: enrolled, label: "Courses", color: "#5B9BD5", icon: "book" },
                { val: completedTests, label: "Tests Done", color: "#48BB78", icon: "clipboard" },
                { val: user.streak, label: "Day Streak", color: "#F59E0B", icon: "flame" },
                { val: `${user.rank}`, label: "Class Rank", color: "#8B5CF6", icon: "trophy" },
              ].map((s, i) => (
                <React.Fragment key={s.label}>
                  <View style={styles.statItem}>
                    <Ionicons name={s.icon as any} size={14} color={s.color} />
                    <Text style={[styles.statVal, { color: colors.foreground }]}>{s.val}</Text>
                    <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                  </View>
                  {i < 3 && <View style={[styles.statDiv, { backgroundColor: colors.border }]} />}
                </React.Fragment>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.body}>
          {/* Tab Toggle */}
          <View style={[styles.tabToggle, { backgroundColor: colors.muted }]}>
            {(["overview", "progress"] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => { setActiveTab(t); Haptics.selectionAsync(); }}
                style={[styles.tabBtn, { backgroundColor: activeTab === t ? "#5B9BD5" : "transparent" }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabBtnText, { color: activeTab === t ? "#FFFFFF" : colors.mutedForeground }]}>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {activeTab === "overview" ? (
            <>
              {/* ── ACHIEVEMENTS ── */}
              <View style={styles.sectionHead}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>
                <View style={[styles.sectionBadge, { backgroundColor: "#5B9BD518" }]}>
                  <Text style={[styles.sectionBadgeText, { color: "#5B9BD5" }]}>{ACHIEVEMENTS.length}</Text>
                </View>
              </View>
              <View style={styles.achieveGrid}>
                {ACHIEVEMENTS.map((a) => (
                  <View key={a.label} style={[styles.achieveCard, { backgroundColor: colors.card, borderColor: colors.border, width: (width - 52) / 2 }]}>
                    <View style={[styles.achieveIcon, { backgroundColor: a.color + "18" }]}>
                      <Ionicons name={a.icon} size={22} color={a.color} />
                    </View>
                    <Text style={[styles.achieveLabel, { color: colors.foreground }]}>{a.label}</Text>
                    <Text style={[styles.achieveDesc, { color: colors.mutedForeground }]}>{a.desc}</Text>
                  </View>
                ))}
              </View>

              {/* ── SETTINGS ── */}
              <View style={styles.sectionHead}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Settings</Text>
              </View>
              <View style={[styles.settingsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <SettingRow
                  icon="language"
                  label="Language"
                  value={language === "en" ? "English" : "हिंदी"}
                  onPress={() => setLanguage(language === "en" ? "hi" : "en")}
                  accent="#0EA5E9"
                />
                <SettingRow
                  icon={isDark ? "moon" : "sunny"}
                  label="Dark Mode"
                  accent="#6366F1"
                  rightEl={
                    <TouchableOpacity
                      onPress={toggleTheme}
                      style={[styles.themeToggle, { backgroundColor: isDark ? "#5B9BD5" : colors.muted }]}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.themeThumb, { transform: [{ translateX: isDark ? 20 : 2 }] }]} />
                    </TouchableOpacity>
                  }
                />
                <SettingRow icon="notifications" label="Notifications" onPress={() => {}} accent="#F59E0B" />
                <SettingRow icon="download" label="Downloads" onPress={() => {}} accent="#10B981" />
                <SettingRow icon="shield-checkmark" label="Privacy" onPress={() => {}} accent="#64748B" />
                <SettingRow icon="information-circle" label="About VidyaPath" value="v1.0.0" accent="#0EA5E9" last />
              </View>
            </>
          ) : (
            <>
              {/* ── SUBJECT PROGRESS ── */}
              <View style={styles.sectionHead}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Subject Progress</Text>
              </View>
              <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                {SUBJECT_PROGRESS.map((s, i) => (
                  <View key={s.subject} style={[styles.progressRow, { borderBottomColor: i === SUBJECT_PROGRESS.length - 1 ? "transparent" : colors.border }]}>
                    <View style={[styles.progressIcon, { backgroundColor: s.color + "18" }]}>
                      <Ionicons name={s.icon as any} size={16} color={s.color} />
                    </View>
                    <View style={styles.progressInfo}>
                      <View style={styles.progressLabelRow}>
                        <Text style={[styles.progressSubject, { color: colors.foreground }]}>{s.subject}</Text>
                        <Text style={[styles.progressPct, { color: s.color }]}>{s.progress}%</Text>
                      </View>
                      <View style={[styles.progressTrack, { backgroundColor: colors.muted }]}>
                        <View style={[styles.progressFill, { width: `${s.progress}%` as any, backgroundColor: s.color }]} />
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* ── STUDY STATS ── */}
              <View style={styles.sectionHead}>
                <Text style={[styles.sectionTitle, { color: colors.foreground }]}>This Week</Text>
              </View>
              <View style={styles.weekGrid}>
                {[
                  { val: "12h", label: "Study Time", color: "#5B9BD5", icon: "time", bg: "#EFF6FF" },
                  { val: "8", label: "Lectures", color: "#48BB78", icon: "play-circle", bg: "#F0FFF4" },
                  { val: "3", label: "Tests", color: "#F59E0B", icon: "clipboard", bg: "#FEF3C7" },
                  { val: "95%", label: "Attendance", color: "#9B7BC4", icon: "calendar", bg: "#EDE9FE" },
                ].map((s) => (
                  <View key={s.label} style={[styles.weekCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.weekIcon, { backgroundColor: s.color + "18" }]}>
                      <Ionicons name={s.icon as any} size={20} color={s.color} />
                    </View>
                    <Text style={[styles.weekVal, { color: colors.foreground }]}>{s.val}</Text>
                    <Text style={[styles.weekLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* ── CBSE BADGE ── */}
          <View style={[styles.cbseBadge, { backgroundColor: "#5B9BD510", borderColor: "#5B9BD525" }]}>
            <View style={[styles.cbseIcon, { backgroundColor: "#5B9BD518" }]}>
              <Ionicons name="school" size={20} color="#5B9BD5" />
            </View>
            <View style={styles.cbseInfo}>
              <Text style={[styles.cbseTitle, { color: colors.foreground }]}>CBSE Board 2025–26</Text>
              <Text style={[styles.cbseSub, { color: colors.mutedForeground }]}>Class 11–12 Commerce • Aligned Curriculum</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  heroWrap: { position: "relative", marginBottom: 0 },
  heroBanner: { height: 160 },
  decCircle1: { position: "absolute", width: 200, height: 200, borderRadius: 100, top: -60, right: -40 },
  decCircle2: { position: "absolute", width: 140, height: 140, borderRadius: 70, top: 20, left: -30 },
  decCircle3: { position: "absolute", width: 80, height: 80, borderRadius: 40, bottom: -10, right: 80 },
  profileCard: {
    marginHorizontal: 16, marginTop: -60, borderRadius: 24,
    padding: 20, alignItems: "center", gap: 6,
    shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 6,
  },
  avatarRing: { width: 88, height: 88, borderRadius: 44, borderWidth: 3, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  avatarInner: { width: 78, height: 78, borderRadius: 39, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 26, fontFamily: "Poppins_700Bold" },
  heroName: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  heroClass: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  heroSchool: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  pillRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  pill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  pillText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  statsStrip: { flexDirection: "row", borderRadius: 16, paddingVertical: 12, paddingHorizontal: 4, alignItems: "center", width: "100%", marginTop: 8 },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  statDiv: { width: 1, height: 28 },
  body: { padding: 16, gap: 14 },
  tabToggle: { flexDirection: "row", borderRadius: 14, padding: 3 },
  tabBtn: { flex: 1, paddingVertical: 9, alignItems: "center", borderRadius: 12 },
  tabBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 2 },
  sectionTitle: { flex: 1, fontSize: 16, fontFamily: "Poppins_700Bold" },
  sectionBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  sectionBadgeText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  achieveGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  achieveCard: { borderRadius: 16, borderWidth: 1, padding: 14, alignItems: "center", gap: 6 },
  achieveIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  achieveLabel: { fontSize: 12, fontFamily: "Poppins_700Bold", textAlign: "center" },
  achieveDesc: { fontSize: 10, fontFamily: "Poppins_400Regular", textAlign: "center" },
  settingsCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  rowIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  rowLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  themeToggle: { width: 44, height: 26, borderRadius: 13, justifyContent: "center", paddingHorizontal: 2 },
  themeThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: "#FFFFFF" },
  progressCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderBottomWidth: 1 },
  progressIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  progressInfo: { flex: 1, gap: 6 },
  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  progressSubject: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  progressPct: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  progressTrack: { height: 7, borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 7, borderRadius: 4 },
  weekGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  weekCard: { width: "47%", borderRadius: 16, borderWidth: 1, padding: 16, alignItems: "center", gap: 6 },
  weekIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  weekVal: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  weekLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  cbseBadge: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  cbseIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cbseInfo: { flex: 1 },
  cbseTitle: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  cbseSub: { fontSize: 11, fontFamily: "Poppins_400Regular" },
});
