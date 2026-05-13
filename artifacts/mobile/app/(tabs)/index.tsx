import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { CourseCard } from "@/components/CourseCard";
import { LiveClassCard } from "@/components/LiveClassCard";
import { StatCard } from "@/components/StatCard";
import * as Haptics from "expo-haptics";

export default function HomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, courses, liveClasses } = useApp();

  const enrolledCourses = courses.filter((c) => c.enrolled);
  const featuredCourses = courses.filter((c) => c.isFeatured);
  const liveCourse = liveClasses.find((l) => l.isLive);
  const upcomingClasses = liveClasses.filter((l) => !l.isLive).slice(0, 2);

  const totalProgress = enrolledCourses.reduce(
    (acc, c) => acc + (c.completedLectures / c.totalLectures) * 100,
    0
  );
  const avgProgress = enrolledCourses.length > 0 ? Math.round(totalProgress / enrolledCourses.length) : 0;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Jai Hind!</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user.name}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[styles.streakBadge, { backgroundColor: "#FF8F00" + "20" }]}
            activeOpacity={0.8}
          >
            <Ionicons name="flame" size={16} color="#FF8F00" />
            <Text style={[styles.streakText, { color: "#FF8F00" }]}>{user.streak}</Text>
          </TouchableOpacity>
          <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
            <Text style={styles.avatarText}>{user.avatar}</Text>
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: Platform.OS === "web" ? 100 : 100 }]}
      >
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard icon="book" value={enrolledCourses.length} label="Enrolled" color={colors.primary} />
          <StatCard icon="trending-up" value={`${avgProgress}%`} label="Progress" color={colors.success} />
          <StatCard icon="trophy" value={`#${user.rank}`} label="Rank" color="#FF8F00" />
        </View>

        {/* Live Now Banner */}
        {liveCourse && (
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/live/${liveCourse.id}`);
            }}
            style={[styles.liveBanner, { backgroundColor: colors.live }]}
            activeOpacity={0.9}
          >
            <View style={styles.liveBannerLeft}>
              <View style={styles.liveBannerDot} />
              <Text style={styles.liveBannerLabel}>LIVE NOW</Text>
            </View>
            <View style={styles.liveBannerInfo}>
              <Text style={styles.liveBannerSubject}>{liveCourse.subject}</Text>
              <Text style={styles.liveBannerTopic} numberOfLines={1}>{liveCourse.topic}</Text>
            </View>
            <View style={styles.liveBannerAction}>
              <Text style={styles.joinNow}>Join</Text>
              <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
            </View>
          </TouchableOpacity>
        )}

        {/* Continue Learning */}
        {enrolledCourses.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Continue Learning</Text>
              <TouchableOpacity onPress={() => router.push("/(tabs)/courses")}>
                <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
              </TouchableOpacity>
            </View>
            {enrolledCourses.slice(0, 2).map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                compact
                onPress={() => router.push(`/course/${course.id}`)}
              />
            ))}
          </View>
        )}

        {/* Featured Courses */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Featured Courses</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/courses")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                onPress={() => router.push(`/course/${course.id}`)}
                style={[styles.featuredCard, { backgroundColor: course.thumbnailColor }]}
                activeOpacity={0.85}
              >
                <Text style={styles.featuredSubject}>{course.subject}</Text>
                <Text style={styles.featuredTitle} numberOfLines={2}>{course.title}</Text>
                <View style={styles.featuredBottom}>
                  <Ionicons name="person-circle" size={14} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.featuredInstructor} numberOfLines={1}>{course.instructor}</Text>
                </View>
                <View style={[styles.featuredIcon, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                  <Ionicons name="book" size={32} color="rgba(255,255,255,0.7)" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Upcoming Classes */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Live Classes</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/live")}>
              <Text style={[styles.seeAll, { color: colors.primary }]}>See All</Text>
            </TouchableOpacity>
          </View>
          {upcomingClasses.map((cls) => (
            <LiveClassCard
              key={cls.id}
              liveClass={cls}
              onPress={() => router.push(`/live/${cls.id}`)}
            />
          ))}
        </View>

        {/* Points Banner */}
        <View style={[styles.pointsBanner, { backgroundColor: colors.primary + "10", borderColor: colors.primary + "30" }]}>
          <Ionicons name="star" size={24} color={colors.primary} />
          <View style={styles.pointsInfo}>
            <Text style={[styles.pointsValue, { color: colors.primary }]}>{user.totalPoints.toLocaleString()} Points</Text>
            <Text style={[styles.pointsLabel, { color: colors.mutedForeground }]}>Keep learning to earn more rewards!</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.primary} />
        </View>
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
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  greeting: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  name: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  streakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  streakText: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold" },
  scrollContent: { padding: 20, gap: 8 },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  liveBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  liveBannerLeft: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveBannerDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#FFFFFF" },
  liveBannerLabel: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 1 },
  liveBannerInfo: { flex: 1 },
  liveBannerSubject: { color: "rgba(255,255,255,0.8)", fontSize: 10, fontFamily: "Poppins_500Medium" },
  liveBannerTopic: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  liveBannerAction: { flexDirection: "row", alignItems: "center", gap: 2 },
  joinNow: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  section: { marginBottom: 20 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  seeAll: { fontSize: 13, fontFamily: "Poppins_500Medium" },
  horizontalScroll: { marginHorizontal: -20, paddingLeft: 20 },
  featuredCard: {
    width: 200,
    borderRadius: 18,
    padding: 16,
    marginRight: 12,
    minHeight: 140,
    justifyContent: "flex-end",
    position: "relative",
    overflow: "hidden",
  },
  featuredIcon: {
    position: "absolute",
    top: -8,
    right: -8,
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  featuredSubject: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  featuredTitle: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold", lineHeight: 20, marginVertical: 4 },
  featuredBottom: { flexDirection: "row", alignItems: "center", gap: 4 },
  featuredInstructor: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_400Regular", flex: 1 },
  pointsBanner: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  pointsInfo: { flex: 1 },
  pointsValue: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  pointsLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
});
