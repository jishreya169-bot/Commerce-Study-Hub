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
    <TouchableOpacity onPress={onPress} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]} activeOpacity={0.85}>
      <View style={[styles.iconBg, { backgroundColor: liveClass.thumbnailColor }]}>
        {liveClass.isLive ? (
          <MaterialIcons name="live-tv" size={28} color="#FFFFFF" />
        ) : (
          <Ionicons name="videocam" size={28} color="#FFFFFF" />
        )}
        {liveClass.isLive && (
          <View style={[styles.liveDot, { backgroundColor: colors.live }]} />
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
            <View style={[styles.scheduleBadge, { backgroundColor: colors.muted }]}>
              <Text style={[styles.scheduleText, { color: colors.mutedForeground }]}>{liveClass.scheduledAt}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.topic, { color: colors.foreground }]} numberOfLines={2}>{liveClass.topic}</Text>
        <View style={styles.meta}>
          <Ionicons name="person-circle-outline" size={14} color={colors.mutedForeground} />
          <Text style={[styles.instructor, { color: colors.mutedForeground }]}>{liveClass.instructor}</Text>
          <Text style={[styles.dot, { color: colors.border }]}>•</Text>
          <Ionicons name="time-outline" size={13} color={colors.mutedForeground} />
          <Text style={[styles.duration, { color: colors.mutedForeground }]}>{liveClass.duration}</Text>
          {liveClass.isLive && liveClass.viewers && (
            <>
              <Text style={[styles.dot, { color: colors.border }]}>•</Text>
              <Ionicons name="eye-outline" size={13} color={colors.mutedForeground} />
              <Text style={[styles.duration, { color: colors.mutedForeground }]}>{liveClass.viewers.toLocaleString()}</Text>
            </>
          )}
        </View>
      </View>
      <TouchableOpacity
        style={[styles.joinBtn, { backgroundColor: liveClass.isLive ? colors.live : colors.primary }]}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <Ionicons name={liveClass.isLive ? "play" : "notifications-outline"} size={16} color="#FFFFFF" />
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
    width: 56,
    height: 56,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: "absolute",
    top: 4,
    right: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  info: {
    flex: 1,
    gap: 4,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subject: {
    fontSize: 10,
    fontFamily: "Poppins_600SemiBold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  livePulse: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  liveText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontFamily: "Poppins_700Bold",
    letterSpacing: 1,
  },
  scheduleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  scheduleText: {
    fontSize: 10,
    fontFamily: "Poppins_500Medium",
  },
  topic: {
    fontSize: 13,
    fontFamily: "Poppins_600SemiBold",
    lineHeight: 19,
  },
  meta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    flexWrap: "wrap",
  },
  instructor: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  dot: {
    fontSize: 12,
  },
  duration: {
    fontSize: 11,
    fontFamily: "Poppins_400Regular",
  },
  joinBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
});
