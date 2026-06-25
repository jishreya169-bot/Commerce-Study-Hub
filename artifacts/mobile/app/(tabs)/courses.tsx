import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { turso } from "../../lib/turso";
import { RefreshControl } from "react-native";
import { useAuth } from "@/context/AuthContext";

interface TimetableClass {
  id: string;
  title: string;
  batch: string;
  time: string;
  color: string;
  progress?: number;
}

export default function StudentCourses() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [courses, setCourses] = useState<TimetableClass[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchCourses = async () => {
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
      const result = await turso.execute({
        sql: "SELECT * FROM timetable WHERE batch = ?",
        args: [batch]
      });
      const data = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj as TimetableClass;
      });
      setCourses(data);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchCourses();
  }, [user?.class]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchCourses();
    setRefreshing(false);
  }, [user?.class]);

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
          <Text style={styles.headerTitle}>My Courses</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search enrolled courses..." 
            placeholderTextColor="#94A3B8" 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#0EA5E9" />}
      >

        {/* PROGRESS OVERVIEW */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <View style={styles.cardBlock}>
            <View style={styles.progressRow}>
              <View style={styles.progressStat}>
                <Text style={styles.statVal}>{courses.length}</Text>
                <Text style={styles.statLabel}>Upcoming Classes</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.progressStat}>
                <Text style={styles.statVal}>{user?.class || "N/A"}</Text>
                <Text style={styles.statLabel}>My Batch</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* COURSE LIST */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Enrolled Classes</Text>
          </View>
          <View style={styles.cardBlock}>
            {courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No upcoming classes found.</Text>
              </View>
            )}
            {courses.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase())).map((c, i, arr) => (
              <TouchableOpacity 
                key={c.id} 
                style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}
                onPress={() => {
                  Haptics.selectionAsync();
                  // router.push(`/course/${c.id}`) -> If it corresponds to a course
                }}
                activeOpacity={0.7}
              >
                <View style={[styles.listIcon, { backgroundColor: (c.color || "#3B82F6") + "15" }]}>
                  <Ionicons name="book" size={24} color={c.color || "#3B82F6"} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{c.title}</Text>
                  
                  {/* Progress Bar / Time */}
                  <View style={styles.progressWrap}>
                    <Ionicons name="time-outline" size={14} color="#64748B" />
                    <Text style={[styles.progressText, { width: 'auto', fontSize: 12 }]}>{c.time}</Text>
                  </View>

                </View>
                <View style={styles.resumeBtn}>
                  <Ionicons name="calendar" size={16} color="#FFF" />
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

  scroll: { paddingBottom: 100, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, padding: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  
  progressRow: { flexDirection: "row", alignItems: "center" },
  progressStat: { flex: 1, alignItems: "center" },
  statVal: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#0EA5E9" },
  statLabel: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },
  statDivider: { width: 1, height: 40, backgroundColor: "#E2E8F0" },

  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 6 },
  
  progressWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  progressBg: { flex: 1, height: 6, backgroundColor: "#E2E8F0", borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  progressText: { fontSize: 10, fontFamily: "Poppins_600SemiBold", color: "#64748B", width: 45 },

  resumeBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#0EA5E9", justifyContent: "center", alignItems: "center" },
});




