import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "student" | "teacher" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  class?: string;
  school?: string;
  subject?: string;
  qualification?: string;
  experience?: string;
  rating?: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const DEMO_ACCOUNTS: Record<string, { password: string; user: AuthUser }> = {
  "student@vidyapath.in": {
    password: "vidya123",
    user: {
      id: "s1",
      name: "Priya Sharma",
      email: "student@vidyapath.in",
      role: "student",
      avatar: "PS",
      class: "Class 12 – Commerce",
      school: "Delhi Public School, Dwarka",
    },
  },
  "teacher@vidyapath.in": {
    password: "vidya123",
    user: {
      id: "t1",
      name: "Prof. Amit Sharma",
      email: "teacher@vidyapath.in",
      role: "teacher",
      avatar: "AS",
      subject: "Accountancy & Economics",
      qualification: "M.Com, B.Ed",
      experience: "8 Years",
      rating: 4.9,
    },
  },
  "admin@vidyapath.in": {
    password: "vidya123",
    user: {
      id: "a1",
      name: "Rajiv Mehta",
      email: "admin@vidyapath.in",
      role: "admin",
      avatar: "RM",
    },
  },
  "teacher2@vidyapath.in": {
    password: "vidya123",
    user: {
      id: "t2",
      name: "Ms. Sunita Rao",
      email: "teacher2@vidyapath.in",
      role: "teacher",
      avatar: "SR",
      subject: "Business Studies & English",
      qualification: "MBA, B.Ed",
      experience: "5 Years",
      rating: 4.7,
    },
  },
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => ({ success: false }),
  logout: async () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem("auth_user");
        if (stored) setUser(JSON.parse(stored));
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const account = DEMO_ACCOUNTS[email.toLowerCase().trim()];
    if (!account) return { success: false, error: "No account found with that email." };
    if (account.password !== password) return { success: false, error: "Incorrect password." };
    setUser(account.user);
    await AsyncStorage.setItem("auth_user", JSON.stringify(account.user));
    return { success: true };
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
