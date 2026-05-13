import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useColors } from "@/hooks/useColors";
import { LiveClass } from "@/context/AppContext";

interface Props {
  liveClass: LiveClass;
  onPress: () => void;
}

export function LiveClassCard({ liveClass, onPress }: Props) {
  const colors = useColors();

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.card, { backgroundColor: colors.card, borderColor: liveClass.isLive ? colors.live + "40" : colors.border }]}
      activeOpacity={0.85}
    >
      <View style={[styles.iconBg, { backgroundColor: liveClass.thumbnailColor }]}>
        {liveClass.isLive ? (
          <MaterialIcons name="live-tv" size={26} color="#FFFFFF" />
        ) : (
          <Ionicons name="videocam" size={24} color="#FFFFFF" />
        )}
        {liveClass.isLive && (
          <View style={[styles.livePip, { backgroundColor: colors.live }]} />
        )}
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={[styles.subject, { color: liveClass.thumbnailColor }]}>{liveClass.subject}</Text>
          {liveClass.isLive ? (
            <View style={[styles.liveBadge, { backgroundColor: colors.live }]}>
              <View style={styles.livePulse} />
              <Text style={styles.liveText}>LIVE</Text>
            </View>
          ) : (
            <View style={[styles.timeBadge, { backgroundColor: colors.secondary }]}>
              <Text style={[styles.timeText, { color: colors.secondaryForeground }]}>{liveClass.scheduledAt}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.topic, { color: colors.foreground }]} numberOfLines={2}>
          {liveClass.topic}
        </Text>
        <View style={styles.meta}>
          <Ionicons name="person-circle-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{liveClass.instructor}</Text>
          <Text style={[styles.dot, { color: colors.border }]}>•</Text>
          <Ionicons name="time-outline" size={12} color={colors.mutedForeground} />
          <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{liveClass.duration}</Text>
          {liveClass.viewers ? (
            <>
              <Text style={[styles.dot, { color: colors.border }]}>•</Text>
              <Ionicons name="eye-outline" size={12} color={colors.mutedForeground} />
              <Text style={[styles.metaText, { color: colors.mutedForeground }]}>{liveClass.viewers.toLocaleString()}</Text>
            </>
          ) : null}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: liveClass.isLive ? colors.live : colors.primary }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name={liveClass.isLive ? "play" : "notifications-outline"} size={15} color="#FFFFFF" />
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBg: {
    width: 54,
    height: 54,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  livePip: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: 4,
    right: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  info: { flex: 1, gap: 4 },
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  subject: { fontSize: 10, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  liveBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  livePulse: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" },
  liveText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 1 },
  timeBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  timeText: { fontSize: 9, fontFamily: "Poppins_500Medium" },
  topic: { fontSize: 13, fontFamily: "Poppins_600SemiBold", lineHeight: 18 },
  meta: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  metaText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  dot: { fontSize: 11 },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
