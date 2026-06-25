import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, Layout, SlideInDown, SlideOutUp } from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";

export default function StudentProfile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkEnabled, setDarkEnabled] = useState(false);
  
  const [upcomingClassesCount, setUpcomingClassesCount] = useState("0");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || "Student");

  const [batch, setBatch] = useState<string>("N/A");
  const [performance, setPerformance] = useState("A+");
  const [attendance, setAttendance] = useState("94%");

  React.useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPush = await AsyncStorage.getItem(`@pushEnabled_${user?.id}`);
        if (storedPush !== null) setPushEnabled(storedPush === "true");

        const storedDark = await AsyncStorage.getItem(`@darkEnabled_${user?.id}`);
        if (storedDark !== null) setDarkEnabled(storedDark === "true");
      } catch (e) {
        console.error("Failed to load preferences", e);
      }
    };
    if (user?.id) loadPreferences();
  }, [user?.id]);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      try {
        const { turso } = await import('../../lib/turso');

        // Fetch batch
        const userRes = await turso.execute({
          sql: "SELECT batch FROM users WHERE id = ?",
          args: [user.id]
        });
        let userBatch = user.class || "Class 12 - Commerce";
        if (userRes.rows.length > 0) {
          userBatch = (userRes.rows[0][0] as string) || userBatch;
        }
        setBatch(userBatch);

        // Fetch upcoming classes for today
        const todayStr = new Date().toISOString().split("T")[0];
        const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
        const todayDay = days[new Date().getDay()];

        const ttRes = await turso.execute({
          sql: "SELECT dayOfWeek, date, type FROM timetable WHERE batch = ?",
          args: [userBatch]
        });
        
        let todaysCount = 0;
        ttRes.rows.forEach(r => {
          const day = r[0] as string;
          const date = r[1] as string;
          const type = r[2] as string;
          if (type === 'one-time' && date === todayStr) todaysCount++;
          if ((type === 'recurring' || !type) && day === todayDay) todaysCount++;
        });
        
        setUpcomingClassesCount(todaysCount.toString());

        // Fetch Performance
        const resRes = await turso.execute({
          sql: "SELECT r.marksObtained, e.totalMarks FROM results r JOIN exams e ON r.examId = e.id WHERE r.studentId = ?",
          args: [user.id]
        });
        if (resRes.rows.length > 0) {
           let totalP = 0;
           resRes.rows.forEach(r => {
              const m = r[0] as number;
              const t = r[1] as number;
              totalP += t > 0 ? (m / t) * 100 : 0;
           });
           const avg = totalP / resRes.rows.length;
           if (avg >= 90) setPerformance("A+");
           else if (avg >= 80) setPerformance("A");
           else if (avg >= 70) setPerformance("B");
           else if (avg >= 60) setPerformance("C");
           else setPerformance("D");
        } else {
           setPerformance("N/A");
        }

      } catch (e) {
        console.error("Stats Error:", e);
      }
    };
    fetchStats();
  }, [user]);

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
      const { turso } = await import('../../lib/turso');
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
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* HEADER */}
        <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        {/* OVERLAPPING PROFILE CARD */}
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
                <Text style={{ color: "#FFF", fontSize: 32, fontFamily: "Poppins_700Bold" }}>{user?.avatar || user?.name?.charAt(0) || "S"}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editBadge} onPress={() => { Haptics.selectionAsync(); setShowEditModal(true); }}>
              <Ionicons name="pencil" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRole}>{(user?.role ?? "Student").toUpperCase()} • ID: {user?.id?.substring(0, 6).toUpperCase() ?? "STU-001"}</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{batch.split("-")[0]?.trim() || "N/A"}</Text>
              <Text style={styles.statLabel}>Grade</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{performance}</Text>
              <Text style={styles.statLabel}>Performance</Text>
            </View>
          </View>
        </View>
        
        {/* ACCOUNT DETAILS */}
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
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Phone</Text>
                  <Text style={styles.detailValue}>+91 98765 43210</Text>
                </View>
                <TouchableOpacity style={styles.editContentBtn} onPress={() => { Haptics.selectionAsync(); setShowEditModal(true); }}>
                  <Text style={styles.editContentText}>Edit Details</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            <View style={styles.divider} />

            <TouchableOpacity style={styles.listItem} onPress={() => toggleSection("academic")} activeOpacity={0.7}>
              <View style={[styles.icon, { backgroundColor: "#F3E8FF" }]}>
                <Ionicons name="school" size={20} color="#8B5CF6" />
              </View>
              <Text style={styles.listTitle}>Academic Details</Text>
              <Ionicons name={expandedSection === "academic" ? "chevron-up" : "chevron-down"} size={20} color="#CBD5E1" />
            </TouchableOpacity>

            {expandedSection === "academic" && (
              <Animated.View entering={SlideInDown} exiting={SlideOutUp} layout={Layout.springify()} style={styles.expandedContent}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Batch</Text>
                  <Text style={styles.detailValue}>{batch}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Attendance</Text>
                  <Text style={styles.detailValue}>{attendance}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Upcoming Classes</Text>
                  <Text style={styles.detailValue}>{upcomingClassesCount}</Text>
                </View>
              </Animated.View>
            )}
          </View>
        </Animated.View>

        {/* PREFERENCES */}
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
                onValueChange={async (val) => { 
                  Haptics.selectionAsync(); 
                  setPushEnabled(val);
                  await AsyncStorage.setItem(`@pushEnabled_${user?.id}`, val ? "true" : "false");
                }} 
                trackColor={{ false: "#E2E8F0", true: "#34D399" }}
                thumbColor={"#FFFFFF"}
              />
            </View>

            <View style={styles.divider} />

            <View style={styles.listItem}>
              <View style={[styles.icon, { backgroundColor: "#F1F5F9" }]}>
                <Ionicons name="moon" size={20} color="#64748B" />
              </View>
              <Text style={styles.listTitle}>Dark Mode</Text>
              <Switch 
                value={darkEnabled} 
                onValueChange={async (val) => { 
                  Haptics.selectionAsync(); 
                  setDarkEnabled(val);
                  await AsyncStorage.setItem(`@darkEnabled_${user?.id}`, val ? "true" : "false");
                  if (val) {
                    alert("Dark mode is coming in the next update!");
                    setTimeout(() => setDarkEnabled(false), 500);
                  }
                }} 
                trackColor={{ false: "#E2E8F0", true: "#3B82F6" }}
                thumbColor={"#FFFFFF"}
              />
            </View>

          </View>
        </Animated.View>

        {/* LOGOUT */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutText}>Sign Out</Text>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      {/* EDIT MODAL */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 }}>
          <View style={{ backgroundColor: "#FFF", borderRadius: 24, padding: 24 }}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 16 }}>Edit Profile</Text>
            
            <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B", marginBottom: 8 }}>Full Name</Text>
            <TextInput
              style={{ backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, fontFamily: "Poppins_500Medium", color: "#0F172A", marginBottom: 24 }}
              value={editName}
              onChangeText={setEditName}
              placeholder="Enter your name"
            />
            
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center" }} onPress={() => setShowEditModal(false)}>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#64748B" }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={{ flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#0EA5E9", alignItems: "center", opacity: saving ? 0.7 : 1 }} onPress={saveProfile} disabled={saving}>
                <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#FFF" }}>{saving ? "Saving..." : "Save Changes"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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

  scroll: { paddingBottom: 100 },
  
  section: { paddingHorizontal: 20, marginBottom: 24 },
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




