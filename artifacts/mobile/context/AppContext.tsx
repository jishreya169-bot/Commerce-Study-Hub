import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface Course {
  id: string;
  title: string;
  subject: string;
  instructor: string;
  totalLectures: number;
  completedLectures: number;
  thumbnailColor: string;
  rating: number;
  enrolled: boolean;
  chapters: Chapter[];
  description: string;
  language: string;
  isFeatured: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  isLive: boolean;
}

export interface LiveClass {
  id: string;
  subject: string;
  topic: string;
  instructor: string;
  scheduledAt: string;
  duration: string;
  isLive: boolean;
  thumbnailColor: string;
  viewers?: number;
}

export interface Test {
  id: string;
  title: string;
  subject: string;
  totalQuestions: number;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
  score?: number;
  maxScore: number;
  attempted: boolean;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correct: number;
}

export interface UserProfile {
  name: string;
  class: string;
  school: string;
  avatar: string;
  streak: number;
  totalPoints: number;
  rank: number;
}

interface AppContextType {
  user: UserProfile;
  courses: Course[];
  liveClasses: LiveClass[];
  tests: Test[];
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
  markLectureComplete: (courseId: string, chapterId: string) => void;
  saveTestResult: (testId: string, score: number) => void;
}

const defaultUser: UserProfile = {
  name: "Priya Sharma",
  class: "Class 12 Commerce",
  school: "Delhi Public School",
  avatar: "PS",
  streak: 14,
  totalPoints: 3850,
  rank: 42,
};

const SUBJECTS = ["Accountancy", "Business Studies", "Economics", "Mathematics", "English"];
const COLORS = ["#6200EE", "#7B1FA2", "#0288D1", "#00897B", "#E65100", "#AD1457", "#1565C0"];

const defaultCourses: Course[] = [
  {
    id: "c1",
    title: "Complete Accountancy",
    subject: "Accountancy",
    instructor: "CA Rajesh Kumar",
    totalLectures: 48,
    completedLectures: 18,
    thumbnailColor: "#6200EE",
    rating: 4.8,
    enrolled: true,
    description: "Master all concepts of Class 12 Accountancy from partnership accounts to financial statements.",
    language: "Hindi + English",
    isFeatured: true,
    chapters: [
      { id: "ch1", title: "Partnership Accounts - Basics", duration: "45 min", completed: true, isLive: false },
      { id: "ch2", title: "Goodwill & Its Valuation", duration: "38 min", completed: true, isLive: false },
      { id: "ch3", title: "Admission of a Partner", duration: "52 min", completed: true, isLive: false },
      { id: "ch4", title: "Retirement & Death of Partner", duration: "48 min", completed: false, isLive: false },
      { id: "ch5", title: "Dissolution of Partnership", duration: "42 min", completed: false, isLive: false },
      { id: "ch6", title: "Company Accounts - Shares", duration: "55 min", completed: false, isLive: false },
    ],
  },
  {
    id: "c2",
    title: "Business Studies Mastery",
    subject: "Business Studies",
    instructor: "Prof. Sunita Mehta",
    totalLectures: 36,
    completedLectures: 9,
    thumbnailColor: "#0288D1",
    rating: 4.7,
    enrolled: true,
    description: "Comprehensive coverage of Nature & Functions of Management for Board Exams.",
    language: "English",
    isFeatured: false,
    chapters: [
      { id: "ch1", title: "Nature & Significance of Management", duration: "40 min", completed: true, isLive: false },
      { id: "ch2", title: "Principles of Management", duration: "35 min", completed: false, isLive: false },
      { id: "ch3", title: "Business Environment", duration: "30 min", completed: false, isLive: false },
      { id: "ch4", title: "Planning", duration: "42 min", completed: false, isLive: false },
    ],
  },
  {
    id: "c3",
    title: "Economics - Micro & Macro",
    subject: "Economics",
    instructor: "Dr. Amit Verma",
    totalLectures: 54,
    completedLectures: 22,
    thumbnailColor: "#00897B",
    rating: 4.9,
    enrolled: true,
    description: "Deep dive into Microeconomics and Macroeconomics for CBSE Class 12.",
    language: "Hindi + English",
    isFeatured: true,
    chapters: [
      { id: "ch1", title: "Introduction to Economics", duration: "28 min", completed: true, isLive: false },
      { id: "ch2", title: "Consumer Equilibrium", duration: "45 min", completed: true, isLive: false },
      { id: "ch3", title: "Demand & Law of Demand", duration: "38 min", completed: true, isLive: false },
      { id: "ch4", title: "Supply & Law of Supply", duration: "35 min", completed: false, isLive: false },
      { id: "ch5", title: "Market Equilibrium", duration: "42 min", completed: false, isLive: false },
    ],
  },
  {
    id: "c4",
    title: "Mathematics for Commerce",
    subject: "Mathematics",
    instructor: "Mr. Vikram Singh",
    totalLectures: 42,
    completedLectures: 0,
    thumbnailColor: "#AD1457",
    rating: 4.6,
    enrolled: false,
    description: "Applied Mathematics covering Linear Programming, Probability and Statistics.",
    language: "English",
    isFeatured: false,
    chapters: [
      { id: "ch1", title: "Relations & Functions", duration: "50 min", completed: false, isLive: false },
      { id: "ch2", title: "Linear Programming", duration: "48 min", completed: false, isLive: false },
      { id: "ch3", title: "Probability", duration: "42 min", completed: false, isLive: false },
    ],
  },
];

