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
import { DrawerMenu } from "@/components/DrawerMenu";
import * as Haptics from "expo-haptics";
import { ProgressRing } from "@/components/svg/ProgressRing";
import { HeaderDecoBackground, DotGrid, DecoBlob, WaveDivider } from "@/components/svg/DecorativeShapes";
import { SubjectIcon } from "@/components/svg/SubjectIcon";

const MOTIVATIONAL = [
  "Success is the sum of small efforts, repeated day in and day out.",
  "Education is the most powerful weapon you can use to change the world.",
  "The secret of getting ahead is getting started.",
  "Dream big, study hard, stay focused.",
  "Every expert was once a beginner. Keep going!",
];

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, courses, liveClasses, doubts, notes, tests } = useApp();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [quote] = useState(() => MOTIVATIONAL[Math.floor(Math.random() * MOTIVATIONAL.length)]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(t);
  }, []);

  const enrolled = courses.filter((c) => c.enrolled);
  const liveNow = liveClasses.find((l) => l.isLive);
  const upcoming = liveClasses.filter((l) => !l.isLive && !l.hasRecording).slice(0, 2);
  const recentRecordings = liveClasses.filter((l) => l.hasRecording).slice(0, 2);
  const openDoubts = doubts.filter((d) => !d.resolved).length;
  const pendingTests = tests.filter((t) => !t.attempted).length;

  const avgProgress =
    enrolled.length > 0
      ? Math.round(enrolled.reduce((a, c) => a + (c.completedLectures / c.totalLectures) * 100, 0) / enrolled.length)
      : 0;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isWide = width >= 600;

  const openDrawer = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDrawerOpen(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={openDrawer} style={[styles.hamburger, { backgroundColor: colors.muted }]} activeOpacity={0.7}>
          <Ionicons name="menu" size={22} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome back 👋</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={[styles.streakPill, { backgroundColor: "#FEF3C7" }]} activeOpacity={0.8}>
            <Ionicons name="flame" size={14} color="#D69E2E" />
            <Text style={[styles.streakNum, { color: "#92400E" }]}>{user.streak}d</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} activeOpacity={0.85}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
              <Text style={styles.avatarText}>{user.avatar}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}
      >
        {/* Motivational Quote Banner */}
        {!loading && (
          <View style={[styles.quoteBanner, { backgroundColor: colors.primary, shadowColor: colors.primary }]}>
            <Ionicons name="bulb" size={18} color="rgba(255,255,255,0.75)" style={{ marginTop: 2 }} />
            <Text style={styles.quoteText} numberOfLines={2}>{quote}</Text>
          </View>
        )}

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

        {/* Progress Ring Row */}
        {!loading && enrolled.length > 0 && (
          <View style={[styles.progressCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <DecoBlob color={colors.primary} size={120} opacity={0.07} style={styles.progressBlob} />
            <View style={styles.progressCardLeft}>
              <Text style={[styles.progressCardTitle, { color: colors.foreground }]}>Overall Progress</Text>
              <Text style={[styles.progressCardSub, { color: colors.mutedForeground }]}>
                Across {enrolled.length} enrolled {enrolled.length === 1 ? "course" : "courses"}
              </Text>
              <View style={[styles.progressBarBg, { backgroundColor: colors.muted }]}>
                <View style={[styles.progressBarFill, { backgroundColor: colors.primary, width: `${avgProgress}%` as any }]} />
              </View>
              <Text style={[styles.progressPct, { color: colors.primary }]}>{avgProgress}% complete</Text>
            </View>
            <View style={styles.progressCardRight}>
              <ProgressRing
                progress={avgProgress}
                size={82}
                strokeWidth={8}
                color={colors.primary}
                trackColor={colors.muted}
                fontSize={15}
              />
            </View>
          </View>
        )}

        {/* Quick Actions Grid */}
        {!loading && (
          <View style={styles.quickGrid}>
            <TouchableOpacity onPress={() => router.push("/(tabs)/courses")} style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.82}>
              <View style={[styles.quickIcon, { backgroundColor: colors.primary + "18" }]}>
                <Ionicons name="book" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Courses</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>{enrolled.length} enrolled</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(tabs)/live")} style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.82}>
              <View style={[styles.quickIcon, { backgroundColor: colors.live + "18" }]}>
                <Ionicons name="radio" size={22} color={colors.live} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Live</Text>
              {liveNow
                ? <View style={[styles.liveChip, { backgroundColor: colors.live }]}><Text style={styles.liveChipText}>LIVE</Text></View>
                : <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>+2 upcoming</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(tabs)/tests")} style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.82}>
              <View style={[styles.quickIcon, { backgroundColor: colors.warning + "18" }]}>
                <Ionicons name="clipboard" size={22} color={colors.warning} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Tests</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>{pendingTests} pending</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/doubts")} style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.82}>
              <View style={[styles.quickIcon, { backgroundColor: colors.primary + "18" }]}>
                <Ionicons name="help-circle" size={22} color={colors.primary} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Doubts</Text>
              {openDoubts > 0
                ? <View style={[styles.badgePill, { backgroundColor: colors.primary }]}><Text style={styles.badgePillText}>{openDoubts} open</Text></View>
                : <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>Forum</Text>
              }
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/notes")} style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.82}>
              <View style={[styles.quickIcon, { backgroundColor: colors.success + "18" }]}>
                <Ionicons name="document-text" size={22} color={colors.success} />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Notes</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>{notes.length} saved</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push("/(tabs)/profile")} style={[styles.quickCard, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.82}>
              <View style={[styles.quickIcon, { backgroundColor: "#9B7BC418" }]}>
                <Ionicons name="person-circle" size={22} color="#9B7BC4" />
              </View>
              <Text style={[styles.quickLabel, { color: colors.foreground }]}>Profile</Text>
              <Text style={[styles.quickSub, { color: colors.mutedForeground }]}>#{user.rank} rank</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Live Banner */}
        {!loading && liveNow && (
          <TouchableOpacity
            onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); router.push(`/live-session/${liveNow.id}`); }}
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
            <View style={[styles.joinChip, { backgroundColor: "rgba(255,255,255,0.22)" }]}>
              <Ionicons name="play" size={12} color="#FFFFFF" />
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
            <TouchableOpacity
              onPress={() => router.push("/(tabs)/courses")}
              style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}
              activeOpacity={0.8}
            >
              <Ionicons name="book-outline" size={32} color={colors.border} />
              <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No enrolled courses yet</Text>
              <View style={[styles.browseBtn, { backgroundColor: colors.primary }]}>
                <Text style={styles.browseBtnText}>Browse Courses</Text>
              </View>
            </TouchableOpacity>
          ) : (
            enrolled.map((c) => (
              <CourseCard key={c.id} course={c} compact onPress={() => router.push(`/course/${c.id}`)} />
            ))
          )}
        </View>

        {/* Explore Courses (horizontal scroll) */}
        {!loading && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Explore Courses</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/courses")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={{ paddingLeft: 0, paddingRight: 8 }}>
              {courses.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => router.push(`/course/${c.id}`)}
                  style={[styles.featCard, { backgroundColor: c.thumbnailColor, width: isWide ? 220 : 175 }]}
                  activeOpacity={0.85}
                >
                  <View style={[styles.featEnrolled, { backgroundColor: c.enrolled ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.18)" }]}>
                    <Text style={styles.featEnrolledText}>{c.enrolled ? "✓ Enrolled" : "Explore"}</Text>
                  </View>
                  <Ionicons name="book" size={32} color="rgba(255,255,255,0.18)" style={styles.featBgIcon} />
                  <Text style={styles.featSubject}>{c.subject}</Text>
                  <Text style={styles.featTitle} numberOfLines={2}>{c.title}</Text>
                  <View style={styles.featMeta}>
                    <Ionicons name="star" size={11} color="#FBBF24" />
                    <Text style={styles.featRating}>{c.rating}</Text>
                    <Text style={styles.featDot}>•</Text>
                    <Text style={styles.featLectures}>{c.totalLectures} lectures</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Recordings */}
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
                <View style={[styles.playBtn, { backgroundColor: colors.primary }]}>
                  <Ionicons name="play" size={14} color="#FFFFFF" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming Live */}
        {!loading && upcoming.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Live</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/live")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
              </TouchableOpacity>
            </View>
            {upcoming.map((l) => (
              <LiveClassCard key={l.id} liveClass={l} onPress={() => router.push(`/live/${l.id}`)} />
            ))}
          </View>
        )}

        {/* Points card */}
        {!loading && (
          <View style={[styles.pointsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.pointsIcon, { backgroundColor: colors.warning + "18" }]}>
              <Ionicons name="star" size={20} color={colors.warning} />
            </View>
            <View style={styles.pointsInfo}>
              <Text style={[styles.pointsVal, { color: colors.foreground }]}>{user.totalPoints.toLocaleString()} pts</Text>
              <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>Keep learning to earn more!</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.border} />
          </View>
        )}
      </ScrollView>

      {/* Hamburger Drawer */}
      <DrawerMenu visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  hamburger: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  headerCenter: { flex: 1 },
  greeting: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  name: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 8 },
  streakPill: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20 },
  streakNum: { fontSize: 11, fontFamily: "Poppins_700Bold" },
  avatar: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  avatarText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  scroll: { padding: 16, gap: 0 },
  quoteBanner: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  quoteText: { flex: 1, color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_500Medium", lineHeight: 20, opacity: 0.95 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statsRowWide: { gap: 14 },
  progressCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 14,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  progressCardLeft: { flex: 1, gap: 6 },
  progressCardTitle: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  progressCardSub: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  progressBarBg: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressBarFill: { height: 6, borderRadius: 3 },
  progressPct: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  progressBlob: { position: "absolute", top: -20, right: -20 },
  progressCardRight: { alignItems: "center" },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  quickCard: { width: "30.5%", alignItems: "center", borderRadius: 16, borderWidth: 1, paddingVertical: 14, paddingHorizontal: 8, gap: 5, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 3, elevation: 1 },
  quickIcon: { width: 44, height: 44, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  quickLabel: { fontSize: 12, fontFamily: "Poppins_600SemiBold", textAlign: "center" },
  quickSub: { fontSize: 10, fontFamily: "Poppins_400Regular", textAlign: "center" },
  liveChip: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  liveChipText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 0.5 },
  badgePill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  badgePillText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Poppins_700Bold" },
  liveBanner: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 14, gap: 10, marginBottom: 16 },
  liveBannerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" },
  liveBannerTag: { color: "#FFFFFF", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 0.8 },
  liveBannerMid: { flex: 1 },
  liveBannerSubject: { color: "rgba(255,255,255,0.8)", fontSize: 9, fontFamily: "Poppins_500Medium" },
  liveBannerTopic: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  joinChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  joinChipText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  section: { marginBottom: 18 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  seeAll: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  hScroll: { marginHorizontal: -16, paddingLeft: 16 },
  featCard: {
    borderRadius: 18,
    padding: 14,
    marginRight: 12,
    minHeight: 140,
    justifyContent: "flex-end",
    overflow: "hidden",
    position: "relative",
    gap: 3,
  },
  featBgIcon: { position: "absolute", top: 8, right: 8 },
  featEnrolled: { alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 16, marginBottom: 4 },
  featEnrolledText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  featSubject: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  featTitle: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold", lineHeight: 18 },
  featMeta: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  featRating: { color: "rgba(255,255,255,0.85)", fontSize: 10, fontFamily: "Poppins_500Medium" },
  featDot: { color: "rgba(255,255,255,0.5)", fontSize: 10 },
  featLectures: { color: "rgba(255,255,255,0.75)", fontSize: 10, fontFamily: "Poppins_400Regular" },
  emptyBox: { borderRadius: 16, borderWidth: 1, padding: 28, alignItems: "center", gap: 10 },
  emptyText: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  browseBtn: { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 22, marginTop: 4 },
  browseBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  recordingRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 10 },
  recordingIcon: { width: 46, height: 46, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  recordingInfo: { flex: 1, gap: 2 },
  recordingSub: { fontSize: 9, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.4 },
  recordingTopic: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  recordingMeta: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  playBtn: { width: 34, height: 34, borderRadius: 17, justifyContent: "center", alignItems: "center" },
  pointsCard: { flexDirection: "row", alignItems: "center", borderRadius: 14, borderWidth: 1, padding: 14, gap: 12 },
  pointsIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  pointsInfo: { flex: 1 },
  pointsVal: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  pointsLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
});
