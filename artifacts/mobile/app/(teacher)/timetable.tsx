import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { turso } from "../../lib/turso";
import { useAuth } from "@/context/AuthContext";
import WeeklyTimetableGrid, { TimetableClass } from "../../components/WeeklyTimetableGrid";

export default function TeacherTimetable() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [schedule, setSchedule] = useState<TimetableClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, [user?.id]);

  const fetchSchedule = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      // Fetch both recurring and one-time classes for this teacher
      const res = await turso.execute({
        sql: "SELECT t.id, t.title, t.batch, t.startTime, t.endTime, t.type, t.color, t.dayOfWeek, t.date FROM timetable t WHERE t.teacherId = ?",
        args: [user.id]
      });
      
      const parsed = res.rows.map(r => {
        return {
          id: r[0] as string,
          title: r[1] as string,
          batch: r[2] as string,
          startTime: (r[3] as string) || "10:00 AM",
          endTime: r[4] as string,
          type: (r[5] as string) || "recurring",
          color: r[6] as string,
          dayOfWeek: r[7] as string,
          date: r[8] as string,
          teacherName: user.name
        };
      });
      
      setSchedule(parsed);
    } catch (e) {
      console.error("Fetch schedule error", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Timetable</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {loading ? (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#0EA5E9" />
        </View>
      ) : (
        <View style={{ flex: 1, padding: 16 }}>
          <WeeklyTimetableGrid schedule={schedule} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomLeftRadius: 24, borderBottomRightRadius: 24, overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFF" },
});



