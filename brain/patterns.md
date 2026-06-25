# Approved Implementation Patterns

This document details canonical implementation guidelines to ensure code consistency across all development sessions.

---

## 1. Code-Level Coding Patterns

### Async/Await Pattern (Error Handling)
All asynchronous operations (API fetches, Firebase auth, AsyncStorage actions) must use `async`/`await` routines wrapped in try-catch blocks to prevent unhandled runtime errors. Avoid raw promise chains.

*Preferred:*
```typescript
async function fetchCourseData(courseId: string) {
  try {
    const data = await api.getCourse(courseId);
    setCourse(data);
  } catch (error) {
    console.error("Failed to fetch course details:", error);
    // Trigger notification or local fallback state
  }
}
```

---

## 2. UI & Styling Patterns

### Theme Colors & Spacings
Do not use raw, hardcoded hex values in local stylesheets. Always retrieve tokens from `useTheme` hooks or theme constants to preserve Dark Mode compliance.

*Preferred:*
```typescript
import { useTheme } from "@/context/ThemeContext";

const MyComponent = () => {
  const { colors } = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <Text style={[styles.title, { color: colors.textPrimary }]}>Premium Card</Text>
    </View>
  );
};
```

### Font Loading Validation
Before rendering the primary application shell, ensure fonts are loaded. This prevents text distortion or layout collapses.

*Preferred:*
```typescript
const [fontsLoaded, fontError] = useFonts({
  Poppins_400Regular,
  Poppins_700Bold,
});

if (!fontsLoaded && !fontError) {
  return null; // Keep Splash Screen visible
}
```

### Firestore Live Collection Snapshots (P4)
For screens that display counts or live lists (such as the admin dashboard counters), use `onSnapshot` collection listeners to synchronize client state dynamically. Always return the unsubscribe handles in the clean-up lifecycle of `useEffect`.

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(collection(db, "students"), (snapshot) => {
    setCount(snapshot.size);
  });
  return () => unsubscribe();
}, []);
```

---

## 3. Database Access Patterns (Drizzle)
Declare all database schemas within separate files inside `lib/db/src/schema/` and export them via `lib/db/src/schema/index.ts`. Use type-safe schemas created via `createInsertSchema` to validate payloads.

```typescript
import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCourseSchema = createInsertSchema(coursesTable).omit({ id: true });
export type Course = typeof coursesTable.$inferSelect;
export type InsertCourse = z.infer<typeof insertCourseSchema>;
```
