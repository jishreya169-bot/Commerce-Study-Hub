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
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { LiveClassCard } from "@/components/LiveClassCard";
import { SubjectChip } from "@/components/SubjectChip";
import { LiveCardSkeleton } from "@/components/Skeleton";
import * as Haptics from "expo-haptics";

const SUBJECTS = ["All", "Accountancy", "Business Studies", "Economics", "Mathematics"];

export default function LiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { liveClasses } = useApp();
  const { width } = useWindowDimensions();
  const [selectedSubject, setSelectedSubject] = useState("All");
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
    (l) => !l.isLive && (selectedSubject === "All" || l.subject === selectedSubject)
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
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

      {/* Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
      >
        {SUBJECTS.map((s) => (
          <SubjectChip key={s} label={s} selected={selectedSubject === s} onPress={() => setSelectedSubject(s)} />
        ))}
      </ScrollView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}
      >
        {/* Live Now Hero */}
        {loading ? (
          <View style={styles.section}>
            <LiveCardSkeleton />
          </View>
        ) : liveNow.length > 0 ? (
          <View style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={[styles.liveTag, { backgroundColor: colors.live }]}>
                <View style={styles.liveTagDot} />
                <Text style={styles.liveTagText}>LIVE NOW</Text>
              </View>
            </View>
            {liveNow.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push(`/live/${cls.id}`);
                }}
                style={[styles.heroCard, { backgroundColor: cls.thumbnailColor }]}
                activeOpacity={0.9}
              >
                <View style={styles.heroTop}>
                  <View style={[styles.heroLiveBadge, { backgroundColor: colors.live }]}>
                    <View style={styles.heroLiveDot} />
                    <Text style={styles.heroLiveText}>LIVE</Text>
                  </View>
                  {cls.viewers != null && (
                    <View style={[styles.viewersBadge, { backgroundColor: "rgba(0,0,0,0.25)" }]}>
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
                  <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
                  <Text style={styles.heroDuration}>{cls.duration}</Text>
                </View>
                <View style={[styles.heroJoinBtn, { backgroundColor: "#FFFFFF" }]}>
                  <Ionicons name="play" size={17} color={cls.thumbnailColor} />
                  <Text style={[styles.heroJoinText, { color: cls.thumbnailColor }]}>Join Now</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}

        {/* Upcoming */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.foreground }]}>
            {upcoming.length > 0 ? "Upcoming Classes" : "Scheduled Classes"}
          </Text>
          {loading ? (
            [1, 2].map((i) => <LiveCardSkeleton key={i} />)
          ) : upcoming.length === 0 && liveNow.length === 0 ? (
            <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <MaterialIcons name="live-tv" size={44} color={colors.border} />
              <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No classes found</Text>
              <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Try a different subject</Text>
            </View>
          ) : (
            upcoming.map((cls) => (
              <LiveClassCard key={cls.id} liveClass={cls} onPress={() => router.push(`/live/${cls.id}`)} />
            ))
          )}
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
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  subtitle: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  livePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  livePillText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  chipRow: { maxHeight: 56, borderBottomWidth: 1 },
  content: { padding: 20 },
  section: { marginBottom: 24 },
  sectionHead: { marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontFamily: "Poppins_700Bold", marginBottom: 12 },
  liveTag: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" },
  liveTagDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" },
  liveTagText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold", letterSpacing: 0.8 },
  heroCard: {
    borderRadius: 20,
    padding: 18,
    gap: 8,
    overflow: "hidden",
  },
  heroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  heroLiveBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  heroLiveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" },
  heroLiveText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 1 },
  viewersBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  viewersText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_500Medium" },
  heroSubject: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  heroTopic: { color: "#FFFFFF", fontSize: 20, fontFamily: "Poppins_700Bold", lineHeight: 28 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6 },
  heroInstructor: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  heroDot: { color: "rgba(255,255,255,0.5)", fontSize: 12 },
  heroDuration: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  heroJoinBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 12, marginTop: 6 },
  heroJoinText: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  empty: { borderRadius: 16, borderWidth: 1, padding: 36, alignItems: "center", gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular" },
});
