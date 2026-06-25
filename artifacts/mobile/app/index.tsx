import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { useAuth } from "../context/AuthContext";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import { turso } from "../lib/turso";

const { width } = Dimensions.get("window");

export default function LandingPage() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  const [classes, setClasses] = useState<{name: string, subject: string}[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const result = await turso.execute("SELECT name, subject FROM classes ORDER BY createdAt DESC LIMIT 4");
        setClasses(result.rows.map(r => ({ name: r[0] as string, subject: r[1] as string })));
      } catch (e) {
        console.log("Error fetching classes on landing", e);
      }
    };
    fetchClasses();
  }, []);

  const handleLoginPress = () => {
    Haptics.selectionAsync();
    router.push("/login");
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* HERO SECTION */}
        <LinearGradient colors={["#0EA5E9", "#2563EB"]} style={[styles.hero, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          
          {/* Top Navbar */}
          <View style={styles.navBar}>
            <View style={styles.logoWrap}>
              <Ionicons name="book" size={24} color="#FFF" />
              <Text style={styles.logoText}>StudyHub</Text>
            </View>
            <TouchableOpacity style={styles.loginBtn} onPress={handleLoginPress}>
              <Text style={styles.loginBtnText}>{isAuthenticated ? "Dashboard" : "Log In"}</Text>
              <Ionicons name="arrow-forward" size={16} color="#0EA5E9" />
            </TouchableOpacity>
          </View>

          {/* Hero Content */}
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.heroContent}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>#1 Commerce Academy</Text>
            </View>
            <Text style={styles.heroTitle}>Master Commerce with the Best.</Text>
            <Text style={styles.heroDesc}>Expert faculty, structured courses, and premium study materials designed for your success.</Text>
            
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1000&auto=format&fit=crop" }} 
              style={styles.heroImage} 
              contentFit="cover"
            />
          </Animated.View>
        </LinearGradient>

        {/* STATS SECTION */}
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>10k+</Text>
            <Text style={styles.statLabel}>Students</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>50+</Text>
            <Text style={styles.statLabel}>Expert Tutors</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statVal}>99%</Text>
            <Text style={styles.statLabel}>Pass Rate</Text>
          </View>
        </Animated.View>

        {/* FEATURES SECTION */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Why Choose Us?</Text>
          <View style={styles.featureGrid}>
            {[
              { icon: "library", title: "Study Material", desc: "Comprehensive notes and recorded lectures.", color: "#10B981" },
              { icon: "help-circle", title: "Doubt Solving", desc: "24/7 dedicated doubt resolution portal.", color: "#F59E0B" },
              { icon: "stats-chart", title: "Test Series", desc: "Weekly mock tests and performance tracking.", color: "#8B5CF6" },
            ].map((f, i) => (
              <View key={i} style={styles.featureCard}>
                <View style={[styles.featureIcon, { backgroundColor: f.color + "15" }]}>
                  <Ionicons name={f.icon as any} size={24} color={f.color} />
                </View>
                <Text style={styles.featureTitle}>{f.title}</Text>
                <Text style={styles.featureDesc}>{f.desc}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* BATCHES / CLASSES OVERVIEW SECTION */}
        <Animated.View entering={FadeInDown.delay(350).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Explore Our Batches</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.classScroll}>
            {classes.length > 0 ? classes.map((c, i) => (
              <View key={i} style={styles.classCard}>
                <View style={styles.classIconWrap}>
                  <Ionicons name="school" size={24} color="#0EA5E9" />
                </View>
                <Text style={styles.classNameText} numberOfLines={1}>{c.name}</Text>
                <Text style={styles.classSubText} numberOfLines={1}>{c.subject}</Text>
              </View>
            )) : (
              <View style={styles.classCard}>
                <Text style={styles.classNameText}>Loading Batches...</Text>
              </View>
            )}
          </ScrollView>
        </Animated.View>

        {/* TESTIMONIALS SECTION */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.section}>
          <Text style={styles.sectionTitle}>Student Success Stories</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.reviewScroll}>
            {[
              { name: "Rahul Sharma", score: "98% in Boards", review: "The study materials and live doubts solving helped me top my district!", avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=150&auto=format&fit=crop" },
              { name: "Priya Patel", score: "CA Foundation Cleared", review: "Best commerce faculty. The recorded lectures were a lifesaver.", avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=150&auto=format&fit=crop" },
            ].map((r, i) => (
              <View key={i} style={styles.reviewCard}>
                <Ionicons name={"quote" as any} size={30} color="#E2E8F0" style={styles.quoteIcon} />
                <Text style={styles.reviewText}>"{r.review}"</Text>
                <View style={styles.reviewUser}>
                  <Image source={{ uri: r.avatar }} style={styles.reviewAvatar} />
                  <View>
                    <Text style={styles.reviewName}>{r.name}</Text>
                    <Text style={styles.reviewScore}>{r.score}</Text>
                  </View>
                </View>
              </View>
            ))}
          </ScrollView>
        </Animated.View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  
  hero: { paddingBottom: 60, position: "relative", overflow: "hidden", borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  decoCircle1: { position: "absolute", top: -50, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: "rgba(255,255,255,0.1)" },
  decoCircle2: { position: "absolute", bottom: -80, left: -40, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.08)" },
  
  navBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, marginBottom: 40 },
  logoWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  logoText: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFF" },
  loginBtn: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#FFF", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  loginBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" },

  heroContent: { paddingHorizontal: 20, alignItems: "center" },
  badge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginBottom: 16 },
  badgeText: { color: "#FFF", fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  heroTitle: { fontSize: 32, fontFamily: "Poppins_700Bold", color: "#FFF", textAlign: "center", lineHeight: 40, marginBottom: 16 },
  heroDesc: { fontSize: 14, fontFamily: "Poppins_400Regular", color: "rgba(255,255,255,0.85)", textAlign: "center", marginBottom: 30, paddingHorizontal: 10 },
  heroImage: { width: width - 40, height: 200, borderRadius: 24, borderWidth: 4, borderColor: "rgba(255,255,255,0.2)" },

  statsRow: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, marginTop: -16, zIndex: 10 },
  statCard: { backgroundColor: "#FFF", width: "31%", paddingVertical: 16, borderRadius: 16, alignItems: "center", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8, elevation: 3 },
  statVal: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#0EA5E9" },
  statLabel: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B" },

  section: { marginTop: 40, paddingHorizontal: 20 },
  sectionTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#0F172A", marginBottom: 20 },
  
  featureGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", gap: 16 },
  featureCard: { width: "47%", backgroundColor: "#FFF", padding: 16, borderRadius: 20, marginBottom: 16, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  featureIcon: { width: 48, height: 48, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  featureTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 6 },
  featureDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B", lineHeight: 18 },

  reviewScroll: { gap: 16, paddingRight: 20 },
  reviewCard: { backgroundColor: "#FFF", width: 280, padding: 24, borderRadius: 24, position: "relative", shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  quoteIcon: { position: "absolute", top: 16, right: 16, opacity: 0.5 },
  reviewText: { fontSize: 13, fontFamily: "Poppins_500Medium", color: "#334155", lineHeight: 22, fontStyle: "italic", marginBottom: 20, marginTop: 10 },
  reviewUser: { flexDirection: "row", alignItems: "center", gap: 12 },
  reviewAvatar: { width: 40, height: 40, borderRadius: 20 },
  reviewName: { fontSize: 14, fontFamily: "Poppins_700Bold", color: "#0F172A" },
  reviewScore: { fontSize: 11, fontFamily: "Poppins_600SemiBold", color: "#0EA5E9" },

  classScroll: { gap: 16, paddingRight: 20 },
  classCard: { backgroundColor: "#FFF", width: 160, padding: 16, borderRadius: 20, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, alignItems: "center" },
  classIconWrap: { width: 48, height: 48, borderRadius: 24, backgroundColor: "#E0F2FE", justifyContent: "center", alignItems: "center", marginBottom: 12 },
  classNameText: { fontSize: 14, fontFamily: "Poppins_700Bold", color: "#0F172A", textAlign: "center", marginBottom: 4 },
  classSubText: { fontSize: 11, fontFamily: "Poppins_500Medium", color: "#64748B", textAlign: "center" },
});



