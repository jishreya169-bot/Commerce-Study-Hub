import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { SubjectChip } from "@/components/SubjectChip";
import { LiveCardSkeleton } from "@/components/Skeleton";
import * as Haptics from "expo-haptics";

const SUBJECTS = ["All", "Accountancy", "Business Studies", "Economics", "Mathematics"];

export default function LiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { liveClasses } = useApp();
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [tab, setTab] = useState<"live" | "recorded">("live");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const liveNow = liveClasses.filter(
    (l) => l.isLive && (selectedSubject === "All" || l.subject === selectedSubject)
  );
  const upcoming = liveClasses.filter(
    (l) => !l.isLive && !l.hasRecording && (selectedSubject === "All" || l.subject === selectedSubject)
  );
  const recordings = liveClasses.filter(
    (l) => l.hasRecording && (selectedSubject === "All" || l.subject === selectedSubject)
  );

  const activeList = tab === "live" ? [...liveNow, ...upcoming] : recordings;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Live Classes</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Class 11–12 Commerce</Text>
        </View>
        {!loading && liveNow.length > 0 && (
          <View style={[styles.livePill, { backgroundColor: "#FEE2E2" }]}>
            <View style={[styles.liveDot, { backgroundColor: colors.live }]} />
            <Text style={[styles.livePillText, { color: colors.live }]}>{liveNow.length} Live</Text>
          </View>
        )}
      </View>

      {/* Live / Recorded toggle */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["live", "recorded"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabItem, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2.5 }]}
          >
            <Ionicons
              name={t === "live" ? "radio" : "recording"}
              size={15}
              color={tab === t ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "live" ? `Live & Upcoming` : `Recordings (${recordings.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subject chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}>
        {SUBJECTS.map((s) => (
          <SubjectChip key={s} label={s} selected={selectedSubject === s} onPress={() => setSelectedSubject(s)} />
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {loading ? (
          [1, 2, 3].map((i) => <LiveCardSkeleton key={i} />)
        ) : tab === "live" ? (
          <>
            {/* Live Now */}
            {liveNow.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push(`/live-session/${cls.id}`);
                }}
                style={[styles.heroCard, { backgroundColor: cls.thumbnailColor }]}
                activeOpacity={0.9}
              >
                <View style={styles.heroTop}>
                  <View style={[styles.liveBadge, { backgroundColor: colors.live }]}>
                    <View style={styles.liveBadgeDot} />
                    <Text style={styles.liveBadgeText}>LIVE</Text>
                  </View>
                  {cls.viewers != null && (
                    <View style={[styles.viewersBadge, { backgroundColor: "rgba(0,0,0,0.2)" }]}>
                      <Ionicons name="eye" size={12} color="#FFFFFF" />
                      <Text style={styles.viewersText}>{cls.viewers.toLocaleString()}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.heroSubject}>{cls.subject}</Text>
                <Text style={styles.heroTopic}>{cls.topic}</Text>
                <View style={styles.heroMeta}>
                  <Ionicons name="person-circle" size={15} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroInstructor}>{cls.instructor}</Text>
                  <Text style={styles.heroDot}>•</Text>
                  <Text style={styles.heroDuration}>{cls.duration}</Text>
                </View>
                <View style={[styles.heroJoinBtn, { backgroundColor: "#FFFFFF" }]}>
                  <Ionicons name="play" size={16} color={cls.thumbnailColor} />
                  <Text style={[styles.heroJoinText, { color: cls.thumbnailColor }]}>Join Now</Text>
                </View>
              </TouchableOpacity>
            ))}
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <>
                <Text style={[styles.groupLabel, { color: colors.mutedForeground }]}>Upcoming</Text>
                {upcoming.map((cls) => (
                  <ScheduledCard key={cls.id} cls={cls} colors={colors} onPress={() => router.push(`/live/${cls.id}`)} />
                ))}
              </>
            )}
            {liveNow.length === 0 && upcoming.length === 0 && (
              <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <MaterialIcons name="live-tv" size={44} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No live classes</Text>
                <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Check recordings tab for past lectures</Text>
              </View>
            )}
          </>
        ) : (
          <>
            {recordings.length === 0 ? (
              <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="recording-outline" size={44} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No recordings yet</Text>
                <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Recordings appear here after live sessions end</Text>
              </View>
            ) : (
              recordings.map((cls) => (
                <RecordingCard
                  key={cls.id}
                  cls={cls}
                  colors={colors}
                  onPress={() => router.push(`/recorded/${cls.recordingId ?? cls.id}`)}
                />
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function ScheduledCard({ cls, colors, onPress }: { cls: any; colors: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[cardStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.85}>
      <View style={[cardStyles.icon, { backgroundColor: cls.thumbnailColor + "18" }]}>
        <Ionicons name="calendar" size={22} color={cls.thumbnailColor} />
      </View>
      <View style={cardStyles.info}>
        <Text style={[cardStyles.subject, { color: cls.thumbnailColor }]}>{cls.subject}</Text>
        <Text style={[cardStyles.topic, { color: colors.foreground }]} numberOfLines={2}>{cls.topic}</Text>
        <View style={cardStyles.meta}>
          <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
          <Text style={[cardStyles.metaText, { color: colors.mutedForeground }]}>{cls.scheduledAt}</Text>
          <Text style={[cardStyles.dot, { color: colors.border }]}>•</Text>
          <Text style={[cardStyles.metaText, { color: colors.mutedForeground }]}>{cls.duration}</Text>
        </View>
      </View>
      <TouchableOpacity style={[cardStyles.notifyBtn, { backgroundColor: colors.secondary }]}>
        <Ionicons name="notifications-outline" size={17} color={colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

function RecordingCard({ cls, colors, onPress }: { cls: any; colors: any; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={[cardStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.85}>
      <View style={[cardStyles.icon, { backgroundColor: cls.thumbnailColor + "18" }]}>
        <Ionicons name="recording" size={22} color={cls.thumbnailColor} />
      </View>
      <View style={cardStyles.info}>
        <Text style={[cardStyles.subject, { color: cls.thumbnailColor }]}>{cls.subject}</Text>
        <Text style={[cardStyles.topic, { color: colors.foreground }]} numberOfLines={2}>{cls.topic}</Text>
        <View style={cardStyles.meta}>
          <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
          <Text style={[cardStyles.metaText, { color: colors.mutedForeground }]}>{cls.duration}</Text>
          <Text style={[cardStyles.dot, { color: colors.border }]}>•</Text>
          <Ionicons name="calendar-outline" size={12} color={colors.mutedForeground} />
          <Text style={[cardStyles.metaText, { color: colors.mutedForeground }]}>{cls.scheduledAt}</Text>
        </View>
      </View>
      <View style={[cardStyles.playBtn, { backgroundColor: colors.primary }]}>
        <Ionicons name="play" size={15} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const cardStyles = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  icon: { width: 50, height: 50, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  info: { flex: 1, gap: 4 },
  subject: { fontSize: 10, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  topic: { fontSize: 13, fontFamily: "Poppins_600SemiBold", lineHeight: 18 },
  meta: { flexDirection: "row", alignItems: "center", gap: 5 },
  metaText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  dot: { fontSize: 11 },
  notifyBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  playBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  subtitle: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  livePill: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  livePillText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tabItem: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 12 },
  tabText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  chipRow: { maxHeight: 56, borderBottomWidth: 1 },
  content: { padding: 16, gap: 2 },
  heroCard: { borderRadius: 18, padding: 16, gap: 8, overflow: "hidden", marginBottom: 14 },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveBadgeDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  liveBadgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 1 },
  viewersBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  viewersText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_500Medium" },
  heroSubject: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  heroTopic: { color: "#FFFFFF", fontSize: 19, fontFamily: "Poppins_700Bold", lineHeight: 26 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroInstructor: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  heroDot: { color: "rgba(255,255,255,0.4)", fontSize: 12 },
  heroDuration: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  heroJoinBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 11, marginTop: 4 },
  heroJoinText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  groupLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  empty: { borderRadius: 16, borderWidth: 1, padding: 36, alignItems: "center", gap: 10, marginTop: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
});
