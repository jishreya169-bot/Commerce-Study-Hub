import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuth, UserRole } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

const ROLES: { key: UserRole; label: string; icon: keyof typeof Ionicons.glyphMap; color: string; desc: string }[] = [
  { key: "student", label: "Student", icon: "school", color: "#5B9BD5", desc: "Class 11–12 Commerce" },
  { key: "teacher", label: "Teacher", icon: "person-circle", color: "#48BB78", desc: "Instructor Portal" },
  { key: "admin", label: "Admin", icon: "shield-checkmark", color: "#9B7BC4", desc: "Management Portal" },
];

const DEMO: Record<UserRole, { email: string; pass: string }> = {
  student: { email: "student@vidyapath.in", pass: "vidya123" },
  teacher: { email: "teacher@vidyapath.in", pass: "vidya123" },
  admin: { email: "admin@vidyapath.in", pass: "vidya123" },
};

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const roleColor = ROLES.find((r) => r.key === selectedRole)?.color ?? colors.primary;

  const fillDemo = () => {
    const d = DEMO[selectedRole];
    setEmail(d.email);
    setPassword(d.pass);
    setError("");
    Haptics.selectionAsync();
  };

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter email and password."); return; }
    setLoading(true);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Login failed.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    // AuthRedirect in _layout handles navigation
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 30 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={[styles.logoCircle, { backgroundColor: roleColor }]}>
            <Ionicons name="school" size={28} color="#FFFFFF" />
          </View>
          <View>
            <Text style={[styles.appName, { color: colors.foreground }]}>VidyaPath</Text>
            <Text style={[styles.appSub, { color: colors.mutedForeground }]}>Class 11–12 LMS</Text>
          </View>
        </View>

        {/* Headline */}
        <Text style={[styles.headline, { color: colors.foreground }]}>Welcome back!</Text>
        <Text style={[styles.subline, { color: colors.mutedForeground }]}>Sign in to continue your learning journey.</Text>

        {/* Role Selector */}
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              onPress={() => { setSelectedRole(r.key); setError(""); Haptics.selectionAsync(); }}
              style={[
                styles.roleCard,
                { borderColor: selectedRole === r.key ? r.color : colors.border, backgroundColor: selectedRole === r.key ? r.color + "10" : colors.card },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.roleIcon, { backgroundColor: r.color + "18" }]}>
                <Ionicons name={r.icon} size={20} color={r.color} />
              </View>
              <Text style={[styles.roleLabel, { color: selectedRole === r.key ? r.color : colors.foreground }]}>{r.label}</Text>
              <Text style={[styles.roleDesc, { color: colors.mutedForeground }]} numberOfLines={1}>{r.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Form */}
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.formTitle, { color: colors.foreground }]}>Sign In</Text>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Email</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: error && !email ? "#E53E3E" : colors.border }]}>
              <Ionicons name="mail-outline" size={16} color={colors.mutedForeground} />
              <TextInput
                value={email}
                onChangeText={(v) => { setEmail(v); setError(""); }}
                placeholder="your@email.com"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground }]}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>Password</Text>
            <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: error && !password ? "#E53E3E" : colors.border }]}>
              <Ionicons name="lock-closed-outline" size={16} color={colors.mutedForeground} />
              <TextInput
                value={password}
                onChangeText={(v) => { setPassword(v); setError(""); }}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.input, { color: colors.foreground }]}
                secureTextEntry={!showPass}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                <Ionicons name={showPass ? "eye-off-outline" : "eye-outline"} size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Error */}
          {error !== "" && (
            <View style={[styles.errorBox, { backgroundColor: "#FFF5F5", borderColor: "#FED7D7" }]}>
              <Ionicons name="alert-circle" size={14} color="#E53E3E" />
              <Text style={[styles.errorText, { color: "#C53030" }]}>{error}</Text>
            </View>
          )}

          {/* Sign In */}
          <TouchableOpacity
            onPress={handleLogin}
            style={[styles.signInBtn, { backgroundColor: roleColor, opacity: loading ? 0.8 : 1 }]}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <><Ionicons name="log-in-outline" size={18} color="#FFFFFF" /><Text style={styles.signInText}>Sign In</Text></>
            }
          </TouchableOpacity>
        </View>

        {/* Demo credentials */}
        <View style={[styles.demoBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <View style={styles.demoHeader}>
            <Ionicons name="information-circle" size={15} color={roleColor} />
            <Text style={[styles.demoTitle, { color: colors.foreground }]}>Demo Credentials — {ROLES.find(r => r.key === selectedRole)?.label}</Text>
          </View>
          <Text style={[styles.demoLine, { color: colors.mutedForeground }]}>Email: {DEMO[selectedRole].email}</Text>
          <Text style={[styles.demoLine, { color: colors.mutedForeground }]}>Password: {DEMO[selectedRole].pass}</Text>
          <TouchableOpacity onPress={fillDemo} style={[styles.fillBtn, { backgroundColor: roleColor + "18", borderColor: roleColor + "30" }]} activeOpacity={0.8}>
            <Ionicons name="flash" size={13} color={roleColor} />
            <Text style={[styles.fillText, { color: roleColor }]}>Fill Demo Credentials</Text>
          </TouchableOpacity>
        </View>

        {/* CBSE badge */}
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="ribbon" size={12} color={colors.primary} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>CBSE Aligned 2025–26</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: colors.muted, borderColor: colors.border }]}>
            <Ionicons name="shield-checkmark" size={12} color={colors.success} />
            <Text style={[styles.badgeText, { color: colors.mutedForeground }]}>Secure Login</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { paddingHorizontal: 20, gap: 0 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  logoCircle: { width: 52, height: 52, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  appName: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  appSub: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  headline: { fontSize: 26, fontFamily: "Poppins_700Bold", marginBottom: 4 },
  subline: { fontSize: 13, fontFamily: "Poppins_400Regular", marginBottom: 22, lineHeight: 20 },
  roleRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  roleCard: { flex: 1, borderRadius: 14, borderWidth: 1.5, padding: 10, alignItems: "center", gap: 5 },
  roleIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  roleLabel: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  roleDesc: { fontSize: 9, fontFamily: "Poppins_400Regular", textAlign: "center" },
  formCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 14, marginBottom: 14 },
  formTitle: { fontSize: 17, fontFamily: "Poppins_700Bold", marginBottom: 2 },
  fieldGroup: { gap: 5 },
  fieldLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginLeft: 2 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11 },
  input: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  errorText: { fontSize: 12, fontFamily: "Poppins_500Medium", flex: 1 },
  signInBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  signInText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  demoBox: { borderRadius: 14, borderWidth: 1, padding: 14, gap: 6, marginBottom: 16 },
  demoHeader: { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  demoTitle: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  demoLine: { fontSize: 11, fontFamily: "Poppins_400Regular", marginLeft: 2 },
  fillBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, borderWidth: 1, paddingVertical: 8, marginTop: 4 },
  fillText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  badges: { flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
});
