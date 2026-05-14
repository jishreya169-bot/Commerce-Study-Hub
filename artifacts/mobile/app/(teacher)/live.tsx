import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import * as Haptics from "expo-haptics";

const INIT_SESSIONS = [
  { id: "l1", subject: "Accountancy", topic: "Trial Balance — Chapter 4", date: "Today", time: "10:00 AM", duration: 60, students: 42, status: "live", color: "#5B9BD5", viewers: 38 },
  { id: "l2", subject: "Economics", topic: "National Income Concepts", date: "Today", time: "12:30 PM", duration: 45, students: 38, status: "upcoming", color: "#5BAD9B", viewers: 0 },
  { id: "l3", subject: "Accountancy", topic: "Depreciation Methods", date: "Today", time: "3:00 PM", duration: 60, students: 42, status: "upcoming", color: "#5B9BD5", viewers: 0 },
  { id: "l4", subject: "Economics", topic: "Money & Banking", date: "Yesterday", time: "11:00 AM", duration: 50, students: 38, status: "recorded", color: "#5BAD9B", viewers: 35 },
  { id: "l5", subject: "Accountancy", topic: "Partnership Accounts — Intro", date: "Yesterday", time: "2:00 PM", duration: 60, students: 42, status: "recorded", color: "#5B9BD5", viewers: 40 },
  { id: "l6", subject: "Accountancy (XI)", topic: "Journal Entries — Basics", date: "Mon, 12 May", time: "10:00 AM", duration: 55, students: 35, status: "recorded", color: "#7B8EBF", viewers: 31 },
];

const TABS = ["All", "Live", "Upcoming", "Recorded"];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  live: { label: "LIVE", color: "#E53E3E", bg: "#E53E3E18", icon: "radio" },
  upcoming: { label: "Upcoming", color: "#D69E2E", bg: "#D69E2E18", icon: "calendar" },
  recorded: { label: "Recorded", color: "#48BB78", bg: "#48BB7818", icon: "play-circle" },
};

