import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as DocumentPicker from "expo-document-picker";
import { turso } from "../../lib/turso";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { useAuth } from "@/context/AuthContext";
import { useTeacherContext } from "../../context/TeacherContext";
import { scheduleHomeworkReminder } from "../../lib/notifications";
import DateTimePicker from "../../components/DateTimePicker";

export default function TeacherUpload() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeClass } = useTeacherContext();
  
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [batch, setBatch] = useState(activeClass === "All" ? "" : activeClass);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dueDay, setDueDay] = useState("");
  const [dueTime, setDueTime] = useState("");

  // Dynamic data
  const [classes, setClasses] = useState<any[]>([]);
  const [showClassPicker, setShowClassPicker] = useState(false);
  const [recentHomework, setRecentHomework] = useState<any[]>([]);

  useEffect(() => {
    turso.execute(`
      CREATE TABLE IF NOT EXISTS materials (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        batch TEXT,
        type TEXT,
        fileUrl TEXT,
        teacherId TEXT,
        uploadedAt TEXT
      )
    `);
    turso.execute(`
      CREATE TABLE IF NOT EXISTS homework (
        id TEXT PRIMARY KEY,
        title TEXT,
        description TEXT,
        batch TEXT,
        fileUrl TEXT,
        dueDate TEXT,
        teacherId TEXT,
        createdAt TEXT
      )
    `);
    fetchClasses();
    fetchRecent();
  }, []);

  const fetchClasses = async () => {
    try {
      const res = await turso.execute("SELECT id, name, subject FROM classes ORDER BY createdAt DESC");
      const data = res.rows.map(r => ({ id: r[0] as string, name: r[1] as string, subject: r[2] as string }));
      setClasses(data);
      if (data.length > 0 && activeClass === "All" && !batch) setBatch(data[0].name);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchRecent = async () => {
    try {
      let hQuery = "SELECT id, title, batch, dueDate, createdAt FROM homework";
      let hArgs: any[] = [];
      if (activeClass !== "All") { hQuery += " WHERE batch = ?"; hArgs.push(activeClass); }
      hQuery += " ORDER BY createdAt DESC LIMIT 5";

      const hRes = await turso.execute({ sql: hQuery, args: hArgs });
      setRecentHomework(hRes.rows.map(r => ({ id: r[0], title: r[1], batch: r[2], dueDate: r[3], date: r[4] })));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRecent();
    if (activeClass !== "All") setBatch(activeClass);
  }, [activeClass]);

  const pickDocument = async () => {
    Haptics.selectionAsync();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "video/mp4", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      console.log("Error picking document:", err);
    }
  };

  const handleUpload = async () => {
    if (!title) {
      alert("Please provide a title.");
      return;
    }
    if (!batch) {
      alert("Please select a class.");
      return;
    }
    
    setUploading(true);
    try {
      let downloadUrl = "";
      if (file) {
        const folder = `homework/${batch}`;
        downloadUrl = await uploadToCloudinary(file, folder, title);
      }

      const id = Date.now().toString();
      const finalDueDate = dueDay && dueTime ? `${dueDay} ${dueTime}` : (dueDay || dueTime || "");

      await turso.execute({
        sql: "INSERT INTO homework (id, title, batch, description, dueDate, teacherId, fileUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [id, title, batch, desc, finalDueDate, user?.id || "unknown", downloadUrl, new Date().toISOString()]
      });

      if (finalDueDate) {
        scheduleHomeworkReminder(title, finalDueDate, batch).catch(console.error);
      }
      
      alert("Homework assigned successfully!");

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setTitle("");
      setDesc("");
      setFile(null);
      setDueDay("");
      setDueTime("");
      fetchRecent();
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload material.");
    } finally {
      setUploading(false);
    }
  };

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
          <Text style={styles.headerTitle}>Add Homework</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* UPLOAD FORM */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>

          <View style={styles.cardBlock}>
            
            {/* File Drop Zone (Optional for Homework) */}
            <TouchableOpacity style={styles.dropZone} onPress={pickDocument}>
              <View style={styles.dropIconWrap}>
                <Ionicons name={file ? "document-text" : "cloud-upload"} size={32} color="#0EA5E9" />
              </View>
              <Text style={styles.dropTitle}>{file ? file.name : "Attach Homework File (Optional)"}</Text>
              <Text style={styles.dropDesc}>{file ? "File selected" : "Supported: PDF, PPTX, DOCX, MP4, JPG (Max 50MB)"}</Text>
            </TouchableOpacity>

            {/* Form Fields */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Homework Title</Text>
              <TextInput 
                style={styles.input}
                placeholder="e.g. Solve Q1 to Q10"
                placeholderTextColor="#94A3B8"
                value={title}
                onChangeText={setTitle}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Homework Details</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                placeholder="Enter the questions or homework details..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={3}
                value={desc}
                onChangeText={setDesc}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Due Date</Text>
                <DateTimePicker
                  value={dueDay}
                  onChange={setDueDay}
                  mode="date"
                  placeholder="Select Date"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Due Time</Text>
                <DateTimePicker
                  value={dueTime}
                  onChange={setDueTime}
                  mode="time"
                  placeholder="Select Time"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Select Class</Text>
              <TouchableOpacity style={styles.selectBtn} onPress={() => setShowClassPicker(true)}>
                <Text style={[styles.selectBtnText, batch ? { color: "#0F172A" } : {}]}>{batch || "Choose a class..."}</Text>
                <Ionicons name="chevron-down" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[styles.submitBtn, uploading && { opacity: 0.7 }]} 
              onPress={handleUpload}
              disabled={uploading}
            >
              <Text style={styles.submitBtnText}>{uploading ? "Uploading..." : "Assign Homework"}</Text>
            </TouchableOpacity>

          </View>
        </Animated.View>



        {/* RECENT HOMEWORK */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" }}>Assigned Homework</Text>
          </View>
          <View style={styles.cardBlock}>
            {recentHomework.length === 0 ? (
              <View style={{ padding: 16, alignItems: "center" }}><Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No homework assigned yet.</Text></View>
            ) : (
              recentHomework.map((h: any, i: number) => (
                <View key={h.id} style={[styles.recentItem, i === recentHomework.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.recentIcon, { backgroundColor: "#FEF3C7" }]}>
                    <Ionicons name="clipboard" size={20} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }} numberOfLines={1}>{h.title}</Text>
                    <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: "#94A3B8" }}>{h.batch} • Due: {h.dueDate || "N/A"}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.View>

      </ScrollView>

      {/* CLASS PICKER MODAL */}
      <Modal visible={showClassPicker} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: "60%" }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" }}>Select Class</Text>
              <TouchableOpacity onPress={() => setShowClassPicker(false)}>
                <Ionicons name="close-circle" size={28} color="#94A3B8" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {classes.length === 0 ? (
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8", textAlign: "center", padding: 20 }}>No classes found. Add classes from Admin.</Text>
              ) : (
                classes.map(c => (
                  <TouchableOpacity 
                    key={c.id} 
                    style={{ flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 12 }}
                    onPress={() => { setBatch(c.name); setShowClassPicker(false); Haptics.selectionAsync(); }}
                  >
                    <View style={{ width: 40, height: 40, borderRadius: 12, backgroundColor: batch === c.name ? "#0EA5E9" : "#F1F5F9", justifyContent: "center", alignItems: "center" }}>
                      <Ionicons name="school" size={20} color={batch === c.name ? "#FFF" : "#64748B"} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }}>{c.name}</Text>
                      <Text style={{ fontSize: 11, fontFamily: "Poppins_400Regular", color: "#94A3B8" }}>{c.subject}</Text>
                    </View>
                    {batch === c.name && <Ionicons name="checkmark-circle" size={22} color="#0EA5E9" />}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
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
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  
  scroll: { paddingBottom: 100, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 30, marginTop: -16 },

  toggleRow: { flexDirection: "row", backgroundColor: "#E2E8F0", borderRadius: 16, padding: 4, marginBottom: 20 },
  toggleBtn: { flex: 1, paddingVertical: 12, alignItems: "center", borderRadius: 12 },
  toggleActive: { backgroundColor: "#FFFFFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#64748B" },
  toggleTextActive: { color: "#0EA5E9" },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 },
  
  dropZone: { borderWidth: 2, borderColor: "#E0F2FE", borderStyle: "dashed", borderRadius: 20, backgroundColor: "#F0F9FF", padding: 30, alignItems: "center", marginBottom: 24 },
  dropIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#E0F2FE", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  dropTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9", marginBottom: 4 },
  dropDesc: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#64748B" },

  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  textArea: { height: 100, textAlignVertical: "top" },
  
  selectBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
  selectBtnText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#94A3B8" },

  submitBtn: { backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  
  recentItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 12 },
  recentIcon: { width: 42, height: 42, borderRadius: 14, justifyContent: "center", alignItems: "center" },
});





