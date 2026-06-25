import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, { FadeInDown } from "react-native-reanimated";

export interface TimetableClass {
  id: string;
  title: string;
  batch: string;
  startTime: string;
  endTime: string;
  type: string;
  color: string;
  teacherName?: string;
  dayOfWeek?: string;
  date?: string;
}

interface WeeklyTimetableGridProps {
  schedule: TimetableClass[];
  onClassPress?: (cls: TimetableClass) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const timeToMinutes = (timeStr: string) => {
  if (!timeStr) return 0;
  const parts = timeStr.split(" ");
  if (parts.length !== 2) return 0;
  const [time, modifier] = parts;
  let [hours, minutes] = time.split(":").map(Number);
  if (hours === 12) hours = 0;
  if (modifier === "PM") hours += 12;
  return hours * 60 + minutes;
};

export default function WeeklyTimetableGrid({ schedule, onClassPress }: WeeklyTimetableGridProps) {
  const currentDayStr = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState<string>(DAYS.includes(currentDayStr) ? currentDayStr : "Monday");

  const classesToday = schedule.filter(c => {
    if (c.type === "recurring" && c.dayOfWeek === selectedDay) return true;
    if (c.type === "one-time" && c.date) {
      const d = new Date(c.date);
      const daysList = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      if (daysList[d.getDay()] === selectedDay) return true;
    }
    return false;
  }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  return (
    <View style={styles.container}>
      {/* Day Selector */}
      <View style={styles.dayPickerContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPickerScroll}>
          {DAYS.map(day => (
            <TouchableOpacity 
              key={day} 
              style={[styles.dayChip, selectedDay === day && styles.dayChipActive]}
              onPress={() => setSelectedDay(day)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayChipText, selectedDay === day && styles.dayChipTextActive]}>
                {day.substring(0, 3)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Class List */}
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContainer}>
        {classesToday.length === 0 ? (
          <Animated.View entering={FadeInDown.springify()} style={styles.emptyContainer}>
            <View style={styles.emptyIconWrap}>
              <Ionicons name="cafe-outline" size={48} color="#94A3B8" />
            </View>
            <Text style={styles.emptyTitle}>No Classes</Text>
            <Text style={styles.emptyText}>You have a free day on {selectedDay}.</Text>
          </Animated.View>
        ) : (
          classesToday.map((cls, idx) => (
            <Animated.View key={cls.id} entering={FadeInDown.delay(idx * 100).springify()}>
              <TouchableOpacity 
                style={[styles.classCard, { borderLeftColor: cls.color || "#0EA5E9" }]}
                onPress={() => onClassPress && onClassPress(cls)}
                activeOpacity={onClassPress ? 0.7 : 1}
              >
                <View style={[styles.timeBox, { backgroundColor: (cls.color || "#0EA5E9") + "15" }]}>
                  <Ionicons name="time" size={24} color={cls.color || "#0EA5E9"} />
                </View>
                <View style={styles.classInfo}>
                  <Text style={styles.classTitle} numberOfLines={1}>{cls.title}</Text>
                  <View style={styles.classMetaRow}>
                    <Ionicons name="calendar-outline" size={14} color="#64748B" />
                    <Text style={styles.classTime}>{cls.startTime} - {cls.endTime}</Text>
                  </View>
                  <View style={styles.classMetaRow}>
                    <Ionicons name="people-outline" size={14} color="#64748B" />
                    <Text style={styles.classBatch}>{cls.batch}</Text>
                    {cls.teacherName && (
                      <Text style={styles.classTeacher}> • {cls.teacherName}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  dayPickerContainer: {
    marginBottom: 16,
  },
  dayPickerScroll: {
    paddingHorizontal: 4,
    gap: 12,
  },
  dayChip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9"
  },
  dayChipActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0EA5E9"
  },
  dayChipText: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 14,
    color: "#64748B",
  },
  dayChipTextActive: {
    color: "#FFFFFF",
  },
  listContainer: {
    paddingBottom: 40,
  },
  classCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: "#94A3B8",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    gap: 16
  },
  timeBox: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  classInfo: {
    flex: 1,
    gap: 4
  },
  classTitle: {
    fontFamily: "Poppins_600SemiBold",
    fontSize: 15,
    color: "#0F172A",
    marginBottom: 2
  },
  classMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  classTime: {
    fontFamily: "Poppins_500Medium",
    fontSize: 13,
    color: "#64748B",
  },
  classBatch: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#64748B",
  },
  classTeacher: {
    fontFamily: "Poppins_500Medium",
    fontSize: 12,
    color: "#94A3B8",
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
    borderStyle: "dashed"
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16
  },
  emptyTitle: {
    fontFamily: "Poppins_700Bold",
    fontSize: 18,
    color: "#0F172A",
    marginBottom: 4
  },
  emptyText: {
    fontFamily: "Poppins_400Regular",
    fontSize: 14,
    color: "#64748B"
  }
});
