import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, Platform, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "../../lib/turso";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "expo-router";

interface StudentRank {
  id: string;
  name: string;
  points: number;
  streak: number;
}

export default function Leaderboard() {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const router = useRouter();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [students, setStudents] = useState<StudentRank[]>([]);
  const [myRank, setMyRank] = useState(0);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await turso.execute({
          sql: "SELECT id, name, points, streak FROM users WHERE role = 'student' AND batch = (SELECT batch FROM users WHERE id = ?) ORDER BY points DESC, streak DESC",
          args: [user?.id || ""]
        });

        const data = res.rows.map(r => ({
          id: r[0] as string,
          name: r[1] as string,
          points: (r[2] as number) || 0,
          streak: (r[3] as number) || 0
        }));

        setStudents(data);
        const rankIndex = data.findIndex(s => s.id === user?.id);
        if (rankIndex !== -1) setMyRank(rankIndex + 1);
      } catch (e) {
        console.error(e);
      }
    };

    if (user) fetchLeaderboard();
  }, [user]);

  const getRankColor = (index: number) => {
    if (index === 0) return "#F59E0B"; // Gold
    if (index === 1) return "#94A3B8"; // Silver
    if (index === 2) return "#B45309"; // Bronze
    return "#3B82F6"; // Blue for others
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#6366F1", "#4338CA"]} style={[styles.header, { paddingTop: topPad + 10 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Class Leaderboard</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* MY RANK */}
        {myRank > 0 && (
          <View style={styles.myRankCard}>
            <View style={styles.myRankLeft}>
              <Text style={styles.myRankLabel}>Your Rank</Text>
              <Text style={styles.myRankVal}>#{myRank}</Text>
            </View>
            <View style={styles.myRankDiv} />
            <View style={styles.myRankRight}>
              <Text style={styles.myPointsLabel}>Total Points</Text>
              <Text style={styles.myPointsVal}>💎 {students[myRank-1]?.points}</Text>
            </View>
          </View>
        )}
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Top Students</Text>
          </View>
          <View style={styles.cardBlock}>
            {students.map((s, i) => (
              <View key={s.id} style={[styles.listItem, i === students.length - 1 && { borderBottomWidth: 0 }, s.id === user?.id && { backgroundColor: "#EEF2FF", borderRadius: 16 }]}>
                <View style={styles.rankBox}>
                  {i < 3 ? (
                    <Ionicons name="trophy" size={24} color={getRankColor(i)} />
                  ) : (
                    <Text style={styles.rankNum}>#{i + 1}</Text>
                  )}
                </View>
                
                <View style={[styles.avatar, { backgroundColor: getRankColor(i) + "15" }]}>
                  <Text style={[styles.avatarText, { color: getRankColor(i) }]}>{s.name.slice(0, 2).toUpperCase()}</Text>
                </View>
                
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{s.name} {s.id === user?.id && "(You)"}</Text>
                  <Text style={styles.listDesc}>🔥 {s.streak} Day Streak</Text>
                </View>
                
                <View style={styles.listRight}>
                  <Text style={styles.pointsVal}>{s.points}</Text>
                  <Text style={styles.pointsLabel}>pts</Text>
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
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  
  myRankCard: { flexDirection: "row", backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 20, paddingVertical: 16, paddingHorizontal: 24, zIndex: 2 },
  myRankLeft: { flex: 1, alignItems: "center" },
  myRankLabel: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.8)", marginBottom: 2 },
  myRankVal: { fontSize: 28, fontFamily: "Poppins_700Bold", color: "#FFF" },
  myRankDiv: { width: 1, backgroundColor: "rgba(255,255,255,0.3)" },
  myRankRight: { flex: 1, alignItems: "center" },
  myPointsLabel: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "rgba(255,255,255,0.8)", marginBottom: 2 },
  myPointsVal: { fontSize: 28, fontFamily: "Poppins_700Bold", color: "#FFF" },

  scroll: { paddingBottom: 100, paddingTop: 10 },
  section: { paddingHorizontal: 20, marginTop: -16, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 10, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 12 },
  rankBox: { width: 30, alignItems: "center", justifyContent: "center" },
  rankNum: { fontSize: 15, fontFamily: "Poppins_700Bold", color: "#64748B" },
  avatar: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  avatarText: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },
  listRight: { alignItems: "flex-end", paddingRight: 4 },
  pointsVal: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#3B82F6" },
  pointsLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#94A3B8" },
});


