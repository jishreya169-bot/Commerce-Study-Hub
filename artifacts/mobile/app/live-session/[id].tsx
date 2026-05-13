import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

const MOCK_CHAT = [
  { id: "c1", author: "Rahul M.", text: "This is so helpful sir!", time: "2 min ago", isMe: false },
  { id: "c2", author: "Ananya K.", text: "Sir please explain the gaining ratio again", time: "1 min ago", isMe: false },
  { id: "c3", author: "You", text: "Thank you sir, very clear explanation", time: "Just now", isMe: true },
  { id: "c4", author: "Sneha P.", text: "👍 Amazing lecture", time: "Just now", isMe: false },
  { id: "c5", author: "Vikram R.", text: "Will this recording be available later?", time: "Just now", isMe: false },
];

const REACTIONS = ["👍", "❤️", "🙌", "🔥", "💡"];

export default function LiveSessionScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { liveClasses, user } = useApp();

  const cls = liveClasses.find((l) => l.id === id);
  const [chatMsg, setChatMsg] = useState("");
  const [chat, setChat] = useState(MOCK_CHAT);
  const [handRaised, setHandRaised] = useState(false);
  const [reaction, setReaction] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "participants">("chat");
  const scrollRef = useRef<ScrollView>(null);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  useEffect(() => {
    if (reaction) {
      const t = setTimeout(() => setReaction(null), 1500);
      return () => clearTimeout(t);
    }
  }, [reaction]);

  if (!cls) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: colors.mutedForeground, fontFamily: "Poppins_400Regular" }}>Session not found</Text>
      </View>
    );
  }

  const sendMessage = () => {
    if (!chatMsg.trim()) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setChat([...chat, { id: `c${Date.now()}`, author: "You", text: chatMsg.trim(), time: "Just now", isMe: true }]);
    setChatMsg("");
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  const sendReaction = (emoji: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setReaction(emoji);
  };

  return (
    <View style={[styles.container, { backgroundColor: "#0A1628" }]}>
      {/* Video/Stream area */}
      <View style={[styles.streamArea, { paddingTop: topPad + 6 }]}>
        <View style={styles.streamTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.streamMeta}>
            <View style={[styles.liveTag, { backgroundColor: colors.live }]}>
              <View style={styles.liveDot} />
              <Text style={styles.liveTagText}>LIVE</Text>
            </View>
            <View style={[styles.viewersChip, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
              <Ionicons name="eye" size={12} color="#FFFFFF" />
              <Text style={styles.viewersText}>{cls.viewers?.toLocaleString()}</Text>
            </View>
          </View>
          <TouchableOpacity style={[styles.fullscreenBtn, { backgroundColor: "rgba(255,255,255,0.12)" }]}>
            <Ionicons name="expand" size={17} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Center animation */}
        <View style={styles.streamCenter}>
          <View style={[styles.instructorAvatar, { backgroundColor: cls.thumbnailColor + "40", borderColor: cls.thumbnailColor + "80" }]}>
            <Text style={[styles.instructorAvatarText, { color: cls.thumbnailColor }]}>
              {cls.instructor.split(" ").map(w => w[0]).join("").slice(0, 2)}
            </Text>
          </View>
          <View style={styles.waveRow}>
            {[4, 7, 10, 14, 18, 14, 10, 7, 4].map((h, i) => (
              <View key={i} style={[styles.wave, { height: h, backgroundColor: cls.thumbnailColor + "90" }]} />
            ))}
          </View>
        </View>

        {/* Bottom info */}
        <View style={styles.streamBottom}>
          <Text style={styles.streamSubject}>{cls.subject}</Text>
          <Text style={styles.streamTopic} numberOfLines={1}>{cls.topic}</Text>
          <Text style={styles.streamInstructor}>{cls.instructor}</Text>
        </View>

        {/* Floating reaction */}
        {reaction && (
          <View style={styles.reactionFloat}>
            <Text style={styles.reactionEmoji}>{reaction}</Text>
          </View>
        )}
      </View>

      {/* Controls bar */}
      <View style={[styles.controlsBar, { backgroundColor: "#111D2E" }]}>
        {REACTIONS.map((r) => (
          <TouchableOpacity key={r} onPress={() => sendReaction(r)} style={styles.reactionBtn} activeOpacity={0.7}>
            <Text style={styles.reactionBtnText}>{r}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity
          onPress={() => {
            setHandRaised(!handRaised);
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          }}
          style={[styles.handBtn, { backgroundColor: handRaised ? colors.warning + "30" : "rgba(255,255,255,0.08)" }]}
          activeOpacity={0.8}
        >
          <Ionicons name="hand-left" size={18} color={handRaised ? colors.warning : "#94A3B8"} />
        </TouchableOpacity>
      </View>

      {/* Chat panel */}
      <View style={[styles.chatPanel, { backgroundColor: colors.background }]}>
        {/* Tabs */}
        <View style={[styles.chatTabs, { borderBottomColor: colors.border }]}>
          {(["chat", "participants"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setActiveTab(t)}
              style={[styles.chatTab, activeTab === t && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
            >
              <Text style={[styles.chatTabText, { color: activeTab === t ? colors.primary : colors.mutedForeground }]}>
                {t === "chat" ? "Live Chat" : "Participants"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {activeTab === "chat" ? (
          <>
            <ScrollView
              ref={scrollRef}
              style={styles.chatList}
              contentContainerStyle={styles.chatListContent}
              showsVerticalScrollIndicator={false}
            >
              {chat.map((msg) => (
                <View key={msg.id} style={[styles.chatMsg, msg.isMe && styles.chatMsgMe]}>
                  {!msg.isMe && (
                    <View style={[styles.chatAvatar, { backgroundColor: colors.primary + "25" }]}>
                      <Text style={[styles.chatAvatarText, { color: colors.primary }]}>{msg.author[0]}</Text>
                    </View>
                  )}
                  <View style={[styles.chatBubble, { backgroundColor: msg.isMe ? colors.primary : colors.card, borderColor: colors.border }]}>
                    {!msg.isMe && <Text style={[styles.chatAuthor, { color: colors.primary }]}>{msg.author}</Text>}
                    <Text style={[styles.chatText, { color: msg.isMe ? "#FFFFFF" : colors.foreground }]}>{msg.text}</Text>
                    <Text style={[styles.chatTime, { color: msg.isMe ? "rgba(255,255,255,0.6)" : colors.mutedForeground }]}>{msg.time}</Text>
                  </View>
                </View>
              ))}
            </ScrollView>
            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
              <View style={[styles.chatInput, { backgroundColor: colors.card, borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 20 : insets.bottom + 8 }]}>
                <TextInput
                  value={chatMsg}
                  onChangeText={setChatMsg}
                  placeholder="Type a message..."
                  placeholderTextColor={colors.mutedForeground}
                  style={[styles.chatInputField, { backgroundColor: colors.muted, color: colors.foreground, borderColor: colors.border }]}
                  onSubmitEditing={sendMessage}
                />
                <TouchableOpacity onPress={sendMessage} style={[styles.sendBtn, { backgroundColor: colors.primary }]} activeOpacity={0.8}>
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </KeyboardAvoidingView>
          </>
        ) : (
          <ScrollView style={styles.chatList} contentContainerStyle={styles.chatListContent} showsVerticalScrollIndicator={false}>
            <View style={[styles.participantCount, { backgroundColor: colors.muted }]}>
              <Ionicons name="people" size={16} color={colors.primary} />
              <Text style={[styles.participantCountText, { color: colors.foreground }]}>{cls.viewers?.toLocaleString()} watching</Text>
            </View>
            {["Rahul M.", "Ananya K.", "Sneha P.", "Vikram R.", "Pooja S.", "Arjun T.", user.name].map((name) => (
              <View key={name} style={[styles.participantRow, { borderBottomColor: colors.border }]}>
                <View style={[styles.participantAvatar, { backgroundColor: colors.primary + "18" }]}>
                  <Text style={[styles.participantAvatarText, { color: colors.primary }]}>{name[0]}</Text>
                </View>
                <Text style={[styles.participantName, { color: colors.foreground }]}>{name}</Text>
                {name === user.name && (
                  <View style={[styles.youChip, { backgroundColor: colors.primary }]}>
                    <Text style={styles.youChipText}>You</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  streamArea: { height: 260, padding: 14, justifyContent: "space-between" },
  streamTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.12)", justifyContent: "center", alignItems: "center" },
  streamMeta: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveTag: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 3.5, backgroundColor: "#FFFFFF" },
  liveTagText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_700Bold", letterSpacing: 1 },
  viewersChip: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  viewersText: { color: "#FFFFFF", fontSize: 11, fontFamily: "Poppins_500Medium" },
  fullscreenBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  streamCenter: { alignItems: "center", gap: 14 },
  instructorAvatar: { width: 72, height: 72, borderRadius: 36, justifyContent: "center", alignItems: "center", borderWidth: 2 },
  instructorAvatarText: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  waveRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  wave: { width: 4, borderRadius: 2 },
  streamBottom: { gap: 2 },
  streamSubject: { color: "rgba(255,255,255,0.65)", fontSize: 10, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8 },
  streamTopic: { color: "#FFFFFF", fontSize: 14, fontFamily: "Poppins_700Bold" },
  streamInstructor: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontFamily: "Poppins_400Regular" },
  reactionFloat: { position: "absolute", top: "30%", left: "50%", marginLeft: -20 },
  reactionEmoji: { fontSize: 42 },
  controlsBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, gap: 6 },
  reactionBtn: { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 6 },
  reactionBtnText: { fontSize: 22 },
  handBtn: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  chatPanel: { flex: 1 },
  chatTabs: { flexDirection: "row", borderBottomWidth: 1 },
  chatTab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  chatTabText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  chatList: { flex: 1 },
  chatListContent: { padding: 14, gap: 10 },
  chatMsg: { flexDirection: "row", gap: 8, alignItems: "flex-end" },
  chatMsgMe: { flexDirection: "row-reverse" },
  chatAvatar: { width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center" },
  chatAvatarText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  chatBubble: { maxWidth: "75%", borderRadius: 14, borderWidth: 1, padding: 10, gap: 2 },
  chatAuthor: { fontSize: 10, fontFamily: "Poppins_600SemiBold" },
  chatText: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 18 },
  chatTime: { fontSize: 9, fontFamily: "Poppins_400Regular", marginTop: 2 },
  chatInput: { flexDirection: "row", alignItems: "center", gap: 10, paddingHorizontal: 14, paddingTop: 10, borderTopWidth: 1 },
  chatInputField: { flex: 1, borderRadius: 22, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 9, fontSize: 13, fontFamily: "Poppins_400Regular" },
  sendBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  participantCount: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, padding: 12, marginBottom: 8 },
  participantCountText: { fontSize: 14, fontFamily: "Poppins_600SemiBold" },
  participantRow: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 10, borderBottomWidth: 1 },
  participantAvatar: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  participantAvatarText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  participantName: { flex: 1, fontSize: 13, fontFamily: "Poppins_500Medium" },
  youChip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  youChipText: { color: "#FFFFFF", fontSize: 10, fontFamily: "Poppins_600SemiBold" },
});
