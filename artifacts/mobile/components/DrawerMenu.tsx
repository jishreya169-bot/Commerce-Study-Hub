import React, { useContext, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Pressable,
  ScrollView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { ThemeContext } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

interface DrawerMenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route?: string;
  badge?: number;
  action?: () => void;
  accent?: string;
}

interface DrawerMenuProps {
  visible: boolean;
  onClose: () => void;
}

export function DrawerMenu({ visible, onClose }: DrawerMenuProps) {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, courses, tests, doubts, notes, language, setLanguage } = useApp();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const { logout } = useAuth();
  const { width } = useWindowDimensions();

  const slideAnim = useRef(new Animated.Value(-320)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const isDark = theme === "dark";

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, tension: 80, friction: 12, useNativeDriver: false }),
        Animated.timing(overlayAnim, { toValue: 1, duration: 220, useNativeDriver: false }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -320, duration: 220, useNativeDriver: false }),
        Animated.timing(overlayAnim, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const enrolled = courses.filter((c) => c.enrolled).length;
  const openDoubts = doubts.filter((d) => !d.resolved).length;
  const pending = tests.filter((t) => !t.attempted).length;
  const avgProgress = enrolled > 0
    ? Math.round(courses.filter(c => c.enrolled).reduce((a, c) => a + (c.completedLectures / c.totalLectures) * 100, 0) / enrolled)
    : 0;
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const drawerWidth = Math.min(300, width * 0.82);

  const navigate = (route: string) => {
    Haptics.selectionAsync();
    onClose();
    setTimeout(() => router.push(route as any), 220);
  };

  const navItems: DrawerMenuItem[] = [
    { icon: "home", label: "Home", route: "/(tabs)/", accent: colors.primary },
    { icon: "book", label: "My Courses", route: "/(tabs)/courses", badge: enrolled, accent: "#7B8EBF" },
    { icon: "radio", label: "Live Classes", route: "/(tabs)/live", accent: colors.live },
    { icon: "clipboard", label: "Tests & Quizzes", route: "/(tabs)/tests", badge: pending, accent: colors.warning },
    { icon: "help-circle", label: "Doubt Forum", route: "/doubts", badge: openDoubts, accent: colors.primary },
    { icon: "document-text", label: "My Notes", route: "/notes", badge: notes.length, accent: colors.success },
    { icon: "person-circle", label: "Profile", route: "/(tabs)/profile", accent: "#9B7BC4" },
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Overlay */}
      <Animated.View
        style={[styles.overlay, { opacity: overlayAnim }]}
        pointerEvents={visible ? "auto" : "none"}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            width: drawerWidth,
            backgroundColor: colors.card,
            transform: [{ translateX: slideAnim }],
            paddingTop: topPad,
          },
        ]}
      >
        {/* Close */}
        <TouchableOpacity style={[styles.closeBtn, { backgroundColor: colors.muted }]} onPress={onClose} activeOpacity={0.7}>
          <Ionicons name="close" size={18} color={colors.mutedForeground} />
        </TouchableOpacity>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.drawerContent, { paddingBottom: insets.bottom + 20 }]}>
          {/* User Profile Card */}
          <View style={[styles.profileCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "22" }]}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{user.avatar}</Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.foreground }]} numberOfLines={1}>{user.name}</Text>
              <Text style={[styles.profileClass, { color: colors.mutedForeground }]}>{user.class}</Text>
              <Text style={[styles.profileSchool, { color: colors.mutedForeground }]} numberOfLines={1}>{user.school}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigate("/(tabs)/profile")}
              style={[styles.editBtn, { backgroundColor: colors.primary }]}
              activeOpacity={0.8}
            >
              <Ionicons name="pencil" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Stats Strip */}
          <View style={[styles.statsStrip, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <View style={styles.stripItem}>
              <Ionicons name="flame" size={14} color={colors.warning} />
              <Text style={[styles.stripVal, { color: colors.foreground }]}>{user.streak}d</Text>
              <Text style={[styles.stripLabel, { color: colors.mutedForeground }]}>Streak</Text>
            </View>
            <View style={[styles.stripDiv, { backgroundColor: colors.border }]} />
            <View style={styles.stripItem}>
              <Ionicons name="star" size={14} color={colors.warning} />
              <Text style={[styles.stripVal, { color: colors.foreground }]}>{(user.totalPoints / 1000).toFixed(1)}k</Text>
              <Text style={[styles.stripLabel, { color: colors.mutedForeground }]}>Points</Text>
            </View>
            <View style={[styles.stripDiv, { backgroundColor: colors.border }]} />
            <View style={styles.stripItem}>
              <Ionicons name="trophy" size={14} color="#9B7BC4" />
              <Text style={[styles.stripVal, { color: colors.foreground }]}>#{user.rank}</Text>
              <Text style={[styles.stripLabel, { color: colors.mutedForeground }]}>Rank</Text>
            </View>
            <View style={[styles.stripDiv, { backgroundColor: colors.border }]} />
            <View style={styles.stripItem}>
              <Ionicons name="trending-up" size={14} color={colors.success} />
              <Text style={[styles.stripVal, { color: colors.foreground }]}>{avgProgress}%</Text>
              <Text style={[styles.stripLabel, { color: colors.mutedForeground }]}>Avg</Text>
            </View>
          </View>

          {/* Navigation */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>NAVIGATION</Text>
          <View style={[styles.navCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {navItems.map((item, i) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => item.route ? navigate(item.route) : item.action?.()}
                style={[styles.navRow, { borderBottomColor: i === navItems.length - 1 ? "transparent" : colors.border }]}
                activeOpacity={0.7}
              >
                <View style={[styles.navIcon, { backgroundColor: (item.accent ?? colors.primary) + "18" }]}>
                  <Ionicons name={item.icon} size={16} color={item.accent ?? colors.primary} />
                </View>
                <Text style={[styles.navLabel, { color: colors.foreground }]}>{item.label}</Text>
                {item.badge != null && item.badge > 0 && (
                  <View style={[styles.navBadge, { backgroundColor: item.accent ?? colors.primary }]}>
                    <Text style={styles.navBadgeText}>{item.badge}</Text>
                  </View>
                )}
                <Ionicons name="chevron-forward" size={14} color={colors.border} style={{ marginLeft: item.badge ? 4 : 0 }} />
              </TouchableOpacity>
            ))}
          </View>

          {/* Settings */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>SETTINGS</Text>
          <View style={[styles.navCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
            {/* Dark mode toggle */}
            <View style={[styles.navRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.navIcon, { backgroundColor: "#6366F118" }]}>
                <Ionicons name={isDark ? "moon" : "sunny"} size={16} color="#6366F1" />
              </View>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>Dark Mode</Text>
              <TouchableOpacity
                onPress={() => { toggleTheme(); Haptics.selectionAsync(); }}
                style={[styles.toggle, { backgroundColor: isDark ? colors.primary : colors.muted }]}
                activeOpacity={0.85}
              >
                <Animated.View style={[styles.toggleThumb, { transform: [{ translateX: isDark ? 18 : 2 }] }]} />
              </TouchableOpacity>
            </View>
            {/* Language */}
            <View style={[styles.navRow, { borderBottomColor: colors.border }]}>
              <View style={[styles.navIcon, { backgroundColor: colors.success + "18" }]}>
                <Ionicons name="language" size={16} color={colors.success} />
              </View>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>Language</Text>
              <TouchableOpacity
                onPress={() => { setLanguage(language === "en" ? "hi" : "en"); Haptics.selectionAsync(); }}
                style={[styles.langChip, { backgroundColor: colors.primary + "18", borderColor: colors.primary + "30" }]}
                activeOpacity={0.8}
              >
                <Text style={[styles.langText, { color: colors.primary }]}>
                  {language === "en" ? "English" : "हिंदी"}
                </Text>
              </TouchableOpacity>
            </View>
            {/* Notifications */}
            <TouchableOpacity style={[styles.navRow, { borderBottomColor: colors.border }]} activeOpacity={0.7}>
              <View style={[styles.navIcon, { backgroundColor: colors.warning + "18" }]}>
                <Ionicons name="notifications" size={16} color={colors.warning} />
              </View>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>Notifications</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.border} />
            </TouchableOpacity>
            {/* Downloads */}
            <TouchableOpacity style={[styles.navRow, { borderBottomColor: colors.border }]} activeOpacity={0.7}>
              <View style={[styles.navIcon, { backgroundColor: colors.primary + "18" }]}>
                <Ionicons name="download" size={16} color={colors.primary} />
              </View>
              <Text style={[styles.navLabel, { color: colors.foreground }]}>Downloads</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.border} />
            </TouchableOpacity>
            {/* Sign Out */}
            <TouchableOpacity
              style={[styles.navRow, { borderBottomColor: "transparent" }]}
              activeOpacity={0.7}
              onPress={async () => { onClose(); await logout(); }}
            >
              <View style={[styles.navIcon, { backgroundColor: "#E53E3E18" }]}>
                <Ionicons name="log-out-outline" size={16} color="#E53E3E" />
              </View>
              <Text style={[styles.navLabel, { color: "#E53E3E" }]}>Sign Out</Text>
              <Ionicons name="chevron-forward" size={14} color={colors.border} />
            </TouchableOpacity>
          </View>

          {/* About / Features */}
          <Text style={[styles.sectionLabel, { color: colors.mutedForeground }]}>ABOUT VIDYAPATH</Text>
          <View style={[styles.aboutCard, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "20" }]}>
            <View style={styles.aboutHeader}>
              <View style={[styles.aboutLogo, { backgroundColor: colors.primary }]}>
                <Ionicons name="school" size={18} color="#FFFFFF" />
              </View>
              <View>
                <Text style={[styles.aboutTitle, { color: colors.foreground }]}>VidyaPath LMS</Text>
                <Text style={[styles.aboutSub, { color: colors.mutedForeground }]}>Class 11–12 Commerce • CBSE</Text>
              </View>
            </View>
            {[
              { icon: "videocam" as const, text: "Live & recorded classes with real-time chat" },
              { icon: "help-circle" as const, text: "Doubt forum with expert teacher answers" },
              { icon: "document-text" as const, text: "Personal notes with color-coding" },
              { icon: "clipboard" as const, text: "Subject-wise tests with detailed analysis" },
              { icon: "trending-up" as const, text: "Track progress across all subjects" },
            ].map((f) => (
              <View key={f.text} style={styles.featureRow}>
                <View style={[styles.featureDot, { backgroundColor: colors.primary + "20" }]}>
                  <Ionicons name={f.icon} size={13} color={colors.primary} />
                </View>
                <Text style={[styles.featureText, { color: colors.mutedForeground }]}>{f.text}</Text>
              </View>
            ))}
          </View>

          {/* CBSE + Version */}
          <View style={styles.footer}>
            <View style={[styles.cbseBadge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <Ionicons name="ribbon" size={13} color={colors.primary} />
              <Text style={[styles.cbseText, { color: colors.mutedForeground }]}>CBSE Aligned 2025–26</Text>
            </View>
            <Text style={[styles.version, { color: colors.mutedForeground }]}>v1.0.0</Text>
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(0,0,0,0.42)" },
  drawer: { position: "absolute", left: 0, top: 0, bottom: 0, shadowColor: "#000", shadowOffset: { width: 4, height: 0 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 20 },
  closeBtn: { position: "absolute", right: 14, top: 54, width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", zIndex: 10 },
  drawerContent: { padding: 16, gap: 12 },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 16, borderWidth: 1, padding: 14 },
  avatar: { width: 50, height: 50, borderRadius: 25, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 17, fontFamily: "Poppins_700Bold" },
  profileInfo: { flex: 1, gap: 1 },
  profileName: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  profileClass: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  profileSchool: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  editBtn: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  statsStrip: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, paddingVertical: 10 },
  stripItem: { flex: 1, alignItems: "center", gap: 1 },
  stripDiv: { width: 1, height: 28 },
  stripVal: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  stripLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  sectionLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold", letterSpacing: 0.8, marginTop: 4, marginLeft: 2 },
  navCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  navRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1 },
  navIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  navLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium" },
  navBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 10 },
  navBadgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold" },
  toggle: { width: 40, height: 24, borderRadius: 12, justifyContent: "center", paddingHorizontal: 2 },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: "#FFFFFF" },
  langChip: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  langText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  aboutCard: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 10 },
  aboutHeader: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 4 },
  aboutLogo: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  aboutTitle: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  aboutSub: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  featureRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  featureDot: { width: 26, height: 26, borderRadius: 8, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  featureText: { flex: 1, fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 17 },
  footer: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 4 },
  cbseBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 12, borderWidth: 1 },
  cbseText: { fontSize: 10, fontFamily: "Poppins_500Medium" },
  version: { fontSize: 10, fontFamily: "Poppins_400Regular" },
});
