import React, { useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, Platform, Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import * as Haptics from "expo-haptics";

const DOUBTS = [
  { id: "d1", student: "Priya Sharma", class: "XII-A", subject: "Accountancy", question: "What is the difference between straight-line and written-down value method of depreciation?", time: "20 min ago", resolved: false, urgent: true },
  { id: "d2", student: "Rahul Mehta", class: "XII-A", subject: "Economics", question: "How is GDP different from GNP? Please explain with examples from India.", time: "1 hr ago", resolved: false, urgent: false },
  { id: "d3", student: "Ananya Kapoor", class: "XII-B", subject: "Accountancy", question: "Why do we prepare a Trading Account separately? Can it be merged with P&L?", time: "2 hr ago", resolved: false, urgent: false },
  { id: "d4", student: "Vikram Singh", class: "XII-A", subject: "Accountancy", question: "How to calculate goodwill using Capitalisation method? Explain with a solved example.", time: "3 hr ago", resolved: false, urgent: true },
  { id: "d5", student: "Deepika Nair", class: "XII-B", subject: "Economics", question: "What are the functions of the Reserve Bank of India?", time: "5 hr ago", resolved: true, urgent: false },
  { id: "d6", student: "Arjun Patel", class: "XII-C", subject: "Accountancy", question: "Can you explain the concept of Revaluation Account in partnership?", time: "Yesterday", resolved: true, urgent: false },
];

const SUBJECT_COLORS: Record<string, string> = {
  Accountancy: "#5B9BD5",
  Economics: "#5BAD9B",
};

export default function TeacherDoubts() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<"pending" | "resolved">("pending");
  const [answering, setAnswering] = useState<typeof DOUBTS[0] | null>(null);
  const [answer, setAnswer] = useState("");
  const [doubts, setDoubts] = useState(DOUBTS);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = doubts.filter((d) => tab === "pending" ? !d.resolved : d.resolved);
  const pendingCount = doubts.filter((d) => !d.resolved).length;
  const urgentCount = doubts.filter((d) => !d.resolved && d.urgent).length;
  const resolvedCount = doubts.filter((d) => d.resolved).length;

  const handleSubmit = () => {
    if (!answer.trim() || !answering) return;
    setDoubts((prev) => prev.map((d) => d.id === answering.id ? { ...d, resolved: true } : d));
    setAnswering(null);
    setAnswer("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* ── COLORED BANNER ── */}
      <View style={[styles.headerBanner, { paddingTop: topPad + 8, backgroundColor: "#48BB78", overflow: "hidden" }]}>
        <View style={[styles.dec1, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
        <View style={[styles.dec2, { backgroundColor: "rgba(255,255,255,0.06)" }]} />
        <View style={styles.bannerTop}>
          <View>
            <Text style={styles.bannerLabel}>TEACHER PORTAL</Text>
            <Text style={styles.bannerTitle}>Doubt Inbox</Text>
          </View>
          <View style={styles.bannerBadges}>
            {urgentCount > 0 && (
              <View style={[styles.heroBadge, { backgroundColor: "#E53E3E90" }]}>
                <Ionicons name="warning" size={11} color="#FFFFFF" />
                <Text style={styles.heroBadgeText}>{urgentCount} urgent</Text>
              </View>
            )}
            <View style={[styles.heroBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
              <Ionicons name="help-circle" size={11} color="#FFFFFF" />
              <Text style={styles.heroBadgeText}>{pendingCount} pending</Text>
            </View>
          </View>
        </View>
        {/* Stats */}
        <View style={[styles.bannerStrip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          {[
            { val: doubts.length, label: "Total", icon: "chatbubbles" },
            { val: pendingCount, label: "Pending", icon: "time" },
            { val: urgentCount, label: "Urgent", icon: "warning" },
            { val: resolvedCount, label: "Resolved", icon: "checkmark-circle" },
          ].map((s, i) => (
            <React.Fragment key={s.label}>
              <View style={styles.stripStat}>
                <Ionicons name={s.icon as any} size={12} color="rgba(255,255,255,0.8)" />
                <Text style={styles.stripVal}>{s.val}</Text>
                <Text style={styles.stripLabel}>{s.label}</Text>
              </View>
              {i < 3 && <View style={[styles.stripDiv, { backgroundColor: "rgba(255,255,255,0.2)" }]} />}
            </React.Fragment>
          ))}
        </View>
        <View style={[styles.waveCut, { backgroundColor: colors.background }]} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["pending", "resolved"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => { setTab(t); Haptics.selectionAsync(); }}
            style={[styles.tabBtn, { borderBottomColor: tab === t ? "#48BB78" : "transparent", borderBottomWidth: 2.5 }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#48BB78" : colors.mutedForeground }]}>
              {t === "pending" ? `Pending (${pendingCount})` : `Answered (${resolvedCount})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: "#48BB7818" }]}>
              <Ionicons name="checkmark-circle" size={36} color="#48BB78" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All doubts resolved!</Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Students appreciate your quick support.</Text>
          </View>
        ) : (
          filtered.map((d) => {
            const subjColor = SUBJECT_COLORS[d.subject] ?? "#9B7BC4";
            return (
              <View key={d.id} style={[styles.doubtCard, { backgroundColor: colors.card, borderColor: d.urgent && !d.resolved ? "#E53E3E30" : colors.border, shadowColor: "#000" }]}>
                {/* Top accent */}
                {d.urgent && !d.resolved && <View style={[styles.urgentStripe, { backgroundColor: "#E53E3E" }]} />}
                {d.resolved && <View style={[styles.urgentStripe, { backgroundColor: "#48BB78" }]} />}

                {d.urgent && !d.resolved && (
                  <View style={[styles.urgentChip, { backgroundColor: "#FFF5F5", borderColor: "#FED7D7" }]}>
                    <Ionicons name="warning" size={11} color="#E53E3E" />
                    <Text style={[styles.urgentText, { color: "#E53E3E" }]}>Marked urgent by student</Text>
                  </View>
                )}

                <View style={styles.doubtHeader}>
                  <View style={[styles.studentAvatar, { backgroundColor: subjColor + "18" }]}>
                    <Ionicons name="person" size={16} color={subjColor} />
                  </View>
                  <View style={styles.doubtMeta}>
                    <Text style={[styles.studentName, { color: colors.foreground }]}>{d.student}</Text>
                    <View style={styles.metaRow}>
                      <View style={[styles.classPill, { backgroundColor: colors.muted }]}>
                        <Text style={[styles.classPillText, { color: colors.mutedForeground }]}>{d.class}</Text>
                      </View>
                      <View style={[styles.subjPill, { backgroundColor: subjColor + "18" }]}>
                        <Text style={[styles.subjPillText, { color: subjColor }]}>{d.subject}</Text>
                      </View>
                      <Text style={[styles.timeText, { color: colors.mutedForeground }]}>{d.time}</Text>
                    </View>
                  </View>
                  {d.resolved && (
                    <View style={[styles.resolvedBadge, { backgroundColor: "#48BB7818" }]}>
                      <Ionicons name="checkmark-circle" size={16} color="#48BB78" />
                    </View>
                  )}
                </View>

                <Text style={[styles.question, { color: colors.foreground }]}>{d.question}</Text>

                {!d.resolved && (
                  <TouchableOpacity
                    style={[styles.answerBtn, { backgroundColor: "#48BB78" }]}
                    onPress={() => { setAnswering(d); setAnswer(""); Haptics.selectionAsync(); }}
                    activeOpacity={0.85}
                  >
                    <Ionicons name="chatbubble" size={14} color="#FFFFFF" />
                    <Text style={styles.answerBtnText}>Answer Doubt</Text>
                  </TouchableOpacity>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Answer Modal */}
      <Modal visible={!!answering} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <View style={[styles.modalHeaderIcon, { backgroundColor: "#48BB7818" }]}>
                <Ionicons name="chatbubble" size={16} color="#48BB78" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Answer Doubt</Text>
              <TouchableOpacity onPress={() => setAnswering(null)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {answering && (
              <View style={[styles.questionPreview, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <View style={styles.previewHeader}>
                  <Text style={[styles.previewStudent, { color: "#48BB78" }]}>{answering.student}</Text>
                  <Text style={[styles.previewSubject, { color: colors.mutedForeground }]}>{answering.subject}</Text>
                </View>
                <Text style={[styles.previewText, { color: colors.foreground }]}>{answering.question}</Text>
              </View>
            )}
            <View style={[styles.answerWrap, { backgroundColor: colors.muted, borderColor: colors.border }]}>
              <TextInput
                value={answer}
                onChangeText={setAnswer}
                placeholder="Type your detailed answer here…"
                placeholderTextColor={colors.mutedForeground}
                style={[styles.answerInput, { color: colors.foreground }]}
                multiline
                numberOfLines={5}
                textAlignVertical="top"
              />
            </View>
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitBtn, { backgroundColor: "#48BB78", opacity: answer.trim() ? 1 : 0.5 }]}
              activeOpacity={0.85}
              disabled={!answer.trim()}
            >
              <Ionicons name="send" size={16} color="#FFFFFF" />
              <Text style={styles.submitBtnText}>Submit Answer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBanner: { paddingHorizontal: 16, paddingBottom: 30, position: "relative" },
  dec1: { position: "absolute", width: 200, height: 200, borderRadius: 100, top: -60, right: -40 },
  dec2: { position: "absolute", width: 120, height: 120, borderRadius: 60, bottom: -20, left: -20 },
  bannerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, zIndex: 1 },
  bannerLabel: { color: "rgba(255,255,255,0.7)", fontSize: 9, fontFamily: "Poppins_700Bold", letterSpacing: 1.2, marginBottom: 2 },
  bannerTitle: { color: "#FFFFFF", fontSize: 22, fontFamily: "Poppins_700Bold" },
  bannerBadges: { gap: 6, alignItems: "flex-end" },
  heroBadge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 5, borderRadius: 20 },
  heroBadgeText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  bannerStrip: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 12, zIndex: 1 },
  stripStat: { flex: 1, alignItems: "center", gap: 2 },
  stripVal: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold" },
  stripLabel: { color: "rgba(255,255,255,0.75)", fontSize: 9, fontFamily: "Poppins_400Regular" },
  stripDiv: { width: 1, height: 26 },
  waveCut: { position: "absolute", bottom: 0, left: 0, right: 0, height: 14, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 13, alignItems: "center" },
  tabText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  scroll: { paddingHorizontal: 16, paddingTop: 14, gap: 0 },
  emptyBox: { borderRadius: 18, borderWidth: 1, padding: 36, alignItems: "center", gap: 12, marginTop: 24 },
  emptyIcon: { width: 70, height: 70, borderRadius: 35, justifyContent: "center", alignItems: "center" },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
  doubtCard: { borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: "hidden", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  urgentStripe: { height: 3 },
  urgentChip: { flexDirection: "row", alignItems: "center", gap: 5, marginHorizontal: 14, marginTop: 10, alignSelf: "flex-start", paddingHorizontal: 9, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  urgentText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  doubtHeader: { flexDirection: "row", alignItems: "flex-start", gap: 10, padding: 14, paddingBottom: 8 },
  studentAvatar: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  doubtMeta: { flex: 1, gap: 5 },
  studentName: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, flexWrap: "wrap" },
  classPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7 },
  classPillText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  subjPill: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 7 },
  subjPillText: { fontSize: 9, fontFamily: "Poppins_600SemiBold" },
  timeText: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  resolvedBadge: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  question: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20, paddingHorizontal: 14, paddingBottom: 14 },
  answerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginHorizontal: 14, marginBottom: 14, borderRadius: 12, paddingVertical: 11 },
  answerBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 26, borderTopRightRadius: 26, padding: 20, gap: 14 },
  modalHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  modalHeaderIcon: { width: 32, height: 32, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  modalTitle: { flex: 1, fontSize: 17, fontFamily: "Poppins_700Bold" },
  questionPreview: { borderRadius: 14, borderWidth: 1, padding: 12, gap: 6 },
  previewHeader: { flexDirection: "row", alignItems: "center", gap: 8 },
  previewStudent: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  previewSubject: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  previewText: { fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 18 },
  answerWrap: { borderRadius: 14, borderWidth: 1, padding: 12 },
  answerInput: { fontSize: 13, fontFamily: "Poppins_400Regular", minHeight: 100 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 14 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
});
