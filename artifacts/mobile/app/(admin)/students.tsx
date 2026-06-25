import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Image, Modal } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "../../lib/turso";
import * as ImagePicker from 'expo-image-picker';
import DropdownSelector, { DropdownOption } from "../../components/DropdownSelector";
import DateTimePicker from "../../components/DateTimePicker";
import ChangePasswordModal from "../../components/ChangePasswordModal";
import { scheduleFeeReminderNotification } from "../../lib/notifications";

interface Student {
  id: string;
  name: string;
  batch: string;
  phone: string;
  email: string;
  status: string;
  color: string;
  avatar?: string | null;
  dob?: string;
  parentId?: string;
}

export default function StudentsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All Students");

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newDob, setNewDob] = useState("");
  const [newBatch, setNewBatch] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [gender, setGender] = useState("boy");
  const [feeAmount, setFeeAmount] = useState("");
  const [feeType, setFeeType] = useState("Monthly");
  const [submitting, setSubmitting] = useState(false);
  const [classesList, setClassesList] = useState<DropdownOption[]>([]);

  // Password Modal State
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{id: string, name: string} | null>(null);

  // Profile Modal State
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Student | null>(null);

  const handleUpdatePassword = async (newPassword: string) => {
    if (!selectedUser) return;
    await turso.execute({
      sql: "UPDATE users SET password = ? WHERE id = ?",
      args: [newPassword, selectedUser.id]
    });
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const result = await turso.execute("SELECT id, name, batch, phone, avatar, email, dob, parentId FROM users WHERE role = 'student' ORDER BY createdAt DESC");
      
      const colors = ["#3B82F6", "#10B981", "#8B5CF6", "#EC4899", "#F59E0B"];
      
      const data: Student[] = result.rows.map((r, i) => ({
        id: r[0] as string,
        name: r[1] as string,
        batch: (r[2] as string) || "Unassigned",
        phone: (r[3] as string) || "N/A",
        avatar: (r[4] as string) || null,
        email: (r[5] as string) || "N/A",
        dob: (r[6] as string) || "N/A",
        parentId: (r[7] as string) || "N/A",
        status: "Active",
        color: colors[i % colors.length],
      }));
      setStudents(data);
    } catch (e) {
      console.error("Error fetching students:", e);
    } finally {
      setLoading(false);
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

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);



  const handleAddStudent = async () => {
    if (!newName || !newEmail || !newDob) {
      alert("Please fill name, email and Date of Birth.");
      return;
    }
    try {
      setSubmitting(true);
      
      // Auto-generate Sequential Student ID
      const latestStudentRes = await turso.execute("SELECT id FROM users WHERE id LIKE 'STU-%' ORDER BY id DESC LIMIT 1");
      let newIdNum = 1001;
      if (latestStudentRes.rows.length > 0) {
        const lastId = latestStudentRes.rows[0][0] as string; // e.g. "STU-1005"
        const numPart = parseInt(lastId.split("-")[1], 10);
        if (!isNaN(numPart)) newIdNum = numPart + 1;
      }
      const studentId = `STU-${newIdNum}`;
      const parentId = `PRN-${newIdNum}`;
      
      // Use DOB as password (stripping hyphens to match DDMMYYYY if it comes from the picker)
      const studentPassword = newDob.replace(/-/g, '');

      // 1. Insert User (Using gender for avatar field)
      await turso.execute({
        sql: "INSERT INTO users (id, name, email, password, role, batch, parentId, phone, avatar, dob, createdAt) VALUES (?, ?, ?, ?, 'student', ?, ?, ?, ?, ?, ?)",
        args: [studentId, newName, newEmail, studentPassword, newBatch, parentId, newPhone, gender, newDob, new Date().toISOString()]
      });

      // Calculate Due Date based on Fee Type
      const now = new Date();
      const dueDateObj = new Date(now);
      if (feeType === "Monthly") {
        dueDateObj.setMonth(dueDateObj.getMonth() + 1);
      } else {
        dueDateObj.setMonth(dueDateObj.getMonth() + 6); // 6 months for one-time
      }
      const calculatedDueDate = dueDateObj.toISOString();

      // 2. Insert Fees Record
      const feeId = "FEE" + Math.floor(Math.random() * 10000);
      await turso.execute({
        sql: "INSERT INTO fees (id, studentId, totalAmount, paymentPlan, paidAmount, nextDueDate, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [feeId, studentId, parseInt(feeAmount) || 0, feeType, 0, calculatedDueDate, "pending", now.toISOString()]
      });

      // 3. Create In-App Notification Record for Parent
      const notifId = "NOTIF" + Math.floor(Math.random() * 10000);
      await turso.execute({
        sql: "INSERT INTO notifications (id, userId, title, message, read, createdAt) VALUES (?, ?, ?, ?, 0, ?)",
        args: [notifId, parentId, "Fee Schedule Set", `Your ${feeType} fee of ₹${feeAmount} is scheduled. Next due date is ${dueDateObj.toLocaleDateString()}.`, now.toISOString()]
      });

      // 4. Schedule OS-level Push Notification
      try {
        await scheduleFeeReminderNotification(calculatedDueDate, parseInt(feeAmount) || 0, feeType, newName);
      } catch (pushErr) {
        console.log("Failed to schedule push notification (mostly physical device needed)", pushErr);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Student added successfully!");
      
      setShowAddForm(false);
      setNewName("");
      setNewEmail("");
      setNewDob("");
      setNewBatch("");
      setNewPhone("");
      setGender("boy");
      setFeeAmount("");
      setFeeType("Monthly");
      fetchStudents();
    } catch (e) {
      console.error(e);
      alert("Failed to add student. Ensure email is unique.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredStudents = students.filter(s => {
    if (filter === "All Students") return true;
    if (filter === "Defaulters") return s.status === "Defaulter";
    return s.batch.includes(filter);
  });

  // ==========================
  // ADD FORM VIEW
  // ==========================
  if (showAddForm) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
        <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Student</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Gender *</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity 
                  style={[styles.typeBtn, gender === "boy" && styles.typeBtnActive]} 
                  onPress={() => setGender("boy")}
                >
                  <Text style={[styles.typeBtnText, gender === "boy" && styles.typeBtnTextActive]}>Boy</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, gender === "girl" && styles.typeBtnActive]} 
                  onPress={() => setGender("girl")}
                >
                  <Text style={[styles.typeBtnText, gender === "girl" && styles.typeBtnTextActive]}>Girl</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Student Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Rahul Sharma" value={newName} onChangeText={setNewName} placeholderTextColor="#94A3B8" />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Email Address</Text>
              <TextInput style={styles.input} placeholder="e.g. rahul@example.com" value={newEmail} onChangeText={setNewEmail} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#94A3B8" />
            </View>
            
            <DropdownSelector
              label="Assign Class"
              placeholder="Select Class..."
              options={classesList}
              selectedValue={newBatch}
              onSelect={setNewBatch}
              icon="school"
            />
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput style={styles.input} placeholder="e.g. +91 9876543210" value={newPhone} onChangeText={setNewPhone} keyboardType="phone-pad" placeholderTextColor="#94A3B8" />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Date of Birth *</Text>
              <DateTimePicker
                value={newDob}
                onChange={setNewDob}
                mode="date"
                placeholder="Select Date of Birth"
              />
              <Text style={styles.hintText}>This will be set as the student's default password.</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fee Amount *</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. 50000"
                placeholderTextColor="#9CA3AF"
                value={feeAmount}
                onChangeText={setFeeAmount}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fee Type *</Text>
              <View style={{ flexDirection: "row", gap: 10 }}>
                <TouchableOpacity 
                  style={[styles.typeBtn, feeType === "Monthly" && styles.typeBtnActive]} 
                  onPress={() => setFeeType("Monthly")}
                >
                  <Text style={[styles.typeBtnText, feeType === "Monthly" && styles.typeBtnTextActive]}>Monthly</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.typeBtn, feeType === "One-Time" && styles.typeBtnActive]} 
                  onPress={() => setFeeType("One-Time")}
                >
                  <Text style={[styles.typeBtnText, feeType === "One-Time" && styles.typeBtnTextActive]}>One-Time</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleAddStudent} disabled={submitting}>
              {submitting ? (
                <Text style={styles.submitText}>Saving...</Text>
              ) : (
                <Text style={styles.submitText}>Save Student</Text>
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
      <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Directory</Text>
          <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setShowAddForm(true); }} style={styles.addBtn}>
            <Ionicons name="person-add" size={20} color="#0EA5E9" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput style={styles.searchInput} placeholder="Search by name, phone or batch..." placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* FILTERS */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.filterScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
            {["All Students", "Class 12", "Class 11", "Defaulters"].map((f, i) => (
              <TouchableOpacity key={i} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
                <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* STUDENT LIST */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.cardBlock}>
            {loading ? (
              <View style={{ padding: 20, alignItems: "center" }}><ActivityIndicator color="#0EA5E9" /></View>
            ) : filteredStudents.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No students found.</Text>
              </View>
            ) : (
              filteredStudents.map((s, i) => (
                <View key={s.id} style={[styles.listItem, i === filteredStudents.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.avatar, { backgroundColor: s.color + "15", overflow: "hidden" }]}>
                    {s.avatar === 'boy' ? (
                      <Image source={{ uri: "https://avatar.iran.liara.run/public/boy" }} style={{ width: '100%', height: '100%' }} />
                    ) : s.avatar === 'girl' ? (
                      <Image source={{ uri: "https://avatar.iran.liara.run/public/girl" }} style={{ width: '100%', height: '100%' }} />
                    ) : s.avatar ? (
                      <Image source={{ uri: s.avatar }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={[styles.avatarText, { color: s.color }]}>{s.name.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <View style={styles.listTextWrap}>
                    <Text style={styles.listTitle}>{s.name}</Text>
                    <Text style={{ fontFamily: "Poppins_600SemiBold", fontSize: 11, color: "#0EA5E9", marginBottom: 2 }}>{s.id}</Text>
                    <Text style={styles.listDesc}>{s.batch}</Text>
                    <Text style={styles.listPhone}><Ionicons name="call" size={10}/> {s.phone}</Text>
                  </View>
                  <View style={[styles.listRight, { flexDirection: "row", alignItems: "center" }]}>
                    <TouchableOpacity style={styles.passwordBtn} onPress={() => { setSelectedUser({id: s.id, name: s.name}); setPasswordModalVisible(true); }}>
                      <Ionicons name="key" size={16} color="#0EA5E9" />
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.viewBtn, { backgroundColor: "#0EA5E9" }]} onPress={() => { setSelectedProfile(s); setProfileModalVisible(true); }}>
                      <Text style={[styles.viewBtnText, { color: "#FFFFFF" }]}>Profile</Text>
                      <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
                    </TouchableOpacity>
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
          themeColor="#0EA5E9"
          onSave={handleUpdatePassword}
        />
      )}

      {/* STUDENT PROFILE MODAL */}
      <Modal visible={profileModalVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFF", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: "85%" }}>
            
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <View style={{ flex: 1 }} />
              <TouchableOpacity onPress={() => setProfileModalVisible(false)} style={{ backgroundColor: "#F1F5F9", width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedProfile && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                {/* Header Profile Info */}
                <View style={{ alignItems: "center", marginBottom: 30 }}>
                  <View style={[styles.avatar, { width: 100, height: 100, borderRadius: 50, marginBottom: 16, backgroundColor: selectedProfile.color + "15", borderWidth: 4, borderColor: "#F1F5F9" }]}>
                    {selectedProfile.avatar === 'boy' ? (
                      <Image source={{ uri: "https://avatar.iran.liara.run/public/boy" }} style={{ width: '100%', height: '100%' }} />
                    ) : selectedProfile.avatar === 'girl' ? (
                      <Image source={{ uri: "https://avatar.iran.liara.run/public/girl" }} style={{ width: '100%', height: '100%' }} />
                    ) : selectedProfile.avatar ? (
                      <Image source={{ uri: selectedProfile.avatar }} style={{ width: '100%', height: '100%' }} />
                    ) : (
                      <Text style={[styles.avatarText, { color: selectedProfile.color, fontSize: 36 }]}>{selectedProfile.name.charAt(0).toUpperCase()}</Text>
                    )}
                  </View>
                  <Text style={{ fontSize: 22, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 4 }}>{selectedProfile.name}</Text>
                  <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" }}>ID: {selectedProfile.id}</Text>
                </View>

                {/* Details Section */}
                <Text style={{ fontSize: 14, fontFamily: "Poppins_700Bold", color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Academic Info</Text>
                <View style={{ backgroundColor: "#F8FAFC", borderRadius: 20, padding: 16, marginBottom: 24 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B" }}>Class / Batch</Text>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }}>{selectedProfile.batch}</Text>
                  </View>
                  <View style={{ height: 1, backgroundColor: "#E2E8F0", marginBottom: 12 }} />
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B" }}>Status</Text>
                    <View style={{ backgroundColor: "#10B98115", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                      <Text style={{ fontSize: 12, fontFamily: "Poppins_700Bold", color: "#10B981" }}>{selectedProfile.status}</Text>
                    </View>
                  </View>
                </View>

                <Text style={{ fontSize: 14, fontFamily: "Poppins_700Bold", color: "#64748B", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>Personal Info</Text>
                <View style={{ backgroundColor: "#F8FAFC", borderRadius: 20, padding: 16 }}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#E0F2FE", justifyContent: "center", alignItems: "center" }}><Ionicons name="call" size={18} color="#0EA5E9" /></View>
                      <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B" }}>Phone</Text>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }}>{selectedProfile.phone}</Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#F3E8FF", justifyContent: "center", alignItems: "center" }}><Ionicons name="mail" size={18} color="#8B5CF6" /></View>
                      <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B" }}>Email</Text>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }}>{selectedProfile.email}</Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#FEF3C7", justifyContent: "center", alignItems: "center" }}><Ionicons name="calendar" size={18} color="#D97706" /></View>
                      <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B" }}>Date of Birth</Text>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }}>{selectedProfile.dob}</Text>
                  </View>

                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <View style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: "#D1FAE5", justifyContent: "center", alignItems: "center" }}><Ionicons name="people" size={18} color="#10B981" /></View>
                      <Text style={{ fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B" }}>Parent ID</Text>
                    </View>
                    <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }}>{selectedProfile.parentId}</Text>
                  </View>
                </View>

              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

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
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  
  searchContainer: { marginTop: -12, paddingHorizontal: 20, zIndex: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 },

  scroll: { paddingBottom: 100 },
  
  filterScroll: { marginTop: 24, marginBottom: 20, paddingVertical: 10 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#E2E8F0", borderRadius: 20 },
  filterChipActive: { backgroundColor: "#0EA5E9" },
  filterText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748B" },
  filterTextActive: { color: "#FFF" },
  hintText: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#94A3B8", marginLeft: 4, marginTop: 4 },

  section: { paddingHorizontal: 20, marginBottom: 30 },
  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  avatar: { width: 48, height: 48, borderRadius: 24, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#64748B" },
  listPhone: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#94A3B8", marginTop: 4 },
  listRight: { alignItems: "center" },
  
  passwordBtn: { backgroundColor: "#E0F2FE", width: 36, height: 36, borderRadius: 12, justifyContent: "center", alignItems: "center", marginRight: 8 },
  
  statusPill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, marginBottom: 8 },
  statusText: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  viewBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 2 },
  viewBtnText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },

  // FORM STYLES
  formScroll: { padding: 20, paddingBottom: 60 },
  formCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  
  photoPickerContainer: { alignItems: "center", marginBottom: 30, position: "relative" },
  photoPickerBtn: { width: 120, height: 120, borderRadius: 60, backgroundColor: "#F8FAFC", overflow: "hidden", borderWidth: 2, borderColor: "#E2E8F0", borderStyle: "dashed", justifyContent: "center", alignItems: "center" },
  photoPlaceholder: { alignItems: "center" },
  photoPickerText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748B", marginTop: 8 },
  photoPickerSubText: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#94A3B8" },
  photoPreview: { width: "100%", height: "100%" },
  removePhotoBtn: { position: "absolute", top: 0, right: "25%", backgroundColor: "#FFF", borderRadius: 14, padding: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  
  submitBtn: { backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },

  typeBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: "#F1F5F9", alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  typeBtnActive: { backgroundColor: "#E0F2FE", borderColor: "#0EA5E9" },
  typeBtnText: { fontFamily: "Poppins_500Medium", fontSize: 14, color: "#64748B" },
  typeBtnTextActive: { color: "#0EA5E9", fontFamily: "Poppins_600SemiBold" },
});




