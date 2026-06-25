import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";
import { LoginIllustration } from "@/components/svg/LoginIllustration";
import { VidyaPathLogo } from "@/components/svg/Logo";
import { DotGrid } from "@/components/svg/DecorativeShapes";

export default function LoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) {
      setError(result.error ?? "Login failed. Please check your credentials.");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
    // AuthRedirect in _layout handles navigation based on role
  };

  return (
    <KeyboardAvoidingView style={[styles.root, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 30 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoRow}>
          <VidyaPathLogo size={48} color={colors.primary} />
          <View>
            <Text style={[styles.appName, { color: colors.foreground }]}>Webvibezzz</Text>
            <Text style={[styles.appSub, { color: colors.mutedForeground }]}>Academy</Text>
          </View>
        </View>

        {/* Illustration */}
        <View style={styles.illustrationWrap}>
          <DotGrid color={colors.primary} cols={7} rows={3} gap={14} opacity={0.15} style={styles.dotGridLeft} />
          <LoginIllustration color={colors.primary} size={220} />
          <DotGrid color={colors.primary} cols={7} rows={3} gap={14} opacity={0.15} style={styles.dotGridRight} />
        </View>

        {/* Headline */}
        <Text style={[styles.headline, { color: colors.foreground }]}>Welcome back!</Text>
        <Text style={[styles.subline, { color: colors.mutedForeground }]}>Sign in with your email and password to continue.</Text>

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
                autoCorrect={false}
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
            style={[styles.signInBtn, { backgroundColor: colors.primary, opacity: loading ? 0.8 : 1 }]}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#FFFFFF" size="small" />
              : <><Ionicons name="log-in-outline" size={18} color="#FFFFFF" /><Text style={styles.signInText}>Sign In</Text></>
            }
          </TouchableOpacity>
        </View>

        {/* Demo Quick-Login */}
        <View style={[styles.demoBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.demoHeader}>
            <Ionicons name="flash" size={14} color="#D69E2E" />
            <Text style={[styles.demoTitle, { color: colors.foreground }]}>Quick Demo Login</Text>
          </View>
          <Text style={[styles.demoHint, { color: colors.mutedForeground }]}>Tap any role to auto-fill credentials</Text>
          <View style={styles.demoRoles}>
            {[
              { label: "Student", email: "student@vidyapath.in", icon: "school", color: "#5B9BD5" },
              { label: "Teacher", email: "teacher@vidyapath.in", icon: "person", color: "#48BB78" },
              { label: "Admin", email: "admin@vidyapath.in", icon: "shield-checkmark", color: "#9B7BC4" },
              { label: "Parent", email: "parent@vidyapath.in", icon: "people", color: "#F59E0B" },
            ].map((r) => (
              <TouchableOpacity
                key={r.label}
                onPress={() => { setEmail(r.email); setPassword("vidya123"); setError(""); Haptics.selectionAsync(); }}
                style={[styles.demoRole, { backgroundColor: r.color + "15", borderColor: r.color + "40" }]}
                activeOpacity={0.8}
              >
                <Ionicons name={r.icon as any} size={16} color={r.color} />
                <Text style={[styles.demoRoleText, { color: r.color }]}>{r.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={[styles.demoPass, { color: colors.mutedForeground }]}>Password: <Text style={{ fontFamily: "Poppins_700Bold", color: colors.foreground }}>vidya123</Text></Text>
        </View>

        {/* CBSE badge */}
        <View style={styles.badges}>

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
  scroll: { paddingHorizontal: 22, gap: 0 },
  logoRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 24 },
  appName: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  appSub: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  illustrationWrap: { alignItems: "center", justifyContent: "center", marginBottom: 20, position: "relative", height: 160 },
  dotGridLeft: { position: "absolute", left: 0, top: 10 },
  dotGridRight: { position: "absolute", right: 0, top: 10 },
  headline: { fontSize: 26, fontFamily: "Poppins_700Bold", marginBottom: 6 },
  subline: { fontSize: 13, fontFamily: "Poppins_400Regular", marginBottom: 24, lineHeight: 20 },
  formCard: { borderRadius: 18, borderWidth: 1, padding: 18, gap: 14, marginBottom: 14 },
  formTitle: { fontSize: 17, fontFamily: "Poppins_700Bold", marginBottom: 2 },
  fieldGroup: { gap: 5 },
  fieldLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginLeft: 2 },
  inputRow: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 11 },
  input: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular" },
  errorBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 10, borderWidth: 1, padding: 10 },
  errorText: { fontSize: 12, fontFamily: "Poppins_500Medium", flex: 1 },
  signInBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14, marginTop: 4 },
  signInText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  infoBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 16 },
  infoText: { flex: 1, fontSize: 11, fontFamily: "Poppins_400Regular", lineHeight: 16 },
  badges: { flexDirection: "row", gap: 8, justifyContent: "center", marginTop: 4 },
  badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, borderWidth: 1 },
  badgeText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  demoBox: { borderRadius: 16, borderWidth: 1, padding: 14, marginBottom: 16, gap: 8 },
  demoHeader: { flexDirection: "row", alignItems: "center", gap: 6 },
  demoTitle: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  demoHint: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  demoRoles: { flexDirection: "row", gap: 8 },
  demoRole: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 9, borderRadius: 12, borderWidth: 1 },
  demoRoleText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  demoPass: { fontSize: 11, fontFamily: "Poppins_400Regular", textAlign: "center" },
});
