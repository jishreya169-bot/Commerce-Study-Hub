import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { turso } from "../../lib/turso";
import { RefreshControl } from "react-native";
import { useAuth } from "@/context/AuthContext";
import DropdownSelector, { DropdownOption } from "../../components/DropdownSelector";

interface Doubt {
  id: string;
  subject?: string;
  question: string;
  status: "pending" | "resolved";
  timestamp: string;
  teacherReply?: string;
  color?: string;
}

export default function StudentDoubts() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [newDoubt, setNewDoubt] = useState("");
  const [subject, setSubject] = useState("");
  const [myDoubts, setMyDoubts] = useState<Doubt[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [editingDoubt, setEditingDoubt] = useState<Doubt | null>(null);

  const SUBJECT_OPTIONS: DropdownOption[] = [
    { id: "Accountancy", label: "Accountancy" },
    { id: "Business Studies", label: "Business Studies" },
    { id: "Economics", label: "Economics" },
    { id: "Mathematics", label: "Mathematics" },
    { id: "English", label: "English" },
  ];

  const [refreshing, setRefreshing] = useState(false);

  const fetchMyDoubts = async () => {
    if (!user?.id) return;
    try {
      const result = await turso.execute({
        sql: "SELECT * FROM doubts WHERE studentId = ? ORDER BY timestamp DESC",
        args: [user.id]
      });
      const data = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj as Doubt;
      });
      setMyDoubts(data);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchMyDoubts();
  }, [user?.id]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchMyDoubts();
    setRefreshing(false);
  }, [user?.id]);

  const submitDoubt = async () => {
    if (!newDoubt.trim() || !subject || !user) {
      alert("Please enter a question and select a subject.");
      return;
    }
    setSubmitting(true);
    try {
      if (editingDoubt) {
        await turso.execute({
          sql: "UPDATE doubts SET question = ?, subject = ? WHERE id = ?",
          args: [newDoubt.trim(), subject, editingDoubt.id]
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alert("Doubt updated!");
      } else {
        const id = Date.now().toString();
        await turso.execute({
          sql: "INSERT INTO doubts (id, studentId, studentName, batch, question, status, timestamp, subject) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
          args: [id, user.id, user.name, user.class || "Unknown", newDoubt.trim(), "pending", new Date().toISOString(), subject]
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        alert("Doubt submitted!");
      }
      setNewDoubt("");
      setSubject("");
      setEditingDoubt(null);
      fetchMyDoubts();
    } catch (e) {
      console.error(e);
      alert(editingDoubt ? "Failed to update doubt." : "Failed to submit doubt.");
    } finally {
      setSubmitting(false);
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
          <Text style={styles.headerTitle}>Ask a Doubt</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />}
      >

        {/* ASK DOUBT FORM */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{editingDoubt ? "Edit Doubt" : "Ask a Doubt"}</Text>
            {editingDoubt && (
              <TouchableOpacity onPress={() => { setEditingDoubt(null); setNewDoubt(""); setSubject(""); }}>
                <Text style={{ fontSize: 13, color: "#EF4444", fontFamily: "Poppins_600SemiBold" }}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.cardBlock}>
            
            <DropdownSelector
              label="Subject"
              placeholder="Select a subject..."
              options={SUBJECT_OPTIONS}
              selectedValue={subject}
              onSelect={setSubject}
              icon="book"
            />

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Your Question</Text>
              <TextInput 
                style={[styles.input, styles.textArea]}
                placeholder="Type your question in detail..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={newDoubt}
                onChangeText={setNewDoubt}
              />
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, submitting && { opacity: 0.7 }]} 
              onPress={submitDoubt}
              disabled={submitting}
            >
              <Text style={styles.submitBtnText}>{submitting ? (editingDoubt ? "Updating..." : "Posting...") : (editingDoubt ? "Save Changes" : "Post Question")}</Text>
              <Ionicons name="paper-plane" size={18} color="#FFF" />
            </TouchableOpacity>

          </View>
        </Animated.View>

        {/* MY PREVIOUS DOUBTS */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>My Past Questions</Text>
          </View>
          <View style={styles.cardBlock}>
            {myDoubts.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}><Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No past doubts.</Text></View>
            )}
            {myDoubts.map((d, i) => (
              <View key={d.id} style={[styles.listItem, i === myDoubts.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listIcon, { backgroundColor: (d.status === "resolved" ? "#10B981" : "#F59E0B") + "15" }]}>
                  <Ionicons name={d.status === "resolved" ? "checkmark-circle" : "time"} size={24} color={d.status === "resolved" ? "#10B981" : "#F59E0B"} />
                </View>
                <View style={styles.listTextWrap}>
                  <View style={styles.doubtHeader}>
                    <Text style={[styles.subjectTag, { color: d.status === "resolved" ? "#10B981" : "#F59E0B" }]}>{d.subject ? d.subject.toUpperCase() : d.status.toUpperCase()}</Text>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                      <TouchableOpacity onPress={() => {
                        setEditingDoubt(d);
                        setSubject(d.subject || "");
                        setNewDoubt(d.question);
                        Haptics.selectionAsync();
                      }}>
                        <Ionicons name="pencil" size={16} color="#64748B" />
                      </TouchableOpacity>
                      <Text style={styles.timeText}>{new Date(d.timestamp).toLocaleDateString()}</Text>
                    </View>
                  </View>
                  <Text style={styles.listDesc}>{d.question}</Text>
                  {d.teacherReply && (
                    <View style={{ marginTop: 8, padding: 10, backgroundColor: "#F0F9FF", borderRadius: 8 }}>
                      <Text style={{ fontSize: 11, fontFamily: "Poppins_700Bold", color: "#0EA5E9", marginBottom: 2 }}>Teacher's Reply:</Text>
                      <Text style={{ fontSize: 12, fontFamily: "Poppins_400Regular", color: "#0F172A" }}>{d.teacherReply}</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

      </ScrollView>
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
  section: { paddingHorizontal: 20, marginBottom: 30, marginTop: -10 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 5 },
  
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  textArea: { height: 120, textAlignVertical: "top" },
  
  selectBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14 },
  selectBtnText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#94A3B8" },

  submitBtn: { flexDirection: "row", justifyContent: "center", gap: 8, backgroundColor: "#0EA5E9", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginTop: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },

  listItem: { flexDirection: "row", alignItems: "flex-start", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  doubtHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  subjectTag: { fontSize: 11, fontFamily: "Poppins_700Bold", textTransform: "uppercase" },
  timeText: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#94A3B8" },
  listDesc: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#334155", lineHeight: 20 },
});



