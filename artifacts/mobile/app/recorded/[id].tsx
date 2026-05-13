import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

type Tab = "comments" | "notes" | "info";

export default function RecordedScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id, courseId, chapterId } = useLocalSearchParams<{ id: string; courseId?: string; chapterId?: string }>();
  const { liveClasses, courses, comments, addComment, likeComment, notes, addNote, user, markLectureComplete } = useApp();

  const liveRef = liveClasses.find((l) => l.recordingId === id || l.id === id);
  const course = courses.find((c) => c.id === courseId);
  const chapter = course?.chapters.find((ch) => ch.id === chapterId);

  const title = chapter?.title ?? liveRef?.topic ?? "Recorded Lecture";
  const instructor = course?.instructor ?? liveRef?.instructor ?? "Instructor";
  const subject = course?.subject ?? liveRef?.subject ?? "Subject";
  const color = course?.thumbnailColor ?? liveRef?.thumbnailColor ?? colors.primary;
  const lectureId = chapterId ?? id;

  const [activeTab, setActiveTab] = useState<Tab>("comments");
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);

  const lectureComments = comments.filter((c) => c.lectureId === lectureId);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (playing && progress < 100) {
      const t = setInterval(() => {
        setProgress((p) => { if (p >= 100) { setPlaying(false); clearInterval(t); return 100; } return p + 0.5; });
      }, 150);
      return () => clearInterval(t);
    }
  }, [playing]);

  const handleComment = () => {
    if (!newComment.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addComment({ lectureId, text: newComment.trim(), author: user.name });
    setNewComment("");
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() || !noteContent.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addNote({ title: noteTitle.trim(), content: noteContent.trim(), subject, color: colors.secondary });
    setNoteTitle("");
    setNoteContent("");
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 6, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={21} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerSub, { color: colors.mutedForeground }]} numberOfLines={1}>{subject}</Text>
          <Text style={[styles.headerTitle, { color: colors.foreground }]} numberOfLines={1}>{title}</Text>
        </View>
        <View style={[styles.recBadge, { backgroundColor: colors.muted }]}>
          <Ionicons name="recording" size={13} color={colors.primary} />
          <Text style={[styles.recBadgeText, { color: colors.primary }]}>Recorded</Text>
        </View>
      </View>

      {/* Video player */}
      <View style={[styles.player, { backgroundColor: "#0A1628" }]}>
        <TouchableOpacity
          onPress={() => { setPlaying(!playing); Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}
          style={[styles.playBtn, { backgroundColor: color + "30", borderColor: color + "60" }]}
          activeOpacity={0.85}
        >
          <Ionicons name={playing ? "pause" : "play"} size={30} color={color} />
        </TouchableOpacity>
        {playing && (
          <View style={styles.waveRow}>
            {[3, 6, 10, 14, 10, 6, 3, 6, 10, 6, 3].map((h, i) => (
              <View key={i} style={[styles.wave, { height: h * 1.5, backgroundColor: color + "70" }]} />
            ))}
          </View>
        )}
        <View style={styles.playerInfo}>
          <Text style={styles.playerLabel}>{playing ? "Playing…" : progress > 0 ? "Paused" : "Tap to play recording"}</Text>
          {progress === 100 && (
            <View style={[styles.watchedBadge, { backgroundColor: colors.success + "25" }]}>
              <Ionicons name="checkmark-circle" size={13} color={colors.success} />
              <Text style={[styles.watchedText, { color: colors.success }]}>Watched</Text>
            </View>
          )}
        </View>
        {/* Progress */}
        <View style={styles.progressRow}>
          <Text style={styles.progressTime}>{Math.round(progress * 0.65)} min</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { backgroundColor: color, width: `${progress}%` as any }]} />
          </View>
          <Text style={styles.progressTime}>65 min</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        {(["comments", "notes", "info"] as Tab[]).map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setActiveTab(t)}
            style={[styles.tab, activeTab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2.5 }]}
          >
            <Ionicons
              name={t === "comments" ? "chatbubble-outline" : t === "notes" ? "document-text-outline" : "information-circle-outline"}
              size={15}
              color={activeTab === t ? colors.primary : colors.mutedForeground}
            />
            <Text style={[styles.tabText, { color: activeTab === t ? colors.primary : colors.mutedForeground }]}>
              {t === "comments" ? `Comments (${lectureComments.length})` : t === "notes" ? "My Notes" : "Info"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      {activeTab === "comments" && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.tabContent, { paddingBottom: Platform.OS === "web" ? 80 : 80 }]}>
            {lectureComments.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons name="chatbubble-outline" size={36} color={colors.border} />
                <Text style={[styles.emptyText, { color: colors.mutedForeground }]}>No comments yet. Be the first!</Text>
              </View>
            ) : (
              lectureComments.map((c) => (
                <View key={c.id} style={[styles.commentCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={[styles.commentAvatar, { backgroundColor: colors.primary + "18" }]}>
                    <Text style={[styles.commentAvatarText, { color: colors.primary }]}>{c.author[0]}</Text>
                  </View>
                  <View style={styles.commentBody}>
                    <View style={styles.commentHead}>
                      <Text style={[styles.commentAuthor, { color: colors.foreground }]}>{c.author}</Text>
                      <Text style={[styles.commentTime, { color: colors.mutedForeground }]}>{c.timestamp}</Text>
                    </View>
                    <Text style={[styles.commentText, { color: colors.foreground }]}>{c.text}</Text>
                    <TouchableOpacity
                      onPress={() => { likeComment(c.id); Haptics.selectionAsync(); }}
                      style={styles.likeRow}
                    >
                      <Ionicons name={c.liked ? "heart" : "heart-outline"} size={14} color={c.liked ? colors.live : colors.mutedForeground} />
                      <Text style={[styles.likeCount, { color: c.liked ? colors.live : colors.mutedForeground }]}>{c.likes}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
          <View style={[styles.commentInput, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 20 : insets.bottom + 8 }]}>
            <TextInput
              value={newComment}
              onChangeText={setNewComment}
              placeholder="Add a comment..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.commentInputField, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
            />
            <TouchableOpacity onPress={handleComment} style={[styles.sendBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
              <Ionicons name="send" size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}

      {activeTab === "notes" && (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.tabContent, { paddingBottom: Platform.OS === "web" ? 80 : 80 }]}>
            <Text style={[styles.notesHeading, { color: colors.foreground }]}>Quick Note</Text>
            <TextInput
              value={noteTitle}
              onChangeText={setNoteTitle}
              placeholder="Note title..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.noteTitleInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
            />
            <TextInput
              value={noteContent}
              onChangeText={setNoteContent}
              placeholder="Write your notes here..."
              placeholderTextColor={colors.mutedForeground}
              style={[styles.noteContentInput, { backgroundColor: colors.card, borderColor: colors.border, color: colors.foreground }]}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
            <TouchableOpacity
              onPress={handleSaveNote}
              style={[styles.saveNoteBtn, { backgroundColor: noteSaved ? colors.success : colors.primary }]}
              activeOpacity={0.85}
            >
              <Ionicons name={noteSaved ? "checkmark-circle" : "save"} size={17} color="#FFFFFF" />
              <Text style={styles.saveNoteBtnText}>{noteSaved ? "Saved!" : "Save Note"}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      )}

      {activeTab === "info" && (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.tabContent, { paddingBottom: Platform.OS === "web" ? 80 : 80 }]}>
          <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <InfoRow icon="book-outline" label="Subject" value={subject} colors={colors} />
            <InfoRow icon="person-circle-outline" label="Instructor" value={instructor} colors={colors} />
            <InfoRow icon="time-outline" label="Duration" value={chapter?.duration ?? liveRef?.duration ?? "65 min"} colors={colors} />
            <InfoRow icon="calendar-outline" label="Recorded" value={liveRef?.scheduledAt ?? "Recently"} colors={colors} last />
          </View>
          <View style={[styles.descriptionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.descTitle, { color: colors.foreground }]}>About this lecture</Text>
            <Text style={[styles.descText, { color: colors.mutedForeground }]}>
              {course?.description ?? `This recorded session covers "${title}" in detail, following the CBSE Class 11-12 curriculum for ${subject}. Watch at your own pace and revisit any part of the lecture.`}
            </Text>
          </View>
          {progress > 0 && (
            <TouchableOpacity
              onPress={() => { if (courseId && chapterId) markLectureComplete(courseId, chapterId); Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); }}
              style={[styles.markDoneBtn, { backgroundColor: colors.success }]}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
              <Text style={styles.markDoneText}>Mark as Completed</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}
    </View>
  );
}

function InfoRow({ icon, label, value, colors, last }: { icon: any; label: string; value: string; colors: any; last?: boolean }) {
  return (
    <View style={[styles.infoRow, { borderBottomColor: last ? "transparent" : colors.border }]}>
      <Ionicons name={icon} size={15} color={colors.mutedForeground} />
      <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>{label}</Text>
      <Text style={[styles.infoValue, { color: colors.foreground }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 14, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  headerInfo: { flex: 1 },
  headerSub: { fontSize: 10, fontFamily: "Poppins_500Medium", textTransform: "uppercase", letterSpacing: 0.5 },
  headerTitle: { fontSize: 13, fontFamily: "Poppins_700Bold" },
  recBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  recBadgeText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  player: { height: 200, justifyContent: "center", alignItems: "center", gap: 12, position: "relative", paddingHorizontal: 20 },
  playBtn: { width: 64, height: 64, borderRadius: 32, justifyContent: "center", alignItems: "center", borderWidth: 2 },
  waveRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  wave: { width: 4, borderRadius: 2 },
  playerInfo: { flexDirection: "row", alignItems: "center", gap: 8 },
  playerLabel: { color: "rgba(255,255,255,0.6)", fontSize: 12, fontFamily: "Poppins_400Regular" },
  watchedBadge: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  watchedText: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 8, width: "100%" },
  progressTime: { color: "rgba(255,255,255,0.5)", fontSize: 10, fontFamily: "Poppins_400Regular" },
  progressTrack: { flex: 1, height: 4, borderRadius: 2, backgroundColor: "rgba(255,255,255,0.2)", overflow: "hidden" },
  progressFill: { height: 4, borderRadius: 2 },
  tabs: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 5, paddingVertical: 12 },
  tabText: { fontSize: 11, fontFamily: "Poppins_600SemiBold" },
  tabContent: { padding: 16, gap: 12 },
  emptyState: { alignItems: "center", paddingTop: 40, gap: 10 },
  emptyText: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
  commentCard: { flexDirection: "row", gap: 10, borderRadius: 14, borderWidth: 1, padding: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  commentAvatarText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  commentBody: { flex: 1, gap: 4 },
  commentHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  commentAuthor: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  commentTime: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  commentText: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 19 },
  likeRow: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 2 },
  likeCount: { fontSize: 11, fontFamily: "Poppins_500Medium" },
  commentInput: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  commentInputField: { flex: 1, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9, fontSize: 13, fontFamily: "Poppins_400Regular" },
  sendBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  notesHeading: { fontSize: 15, fontFamily: "Poppins_700Bold", marginBottom: 4 },
  noteTitleInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  noteContentInput: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 11, fontSize: 13, fontFamily: "Poppins_400Regular", minHeight: 140 },
  saveNoteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13 },
  saveNoteBtnText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold" },
  infoCard: { borderRadius: 16, borderWidth: 1, overflow: "hidden" },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingVertical: 13, borderBottomWidth: 1 },
  infoLabel: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  infoValue: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  descriptionCard: { borderRadius: 16, borderWidth: 1, padding: 14, gap: 8 },
  descTitle: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  descText: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 20 },
  markDoneBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 14, paddingVertical: 13 },
  markDoneText: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold" },
});