export default function TeacherLive() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const [tab, setTab] = useState("All");
  const [sessions, setSessions] = useState(INIT_SESSIONS);
  const [selected, setSelected] = useState<typeof INIT_SESSIONS[0] | null>(null);
  const [showSchedule, setShowSchedule] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [newDuration, setNewDuration] = useState("");
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = sessions.filter((s) => tab === "All" || s.status === tab.toLowerCase());

  const liveCount = sessions.filter((s) => s.status === "live").length;
  const upcomingCount = sessions.filter((s) => s.status === "upcoming").length;
  const recordedCount = sessions.filter((s) => s.status === "recorded").length;

  const startLive = (id: string) => {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: "live", viewers: Math.floor(Math.random() * 20) + 5 } : s));
    setSelected(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const endLive = (id: string) => {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, status: "recorded" } : s));
    setSelected(null);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const scheduleClass = () => {
    if (!newSubject.trim() || !newTopic.trim()) return;
    const s = {
      id: `l${Date.now()}`, subject: newSubject.trim(), topic: newTopic.trim(),
      date: newDate.trim() || "Tomorrow", time: newTime.trim() || "10:00 AM",
      duration: parseInt(newDuration) || 60, students: 40,
      status: "upcoming", color: "#5B9BD5", viewers: 0,
    };
    setSessions((prev) => [s, ...prev]);
    setNewSubject(""); setNewTopic(""); setNewDate(""); setNewTime(""); setNewDuration("");
    setShowSchedule(false);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Live Lectures</Text>
        <TouchableOpacity onPress={() => setShowSchedule(true)} style={[styles.schedBtn, { backgroundColor: "#48BB78" }]} activeOpacity={0.85}>
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.schedBtnText}>Schedule</Text>
        </TouchableOpacity>
      </View>

      {/* Summary */}
      <View style={[styles.summaryRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {[
          { val: liveCount, label: "Live Now", color: "#E53E3E", icon: "radio" },
          { val: upcomingCount, label: "Upcoming", color: "#D69E2E", icon: "calendar" },
          { val: recordedCount, label: "Recorded", color: "#48BB78", icon: "play-circle" },
          { val: sessions.filter((s) => s.status === "live").reduce((a, s) => a + s.viewers, 0), label: "Viewers", color: "#5B9BD5", icon: "eye" },
        ].map((s) => (
          <View key={s.label} style={styles.summaryItem}>
            <Ionicons name={s.icon as any} size={13} color={s.color} />
            <Text style={[styles.summaryVal, { color: s.color }]}>{s.val}</Text>
            <Text style={[styles.summaryLabel, { color: colors.mutedForeground }]}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 8 }}>
        {TABS.map((t) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tabChip, { backgroundColor: tab === t ? "#48BB78" : colors.muted, borderColor: tab === t ? "#48BB78" : colors.border }]} activeOpacity={0.8}>
            <Text style={[styles.tabChipText, { color: tab === t ? "#FFFFFF" : colors.mutedForeground }]}>{t}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>

        {/* Live NOW banner */}
        {tab === "All" && sessions.filter((s) => s.status === "live").map((s) => (
          <TouchableOpacity
            key={s.id}
            onPress={() => { setSelected(s); Haptics.selectionAsync(); }}
            style={[styles.liveCard, { backgroundColor: "#E53E3E", borderColor: "#C53030" }]}
            activeOpacity={0.9}
          >
            <View style={styles.livePulse}>
              <View style={[styles.liveDot, { backgroundColor: "#FFFFFF" }]} />
              <Text style={styles.liveChipText}>LIVE NOW</Text>
            </View>
            <Text style={styles.liveTopic}>{s.topic}</Text>
            <Text style={styles.liveSubject}>{s.subject}</Text>
            <View style={styles.liveMeta}>
              <Ionicons name="eye" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.liveMetaText}>{s.viewers} watching</Text>
              <Text style={styles.liveMetaDot}>•</Text>
              <Ionicons name="time" size={12} color="rgba(255,255,255,0.8)" />
              <Text style={styles.liveMetaText}>{s.duration} min</Text>
            </View>
            <TouchableOpacity onPress={() => endLive(s.id)} style={styles.endBtn} activeOpacity={0.85}>
              <Ionicons name="stop-circle" size={14} color="#E53E3E" />
              <Text style={styles.endBtnText}>End Class</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}

        {filtered.filter((s) => s.status !== "live" || tab !== "All").map((s) => {
          const cfg = STATUS_CONFIG[s.status];
          return (
            <TouchableOpacity
              key={s.id}
              onPress={() => { setSelected(s); Haptics.selectionAsync(); }}
              style={[styles.sessionCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: s.color, borderLeftWidth: 4 }]}
              activeOpacity={0.85}
            >
              <View style={styles.sessionTop}>
                <View style={styles.sessionInfo}>
                  <View style={styles.sessionTitleRow}>
                    <Text style={[styles.sessionTopic, { color: colors.foreground }]} numberOfLines={1}>{s.topic}</Text>
                    <View style={[styles.statusChip, { backgroundColor: cfg.bg }]}>
                      <Ionicons name={cfg.icon as any} size={9} color={cfg.color} />
                      <Text style={[styles.statusChipText, { color: cfg.color }]}>{cfg.label}</Text>
                    </View>
                  </View>
                  <Text style={[styles.sessionSubject, { color: s.color }]}>{s.subject}</Text>
                  <View style={styles.sessionMeta}>
                    <Ionicons name="calendar-outline" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.sessionMetaText, { color: colors.mutedForeground }]}>{s.date}, {s.time}</Text>
                    <Text style={[styles.sessionMetaDot, { color: colors.mutedForeground }]}>•</Text>
                    <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.sessionMetaText, { color: colors.mutedForeground }]}>{s.duration} min</Text>
                    <Text style={[styles.sessionMetaDot, { color: colors.mutedForeground }]}>•</Text>
                    <Ionicons name="people-outline" size={11} color={colors.mutedForeground} />
                    <Text style={[styles.sessionMetaText, { color: colors.mutedForeground }]}>{s.students}</Text>
                  </View>
                </View>
                {s.status === "upcoming" && (
                  <TouchableOpacity onPress={() => startLive(s.id)} style={[styles.startBtn, { backgroundColor: "#48BB78" }]} activeOpacity={0.85}>
                    <Ionicons name="radio" size={13} color="#FFFFFF" />
                    <Text style={styles.startBtnText}>Go Live</Text>
                  </TouchableOpacity>
                )}
                {s.status === "recorded" && (
                  <TouchableOpacity style={[styles.startBtn, { backgroundColor: "#5B9BD5" }]} activeOpacity={0.85}>
                    <Ionicons name="play" size={13} color="#FFFFFF" />
                    <Text style={styles.startBtnText}>Play</Text>
                  </TouchableOpacity>
                )}
              </View>
              {s.status === "recorded" && (
                <View style={styles.viewersRow}>
                  <Ionicons name="eye" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.viewersText, { color: colors.mutedForeground }]}>{s.viewers} students watched</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}

        {filtered.length === 0 && (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="videocam-off-outline" size={44} color={colors.mutedForeground} />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No sessions found</Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Schedule a new class to get started</Text>
          </View>
        )}
      </ScrollView>

      {/* Detail Modal */}
      <Modal visible={!!selected} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            {selected && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: colors.foreground }]}>Session Details</Text>
                  <TouchableOpacity onPress={() => setSelected(null)}>
                    <Ionicons name="close" size={22} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <View style={[styles.modalHero, { backgroundColor: selected.color + "18" }]}>
                  <View style={[styles.heroIcon, { backgroundColor: selected.color }]}>
                    <Ionicons name={STATUS_CONFIG[selected.status].icon as any} size={20} color="#FFFFFF" />
                  </View>
                  <View>
                    <Text style={[styles.heroTopic, { color: colors.foreground }]}>{selected.topic}</Text>
                    <Text style={[styles.heroSubject, { color: selected.color }]}>{selected.subject}</Text>
                  </View>
                </View>
                {[
                  { label: "Status", val: STATUS_CONFIG[selected.status].label },
                  { label: "Date & Time", val: `${selected.date}, ${selected.time}` },
                  { label: "Duration", val: `${selected.duration} min` },
                  { label: "Students", val: `${selected.students}` },
                  ...(selected.status === "recorded" ? [{ label: "Views", val: `${selected.viewers}` }] : []),
                  ...(selected.status === "live" ? [{ label: "Viewers", val: `${selected.viewers} watching` }] : []),
                ].map((r) => (
                  <View key={r.label} style={[styles.detailRow, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.detailLabel, { color: colors.mutedForeground }]}>{r.label}</Text>
                    <Text style={[styles.detailVal, { color: colors.foreground }]}>{r.val}</Text>
                  </View>
                ))}
                <View style={styles.modalActions}>
                  {selected.status === "upcoming" && (
                    <TouchableOpacity onPress={() => startLive(selected.id)} style={[styles.actionBtn, { backgroundColor: "#E53E3E18", borderColor: "#E53E3E30" }]} activeOpacity={0.8}>
                      <Ionicons name="radio" size={14} color="#E53E3E" />
                      <Text style={[styles.actionBtnText, { color: "#E53E3E" }]}>Start Live</Text>
                    </TouchableOpacity>
                  )}
                  {selected.status === "live" && (
                    <TouchableOpacity onPress={() => endLive(selected.id)} style={[styles.actionBtn, { backgroundColor: "#E53E3E18", borderColor: "#E53E3E30" }]} activeOpacity={0.8}>
                      <Ionicons name="stop-circle" size={14} color="#E53E3E" />
                      <Text style={[styles.actionBtnText, { color: "#E53E3E" }]}>End Class</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => setSelected(null)} style={[styles.actionBtn, { backgroundColor: "#48BB7818", borderColor: "#48BB7830" }]} activeOpacity={0.8}>
                    <Ionicons name="share-outline" size={14} color="#48BB78" />
                    <Text style={[styles.actionBtnText, { color: "#48BB78" }]}>Share Link</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* Schedule Class Modal */}
      <Modal visible={showSchedule} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Schedule Live Class</Text>
              <TouchableOpacity onPress={() => setShowSchedule(false)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {[
              { label: "Subject *", val: newSubject, set: setNewSubject, ph: "e.g. Accountancy" },
              { label: "Topic *", val: newTopic, set: setNewTopic, ph: "e.g. Chapter 5 — Depreciation" },
              { label: "Date", val: newDate, set: setNewDate, ph: "e.g. Tomorrow, 15 May" },
              { label: "Time", val: newTime, set: setNewTime, ph: "e.g. 10:00 AM" },
              { label: "Duration (min)", val: newDuration, set: setNewDuration, ph: "e.g. 60" },
            ].map((f) => (
              <View key={f.label} style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: colors.mutedForeground }]}>{f.label}</Text>
                <View style={[styles.inputRow, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                  <TextInput value={f.val} onChangeText={f.set} placeholder={f.ph} placeholderTextColor={colors.mutedForeground} style={[styles.input, { color: colors.foreground }]} keyboardType={f.label.includes("min") ? "numeric" : "default"} />
                </View>
              </View>
            ))}
            <TouchableOpacity
              onPress={scheduleClass}
              style={[styles.submitBtn, { backgroundColor: "#48BB78", opacity: newSubject.trim() && newTopic.trim() ? 1 : 0.5 }]}
              activeOpacity={0.85}
              disabled={!newSubject.trim() || !newTopic.trim()}
            >
              <Ionicons name="calendar" size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Schedule Class</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 20, fontFamily: "Poppins_700Bold" },
  schedBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20 },
  schedBtnText: { color: "#FFFFFF", fontSize: 12, fontFamily: "Poppins_700Bold" },
  summaryRow: { flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1 },
  summaryItem: { flex: 1, alignItems: "center", gap: 2 },
  summaryVal: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  summaryLabel: { fontSize: 9, fontFamily: "Poppins_400Regular" },
  tabRow: { maxHeight: 54, borderBottomWidth: 1 },
  tabChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  tabChipText: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  scroll: { padding: 16, gap: 0 },
  liveCard: { borderRadius: 16, borderWidth: 1.5, padding: 16, marginBottom: 14, gap: 6 },
  livePulse: { flexDirection: "row", alignItems: "center", gap: 6 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  liveChipText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 1 },
  liveTopic: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  liveSubject: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_500Medium" },
  liveMeta: { flexDirection: "row", alignItems: "center", gap: 5 },
  liveMetaText: { color: "rgba(255,255,255,0.8)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  liveMetaDot: { color: "rgba(255,255,255,0.5)", fontSize: 11 },
  endBtn: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", backgroundColor: "#FFFFFF", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  endBtnText: { color: "#E53E3E", fontSize: 11, fontFamily: "Poppins_700Bold" },
  sessionCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 6 },
  sessionTop: { flexDirection: "row", alignItems: "center", gap: 10 },
  sessionInfo: { flex: 1, gap: 4 },
  sessionTitleRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  sessionTopic: { flex: 1, fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  statusChip: { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, flexShrink: 0 },
  statusChipText: { fontSize: 9, fontFamily: "Poppins_700Bold" },
  sessionSubject: { fontSize: 10, fontFamily: "Poppins_500Medium" },
  sessionMeta: { flexDirection: "row", alignItems: "center", gap: 4, flexWrap: "wrap" },
  sessionMetaText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  sessionMetaDot: { fontSize: 10 },
  startBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, flexShrink: 0 },
  startBtnText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold" },
  viewersRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  viewersText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  emptyBox: { borderRadius: 16, borderWidth: 1, padding: 36, alignItems: "center", gap: 10, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 12, maxHeight: "92%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  modalHero: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, padding: 14 },
  heroIcon: { width: 42, height: 42, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  heroTopic: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  heroSubject: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  detailRow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 9, borderBottomWidth: 1 },
  detailLabel: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  detailVal: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  modalActions: { flexDirection: "row", gap: 10, marginTop: 4 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 11, borderRadius: 12, borderWidth: 1 },
  actionBtnText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  fieldGroup: { gap: 4 },
  fieldLabel: { fontSize: 11, fontFamily: "Poppins_600SemiBold", marginLeft: 2 },
  inputRow: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 10 },
  input: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13, marginTop: 4 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
});
