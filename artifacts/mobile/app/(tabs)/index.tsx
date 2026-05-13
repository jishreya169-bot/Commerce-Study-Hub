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
  const { user, courses, liveClasses } = useApp();
  const { width } = useWindowDimensions();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1200);
    return () => clearTimeout(t);
  }, []);

  const enrolled = courses.filter((c) => c.enrolled);
  const liveNow = liveClasses.find((l) => l.isLive);
  const upcoming = liveClasses.filter((l) => !l.isLive).slice(0, 2);

  const avgProgress =
    enrolled.length > 0
      ? Math.round(
          enrolled.reduce((a, c) => a + (c.completedLectures / c.totalLectures) * 100, 0) /
            enrolled.length
        )
      : 0;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isWide = width >= 600;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            paddingTop: topPad + 10,
            backgroundColor: colors.card,
            borderBottomColor: colors.border,
          },
        ]}
      >
        <View style={styles.headerLeft}>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Welcome back 👋</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.streakPill, { backgroundColor: "#FEF3C7" }]}
            activeOpacity={0.8}
          >
            <Ionicons name="flame" size={15} color="#F59E0B" />
            <Text style={[styles.streakNum, { color: "#92400E" }]}>{user.streak} day</Text>
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: Platform.OS === "web" ? 110 : 110 },
        ]}
      >
        {/* Stats */}
        <View style={[styles.statsRow, isWide && styles.statsRowWide]}>
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard icon="book" value={enrolled.length} label="Courses" color={colors.primary} />
              <StatCard icon="trending-up" value={`${avgProgress}%`} label="Progress" color={colors.success} />
              <StatCard icon="trophy" value={`#${user.rank}`} label="Rank" color="#F59E0B" />
            </>
          )}
        </View>

        {/* Live Banner */}
        {!loading && liveNow && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/live/${liveNow.id}`);
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
              <Text style={styles.joinChipText}>Join</Text>
              <Ionicons name="chevron-forward" size={14} color="#FFFFFF" />
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
            <>
              <CourseCardSkeleton />
              <CourseCardSkeleton />
            </>
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

        {/* Browse All */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>All Courses</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/courses")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll} contentContainerStyle={{ paddingLeft: 0, paddingRight: 8 }}>
            {loading
              ? [1, 2].map((i) => (
                  <View key={i} style={{ width: isWide ? 240 : 190, marginRight: 12 }}>
                    <CourseCardSkeleton />
                  </View>
                ))
              : courses.map((c) => (
                  <TouchableOpacity
                    key={c.id}
                    onPress={() => router.push(`/course/${c.id}`)}
                    style={[styles.featCard, { backgroundColor: c.thumbnailColor, width: isWide ? 240 : 190 }]}
                    activeOpacity={0.85}
                  >
                    <View style={styles.featCardGlow}>
                      <Ionicons name="book" size={40} color="rgba(255,255,255,0.18)" />
                    </View>
                    <View style={[styles.featEnrolled, { backgroundColor: c.enrolled ? colors.success + "CC" : "rgba(0,0,0,0.22)" }]}>
                      <Text style={styles.featEnrolledText}>{c.enrolled ? "Enrolled" : "Explore"}</Text>
                    </View>
                    <Text style={styles.featSubject}>{c.subject}</Text>
                    <Text style={styles.featTitle} numberOfLines={2}>{c.title}</Text>
                    <Text style={styles.featInstructor} numberOfLines={1}>{c.instructor}</Text>
                  </TouchableOpacity>
                ))}
          </ScrollView>
        </View>

        {/* Upcoming Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Live</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/live")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See all</Text>
            </TouchableOpacity>
          </View>
          {loading ? (
            <>
              <LiveCardSkeleton />
              <LiveCardSkeleton />
            </>
          ) : (
            upcoming.map((l) => (
              <LiveClassCard key={l.id} liveClass={l} onPress={() => router.push(`/live/${l.id}`)} />
            ))
          )}
        </View>

        {/* Points card */}
        {!loading && (
          <View style={[styles.pointsCard, { backgroundColor: colors.primary + "12", borderColor: colors.primary + "28" }]}>
            <View style={[styles.pointsIcon, { backgroundColor: colors.primary + "20" }]}>
              <Ionicons name="star" size={22} color={colors.primary} />
            </View>
            <View style={styles.pointsInfo}>
              <Text style={[styles.pointsVal, { color: colors.primary }]}>
                {user.totalPoints.toLocaleString()} pts
              </Text>
              <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>
                Keep learning to earn more!
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.primary} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: { gap: 1 },
  greeting: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  name: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  streakPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakNum: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold" },
  scroll: { padding: 20, gap: 4 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 18 },
  statsRowWide: { gap: 14 },
  liveBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    gap: 10,
    marginBottom: 22,
  },
  liveBannerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  liveBannerTag: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 0.8 },
  liveBannerMid: { flex: 1 },
  liveBannerSubject: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "Poppins_500Medium" },
  liveBannerTopic: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  joinChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  joinChipText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  section: { marginBottom: 22 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  hScroll: { marginHorizontal: -20, paddingLeft: 20 },
  featCard: {
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
    minHeight: 150,
    justifyContent: "flex-end",
    overflow: "hidden",
    position: "relative",
    gap: 4,
  },
  featCardGlow: { position: "absolute", top: -6, right: -6, opacity: 0.8 },
  featEnrolled: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 20,
    marginBottom: 6,
  },
  featEnrolledText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  featSubject: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold", lineHeight: 20 },
  featInstructor: { color: "rgba(255,255,255,0.75)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  emptyBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
    gap: 8,
  },
  emptyText: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  pointsCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginTop: 4,
  },
  pointsIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  pointsInfo: { flex: 1 },
  pointsVal: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  pointsLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
});
