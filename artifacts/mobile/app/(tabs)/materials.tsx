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
import * as Linking from "expo-linking";

interface Material {
  id: string;
  title: string;
  type: string;
  size?: string;
  uploadedBy: string;
  color?: string;
  url: string;
  fileType: string;
}

export default function StudentMaterials() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const fetchMaterials = async () => {
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
        sql: "SELECT * FROM materials WHERE batch = ? ORDER BY uploadedAt DESC",
        args: [batch]
      });
      const data = result.rows.map(row => {
        const obj: any = {};
        result.columns.forEach((col, idx) => { obj[col] = row[idx]; });
        return obj as Material;
      });
      setMaterials(data);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchMaterials();
  }, [user?.class]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await fetchMaterials();
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
          <Text style={styles.headerTitle}>Study Materials</Text>
          <View style={{ width: 40 }} />
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput 
            style={styles.searchInput} 
            placeholder="Search documents or videos..." 
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

        {/* RECENT UPLOADS */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Recent Uploads</Text>
            <TouchableOpacity><Text style={styles.seeAll}>Filter</Text></TouchableOpacity>
          </View>
          <View style={styles.cardBlock}>
            {materials.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No materials found.</Text>
              </View>
            )}
            {materials.filter(m => m.title.toLowerCase().includes(searchQuery.toLowerCase())).map((m, i, arr) => {
              const color = m.type === "video" || m.fileType === "video" ? "#8B5CF6" : "#EF4444";
              return (
                <View key={m.id} style={[styles.listItem, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.listIcon, { backgroundColor: color + "15" }]}>
                    <Ionicons name={m.type === "video" || m.fileType === "video" ? "play-circle" : "document-text"} size={24} color={color} />
                  </View>
                  <View style={styles.listTextWrap}>
                    <Text style={styles.listTitle} numberOfLines={2}>{m.title}</Text>
                    <Text style={styles.listDesc}>{m.type?.toUpperCase() || m.fileType?.toUpperCase()} • By Teacher</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.downloadBtn} 
                    onPress={() => {
                      Haptics.selectionAsync();
                      if (m.url) Linking.openURL(m.url);
                    }}
                  >
                    <Ionicons name="cloud-download" size={18} color="#0EA5E9" />
                  </TouchableOpacity>
                </View>
              );
            })}
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

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 46, height: 46, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 4, lineHeight: 20 },
  listDesc: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B" },
  
  downloadBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#F0F9FF", justifyContent: "center", alignItems: "center" },
});




