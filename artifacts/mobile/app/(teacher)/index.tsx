import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform, useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { StatCardSkeleton } from "@/components/Skeleton";
import * as Haptics from "expo-haptics";

const SCHEDULE = [
  { id: "s1", subject: "Accountancy", topic: "Trial Balance — Chapter 4", time: "10:00 AM", duration: "60 min", students: 42, color: "#5B9BD5", isLive: true },
  { id: "s2", subject: "Economics", topic: "National Income Concepts", time: "12:30 PM", duration: "45 min", students: 38, color: "#5BAD9B", isLive: false },
  { id: "s3", subject: "Accountancy", topic: "Depreciation Methods", time: "3:00 PM", duration: "60 min", students: 42, color: "#5B9BD5", isLive: false },
];

const PENDING_DOUBTS = [
  { id: "d1", student: "Priya S.", subject: "Accountancy", question: "What is the difference between straight-line and written-down value method?", time: "20 min ago", urgent: true },
  { id: "d2", student: "Rahul M.", subject: "Economics", question: "How is GDP different from GNP? Please explain with examples.", time: "1 hr ago", urgent: false },
  { id: "d3", student: "Ananya K.", subject: "Accountancy", question: "Why do we prepare Trading Account separately?", time: "2 hr ago", urgent: false },
];

const ACTIVITY = [
  { id: "a1", label: "Priya Sharma completed Trial Balance lecture", time: "5 min ago", icon: "checkmark-circle", color: "#48BB78" },
  { id: "a2", label: "Rahul Mehta scored 90% in Economics Test 3", time: "30 min ago", icon: "trophy", color: "#D69E2E" },
  { id: "a3", label: "Ananya Kapoor posted a new doubt", time: "45 min ago", icon: "help-circle", color: "#5B9BD5" },
  { id: "a4", label: "Vikram Singh joined live Accountancy class", time: "1 hr ago", icon: "radio", color: "#E53E3E" },
];

