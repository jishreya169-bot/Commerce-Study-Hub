import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

import { turso } from "../../lib/turso";

const QUICK_ACTIONS = [
  { label: "Create Batch", icon: "add-circle", route: "/(admin)/courses", colors: ["#DBEAFE", "#BFDBFE"], iconColor: "#2563EB" },
  { label: "Timetable", icon: "calendar", route: "/(admin)/timetable", colors: ["#FCE7F3", "#FBCFE8"], iconColor: "#DB2777" },
];

export default function AcademicsPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [batches, setBatches] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchBatches = async () => {
      try {
        const res = await turso.execute("SELECT id, name, subject FROM classes ORDER BY createdAt DESC");
        const colors = ["#3B82F6", "#F59E0B", "#10B981", "#EC4899", "#8B5CF6"];
        const data = res.rows.map((r, i) => ({
          id: r[0] as string,
          name: r[1] as string,
          subject: r[2] as string,
          color: colors[i % colors.length]
        }));
        setBatches(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchBatches();
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
          <Text style={styles.headerTitle}>Academics</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput style={styles.searchInput} placeholder="Search batches or subjects..." placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        
        {/* QUICK ACTIONS */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Operations</Text>
          </View>
          <View style={styles.qaGrid}>
            {QUICK_ACTIONS.map((q, i) => (
              <TouchableOpacity key={i} onPress={() => { Haptics.selectionAsync(); router.push(q.route as any); }} style={styles.qaCardWrapper}>
                <LinearGradient colors={q.colors as any} style={styles.qaCard} start={{x:0, y:0}} end={{x:1, y:1}}>
                  <View style={styles.qaIconWrap}>
                    <Ionicons name={q.icon as any} size={24} color={q.iconColor} />
                  </View>
                  <Text style={[styles.qaLabel, { color: q.iconColor }]}>{q.label}</Text>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>

        {/* BATCHES */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Active Batches</Text>
            <TouchableOpacity><Text style={styles.seeAll}>View All</Text></TouchableOpacity>
          </View>
          <View style={styles.cardBlock}>
            {batches.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No active batches found.</Text>
              </View>
            )}
            {batches.map((b, i) => (
              <View key={b.id} style={[styles.listItem, i === batches.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={[styles.listIcon, { backgroundColor: b.color + "15" }]}>
                  <Ionicons name="people" size={20} color={b.color} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{b.name}</Text>
                  <Text style={styles.listDesc}>{b.subject}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.nextText}>Subject</Text>
                  <Text style={[styles.timeText, { color: b.color }]}>{b.subject.split(',')[0]}</Text>
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
  seeAll: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" },

  qaGrid: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  qaCardWrapper: { width: "48%", shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 2 },
  qaCard: { paddingVertical: 18, borderRadius: 24, alignItems: "center" },
  qaIconWrap: { width: 46, height: 46, borderRadius: 23, backgroundColor: "rgba(255,255,255,0.6)", justifyContent: "center", alignItems: "center", marginBottom: 8 },
  qaLabel: { fontSize: 11, fontFamily: "Poppins_700Bold" },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  listRight: { alignItems: "flex-end" },
  nextText: { fontSize: 10, fontFamily: "Poppins_500Medium", color: "#94A3B8", marginBottom: 2 },
  timeText: { fontSize: 13, fontFamily: "Poppins_700Bold" },
});




