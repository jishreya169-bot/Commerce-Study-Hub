import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { CourseCard } from "@/components/CourseCard";
import { SubjectChip } from "@/components/SubjectChip";

const SUBJECTS = ["All", "Accountancy", "Business Studies", "Economics", "Mathematics", "English"];

export default function CoursesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { courses } = useApp();
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"enrolled" | "explore">("enrolled");

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  const filtered = courses.filter((c) => {
    const matchSubject = selectedSubject === "All" || c.subject === selectedSubject;
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "enrolled" ? c.enrolled : !c.enrolled;
    return matchSubject && matchSearch && matchTab;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: topPad + 12, backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.foreground }]}>My Courses</Text>
        {/* Tab Toggle */}
        <View style={[styles.tabToggle, { backgroundColor: colors.muted }]}>
          <View
            style={[
              styles.tabBtn,
              tab === "enrolled" && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              onPress={() => setTab("enrolled")}
              style={[styles.tabBtnText, { color: tab === "enrolled" ? "#FFFFFF" : colors.mutedForeground }]}
            >
              Enrolled
            </Text>
          </View>
          <View
            style={[
              styles.tabBtn,
              tab === "explore" && { backgroundColor: colors.primary },
            ]}
          >
            <Text
              onPress={() => setTab("explore")}
              style={[styles.tabBtnText, { color: tab === "explore" ? "#FFFFFF" : colors.mutedForeground }]}
            >
              Explore
            </Text>
          </View>
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchContainer, { backgroundColor: colors.muted, borderColor: colors.border, marginHorizontal: 20, marginBottom: 12 }]}>
        <Ionicons name="search" size={18} color={colors.mutedForeground} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search courses..."
          placeholderTextColor={colors.mutedForeground}
          style={[styles.searchInput, { color: colors.foreground, fontFamily: "Poppins_400Regular" }]}
        />
        {search.length > 0 && (
          <Ionicons name="close-circle" size={18} color={colors.mutedForeground} onPress={() => setSearch("")} />
        )}
      </View>

      {/* Subject Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipScroll} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        {SUBJECTS.map((s) => (
          <SubjectChip
            key={s}
            label={s}
            selected={selectedSubject === s}
            onPress={() => setSelectedSubject(s)}
          />
        ))}
      </ScrollView>

      {/* Course List */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.list, { paddingBottom: Platform.OS === "web" ? 100 : 100 }]}
      >
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={48} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No courses found</Text>
            <Text style={[styles.emptySubtitle, { color: colors.mutedForeground }]}>
              {tab === "enrolled" ? "Enroll in a course to get started" : "Try a different filter"}
            </Text>
          </View>
        ) : (
          filtered.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onPress={() => router.push(`/course/${course.id}`)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { paddingHorizontal: 20, paddingBottom: 12 },
  title: { fontSize: 24, fontFamily: "Poppins_700Bold", marginBottom: 12 },
  tabToggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
    alignSelf: "flex-start",
  },
  tabBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
  },
  tabBtnText: { fontSize: 13, fontFamily: "Poppins_600SemiBold" },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 14 },
  chipScroll: { maxHeight: 48 },
  list: { paddingHorizontal: 20, paddingTop: 4 },
  emptyState: { alignItems: "center", justifyContent: "center", paddingTop: 60, gap: 10 },
  emptyTitle: { fontSize: 17, fontFamily: "Poppins_600SemiBold" },
  emptySubtitle: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
});
