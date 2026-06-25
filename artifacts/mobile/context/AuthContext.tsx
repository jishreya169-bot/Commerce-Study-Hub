import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type UserRole = "student" | "teacher" | "admin" | "parent";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  class?: string;
  batch?: string;
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
      id: "STD1220",
      name: "Rajat",
      email: "student@vidyapath.in",
      role: "student",
      avatar: "boy",
      class: "Class 12th",
      batch: "Class 12th",
      school: "Commerce Study Hub",
    },
  },
  "teacher@vidyapath.in": {
    password: "vidya123",
    user: {
      id: "1782389805160",
      name: "Amit Shah",
      email: "teacher@vidyapath.in",
      role: "teacher",
      avatar: "AS",
      subject: "English",
      qualification: "M.A., B.Ed",
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
  "parent@vidyapath.in": {
    password: "vidya123",
    user: {
      id: "PRN2762",
      name: "Rajat's Parent",
      email: "parent@vidyapath.in",
      role: "parent",
      avatar: "RP",
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

import { auth, db } from "../lib/firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { initializeTursoDB, turso } from "../lib/turso";
import { registerForPushNotificationsAsync } from "../lib/notifications";

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
        await initializeTursoDB();
        const stored = await AsyncStorage.getItem("auth_user");
        if (stored) setUser(JSON.parse(stored));
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  useEffect(() => {
    if (user?.id) {
      registerForPushNotificationsAsync().then(token => {
        if (token) {
          turso.execute({
            sql: "UPDATE users SET pushToken = ? WHERE id = ?",
            args: [token, user.id]
          }).catch(() => {});
        }
      });
    }
  }, [user?.id]);

  const login = async (email: string, password: string) => {
    // ── DEMO FALLBACK ─────────────────────────────────
    const demo = DEMO_ACCOUNTS[email.trim().toLowerCase()];
    if (demo && demo.password === password) {
      setUser(demo.user);
      await AsyncStorage.setItem("auth_user", JSON.stringify(demo.user));
      return { success: true };
    }

    // ── TURSO CUSTOM AUTH ─────────────────────────────
    try {
      const result = await turso.execute({
        sql: "SELECT * FROM users WHERE email = ? AND password = ?",
        args: [email.trim().toLowerCase(), password]
      });

      if (result.rows.length > 0) {
        const row = result.rows[0];
        const rowObj: any = {};
        result.columns.forEach((col, idx) => { rowObj[col] = row[idx]; });

        const authUser: AuthUser = {
          id: rowObj.id as string,
          name: rowObj.name as string,
          email: rowObj.email as string,
          role: rowObj.role as UserRole,
          class: rowObj.batch as string,
          avatar: (rowObj.avatar as string) || (rowObj.name as string).slice(0, 2).toUpperCase()
        };
        setUser(authUser);
        await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
        return { success: true };
      }
    } catch (error) {
      console.error("Turso Login Error:", error);
    }

    // ── FIREBASE AUTH ─────────────────────────────────
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email.trim(), password);
      const fbUser = userCredential.user;
      
      let role: UserRole = "student";
      let authUser: AuthUser = {
        id: fbUser.uid,
        name: fbUser.displayName || email.split("@")[0],
        email: fbUser.email || email,
        role: "student",
        avatar: (fbUser.displayName || email.split("@")[0]).slice(0, 2).toUpperCase()
      };

      if (email.toLowerCase().includes("admin")) {
        role = "admin";
        authUser.role = "admin";
        authUser.name = "Administrator";
      } else if (email.toLowerCase().includes("teacher")) {
        role = "teacher";
        authUser.role = "teacher";
      }

      authUser.role = role;
      setUser(authUser);
      await AsyncStorage.setItem("auth_user", JSON.stringify(authUser));
      return { success: true };
    } catch (error: any) {
      console.error("Firebase Login Error:", error);
      return { success: false, error: "Invalid email or password. Try demo accounts below." };
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Firebase SignOut Error:", err);
    }
    setUser(null);
    await AsyncStorage.removeItem("auth_user");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
