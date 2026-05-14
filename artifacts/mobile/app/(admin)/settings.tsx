import React, { useState, useContext } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { ThemeContext } from "@/context/ThemeContext";
import * as Haptics from "expo-haptics";

const SECTIONS = [
  {
    title: "Platform",
    items: [
      { key: "maintenance", icon: "construct", label: "Maintenance Mode", desc: "Put the app in read-only maintenance mode", color: "#D69E2E", toggle: true },
      { key: "registration", icon: "person-add", label: "Student Registration", desc: "Allow new student sign-ups", color: "#48BB78", toggle: true },
      { key: "teacherSelfReg", icon: "person-circle", label: "Teacher Self-Registration", desc: "Allow teachers to register themselves", color: "#5B9BD5", toggle: false },
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
      { key: "guestPreview", icon: "eye", label: "Guest Preview", desc: "Allow non-logged-in users to preview courses", color: "#BF7B5B", toggle: false },
    ],
  },
];

const QUICK_ACTIONS = [
  { icon: "download", label: "Export Data", desc: "Download all student/teacher data as CSV", color: "#5B9BD5" },
  { icon: "refresh", label: "Clear Cache", desc: "Clear app cache and temp files", color: "#7B8EBF" },
  { icon: "analytics", label: "Analytics Report", desc: "Generate monthly usage report", color: "#9B7BC4" },
  { icon: "cloud-upload", label: "Backup Now", desc: "Run manual database backup", color: "#48BB78" },
];

export default function AdminSettings() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const isDark = theme === "dark";
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const [toggles, setToggles] = useState<Record<string, boolean>>({
    maintenance: false,
    registration: true,
    teacherSelfReg: false,
    emailNotifs: true,
    liveAlerts: true,
    doubtAlerts: true,
    moderation: true,
    comments: true,
    guestPreview: false,
  });

  const flip = (key: string) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
    Haptics.selectionAsync();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Settings</Text>
        <View style={[styles.adminBadge, { backgroundColor: "#9B7BC418" }]}>
          <Ionicons name="shield-checkmark" size={12} color="#9B7BC4" />
          <Text style={[styles.adminBadgeText, { color: "#9B7BC4" }]}>Admin</Text>
        </View>
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
            <View style={[styles.settingIcon, { backgroundColor: "#6366F118" }]}><Ionicons name={isDark ? "moon" : "sunny"} size={16} color="#6366F1" /></View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingLabel, { color: colors.foreground }]}>Dark Mode</Text>
              <Text style={[styles.settingDesc, { color: colors.mutedForeground }]}>Toggle dark/light interface</Text>
            </View>
            <TouchableOpacity onPress={() => { toggleTheme(); Haptics.selectionAsync(); }} style={[styles.toggle, { backgroundColor: isDark ? "#9B7BC4" : colors.muted }]} activeOpacity={0.85}>
              <View style={[styles.toggleThumb, { transform: [{ translateX: isDark ? 18 : 2 }] }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Setting Sections */}
        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.sectionBlock}>
            <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>{section.title.toUpperCase()}</Text>
            <View style={[styles.settingCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              {section.items.map((item, i) => (
                <View key={item.key} style={[styles.settingRow, { borderBottomColor: i === section.items.length - 1 ? "transparent" : colors.border }]}>
                  <View style={[styles.settingIcon, { backgroundColor: item.color + "18" }]}><Ionicons name={item.icon as any} size={16} color={item.color} /></View>
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
          {QUICK_ACTIONS.map((a, i) => (
            <TouchableOpacity
              key={a.label}
              style={[styles.settingRow, { borderBottomColor: i === QUICK_ACTIONS.length - 1 ? "transparent" : colors.border }]}
              activeOpacity={0.8}
              onPress={() => Haptics.selectionAsync()}
            >
              <View style={[styles.settingIcon, { backgroundColor: a.color + "18" }]}><Ionicons name={a.icon as any} size={16} color={a.color} /></View>
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
          <Text style={[styles.versionText, { color: colors.mutedForeground }]}>VidyaPath LMS Admin • v1.0.0 • CBSE 2025–26</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 20, fontFamily: "Poppins_700Bold" },
  adminBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  adminBadgeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  scroll: { padding: 16, gap: 14 },
  adminCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  adminAvatar: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  adminAvatarText: { color: "#FFFFFF", fontSize: 17, fontFamily: "Poppins_700Bold" },
  adminInfo: { flex: 1, gap: 2 },
  adminName: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  adminEmail: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  adminRole: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  editBtn: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  sysCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  sysCardTitle: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  sysRow: { flexDirection: "row", gap: 8 },
  sysStat: { flex: 1, borderRadius: 10, padding: 8, alignItems: "center", gap: 3 },
  sysStatVal: { fontSize: 10, fontFamily: "Poppins_700Bold", textAlign: "center" },
  sysStatLabel: { fontSize: 8, fontFamily: "Poppins_400Regular", textAlign: "center" },
  sectionBlock: { gap: 8 },
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
});
