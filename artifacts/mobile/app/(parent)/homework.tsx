import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "@/lib/turso";
import { useAuth } from "@/context/AuthContext";

export default function ParentHomework() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [homework, setHomework] = useState<any[]>([]);
  const [childName, setChildName] = useState("Child");

  useEffect(() => {
    if (!user) return;
    
    const fetchHomework = async () => {
      try {
        let targetStudentId = "s1";
        let batch = "Class 12 - Commerce";

        // Find Child
        const childRes = await turso.execute({
          sql: "SELECT id, name, batch FROM users WHERE parentId = ?",
          args: [user.id]
        });
        if (childRes.rows.length > 0) {
          targetStudentId = childRes.rows[0][0] as string;
          setChildName(childRes.rows[0][1] as string);
          batch = (childRes.rows[0][2] as string) || batch;
        }

        // Fetch All Homework for Batch
        const hwRes = await turso.execute({
          sql: "SELECT id, title, description, dueDate FROM homework WHERE batch = ? ORDER BY dueDate ASC",
          args: [batch]
        });

        // Fetch Child's Submissions
        const subRes = await turso.execute({
          sql: "SELECT homeworkId, status, grade FROM homework_submissions WHERE studentId = ?",
          args: [targetStudentId]
        });

        const submissionMap: Record<string, { status: string, grade: string }> = {};
        subRes.rows.forEach(r => {
          submissionMap[r[0] as string] = {
            status: (r[1] as string) || "submitted",
            grade: (r[2] as string) || "Pending"
          };
        });

        const data = hwRes.rows.map(r => {
          const hwId = r[0] as string;
          const sub = submissionMap[hwId];
          
          let hwStatus = "pending";
          if (sub) {
             hwStatus = sub.status === "graded" ? "graded" : "submitted";
          } else {
             // check if overdue
             const dueDate = new Date(r[3] as string);
             const now = new Date();
             if (now > dueDate) hwStatus = "overdue";
          }

          return {
            id: hwId,
            title: r[1] as string,
            description: r[2] as string,
            dueDate: r[3] as string,
            status: hwStatus,
            grade: sub?.grade || null
          };
        });

        setHomework(data);
      } catch (e) {
        console.error(e);
      }
    };

    fetchHomework();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return '#3B82F6';
      case 'graded': return '#10B981';
      case 'overdue': return '#DC2626';
      default: return '#F59E0B';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'submitted': return 'Submitted';
      case 'graded': return 'Graded';
      case 'overdue': return 'Overdue';
      default: return 'Pending';
    }
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#F59E0B", "#D97706"]} style={[styles.header, { paddingTop: topPad + 10 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>{childName}'s Homework</Text>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Homework Tracker</Text>

        {homework.length > 0 ? (
          homework.map((hw, i) => (
            <Animated.View key={hw.id} entering={FadeInDown.delay(i * 100).springify()} style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.hwTitle}>{hw.title}</Text>
                <View style={[styles.badge, { backgroundColor: getStatusColor(hw.status) + "15" }]}>
                  <Text style={[styles.badgeText, { color: getStatusColor(hw.status) }]}>
                    {getStatusText(hw.status)}
                  </Text>
                </View>
              </View>
              
              <Text style={styles.hwDesc} numberOfLines={2}>{hw.description}</Text>
              
              <View style={styles.cardBottom}>
                <View style={styles.dateRow}>
                  <Ionicons name="calendar-outline" size={14} color="#64748B" />
                  <Text style={[styles.hwDate, { color: hw.status === 'overdue' ? '#DC2626' : '#64748B' }]}>
                    Due: {new Date(hw.dueDate).toLocaleDateString()}
                  </Text>
                </View>

                {hw.status === 'graded' && hw.grade && (
                  <View style={styles.gradeBox}>
                    <Text style={styles.gradeText}>Grade: {hw.grade}</Text>
                  </View>
                )}
              </View>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="checkmark-done-circle" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No homework assigned.</Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 25,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  decoCircle1: { position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -30, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { marginBottom: 10 },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 24, color: "#FFF" },
  
  scroll: { padding: 20 },
  sectionTitle: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#1E293B", marginBottom: 16 },
  
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: "#F59E0B",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  hwTitle: { flex: 1, fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#1E293B", marginRight: 10 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: "Poppins_600SemiBold", fontSize: 12 },
  
  hwDesc: { fontFamily: "Poppins_400Regular", fontSize: 13, color: "#64748B", marginBottom: 16 },
  
  cardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F1F5F9", paddingTop: 12 },
  dateRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  hwDate: { fontFamily: "Poppins_500Medium", fontSize: 12 },
  
  gradeBox: { backgroundColor: "#ECFDF5", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  gradeText: { fontFamily: "Poppins_600SemiBold", fontSize: 12, color: "#059669" },
  
  emptyBox: { alignItems: "center", padding: 40, backgroundColor: "#FFF", borderRadius: 16, borderStyle: "dashed", borderWidth: 1, borderColor: "#E2E8F0" },
  emptyText: { fontFamily: "Poppins_500Medium", fontSize: 15, color: "#94A3B8", marginTop: 12 }
});
