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
  hasRecording?: boolean;
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
  hasRecording?: boolean;
  recordingId?: string;
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

export interface Doubt {
  id: string;
  question: string;
  subject: string;
  askedBy: string;
  askedAt: string;
  upvotes: number;
  upvoted: boolean;
  resolved: boolean;
  answersCount: number;
  answers: DoubtAnswer[];
}

export interface DoubtAnswer {
  id: string;
  text: string;
  answeredBy: string;
  isExpert: boolean;
  upvotes: number;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string;
  createdAt: string;
  updatedAt: string;
  color: string;
}

export interface LectureComment {
  id: string;
  lectureId: string;
  text: string;
  author: string;
  timestamp: string;
  likes: number;
  liked: boolean;
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
  doubts: Doubt[];
  notes: Note[];
  comments: LectureComment[];
  language: "en" | "hi";
  setLanguage: (lang: "en" | "hi") => void;
  markLectureComplete: (courseId: string, chapterId: string) => void;
  saveTestResult: (testId: string, score: number) => void;
  addDoubt: (doubt: Omit<Doubt, "id" | "askedAt" | "upvotes" | "upvoted" | "resolved" | "answersCount" | "answers">) => void;
  upvoteDoubt: (doubtId: string) => void;
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, title: string, content: string) => void;
  deleteNote: (id: string) => void;
  addComment: (comment: Omit<LectureComment, "id" | "timestamp" | "likes" | "liked">) => void;
  likeComment: (commentId: string) => void;
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

const SUBJECT_COLORS: Record<string, string> = {
  Accountancy: "#5B9BD5",
  "Business Studies": "#7B8EBF",
  Economics: "#5BAD9B",
  Mathematics: "#9B7BC4",
  English: "#BF7B5B",
};

const defaultCourses: Course[] = [
  {
    id: "c1",
    title: "Complete Accountancy",
    subject: "Accountancy",
    instructor: "CA Rajesh Kumar",
    totalLectures: 48,
    completedLectures: 18,
    thumbnailColor: "#5B9BD5",
    rating: 4.8,
    enrolled: true,
    description: "Master all concepts of Class 12 Accountancy from partnership accounts to financial statements.",
    language: "Hindi + English",
    isFeatured: true,
    chapters: [
      { id: "ch1", title: "Partnership Accounts – Basics", duration: "45 min", completed: true, isLive: false, hasRecording: true },
      { id: "ch2", title: "Goodwill & Its Valuation", duration: "38 min", completed: true, isLive: false, hasRecording: true },
      { id: "ch3", title: "Admission of a Partner", duration: "52 min", completed: true, isLive: false, hasRecording: true },
      { id: "ch4", title: "Retirement & Death of Partner", duration: "48 min", completed: false, isLive: false, hasRecording: true },
      { id: "ch5", title: "Dissolution of Partnership", duration: "42 min", completed: false, isLive: false, hasRecording: false },
      { id: "ch6", title: "Company Accounts – Shares", duration: "55 min", completed: false, isLive: true, hasRecording: false },
    ],
  },
  {
    id: "c2",
    title: "Business Studies Mastery",
    subject: "Business Studies",
    instructor: "Prof. Sunita Mehta",
    totalLectures: 36,
    completedLectures: 9,
    thumbnailColor: "#7B8EBF",
    rating: 4.7,
    enrolled: true,
    description: "Comprehensive coverage of Nature & Functions of Management for Board Exams.",
    language: "English",
    isFeatured: false,
    chapters: [
      { id: "ch1", title: "Nature & Significance of Management", duration: "40 min", completed: true, isLive: false, hasRecording: true },
      { id: "ch2", title: "Principles of Management", duration: "35 min", completed: false, isLive: false, hasRecording: true },
      { id: "ch3", title: "Business Environment", duration: "30 min", completed: false, isLive: false, hasRecording: false },
      { id: "ch4", title: "Planning", duration: "42 min", completed: false, isLive: false, hasRecording: false },
    ],
  },
  {
    id: "c3",
    title: "Economics – Micro & Macro",
    subject: "Economics",
    instructor: "Dr. Amit Verma",
    totalLectures: 54,
    completedLectures: 22,
    thumbnailColor: "#5BAD9B",
    rating: 4.9,
    enrolled: true,
    description: "Deep dive into Microeconomics and Macroeconomics for CBSE Class 12.",
    language: "Hindi + English",
    isFeatured: true,
    chapters: [
      { id: "ch1", title: "Introduction to Economics", duration: "28 min", completed: true, isLive: false, hasRecording: true },
      { id: "ch2", title: "Consumer Equilibrium", duration: "45 min", completed: true, isLive: false, hasRecording: true },
      { id: "ch3", title: "Demand & Law of Demand", duration: "38 min", completed: true, isLive: false, hasRecording: true },
      { id: "ch4", title: "Supply & Law of Supply", duration: "35 min", completed: false, isLive: false, hasRecording: false },
      { id: "ch5", title: "Market Equilibrium", duration: "42 min", completed: false, isLive: false, hasRecording: false },
    ],
  },
  {
    id: "c4",
    title: "Mathematics for Commerce",
    subject: "Mathematics",
    instructor: "Mr. Vikram Singh",
    totalLectures: 42,
    completedLectures: 0,
    thumbnailColor: "#9B7BC4",
    rating: 4.6,
    enrolled: false,
    description: "Applied Mathematics covering Linear Programming, Probability and Statistics.",
    language: "English",
    isFeatured: false,
    chapters: [
      { id: "ch1", title: "Relations & Functions", duration: "50 min", completed: false, isLive: false, hasRecording: false },
      { id: "ch2", title: "Linear Programming", duration: "48 min", completed: false, isLive: false, hasRecording: false },
      { id: "ch3", title: "Probability", duration: "42 min", completed: false, isLive: false, hasRecording: false },
    ],
  },
];

