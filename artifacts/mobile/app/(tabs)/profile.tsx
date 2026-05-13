import React, { useContext } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ThemeContext } from "@/context/ThemeContext";

const ACHIEVEMENTS = [
  { icon: "flame" as const, label: "14 Day Streak", color: "#F59E0B" },
  { icon: "trophy" as const, label: "Top 50 Rank", color: "#0EA5E9" },
  { icon: "star" as const, label: "3850 Points", color: "#10B981" },
  { icon: "ribbon" as const, label: "Tests Cleared", color: "#8B5CF6" },
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

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const enrolled = courses.filter((c) => c.enrolled).length;
  const completedTests = tests.filter((t) => t.attempted).length;
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          { paddingTop: topPad + 16, paddingBottom: Platform.OS === "web" ? 110 : 110 },
        ]}
      >
        {/* Profile hero */}
        <View style={[styles.heroCard, { backgroundColor: colors.primary }]}>
          <View style={[styles.avatarLg, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.avatarLgText}>{user.avatar}</Text>
          </View>
          <Text style={styles.heroName}>{user.name}</Text>
          <Text style={styles.heroClass}>{user.class}</Text>
          <Text style={styles.heroSchool}>{user.school}</Text>

          <View style={[styles.statsRow, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{enrolled}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={[styles.statDiv, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{completedTests}</Text>
              <Text style={styles.statLabel}>Tests Done</Text>
            </View>
            <View style={[styles.statDiv, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>{user.streak}</Text>
              <Text style={styles.statLabel}>Day Streak</Text>
            </View>
            <View style={[styles.statDiv, { backgroundColor: "rgba(255,255,255,0.25)" }]} />
            <View style={styles.statItem}>
              <Text style={styles.statVal}>#{user.rank}</Text>
              <Text style={styles.statLabel}>Rank</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>
        <View style={styles.badgeGrid}>
          {ACHIEVEMENTS.map((a) => (
            <View
              key={a.label}
              style={[
                styles.badge,
                { backgroundColor: colors.card, borderColor: colors.border, width: (width - 52) / 2 },
              ]}
            >
              <View style={[styles.badgeIcon, { backgroundColor: a.color + "18" }]}>
                <Ionicons name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={[styles.badgeLabel, { color: colors.foreground }]}>{a.label}</Text>
            </View>
          ))}
        </View>

        {/* Settings */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Settings</Text>
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
                style={[
                  styles.themeToggle,
                  { backgroundColor: isDark ? colors.primary : colors.secondary },
                ]}
                activeOpacity={0.8}
              >
                <View
                  style={[
                    styles.themeThumb,
                    {
                      backgroundColor: "#FFFFFF",
                      transform: [{ translateX: isDark ? 20 : 2 }],
                    },
                  ]}
                />
              </TouchableOpacity>
            }
          />
          <SettingRow icon="notifications" label="Notifications" onPress={() => {}} accent="#F59E0B" />
          <SettingRow icon="download" label="Downloads" onPress={() => {}} accent="#10B981" />
          <SettingRow icon="shield-checkmark" label="Privacy" onPress={() => {}} accent="#64748B" />
          <SettingRow icon="information-circle" label="About VidyaPath" value="v1.0.0" accent="#0EA5E9" last />
        </View>

        {/* CBSE badge */}
        <View
          style={[
            styles.cbseBadge,
            { backgroundColor: colors.primary + "10", borderColor: colors.primary + "25" },
          ]}
        >
          <View style={[styles.cbseIcon, { backgroundColor: colors.primary + "18" }]}>
            <Ionicons name="school" size={20} color={colors.primary} />
          </View>
          <View style={styles.cbseInfo}>
            <Text style={[styles.cbseTitle, { color: colors.foreground }]}>CBSE Board 2025–26</Text>
            <Text style={[styles.cbseSub, { color: colors.mutedForeground }]}>
              Class 11–12 Commerce • Aligned Curriculum
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 14 },
  heroCard: {
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
    overflow: "hidden",
  },
  avatarLg: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarLgText: { color: "#FFFFFF", fontSize: 24, fontFamily: "Poppins_700Bold" },
  heroName: { color: "#FFFFFF", fontSize: 20, fontFamily: "Poppins_700Bold" },
  heroClass: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Poppins_500Medium" },
  heroSchool: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  statsRow: {
    flexDirection: "row",
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    width: "100%",
  },
  statItem: { flex: 1, alignItems: "center" },
  statVal: { color: "#FFFFFF", fontSize: 17, fontFamily: "Poppins_700Bold" },
  statLabel: { color: "rgba(255,255,255,0.75)", fontSize: 10, fontFamily: "Poppins_400Regular" },
  statDiv: { width: 1, height: 28 },
  sectionTitle: { fontSize: 17, fontFamily: "Poppins_700Bold", marginTop: 6 },
  badgeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  badgeIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  badgeLabel: { fontSize: 12, fontFamily: "Poppins_600SemiBold", flex: 1 },
  settingsCard: { borderRadius: 18, borderWidth: 1, overflow: "hidden" },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  rowIcon: { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  rowLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium" },
  rowRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowValue: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  themeToggle: {
    width: 44,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  themeThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  cbseBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cbseIcon: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cbseInfo: { flex: 1 },
  cbseTitle: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  cbseSub: { fontSize: 11, fontFamily: "Poppins_400Regular" },
});
