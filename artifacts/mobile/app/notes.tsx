import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Platform,
  Modal,
  Alert,
  KeyboardAvoidingView,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp, Note } from "@/context/AppContext";
import { SubjectChip } from "@/components/SubjectChip";
import * as Haptics from "expo-haptics";

const SUBJECTS = ["All", "Accountancy", "Business Studies", "Economics", "Mathematics"];
const NOTE_COLORS = ["#EEF4FB", "#F0FBF6", "#F8F0FB", "#FBF6F0", "#F0F8FB"];

const SUBJECT_COLORS: Record<string, string> = {
  Accountancy: "#5B9BD5",
  "Business Studies": "#7B8EBF",
  Economics: "#5BAD9B",
  Mathematics: "#9B7BC4",
  English: "#BF7B5B",
};

export default function NotesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { notes, addNote, updateNote, deleteNote, user } = useApp();
  const { width } = useWindowDimensions();
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [showEditor, setShowEditor] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSubject, setNoteSubject] = useState("Accountancy");
  const [noteColor, setNoteColor] = useState(NOTE_COLORS[0]);
  const [search, setSearch] = useState("");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = notes.filter((n) => {
    const matchSub = selectedSubject === "All" || n.subject === selectedSubject;
    const matchSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.content.toLowerCase().includes(search.toLowerCase());
    return matchSub && matchSearch;
  });

  const openNew = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setNoteSubject("Accountancy");
    setNoteColor(NOTE_COLORS[0]);
    setShowEditor(true);
  };

  const openEdit = (note: Note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setNoteSubject(note.subject);
    setNoteColor(note.color);
    setShowEditor(true);
  };

  const handleSave = () => {
    if (!noteTitle.trim()) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editingNote) {
      updateNote(editingNote.id, noteTitle.trim(), noteContent.trim());
    } else {
      addNote({ title: noteTitle.trim(), content: noteContent.trim(), subject: noteSubject, color: noteColor });
    }
    setShowEditor(false);
  };

  const handleDelete = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    deleteNote(id);
  };

  const isWide = width >= 600;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 8, backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
          <Ionicons name="arrow-back" size={21} color={colors.foreground} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: colors.foreground }]}>My Notes</Text>
          <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>{notes.length} notes saved</Text>
        </View>
        <TouchableOpacity onPress={openNew} style={[styles.newBtn, { backgroundColor: colors.primary }]} activeOpacity={0.85}>
          <Ionicons name="add" size={18} color="#FFFFFF" />
          <Text style={styles.newBtnText}>New</Text>
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.muted, borderColor: colors.border }]}>
          <Ionicons name="search-outline" size={16} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search notes..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <Ionicons name="close-circle" size={16} color={colors.mutedForeground} onPress={() => setSearch("")} />
          )}
        </View>
      </View>

      {/* Subject chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={[styles.chipScroll, { backgroundColor: colors.card, borderBottomColor: colors.border }]} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 10 }}>
        {SUBJECTS.map((s) => (
          <SubjectChip key={s} label={s} selected={selectedSubject === s} onPress={() => setSelectedSubject(s)} />
        ))}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.grid, isWide && styles.gridWide, { paddingBottom: Platform.OS === "web" ? 80 : 80 }]}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No notes yet</Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>Tap "New" to create your first note</Text>
          </View>
        ) : (
          filtered.map((note) => {
            const subColor = SUBJECT_COLORS[note.subject] ?? colors.primary;
            return (
              <TouchableOpacity
                key={note.id}
                onPress={() => openEdit(note)}
                style={[styles.noteCard, { backgroundColor: note.color, borderColor: colors.border, width: isWide ? "48%" : "100%" as any }]}
                activeOpacity={0.85}
              >
                <View style={styles.noteCardTop}>
                  <View style={[styles.noteSubjectDot, { backgroundColor: subColor + "25" }]}>
                    <Text style={[styles.noteSubjectDotText, { color: subColor }]}>{note.subject[0]}</Text>
                  </View>
                  <Text style={[styles.noteSubject, { color: subColor }]}>{note.subject}</Text>
                  <TouchableOpacity onPress={() => handleDelete(note.id)} style={styles.deleteBtn} activeOpacity={0.7}>
                    <Ionicons name="trash-outline" size={15} color={colors.mutedForeground} />
                  </TouchableOpacity>
                </View>
                <Text style={[styles.noteTitle, { color: colors.foreground }]} numberOfLines={2}>{note.title}</Text>
                <Text style={[styles.noteContent, { color: colors.mutedForeground }]} numberOfLines={4}>{note.content}</Text>
                <View style={styles.noteFooter}>
                  <Ionicons name="time-outline" size={11} color={colors.mutedForeground} />
                  <Text style={[styles.noteDate, { color: colors.mutedForeground }]}>Updated {note.updatedAt}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Editor Modal */}
      <Modal visible={showEditor} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setShowEditor(false)}>
        <View style={[styles.modalContainer, { backgroundColor: noteColor }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={() => setShowEditor(false)}>
              <Ionicons name="close" size={22} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.foreground }]}>
              {editingNote ? "Edit Note" : "New Note"}
            </Text>
            <TouchableOpacity onPress={handleSave} style={[styles.saveBtn, { backgroundColor: colors.primary }]} activeOpacity={0.85}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
          </View>

          <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={styles.editorContent}>
              {/* Color & Subject pickers */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.colorRow} contentContainerStyle={{ gap: 8 }}>
                {NOTE_COLORS.map((c) => (
                  <TouchableOpacity
                    key={c}
                    onPress={() => setNoteColor(c)}
                    style={[styles.colorDot, { backgroundColor: c, borderWidth: noteColor === c ? 2 : 0, borderColor: colors.primary }]}
                  />
                ))}
              </ScrollView>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subjectRow} contentContainerStyle={{ gap: 8 }}>
                {SUBJECTS.slice(1).map((s) => (
                  <SubjectChip key={s} label={s} selected={noteSubject === s} onPress={() => setNoteSubject(s)} color={SUBJECT_COLORS[s]} />
                ))}
              </ScrollView>
              <TextInput
                value={noteTitle}
                onChangeText={setNoteTitle}
                placeholder="Note title..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.editorTitle, { color: colors.foreground, borderBottomColor: colors.border }]}
              />
              <TextInput
                value={noteContent}
                onChangeText={setNoteContent}
                placeholder="Start writing..."
                placeholderTextColor={colors.mutedForeground}
                style={[styles.editorBody, { color: colors.foreground }]}
                multiline
                textAlignVertical="top"
                autoFocus={!editingNote}
              />
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 16, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: "center", alignItems: "center" },
  headerText: { flex: 1 },
  title: { fontSize: 20, fontFamily: "Poppins_700Bold" },
  subtitle: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  newBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 22 },
  newBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  searchWrap: { paddingHorizontal: 16, paddingVertical: 10, borderBottomWidth: 1 },
  searchBox: { flexDirection: "row", alignItems: "center", gap: 8, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9 },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  chipScroll: { maxHeight: 56, borderBottomWidth: 1 },
  grid: { padding: 16, gap: 12 },
  gridWide: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  emptyState: { alignItems: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  noteCard: { borderRadius: 18, borderWidth: 1, padding: 14, gap: 8, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.04, shadowRadius: 4, elevation: 1 },
  noteCardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  noteSubjectDot: { width: 28, height: 28, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  noteSubjectDotText: { fontSize: 12, fontFamily: "Poppins_700Bold" },
  noteSubject: { flex: 1, fontSize: 10, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.5 },
  deleteBtn: { padding: 4 },
  noteTitle: { fontSize: 15, fontFamily: "Poppins_700Bold", lineHeight: 21 },
  noteContent: { fontSize: 13, fontFamily: "Poppins_400Regular", lineHeight: 19 },
  noteFooter: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  noteDate: { fontSize: 10, fontFamily: "Poppins_400Regular" },
  modalContainer: { flex: 1 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  modalTitle: { fontSize: 16, fontFamily: "Poppins_700Bold" },
  saveBtn: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: 20 },
  saveBtnText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  editorContent: { padding: 16, gap: 12, paddingBottom: 200 },
  colorRow: { maxHeight: 40 },
  colorDot: { width: 30, height: 30, borderRadius: 15 },
  subjectRow: { maxHeight: 46 },
  editorTitle: { fontSize: 20, fontFamily: "Poppins_700Bold", paddingVertical: 10, borderBottomWidth: 1 },
  editorBody: { fontSize: 15, fontFamily: "Poppins_400Regular", lineHeight: 24, minHeight: 300 },
});