const defaultLiveClasses: LiveClass[] = [
  {
    id: "l1",
    subject: "Accountancy",
    topic: "Retirement of a Partner – Live Revision",
    instructor: "CA Rajesh Kumar",
    scheduledAt: "Today, 6:00 PM",
    duration: "90 min",
    isLive: true,
    thumbnailColor: "#5B9BD5",
    viewers: 1247,
    hasRecording: false,
  },
  {
    id: "l2",
    subject: "Economics",
    topic: "National Income & Related Aggregates",
    instructor: "Dr. Amit Verma",
    scheduledAt: "Today, 8:00 PM",
    duration: "60 min",
    isLive: false,
    thumbnailColor: "#5BAD9B",
    hasRecording: false,
  },
  {
    id: "l3",
    subject: "Business Studies",
    topic: "Marketing Management – Full Chapter",
    instructor: "Prof. Sunita Mehta",
    scheduledAt: "Yesterday, 5:00 PM",
    duration: "75 min",
    isLive: false,
    thumbnailColor: "#7B8EBF",
    hasRecording: true,
    recordingId: "r1",
  },
  {
    id: "l4",
    subject: "Accountancy",
    topic: "Partnership Accounts – Admission Deep Dive",
    instructor: "CA Rajesh Kumar",
    scheduledAt: "2 days ago",
    duration: "65 min",
    isLive: false,
    thumbnailColor: "#5B9BD5",
    hasRecording: true,
    recordingId: "r2",
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
      { id: "q1", text: "A partnership firm has partners A, B, C sharing profits in 3:2:1. If C retires, the new ratio between A and B will be:", options: ["3:2", "2:1", "1:1", "Cannot be determined"], correct: 0 },
      { id: "q2", text: "Goodwill is a:", options: ["Current Asset", "Fixed Asset", "Intangible Asset", "Fictitious Asset"], correct: 2 },
      { id: "q3", text: "On the death of a partner, profit is transferred to:", options: ["P&L Account", "Capital Account", "Executor's Account", "General Reserve"], correct: 2 },
      { id: "q4", text: "Which is NOT shown in the Balance Sheet?", options: ["Partner's Capital", "Loan from Partner", "Profit Sharing Ratio", "Current Account"], correct: 2 },
      { id: "q5", text: "Revaluation Account is a:", options: ["Real Account", "Nominal Account", "Personal Account", "Valuation Account"], correct: 1 },
    ],
  },
  {
    id: "t2",
    title: "Economics Mock Test – Micro",
    subject: "Economics",
    totalQuestions: 30,
    duration: "40 min",
    difficulty: "Hard",
    maxScore: 60,
    attempted: true,
    score: 38,
    questions: [
      { id: "q1", text: "Law of Demand states that, other things equal, as price increases, demand:", options: ["Increases", "Decreases", "Stays same", "Increases then decreases"], correct: 1 },
      { id: "q2", text: "Consumer equilibrium when:", options: ["MU = Price", "MU > Price", "MU < Price", "MU of Money = 0"], correct: 0 },
      { id: "q3", text: "Feature of perfect competition:", options: ["Product differentiation", "Few sellers", "Large buyers & sellers", "Price making ability"], correct: 2 },
    ],
  },
  {
    id: "t3",
    title: "Business Studies – Management",
    subject: "Business Studies",
    totalQuestions: 20,
    duration: "25 min",
    difficulty: "Easy",
    maxScore: 40,
    attempted: false,
    questions: [
      { id: "q1", text: "Management is considered as an art because:", options: ["Systematic body of knowledge", "Involves personal skills", "Follows certain principles", "Can be taught"], correct: 1 },
      { id: "q2", text: "Unity of Command means:", options: ["One plan per activity", "One head per group", "Orders from one superior only", "Unity among managers"], correct: 2 },
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

const defaultDoubts: Doubt[] = [
  {
    id: "d1",
    question: "What is the difference between Revaluation Account and Memorandum Revaluation Account?",
    subject: "Accountancy",
    askedBy: "Rahul M.",
    askedAt: "2 hours ago",
    upvotes: 14,
    upvoted: false,
    resolved: true,
    answersCount: 3,
    answers: [
      { id: "a1", text: "Revaluation Account is prepared when assets and liabilities are revalued at the time of reconstitution of a firm. It is a nominal account and its balance is transferred to old partners' capital accounts. Memorandum Revaluation Account is used when the new partner is not to bear the profit or loss on revaluation.", answeredBy: "CA Rajesh Kumar", isExpert: true, upvotes: 11 },
      { id: "a2", text: "In simple words, Revaluation A/c transfers profit/loss to ALL partners including new. Memorandum Revaluation ensures only OLD partners bear the revaluation effect.", answeredBy: "Priya S.", isExpert: false, upvotes: 5 },
    ],
  },
  {
    id: "d2",
    question: "How to calculate the gaining ratio when a partner retires?",
    subject: "Accountancy",
    askedBy: "Ananya K.",
    askedAt: "5 hours ago",
    upvotes: 9,
    upvoted: false,
    resolved: false,
    answersCount: 1,
    answers: [
      { id: "a1", text: "Gaining Ratio = New Ratio – Old Ratio. The partners who gain the share of the retiring partner share it in their gaining ratio. Example: If A and B had 2:1 ratio and C retires with 1/4 share, you need to find how the 1/4 is distributed between A and B.", answeredBy: "Prof. Sunita Mehta", isExpert: true, upvotes: 7 },
    ],
  },
  {
    id: "d3",
    question: "What is the difference between consumer surplus and producer surplus?",
    subject: "Economics",
    askedBy: "Vikram R.",
    askedAt: "1 day ago",
    upvotes: 22,
    upvoted: false,
    resolved: true,
    answersCount: 2,
    answers: [
      { id: "a1", text: "Consumer Surplus is the difference between what a consumer is willing to pay and what they actually pay. Producer Surplus is the difference between the price received and the minimum price the producer was willing to accept.", answeredBy: "Dr. Amit Verma", isExpert: true, upvotes: 18 },
    ],
  },
  {
    id: "d4",
    question: "Explain the principle of Unity of Command with an example.",
    subject: "Business Studies",
    askedBy: "Sneha P.",
    askedAt: "2 days ago",
    upvotes: 6,
    upvoted: false,
    resolved: false,
    answersCount: 0,
    answers: [],
  },
];

const defaultNotes: Note[] = [
  {
    id: "n1",
    title: "Partnership – Key Formulas",
    content: "Sacrificing Ratio = Old Ratio – New Ratio\nGaining Ratio = New Ratio – Old Ratio\nGoodwill = Super Profit × Purchase Years\nSuper Profit = Actual Profit – Normal Profit\n\nImportant: Always check if goodwill already exists in books before calculating.",
    subject: "Accountancy",
    createdAt: "2 days ago",
    updatedAt: "1 day ago",
    color: "#EEF4FB",
  },
  {
    id: "n2",
    title: "Elasticity of Demand – Types",
    content: "1. Perfectly Elastic (Ed = ∞): Horizontal demand curve\n2. Perfectly Inelastic (Ed = 0): Vertical demand curve\n3. Unitary Elastic (Ed = 1): Rectangular hyperbola\n4. Relatively Elastic (Ed > 1): Flatter curve\n5. Relatively Inelastic (Ed < 1): Steeper curve\n\nRemember: Necessities have inelastic demand, luxuries have elastic demand.",
    subject: "Economics",
    createdAt: "3 days ago",
    updatedAt: "3 days ago",
    color: "#F0FBF6",
  },
  {
    id: "n3",
    title: "Management Functions – Mnemonic",
    content: "POSDCORB:\nP – Planning\nO – Organising\nS – Staffing\nD – Directing\nCo – Coordinating\nR – Reporting\nB – Budgeting\n\nModern version: POLCA\nP – Planning, O – Organising, L – Leading, C – Controlling, A – Adapting",
    subject: "Business Studies",
    createdAt: "4 days ago",
    updatedAt: "4 days ago",
    color: "#F8F0FB",
  },
];

const defaultComments: LectureComment[] = [
  { id: "cm1", lectureId: "ch1", text: "Sir the concept of sacrificing ratio was explained very clearly. Thank you!", author: "Rahul M.", timestamp: "2 days ago", likes: 8, liked: false },
  { id: "cm2", lectureId: "ch1", text: "Can you explain the journal entry for goodwill once more? A bit confused.", author: "Ananya K.", timestamp: "2 days ago", likes: 3, liked: false },
  { id: "cm3", lectureId: "ch1", text: "Great lecture! The examples with numbers made it very easy to understand.", author: "Sneha P.", timestamp: "1 day ago", likes: 5, liked: false },
  { id: "cm4", lectureId: "ch2", text: "Average profit method vs super profit method – the comparison table was very helpful.", author: "Vikram R.", timestamp: "3 days ago", likes: 12, liked: false },
  { id: "cm5", lectureId: "r1", text: "Excellent recording quality! The marketing mix 4P framework explanation is spot on for boards.", author: "Pooja S.", timestamp: "Yesterday", likes: 7, liked: false },
  { id: "cm6", lectureId: "r1", text: "Please upload more such detailed recordings. This helped a lot!", author: "Arjun T.", timestamp: "Yesterday", likes: 4, liked: false },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user] = useState<UserProfile>(defaultUser);
  const [courses, setCourses] = useState<Course[]>(defaultCourses);
  const [liveClasses] = useState<LiveClass[]>(defaultLiveClasses);
  const [tests, setTests] = useState<Test[]>(defaultTests);
  const [doubts, setDoubts] = useState<Doubt[]>(defaultDoubts);
  const [notes, setNotes] = useState<Note[]>(defaultNotes);
  const [comments, setComments] = useState<LectureComment[]>(defaultComments);
  const [language, setLanguageState] = useState<"en" | "hi">("en");

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [c, t, d, n, cm, lang] = await Promise.all([
        AsyncStorage.getItem("courses"),
        AsyncStorage.getItem("tests"),
        AsyncStorage.getItem("doubts"),
        AsyncStorage.getItem("notes"),
        AsyncStorage.getItem("comments"),
        AsyncStorage.getItem("language"),
      ]);
      if (c) setCourses(JSON.parse(c));
      if (t) setTests(JSON.parse(t));
      if (d) setDoubts(JSON.parse(d));
      if (n) setNotes(JSON.parse(n));
      if (cm) setComments(JSON.parse(cm));
      if (lang) setLanguageState(lang as "en" | "hi");
    } catch {}
  };

  const persist = async (key: string, value: unknown) => {
    try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch {}
  };

  const setLanguage = async (lang: "en" | "hi") => {
    setLanguageState(lang);
    await AsyncStorage.setItem("language", lang);
  };

  const markLectureComplete = (courseId: string, chapterId: string) => {
    const updated = courses.map((c) => {
      if (c.id !== courseId) return c;
      const chapters = c.chapters.map((ch) => ch.id === chapterId ? { ...ch, completed: true } : ch);
      return { ...c, chapters, completedLectures: chapters.filter((ch) => ch.completed).length };
    });
    setCourses(updated);
    persist("courses", updated);
  };

  const saveTestResult = (testId: string, score: number) => {
    const updated = tests.map((t) => t.id === testId ? { ...t, attempted: true, score } : t);
    setTests(updated);
    persist("tests", updated);
  };

  const addDoubt = (doubt: Omit<Doubt, "id" | "askedAt" | "upvotes" | "upvoted" | "resolved" | "answersCount" | "answers">) => {
    const newDoubt: Doubt = { ...doubt, id: `d${Date.now()}`, askedAt: "Just now", upvotes: 0, upvoted: false, resolved: false, answersCount: 0, answers: [] };
    const updated = [newDoubt, ...doubts];
    setDoubts(updated);
    persist("doubts", updated);
  };

  const upvoteDoubt = (doubtId: string) => {
    const updated = doubts.map((d) =>
      d.id === doubtId ? { ...d, upvotes: d.upvoted ? d.upvotes - 1 : d.upvotes + 1, upvoted: !d.upvoted } : d
    );
    setDoubts(updated);
    persist("doubts", updated);
  };

  const addNote = (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
    const now = "Just now";
    const newNote: Note = { ...note, id: `n${Date.now()}`, createdAt: now, updatedAt: now };
    const updated = [newNote, ...notes];
    setNotes(updated);
    persist("notes", updated);
  };

  const updateNote = (id: string, title: string, content: string) => {
    const updated = notes.map((n) => n.id === id ? { ...n, title, content, updatedAt: "Just now" } : n);
    setNotes(updated);
    persist("notes", updated);
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    persist("notes", updated);
  };

  const addComment = (comment: Omit<LectureComment, "id" | "timestamp" | "likes" | "liked">) => {
    const newComment: LectureComment = { ...comment, id: `cm${Date.now()}`, timestamp: "Just now", likes: 0, liked: false };
    const updated = [newComment, ...comments];
    setComments(updated);
    persist("comments", updated);
  };

  const likeComment = (commentId: string) => {
    const updated = comments.map((c) =>
      c.id === commentId ? { ...c, likes: c.liked ? c.likes - 1 : c.likes + 1, liked: !c.liked } : c
    );
    setComments(updated);
    persist("comments", updated);
  };

  return (
    <AppContext.Provider value={{ user, courses, liveClasses, tests, doubts, notes, comments, language, setLanguage, markLectureComplete, saveTestResult, addDoubt, upvoteDoubt, addNote, updateNote, deleteNote, addComment, likeComment }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
