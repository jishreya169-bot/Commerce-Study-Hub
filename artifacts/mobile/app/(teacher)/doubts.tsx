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
  { id: "d4", student: "Vikram Singh", class: "XII-A", subject: "Accountancy", question: "How to calculate goodwill using Capitalisation method?", time: "3 hr ago", resolved: false, urgent: true },
  { id: "d5", student: "Deepika Nair", class: "XII-B", subject: "Economics", question: "What are the functions of the Reserve Bank of India?", time: "5 hr ago", resolved: true, urgent: false },
  { id: "d6", student: "Arjun Patel", class: "XII-C", subject: "Accountancy", question: "Can you explain the concept of Revaluation Account?", time: "Yesterday", resolved: true, urgent: false },
];

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

  const handleSubmit = () => {
    if (!answer.trim() || !answering) return;
    setDoubts((prev) => prev.map((d) => d.id === answering.id ? { ...d, resolved: true } : d));
    setAnswering(null);
    setAnswer("");
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>Doubt Inbox</Text>
        {pendingCount > 0 && (
          <View style={[styles.pendingBadge, { backgroundColor: "#E53E3E" }]}>
            <Text style={styles.pendingBadgeText}>{pendingCount} pending</Text>
          </View>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["pending", "resolved"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabBtn, { borderBottomColor: tab === t ? "#48BB78" : "transparent", borderBottomWidth: 2 }]}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, { color: tab === t ? "#48BB78" : colors.mutedForeground }]}>
              {t === "pending" ? `Pending (${pendingCount})` : `Answered (${doubts.filter((d) => d.resolved).length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scroll, { paddingBottom: Platform.OS === "web" ? 110 : 110 }]}>
        {filtered.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="checkmark-circle" size={44} color="#48BB78" />
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>All doubts resolved!</Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Great work! Students appreciate your support.</Text>
          </View>
        ) : (
          filtered.map((d) => (
            <View key={d.id} style={[styles.doubtCard, { backgroundColor: colors.card, borderColor: colors.border, borderLeftColor: d.urgent && !d.resolved ? "#E53E3E" : colors.border, borderLeftWidth: d.urgent && !d.resolved ? 4 : 1 }]}>
              {d.urgent && !d.resolved && (
                <View style={[styles.urgentChip, { backgroundColor: "#FFF5F5", borderColor: "#FED7D7" }]}>
                  <Ionicons name="warning" size={11} color="#E53E3E" />
                  <Text style={[styles.urgentText, { color: "#E53E3E" }]}>Marked urgent by student</Text>
                </View>
              )}
              <View style={styles.doubtHeader}>
                <View style={[styles.avatar, { backgroundColor: "#48BB7818" }]}>
                  <Ionicons name="person" size={16} color="#48BB78" />
                </View>
                <View style={styles.doubtMeta}>
                  <Text style={[styles.studentName, { color: colors.foreground }]}>{d.student}</Text>
                  <Text style={[styles.studentClass, { color: colors.mutedForeground }]}>{d.class} • {d.subject} • {d.time}</Text>
                </View>
                {d.resolved && <Ionicons name="checkmark-circle" size={18} color="#48BB78" />}
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
          ))
        )}
      </ScrollView>

      {/* Answer Modal */}
      <Modal visible={!!answering} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.foreground }]}>Answer Doubt</Text>
              <TouchableOpacity onPress={() => setAnswering(null)}>
                <Ionicons name="close" size={22} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
            {answering && (
              <View style={[styles.questionPreview, { backgroundColor: colors.muted, borderColor: colors.border }]}>
                <Text style={[styles.questionPreviewStudent, { color: colors.primary }]}>{answering.student} — {answering.subject}</Text>
                <Text style={[styles.questionPreviewText, { color: colors.foreground }]}>{answering.question}</Text>
              </View>
            )}
            <TextInput
              value={answer}
              onChangeText={setAnswer}
              placeholder="Type your answer here…"
              placeholderTextColor={colors.mutedForeground}
              style={[styles.answerInput, { color: colors.foreground, backgroundColor: colors.muted, borderColor: colors.border }]}
              multiline
              numberOfLines={5}
            />
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
  header: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  title: { flex: 1, fontSize: 20, fontFamily: "Poppins_700Bold" },
  pendingBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  pendingBadgeText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_700Bold" },
  tabRow: { flexDirection: "row", borderBottomWidth: 1 },
  tabBtn: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  scroll: { padding: 16, gap: 0 },
  emptyBox: { borderRadius: 16, borderWidth: 1, padding: 36, alignItems: "center", gap: 10, marginTop: 20 },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
  doubtCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 12, gap: 10 },
  urgentChip: { flexDirection: "row", alignItems: "center", gap: 5, alignSelf: "flex-start", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1 },
  urgentText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  doubtHeader: { flexDirection: "row", alignItems: "center", gap: 10 },
  avatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  doubtMeta: { flex: 1 },
  studentName: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  studentClass: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  question: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20 },
  answerBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, paddingVertical: 10 },
  answerBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, gap: 14 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  questionPreview: { borderRadius: 12, borderWidth: 1, padding: 12, gap: 4 },
  questionPreviewStudent: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  questionPreviewText: { fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 18 },
  answerInput: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 13, fontFamily: "Poppins_400Regular", textAlignVertical: "top", minHeight: 110 },
  submitBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13 },
  submitBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
});
