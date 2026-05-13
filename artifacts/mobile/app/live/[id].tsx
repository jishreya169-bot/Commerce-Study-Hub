import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

export default function LiveClassScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { liveClasses } = useApp();
  const [joined, setJoined] = useState(false);
  const [notifySet, setNotifySet] = useState(false);

  const cls = liveClasses.find((l) => l.id === id);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!cls) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Class not found</Text>
      </View>
    );
  }

  const handleJoin = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setJoined(true);
  };

  const handleNotify = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setNotifySet(true);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero */}
      <View style={[styles.hero, { backgroundColor: cls.thumbnailColor, paddingTop: topPad + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Live/Upcoming Badge */}
        {cls.isLive ? (
          <View style={[styles.heroBadge, { backgroundColor: colors.live }]}>
            <View style={styles.liveDot} />
            <Text style={styles.heroBadgeText}>LIVE NOW</Text>
          </View>
        ) : (
          <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Ionicons name="calendar-outline" size={12} color="#FFFFFF" />
            <Text style={styles.heroBadgeText}>{cls.scheduledAt}</Text>
          </View>
        )}

        {/* Class Icon */}
        <View style={styles.heroIconBg}>
          <MaterialIcons name="live-tv" size={60} color="rgba(255,255,255,0.25)" />
        </View>

        <Text style={styles.heroSubject}>{cls.subject}</Text>
        <Text style={styles.heroTopic}>{cls.topic}</Text>

        <View style={styles.heroMeta}>
          <Ionicons name="person-circle" size={16} color="rgba(255,255,255,0.8)" />
          <Text style={styles.heroInstructor}>{cls.instructor}</Text>
          <Text style={styles.heroDotText}>•</Text>
          <Ionicons name="time-outline" size={14} color="rgba(255,255,255,0.8)" />
          <Text style={styles.heroDuration}>{cls.duration}</Text>
          {cls.viewers && (
            <>
              <Text style={styles.heroDotText}>•</Text>
              <Ionicons name="eye" size={14} color="rgba(255,255,255,0.8)" />
              <Text style={styles.heroDuration}>{cls.viewers.toLocaleString()}</Text>
            </>
          )}
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingBottom: Platform.OS === "web" ? 100 : 60 }]}>
        {/* Join / Notify Action */}
        {cls.isLive ? (
          joined ? (
            <View style={[styles.joinedBanner, { backgroundColor: cls.thumbnailColor + "15", borderColor: cls.thumbnailColor + "30" }]}>
              <MaterialIcons name="live-tv" size={24} color={cls.thumbnailColor} />
              <View style={styles.joinedInfo}>
                <Text style={[styles.joinedTitle, { color: colors.foreground }]}>You've joined the live class!</Text>
                <Text style={[styles.joinedSub, { color: colors.mutedForeground }]}>Audio lecture is streaming live</Text>
              </View>
            </View>
          ) : (
            <TouchableOpacity onPress={handleJoin} style={[styles.joinBtn, { backgroundColor: cls.thumbnailColor }]} activeOpacity={0.85}>
              <Ionicons name="play" size={20} color="#FFFFFF" />
              <Text style={styles.joinBtnText}>Join Live Class</Text>
            </TouchableOpacity>
          )
        ) : notifySet ? (
          <View style={[styles.notifyBanner, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
            <Ionicons name="notifications" size={22} color={colors.success} />
            <Text style={[styles.notifyText, { color: colors.foreground }]}>Reminder set for {cls.scheduledAt}</Text>
          </View>
        ) : (
          <TouchableOpacity onPress={handleNotify} style={[styles.notifyBtn, { backgroundColor: colors.primary }]} activeOpacity={0.85}>
            <Ionicons name="notifications-outline" size={18} color="#FFFFFF" />
            <Text style={styles.joinBtnText}>Set Reminder</Text>
          </TouchableOpacity>
        )}

        {/* Class Details */}
        <View style={[styles.detailCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.detailTitle, { color: colors.foreground }]}>Class Details</Text>
          <DetailRow icon="book-outline" label="Subject" value={cls.subject} colors={colors} />
          <DetailRow icon="person-circle-outline" label="Instructor" value={cls.instructor} colors={colors} />
          <DetailRow icon="time-outline" label="Duration" value={cls.duration} colors={colors} />
          <DetailRow icon="calendar-outline" label="Scheduled" value={cls.scheduledAt} colors={colors} />
        </View>

        {/* Tips */}
        <View style={[styles.tipsCard, { backgroundColor: colors.primary + "08", borderColor: colors.primary + "20" }]}>
          <View style={styles.tipsHeader}>
            <Ionicons name="bulb-outline" size={18} color={colors.primary} />
            <Text style={[styles.tipsTitle, { color: colors.foreground }]}>Tips for Live Class</Text>
          </View>
          {["Keep your notebook ready for important points", "Join 5 minutes early to avoid disruptions", "Revise the previous chapter before joining"].map((tip, i) => (
            <View key={i} style={styles.tipRow}>
              <View style={[styles.tipDot, { backgroundColor: colors.primary }]} />
              <Text style={[styles.tipText, { color: colors.mutedForeground }]}>{tip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function DetailRow({ icon, label, value, colors }: { icon: any; label: string; value: string; colors: any }) {
  return (
    <View style={[styles.detailRow, { borderTopColor: colors.border }]}>
      <Ionicons name={icon} size={16} color={colors.mutedForeground} />
      <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.detailValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  hero: { padding: 20, paddingBottom: 28, gap: 8, position: "relative", overflow: "hidden" },
  heroIconBg: { position: "absolute", right: -10, top: 60 },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" },
  heroBadgeText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold", letterSpacing: 0.5 },
  heroSubject: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8 },
  heroTopic: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold", lineHeight: 30 },
  heroMeta: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  heroInstructor: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Poppins_400Regular" },
  heroDotText: { color: "rgba(255,255,255,0.5)", fontSize: 14 },
  heroDuration: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontFamily: "Poppins_400Regular" },
  content: { padding: 20, gap: 14 },
  joinBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 15,
  },
  joinBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
  joinedBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  joinedInfo: { flex: 1 },
  joinedTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  joinedSub: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  notifyBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 15,
  },
  notifyBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
  },
  notifyText: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  detailCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 4,
  },
  detailTitle: { fontSize: 16, fontFamily: "Poppins_700Bold", marginBottom: 8 },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  detailLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  detailValue: { fontSize: 13, fontFamily: "Poppins_600SemiBold", maxWidth: "55%" as any, textAlign: "right" },
  tipsCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  tipsHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  tipsTitle: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  tipRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  tipDot: { width: 6, height: 6, borderRadius: 3, marginTop: 6 },
  tipText: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20, flex: 1 },
  errorText: { fontSize: 16, fontFamily: "Poppins_400Regular" },
});
