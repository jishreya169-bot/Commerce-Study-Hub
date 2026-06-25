import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, Layout, SlideInDown, SlideOutUp } from "react-native-reanimated";
import { Image } from "expo-image";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { turso } from "../../lib/turso";
import { useAuth } from "@/context/AuthContext";

export default function TeacherProfile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  
  // Prefs
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);

  // Edit State
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || "Teacher");

  // Stats
  const [totalClasses, setTotalClasses] = useState("0");
  const [doubtsResolved, setDoubtsResolved] = useState("0");

  useEffect(() => {
    // Load preferences
    AsyncStorage.getItem("teacher_prefs").then(p => {
      if(p) {
        const prefs = JSON.parse(p);
        setPushEnabled(prefs.push ?? true);
        setEmailEnabled(prefs.email ?? false);
      }
    });

    const fetchStats = async () => {
      if (!user?.id) return;
      try {
        const classRes = await turso.execute({
          sql: "SELECT COUNT(DISTINCT batch) FROM timetable WHERE teacherId = ?",
          args: [user.id]
        });
        const doubtsRes = await turso.execute({
          sql: "SELECT COUNT(*) FROM doubts WHERE teacherId = ? AND resolved = 1",
          args: [user.id]
        });
        setTotalClasses(classRes.rows[0]?.[0]?.toString() || "0");
        setDoubtsResolved(doubtsRes.rows[0]?.[0]?.toString() || "0");
      } catch (e) {
        console.error("Stats Error:", e);
      }
    };
    fetchStats();
  }, [user?.id]);

  const savePrefs = (key: string, val: boolean) => {
    const prefs = { push: pushEnabled, email: emailEnabled, [key]: val };
    AsyncStorage.setItem("teacher_prefs", JSON.stringify(prefs));
  };

  const toggleSection = (section: string) => {
    Haptics.selectionAsync();
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleLogout = async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    await logout();
    router.replace("/login");
  };

  const saveProfile = async () => {
    if (!editName.trim()) return;
    setSaving(true);
    try {
      if (user?.id) {
        await turso.execute({
          sql: "UPDATE users SET name = ? WHERE id = ?",
          args: [editName.trim(), user.id]
        });
      }
      setDisplayName(editName.trim());
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowEditModal(false);
    } catch (e) {
      console.error(e);
      alert("Failed to update profile.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll} bounces={false}>
        
        {/* ── HEADER ── */}
        <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Profile & Settings</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        {/* ── PROFILE CARD ── */}
        <View style={styles.profileBox}>
          <View style={styles.avatarWrap}>
            {user?.avatar === 'boy' ? (
              <Image source={{ uri: "https://avatar.iran.liara.run/public/boy" }} style={styles.avatarImage} contentFit="cover" transition={200} />
            ) : user?.avatar === 'girl' ? (
              <Image source={{ uri: "https://avatar.iran.liara.run/public/girl" }} style={styles.avatarImage} contentFit="cover" transition={200} />
            ) : user?.avatar && user.avatar.length > 2 ? (
              <Image source={{ uri: user.avatar }} style={styles.avatarImage} contentFit="cover" transition={200} />
            ) : (
              <View style={[styles.avatarImage, { backgroundColor: "#2563EB", justifyContent: "center", alignItems: "center" }]}>
                <Text style={{ color: "#FFF", fontSize: 32, fontFamily: "Poppins_700Bold" }}>{user?.avatar || user?.name?.charAt(0) || "T"}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editBadge} onPress={() => { Haptics.selectionAsync(); setShowEditModal(true); }}>
              <Ionicons name="camera" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRole}>{(user?.role ?? "Teacher").toUpperCase()} • ID: {user?.id?.substring(0, 6).toUpperCase() ?? "TCH-001"}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{totalClasses}</Text>
              <Text style={styles.statLabel}>Active Batches</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{doubtsResolved}</Text>
              <Text style={styles.statLabel}>Doubts Resolved</Text>
            </View>
          </View>
        </View>

        {/* ── ACCOUNT DETAILS ── */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          <View style={styles.cardBlock}>
            
            <TouchableOpacity style={styles.listItem} onPress={() => toggleSection("personal")} activeOpacity={0.7}>
              <View style={[styles.icon, { backgroundColor: "#EFF6FF" }]}>
                <Ionicons name="person" size={20} color="#3B82F6" />
              </View>
              <Text style={styles.listTitle}>Personal Details</Text>
              <Ionicons name={expandedSection === "personal" ? "chevron-up" : "chevron-down"} size={20} color="#CBD5E1" />
            </TouchableOpacity>
            
            {expandedSection === "personal" && (
              <Animated.View entering={SlideInDown} exiting={SlideOutUp} layout={Layout.springify()} style={styles.expandedContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Email</Text>
                  <Text style={styles.detailValue}>{user?.email ?? "Not Provided"}</Text>
                </View>
                <TouchableOpacity style={styles.editContentBtn} onPress={() => setShowEditModal(true)}>
                  <Text style={styles.editContentText}>Edit Details</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem} onPress={() => toggleSection("academic")} activeOpacity={0.7}>
              <View style={[styles.icon, { backgroundColor: "#F3E8FF" }]}>
                <Ionicons name="school" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.listTitle}>Academic Portfolio</Text>
              <Ionicons name={expandedSection === "academic" ? "chevron-up" : "chevron-down"} size={20} color="#CBD5E1" />
            </TouchableOpacity>

            {expandedSection === "academic" && (
              <Animated.View entering={SlideInDown} exiting={SlideOutUp} layout={Layout.springify()} style={styles.expandedContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Subject Area</Text>
                  <Text style={styles.detailValue}>Commerce Studies</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Role Status</Text>
                  <Text style={[styles.detailValue, { color: "#10B981" }]}>Active Staff</Text>
                </View>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* ── PREFERENCES ── */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.cardBlock}>
            
            <View style={styles.listItem}>
              <View style={[styles.icon, { backgroundColor: "#FFFBEB" }]}>
                <Ionicons name="notifications" size={20} color="#F59E0B" />
              </View>
              <Text style={styles.listTitle}>Push Notifications</Text>
              <Switch 
                value={pushEnabled} 
                onValueChange={(val) => { Haptics.selectionAsync(); setPushEnabled(val); savePrefs("push", val); }} 
                trackColor={{ false: "#E2E8F0", true: "#34D399" }}
                thumbColor={"#FFFFFF"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.listItem}>
              <View style={[styles.icon, { backgroundColor: "#ECFDF5" }]}>
                <Ionicons name="mail" size={20} color="#10B981" />
              </View>
              <Text style={styles.listTitle}>Student Progress Emails</Text>
              <Switch 
                value={emailEnabled} 
                onValueChange={(val) => { Haptics.selectionAsync(); setEmailEnabled(val); savePrefs("email", val); }} 
                trackColor={{ false: "#E2E8F0", true: "#34D399" }}
                thumbColor={"#FFFFFF"}
              />
            </View>

          </View>
        </Animated.View>

        {/* ── LOGOUT ── */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* ── EDIT PROFILE MODAL ── */}
      {showEditModal && (
        <View style={StyleSheet.absoluteFill}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" }}>Edit Profile</Text>
                <TouchableOpacity onPress={() => setShowEditModal(false)}>
                  <Ionicons name="close-circle" size={28} color="#94A3B8" />
                </TouchableOpacity>
              </View>

              <View style={{ marginBottom: 16 }}>
                <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8 }}>Name</Text>
                <TextInput 
                  style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A" }} 
                  placeholder="Your Name" 
                  value={editName} 
                  onChangeText={setEditName} 
                />
              </View>

              <TouchableOpacity 
                style={{ backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 10 }} 
                onPress={saveProfile}
                disabled={saving}
              >
                <Text style={{ color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" }}>{saving ? "Saving..." : "Save Changes"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" }, 
  
  header: { paddingHorizontal: 20, paddingBottom: 12, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  
  profileBox: { alignItems: "center", zIndex: 10, marginTop: -30, backgroundColor: "#FFF", marginHorizontal: 20, borderRadius: 24, paddingVertical: 24, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 4 },
  avatarWrap: { width: 100, height: 100, borderRadius: 50, backgroundColor: "#FFF", padding: 4, justifyContent: "center", alignItems: "center", marginBottom: 16, position: "relative", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  avatarImage: { width: 92, height: 92, borderRadius: 46 },
  editBadge: { position: "absolute", bottom: 2, right: 2, backgroundColor: "#0EA5E9", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center", borderWidth: 3, borderColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 3 },
  userName: { fontSize: 22, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 2 },
  userRole: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B", marginBottom: 16 },
  statsRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", width: "100%", paddingHorizontal: 20 },
  statBox: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0EA5E9" },
  statLabel: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#94A3B8" },
  statDivider: { width: 1, height: 30, backgroundColor: "#E2E8F0" },

  scroll: { paddingBottom: 100, paddingTop: 0 },
  
  section: { paddingHorizontal: 20, marginBottom: 24, marginTop: 24 },
  sectionTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#64748B", marginBottom: 12, marginLeft: 4, textTransform: "uppercase", letterSpacing: 0.5 },
  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, gap: 14 },
  icon: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  listTitle: { flex: 1, fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#334155" },
  divider: { height: 1, backgroundColor: "#F1F5F9" },

  expandedContent: { backgroundColor: "#F8FAFC", borderRadius: 16, padding: 16, marginBottom: 18, gap: 12 },
  detailRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  detailLabel: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B" },
  detailValue: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A" },
  editContentBtn: { marginTop: 8, alignSelf: "flex-end" },
  editContentText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" },

  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FEF2F2", paddingVertical: 18, borderRadius: 20, gap: 8, borderWidth: 1, borderColor: "#FEE2E2" },
  logoutText: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#EF4444" },
});