const defaultLiveClasses: LiveClass[] = [
  {
    id: "l1",
    subject: "Accountancy",
    topic: "Retirement of a Partner - Live Revision",
    instructor: "CA Rajesh Kumar",
    scheduledAt: "Today, 6:00 PM",
    duration: "90 min",
    isLive: true,
    thumbnailColor: "#6200EE",
    viewers: 1247,
  },
  {
    id: "l2",
    subject: "Economics",
    topic: "National Income & Related Aggregates",
    instructor: "Dr. Amit Verma",
    scheduledAt: "Today, 8:00 PM",
    duration: "60 min",
    isLive: false,
    thumbnailColor: "#00897B",
  },
  {
    id: "l3",
    subject: "Business Studies",
    topic: "Marketing Management - Full Chapter",
    instructor: "Prof. Sunita Mehta",
    scheduledAt: "Tomorrow, 5:00 PM",
    duration: "75 min",
    isLive: false,
    thumbnailColor: "#0288D1",
  },
  {
    id: "l4",
    subject: "Mathematics",
    topic: "Linear Programming - Problem Solving",
    instructor: "Mr. Vikram Singh",
    scheduledAt: "Tomorrow, 7:00 PM",
    duration: "60 min",
    isLive: false,
    thumbnailColor: "#AD1457",
  },
];

