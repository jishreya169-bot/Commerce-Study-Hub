import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "@/context/AuthContext";
import { turso } from "../../lib/turso";

interface Notif {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  sender: string;
  type: "admin" | "teacher" | "system";
  icon: string;
}

export default function StudentNotifications() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Get user batch
      const userRes = await turso.execute({
        sql: "SELECT batch FROM users WHERE id = ?",
        args: [user?.id || ""]
      });
      const batch = userRes.rows.length > 0 ? (userRes.rows[0][0] as string) : "";

      // 1. Fetch targeted System Notifications (Fees, etc.)
      const notifRes = await turso.execute({
        sql: "SELECT id, title, message, createdAt FROM notifications WHERE userId = ?",
        args: [user?.id || ""]
      });
      const systemNotifs: Notif[] = notifRes.rows.map(r => ({
        id: r[0] as string,
        title: r[1] as string,
        message: r[2] as string,
        createdAt: r[3] as string,
        sender: "System",
        type: "system",
        icon: "alert-circle"
      }));

      // 2. Fetch Announcements (Broadcasts from Admin)
      const annRes = await turso.execute({
        sql: "SELECT id, title, message, createdAt, author FROM announcements WHERE target = 'All' OR target = 'Students' OR target = ?",
        args: [batch]
      });
      const announcements: Notif[] = annRes.rows.map(r => ({
        id: r[0] as string,
        title: r[1] as string,
        message: r[2] as string,
        createdAt: r[3] as string,
        sender: (r[4] as string) || "Admin",
        type: "admin",
        icon: "megaphone"
      }));

      // Combine and sort descending by date
      let combined = [...systemNotifs, ...announcements];
      combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setNotifications(combined);
      
      // Mark as read (for system notifications)
      await turso.execute({
        sql: "UPDATE notifications SET read = 1 WHERE userId = ?",
        args: [user?.id || ""]
      });
      
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.historyContainer}>
          {loading ? (
            <ActivityIndicator color="#0EA5E9" style={{ marginTop: 40 }} />
          ) : notifications.length === 0 ? (
            <Text style={{ textAlign: "center", color: "#94A3B8", marginTop: 40 }}>No notifications yet.</Text>
          ) : (
            notifications.map((n) => (
              <TouchableOpacity key={n.id} style={styles.historyCard} activeOpacity={0.7} onPress={() => Haptics.selectionAsync()}>
                
                <View style={styles.cardHeader}>
                  <View style={styles.senderWrap}>
                    <View style={[styles.iconWrap, { backgroundColor: n.type === "admin" ? "#FEF2F2" : "#EFF6FF" }]}>
                      <Ionicons name={n.icon as any} size={16} color={n.type === "admin" ? "#EF4444" : "#3B82F6"} />
                    </View>
                    <Text style={[styles.senderText, { color: n.type === "admin" ? "#EF4444" : "#3B82F6" }]}>
                      {n.sender}
                    </Text>
                  </View>
                  <Text style={styles.timeText}>{formatDate(n.createdAt)}</Text>
                </View>

                <Text style={styles.titleText}>{n.title}</Text>
                <Text style={styles.messageText}>{n.message}</Text>

              </TouchableOpacity>
            ))
          )}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  
  scrollContent: { padding: 20 },
  
  historyContainer: { gap: 14 },
  historyCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  senderWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  senderText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  timeText: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#94A3B8" },
  
  titleText: { fontSize: 16, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 6 },
  messageText: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "#475569", lineHeight: 22 },
});
