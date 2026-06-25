import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeIn, FadeOut, ZoomIn, Keyframe } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AppProvider } from "@/context/AppContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function AuthRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const segments = useSegments() as string[];
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inLoginScreen = segments[0] === "login";
    const inLandingScreen = segments.length === 0 || segments[0] === "index" || segments[0] === "";
    const inTeacherGroup = segments[0] === "(teacher)";
    const inAdminGroup = segments[0] === "(admin)";
    const inStudentGroup = segments[0] === "(tabs)";
    const inParentGroup = segments[0] === "(parent)";

    if (!isAuthenticated) {
      if (!inLoginScreen && !inLandingScreen) router.replace("/");
      return;
    }

    // User is authenticated — redirect to correct dashboard if on wrong one
    const role = user?.role;
    if (inLoginScreen) {
      if (role === "teacher") router.replace("/(teacher)");
      else if (role === "admin") router.replace("/(admin)");
      else if (role === "parent") router.replace("/(parent)" as any);
      else router.replace("/(tabs)");
      return;
    }

    if (role === "teacher" && !inTeacherGroup) {
      router.replace("/(teacher)");
    } else if (role === "admin" && !inAdminGroup) {
      router.replace("/(admin)");
    } else if (role === "parent" && !inParentGroup) {
      router.replace("/(parent)" as any);
    } else if (role === "student" && !inStudentGroup) {
      router.replace("/(tabs)");
    }
  }, [isAuthenticated, isLoading, user, segments]);

  return null;
}

function RootLayoutNav() {
  return (
    <>
      <AuthRedirect />
      <Stack screenOptions={{ headerShown: false, animation: "fade" }}>
        <Stack.Screen name="login" options={{ headerShown: false, animation: "fade" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(teacher)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)" options={{ headerShown: false }} />
        <Stack.Screen name="(parent)" options={{ headerShown: false }} />
        <Stack.Screen name="course/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="lecture/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="recorded/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="test/[id]" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="doubts" options={{ headerShown: false, animation: "slide_from_right" }} />
        <Stack.Screen name="notes" options={{ headerShown: false, animation: "slide_from_right" }} />
      </Stack>
    </>
  );
}

function MainApp() {
  const { isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (!isLoading) {
      // Short delay to let the redirect happen behind the splash screen
      setTimeout(() => setShowSplash(false), 800);
    }
  }, [isLoading]);

  return (
    <>
      <RootLayoutNav />
      {showSplash && (
        <Animated.View 
          exiting={FadeOut.duration(500)}
          style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
        >
          <LinearGradient 
            colors={["#0EA5E9", "#2563EB"]} 
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 1 }}
          >
            <Animated.View entering={ZoomIn.duration(800).springify()}>
              <View style={{ width: 100, height: 100, backgroundColor: "#FFF", borderRadius: 30, justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 10, marginBottom: 20 }}>
                <Ionicons name="book" size={50} color="#2563EB" />
              </View>
            </Animated.View>
            
            <Animated.Text entering={FadeIn.delay(400).duration(800)} style={{ fontSize: 32, fontFamily: "Poppins_700Bold", color: "#FFF", letterSpacing: 1 }}>
              StudyHub
            </Animated.Text>
            
            <Animated.Text entering={FadeIn.delay(800).duration(800)} style={{ fontSize: 14, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.8)", marginTop: 10 }}>
              Learn. Grow. Succeed.
            </Animated.Text>
          </LinearGradient>
        </Animated.View>
      )}
    </>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  const [appIsReady, setAppIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      // Hide the native splash screen immediately to show our custom animated one
      SplashScreen.hideAsync();
      
      // Wait for our custom splash animation to finish before showing the app
      setTimeout(() => {
        setAppIsReady(true);
      }, 100); // Give it a tiny bit of time to mount the splash properly
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <ThemeProvider>
          <AuthProvider>
            <QueryClientProvider client={queryClient}>
              <GestureHandlerRootView style={{ flex: 1 }}>
                <KeyboardProvider>
                  <AppProvider>
                    {appIsReady && <MainApp />}
                  </AppProvider>
                </KeyboardProvider>
              </GestureHandlerRootView>
            </QueryClientProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
