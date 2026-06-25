import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import * as Notifications from "expo-notifications";
import { useEffect } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const MY_CLASSES = ["Class 12 - Commerce", "Class 11 - Commerce", "Batch A - Accounts", "Crash Course 2026"];

const INBOX = [
  { id: "i1", title: "Diwali Holidays Announced", sender: "Admin", message: "The academy will remain closed from 20th Oct to 25th Oct.", time: "2 hours ago" },
  { id: "i2", title: "Staff Meeting at 4 PM", sender: "Admin", message: "Please join the conference room for the monthly review.", time: "1 day ago" },
];

export default function TeacherNotifications() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [tab, setTab] = useState("inbox");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [selectedTarget, setSelectedTarget] = useState(MY_CLASSES[0]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    const requestPermissions = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        await Notifications.requestPermissionsAsync();
      }
    };
    requestPermissions();
  }, []);

  const handleSend = async () => {
    if (!title || !message) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: message,
        data: { target: selectedTarget },
      },
      trigger: null,
    });

    setTitle("");
    setMessage("");
    alert("Notice sent to " + selectedTarget + "!");
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      
      {/* HEADER */}
      <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Communications</Text>
        <View style={{ width: 24 }} />
      </LinearGradient>

      {/* TABS */}
      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, tab === "inbox" && styles.activeTab]} onPress={() => { Haptics.selectionAsync(); setTab("inbox"); }}>
          <Text style={[styles.tabText, tab === "inbox" && styles.activeTabText]}>Inbox</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, tab === "send" && styles.activeTab]} onPress={() => { Haptics.selectionAsync(); setTab("send"); }}>
          <Text style={[styles.tabText, tab === "send" && styles.activeTabText]}>Send to Class</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {tab === "send" ? (
          <View style={styles.formCard}>
            
            {/* TARGET SELECTION */}
            <Text style={styles.inputLabel}>Select Class/Batch</Text>
            <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowDropdown(!showDropdown)}>
              <Text style={styles.dropdownText}>{selectedTarget}</Text>
              <Ionicons name={showDropdown ? "chevron-up" : "chevron-down"} size={20} color="#64748B" />
            </TouchableOpacity>

            {showDropdown && (
              <View style={styles.dropdownMenu}>
                {MY_CLASSES.map((t, i) => (
                  <TouchableOpacity key={i} style={styles.dropdownItem} onPress={() => { setSelectedTarget(t); setShowDropdown(false); }}>
                    <Text style={[styles.dropdownItemText, selectedTarget === t && { color: "#0EA5E9", fontFamily: "Poppins_600SemiBold" }]}>{t}</Text>
                    {selectedTarget === t && <Ionicons name="checkmark-circle" size={18} color="#0EA5E9" />}
                  </TouchableOpacity>
                ))}
              </View>
            )}

            {/* TITLE */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Topic / Subject</Text>
            <TextInput
              style={styles.input}
              placeholder="E.g., Surprise Test Tomorrow"
              placeholderTextColor="#94A3B8"
              value={title}
              onChangeText={setTitle}
            />

            {/* MESSAGE */}
            <Text style={[styles.inputLabel, { marginTop: 16 }]}>Message</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Type your message for the students..."
              placeholderTextColor="#94A3B8"
              multiline
              textAlignVertical="top"
              value={message}
              onChangeText={setMessage}
            />

            <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
              <Ionicons name="paper-plane" size={18} color="#FFF" />
              <Text style={styles.sendBtnText}>Send to Students</Text>
            </TouchableOpacity>

          </View>
        ) : (
          <View style={styles.historyContainer}>
            {INBOX.map((h) => (
              <View key={h.id} style={styles.historyCard}>
                <View style={styles.hTop}>
                  <View style={styles.hTargetPill}>
                    <Ionicons name="business" size={12} color="#475569" style={{ marginRight: 4 }} />
                    <Text style={styles.hTargetText}>{h.sender}</Text>
                  </View>
                  <Text style={styles.hTime}>{h.time}</Text>
                </View>
                <Text style={styles.hTitle}>{h.title}</Text>
                <Text style={styles.hMessage}>{h.message}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  
  tabContainer: { flexDirection: "row", marginHorizontal: 20, marginTop: 20, backgroundColor: "#E2E8F0", borderRadius: 12, padding: 4 },
  tab: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 8 },
  activeTab: { backgroundColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  tabText: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "#64748B" },
  activeTabText: { color: "#0F172A", fontFamily: "Poppins_600SemiBold" },

  scrollContent: { padding: 20 },
  
  formCard: { backgroundColor: "#FFF", borderRadius: 20, padding: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  inputLabel: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8 },
  dropdownBtn: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 14 },
  dropdownText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#0F172A" },
  dropdownMenu: { backgroundColor: "#FFF", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, marginTop: 6, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3 },
  dropdownItem: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
  dropdownItemText: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "#475569" },
  
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  textArea: { height: 120, paddingTop: 14 },

  sendBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "#0EA5E9", borderRadius: 12, paddingVertical: 14, marginTop: 24, gap: 8 },
  sendBtnText: { color: "#FFF", fontSize: 15, fontFamily: "Poppins_600SemiBold" },

  historyContainer: { gap: 14 },
  historyCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  hTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  hTargetPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#F1F5F9", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  hTargetText: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#475569" },
  hTime: { fontSize: 11, fontFamily: "Poppins_400Regular", color: "#94A3B8" },
  hTitle: { fontSize: 15, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 6 },
  hMessage: { fontSize: 13, fontFamily: "Poppins_400Regular", color: "#475569", lineHeight: 20 },
});



