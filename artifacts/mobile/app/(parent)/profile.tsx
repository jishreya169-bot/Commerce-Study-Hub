import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Modal, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, Layout, SlideInDown, SlideOutUp } from "react-native-reanimated";
import { useAuth } from "@/context/AuthContext";
import { Image } from "expo-image";
import { turso } from "@/lib/turso";

export default function ParentProfile() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [darkEnabled, setDarkEnabled] = useState(false);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState(user?.name || "Parent");

  const [childName, setChildName] = useState("Your Child");

  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const storedPush = await AsyncStorage.getItem(`@pushEnabled_${user?.id}`);
        if (storedPush !== null) setPushEnabled(storedPush === "true");

        const storedDark = await AsyncStorage.getItem(`@darkEnabled_${user?.id}`);
        if (storedDark !== null) setDarkEnabled(storedDark === "true");
        
        // Fetch child name for display
        const childRes = await turso.execute({
          sql: "SELECT name FROM users WHERE parentId = ?",
          args: [user?.id || ""]
        });
        if (childRes.rows.length > 0) {
          setChildName(childRes.rows[0][0] as string);
        } else {
          setChildName("Priya Sharma (Demo)");
        }
      } catch (e) {
        console.error("Failed to load preferences", e);
      }
    };
    if (user?.id) loadPreferences();
  }, [user?.id]);

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
      
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* HEADER */}
        <LinearGradient colors={["#F59E0B", "#D97706"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.headerTop}>
            <View style={{ width: 40 }} />
            <Text style={styles.headerTitle}>My Profile</Text>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={24} color="#FFF" />
            </TouchableOpacity>
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
                <Text style={{ color: "#FFF", fontSize: 32, fontFamily: "Poppins_700Bold" }}>{user?.avatar || user?.name?.charAt(0) || "P"}</Text>
              </View>
            )}
            <TouchableOpacity style={styles.editBadge} onPress={() => { Haptics.selectionAsync(); setShowEditModal(true); }}>
              <Ionicons name="pencil" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{displayName}</Text>
          <Text style={styles.userRole}>PARENT</Text>
          
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statVal}>{childName.split(" ")[0]}</Text>
              <Text style={styles.statLabel}>Child</Text>
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

        {/* LOGOUT BUTTON */}
        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <TouchableOpacity 
            style={styles.logoutBtnLarge} 
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Ionicons name="log-out" size={20} color="#EF4444" />
            <Text style={styles.logoutTextLarge}>Log Out</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* EDIT PROFILE MODAL */}
      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Profile</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="person-outline" size={20} color="#94A3B8" />
                <TextInput 
                  style={styles.input}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter your name"
                  placeholderTextColor="#94A3B8"
                />
              </View>
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={saveProfile} disabled={saving}>
              <Text style={styles.saveBtnText}>{saving ? "Saving..." : "Save Changes"}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 70, // Extra space for overlapping card
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  decoCircle1: { position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -30, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  logoutBtn: { width: 40, height: 40, alignItems: "flex-end", justifyContent: "center" },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 20, color: "#FFF" },
  
  profileBox: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    marginHorizontal: 20,
    marginTop: -24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 4
  },
  avatarWrap: {
    width: 90, height: 90, borderRadius: 45,
    borderWidth: 4, borderColor: "#FFF",
    backgroundColor: "#F1F5F9",
    marginTop: -10,
    marginBottom: 12,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 4
  },
  avatarImage: { width: "100%", height: "100%", borderRadius: 45 },
  editBadge: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#F59E0B", width: 28, height: 28, borderRadius: 14,
    alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: "#FFF"
  },
  userName: { fontFamily: "Poppins_700Bold", fontSize: 22, color: "#1E293B", textAlign: "center" },
  userRole: { fontFamily: "Poppins_600SemiBold", fontSize: 12, color: "#F59E0B", marginTop: 4, letterSpacing: 1 },
  
  statsRow: { flexDirection: "row", marginTop: 20, paddingTop: 20, borderTopWidth: 1, borderTopColor: "#F1F5F9", width: "100%", justifyContent: "center" },
  statBox: { alignItems: "center", paddingHorizontal: 20 },
  statVal: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#1E293B" },
  statLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "#64748B" },
  
  scroll: { paddingBottom: 40 },
  
  section: { marginHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#1E293B", marginBottom: 12 },
  cardBlock: { backgroundColor: "#FFF", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  
  listItem: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#FFF" },
  icon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  listTitle: { flex: 1, fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#1E293B" },
  divider: { height: 1, backgroundColor: "#F1F5F9", marginLeft: 68 },
  
  expandedContent: { padding: 16, paddingTop: 0, paddingLeft: 68 },
  detailRow: { marginBottom: 12 },
  detailLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "#94A3B8" },
  detailValue: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#1E293B", marginTop: 2 },
  editContentBtn: { alignSelf: "flex-start", backgroundColor: "#EFF6FF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, marginTop: 4 },
  editContentText: { fontFamily: "Poppins_600SemiBold", fontSize: 12, color: "#3B82F6" },

  logoutBtnLarge: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#FEF2F2", marginHorizontal: 20, marginTop: 30, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#FECACA" },
  logoutTextLarge: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#EF4444", marginLeft: 8 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(15,23,42,0.6)", justifyContent: "center", padding: 20 },
  modalContent: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontFamily: "Poppins_700Bold", fontSize: 20, color: "#1E293B" },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F1F5F9", alignItems: "center", justifyContent: "center" },
  inputGroup: { marginBottom: 24 },
  inputLabel: { fontFamily: "Poppins_600SemiBold", fontSize: 14, color: "#475569", marginBottom: 8 },
  inputWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, marginLeft: 12, fontFamily: "Poppins_500Medium", fontSize: 15, color: "#1E293B" },
  saveBtn: { backgroundColor: "#F59E0B", height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  saveBtnText: { fontFamily: "Poppins_700Bold", fontSize: 16, color: "#FFF" }
});



