import React, { createContext, useState, useEffect, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

export const ThemeContext = createContext<ThemeContextType>({
  theme: "light",
  toggleTheme: () => {},
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Default is always light
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    AsyncStorage.getItem("app_theme").then((saved) => {
      if (saved === "dark" || saved === "light") setThemeState(saved);
    });
  }, []);

  const setTheme = async (t: Theme) => {
    setThemeState(t);
    await AsyncStorage.setItem("app_theme", t);
  };

  const toggleTheme = () => setTheme(theme === "light" ? "dark" : "light");

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
