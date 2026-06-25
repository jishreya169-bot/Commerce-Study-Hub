import React, { createContext, useContext, useState, useEffect } from 'react';
import { turso } from '../lib/turso';
import { useAuth } from './AuthContext';

type TeacherContextType = {
  activeClass: string;
  setActiveClass: (className: string) => void;
  classesList: string[];
};

const TeacherContext = createContext<TeacherContextType | undefined>(undefined);

export function TeacherProvider({ children }: { children: React.ReactNode }) {
  const [activeClass, setActiveClass] = useState<string>("All");
  const [classesList, setClassesList] = useState<string[]>(["All"]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    
    // Fetch all classes from database
    turso.execute("SELECT name FROM classes ORDER BY createdAt DESC")
      .then(res => {
        const names = res.rows.map(r => r[0] as string);
        setClassesList(["All", ...names]);
        if (names.length > 0 && activeClass === "All") {
          // Default to the first actual class if available
          setActiveClass(names[0]);
        }
      })
      .catch(console.error);
  }, [user]);

  return (
    <TeacherContext.Provider value={{ activeClass, setActiveClass, classesList }}>
      {children}
    </TeacherContext.Provider>
  );
}

export function useTeacherContext() {
  const context = useContext(TeacherContext);
  if (context === undefined) {
    throw new Error('useTeacherContext must be used within a TeacherProvider');
  }
  return context;
}
