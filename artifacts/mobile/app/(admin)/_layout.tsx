import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { useColors } from "@/hooks/useColors";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const ACCENT = "#0EA5E9";

export default function AdminTabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  
  const bottomPadding = Platform.OS === "android" ? Math.max(insets.bottom, 12) : insets.bottom;
  const tabHeight = Platform.OS === "web" ? 84 : 60 + bottomPadding;

  const isDashboardActive = !pathname.includes("academics") && !pathname.includes("finance") && !pathname.includes("profile");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: ACCENT,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.OS === "android" ? colors.card : "transparent",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
          height: tabHeight,
          paddingBottom: bottomPadding,
        },
        tabBarBackground: () => (
          Platform.OS === "android" ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border }]} />
          ) : (
            <BlurView intensity={90} tint={colors.background === "#000000" ? "dark" : "light"} style={[StyleSheet.absoluteFill, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]} />
          )
        ),        
        tabBarLabelStyle: { fontFamily: "Poppins_600SemiBold", fontSize: 10, marginTop: -2 },
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => {
            const active = focused || isDashboardActive;
            return <Ionicons name={active ? "grid" : "grid-outline"} size={22} color={active ? ACCENT : color} />;
          },
          tabBarLabel: ({ color, focused }) => {
            const active = focused || isDashboardActive;
            return <Text style={{ color: active ? ACCENT : color, fontFamily: "Poppins_600SemiBold", fontSize: 10, marginTop: -2 }}>Dashboard</Text>;
          }
        }}
      />
      <Tabs.Screen
        name="academics"
        options={{
          title: "Academics",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "school" : "school-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="finance"
        options={{
          title: "Finance",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "wallet" : "wallet-outline"} size={22} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
          ),
        }}
      />

      {/* Hidden tabs — accessible via dashboard quick actions */}
      <Tabs.Screen name="teachers" options={{ href: null }} />
      <Tabs.Screen name="students" options={{ href: null }} />
      <Tabs.Screen name="courses" options={{ href: null }} />
      <Tabs.Screen name="reports" options={{ href: null }} />
      <Tabs.Screen name="communication" options={{ href: null }} />
      <Tabs.Screen name="library" options={{ href: null }} />
      <Tabs.Screen name="attendance" options={{ href: null }} />
      <Tabs.Screen name="timetable" options={{ href: null }} />
    </Tabs>
  );
}
