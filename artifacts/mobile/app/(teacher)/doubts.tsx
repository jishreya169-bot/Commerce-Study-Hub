import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Modal, KeyboardAvoidingView, Platform, RefreshControl } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { turso } from "../../lib/turso";
import { useAuth } from "@/context/AuthContext";
import { useTeacherContext } from "../../context/TeacherContext";

interface Doubt {
  id: string;
  question: string;
  subject: string;
  studentName: string;
  studentId: string;
  status: "pending" | "resolved";
  timestamp: string;
  teacherReply?: string;
  batch?: string;
}

export default function TeacherDoubts() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeClass } = useTeacherContext();
  
  const [doubts, setDoubts] = useState<Doubt[]>([]);
  const [selectedDoubt, setSelectedDoubt] = useState<Doubt | null>(null);
  const [replyText, setReplyText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDoubts = async () => {
    try {
      let q = "SELECT * FROM doubts";
      let args: any[] = [];
      if (activeClass !== "All") {
        q += " WHERE batch = ?";
        args.push(activeClass);
      }
      q += " ORDER BY timestamp DESC";

      const result = await turso.execute({ sql: q, args });
      const data = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj as Doubt;
      });
      setDoubts(data);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    // Ensure table structure matches the student side
    turso.execute(`
      CREATE TABLE IF NOT EXISTS doubts (
        id TEXT PRIMARY KEY,
        studentId TEXT,
        studentName TEXT,
        batch TEXT,
        subject TEXT,
        question TEXT,
        status TEXT DEFAULT 'pending',
        timestamp TEXT,
        teacherReply TEXT,
        teacherId TEXT,
        resolvedAt TEXT
      )
    `).then(async () => {
      // Graceful migration for existing tables created with old schema
      try { await turso.execute("ALTER TABLE doubts ADD COLUMN status TEXT DEFAULT 'pending'"); } catch(e) {}
      try { await turso.execute("ALTER TABLE doubts ADD COLUMN studentName TEXT"); } catch(e) {}
      try { await turso.execute("ALTER TABLE doubts ADD COLUMN batch TEXT"); } catch(e) {}
      try { await turso.execute("ALTER TABLE doubts ADD COLUMN timestamp TEXT"); } catch(e) {}
      try { await turso.execute("ALTER TABLE doubts ADD COLUMN teacherReply TEXT"); } catch(e) {}
      try { await turso.execute("ALTER TABLE doubts ADD COLUMN teacherId TEXT"); } catch(e) {}
      try { await turso.execute("ALTER TABLE doubts ADD COLUMN resolvedAt TEXT"); } catch(e) {}
      // Migrate old resolved flag to new status column
      try { await turso.execute("UPDATE doubts SET status = 'resolved' WHERE resolved = 1"); } catch(e) {}
      fetchDoubts();
    }).catch(fetchDoubts);
  }, [activeClass]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchDoubts();
    setRefreshing(false);
  }, []);

  const submitReply = async () => {
    if (!selectedDoubt || !replyText.trim()) return;
    setSubmitting(true);
    try {
      await turso.execute({
        sql: "UPDATE doubts SET status = 'resolved', teacherReply = ?, teacherId = ?, resolvedAt = ? WHERE id = ?",
        args: [replyText.trim(), user?.id || "", new Date().toISOString(), selectedDoubt.id]
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setSelectedDoubt(null);
      setReplyText("");
      fetchDoubts();
    } catch (e) {
      console.error(e);
      alert("Failed to send reply");
    } finally {
      setSubmitting(false);
    }
  };

  const pendingDoubts = doubts.filter(d => d.status === "pending");
  const resolvedDoubts = doubts.filter(d => d.status === "resolved");

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
          <Text style={styles.headerTitle}>Student Doubts</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput style={styles.searchInput} placeholder="Search questions or students..." placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />}
      >
        
        {/* PENDING DOUBTS */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Pending Replies</Text>
            <Text style={styles.seeAll}>{pendingDoubts.length} pending</Text>
          </View>
          <View style={styles.cardBlock}>
            {pendingDoubts.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}><Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No pending doubts.</Text></View>
            )}
            {pendingDoubts.map((d, i, arr) => (
              <View key={d.id} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listIcon, { backgroundColor: "#EF444415" }]}>
                  <Ionicons name="help-circle" size={24} color="#EF4444" />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{d.studentName} • {d.subject}</Text>
                  <Text style={styles.listDesc} numberOfLines={2}>{d.question}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.replyBtn} 
                  onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDoubt(d);
                    setReplyText("");
                  }}
                >
                  <Text style={styles.replyText}>Reply</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* RESOLVED DOUBTS */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Resolved</Text>
            <Text style={styles.seeAll}>{resolvedDoubts.length} resolved</Text>
          </View>
          <View style={styles.cardBlock}>
            {resolvedDoubts.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}><Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No resolved doubts.</Text></View>
            )}
            {resolvedDoubts.map((d, i, arr) => (
              <View key={d.id} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listIcon, { backgroundColor: "#10B98115" }]}>
                  <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{d.studentName} • {d.subject}</Text>
                  <Text style={styles.listDesc} numberOfLines={1}>{d.question}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.timeText}>Resolved</Text>
                  <TouchableOpacity onPress={() => {
                    Haptics.selectionAsync();
                    setSelectedDoubt(d);
                    setReplyText(d.teacherReply || "");
                  }} style={{ marginTop: 8, padding: 4 }}>
                    <Ionicons name="pencil" size={18} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

      </ScrollView>

      {/* REPLY MODAL */}
      <Modal visible={!!selectedDoubt} transparent animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
            <View style={{ backgroundColor: "#FFF", padding: 24, borderTopLeftRadius: 32, borderTopRightRadius: 32 }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" }}>
                  {selectedDoubt?.status === "resolved" ? "Edit Reply" : "Reply to Doubt"}
                </Text>
                <TouchableOpacity onPress={() => { setSelectedDoubt(null); setReplyText(""); }}>
                  <Ionicons name="close-circle" size={28} color="#94A3B8" />
                </TouchableOpacity>
              </View>
              
              <View style={{ backgroundColor: "#F8FAFC", padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: "#F1F5F9" }}>
                <Text style={{ fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748B", marginBottom: 4 }}>{selectedDoubt?.studentName} asked:</Text>
                <Text style={{ fontSize: 15, fontFamily: "Poppins_500Medium", color: "#334155" }}>{selectedDoubt?.question}</Text>
              </View>

              <TextInput 
                style={{ backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, padding: 16, fontSize: 15, fontFamily: "Poppins_400Regular", height: 120, textAlignVertical: "top", marginBottom: 20 }}
                placeholder="Type your explanation here..."
                multiline
                value={replyText}
                onChangeText={setReplyText}
              />
              <TouchableOpacity style={[styles.replyBtn, { alignSelf: "stretch", alignItems: "center", paddingVertical: 16 }]} onPress={submitReply} disabled={submitting}>
                <Text style={[styles.replyText, { fontSize: 16 }]}>{submitting ? "Saving..." : (selectedDoubt?.status === "resolved" ? "Save Changes" : "Send Reply")}</Text>
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
  
  searchContainer: { marginTop: -12, paddingHorizontal: 20, zIndex: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 },

  scroll: { paddingBottom: 100, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },
  seeAll: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#94A3B8" },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 4 },
  listDesc: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#64748B", lineHeight: 18 },
  listRight: { alignItems: "flex-end" },
  timeText: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#94A3B8" },
  replyBtn: { backgroundColor: "#0EA5E9", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  replyText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
});




