import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Platform } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { LiveClassCard } from "@/components/LiveClassCard";
import { SubjectChip } from "@/components/SubjectChip";
import * as Haptics from "expo-haptics";

const SUBJECTS = ["All", "Accountancy", "Business Studies", "Economics", "Mathematics"];

export default function LiveScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { liveClasses } = useApp();
  const [selectedSubject, setSelectedSubject] = useState("All");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const liveNow = liveClasses.filter((l) => l.isLive && (selectedSubject === "All" || l.subject === selectedSubject));
  const upcoming = liveClasses.filter((l) => !l.isLive && (selectedSubject === "All" || l.subject === selectedSubject));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.title, { color: colors.foreground }]}>Live Classes</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>Class 11-12 Commerce</Text>
        </View>
        <View style={[styles.liveIndicator, { backgroundColor: colors.live + "20" }]}>
          <View style={[styles.liveDot, { backgroundColor: colors.live }]} />
          <Text style={[styles.liveCount, { color: colors.live }]}>{liveNow.length} Live</Text>
        </View>
      </View>

      {/* Subject Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}>
        {SUBJECTS.map((s) => (
          <SubjectChip key={s} label={s} selected={selectedSubject === s} onPress={() => setSelectedSubject(s)} />
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 100 : 100 }]}>
        {/* Live Now */}
        {liveNow.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionLiveBadge, { backgroundColor: colors.live }]}>
                <View style={styles.sectionLiveDot} />
                <Text style={styles.sectionLiveText}>LIVE NOW</Text>
              </View>
            </View>
            {liveNow.map((cls) => (
              <TouchableOpacity
                key={cls.id}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  router.push(`/live/${cls.id}`);
                }}
                activeOpacity={0.9}
              >
                <View style={[styles.liveHero, { backgroundColor: cls.thumbnailColor }]}>
                  <View style={styles.liveHeroTop}>
                    <View style={[styles.liveHeroBadge, { backgroundColor: colors.live }]}>
                      <View style={styles.livePulse} />
                      <Text style={styles.liveHeroBadgeText}>LIVE</Text>
                    </View>
                    <View style={[styles.viewersBadge, { backgroundColor: "rgba(0,0,0,0.3)" }]}>
                      <Ionicons name="eye" size={13} color="#FFFFFF" />
                      <Text style={styles.viewersText}>{cls.viewers?.toLocaleString()}</Text>
                    </View>
                  </View>
                  <View style={styles.liveHeroContent}>
                    <Text style={styles.liveHeroSubject}>{cls.subject}</Text>
                    <Text style={styles.liveHeroTopic}>{cls.topic}</Text>
                    <View style={styles.liveHeroMeta}>
                      <Ionicons name="person-circle" size={16} color="rgba(255,255,255,0.8)" />
                      <Text style={styles.liveHeroInstructor}>{cls.instructor}</Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={[styles.joinHeroBtn, { backgroundColor: "#FFFFFF" }]}
                    onPress={() => router.push(`/live/${cls.id}`)}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="play" size={18} color={cls.thumbnailColor} />
                    <Text style={[styles.joinHeroBtnText, { color: cls.thumbnailColor }]}>Join Now</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Upcoming */}
        {upcoming.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Upcoming Classes</Text>
            {upcoming.map((cls) => (
              <LiveClassCard
                key={cls.id}
                liveClass={cls}
                onPress={() => router.push(`/live/${cls.id}`)}
              />
            ))}
          </View>
        )}

        {liveNow.length === 0 && upcoming.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialIcons name="live-tv" size={52} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No classes found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>Try a different subject filter</Text>
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
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  subtitle: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  liveIndicator: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveCount: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  chipScroll: { maxHeight: 52 },
  content: { paddingHorizontal: 20 },
  section: { marginBottom: 24 },
  sectionHeader: { marginBottom: 12 },
  sectionLiveBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start" },
  sectionLiveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" },
  sectionLiveText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold", letterSpacing: 1 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", marginBottom: 12 },
  liveHero: {
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    gap: 12,
    minHeight: 200,
    justifyContent: "space-between",
  },
  liveHeroTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  liveHeroBadge: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  livePulse: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" },
  liveHeroBadgeText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold", letterSpacing: 1 },
  viewersBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  viewersText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_500Medium" },
  liveHeroContent: { gap: 4 },
  liveHeroSubject: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  liveHeroTopic: { color: "#FFFFFF", fontSize: 20, fontFamily: "Poppins_700Bold", lineHeight: 28 },
  liveHeroMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveHeroInstructor: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontFamily: "Poppins_400Regular" },
  joinHeroBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 12 },
  joinHeroBtnText: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Poppins_600SemiBold" },
  emptySubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
});
