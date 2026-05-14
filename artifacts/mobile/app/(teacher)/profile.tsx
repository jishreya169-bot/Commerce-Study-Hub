import React, { useContext } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";

const ACHIEVEMENTS = [
  { icon: "star", label: "Top Rated", color: "#D69E2E", desc: "Avg 4.9 stars" },
  { icon: "people", label: "45 Students", color: "#5B9BD5", desc: "Active learners" },
  { icon: "ribbon", label: "CBSE Expert", color: "#9B7BC4", desc: "Certified" },
  { icon: "trophy", label: "Best Teacher", color: "#48BB78", desc: "March 2026" },
  { icon: "chatbubbles", label: "Quick Responder", color: "#BF7B5B", desc: "< 30 min avg" },
  { icon: "flame", label: "60 Day Streak", color: "#E53E3E", desc: "Teaching streak" },
];

export default function TeacherProfile() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isDark = theme === "dark";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: "#48BB78", paddingTop: topPad + 16 }]}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{user?.avatar ?? "T"}</Text>
          </View>
          <Text style={styles.heroName}>{user?.name}</Text>
          <Text style={styles.heroSub}>{user?.subject}</Text>
          <Text style={styles.heroEmail}>{user?.email}</Text>
          <View style={styles.heroBadges}>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>{user?.qualification}</Text></View>
            <View style={styles.heroBadge}><Text style={styles.heroBadgeText}>{user?.experience} Experience</Text></View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Quick Stats */}
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { val: "45", label: "Students", color: "#5B9BD5", icon: "people" },
              { val: "3", label: "Courses", color: "#48BB78", icon: "book" },
              { val: "4.9", label: "Avg Rating", color: "#D69E2E", icon: "star" },
              { val: "127", label: "Doubts Solved", color: "#9B7BC4", icon: "checkmark-circle" },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                <View style={styles.statItem}>
                  <Ionicons name={s.icon as any} size={16} color={s.color} />
                  <Text style={[styles.statVal, { color: colors.foreground }]}>{s.val}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
                {i < 3 && <View style={[styles.statDiv, { backgroundColor: colors.border }]} />}
              </React.Fragment>
            ))}
          </View>

          {/* About */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>About Me</Text>
            <Text style={[styles.aboutText, { color: colors.mutedForeground }]}>
              Passionate Commerce educator with {user?.experience} of teaching experience. Specialized in making complex Accountancy and Economics concepts easy to understand for Class 11-12 students.
            </Text>
          </View>

          {/* Achievements */}
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Achievements</Text>
            <View style={styles.achievementsGrid}>
              {ACHIEVEMENTS.map((a) => (
                <View key={a.label} style={[styles.achieveCard, { backgroundColor: a.color + "10", borderColor: a.color + "20" }]}>
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
          <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Settings</Text>
            <TouchableOpacity onPress={toggleTheme} style={[styles.settingRow, { borderBottomColor: colors.border }]} activeOpacity={0.8}>
              <View style={[styles.settingIcon, { backgroundColor: "#6366F118" }]}><Ionicons name={isDark ? "moon" : "sunny"} size={16} color="#6366F1" /></View>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Dark Mode</Text>
              <View style={[styles.toggle, { backgroundColor: isDark ? "#48BB78" : colors.muted }]}>
                <View style={[styles.toggleThumb, { transform: [{ translateX: isDark ? 18 : 2 }] }]} />
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.settingRow, { borderBottomColor: "transparent" }]} activeOpacity={0.8} onPress={async () => { await logout(); }} >
              <View style={[styles.settingIcon, { backgroundColor: "#E53E3E18" }]}><Ionicons name="log-out-outline" size={16} color="#E53E3E" /></View>
              <Text style={[styles.settingLabel, { color: "#E53E3E" }]}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.border} />
            </TouchableOpacity>
          </View>

          <View style={[styles.cbseRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="ribbon" size={13} color="#48BB78" />
            <Text style={[styles.cbseText, { color: colors.mutedForeground }]}>CBSE Certified Educator • VidyaPath v1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {},
  hero: { alignItems: "center", padding: 24, paddingBottom: 28, gap: 5 },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: "rgba(255,255,255,0.3)", justifyContent: "center", alignItems: "center", marginBottom: 6 },
  avatarText: { color: "#FFFFFF", fontSize: 24, fontFamily: "Poppins_700Bold" },
  heroName: { color: "#FFFFFF", fontSize: 20, fontFamily: "Poppins_700Bold" },
  heroSub: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Poppins_500Medium" },
  heroEmail: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  heroBadges: { flexDirection: "row", gap: 8, marginTop: 6 },
  heroBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  heroBadgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  content: { padding: 16, gap: 14 },
  statsCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, paddingVertical: 14 },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  statDiv: { width: 1, height: 30 },
  section: { borderRadius: 16, borderWidth: 1, padding: 16, gap: 10 },
  sectionTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", marginBottom: 4 },
  aboutText: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20 },
  achievementsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  achieveCard: { width: "31%", borderRadius: 12, borderWidth: 1, padding: 10, alignItems: "center", gap: 5 },
  achieveIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  achieveLabel: { fontSize: 11, fontFamily: "Poppins_700Bold", textAlign: "center" },
  achieveDesc: { fontSize: 9, fontFamily: "Poppins_400Regular", textAlign: "center" },
  settingRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 12, borderBottomWidth: 1 },
  settingIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  settingLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium" },
  toggle: { width: 40, height: 24, borderRadius: 12, justifyContent: "center", paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFFFFF" },
  cbseRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, borderWidth: 1, padding: 10 },
  cbseText: { fontSize: 11, fontFamily: "Poppins_400Regular" },
});
