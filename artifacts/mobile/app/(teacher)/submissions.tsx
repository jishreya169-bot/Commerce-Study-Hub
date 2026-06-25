import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl, Modal, Image, SafeAreaView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as WebBrowser from "expo-web-browser";

import { turso } from "../../lib/turso";
import { useAuth } from "@/context/AuthContext";
import { useTeacherContext } from "../../context/TeacherContext";

interface Submission {
  id: string;
  studentName: string;
  homeworkId: string;
  fileUrl: string;
  status: string;
  submittedAt: string;
  homeworkTitle?: string;
}

export default function TeacherSubmissions() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { activeClass } = useTeacherContext();
  
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [viewImageUrl, setViewImageUrl] = useState<string | null>(null);

  const fetchSubmissions = async () => {
    if (!user?.id) return;
    try {
      // Join submissions with homework to get the title
      let q = `SELECT s.*, h.title as homeworkTitle 
              FROM homework_submissions s 
              JOIN homework h ON s.homeworkId = h.id 
              WHERE h.teacherId = ?`;
      let args: any[] = [user.id];

      if (activeClass !== "All") {
        q += " AND h.batch = ?";
        args.push(activeClass);
      }
      q += " ORDER BY s.submittedAt DESC";

      const result = await turso.execute({ sql: q, args });
      
      const data = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj as Submission;
      });
      setSubmissions(data);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    // Ensure tables exist before querying
    const initDB = async () => {
      try {
        await turso.execute(`
          CREATE TABLE IF NOT EXISTS homework (
            id TEXT PRIMARY KEY,
            title TEXT,
            classId TEXT,
            teacherId TEXT,
            createdAt TEXT
          )
        `);
        await turso.execute(`
          CREATE TABLE IF NOT EXISTS homework_submissions (
            id TEXT PRIMARY KEY,
            homeworkId TEXT,
            studentId TEXT,
            studentName TEXT,
            fileUrl TEXT,
            status TEXT,
            submittedAt TEXT
          )
        `);
      } catch(e) {}
      fetchSubmissions();
    };
    initDB();
  }, [user?.id, activeClass]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchSubmissions();
    setRefreshing(false);
  }, [user?.id]);

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
          <Text style={styles.headerTitle}>Homework Submissions</Text>
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
            {submissions.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No submissions yet.</Text>
              </View>
            )}
            {submissions.map((sub, i) => (
              <View key={sub.id} style={[styles.listItem, i === submissions.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listIcon, { backgroundColor: "#10B98115" }]}>
                  <Ionicons name="checkmark-done" size={24} color="#10B981" />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle} numberOfLines={1}>{sub.studentName}</Text>
                  <Text style={styles.listDesc} numberOfLines={1}>HW: {sub.homeworkTitle}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.viewBtn} 
                  onPress={() => {
                    Haptics.selectionAsync();
                    if (sub.fileUrl) {
                      // Check if it's an image or generic file
                      if (sub.fileUrl.match(/\.(jpeg|jpg|gif|png)$/i) || sub.fileUrl.includes("image")) {
                        setViewImageUrl(sub.fileUrl);
                      } else {
                        // Fallback for PDF or other formats
                        WebBrowser.openBrowserAsync(sub.fileUrl);
                      }
                    }
                  }}
                >
                  <Text style={styles.viewBtnText}>View File</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* IMAGE VIEWER MODAL */}
      <Modal visible={!!viewImageUrl} transparent={true} animationType="fade">
        <SafeAreaView style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.9)" }}>
          <View style={{ flexDirection: "row", justifyContent: "flex-end", padding: 16 }}>
            <TouchableOpacity onPress={() => setViewImageUrl(null)} style={{ padding: 8, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20 }}>
              <Ionicons name="close" size={28} color="#FFF" />
            </TouchableOpacity>
          </View>
          {viewImageUrl && (
            <Image 
              source={{ uri: viewImageUrl }} 
              style={{ flex: 1, width: "100%", height: "100%" }} 
              resizeMode="contain" 
            />
          )}
        </SafeAreaView>
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
  
  scroll: { paddingBottom: 100, paddingTop: 20, marginTop: -16 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 4 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  
  viewBtn: { backgroundColor: "#0EA5E9", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 12 },
  viewBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_600SemiBold" },
});




