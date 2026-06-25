import React, { useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { turso } from "../../lib/turso";
import DropdownSelector, { DropdownOption } from "../../components/DropdownSelector";

interface ClassItem {
  id: string;
  name: string;
  subject: string;
}

export default function AdminClasses() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const SUBJECT_OPTIONS: DropdownOption[] = [
    { id: "Accountancy", label: "Accountancy" },
    { id: "Business Studies", label: "Business Studies" },
    { id: "Economics", label: "Economics" },
    { id: "Mathematics", label: "Mathematics" },
    { id: "English", label: "English" },
    { id: "Computer Science", label: "Computer Science" },
    { id: "Physical Education", label: "Physical Education" },
    { id: "Physics", label: "Physics" },
    { id: "Chemistry", label: "Chemistry" },
    { id: "Biology", label: "Biology" },
  ];

  const fetchClasses = async () => {
    try {
      setLoadingList(true);
      const result = await turso.execute("SELECT id, name, subject FROM classes ORDER BY createdAt DESC");
      const data = result.rows.map(r => ({
        id: r[0] as string,
        name: r[1] as string,
        subject: r[2] as string
      }));
      setClasses(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchClasses();
    }, [])
  );

  const handleAddClass = async () => {
    if (!newClassName || !newSubject) {
      alert("Please fill all fields.");
      return;
    }
    try {
      setSubmitting(true);
      const id = Date.now().toString();
      const createdAt = new Date().toISOString();

      await turso.execute({
        sql: "INSERT INTO classes (id, name, subject, createdAt) VALUES (?, ?, ?, ?)",
        args: [id, newClassName, newSubject, createdAt]
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Class added successfully!");
      
      setShowAddForm(false);
      setNewClassName("");
      setNewSubject("");
      fetchClasses();
    } catch (e) {
      console.error(e);
      alert("Failed to add class.");
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================
  // ADD FORM VIEW
  // ==========================
  if (showAddForm) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
        <LinearGradient colors={["#DB2777", "#BE185D"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add New Class</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formCard}>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Class Name</Text>
              <TextInput style={styles.input} placeholder="e.g. Class 12 - Commerce" value={newClassName} onChangeText={setNewClassName} placeholderTextColor="#94A3B8" />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Subject(s)</Text>
              <TextInput style={styles.input} placeholder="e.g. Accountancy, Economics" value={newSubject} onChangeText={setNewSubject} placeholderTextColor="#94A3B8" />
            </View>

            <TouchableOpacity style={[styles.submitBtn, submitting && { opacity: 0.7 }]} onPress={handleAddClass} disabled={submitting}>
              {submitting ? (
                <Text style={styles.submitText}>Saving...</Text>
              ) : (
                <Text style={styles.submitText}>Save Class</Text>
              )}
            </TouchableOpacity>
            
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  // ==========================
  // LIST VIEW
  // ==========================
  return (
    <View style={styles.container}>
      <LinearGradient colors={["#DB2777", "#BE185D"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Manage Classes</Text>
          <View style={styles.headerRightBtns}>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setShowAddForm(true); }} style={styles.addBtn}>
              <Ionicons name="add" size={24} color="#DB2777" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput style={styles.searchInput} placeholder="Search classes..." placeholderTextColor="#94A3B8" />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>All Classes</Text>
          </View>
          <View style={styles.cardBlock}>
            {loadingList ? (
              <View style={{ padding: 20, alignItems: "center" }}><ActivityIndicator color="#DB2777" /></View>
            ) : classes.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No classes found.</Text>
              </View>
            ) : (
              classes.map((c, i) => (
                <View key={c.id} style={[styles.listItem, i === classes.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.listIcon, { backgroundColor: "#FCE7F3" }]}>
                    <Ionicons name="grid" size={20} color="#DB2777" />
                  </View>
                  <View style={styles.listTextWrap}>
                    <Text style={styles.listTitle}>{c.name}</Text>
                    <Text style={styles.listDesc}>{c.subject}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </Animated.View>
      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F4F6F8" }, 
  header: { paddingHorizontal: 20, paddingBottom: 16, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, position: "relative", overflow: "hidden" },
  decoCircle1: { position: "absolute", top: -50, right: -20, width: 180, height: 180, borderRadius: 90, backgroundColor: "rgba(255,255,255,0.15)" },
  decoCircle2: { position: "absolute", bottom: -40, left: -40, width: 120, height: 120, borderRadius: 60, backgroundColor: "rgba(255,255,255,0.1)" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10, zIndex: 2 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", color: "#FFFFFF" },
  headerRightBtns: { flexDirection: "row", gap: 10 },
  addBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#FFF", justifyContent: "center", alignItems: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  
  searchContainer: { marginTop: -12, paddingHorizontal: 20, zIndex: 10 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, gap: 10, shadowColor: "#DB2777", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.12, shadowRadius: 16, elevation: 5 },
  searchInput: { flex: 1, fontSize: 14, fontFamily: "Poppins_400Regular", color: "#0F172A", padding: 0 },

  scroll: { paddingBottom: 100, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  
  // FORM STYLES
  formScroll: { padding: 20, paddingBottom: 60 },
  formCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  
  submitBtn: { backgroundColor: "#DB2777", borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 10, shadowColor: "#DB2777", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
});




