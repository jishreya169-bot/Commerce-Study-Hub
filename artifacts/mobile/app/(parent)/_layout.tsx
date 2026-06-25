import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { useColors } from "@/hooks/useColors";
import { ThemeContext } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const ACCENT = "#F59E0B"; // Parent theme color (amber)

export default function ParentTabLayout() {
  const colors = useColors();
  const { theme } = React.useContext(ThemeContext);
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  
  const bottomPadding = Platform.OS === "android" ? Math.max(insets.bottom, 12) : insets.bottom;
  const tabHeight = Platform.OS === "web" ? 84 : 60 + bottomPadding;

  const isDashboardActive = !pathname.includes("results") && !pathname.includes("fees") && !pathname.includes("homework") && !pathname.includes("profile");

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
            <BlurView intensity={90} tint={isDark ? "dark" : "light"} style={[StyleSheet.absoluteFill, { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border }]} />
          )
        ),
        tabBarLabelStyle: {
          fontFamily: "Poppins_600SemiBold",
          fontSize: 10,
          marginTop: -2,
        },
        tabBarIconStyle: { marginTop: 4 },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, focused }) => {
            const active = focused || isDashboardActive;
            return <Ionicons name={active ? "home" : "home-outline"} size={22} color={active ? ACCENT : color} />;
          },
          tabBarLabel: ({ color, focused }) => {
            const active = focused || isDashboardActive;
            return <Text style={{ color: active ? ACCENT : color, fontFamily: "Poppins_600SemiBold", fontSize: 10, marginTop: -2 }}>Dashboard</Text>;
          }
        }}
      />
      <Tabs.Screen
        name="results"
        options={{
          title: "Results",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "podium" : "podium-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: "Fees",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "wallet" : "wallet-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="homework"
        options={{
          title: "Homework",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "document-text" : "document-text-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />,
        }}
      />
      
      {/* Hidden tabs */}
      <Tabs.Screen name="notifications" options={{ href: null }} />
    </Tabs>
  );
}
