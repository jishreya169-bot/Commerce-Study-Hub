import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, Linking, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "../../lib/turso";
import * as WebBrowser from "expo-web-browser";

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "youtube";
  url: string;
  subject: string;
}

export default function StudentLibrary() {
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 50 : insets.top;

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [filter, setFilter] = useState<"all" | "pdf" | "youtube">("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchLibrary = async () => {
      try {
        const result = await turso.execute("SELECT id, title, description, type, url, subject FROM library ORDER BY createdAt DESC");
        const data = result.rows.map(r => ({
          id: r[0] as string,
          title: r[1] as string,
          description: r[2] as string,
          type: r[3] as "pdf" | "youtube",
          url: r[4] as string,
          subject: r[5] as string
        }));
        setItems(data);
      } catch (e) {
        console.error(e);
      }
    };
    fetchLibrary();
  }, []);

  const openResource = async (item: LibraryItem) => {
    try {
      if (item.type === "youtube") {
        Linking.openURL(item.url);
      } else {
        await WebBrowser.openBrowserAsync(item.url);
      }
    } catch (e) {
      alert("Could not open resource.");
    }
  };

  const filteredItems = items.filter(it => 
    (filter === "all" || it.type === filter) && 
    it.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0284C7", "#0369A1"]} style={[styles.header, { paddingTop: topPad + 10 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Digital Library</Text>
        </View>

        <View style={styles.filterRow}>
          <TouchableOpacity style={[styles.filterBtn, filter === "all" && styles.filterBtnActive]} onPress={() => setFilter("all")}>
            <Text style={[styles.filterBtnText, filter === "all" && { color: "#0369A1" }]}>All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filter === "pdf" && styles.filterBtnActive]} onPress={() => setFilter("pdf")}>
            <Text style={[styles.filterBtnText, filter === "pdf" && { color: "#0369A1" }]}>Books (PDF)</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterBtn, filter === "youtube" && styles.filterBtnActive]} onPress={() => setFilter("youtube")}>
            <Text style={[styles.filterBtnText, filter === "youtube" && { color: "#0369A1" }]}>Videos</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* FLOATING SEARCH */}
      <View style={{ marginTop: -12, paddingHorizontal: 20, zIndex: 10 }}>
        <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#0EA5E9", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 }}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput 
            style={{ flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 }} 
            placeholder="Search books or videos..." 
            placeholderTextColor="#94A3B8" 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.cardBlock}>
            {filteredItems.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No resources available.</Text>
              </View>
            )}
            {filteredItems.map((it, i) => (
              <TouchableOpacity key={it.id} style={[styles.listItem, i === filteredItems.length - 1 && { borderBottomWidth: 0 }]} onPress={() => openResource(it)}>
                <View style={[styles.listIcon, { backgroundColor: it.type === "youtube" ? "#FEE2E2" : "#E0E7FF" }]}>
                  <Ionicons name={it.type === "youtube" ? "logo-youtube" : "document"} size={22} color={it.type === "youtube" ? "#EF4444" : "#4F46E5"} />
                </View>
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{it.title}</Text>
                  <Text style={styles.listDesc}>{it.subject}</Text>
                </View>
                <View style={styles.openBtn}>
                  <Text style={styles.openBtnText}>{it.type === "youtube" ? "Watch" : "Read"}</Text>
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
  header: { paddingHorizontal: 20, paddingBottom: 12, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { marginBottom: 20, zIndex: 2 },
  headerTitle: { fontSize: 24, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  
  filterRow: { flexDirection: "row", gap: 10, zIndex: 2 },
  filterBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  filterBtnActive: { backgroundColor: "#FFF" },
  filterBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#E0F2FE" },

  scroll: { paddingBottom: 100, paddingTop: 40 },
  section: { paddingHorizontal: 20, marginBottom: 30 },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_500Medium", color: "#64748B" },
  openBtn: { backgroundColor: "#F1F5F9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  openBtnText: { fontSize: 12, fontFamily: "Poppins_600SemiBold", color: "#0284C7" },
});

