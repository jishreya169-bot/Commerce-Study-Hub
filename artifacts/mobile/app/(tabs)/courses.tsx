import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import { CourseCard } from "@/components/CourseCard";
import { SubjectChip } from "@/components/SubjectChip";
import { CourseCardSkeleton } from "@/components/Skeleton";

const SUBJECTS = ["All", "Accountancy", "Business Studies", "Economics", "Mathematics", "English"];

export default function CoursesScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { courses } = useApp();
  const { width } = useWindowDimensions();
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<"enrolled" | "explore">("enrolled");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 900);
    return () => clearTimeout(t);
  }, []);

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const isWide = width >= 600;

  const filtered = courses.filter((c) => {
    const matchSub = selectedSubject === "All" || c.subject === selectedSubject;
    const matchSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.instructor.toLowerCase().includes(search.toLowerCase());
    const matchTab = tab === "enrolled" ? c.enrolled : !c.enrolled;
    return matchSub && matchSearch && matchTab;
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: topPad + 10, backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.title, { color: colors.foreground }]}>My Courses</Text>
        <View style={[styles.toggle, { backgroundColor: colors.secondary }]}>
          {(["enrolled", "explore"] as const).map((t) => (
            <Text
              key={t}
              onPress={() => setTab(t)}
              style={[
                styles.toggleOption,
                {
                  backgroundColor: tab === t ? colors.primary : "transparent",
                  color: tab === t ? "#FFFFFF" : colors.mutedForeground,
                },
              ]}
            >
              {t === "enrolled" ? "Enrolled" : "Explore"}
            </Text>
          ))}
        </View>
      </View>

      {/* Search */}
      <View style={[styles.searchWrap, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View
          style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}
        >
          <Ionicons name="search-outline" size={17} color={colors.mutedForeground} />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search courses or instructors..."
            placeholderTextColor={colors.mutedForeground}
            style={[styles.searchInput, { color: colors.foreground }]}
          />
          {search.length > 0 && (
            <Ionicons
              name="close-circle"
              size={17}
              color={colors.mutedForeground}
              onPress={() => setSearch("")}
            />
          )}
        </View>
      </View>

      {/* Subject Chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={[styles.chipRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
      >
        {SUBJECTS.map((s) => (
          <SubjectChip
            key={s}
            label={s}
            selected={selectedSubject === s}
            onPress={() => setSelectedSubject(s)}
          />
        ))}
      </ScrollView>

      {/* Results count */}
      {!loading && (
        <View style={[styles.countBar, { backgroundColor: colors.background }]}>
          <Text style={[styles.countText, { color: colors.mutedForeground }]}>
            {filtered.length} {filtered.length === 1 ? "course" : "courses"} found
          </Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.list,
          isWide && styles.listWide,
          { paddingBottom: Platform.OS === "web" ? 110 : 110 },
        ]}
      >
        {loading ? (
          [1, 2, 3].map((i) => <CourseCardSkeleton key={i} />)
        ) : filtered.length === 0 ? (
          <View style={[styles.empty, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Ionicons name="book-outline" size={44} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.mutedForeground }]}>No courses found</Text>
            <Text style={[styles.emptyHint, { color: colors.mutedForeground }]}>
              {tab === "enrolled" ? "Enroll in a course to get started" : "Try a different filter"}
            </Text>
          </View>
        ) : (
          filtered.map((c) => (
            <CourseCard key={c.id} course={c} onPress={() => router.push(`/course/${c.id}`)} />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  title: { fontSize: 22, fontFamily: "Poppins_700Bold" },
  toggle: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 3,
  },
  toggleOption: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 10,
    fontSize: 12,
    fontFamily: "Poppins_600SemiBold",
    overflow: "hidden",
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 13, fontFamily: "Poppins_400Regular" },
  chipRow: { maxHeight: 56, borderBottomWidth: 1 },
  countBar: { paddingHorizontal: 20, paddingVertical: 8 },
  countText: { fontSize: 12, fontFamily: "Poppins_400Regular" },
  list: { paddingHorizontal: 20, paddingTop: 10 },
  listWide: { flexDirection: "row", flexWrap: "wrap", gap: 14 },
  empty: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 36,
    alignItems: "center",
    gap: 10,
    marginTop: 20,
  },
  emptyTitle: { fontSize: 16, fontFamily: "Poppins_600SemiBold" },
  emptyHint: { fontSize: 13, fontFamily: "Poppins_400Regular", textAlign: "center" },
});
