import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/context/AuthContext";
import { turso } from "../lib/turso";
import { SubjectChip } from "@/components/SubjectChip";
import * as Haptics from "expo-haptics";

const SUBJECTS = ["All", "Accountancy", "Business Studies", "Economics", "Mathematics"];

const SUBJECT_COLORS: Record<string, string> = {
  Accountancy: "#5B9BD5",
  "Business Studies": "#7B8EBF",
  Economics: "#5BAD9B",
  Mathematics: "#9B7BC4",
  English: "#BF7B5B",
};

export default function DoubtsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  
  const [doubts, setDoubts] = useState<any[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [tab, setTab] = useState<"all" | "resolved" | "mine">("all");
  const [showAsk, setShowAsk] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [newQ, setNewQ] = useState("");
  const [newSubject, setNewSubject] = useState("Accountancy");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const fetchDoubts = async () => {
    try {
      const res = await turso.execute("SELECT id, question, subject, askedBy, teacherReply, resolved, createdAt FROM doubts ORDER BY createdAt DESC");
      const mapped = res.rows.map(r => ({
        id: r[0] as string,
        question: r[1] as string,
        subject: r[2] as string,
        askedBy: r[3] as string,
        teacherReply: r[4] as string,
        resolved: !!r[5],
        askedAt: new Date(r[6] as string).toLocaleDateString(),
        answersCount: r[4] ? 1 : 0,
        upvotes: 0,
        upvoted: false,
        answers: r[4] ? [{
           id: "ans_" + r[0],
           answeredBy: "Teacher",
           isExpert: true,
           upvotes: 0,
           text: r[4] as string
        }] : []
      }));
      setDoubts(mapped);
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    fetchDoubts();
  }, []);

  const filtered = doubts.filter((d) => {
    const matchSub = selectedSubject === "All" || d.subject === selectedSubject;
    const matchTab = tab === "all" ? !d.resolved : tab === "resolved" ? d.resolved : (d.askedBy === user?.name || d.askedBy === "You");
    return matchSub && matchTab;
  });

  const handleAsk = async () => {
    if (!newQ.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    try {
      const id = Date.now().toString();
      await turso.execute({
        sql: "INSERT INTO doubts (id, question, subject, askedBy, studentId, resolved, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [id, newQ.trim(), newSubject, user?.name || "Student", user?.id || "", 0, new Date().toISOString()]
      });
      setNewQ("");
      setShowAsk(false);
      setTab("mine");
      fetchDoubts();
    } catch (e) {
      console.error(e);
      alert("Failed to post doubt.");
    }
  };

  const upvoteDoubt = (id: string) => {
    Haptics.selectionAsync();
    setDoubts(prev => prev.map(d => {
      if (d.id === id) {
        return { ...d, upvoted: !d.upvoted, upvotes: d.upvoted ? d.upvotes - 1 : d.upvotes + 1 };
      }
      return d;
    }));
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={21} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.foreground }]}>Doubt Forum</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{doubts.length} questions</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowAsk(true)}
          style={[styles.askBtn, { backgroundColor: colors.primary }]}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.askBtnText}>Ask</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["all", "resolved", "mine"] as const).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setTab(t)}
            style={[styles.tabItem, tab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2.5 }]}
          >
            <Text style={[styles.tabText, { color: tab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "all" ? "Open" : t === "resolved" ? "Resolved" : "Mine"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Subject chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        {SUBJECTS.map((s) => (
          <SubjectChip key={s} label={s} selected={selectedSubject === s} onPress={() => setSelectedSubject(s)} />
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 80 : 80 }]}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="help-circle-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No doubts here</Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
              {tab === "mine" ? "Post your first doubt!" : "Try a different filter"}
            </Text>
          </View>
        ) : (
          filtered.map((d) => {
            const subColor = SUBJECT_COLORS[d.subject] ?? colors.primary;
            const isExpanded = expanded === d.id;
            return (
              <View key={d.id} style={[styles.doubtCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.doubtTop}>
                  <View style={styles.doubtTopLeft}>
                    <View style={[styles.subjectDot, { backgroundColor: subColor + "25" }]}>
                      <Text style={[styles.subjectDotText, { color: subColor }]}>{d.subject[0]}</Text>
                    </View>
                    <View style={styles.doubtMeta}>
                      <Text style={[styles.doubtSubject, { color: subColor }]}>{d.subject}</Text>
                      <Text style={[styles.doubtBy, { color: colors.mutedForeground }]}>{d.askedBy} • {d.askedAt}</Text>
                    </View>
                  </View>
                  {d.resolved && (
                    <View style={[styles.resolvedBadge, { backgroundColor: colors.success + "20" }]}>
                      <Ionicons name="checkmark-circle" size={13} color={colors.success} />
                      <Text style={[styles.resolvedText, { color: colors.success }]}>Resolved</Text>
                    </View>
                  )}
                </View>

                <Text style={[styles.doubtQuestion, { color: colors.foreground }]}>{d.question}</Text>

                <View style={styles.doubtActions}>
                  <TouchableOpacity onPress={() => upvoteDoubt(d.id)} style={styles.actionBtn} activeOpacity={0.7}>
                    <Ionicons name={d.upvoted ? "arrow-up-circle" : "arrow-up-circle-outline"} size={17} color={d.upvoted ? colors.primary : colors.mutedForeground} />
                    <Text style={[styles.actionText, { color: d.upvoted ? colors.primary : colors.mutedForeground }]}>{d.upvotes}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : d.id)} style={styles.actionBtn} activeOpacity={0.7}>
                    <Ionicons name="chatbubble-outline" size={15} color={colors.mutedForeground} />
                    <Text style={[styles.actionText, { color: colors.mutedForeground }]}>{d.answersCount} answers</Text>
                  </TouchableOpacity>
                  <View style={styles.spacer} />
                  <TouchableOpacity onPress={() => setExpanded(isExpanded ? null : d.id)} activeOpacity={0.7}>
                    <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={18} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>

                {isExpanded && d.answers.length > 0 && (
                  <View style={[styles.answersSection, { borderTopColor: colors.border }]}>
                    {d.answers.map((ans: any) => (
                      <View key={ans.id} style={[styles.answerCard, { backgroundColor: colors.muted }]}>
                        <View style={styles.answerHead}>
                          <View style={[styles.answerAvatar, { backgroundColor: ans.isExpert ? colors.primary + "20" : colors.secondary }]}>
                            <Text style={[styles.answerAvatarText, { color: ans.isExpert ? colors.primary : colors.mutedForeground }]}>{ans.answeredBy[0]}</Text>
                          </View>
                          <View style={styles.answerMeta}>
                            <Text style={[styles.answerBy, { color: colors.foreground }]}>{ans.answeredBy}</Text>
                            {ans.isExpert && (
                              <View style={[styles.expertBadge, { backgroundColor: colors.primary }]}>
                                <Text style={styles.expertText}>Expert</Text>
                              </View>
                            )}
                          </View>
                          <View style={styles.answerLike}>
                            <Ionicons name="arrow-up-circle-outline" size={14} color={colors.mutedForeground} />
                            <Text style={[styles.answerLikeCount, { color: colors.mutedForeground }]}>{ans.upvotes}</Text>
                          </View>
                        </View>
                        <Text style={[styles.answerText, { color: colors.foreground }]}>{ans.text}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {isExpanded && d.answers.length === 0 && (
                  <View style={[styles.noAnswers, { borderTopColor: colors.border }]}>
                    <Text style={[styles.noAnswersText, { color: colors.mutedForeground }]}>No answers yet. Be the first to help!</Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Ask Doubt Modal */}
      <Modal visible={showAsk} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowAsk(false)}>
        <View style={[styles.modalContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowAsk(false)}>
              <Ionicons name="close" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>Ask a Doubt</Text>
            <TouchableOpacity onPress={handleAsk} style={[styles.postBtn, { backgroundColor: colors.primary }]} activeOpacity={0.85}>
              <Text style={styles.postBtnText}>Post</Text>
            </TouchableOpacity>
          </View>
          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.modalContent}>
              <Text style={[styles.modalLabel, { color: colors.foreground }]}>Subject</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalChipRow} contentContainerStyle={{ gap: 8 }}>
                {SUBJECTS.slice(1).map((s) => (
                  <SubjectChip key={s} label={s} selected={newSubject === s} onPress={() => setNewSubject(s)} color={SUBJECT_COLORS[s]} />
                ))}
              </ScrollView>
              <Text style={[styles.modalLabel, { color: colors.foreground }]}>Your Question</Text>
              <TextInput
                value={newQ}
                onChangeText={setNewQ}
                placeholder="Type your doubt clearly..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.modalTextArea, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                autoFocus
              />
              <View style={[styles.tipBox, { backgroundColor: colors.highlight, borderColor: colors.border }]}>
                <Ionicons name="bulb-outline" size={15} color={colors.primary} />
                <Text style={[styles.tipText, { color: colors.mutedForeground }]}>
                  Include chapter name and specific concept to get better answers faster.
                </Text>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  subtitle: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  askBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22 },
  askBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  tabBar: { flexDirection: "row", borderBottomWidth: 1 },
  tabItem: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  chipScroll: { maxHeight: 56, borderBottomWidth: 1 },
  list: { padding: 16, gap: 12 },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  doubtCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 10 },
  doubtTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  doubtTopLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  subjectDot: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  subjectDotText: { fontSize: 15, fontFamily: "Poppins_700Bold" },
  doubtMeta: { gap: 1 },
  doubtSubject: { fontSize: 11, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  doubtBy: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  resolvedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  resolvedText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  doubtQuestion: { fontSize: 14, fontFamily: "Poppins_500Medium", lineHeight: 21 },
  doubtActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  actionBtn: { flexDirection: "row", alignItems: "center", gap: 5 },
  actionText: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  spacer: { flex: 1 },
  answersSection: { borderTopWidth: 1, paddingTop: 12, gap: 10 },
  answerCard: { borderRadius: 12, padding: 12, gap: 8 },
  answerHead: { flexDirection: "row", alignItems: "center", gap: 8 },
  answerAvatar: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  answerAvatarText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  answerMeta: { flex: 1, flexDirection: "row", alignItems: "center", gap: 6 },
  answerBy: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  expertBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  expertText: { color: "#FFFFFF", fontSize: 9, fontFamily: "Poppins_700Bold" },
  answerLike: { flexDirection: "row", alignItems: "center", gap: 3 },
  answerLikeCount: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  answerText: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 19 },
  noAnswers: { borderTopWidth: 1, paddingTop: 10, alignItems: "center" },
  noAnswersText: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  postBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  postBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  modalContent: { padding: 16, gap: 12 },
  modalLabel: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  modalChipRow: { maxHeight: 46 },
  modalTextArea: { borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 13, fontFamily: "Poppins_400Regular", minHeight: 140 },
  tipBox: { flexDirection: "row", gap: 8, borderRadius: 12, borderWidth: 1, padding: 12, alignItems: "flex-start" },
  tipText: { flex: 1, fontSize: 12, fontFamily: "Poppins_400Regular", lineHeight: 18 },
});
