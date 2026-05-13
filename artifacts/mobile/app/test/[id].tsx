import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useColors } from "@/hooks/useColors";
import { useApp } from "@/context/AppContext";
import * as Haptics from "expo-haptics";

export default function TestScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { tests, saveTestResult } = useApp();

  const test = tests.find((t) => t.id === id);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  if (!test) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={[styles.errorText, { color: colors.mutedForeground }]}>Test not found</Text>
      </View>
    );
  }

  const SUBJECT_COLORS: Record<string, string> = {
    Accountancy: "#6200EE",
    Economics: "#00897B",
    "Business Studies": "#0288D1",
    Mathematics: "#AD1457",
    English: "#E65100",
  };
  const subjectColor = SUBJECT_COLORS[test.subject] ?? colors.primary;

  const questions = test.questions.slice(0, 5);

  const handleSubmit = async () => {
    let correct = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.correct) correct++;
    });
    const finalScore = Math.round((correct / questions.length) * test.maxScore);
    setScore(finalScore);
    setSubmitted(true);
    await saveTestResult(test.id, finalScore);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!started) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="arrow-back" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Test Details</Text>
        </View>

        <ScrollView contentContainerStyle={[styles.introContent, { paddingBottom: Platform.OS === "web" ? 100 : 60 }]}>
          <View style={[styles.introBadge, { backgroundColor: subjectColor }]}>
            <Ionicons name="clipboard" size={40} color="rgba(255,255,255,0.3)" />
          </View>
          <Text style={[styles.introSubject, { color: subjectColor }]}>{test.subject}</Text>
          <Text style={[styles.introTitle, { color: colors.foreground }]}>{test.title}</Text>

          <View style={[styles.introStats, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <IntroStat icon="help-circle" label="Questions" value={`${Math.min(test.totalQuestions, 5)}`} color={subjectColor} colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <IntroStat icon="time" label="Duration" value={test.duration} color={subjectColor} colors={colors} />
            <View style={[styles.statDivider, { backgroundColor: colors.border }]} />
            <IntroStat icon="bar-chart" label="Max Score" value={`${test.maxScore}`} color={subjectColor} colors={colors} />
          </View>

          {test.attempted && test.score !== undefined && (
            <View style={[styles.prevResult, { backgroundColor: colors.success + "15", borderColor: colors.success + "30" }]}>
              <Ionicons name="checkmark-circle" size={20} color={colors.success} />
              <Text style={[styles.prevResultText, { color: colors.foreground }]}>
                Previous Score: <Text style={{ color: colors.success, fontFamily: "Poppins_700Bold" }}>{test.score}/{test.maxScore}</Text>
              </Text>
            </View>
          )}

          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              setStarted(true);
            }}
            style={[styles.startBtn, { backgroundColor: subjectColor }]}
            activeOpacity={0.85}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.startBtnText}>{test.attempted ? "Retake Test" : "Start Test"}</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  if (submitted) {
    const scorePercent = Math.round((score / test.maxScore) * 100);
    const passed = scorePercent >= 40;

    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { paddingTop: topPad + 8, borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} activeOpacity={0.8}>
            <Ionicons name="close" size={22} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.foreground }]}>Results</Text>
        </View>

        <ScrollView contentContainerStyle={[styles.resultContent, { paddingBottom: Platform.OS === "web" ? 100 : 60 }]}>
          <View style={[styles.scoreCircle, { backgroundColor: (passed ? colors.success : colors.destructive) + "15", borderColor: passed ? colors.success : colors.destructive }]}>
            <Text style={[styles.scorePercent, { color: passed ? colors.success : colors.destructive }]}>{scorePercent}%</Text>
            <Text style={[styles.scoreLabel, { color: colors.mutedForeground }]}>{score}/{test.maxScore} Points</Text>
          </View>
          <Text style={[styles.resultTitle, { color: colors.foreground }]}>
            {passed ? "Well Done!" : "Keep Practising!"}
          </Text>
          <Text style={[styles.resultSubtitle, { color: colors.mutedForeground }]}>
            {passed ? "You've cleared this test. Review mistakes to score higher next time." : "Don't give up! Review the chapter and try again."}
          </Text>

          {/* Answer Review */}
          <Text style={[styles.reviewTitle, { color: colors.foreground }]}>Answer Review</Text>
          {questions.map((q, idx) => {
            const userAns = answers[q.id];
            const isCorrect = userAns === q.correct;
            return (
              <View key={q.id} style={[styles.reviewCard, { backgroundColor: colors.card, borderColor: isCorrect ? colors.success : colors.destructive, borderLeftWidth: 3 }]}>
                <View style={styles.reviewHeader}>
                  <Text style={[styles.reviewQNum, { color: colors.mutedForeground }]}>Q{idx + 1}</Text>
                  <Ionicons name={isCorrect ? "checkmark-circle" : "close-circle"} size={18} color={isCorrect ? colors.success : colors.destructive} />
                </View>
                <Text style={[styles.reviewQText, { color: colors.foreground }]}>{q.text}</Text>
                <Text style={[styles.reviewAnswer, { color: colors.success }]}>Correct: {q.options[q.correct]}</Text>
                {!isCorrect && userAns !== undefined && (
                  <Text style={[styles.reviewAnswer, { color: colors.destructive }]}>Your answer: {q.options[userAns]}</Text>
                )}
              </View>
            );
          })}

          <TouchableOpacity onPress={() => router.back()} style={[styles.doneBtn, { backgroundColor: subjectColor }]} activeOpacity={0.85}>
            <Text style={styles.doneBtnText}>Done</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    );
  }

  const question = questions[currentQ];
  const allAnswered = questions.every((q) => answers[q.id] !== undefined);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.testHeader, { paddingTop: topPad + 8, backgroundColor: subjectColor }]}>
        <View style={styles.testHeaderRow}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.8}>
            <Ionicons name="close" size={22} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
          <View style={styles.qProgress}>
            <Text style={styles.qProgressText}>{currentQ + 1} / {questions.length}</Text>
          </View>
          <Text style={styles.testHeaderSubject}>{test.subject}</Text>
        </View>
        <View style={[styles.testProgressBg]}>
          <View style={[styles.testProgressFill, { width: `${((currentQ + 1) / questions.length) * 100}%` as any }]} />
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.testContent, { paddingBottom: Platform.OS === "web" ? 100 : 60 }]}>
        <Text style={[styles.questionText, { color: colors.foreground }]}>{question.text}</Text>

        {question.options.map((opt, idx) => {
          const isSelected = answers[question.id] === idx;
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                Haptics.selectionAsync();
                setAnswers({ ...answers, [question.id]: idx });
              }}
              style={[
                styles.optionCard,
                {
                  backgroundColor: isSelected ? subjectColor : colors.card,
                  borderColor: isSelected ? subjectColor : colors.border,
                },
              ]}
              activeOpacity={0.8}
            >
              <View style={[styles.optionIndex, { backgroundColor: isSelected ? "rgba(255,255,255,0.2)" : colors.muted }]}>
                <Text style={[styles.optionIndexText, { color: isSelected ? "#FFFFFF" : colors.mutedForeground }]}>
                  {String.fromCharCode(65 + idx)}
                </Text>
              </View>
              <Text style={[styles.optionText, { color: isSelected ? "#FFFFFF" : colors.foreground }]}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Navigation */}
      <View style={[styles.navBar, { backgroundColor: colors.background, borderTopColor: colors.border, paddingBottom: Platform.OS === "web" ? 34 : insets.bottom + 10 }]}>
        <TouchableOpacity
          onPress={() => setCurrentQ(Math.max(0, currentQ - 1))}
          disabled={currentQ === 0}
          style={[styles.navBtn, { backgroundColor: colors.muted, opacity: currentQ === 0 ? 0.4 : 1 }]}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={20} color={colors.foreground} />
        </TouchableOpacity>

        {currentQ < questions.length - 1 ? (
          <TouchableOpacity
            onPress={() => setCurrentQ(Math.min(questions.length - 1, currentQ + 1))}
            style={[styles.navBtnPrimary, { backgroundColor: subjectColor }]}
            activeOpacity={0.85}
          >
            <Text style={styles.navBtnText}>Next</Text>
            <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!allAnswered}
            style={[styles.navBtnPrimary, { backgroundColor: subjectColor, opacity: allAnswered ? 1 : 0.5 }]}
            activeOpacity={0.85}
          >
            <Ionicons name="checkmark" size={20} color="#FFFFFF" />
            <Text style={styles.navBtnText}>Submit</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

function IntroStat({ icon, label, value, color, colors }: any) {
  return (
    <View style={styles.introStat}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={[styles.introStatValue, { color: colors.foreground }]}>{value}</Text>
      <Text style={[styles.introStatLabel, { color: colors.mutedForeground }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  backBtn: { width: 38, height: 38, borderRadius: 19, justifyContent: "center", alignItems: "center" },
  headerTitle: { fontSize: 17, fontFamily: "Poppins_700Bold" },
  introContent: { padding: 24, alignItems: "center", gap: 14 },
  introBadge: { width: 90, height: 90, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  introSubject: { fontSize: 12, fontFamily: "Poppins_600SemiBold", textTransform: "uppercase", letterSpacing: 0.8 },
  introTitle: { fontSize: 22, fontFamily: "Poppins_700Bold", textAlign: "center" },
  introStats: {
    flexDirection: "row",
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    width: "100%",
    alignItems: "center",
  },
  introStat: { flex: 1, alignItems: "center", gap: 4 },
  introStatValue: { fontSize: 18, fontFamily: "Poppins_700Bold" },
  introStatLabel: { fontSize: 11, fontFamily: "Poppins_400Regular" },
  statDivider: { width: 1, height: 36 },
  prevResult: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    width: "100%",
  },
  prevResultText: { fontSize: 14, fontFamily: "Poppins_500Medium" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderRadius: 16,
    paddingVertical: 15,
    width: "100%",
    marginTop: 8,
  },
  startBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
  resultContent: { padding: 24, alignItems: "center", gap: 14 },
  scoreCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    gap: 4,
    marginBottom: 4,
  },
  scorePercent: { fontSize: 36, fontFamily: "Poppins_700Bold" },
  scoreLabel: { fontSize: 13, fontFamily: "Poppins_400Regular" },
  resultTitle: { fontSize: 24, fontFamily: "Poppins_700Bold" },
  resultSubtitle: { fontSize: 14, fontFamily: "Poppins_400Regular", textAlign: "center", lineHeight: 22 },
  reviewTitle: { fontSize: 18, fontFamily: "Poppins_700Bold", alignSelf: "flex-start", marginTop: 4 },
  reviewCard: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    width: "100%",
  },
  reviewHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  reviewQNum: { fontSize: 12, fontFamily: "Poppins_600SemiBold" },
  reviewQText: { fontSize: 13, fontFamily: "Poppins_500Medium", lineHeight: 19 },
  reviewAnswer: { fontSize: 12, fontFamily: "Poppins_500Medium" },
  doneBtn: {
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: "center",
    width: "100%",
    marginTop: 8,
  },
  doneBtnText: { color: "#FFFFFF", fontSize: 16, fontFamily: "Poppins_700Bold" },
  testHeader: { padding: 16, gap: 12 },
  testHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  qProgress: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  qProgressText: { color: "#FFFFFF", fontSize: 13, fontFamily: "Poppins_700Bold" },
  testHeaderSubject: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Poppins_500Medium" },
  testProgressBg: { height: 5, borderRadius: 3, backgroundColor: "rgba(255,255,255,0.3)", overflow: "hidden" },
  testProgressFill: { height: 5, borderRadius: 3, backgroundColor: "#FFFFFF" },
  testContent: { padding: 20, gap: 12 },
  questionText: { fontSize: 17, fontFamily: "Poppins_600SemiBold", lineHeight: 26, marginBottom: 8 },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
  },
  optionIndex: { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  optionIndexText: { fontSize: 14, fontFamily: "Poppins_700Bold" },
  optionText: { flex: 1, fontSize: 14, fontFamily: "Poppins_500Medium", lineHeight: 20 },
  navBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    gap: 12,
  },
  navBtn: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  navBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    paddingVertical: 13,
  },
  navBtnText: { color: "#FFFFFF", fontSize: 15, fontFamily: "Poppins_700Bold" },
  errorText: { fontSize: 16, fontFamily: "Poppins_400Regular" },
});
