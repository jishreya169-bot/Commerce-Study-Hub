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
import { HeaderDecoBackground, DecoBlob, DotGrid, WaveDivider } from "@/components/svg/DecorativeShapes";
import { SubjectIcon } from "@/components/svg/SubjectIcon";
import { SmallProgressRing } from "@/components/svg/ProgressRing";

const SCHEDULE = [
  { id: "s1", subject: "Accountancy", topic: "Trial Balance — Chapter 4", time: "10:00 AM", duration: "60 min", students: 42, color: "#5B9BD5", isLive: true },
  { id: "s2", subject: "Economics", topic: "National Income Concepts", time: "12:30 PM", duration: "45 min", students: 38, color: "#5BAD9B", isLive: false },
  { id: "s3", subject: "Accountancy", topic: "Depreciation Methods", time: "3:00 PM", duration: "60 min", students: 42, color: "#5B9BD5", isLive: false },
];

const PENDING_DOUBTS = [
  { id: "d1", student: "Priya S.", subject: "Accountancy", question: "What is the difference between straight-line and written-down value method?", time: "20 min ago" },
  { id: "d2", student: "Rahul M.", subject: "Economics", question: "How is GDP different from GNP? Please explain with examples.", time: "1 hr ago" },
  { id: "d3", student: "Ananya K.", subject: "Accountancy", question: "Why do we prepare Trading Account separately?", time: "2 hr ago" },
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
  const { user, logout } = useAuth();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => { const t = setTimeout(() => setLoading(false), 900); return () => clearTimeout(t); }, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, paddingBottom: 24, overflow: "hidden" }]}>
        <HeaderDecoBackground color="#48BB78" width={width} height={topPad + 130} />
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerGreet}>Good morning 👋</Text>
            <Text style={styles.headerName}>{user?.name ?? "Professor"}</Text>
            <Text style={styles.headerSub}>{user?.subject}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push("/(teacher)/profile")} activeOpacity={0.85}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.avatar ?? "T"}</Text>
            </View>
          </TouchableOpacity>
        </View>
        {/* Stats strip */}
        <View style={styles.headerStats}>
          {[
            { icon: "people", val: "45", label: "Students" },
            { icon: "book", val: "3", label: "Courses" },
            { icon: "help-circle", val: "8", label: "Doubts" },
            { icon: "star", val: "4.9", label: "Rating" },
          ].map((s) => (
            <View key={s.label} style={styles.hStat}>
              <Ionicons name={s.icon as any} size={13} color="rgba(255,255,255,0.8)" />
              <Text style={styles.hStatVal}>{s.val}</Text>
              <Text style={styles.hStatLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        <WaveDivider color={colors.background} height={28} style={{ position: "absolute", bottom: 0, left: 0 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {/* Today's Schedule */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Schedule</Text>
            <Text style={[styles.seeAll, { color: "#48BB78" }]}>3 classes</Text>
          </View>
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            SCHEDULE.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: cls.color, borderLeftWidth: 4 }]}
                activeOpacity={0.85}
                onPress={() => Haptics.selectionAsync()}
              >
                <View style={styles.classCardLeft}>
                  <View style={styles.classTime}>
                    {cls.isLive && <View style={[styles.liveDot, { backgroundColor: "#E53E3E" }]} />}
                    <Text style={[styles.classTimeText, { color: cls.isLive ? "#E53E3E" : colors.mutedForeground }]}>
                      {cls.isLive ? "LIVE NOW" : cls.time}
                    </Text>
                  </View>
                  <Text style={[styles.classTopic, { color: colors.foreground }]}>{cls.topic}</Text>
                  <Text style={[styles.classSubject, { color: cls.color }]}>{cls.subject}</Text>
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
                  onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)}
                >
                  <Ionicons name={cls.isLive ? "radio" : "play"} size={14} color="#FFFFFF" />
                  <Text style={styles.startBtnText}>{cls.isLive ? "Join" : "Start"}</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Pending Doubts */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Pending Doubts</Text>
            <TouchableOpacity onPress={() => router.push("/(teacher)/doubts")}>
              <Text style={[styles.seeAll, { color: "#48BB78" }]}>See all (8)</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <><StatCardSkeleton /></>
          ) : (
            PENDING_DOUBTS.map((d) => (
              <View key={d.id} style={[styles.doubtCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={[styles.doubtAvatar, { backgroundColor: "#48BB7818" }]}>
                  <Ionicons name="person" size={16} color="#48BB78" />
                </View>
                <View style={styles.doubtInfo}>
                  <View style={styles.doubtHeader}>
                    <Text style={[styles.doubtStudent, { color: colors.foreground }]}>{d.student}</Text>
                    <Text style={[styles.doubtSubject, { color: colors.primary }]}>{d.subject}</Text>
                  </View>
                  <Text style={[styles.doubtQ, { color: colors.mutedForeground }]} numberOfLines={2}>{d.question}</Text>
                  <Text style={[styles.doubtTime, { color: colors.mutedForeground }]}>{d.time}</Text>
                </View>
                <TouchableOpacity
                  style={[styles.answerBtn, { backgroundColor: "#48BB7818", borderColor: "#48BB7830" }]}
                  activeOpacity={0.8}
                  onPress={() => router.push("/(teacher)/doubts")}
                >
                  <Text style={[styles.answerBtnText, { color: "#48BB78" }]}>Answer</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Activity</Text>
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
  header: { paddingHorizontal: 16, backgroundColor: "#48BB78" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  headerGreet: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  headerName: { color: "#FFFFFF", fontSize: 20, fontFamily: "Poppins_700Bold" },
  headerSub: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  headerStats: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 12 },
  hStat: { alignItems: "center", gap: 2 },
  hStatVal: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  hStatLabel: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontFamily: "Poppins_400Regular" },
  scroll: { padding: 16, gap: 0 },
  section: { marginBottom: 18 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  seeAll: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  classCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 12 },
  classCardLeft: { flex: 1, gap: 4 },
  classTime: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveDot: { width: 6, height: 6, borderRadius: 3 },
  classTimeText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  classTopic: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  classSubject: { fontSize: 10, fontFamily: "Poppins_500Medium", textTransform: "uppercase", letterSpacing: 0.4 },
  classMeta: { flexDirection: "row", alignItems: "center", gap: 4 },
  classMetaText: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  classDot: { fontSize: 11 },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  startBtnText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold" },
  doubtCard: { flexDirection: "row", alignItems: "flex-start", borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10, gap: 10 },
  doubtAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  doubtInfo: { flex: 1, gap: 3 },
  doubtHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  doubtStudent: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  doubtSubject: { fontSize: 10, fontFamily: "Poppins_500Medium" },
  doubtQ: { fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 17 },
  doubtTime: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  answerBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10, borderWidth: 1, flexShrink: 0, alignSelf: "flex-start" },
  answerBtnText: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  activityCard: { borderRadius: 14, borderWidth: 1, overflow: "hidden" },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 10, padding: 12, borderBottomWidth: 1 },
  activityIcon: { width: 32, height: 32, borderRadius: 8, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  activityInfo: { flex: 1, gap: 2 },
  activityLabel: { fontSize: 12, fontFamily: "Poppins_500Medium", lineHeight: 17 },
  activityTime: { fontSize: 10, fontFamily: "Poppins_400Regular" },
});
