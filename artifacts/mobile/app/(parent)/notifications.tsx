import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

const NOTIFICATIONS = [
  { 
    id: "1", 
    title: "Diwali Holidays Announced", 
    sender: "Admin", 
    message: "The academy will remain closed from 20th Oct to 25th Oct. Happy Diwali!", 
    time: "2 hours ago",
    type: "admin",
    icon: "megaphone"
  },
  { 
    id: "2", 
    title: "Fee Reminder", 
    sender: "Admin", 
    message: "Please ensure your child's tuition fees for October are paid by the 5th.", 
    time: "1 day ago",
    type: "admin",
    icon: "wallet"
  },
  { 
    id: "3", 
    title: "Performance Update", 
    sender: "Amit Sharma", 
    message: "Your child scored 85% in the recent Accounts Mock Test.", 
    time: "2 days ago",
    type: "teacher",
    icon: "podium"
  },
  { 
    id: "4", 
    title: "Homework Overdue", 
    sender: "System", 
    message: "Your child has 1 pending homework homework that is overdue.", 
    time: "3 days ago",
    type: "alert",
    icon: "alert-circle"
  },
];

export default function ParentNotifications() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  return (
    <View style={styles.container}>
      
      {/* HEADER */}
      <LinearGradient colors={["#F59E0B", "#D97706"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 40 }} />
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={styles.historyContainer}>
          {NOTIFICATIONS.map((n) => (
            <TouchableOpacity key={n.id} style={styles.historyCard} activeOpacity={0.7} onPress={() => Haptics.selectionAsync()}>
              
              <View style={styles.cardHeader}>
                <View style={styles.senderWrap}>
                  <View style={[styles.iconWrap, { backgroundColor: n.type === "alert" ? "#FEF2F2" : "#FFFBEB" }]}>
                    <Ionicons name={n.icon as any} size={16} color={n.type === "alert" ? "#EF4444" : "#F59E0B"} />
                  </View>
                  <Text style={[styles.senderText, { color: n.type === "alert" ? "#EF4444" : "#F59E0B" }]}>
                    {n.sender}
                  </Text>
                </View>
                <Text style={styles.timeText}>{n.time}</Text>
              </View>

              <Text style={styles.titleText}>{n.title}</Text>
              <Text style={styles.messageText}>{n.message}</Text>

            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 12, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 18, fontFamily: "Poppins_600SemiBold", color: "#FFF" },
  
  scrollContent: { padding: 20 },

  historyContainer: { gap: 16 },
  historyCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  senderWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconWrap: { width: 28, height: 28, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  senderText: { fontFamily: "Poppins_600SemiBold", fontSize: 12 },
  timeText: { fontFamily: "Poppins_500Medium", fontSize: 11, color: "#94A3B8" },
  
  titleText: { fontFamily: "Poppins_600SemiBold", fontSize: 15, color: "#1E293B", marginBottom: 4 },
  messageText: { fontFamily: "Poppins_400Regular", fontSize: 13, color: "#64748B", lineHeight: 20 }
});




