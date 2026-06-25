import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { turso } from "../../lib/turso";
import { useAuth } from "@/context/AuthContext";

export default function StudentTests() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [upcomingTests, setUpcomingTests] = useState<any[]>([]);
  const [pastTests, setPastTests] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  React.useEffect(() => {
    const fetchTests = async () => {
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

        const examsRes = await turso.execute({
          sql: "SELECT id, title, date, totalMarks FROM exams WHERE classId = ? ORDER BY date DESC",
          args: [batch]
        });

        const resultsRes = await turso.execute({
          sql: "SELECT examId, marksObtained FROM results WHERE studentId = ?",
          args: [user.id]
        });

        const resultsMap: Record<string, number> = {};
        resultsRes.rows.forEach(r => {
          resultsMap[r[0] as string] = r[1] as number;
        });

        const upcoming: any[] = [];
        const past: any[] = [];

        examsRes.rows.forEach((r, i) => {
          const id = r[0] as string;
          const title = r[1] as string;
          const date = r[2] as string;
          const totalMarks = r[3] as number;
          const color = ["#3B82F6", "#F59E0B", "#10B981", "#EF4444"][i % 4];

          if (resultsMap[id] !== undefined) {
             past.push({ id, title, date, score: resultsMap[id], totalMarks, color });
          } else {
             upcoming.push({ id, title, date, duration: "60 mins", totalMarks, color });
          }
        });

        setUpcomingTests(upcoming);
        setPastTests(past);
      } catch(e) {
        console.error(e);
      }
    };
    fetchTests();
  }, [user]);

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
          <Text style={styles.headerTitle}>Tests & Quizzes</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search upcoming or past tests..." 
            placeholderTextColor="#94A3B8" 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* UPCOMING TESTS */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Upcoming Tests</Text>
          </View>
          <View style={styles.cardBlock}>
            {upcomingTests.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No upcoming tests found.</Text>
              </View>
            )}
            {upcomingTests.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((t, i, arr) => (
              <TouchableOpacity key={t.id} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]} onPress={() => Haptics.selectionAsync()}>
                <View style={[styles.listIcon, { backgroundColor: t.color + "15" }]}>
                  <Ionicons name="time" size={22} color={t.color} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{t.title}</Text>
                  <Text style={styles.listDesc}>{t.date} • {t.duration} • {t.totalMarks} Marks</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* PAST RESULTS */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Past Results</Text>
          </View>
          <View style={styles.cardBlock}>
            {pastTests.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No past tests found.</Text>
              </View>
            )}
            {pastTests.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase())).map((t, i, arr) => (
              <TouchableOpacity key={t.id} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]} onPress={() => Haptics.selectionAsync()}>
                <View style={[styles.listIcon, { backgroundColor: "#F1F5F9" }]}>
                  <Ionicons name="checkmark-done-circle" size={24} color="#64748B" />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{t.title}</Text>
                  <Text style={styles.listDesc}>{t.date}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.scoreLabel}>Score</Text>
                  <Text style={[styles.scoreValue, { color: t.color }]}>{t.score}/{t.totalMarks}</Text>
                </View>
              </TouchableOpacity>
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
  
  searchContainer: { marginTop: -12, paddingHorizontal: 20, zIndex: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 },

  scroll: { paddingBottom: 100, paddingTop: 40 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 4 },
  listDesc: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B" },
  
  listRight: { alignItems: "flex-end" },
  scoreLabel: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#94A3B8", marginBottom: 2 },
  scoreValue: { fontSize: 16, fontFamily: "Poppins_700Bold" },
});




