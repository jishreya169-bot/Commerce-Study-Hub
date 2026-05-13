import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { CourseCard } from "@/components/CourseCard";
import { LiveClassCard } from "@/components/LiveClassCard";
import { StatCard } from "@/components/StatCard";
import { CourseCardSkeleton, LiveCardSkeleton, StatCardSkeleton } from "@/components/Skeleton";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, courses, liveClasses, doubts, notes } = useApp();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const enrolled = courses.filter((c) => c.enrolled);
  const liveNow = liveClasses.find((l) => l.isLive);
  const upcoming = liveClasses.filter((l) => !l.isLive && !l.hasRecording).slice(0, 2);
  const recentRecordings = liveClasses.filter((l) => l.hasRecording).slice(0, 2);

  const avgProgress =
    enrolled.length > 0
      ? Math.round(
          enrolled.reduce((a, c) => a + (c.completedLectures / c.totalLectures) * 100, 0) /
            enrolled.length
        )
      : 0;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isWide = width >= 600;
  const openDoubts = doubts.filter((d) => !d.resolved).length;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome back 👋</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.streakPill, { backgroundColor: "#FEF3C7" }]} activeOpacity={0.8}>
            <Ionicons name="flame" size={14} color="#D69E2E" />
            <Text style={[styles.streakNum, { color: "#92400E" }]}>{user.streak} day</Text>
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}
      >
        {/* Stats */}
        <View style={[styles.statsRow, isWide && styles.statsRowWide]}>
          {loading ? (
            <><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></>
          ) : (
            <>
              <StatCard icon="book" value={enrolled.length} label="Courses" color={colors.primary} />
              <StatCard icon="trending-up" value={`${avgProgress}%`} label="Progress" color={colors.success} />
              <StatCard icon="trophy" value={`#${user.rank}`} label="Rank" color={colors.warning} />
            </>
          )}
        </View>

        {/* Quick Actions */}
        {!loading && (
          <View style={styles.quickActions}>
            <TouchableOpacity
              onPress={() => router.push("/doubts")}
              style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.primary + "18" }]}>
                <Ionicons name="help-circle" size={20} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Doubts</Text>
              {openDoubts > 0 && (
                <View style={[styles.quickBadge, { backgroundColor: colors.primary }]}>
                  <Text style={styles.quickBadgeText}>{openDoubts}</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/notes")}
              style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.success + "18" }]}>
                <Ionicons name="document-text" size={20} color={colors.success} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Notes</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>{notes.length}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/live")}
              style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.live + "18" }]}>
                <Ionicons name="videocam" size={20} color={colors.live} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Live</Text>
              {liveNow && (
                <View style={[styles.quickBadge, { backgroundColor: colors.live }]}>
                  <Text style={styles.quickBadgeText}>1</Text>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/tests")}
              style={[styles.quickBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <View style={[styles.quickIcon, { backgroundColor: colors.warning + "18" }]}>
                <Ionicons name="clipboard" size={20} color={colors.warning} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Tests</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Live Banner */}
        {!loading && liveNow && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/live-session/${liveNow.id}`);
            }}
            style={[styles.liveBanner, { backgroundColor: colors.live }]}
            activeOpacity={0.9}
          >
            <View style={styles.liveBannerLeft}>
              <View style={styles.liveDot} />
              <Text style={styles.liveBannerTag}>LIVE NOW</Text>
            </View>
            <View style={styles.liveBannerMid}>
              <Text style={styles.liveBannerSubject}>{liveNow.subject}</Text>
              <Text style={styles.liveBannerTopic} numberOfLines={1}>{liveNow.topic}</Text>
            </View>
            <View style={[styles.joinChip, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name="play" size={13} color="#FFFFFF" />
              <Text style={styles.joinChipText}>Join</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Continue Learning */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Continue Learning</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/courses")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <><CourseCardSkeleton /><CourseCardSkeleton /></>
          ) : enrolled.length === 0 ? (
            <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Ionicons name="book-outline" size={32} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No enrolled courses yet</Text>
            </View>
          ) : (
            enrolled.slice(0, 2).map((c) => (
              <CourseCard key={c.id} course={c} compact onPress={() => router.push(`/course/${c.id}`)} />
            ))
          )}
        </View>

        {/* Recent Recordings */}
        {!loading && recentRecordings.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Recent Recordings</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/live")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            {recentRecordings.map((l) => (
              <TouchableOpacity
                key={l.id}
                onPress={() => router.push(`/recorded/${l.recordingId ?? l.id}`)}
                style={[styles.recordingRow, { backgroundColor: colors.card, borderColor: colors.border }]}
                activeOpacity={0.85}
              >
                <View style={[styles.recordingIcon, { backgroundColor: l.thumbnailColor + "20" }]}>
                  <Ionicons name="recording" size={20} color={l.thumbnailColor} />
                </View>
                <View style={styles.recordingInfo}>
                  <Text style={[styles.recordingSub, { color: l.thumbnailColor }]}>{l.subject}</Text>
                  <Text style={[styles.recordingTopic, { color: colors.foreground }]} numberOfLines={1}>{l.topic}</Text>
                  <Text style={[styles.recordingMeta, { color: colors.mutedForeground }]}>{l.scheduledAt} • {l.duration}</Text>
                </View>
                <Ionicons name="play-circle" size={28} color={colors.primary} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Live</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/live")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <><LiveCardSkeleton /><LiveCardSkeleton /></>
          ) : (
            upcoming.map((l) => (
              <LiveClassCard key={l.id} liveClass={l} onPress={() => router.push(`/live/${l.id}`)} />
            ))
          )}
        </View>

        {/* Points strip */}
        {!loading && (
          <View style={[styles.pointsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.pointsIcon, { backgroundColor: colors.warning + "18" }]}>
              <Ionicons name="star" size={20} color={colors.warning} />
            </View>
            <View style={styles.pointsInfo}>
              <Text style={[styles.pointsVal, { color: colors.foreground }]}>
                {user.totalPoints.toLocaleString()} pts
              </Text>
              <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>
                Keep learning to earn more!
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={17} color={colors.border} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 14, borderBottomWidth: 1 },
  headerLeft: { gap: 1 },
  greeting: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  name: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  streakPill: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  streakNum: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  avatar: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold" },
  scroll: { padding: 20, gap: 6 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  statsRowWide: { gap: 14 },
  quickActions: { flexDirection: "row", gap: 10, marginBottom: 16 },
  quickBtn: { flex: 1, alignItems: "center", borderRadius: 14, borderWidth: 1, paddingVertical: 12, paddingHorizontal: 4, gap: 5, position: "relative" },
  quickIcon: { width: 38, height: 38, borderRadius: 11, justifyContent: "center", alignItems: "center" },
  quickLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", textAlign: "center" },
  quickSub: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  quickBadge: { position: "absolute", top: 6, right: 6, width: 18, height: 18, borderRadius: 9, justifyContent: "center", alignItems: "center" },
  quickBadgeText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Poppins_700Bold" },
  liveBanner: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 14, gap: 10, marginBottom: 20 },
  liveBannerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  liveBannerTag: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 0.8 },
  liveBannerMid: { flex: 1 },
  liveBannerSubject: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "Poppins_500Medium" },
  liveBannerTopic: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  joinChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  joinChipText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  section: { marginBottom: 20 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  seeAll: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  recordingRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  recordingIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  recordingInfo: { flex: 1 },
  recordingSub: { fontSize: 10, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4 },
  recordingTopic: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  recordingMeta: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  emptyBox: { borderRadius: 14, borderWidth: 1, padding: 24, alignItems: "center", gap: 8 },
  emptyText: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  pointsCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, gap: 12, marginTop: 4 },
  pointsIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  pointsInfo: { flex: 1 },
  pointsVal: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  pointsLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
});
