import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { turso } from "../../lib/turso";

export default function ReportsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [reports, setReports] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await turso.execute("SELECT id, title, date, classId FROM exams ORDER BY date DESC");
        const data = res.rows.map((r) => ({
          id: r[0] as string,
          title: (r[1] as string) + " Results",
          type: "Exam Result",
          date: r[2] ? new Date(r[2] as string).toLocaleDateString() : "N/A",
          color: "#3B82F6"
        }));
        setReports([
          { id: "r-rev", title: "Monthly Revenue Report", type: "Finance", date: "Today", color: "#10B981" },
          { id: "r-def", title: "Defaulters List", type: "Finance", date: "Today", color: "#EF4444" },
          ...data
        ]);
      } catch (e) {
        console.error(e);
      }
    };
    fetchExams();
  }, []);

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
          <Text style={styles.headerTitle}>Data & Reports</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* FILTERS */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.filterScroll}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: 20 }}>
            {["All Reports", "Finance", "Academics", "Attendance"].map((f, i) => (
              <TouchableOpacity key={i} style={[styles.filterChip, i === 0 && styles.filterChipActive]}>
                <Text style={[styles.filterText, i === 0 && styles.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </Animated.View>

        {/* REPORTS LIST */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.cardBlock}>
            {reports.map((r, i) => (
              <View key={r.id} style={[styles.listItem, i === reports.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.icon, { backgroundColor: r.color + "15" }]}>
                  <Ionicons name={r.type === "Finance" ? "wallet" : "document-text"} size={20} color={r.color} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{r.title}</Text>
                  <Text style={styles.listDesc}>{r.date}</Text>
                </View>
                <View style={styles.listRight}>
                  <View style={[styles.typePill, { backgroundColor: "#F1F5F9" }]}>
                    <Text style={[styles.typeText, { color: "#64748B" }]}>{r.type}</Text>
                  </View>
                  <TouchableOpacity style={styles.downloadBtn} onPress={() => alert("Downloading " + r.title)}>
                    <Ionicons name="download" size={14} color="#0EA5E9" />
                  </TouchableOpacity>
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
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  
  scroll: { paddingBottom: 100 },
  
  filterScroll: { marginTop: 24, marginBottom: 20 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#E2E8F0", borderRadius: 20 },
  filterChipActive: { backgroundColor: "#0EA5E9" },
  filterText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748B" },
  filterTextActive: { color: "#FFF" },

  section: { paddingHorizontal: 20, marginBottom: 30 },
  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  icon: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },
  listRight: { alignItems: "flex-end", gap: 8 },
  typePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  typeText: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  downloadBtn: { backgroundColor: "#F0F9FF", padding: 8, borderRadius: 10 },
});



