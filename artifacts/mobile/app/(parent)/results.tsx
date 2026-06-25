import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "@/lib/turso";
import { useAuth } from "@/context/AuthContext";

interface Result {
  id: string;
  examTitle: string;
  date: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
}

export default function ParentResults() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [results, setResults] = useState<Result[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [childName, setChildName] = useState("Child");

  useEffect(() => {
    if (!user) return;

    const fetchResults = async () => {
      try {
        let targetStudentId = "s1";
        
        // Find Child
        const childRes = await turso.execute({
          sql: "SELECT id, name FROM users WHERE parentId = ?",
          args: [user.id]
        });
        if (childRes.rows.length > 0) {
          targetStudentId = childRes.rows[0][0] as string;
          setChildName(childRes.rows[0][1] as string);
        } else {
          targetStudentId = "s1";
          setChildName("Priya Sharma");
        }

        const res = await turso.execute({
          sql: `
            SELECT r.id, e.title, e.date, r.marksObtained, e.totalMarks 
            FROM results r 
            JOIN exams e ON r.examId = e.id 
            WHERE r.studentId = ? 
            ORDER BY e.createdAt DESC
          `,
          args: [targetStudentId]
        });

        let totalP = 0;
        const data = res.rows.map(row => {
          const m = row[3] as number;
          const t = row[4] as number;
          const p = t > 0 ? Math.round((m / t) * 100) : 0;
          totalP += p;
          
          return {
            id: row[0] as string,
            examTitle: row[1] as string,
            date: row[2] as string,
            marksObtained: m,
            totalMarks: t,
            percentage: p
          };
        });

        setResults(data);
        if (data.length > 0) {
          setAvgScore(Math.round(totalP / data.length));
        }
      } catch (e) {
        console.error(e);
      }
    };

    fetchResults();
  }, [user]);

  const getScoreColor = (p: number) => {
    if (p >= 90) return "#10B981"; // Green
    if (p >= 75) return "#3B82F6"; // Blue
    if (p >= 50) return "#F59E0B"; // Orange
    return "#EF4444"; // Red
  };

  const filtered = results.filter(r => r.examTitle.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#F59E0B", "#D97706"]} style={[styles.header, { paddingTop: topPad + 10 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>{childName}'s Results</Text>
        </View>

        {/* OVERALL STATS */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{avgScore}%</Text>
            <Text style={styles.statLabel}>Average Score</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{results.length}</Text>
            <Text style={styles.statLabel}>Exams Given</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Floating Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search exams..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Text style={styles.sectionTitle}>Exam History</Text>

        {filtered.length > 0 ? (
          filtered.map((r, i) => (
            <Animated.View key={r.id} entering={FadeInDown.delay(i * 100).springify()} style={styles.resultCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.examTitle}>{r.examTitle}</Text>
                  <Text style={styles.examDate}>{new Date(r.date).toLocaleDateString()}</Text>
                </View>
                <View style={[styles.badge, { backgroundColor: getScoreColor(r.percentage) + "15" }]}>
                  <Text style={[styles.badgeText, { color: getScoreColor(r.percentage) }]}>{r.percentage}%</Text>
                </View>
              </View>
              
              <View style={styles.scoreRow}>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreVal}>{r.marksObtained}</Text>
                  <Text style={styles.scoreLabel}>Obtained</Text>
                </View>
                <Text style={styles.scoreDiv}>/</Text>
                <View style={styles.scoreBox}>
                  <Text style={styles.scoreVal}>{r.totalMarks}</Text>
                  <Text style={styles.scoreLabel}>Total</Text>
                </View>
              </View>

              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${r.percentage}%`, backgroundColor: getScoreColor(r.percentage) }]} />
              </View>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyBox}>
            <Ionicons name="document-text-outline" size={40} color="#CBD5E1" />
            <Text style={styles.emptyText}>No results found.</Text>
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
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  decoCircle1: { position: "absolute", top: -50, right: -50, width: 150, height: 150, borderRadius: 75, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -30, left: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { marginBottom: 20 },
  headerTitle: { fontFamily: "Poppins_700Bold", fontSize: 24, color: "#FFF" },
  statsCard: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 16,
    flexDirection: "row",
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)"
  },
  statCol: { flex: 1, alignItems: "center" },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  statVal: { fontFamily: "Poppins_700Bold", fontSize: 24, color: "#FFF" },
  statLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "rgba(255,255,255,0.8)" },
  
  searchContainer: {
    paddingHorizontal: 20,
    marginTop: -12,
    zIndex: 10
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#1E293B"
  },
  scroll: { padding: 20, paddingTop: 10 },
  sectionTitle: { fontFamily: "Poppins_700Bold", fontSize: 18, color: "#1E293B", marginBottom: 16 },
  
  resultCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  examTitle: { fontFamily: "Poppins_600SemiBold", fontSize: 16, color: "#1E293B" },
  examDate: { fontFamily: "Poppins_400Regular", fontSize: 12, color: "#64748B", marginTop: 2 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { fontFamily: "Poppins_700Bold", fontSize: 13 },
  
  scoreRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", marginBottom: 16, backgroundColor: "#F8FAFC", borderRadius: 12, padding: 12 },
  scoreBox: { alignItems: "center", flex: 1 },
  scoreVal: { fontFamily: "Poppins_700Bold", fontSize: 20, color: "#1E293B" },
  scoreLabel: { fontFamily: "Poppins_500Medium", fontSize: 12, color: "#64748B" },
  scoreDiv: { fontFamily: "Poppins_300Light", fontSize: 24, color: "#CBD5E1", paddingHorizontal: 16 },
  
  progressBarBg: { height: 6, backgroundColor: "#F1F5F9", borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: "100%", borderRadius: 3 },
  emptyBox: { alignItems: "center", padding: 40 },
  emptyText: { fontFamily: "Poppins_500Medium", fontSize: 15, color: "#94A3B8", marginTop: 12 }
});


