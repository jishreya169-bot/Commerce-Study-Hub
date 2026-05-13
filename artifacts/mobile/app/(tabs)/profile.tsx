import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  useColorScheme,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";

const ACHIEVEMENTS = [
  { icon: "flame" as const, label: "14 Day Streak", color: "#FF8F00" },
  { icon: "trophy" as const, label: "Top 50 Rank", color: "#6200EE" },
  { icon: "star" as const, label: "3850 Points", color: "#00C853" },
  { icon: "ribbon" as const, label: "3 Tests Cleared", color: "#0288D1" },
];

interface SettingRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value?: string;
  onPress?: () => void;
  rightComponent?: React.ReactNode;
  color?: string;
}

function SettingRow({ icon, label, value, onPress, rightComponent, color }: SettingRowProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.settingRow, { borderBottomColor: colors.border }]}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.settingIcon, { backgroundColor: (color ?? colors.primary) + "15" }]}>
        <Ionicons name={icon} size={18} color={color ?? colors.primary} />
      </View>
      <Text style={[styles.settingLabel, { color: colors.foreground }]}>{label}</Text>
      <View style={styles.settingRight}>
        {value && <Text style={[styles.settingValue, { color: colors.mutedForeground }]}>{value}</Text>}
        {rightComponent}
        {onPress && !rightComponent && <Ionicons name="chevron-forward" size={16} color={colors.mutedForeground} />}
      </View>
    </TouchableOpacity>
  );
}

export default function ProfileScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, language, setLanguage, courses, tests } = useApp();
  const colorScheme = useColorScheme();

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const enrolledCount = courses.filter((c) => c.enrolled).length;
  const completedTests = tests.filter((t) => t.attempted).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 100 : 100, paddingTop: topPad + 16 }]}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
          <View style={[styles.avatarLarge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.avatarLargeText}>{user.avatar}</Text>
          </View>
          <Text style={styles.profileName}>{user.name}</Text>
          <Text style={styles.profileClass}>{user.class}</Text>
          <Text style={styles.profileSchool}>{user.school}</Text>

          {/* Stats Row */}
          <View style={styles.profileStats}>
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{enrolledCount}</Text>
              <Text style={styles.profileStatLabel}>Courses</Text>
            </View>
            <View style={[styles.profileStatDivider]} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{completedTests}</Text>
              <Text style={styles.profileStatLabel}>Tests Done</Text>
            </View>
            <View style={[styles.profileStatDivider]} />
            <View style={styles.profileStat}>
              <Text style={styles.profileStatValue}>{user.streak}</Text>
              <Text style={styles.profileStatLabel}>Day Streak</Text>
            </View>
          </View>
        </View>

        {/* Achievements */}
        <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>
        <View style={styles.achievementsRow}>
          {ACHIEVEMENTS.map((a) => (
            <View key={a.label} style={[styles.achievementBadge, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.achievementIcon, { backgroundColor: a.color + "20" }]}>
                <Ionicons name={a.icon} size={20} color={a.color} />
              </View>
              <Text style={[styles.achievementLabel, { color: colors.foreground }]}>{a.label}</Text>
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
            color="#0288D1"
          />
          <SettingRow
            icon="moon"
            label="Dark Mode"
            color="#3700B3"
            rightComponent={
              <View style={[styles.themeIndicator, { backgroundColor: colorScheme === "dark" ? colors.primary : colors.muted }]}>
                <Text style={[styles.themeIndicatorText, { color: colorScheme === "dark" ? "#FFFFFF" : colors.mutedForeground }]}>
                  {colorScheme === "dark" ? "On" : "Off"}
                </Text>
              </View>
            }
          />
          <SettingRow icon="notifications" label="Notifications" onPress={() => {}} color="#FF8F00" />
          <SettingRow icon="download" label="Downloaded Content" onPress={() => {}} color="#00897B" />
          <SettingRow icon="lock-closed" label="Privacy Policy" onPress={() => {}} color="#757575" />
          <SettingRow icon="information-circle" label="About VidyaPath" value="v1.0.0" color="#6200EE" />
        </View>

        {/* CBSE Info */}
        <View style={[styles.cbseCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}>
          <Ionicons name="school" size={24} color={colors.primary} />
          <View style={styles.cbseInfo}>
            <Text style={[styles.cbseTitle, { color: colors.foreground }]}>CBSE Board 2025-26</Text>
            <Text style={[styles.cbseSubtitle, { color: colors.mutedForeground }]}>Class 11-12 Commerce • Aligned Curriculum</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, gap: 16 },
  profileCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  avatarLargeText: { color: "#FFFFFF", fontSize: 26, fontFamily: "Poppins_700Bold" },
  profileName: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold" },
  profileClass: { color: "rgba(255,255,255,0.8)", fontSize: 14, fontFamily: "Poppins_500Medium" },
  profileSchool: { color: "rgba(255,255,255,0.7)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  profileStats: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  profileStat: { flex: 1, alignItems: "center" },
  profileStatValue: { color: "#FFFFFF", fontSize: 20, fontFamily: "Poppins_700Bold" },
  profileStatLabel: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  profileStatDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.25)" },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", marginBottom: 4 },
  achievementsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 4 },
  achievementBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    paddingRight: 14,
  },
  achievementIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  achievementLabel: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  settingsCard: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: "hidden",
    marginBottom: 4,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  settingIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  settingLabel: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium" },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  themeIndicator: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  themeIndicatorText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  cbseCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  cbseInfo: { flex: 1 },
  cbseTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  cbseSubtitle: { fontSize: 12, fontFamily: "Poppins_400Regular" },
});