const defaultTests: Test[] = [
  {
    id: "t1",
    title: "Accountancy Chapter Test",
    subject: "Accountancy",
    totalQuestions: 25,
    duration: "30 min",
    difficulty: "Medium",
    maxScore: 50,
    attempted: true,
    score: 42,
    questions: [
      {
        id: "q1",
        text: "A partnership firm has the following partners: A, B, C sharing profits in 3:2:1 ratio. If C retires, the new ratio between A and B will be:",
        options: ["3:2", "2:1", "1:1", "Cannot be determined"],
        correct: 0,
      },
      {
        id: "q2",
        text: "Goodwill is a:",
        options: ["Current Asset", "Fixed Asset", "Intangible Asset", "Fictitious Asset"],
        correct: 2,
      },
      {
        id: "q3",
        text: "On the death of a partner, the deceased partner's share of profit is transferred to:",
        options: ["Profit & Loss Account", "Capital Account", "Executor's Account", "General Reserve"],
        correct: 2,
      },
      {
        id: "q4",
        text: "Which of the following is NOT shown in the Balance Sheet of a partnership firm?",
        options: ["Partner's Capital", "Loan from Partner", "Profit Sharing Ratio", "Current Account"],
        correct: 2,
      },
      {
        id: "q5",
        text: "Revaluation Account is a:",
        options: ["Real Account", "Nominal Account", "Personal Account", "Valuation Account"],
        correct: 1,
      },
    ],
  },
  {
    id: "t2",
    title: "Economics Mock Test - Micro",
    subject: "Economics",
    totalQuestions: 30,
    duration: "40 min",
    difficulty: "Hard",
    maxScore: 60,
    attempted: true,
    score: 38,
    questions: [
      {
        id: "q1",
        text: "Law of Demand states that, other things being equal, as price increases, demand:",
        options: ["Increases", "Decreases", "Remains constant", "Increases then decreases"],
        correct: 1,
      },
      {
        id: "q2",
        text: "Consumer is in equilibrium when:",
        options: [
          "MU = Price",
          "MU > Price",
          "MU < Price",
          "MU of Money = 0",
        ],
        correct: 0,
      },
      {
        id: "q3",
        text: "Which of the following is a feature of perfect competition?",
        options: ["Product differentiation", "Few sellers", "Large number of buyers and sellers", "Price making ability"],
        correct: 2,
      },
    ],
  },
  {
    id: "t3",
    title: "Business Studies - Management",
    subject: "Business Studies",
    totalQuestions: 20,
    duration: "25 min",
    difficulty: "Easy",
    maxScore: 40,
    attempted: false,
    questions: [
      {
        id: "q1",
        text: "Management is considered as an art because:",
        options: [
          "It has a systematic body of knowledge",
          "It involves personal skills",
          "It follows certain principles",
          "It can be taught",
        ],
        correct: 1,
      },
      {
        id: "q2",
        text: "The principle of 'Unity of Command' means:",
        options: [
          "One plan for one type of activity",
          "One head for one group of activities",
          "Each employee receives orders from only one superior",
          "Unity among all managers",
        ],
        correct: 2,
      },
    ],
  },
  {
    id: "t4",
    title: "Full Syllabus Mock Test",
    subject: "Accountancy",
    totalQuestions: 80,
    duration: "3 hrs",
    difficulty: "Hard",
    maxScore: 80,
    attempted: false,
    questions: [],
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user] = useState<UserProfile>(defaultUser);
  const [courses, setCourses] = useState<Course[]>(defaultCourses);
  const [liveClasses] = useState<LiveClass[]>(defaultLiveClasses);
  const [tests, setTests] = useState<Test[]>(defaultTests);
  const [language, setLanguageState] = useState<"en" | "hi">("en");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedCourses, savedTests, savedLang] = await Promise.all([
        AsyncStorage.getItem("courses"),
        AsyncStorage.getItem("tests"),
        AsyncStorage.getItem("language"),
      ]);
      if (savedCourses) setCourses(JSON.parse(savedCourses));
      if (savedTests) setTests(JSON.parse(savedTests));
      if (savedLang) setLanguageState(savedLang as "en" | "hi");
    } catch {}
  };

  const setLanguage = async (lang: "en" | "hi") => {
    setLanguageState(lang);
    await AsyncStorage.setItem("language", lang);
  };

  const markLectureComplete = async (courseId: string, chapterId: string) => {
    const updated = courses.map((c) => {
      if (c.id !== courseId) return c;
      const chapters = c.chapters.map((ch) =>
        ch.id === chapterId ? { ...ch, completed: true } : ch
      );
      const completedLectures = chapters.filter((ch) => ch.completed).length;
      return { ...c, chapters, completedLectures };
    });
    setCourses(updated);
    await AsyncStorage.setItem("courses", JSON.stringify(updated));
  };

  const saveTestResult = async (testId: string, score: number) => {
    const updated = tests.map((t) =>
      t.id === testId ? { ...t, attempted: true, score } : t
    );
    setTests(updated);
    await AsyncStorage.setItem("tests", JSON.stringify(updated));
  };

  return (
    <AppContext.Provider value={{ user, courses, liveClasses, tests, language, setLanguage, markLectureComplete, saveTestResult }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
