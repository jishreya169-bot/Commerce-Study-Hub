import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "../../lib/turso";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import DropdownSelector, { DropdownOption } from "../../components/DropdownSelector";

interface Teacher {
  id: string;
  name: string;
  email: string;
  batch: string; // Used as subjects for teacher
}

export default function AdminTeachers() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newSubjects, setNewSubjects] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [classesList, setClassesList] = useState<DropdownOption[]>([]);

  // Password Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);

  const handleUpdatePassword = async (newPassword: string) => {
    if (!selectedUser) return;
    await turso.execute({
      sql: "UPDATE users SET password = ? WHERE id = ?",
      args: [newPassword, selectedUser.id]
    });
  };

  const fetchTeachers = async () => {
    try {
      setLoadingList(true);
      const result = await turso.execute("SELECT id, name, email, batch FROM users WHERE role = 'teacher' ORDER BY createdAt DESC");
      const data = result.rows.map(r => ({
        id: r[0] as string,
        name: r[1] as string,
        email: r[2] as string,
        batch: r[3] as string
      }));
      setTeachers(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const result = await turso.execute("SELECT name FROM classes");
      setClassesList(result.rows.map(r => ({ id: r[0] as string, label: r[0] as string })));
    } catch (e) {
      console.error(e);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchTeachers();
      fetchClasses();
    }, [])
  );

  const handleAddTeacher = async () => {
    if (!newName || !newEmail || !newPassword) {
      alert("Please fill name, email and password.");
      return;
    }
    try {
      setSubmitting(true);
      
      // Auto-generate Sequential Teacher ID
      const latestTeacherRes = await turso.execute("SELECT id FROM users WHERE id LIKE 'TCH-%' ORDER BY id DESC LIMIT 1");
      let newIdNum = 1001;
      if (latestTeacherRes.rows.length > 0) {
        const lastId = latestTeacherRes.rows[0][0] as string;
        const numPart = parseInt(lastId.split("-")[1], 10);
        if (!isNaN(numPart)) newIdNum = numPart + 1;
      }
      const id = `TCH-${newIdNum}`;
      const createdAt = new Date().toISOString();

      await turso.execute({
        sql: "INSERT INTO users (id, name, email, password, role, batch, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [id, newName, newEmail, newPassword, "teacher", newSubjects, createdAt]
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Teacher added successfully!");
      
      setShowAddForm(false);
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      setNewSubjects("");
      fetchTeachers();
    } catch (e) {
      console.error(e);
      alert("Failed to add teacher. Ensure email is unique.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================
  // ADD FORM VIEW
  // ==========================
  if (showAddForm) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
        <LinearGradient colors={["#7C3AED", "#6D28D9"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Teacher</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formCard}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teacher Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Prof. Amit Sharma" value={newName} onChangeText={setNewName} placeholderTextColor="#94A3B8" />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholder="e.g. amit@vidyapath.in" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#94A3B8" />
            </View>
            
            <DropdownSelector
              label="Assign Class"
              placeholder="Select Class..."
              options={classesList}
              selectedValue={newSubjects}
              onSelect={setNewSubjects}
              icon="school"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Password</Text>
              <TextInput style={styles.input} placeholder="Set login password" value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholderTextColor="#94A3B8" />
            </View>

            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleAddTeacher} disabled={submitting}>
              {submitting ? (
                <Text style={styles.submitText}>Saving...</Text>
              ) : (
                <Text style={styles.submitText}>Save Teacher</Text>
              )}
            </TouchableOpacity>
            
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ==========================
  // LIST VIEW
  // ==========================
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#7C3AED", "#6D28D9"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Faculty Directory</Text>
          <View style={styles.headerRightBtns}>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setShowAddForm(true); }} style={styles.addBtn}>
              <Ionicons name="person-add" size={20} color="#7C3AED" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput style={styles.searchInput} placeholder="Search teachers by name..." placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>All Teachers</Text>
          </View>
          <View style={styles.cardBlock}>
            {loadingList ? (
              <View style={{ padding: 20, alignItems: "center" }}><ActivityIndicator color="#7C3AED" /></View>
            ) : teachers.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No teachers found.</Text>
              </View>
            ) : (
              teachers.map((t, i) => (
                <View key={t.id} style={[styles.listItem, i === teachers.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.listIcon, { backgroundColor: "#F3E8FF" }]}>
                    <Text style={[styles.listAvatar, { color: "#7C3AED" }]}>{t.name.slice(0, 2).toUpperCase()}</Text>
                  </View>
                  <View style={styles.listTextWrap}>
                    <Text style={styles.listTitle}>{t.name}</Text>
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: "#7C3AED", marginBottom: 2 }}>{t.id}</Text>
                    <Text style={styles.listDesc}>{t.batch || "No subjects assigned"}</Text>
                  </View>
                  <View style={[styles.listRight, { flexDirection: "row", alignItems: "center" }]}>
                    <TouchableOpacity style={styles.passwordBtn} onPress={() => { setSelectedUser({id: t.id, name: t.name}); setPasswordModalVisible(true); }}>
                      <Ionicons name="key" size={16} color="#7C3AED" />
                    </TouchableOpacity>
                    <Text style={styles.nextText}>{t.email}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {selectedUser && (
        <ChangePasswordModal
          visible={passwordModalVisible}
          onClose={() => setPasswordModalVisible(false)}
          userId={selectedUser.id}
          userName={selectedUser.name}
          themeColor="#7C3AED"
          onSave={handleUpdatePassword}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" }, 
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  headerRightBtns: { flexDirection: "row", gap: 10 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  
  searchContainer: { marginTop: -12, paddingHorizontal: 20, zIndex: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 },

  scroll: { paddingBottom: 100, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  listAvatar: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  listRight: { alignItems: "center" },
  nextText: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B" },
  passwordBtn: { backgroundColor: "#F3E8FF", width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center", marginRight: 8 },

  // FORM STYLES
  formScroll: { padding: 20, paddingBottom: 60 },
  formCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  
  submitBtn: { backgroundColor: "#7C3AED", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 10, shadowColor: "#7C3AED", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
});




