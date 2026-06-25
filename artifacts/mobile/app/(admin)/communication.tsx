import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Platform, ActivityIndicator, KeyboardAvoidingView
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";
import { turso } from "../../lib/turso";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import { sendRemotePushNotification } from "../../lib/notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const BASE_TARGETS = ["All", "Students", "Teachers"];
const TARGET_ICONS: Record<string, string> = { All: "globe", Students: "school", Teachers: "person-circle" };

export default function CommunicationHub() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const router = useRouter();

  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [dynamicTargets, setDynamicTargets] = useState<string[]>(BASE_TARGETS);
  
  // Form State
  const [tab, setTab] = useState("send");
  const [newTitle, setNewTitle] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [newTarget, setNewTarget] = useState("All");
  const [posting, setPosting] = useState(false);

  const fetchAnnouncements = async () => {
    try {
      setLoadingList(true);
      await turso.execute(`
        CREATE TABLE IF NOT EXISTS announcements (
          id TEXT PRIMARY KEY,
          title TEXT,
          message TEXT,
          target TEXT,
          createdAt TEXT,
          author TEXT
        )
      `);
      const result = await turso.execute("SELECT * FROM announcements ORDER BY createdAt DESC");
      const data = result.rows.map(r => ({
        id: r[0], title: r[1], message: r[2], target: r[3], createdAt: r[4], author: r[5]
      }));
      setAnnouncements(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await turso.execute("SELECT name FROM classes");
      const classNames = res.rows.map(r => r[0] as string);
      setDynamicTargets([...BASE_TARGETS, ...classNames]);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
    fetchClasses();
    const requestPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };
    requestPermissions();
  }, []);

  const handleBroadcast = async () => {
    if (!newTitle.trim() || !newMessage.trim()) return;
    setPosting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const id = Date.now().toString();
      await turso.execute({
        sql: "INSERT INTO announcements (id, title, message, target, createdAt, author) VALUES (?, ?, ?, ?, ?, ?)",
        args: [id, newTitle.trim(), newMessage.trim(), newTarget, new Date().toISOString(), "Admin"]
      });
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Broadcast sent successfully!");

      setNewTitle("");
      setNewMessage("");
      setNewTarget("All");
      setTab("history");
      
      await Notifications.scheduleNotificationAsync({
        content: {
          title: newTitle.trim(),
          body: newMessage.trim(),
          data: { target: newTarget },
        },
        trigger: null,
      });

      // Fetch tokens and send remote FCM push
      let sql = "SELECT pushToken FROM users WHERE pushToken IS NOT NULL";
      let args: string[] = [];
      if (newTarget === "Students") {
        sql += " AND role = 'student'";
      } else if (newTarget === "Teachers") {
        sql += " AND role = 'teacher'";
      } else if (newTarget !== "All") {
        sql += " AND batch = ?";
        args.push(newTarget);
      }
      
      const usersRes = await turso.execute({ sql, args });
      const tokens = usersRes.rows.map(r => r[0] as string);
      
      if (tokens.length > 0) {
        await sendRemotePushNotification(tokens, newTitle.trim(), newMessage.trim(), { target: newTarget });
      }

      fetchAnnouncements();
    } catch (e) {
      console.error(e);
      alert("Failed to send broadcast.");
    } finally {
      setPosting(false);
    }
  };

  const getTargetColor = (target: string) => {
    switch (target) {
      case "Students": return "#5B9BD5";
      case "Teachers": return "#48BB78";
      default: return "#0EA5E9";
    }
  };

  // ==========================
  // MAIN VIEW
  // ==========================
  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      
      {/* ── HEADER BANNER WITH TABS ── */}
      <Animated.View entering={FadeInDown.duration(600).springify()}>
        <LinearGradient
          colors={["#0EA5E9", "#0369A1"]}
          style={[styles.headerBanner, { paddingTop: topPad + 12 }]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.dec1} />
          <View style={styles.dec2} />
          
          {/* Back button Row */}
          <View style={styles.backRow}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.bannerTop}>
            <View>
              <Text style={styles.bannerLabel}>ADMIN PANEL</Text>
              <Text style={styles.bannerTitle}>Communication Hub</Text>
              <Text style={styles.bannerSub}>
                {tab === "send" ? "Send notices to students & teachers" : `${announcements.length} total broadcasts`}
              </Text>
            </View>
          </View>

          {/* Segmented Tab Switcher */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tabButton, tab === "send" && styles.tabButtonActive]}
              onPress={() => { Haptics.selectionAsync(); setTab("send"); }}
              activeOpacity={0.8}
            >
              <Ionicons name="megaphone-outline" size={16} color={tab === "send" ? "#0EA5E9" : "#FFFFFF"} />
              <Text style={[styles.tabButtonText, tab === "send" && styles.tabButtonTextActive]}>Send Notice</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabButton, tab === "history" && styles.tabButtonActive]}
              onPress={() => { Haptics.selectionAsync(); setTab("history"); }}
              activeOpacity={0.8}
            >
              <Ionicons name="time-outline" size={16} color={tab === "history" ? "#0EA5E9" : "#FFFFFF"} />
              <Text style={[styles.tabButtonText, tab === "history" && styles.tabButtonTextActive]}>History</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.waveCut, { backgroundColor: colors.background }]} />
        </LinearGradient>
      </Animated.View>

      {/* ── CONTENT SWITCHER ── */}
      {tab === "send" ? (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={[styles.formCard, { backgroundColor: colors.card, shadowColor: colors.border }]}>
            
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Target Audience</Text>
              <View style={styles.targetRow}>
                {dynamicTargets.map(t => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setNewTarget(t)}
                    style={[styles.targetChip, { backgroundColor: newTarget === t ? "#0EA5E9" : colors.muted, borderColor: newTarget === t ? "#0EA5E9" : colors.border }]}
                  >
                    <Ionicons name={(TARGET_ICONS[t] || "grid") as any} size={16} color={newTarget === t ? "#FFFFFF" : colors.mutedForeground} />
                    <Text style={[styles.targetChipText, { color: newTarget === t ? "#FFFFFF" : colors.foreground }]}>{t}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Title</Text>
              <TextInput value={newTitle} onChangeText={setNewTitle} placeholder="e.g., Holiday Notice" placeholderTextColor={colors.mutedForeground} style={[styles.input, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: colors.foreground }]}>Message</Text>
              <TextInput value={newMessage} onChangeText={setNewMessage} placeholder="Type your message here..." placeholderTextColor={colors.mutedForeground} style={[styles.textArea, { backgroundColor: colors.background, borderColor: colors.border, color: colors.foreground }]} multiline numberOfLines={4} textAlignVertical="top" />
            </View>

            <TouchableOpacity onPress={handleBroadcast} disabled={!newTitle.trim() || !newMessage.trim() || posting} style={[styles.submitBtn, { backgroundColor: "#0EA5E9", opacity: (!newTitle.trim() || !newMessage.trim()) ? 0.5 : 1 }]}>
              {posting ? <ActivityIndicator color="#FFFFFF" size="small" /> : (
                <>
                  <Ionicons name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.submitText}>Send Broadcast</Text>
                </>
              )}
            </TouchableOpacity>

          </Animated.View>
        </ScrollView>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: 120 }]}>
          
          {/* Quick stats (Themed card) */}
          <Animated.View entering={ZoomIn.delay(100).springify()} style={[styles.statsRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {[
              { val: String(announcements.length), label: "Total", icon: "megaphone", color: "#3B82F6" },
              { val: String(announcements.filter(a => a.target === "All").length), label: "All", icon: "globe", color: "#10B981" },
              { val: String(announcements.filter(a => a.target === "Students").length), label: "Students", icon: "school", color: "#8B5CF6" },
              { val: String(announcements.filter(a => a.target === "Teachers").length), label: "Teachers", icon: "person-circle", color: "#F59E0B" },
            ].map((s, i) => (
              <React.Fragment key={s.label}>
                {i > 0 && <View style={[styles.statDiv, { backgroundColor: colors.border }]} />}
                <View style={styles.statItem}>
                  <Ionicons name={s.icon as any} size={16} color={s.color} />
                  <Text style={[styles.statVal, { color: colors.foreground }]}>{s.val}</Text>
                  <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
                </View>
              </React.Fragment>
            ))}
          </Animated.View>

          {loadingList ? (
            <ActivityIndicator color="#0EA5E9" style={{ marginTop: 40 }} />
          ) : announcements.length === 0 ? (
            <Animated.View entering={ZoomIn.duration(400).springify()} style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[styles.emptyIconWrap, { backgroundColor: "#0EA5E910" }]}>
                <Ionicons name="notifications-off-outline" size={40} color="#0EA5E9" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No Announcements Yet</Text>
              <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Push notices to your students and teachers using the Send Notice tab above.</Text>
            </Animated.View>
          ) : (
            announcements.map((a, index) => {
              const tColor = getTargetColor(a.target);
              return (
                <Animated.View key={a.id} entering={FadeInDown.delay(150 + index * 60).springify()}>
                  <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
                    <View style={[styles.cardStripe, { backgroundColor: tColor }]} />
                    <View style={styles.cardBody}>
                      <View style={styles.cardTop}>
                        <View style={[styles.iconBox, { backgroundColor: tColor + "12" }]}>
                          <Ionicons name={(TARGET_ICONS[a.target] || "megaphone") as any} size={22} color={tColor} />
                        </View>
                        <View style={styles.cardMid}>
                          <Text style={[styles.cardTitle, { color: colors.foreground }]}>{a.title}</Text>
                          <View style={styles.cardMetaRow}>
                            <View style={[styles.targetPill, { backgroundColor: tColor + "15" }]}>
                              <Text style={[styles.targetText, { color: tColor }]}>{a.target}</Text>
                            </View>
                            <Text style={[styles.cardTime, { color: colors.mutedForeground }]}>
                              {a.createdAt ? new Date(a.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }) : "Recently"}
                            </Text>
                          </View>
                        </View>
                      </View>
                      <Text style={[styles.cardDesc, { color: colors.mutedForeground }]}>{a.message}</Text>
                      <View style={styles.cardFooter}>
                        <View style={styles.authorRow}>
                          <Ionicons name="person-circle" size={14} color={colors.mutedForeground} />
                          <Text style={[styles.authorText, { color: colors.mutedForeground }]}>{a.author || "Admin"}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              );
            })
          )}
        </ScrollView>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  headerBanner: { paddingHorizontal: 20, paddingBottom: 36, position: "relative", overflow: "hidden" },
  dec1: { position: "absolute", width: 220, height: 220, borderRadius: 110, top: -60, right: -50, backgroundColor: "rgba(255,255,255,0.07)" },
  dec2: { position: "absolute", width: 140, height: 140, borderRadius: 70, bottom: 10, left: -40, backgroundColor: "rgba(255,255,255,0.05)" },
  
  backRow: { marginBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },

  bannerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, zIndex: 1 },
  bannerLabel: { color: "rgba(255,255,255,0.7)", fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 1.2, marginBottom: 4 },
  bannerTitle: { color: "#FFFFFF", fontSize: 24, fontFamily: "Poppins_700Bold" },
  bannerSub: { color: "rgba(255,255,255,0.75)", fontSize: 12, fontFamily: "Poppins_400Regular", marginTop: 2 },
  
  /* Segmented tabs switcher */
  tabContainer: { flexDirection: "row", backgroundColor: "rgba(255, 255, 255, 0.15)", borderRadius: 14, padding: 4, marginTop: 14, borderWidth: 1, borderColor: "rgba(255, 255, 255, 0.1)", zIndex: 5 },
  tabButton: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 10, borderRadius: 10 },
  tabButtonActive: { backgroundColor: "#FFFFFF" },
  tabButtonText: { color: "rgba(255, 255, 255, 0.8)", fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  tabButtonTextActive: { color: "#0EA5E9", fontFamily: "Poppins_700Bold" },

  waveCut: { position: "absolute", bottom: -1, left: 0, right: 0, height: 16, borderTopLeftRadius: 24, borderTopRightRadius: 24 },
  content: { padding: 20, gap: 14 },

  /* Cards */
  card: { borderRadius: 22, borderWidth: 1, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  cardStripe: { height: 4 },
  cardBody: { padding: 18, gap: 10 },
  cardTop: { flexDirection: "row", gap: 14 },
  iconBox: { width: 48, height: 48, borderRadius: 16, alignItems: "center", justifyContent: "center" },
  cardMid: { flex: 1, gap: 4 },
  cardTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  cardMetaRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  targetPill: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  targetText: { fontSize: 10, fontFamily: "Poppins_700Bold" },
  cardDesc: { fontSize: 14, fontFamily: "Poppins_400Regular", lineHeight: 21 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 2 },
  cardTime: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  authorRow: { flexDirection: "row", alignItems: "center", gap: 5 },
  authorText: { fontSize: 11, fontFamily: "Poppins_400Regular" },

  /* Empty */
  empty: { borderRadius: 24, borderWidth: 1, padding: 40, alignItems: "center", gap: 14, marginTop: 20 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center", lineHeight: 20 },

  /* Form View */
  formScroll: { padding: 20, paddingBottom: 100 },
  formCard: { borderRadius: 24, padding: 24, borderWidth: 1, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },
  fieldGroup: { gap: 8, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold", marginLeft: 2 },
  targetRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  targetChip: { flexDirection: "row", alignItems: "center", gap: 6, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 14, borderWidth: 1, marginBottom: 6 },
  targetChipText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  input: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: "Poppins_400Regular" },
  textArea: { borderWidth: 1, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, fontFamily: "Poppins_400Regular", minHeight: 120 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 18, paddingVertical: 16, marginTop: 8 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
  statsRow: { flexDirection: "row", borderRadius: 18, paddingVertical: 14, paddingHorizontal: 10, borderWidth: 1, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  statItem: { flex: 1, alignItems: "center", gap: 3 },
  statVal: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  statLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  statDiv: { width: 1, marginVertical: 4 },
});

