import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "../../lib/turso";
import { useAuth } from "@/context/AuthContext";

export default function StudentAttendance() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [attendancePercent, setAttendancePercent] = useState(0);
  const [attendanceList, setAttendanceList] = useState<{date: string, status: string}[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    
    const fetchAttendance = async () => {
      try {
        setLoading(true);
        // Fetch Real Attendance
        const attRes = await turso.execute({
          sql: "SELECT date, status FROM student_attendance WHERE studentId = ? ORDER BY date DESC",
          args: [user.id]
        });
        
        const data = attRes.rows.map(r => ({
          date: r[0] as string,
          status: r[1] as string
        }));
        
        setAttendanceList(data);
        
        if (data.length > 0) {
          const presentCount = data.filter(r => r.status === 'Present').length;
          setAttendancePercent(Math.round((presentCount / data.length) * 100));
        } else {
          setAttendancePercent(100);
        }
      } catch (e) {
        console.error("Attendance fetch error:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Present": return "#10B981"; // Emerald
      case "Absent": return "#EF4444"; // Red
      case "Late": return "#F59E0B"; // Amber
      case "Half-day": return "#3B82F6"; // Blue
      default: return "#64748B"; // Slate
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Present": return "checkmark-circle";
      case "Absent": return "close-circle";
      case "Late": return "time";
      case "Half-day": return "partly-sunny";
      default: return "help-circle";
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
          <Text style={styles.headerTitle}>My Attendance</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        {loading ? (
          <View style={{ padding: 40, alignItems: "center" }}>
            <ActivityIndicator color="#0EA5E9" size="large" />
          </View>
        ) : (
          <>
            {/* OVERVIEW CARD */}
            <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.overviewSection}>
              <View style={styles.overviewCard}>
                <View style={styles.overviewContent}>
                  <Text style={styles.overviewLabel}>Overall Attendance</Text>
                  <Text style={[styles.overviewPercent, { color: attendancePercent >= 75 ? "#10B981" : "#EF4444" }]}>
                    {attendancePercent}%
                  </Text>
                  {attendancePercent < 75 && attendanceList.length > 0 && (
                    <Text style={styles.overviewWarning}>Attention: Your attendance is below the 75% requirement.</Text>
                  )}
                </View>
                <View style={styles.pieWrap}>
                  <Ionicons name="pie-chart" size={64} color={attendancePercent >= 75 ? "#10B981" : "#EF4444"} />
                </View>
              </View>
            </Animated.View>

            {/* DAILY RECORDS */}
            <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
              <View style={styles.sectionHead}>
                <Text style={styles.sectionTitle}>Daily Records</Text>
                <Text style={styles.recordCount}>{attendanceList.length} Days Logged</Text>
              </View>
              
              <View style={styles.cardBlock}>
                {attendanceList.length === 0 ? (
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No attendance records found.</Text>
                  </View>
                ) : (
                  attendanceList.map((item, i) => {
                    const color = getStatusColor(item.status);
                    const iconName = getStatusIcon(item.status);
                    
                    return (
                      <View key={i} style={[styles.listItem, i === attendanceList.length - 1 && { borderBottomWidth: 0 }]}>
                        <View style={[styles.listIcon, { backgroundColor: color + "15" }]}>
                          <Ionicons name={iconName as any} size={22} color={color} />
                        </View>
                        <View style={styles.listTextWrap}>
                          <Text style={styles.listTitle}>
                            {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                          </Text>
                          <Text style={styles.listDesc}>Recorded for {item.date}</Text>
                        </View>
                        <View style={[styles.statusBadge, { backgroundColor: color + "15" }]}>
                          <Text style={[styles.statusText, { color }]}>{item.status.toUpperCase()}</Text>
                        </View>
                      </View>
                    );
                  })
                )}
              </View>
            </Animated.View>
          </>
        )}
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
  overviewSection: { paddingHorizontal: 20, marginBottom: 24, marginTop: -10 },
  overviewCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  overviewContent: { flex: 1, paddingRight: 16 },
  overviewLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748B", textTransform: "uppercase", letterSpacing: 0.5 },
  overviewPercent: { fontSize: 42, fontFamily: "Poppins_800ExtraBold", marginTop: -4 },
  overviewWarning: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#EF4444", marginTop: 4, lineHeight: 16 },
  pieWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#F8FAFC", justifyContent: "center", alignItems: "center" },

  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },
  recordCount: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 46, height: 46, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  statusText: { fontSize: 11, fontFamily: "Poppins_700Bold", letterSpacing: 0.5 },
});
