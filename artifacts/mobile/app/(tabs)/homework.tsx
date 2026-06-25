import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Modal, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as DocumentPicker from "expo-document-picker";

import { turso } from "../../lib/turso";
import { uploadToCloudinary } from "../../lib/cloudinary";
import { useAuth } from "../../context/AuthContext";

interface Homework {
  id: string;
  title: string;
  batch: string;
  description: string;
  dueDate: string;
  teacherId: string;
  fileUrl?: string;
  createdAt: string;
}

export default function StudentHomework() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [file, setFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [uploading, setUploading] = useState(false);

  const fetchHomework = async () => {
    if (!user) return;
    try {
      const userRes = await turso.execute({
        sql: "SELECT batch FROM users WHERE id = ?",
        args: [user.id]
      });
      let batch = user.class || "Class 12 - Commerce";
      if (userRes.rows.length > 0) {
        batch = (userRes.rows[0][0] as string) || batch;
      }
      const result = await turso.execute({
        sql: "SELECT * FROM homework WHERE batch = ? ORDER BY createdAt DESC",
        args: [batch]
      });
      const data = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj as Homework;
      });
      setHomeworkList(data);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchHomework();
  }, [user?.class]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchHomework();
    setRefreshing(false);
  }, [user?.class]);

  const pickDocument = async () => {
    Haptics.selectionAsync();
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"],
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFile(result.assets[0]);
      }
    } catch (err) {
      console.log("Error picking document:", err);
    }
  };

  const submitHomework = async () => {
    if (!selectedHomework || !file || !user) return;
    
    setUploading(true);
    try {
      // Prepend student name to the file title so it's clearly identifiable when downloaded
      const titleWithStudent = `${user.name}_${selectedHomework.title}`;
      
      // Upload to student_uploads in Cloudinary
      const downloadUrl = await uploadToCloudinary(
        file, 
        `student_uploads/${user.name}`, 
        titleWithStudent
      );

      const id = Date.now().toString();
      await turso.execute({
        sql: "INSERT INTO homework_submissions (id, homeworkId, studentId, studentName, fileUrl, status, grade, submittedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        args: [id, selectedHomework.id, user.id, user.name, downloadUrl, "submitted", "", new Date().toISOString()]
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Homework submitted successfully!");
      setSelectedHomework(null);
      setFile(null);
    } catch (e) {
      console.error(e);
      alert("Failed to submit homework.");
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
          <Text style={styles.headerTitle}>Homework</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <View style={styles.cardBlock}>
            {homeworkList.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No pending homework!</Text>
              </View>
            )}
            {homeworkList.map((hw, i) => (
              <View key={hw.id} style={[styles.listItem, i === homeworkList.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listIcon, { backgroundColor: "#F59E0B15" }]}>
                  <Ionicons name="clipboard" size={24} color="#F59E0B" />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle} numberOfLines={2}>{hw.title}</Text>
                  <Text style={styles.listDesc} numberOfLines={1}>{hw.description}</Text>
                  <Text style={styles.timeText}>Due: {hw.dueDate}</Text>
                </View>
                
                <View style={{ alignItems: 'flex-end', gap: 8 }}>
                  {hw.fileUrl ? (
                    <TouchableOpacity 
                      style={[styles.submitBtn, { backgroundColor: "#F0F9FF" }]} 
                      onPress={() => {
                        Haptics.selectionAsync();
                        import('expo-web-browser').then(WebBrowser => WebBrowser.openBrowserAsync(hw.fileUrl!));
                      }}
                    >
                      <Text style={[styles.submitBtnText, { color: "#0EA5E9" }]}>View File</Text>
                    </TouchableOpacity>
                  ) : null}
                  <TouchableOpacity 
                    style={styles.submitBtn} 
                    onPress={() => {
                      Haptics.selectionAsync();
                      setSelectedHomework(hw);
                    }}
                  >
                    <Text style={styles.submitBtnText}>Submit</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* SUBMISSION MODAL */}
      <Modal visible={!!selectedHomework} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" }}>Submit Homework</Text>
                <TouchableOpacity onPress={() => setSelectedHomework(null)}>
                  <Ionicons name="close-circle" size={28} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              
              <Text style={{ fontSize: 16, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8 }}>{selectedHomework?.title}</Text>
              <Text style={{ fontSize: 13, fontFamily: "Poppins_400Regular", color: "#64748B", marginBottom: 20 }}>{selectedHomework?.description}</Text>

              <TouchableOpacity style={styles.dropZone} onPress={pickDocument}>
                <View style={styles.dropIconWrap}>
                  <Ionicons name={file ? "checkmark-circle" : "camera"} size={32} color="#0EA5E9" />
                </View>
                <Text style={styles.dropTitle}>{file ? file.name : "Tap to attach Photo / PDF"}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalSubmitBtn, uploading && { opacity: 0.7 }]} 
                onPress={submitHomework} 
                disabled={uploading || !file}
              >
                <Text style={styles.modalSubmitText}>{uploading ? "Uploading..." : "Submit Homework"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  section: { paddingHorizontal: 20, marginBottom: 30 },
  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 4 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B", marginBottom: 4 },
  timeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#EF4444" },
  
  submitBtn: { backgroundColor: "#0EA5E9", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  submitBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_600SemiBold" },

  dropZone: { borderWidth: 2, borderColor: "#E0F2FE", borderStyle: "dashed", borderRadius: 20, backgroundColor: "#F0F9FF", padding: 30, alignItems: "center", marginBottom: 24 },
  dropIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: "#E0F2FE", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  dropTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9", textAlign: "center" },

  modalSubmitBtn: { backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 16, alignItems: "center" },
  modalSubmitText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
});




