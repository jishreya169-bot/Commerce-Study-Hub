import React, { useState, useEffect, useRef } from "react";
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity, TextInput, Modal, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "../../lib/turso";
import { useAuth } from "../../context/AuthContext";

interface Result {
  id: string;
  examTitle: string;
  date: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
}

export default function StudentResults() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [results, setResults] = useState<Result[]>([]);
  const [avgScore, setAvgScore] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [showReportCard, setShowReportCard] = useState(false);

  useEffect(() => {
    if (!user) return;

    const fetchResults = async () => {
      try {
        const res = await turso.execute({
          sql: `
            SELECT r.id, e.title, e.date, r.marksObtained, e.totalMarks 
            FROM results r 
            JOIN exams e ON r.examId = e.id 
            WHERE r.studentId = ? 
            ORDER BY e.createdAt DESC
          `,
          args: [user.id]
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

  const getGrade = (p: number) => {
    if (p >= 90) return "A+";
    if (p >= 80) return "A";
    if (p >= 70) return "B+";
    if (p >= 60) return "B";
    if (p >= 50) return "C";
    return "F";
  };

  const totalMaxMarks = results.reduce((acc, curr) => acc + curr.totalMarks, 0);
  const totalObtainedMarks = results.reduce((acc, curr) => acc + curr.marksObtained, 0);
  const overallPercentage = totalMaxMarks > 0 ? Math.round((totalObtainedMarks / totalMaxMarks) * 100) : 0;
  const overallGrade = getGrade(overallPercentage);

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#EC4899", "#BE185D"]} style={[styles.header, { paddingTop: topPad + 10 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>My Results</Text>
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

      {/* FLOATING SEARCH */}
      <View style={{ marginTop: -12, paddingHorizontal: 20, zIndex: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 }}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput 
            style={{ flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 }} 
            placeholder="Search past results..." 
            placeholderTextColor="#94A3B8" 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* REPORT CARD BTN */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <TouchableOpacity 
            style={{ backgroundColor: "#0EA5E9", paddingVertical: 16, borderRadius: 16, flexDirection: "row", justifyContent: "center", alignItems: "center", gap: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 }}
            onPress={() => setShowReportCard(true)}
          >
            <Ionicons name="document-text" size={20} color="#FFF" />
            <Text style={{ fontSize: 16, fontFamily: "Poppins_700Bold", color: "#FFF" }}>View Report Card</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Performance Report</Text>
          </View>
          <View style={styles.cardBlock}>
            {results.filter(r => r.examTitle.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No results found.</Text>
              </View>
            )}
            {results.filter(r => r.examTitle.toLowerCase().includes(searchQuery.toLowerCase())).map((r, i, arr) => (
              <TouchableOpacity key={r.id} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.listContent}>
                  <Text style={styles.listTitle}>{r.examTitle}</Text>
                  <Text style={styles.listDate}>{r.date}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.marksText}>{r.marksObtained} / {r.totalMarks}</Text>
                  <View style={[styles.pill, { backgroundColor: getScoreColor(r.percentage) + "15" }]}>
                    <Text style={[styles.pillText, { color: getScoreColor(r.percentage) }]}>{r.percentage}%</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </ScrollView>

      {/* REPORT CARD MODAL */}
      <Modal visible={showReportCard} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: 20 }}>
          <View style={{ width: "100%", backgroundColor: "#FFF", borderRadius: 24, overflow: "hidden", maxHeight: "90%" }}>
            
            {/* Modal Header */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" }}>
              <Text style={{ fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A" }}>Report Card Preview</Text>
              <TouchableOpacity onPress={() => setShowReportCard(false)} style={{ backgroundColor: "#F1F5F9", width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" }}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20 }}>
              {/* Marksheet Container */}
              <View style={{ borderWidth: 2, borderColor: "#0F172A", padding: 20, borderRadius: 8, backgroundColor: "#FAFAFA" }}>
                
                {/* School Header */}
                <View style={{ alignItems: "center", borderBottomWidth: 2, borderBottomColor: "#0F172A", paddingBottom: 16, marginBottom: 16 }}>
                  <Ionicons name="school" size={40} color="#0F172A" style={{ marginBottom: 8 }} />
                  <Text style={{ fontSize: 22, fontFamily: "Poppins_700Bold", color: "#0F172A", textTransform: "uppercase", textAlign: "center" }}>Commerce Study Hub</Text>
                  <Text style={{ fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#475569", letterSpacing: 1 }}>OFFICIAL STATEMENT OF MARKS</Text>
                </View>

                {/* Student Info */}
                <View style={{ marginBottom: 20 }}>
                  <View style={{ flexDirection: "row", marginBottom: 6 }}>
                    <Text style={{ width: 100, fontSize: 12, fontFamily: "Poppins_700Bold", color: "#334155" }}>Student Name:</Text>
                    <Text style={{ flex: 1, fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }}>{user?.name}</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 6 }}>
                    <Text style={{ width: 100, fontSize: 12, fontFamily: "Poppins_700Bold", color: "#334155" }}>Student ID:</Text>
                    <Text style={{ flex: 1, fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }}>{user?.id}</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={{ width: 100, fontSize: 12, fontFamily: "Poppins_700Bold", color: "#334155" }}>Academic Yr:</Text>
                    <Text style={{ flex: 1, fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#0F172A" }}>2026-2027</Text>
                  </View>
                </View>

                {/* Marks Table */}
                <View style={{ borderWidth: 1, borderColor: "#0F172A", marginBottom: 20 }}>
                  {/* Table Header */}
                  <View style={{ flexDirection: "row", backgroundColor: "#0F172A", paddingVertical: 10 }}>
                    <Text style={{ flex: 2, paddingHorizontal: 10, fontSize: 11, fontFamily: "Poppins_700Bold", color: "#FFF" }}>SUBJECT / EXAM</Text>
                    <Text style={{ flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Poppins_700Bold", color: "#FFF" }}>MAX</Text>
                    <Text style={{ flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Poppins_700Bold", color: "#FFF" }}>OBT</Text>
                    <Text style={{ flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Poppins_700Bold", color: "#FFF" }}>GRADE</Text>
                  </View>

                  {/* Table Rows */}
                  {results.length === 0 ? (
                    <View style={{ padding: 16, alignItems: "center" }}>
                      <Text style={{ fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" }}>No exams recorded yet.</Text>
                    </View>
                  ) : (
                    results.map((r, i) => (
                      <View key={r.id} style={{ flexDirection: "row", borderTopWidth: 1, borderTopColor: "#E2E8F0", paddingVertical: 10 }}>
                        <Text style={{ flex: 2, paddingHorizontal: 10, fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#334155" }} numberOfLines={2}>{r.examTitle}</Text>
                        <Text style={{ flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#334155" }}>{r.totalMarks}</Text>
                        <Text style={{ flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Poppins_700Bold", color: "#0F172A" }}>{r.marksObtained}</Text>
                        <Text style={{ flex: 1, textAlign: "center", fontSize: 11, fontFamily: "Poppins_700Bold", color: getScoreColor(r.percentage) }}>{getGrade(r.percentage)}</Text>
                      </View>
                    ))
                  )}

                  {/* Table Footer / Totals */}
                  {results.length > 0 && (
                    <View style={{ flexDirection: "row", borderTopWidth: 2, borderTopColor: "#0F172A", backgroundColor: "#F1F5F9", paddingVertical: 10 }}>
                      <Text style={{ flex: 2, paddingHorizontal: 10, fontSize: 12, fontFamily: "Poppins_800ExtraBold", color: "#0F172A" }}>GRAND TOTAL</Text>
                      <Text style={{ flex: 1, textAlign: "center", fontSize: 12, fontFamily: "Poppins_800ExtraBold", color: "#0F172A" }}>{totalMaxMarks}</Text>
                      <Text style={{ flex: 1, textAlign: "center", fontSize: 12, fontFamily: "Poppins_800ExtraBold", color: "#0F172A" }}>{totalObtainedMarks}</Text>
                      <Text style={{ flex: 1, textAlign: "center", fontSize: 12, fontFamily: "Poppins_800ExtraBold", color: getScoreColor(overallPercentage) }}>{overallGrade}</Text>
                    </View>
                  )}
                </View>

                {/* Overall Result */}
                {results.length > 0 && (
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, backgroundColor: "#E0F2FE", borderRadius: 8, borderWidth: 1, borderColor: "#BAE6FD", marginBottom: 30 }}>
                    <View>
                      <Text style={{ fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#0284C7", marginBottom: 2 }}>FINAL PERCENTAGE</Text>
                      <Text style={{ fontSize: 24, fontFamily: "Poppins_800ExtraBold", color: "#0369A1" }}>{overallPercentage}%</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#0284C7", marginBottom: 2 }}>RESULT</Text>
                      <Text style={{ fontSize: 18, fontFamily: "Poppins_800ExtraBold", color: overallPercentage >= 50 ? "#16A34A" : "#DC2626" }}>
                        {overallPercentage >= 50 ? "PASS" : "FAIL"}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Signatures */}
                <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 20 }}>
                  <View style={{ alignItems: "center", width: "45%" }}>
                    <View style={{ borderBottomWidth: 1, borderBottomColor: "#0F172A", width: "100%", height: 40 }} />
                    <Text style={{ fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginTop: 4 }}>Class Teacher</Text>
                  </View>
                  <View style={{ alignItems: "center", width: "45%" }}>
                    <View style={{ borderBottomWidth: 1, borderBottomColor: "#0F172A", width: "100%", height: 40 }} />
                    <Text style={{ fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginTop: 4 }}>Principal</Text>
                  </View>
                </View>
                
              </View>
              
              <View style={{ height: 20 }} />
            </ScrollView>

          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" }, 
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { marginBottom: 20, zIndex: 2 },
  headerTitle: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  
  statsCard: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingVertical: 20, zIndex: 2 },
  statCol: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 28, fontFamily: "Poppins_700Bold", color: "#FFF", marginBottom: 2 },
  statLabel: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.8)" },
  statDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.2)" },

  scroll: { paddingBottom: 100, paddingTop: 40 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  listContent: { flex: 1, paddingRight: 10 },
  listTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 4 },
  listDate: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },
  listRight: { alignItems: "flex-end", gap: 6 },
  marksText: { fontSize: 14, fontFamily: "Poppins_700Bold", color: "#334155" },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  pillText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
});


