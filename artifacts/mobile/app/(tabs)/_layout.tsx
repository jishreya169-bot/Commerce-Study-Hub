import { Tabs, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, Text } from "react-native";
import { useColors } from "@/hooks/useColors";
import { ThemeContext } from "@/context/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { BlurView } from "expo-blur";

const ACCENT = "#0EA5E9";

export default function TabLayout() {
  const colors = useColors();
  const { theme } = React.useContext(ThemeContext);
  const isDark = theme === "dark";
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  
  const bottomPadding = Platform.OS === "android" ? Math.max(insets.bottom, 12) : insets.bottom;
  const tabHeight = Platform.OS === "web" ? 84 : 60 + bottomPadding;

  const isDashboardActive = !pathname.includes("doubts") && !pathname.includes("results") && !pathname.includes("homework") && !pathname.includes("fees") && !pathname.includes("profile");

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
          title: "Home",
          tabBarIcon: ({ color, focused }) => {
            const active = focused || isDashboardActive;
            return <Ionicons name={active ? "home" : "home-outline"} size={22} color={active ? ACCENT : color} />;
          },
          tabBarLabel: ({ color, focused }) => {
            const active = focused || isDashboardActive;
            return <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: active ? ACCENT : color, fontFamily: "Poppins_600SemiBold", fontSize: 10, marginTop: -2 }}>Home</Text>;
          }
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
        name="results"
        options={{
          title: "Results",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "podium" : "podium-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="homework"
        options={{
          title: "Homework",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "pencil" : "pencil-outline"} size={22} color={color} />,
        }}
      />
      <Tabs.Screen
        name="fees"
        options={{
          title: "Fees",
          tabBarIcon: ({ color, focused }) => <Ionicons name={focused ? "card" : "card-outline"} size={22} color={color} />,
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
      <Tabs.Screen name="courses" options={{ href: null }} />
      <Tabs.Screen name="notifications" options={{ href: null }} />
      <Tabs.Screen name="library" options={{ href: null }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="materials" options={{ href: null }} />
      <Tabs.Screen name="timetable" options={{ href: null }} />
      <Tabs.Screen name="tests" options={{ href: null }} />
      <Tabs.Screen name="attendance" options={{ href: null }} />
    </Tabs>
  );
}