export default function TeacherHome() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── HEADER ── */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: "#48BB78", overflow: "hidden" }]}>
        <View style={[styles.decCircle1, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
        <View style={[styles.decCircle2, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        <View style={styles.headerTop}>
          <View style={styles.headerLeft}>
            <View style={[styles.greetPill, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name="sunny" size={11} color="rgba(255,255,255,0.9)" />
              <Text style={styles.greetPillText}>{greeting}</Text>
            </View>
            <Text style={styles.headerName}>{user?.name ?? "Professor"}</Text>
            <Text style={styles.headerSub}>{user?.subject}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(teacher)/profile")} activeOpacity={0.85}>
            <View style={[styles.avatarRing, { borderColor: "rgba(255,255,255,0.4)" }]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.avatar ?? "T"}</Text>
              </View>
            </View>
          </TouchableOpacity>
        </View>

        {/* Stats strip */}
        <View style={[styles.statsStrip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          {[
            { icon: "people", val: "45", label: "Students" },
            { icon: "book", val: "3", label: "Courses" },
            { icon: "help-circle", val: "8", label: "Doubts" },
            { icon: "star", val: "4.9", label: "Rating" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.stripStat}>
                <Ionicons name={s.icon as any} size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.stripVal}>{s.val}</Text>
                <Text style={styles.stripLabel}>{s.label}</Text>
              </View>
              {i < 3 && <View style={[styles.stripDiv, { backgroundColor: "rgba(255,255,255,0.2)" }]} />}
            </React.Fragment>
          ))}
        </View>

        {/* Wave bottom */}
        <View style={[styles.waveCut, { backgroundColor: colors.background }]} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>

        {/* Quick action chips */}
        <View style={styles.quickChips}>
          {[
            { label: "Live Now", icon: "radio", color: "#E53E3E", route: "/(teacher)/live" },
            { label: "Doubts", icon: "help-circle", color: "#48BB78", route: "/(teacher)/doubts" },
            { label: "Courses", icon: "book", color: "#5B9BD5", route: "/(teacher)/classes" },
            { label: "Students", icon: "people", color: "#9B7BC4", route: "/(teacher)/students" },
          ].map((q) => (
            <TouchableOpacity
              key={q.label}
              onPress={() => { Haptics.selectionAsync(); router.push(q.route as any); }}
              style={[styles.quickChip, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.82}
            >
              <View style={[styles.quickChipIcon, { backgroundColor: q.color + "18" }]}>
                <Ionicons name={q.icon as any} size={18} color={q.color} />
              </View>
              <Text style={[styles.quickChipLabel, { color: colors.foreground }]}>{q.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIconWrap, { backgroundColor: "#5B9BD518" }]}>
              <Ionicons name="calendar" size={14} color="#5B9BD5" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Schedule</Text>
            <View style={[styles.sectionBadge, { backgroundColor: "#48BB7818" }]}>
              <Text style={[styles.sectionBadgeText, { color: "#48BB78" }]}>3 classes</Text>
            </View>
          </View>
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            SCHEDULE.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={[styles.classCard, { backgroundColor: colors.card, borderColor: cls.isLive ? cls.color + "40" : colors.border }]}
                activeOpacity={0.85}
                onPress={() => { Haptics.selectionAsync(); router.push("/(teacher)/live" as any); }}
              >
                {cls.isLive && <View style={[styles.liveStripe, { backgroundColor: "#E53E3E" }]} />}
                <View style={[styles.classIconWrap, { backgroundColor: cls.color + "18" }]}>
                  <Ionicons name={cls.isLive ? "radio" : "book-outline"} size={18} color={cls.isLive ? "#E53E3E" : cls.color} />
                </View>
                <View style={styles.classInfo}>
                  <View style={styles.classTimeRow}>
                    {cls.isLive && (
                      <View style={[styles.liveChip, { backgroundColor: "#E53E3E" }]}>
                        <View style={styles.liveDot} />
                        <Text style={styles.liveChipText}>LIVE</Text>
                      </View>
                    )}
                    {!cls.isLive && <Text style={[styles.classTimeText, { color: colors.mutedForeground }]}>{cls.time}</Text>}
                    <Text style={[styles.classSubject, { color: cls.color }]}>{cls.subject}</Text>
                  </View>
                  <Text style={[styles.classTopic, { color: colors.foreground }]}>{cls.topic}</Text>
                  <View style={styles.classMeta}>
                    <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.classMetaText, { color: colors.mutedForeground }]}>{cls.duration}</Text>
                    <Text style={[styles.classDot, { color: colors.mutedForeground }]}>•</Text>
                    <Ionicons name="people-outline" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.classMetaText, { color: colors.mutedForeground }]}>{cls.students} students</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.startBtn, { backgroundColor: cls.isLive ? "#E53E3E" : "#48BB78" }]}
                  activeOpacity={0.85}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push("/(teacher)/live" as any); }}
                >
                  <Ionicons name={cls.isLive ? "radio" : "play"} size={13} color="#FFFFFF" />
                  <Text style={styles.startBtnText}>{cls.isLive ? "Join" : "Start"}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Pending Doubts */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIconWrap, { backgroundColor: "#E53E3E18" }]}>
              <Ionicons name="help-circle" size={14} color="#E53E3E" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pending Doubts</Text>
            <TouchableOpacity onPress={() => router.push("/(teacher)/doubts")}>
              <Text style={[styles.seeAll, { color: "#48BB78" }]}>See all (8) →</Text>
            </TouchableOpacity>
          </View>
          {loading ? <StatCardSkeleton /> : (
            PENDING_DOUBTS.map((d) => (
              <TouchableOpacity
                key={d.id}
                style={[styles.doubtCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: d.urgent ? "#E53E3E" : colors.border, borderLeftWidth: d.urgent ? 4 : 1 }]}
                activeOpacity={0.85}
                onPress={() => router.push("/(teacher)/doubts")}
              >
                <View style={[styles.doubtAvatar, { backgroundColor: "#48BB7818" }]}>
                  <Ionicons name="person" size={15} color="#48BB78" />
                </View>
                <View style={styles.doubtInfo}>
                  <View style={styles.doubtRow}>
                    <Text style={[styles.doubtStudent, { color: colors.foreground }]}>{d.student}</Text>
                    {d.urgent && <View style={[styles.urgentPill, { backgroundColor: "#E53E3E18" }]}><Text style={[styles.urgentText, { color: "#E53E3E" }]}>Urgent</Text></View>}
                    <Text style={[styles.doubtSubject, { color: "#48BB78" }]}>{d.subject}</Text>
                  </View>
                  <Text style={[styles.doubtQ, { color: colors.mutedForeground }]} numberOfLines={1}>{d.question}</Text>
                  <Text style={[styles.doubtTime, { color: colors.mutedForeground }]}>{d.time}</Text>
                </View>
                <View style={[styles.answerBtn, { backgroundColor: "#48BB7818" }]}>
                  <Text style={[styles.answerBtnText, { color: "#48BB78" }]}>Answer</Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <View style={[styles.sectionIconWrap, { backgroundColor: "#9B7BC418" }]}>
              <Ionicons name="pulse" size={14} color="#9B7BC4" />
            </View>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
          </View>
          <View style={[styles.activityCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            {ACTIVITY.map((a, i) => (
              <View key={a.id} style={[styles.activityRow, { borderBottomColor: i === ACTIVITY.length - 1 ? "transparent" : colors.border }]}>
                <View style={[styles.activityIcon, { backgroundColor: a.color + "18" }]}>
                  <Ionicons name={a.icon as any} size={14} color={a.color} />
                </View>
                <View style={styles.activityInfo}>
                  <Text style={[styles.activityLabel, { color: colors.foreground }]}>{a.label}</Text>
                  <Text style={[styles.activityTime, { color: colors.mutedForeground }]}>{a.time}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 16, paddingBottom: 32, position: "relative" },
  decCircle1: { position: "absolute", width: 230, height: 230, borderRadius: 115, top: -50, right: -50 },
  decCircle2: { position: "absolute", width: 130, height: 130, borderRadius: 65, bottom: 0, left: -30 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, zIndex: 1 },
  headerLeft: { gap: 2 },
  greetPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, alignSelf: "flex-start", marginBottom: 4 },
  greetPillText: { color: "rgba(255,255,255,0.9)", fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  headerName: { color: "#FFFFFF", fontSize: 21, fontFamily: "Poppins_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  avatarRing: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, justifyContent: "center", alignItems: "center" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  statsStrip: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 12, zIndex: 1 },
  stripStat: { flex: 1, alignItems: "center", gap: 2 },
  stripVal: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  stripLabel: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontFamily: "Poppins_400Regular" },
  stripDiv: { width: 1, height: 28 },
  waveCut: { position: "absolute", bottom: 0, left: 0, right: 0, height: 16, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  scroll: { paddingHorizontal: 16, paddingTop: 16, gap: 0 },
  quickChips: { flexDirection: "row", gap: 8, marginBottom: 18 },
  quickChip: { flex: 1, alignItems: "center", borderRadius: 14, borderWidth: 1, paddingVertical: 12, gap: 6 },
  quickChipIcon: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  quickChipLabel: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  section: { marginBottom: 20 },
  sectionHead: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 12 },
  sectionIconWrap: { width: 26, height: 26, borderRadius: 7, justifyContent: "center", alignItems: "center" },
  sectionTitle: { flex: 1, fontSize: 16, fontFamily: "Poppins_700Bold" },
  sectionBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  sectionBadgeText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  seeAll: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  classCard: { flexDirection: "row", alignItems: "center", borderRadius: 16, borderWidth: 1, padding: 12, marginBottom: 10, gap: 10, overflow: "hidden" },
  liveStripe: { position: "absolute", left: 0, top: 0, bottom: 0, width: 3 },
  classIconWrap: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  classInfo: { flex: 1, gap: 3 },
  classTimeRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  liveDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#FFFFFF" },
  liveChipText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 0.5 },
  classTimeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  classSubject: { fontSize: 10, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4 },
  classTopic: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  classMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  classMetaText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  classDot: { fontSize: 10 },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexShrink: 0 },
  startBtnText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold" },
  doubtCard: { flexDirection: "row", alignItems: "flex-start", borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 8, gap: 10 },
  doubtAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  doubtInfo: { flex: 1, gap: 3 },
  doubtRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  doubtStudent: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  urgentPill: { paddingHorizontal: 6, paddingVertical: 1, borderRadius: 6 },
  urgentText: { fontSize: 9, fontFamily: "Poppins_700Bold" },
  doubtSubject: { fontSize: 10, fontFamily: "Poppins_500Medium" },
  doubtQ: { fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 17 },
  doubtTime: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  answerBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, flexShrink: 0, alignSelf: "flex-start" },
  answerBtnText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  activityCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1 },
  activityIcon: { width: 32, height: 32, borderRadius: 9, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  activityInfo: { flex: 1, gap: 2 },
  activityLabel: { fontSize: 12, fontFamily: "Poppins_500Medium", lineHeight: 17 },
  activityTime: { fontSize: 10, fontFamily: "Poppins_400Regular" },
});
