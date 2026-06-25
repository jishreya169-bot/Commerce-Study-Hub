import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { useColors } from "@/hooks/useColors";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TeacherProvider } from "../../context/TeacherContext";

const ACCENT = "#0EA5E9";

export default function TeacherTabLayout() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  
  const bottomPadding = Platform.OS === "android" ? Math.max(insets.bottom, 12) : insets.bottom;
  const tabHeight = Platform.OS === "web" ? 84 : 60 + bottomPadding;

  const isDashboardActive = !pathname.includes("attendance") && !pathname.includes("exams") && !pathname.includes("doubts") && !pathname.includes("profile");

  return (
    <TeacherProvider>
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
          title: "Home",
          tabBarIcon: ({ color, focused }) => {
            const active = focused || isDashboardActive;
            return <Ionicons name={active ? "home" : "home-outline"} size={22} color={active ? ACCENT : color} />;
          },
          tabBarLabel: ({ color, focused }) => {
            const active = focused || isDashboardActive;
            return <Text style={{ color: active ? ACCENT : color, fontFamily: "Poppins_600SemiBold", fontSize: 10, marginTop: -2 }}>Home</Text>;
          }
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: "Attendance",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "calendar" : "calendar-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="exams"
        options={{
          title: "Exams",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "document-text" : "document-text-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="doubts"
        options={{
          title: "Doubts",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "help-circle" : "help-circle-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />,
        }}
      />
      {/* Hidden tabs — accessible via dashboard hub */}
      <Tabs.Screen name="upload" options={{ href: null }} />
      <Tabs.Screen name="classes" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="submissions" options={{ href: null }} />
      <Tabs.Screen name="timetable" options={{ href: null }} />
    </Tabs>
    </TeacherProvider>
  );
}
