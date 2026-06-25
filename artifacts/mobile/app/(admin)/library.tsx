import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as DocumentPicker from "expo-document-picker";
import { turso } from "../../lib/turso";
import { uploadToCloudinary } from "../../lib/cloudinary";
import DropdownSelector, { DropdownOption } from "../../components/DropdownSelector";

interface LibraryItem {
  id: string;
  title: string;
  description: string;
  type: "pdf" | "youtube";
  url: string;
  subject: string;
}

export default function AdminLibrary() {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [items, setItems] = useState<LibraryItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<"pdf" | "youtube">("youtube");
  const [newUrl, setNewUrl] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [selectedFile, setSelectedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

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

  const fetchLibrary = async () => {
    try {
      setLoadingList(true);
      const result = await turso.execute("SELECT id, title, description, type, url, subject FROM library ORDER BY createdAt DESC");
      const data = result.rows.map(r => ({
        id: r[0] as string,
        title: r[1] as string,
        description: r[2] as string,
        type: r[3] as "pdf" | "youtube",
        url: r[4] as string,
        subject: r[5] as string
      }));
      setItems(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({ type: "application/pdf" });
      if (!result.canceled && result.assets.length > 0) {
        setSelectedFile(result.assets[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddResource = async () => {
    if (!newTitle || !newSubject) {
      alert("Please fill Title and Subject.");
      return;
    }
    
    let finalUrl = newUrl;

    try {
      setIsUploading(true);
      
      if (newType === "pdf") {
        if (!selectedFile) {
          alert("Please select a PDF file.");
          setIsUploading(false);
          return;
        }
        finalUrl = await uploadToCloudinary(selectedFile.uri, selectedFile.mimeType || "application/pdf", selectedFile.name, "library", "admin");
        if (!finalUrl) throw new Error("Upload failed");
      } else {
        if (!finalUrl.includes("youtube") && !finalUrl.includes("youtu.be")) {
          alert("Please enter a valid YouTube link.");
          setIsUploading(false);
          return;
        }
      }

      const id = Date.now().toString();
      const createdAt = new Date().toISOString();

      await turso.execute({
        sql: "INSERT INTO library (id, title, description, type, url, subject, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
        args: [id, newTitle, newDesc, newType, finalUrl, newSubject, createdAt]
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      alert("Resource added successfully!");
      
      setShowAddForm(false);
      setNewTitle("");
      setNewDesc("");
      setNewUrl("");
      setNewSubject("");
      setSelectedFile(null);
      fetchLibrary();
    } catch (e) {
      console.error(e);
      alert("Failed to add resource.");
    } finally {
      setIsUploading(false);
    }
  };

  // ==========================
  // ADD FORM VIEW
  // ==========================
  if (showAddForm) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1, backgroundColor: "#F4F6F8" }}>
        <LinearGradient colors={["#059669", "#047857"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={styles.decoCircle1} />
          <View style={styles.decoCircle2} />
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => setShowAddForm(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Library Resource</Text>
            <View style={{ width: 40 }} />
          </View>
        </LinearGradient>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formScroll}>
          <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.formCard}>
            
            <View style={styles.typeSwitcher}>
              <TouchableOpacity style={[styles.typeBtn, newType === "youtube" && styles.typeBtnActiveYt]} onPress={() => setNewType("youtube")}>
                <Ionicons name="logo-youtube" size={18} color={newType === "youtube" ? "#FFF" : "#EF4444"} />
                <Text style={[styles.typeBtnText, newType === "youtube" && {color: "#FFF"}]}>YouTube Video</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.typeBtn, newType === "pdf" && styles.typeBtnActivePdf]} onPress={() => setNewType("pdf")}>
                <Ionicons name="document" size={18} color={newType === "pdf" ? "#FFF" : "#4F46E5"} />
                <Text style={[styles.typeBtnText, newType === "pdf" && {color: "#FFF"}]}>PDF Book</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Title</Text>
              <TextInput style={styles.input} placeholder="e.g. Basics of Economics" value={newTitle} onChangeText={setNewTitle} placeholderTextColor="#94A3B8" />
            </View>
            
            <DropdownSelector
              label="Subject"
              placeholder="Select a subject..."
              options={SUBJECT_OPTIONS}
              selectedValue={newSubject}
              onSelect={setNewSubject}
              icon="book"
            />

            {newType === "youtube" ? (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>YouTube Link</Text>
                <TextInput style={styles.input} placeholder="Paste youtube url here..." value={newUrl} onChangeText={setNewUrl} autoCapitalize="none" placeholderTextColor="#94A3B8" />
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Upload PDF Book</Text>
                <TouchableOpacity style={styles.uploadBtn} onPress={handlePickFile}>
                  <Ionicons name={selectedFile ? "checkmark-circle" : "cloud-upload"} size={24} color={selectedFile ? "#10B981" : "#4F46E5"} />
                  <Text style={[styles.uploadText, selectedFile && {color: "#10B981"}]}>{selectedFile ? selectedFile.name : "Select PDF File from device"}</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: newType === "youtube" ? "#EF4444" : "#4F46E5" }, isUploading && { opacity: 0.7 }]} onPress={handleAddResource} disabled={isUploading}>
              {isUploading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.submitText}>Save Resource</Text>}
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
      <LinearGradient colors={["#059669", "#047857"]} style={[styles.header, { paddingTop: Math.max(insets.top, 40) + 30 }]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <View style={styles.decoCircle1} />
        <View style={styles.decoCircle2} />
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Digital Library (Admin)</Text>
          <View style={styles.headerRightBtns}>
            <TouchableOpacity onPress={() => { Haptics.selectionAsync(); setShowAddForm(true); }} style={styles.addBtn}>
              <Ionicons name="add" size={24} color="#059669" />
            </TouchableOpacity>
          </View>
        </View>
      </LinearGradient>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Library Resources</Text>
          </View>
          <View style={styles.cardBlock}>
            {loadingList ? (
              <View style={{ padding: 20, alignItems: "center" }}><ActivityIndicator color="#059669" /></View>
            ) : items.length === 0 ? (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ fontFamily: "Poppins_500Medium", color: "#94A3B8" }}>No resources added yet.</Text>
              </View>
            ) : (
              items.map((it, i) => (
                <View key={it.id} style={[styles.listItem, i === items.length - 1 && { borderBottomWidth: 0 }]}>
                  <View style={[styles.listIcon, { backgroundColor: it.type === "youtube" ? "#FEE2E2" : "#E0E7FF" }]}>
                    <Ionicons name={it.type === "youtube" ? "logo-youtube" : "document"} size={20} color={it.type === "youtube" ? "#EF4444" : "#4F46E5"} />
                  </View>
                  <View style={styles.listTextWrap}>
                    <Text style={styles.listTitle}>{it.title}</Text>
                    <Text style={styles.listDesc}>{it.subject} • {it.type.toUpperCase()}</Text>
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
  
  scroll: { paddingBottom: 100, paddingTop: 20 },
  section: { paddingHorizontal: 20, marginBottom: 30 },
  sectionHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", color: "#0F172A", letterSpacing: -0.5 },

  cardBlock: { backgroundColor: "#FFFFFF", borderRadius: 24, paddingHorizontal: 18, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.06, shadowRadius: 12, elevation: 3 },
  listItem: { flexDirection: "row", alignItems: "center", paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9", gap: 14 },
  listIcon: { width: 44, height: 44, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  listTextWrap: { flex: 1 },
  listTitle: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#0F172A", marginBottom: 2 },
  listDesc: { fontSize: 12, fontFamily: "Poppins_400Regular", color: "#64748B" },
  
  // FORM STYLES
  formScroll: { padding: 20, paddingBottom: 60 },
  formCard: { backgroundColor: "#FFF", borderRadius: 24, padding: 24, shadowColor: "#94A3B8", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.08, shadowRadius: 16, elevation: 4 },

  typeSwitcher: { flexDirection: "row", backgroundColor: "#F1F5F9", borderRadius: 12, padding: 4, marginBottom: 20 },
  typeBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 10, borderRadius: 10, gap: 6 },
  typeBtnActiveYt: { backgroundColor: "#EF4444", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  typeBtnActivePdf: { backgroundColor: "#4F46E5", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  typeBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold", color: "#64748B" },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Poppins_600SemiBold", color: "#334155", marginBottom: 8, marginLeft: 4 },
  input: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 16, fontSize: 15, fontFamily: "Poppins_400Regular", color: "#0F172A" },
  
  uploadBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#EEF2FF", borderWidth: 1, borderColor: "#C7D2FE", borderStyle: "dashed", borderRadius: 16, padding: 24, justifyContent: "center", gap: 10 },
  uploadText: { fontSize: 14, fontFamily: "Poppins_500Medium", color: "#4F46E5" },

  submitBtn: { borderRadius: 16, paddingVertical: 18, alignItems: "center", marginTop: 10, shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4 },
  submitText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
});


