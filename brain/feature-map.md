# Feature Map

This document maps application features to their implementation locations in the codebase.

---

## 1. Feature Map Definitions

### Public Landing Page
* **Purpose**: Showcase platform value proposition, statistics, and testimonials.
* **Core files**:
  * [index.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/index.tsx) (Hero headers, stats counts, choosing grids, scrollable testimonials)

### Authentication & Redirect Gates
* **Purpose**: Safe user login and role redirection.
* **Core files**:
  * [AuthContext.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/context/AuthContext.tsx) (Session state, Firebase logic, demo accounts)
  * [login.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/login.tsx) (Login screen view and transitions)
  * [_layout.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/_layout.tsx) (Role-based redirect check)
  * [firebase.ts](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/lib/firebase.ts) (Firebase initialized configuration)

### Premium Admin Command Center
* **Purpose**: Monitor system statistics, financial reports, courses, and student/teacher directories.
* **Core files**:
  * [index.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(admin)/index.tsx) (Dashboard: Firebase real-time collection metrics, quick actions, fee defaulters, top students list)
  * [academics.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(admin)/academics.tsx) (Admin courses/subjects grid)
  * [communication.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(admin)/communication.tsx) (Admin announcements and notifications composer)
  * [courses.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(admin)/courses.tsx) (Class management structures)
  * [finance.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(admin)/finance.tsx) (Detailed fees, collections, transaction history)
  * [reports.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(admin)/reports.tsx) (Academic and financial reports visualization)
  * [students.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(admin)/students.tsx) (Student list and profile modal editor)
  * [teachers.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(admin)/teachers.tsx) (Teacher listings directory)

### Student Portal (`(tabs)`)
* **Purpose**: Tab-based navigation for commerce stream learning.
* **Core files**:
  * [index.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(tabs)/index.tsx) (Student home dashboard: continue studying, today's schedule, stats)
  * [courses.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(tabs)/courses.tsx) (Student course directory)
  * [doubts.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(tabs)/doubts.tsx) (Student doubts feed and ask-doubt trigger)
  * [materials.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(tabs)/materials.tsx) (Study notes & PDF browser)
  * [notifications.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(tabs)/notifications.tsx) (Student alerts feed)
  * [profile.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(tabs)/profile.tsx) (Student details and metrics dashboard)
  * [tests.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(tabs)/tests.tsx) (Mock tests checklist)

### Teacher Portal (`(teacher)`)
* **Purpose**: Educator dashboard to control assignments, review doubts, and inspect student records.
* **Core files**:
  * [index.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(teacher)/index.tsx) (Teacher dashboard hub)
  * [classes.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(teacher)/classes.tsx) (Classes list scheduler)
  * [doubts.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(teacher)/doubts.tsx) (Doubt resolution listing)
  * [students.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(teacher)/students.tsx) (Teacher list view of assigned students)
  * [upload.tsx](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/artifacts/mobile/app/(teacher)/upload.tsx) (File publisher interface for recorded content and notes)

### Database Management
* **Purpose**: Model tables and track query pools.
* **Core files**:
  * [schema/index.ts](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/lib/db/src/schema/index.ts) (Drizzle DB table models)
  * [index.ts](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/lib/db/src/index.ts) (node-postgres connection client pool initializer)

### Upcoming Features & Capabilities
* **Parent Portal (`(parent)`)**: A dedicated route layout for parents to monitor attendance, academic progress, and manage fee payments.
* **AI Study Assistant**: Intelligent chatbot for doubt resolution and automatic notes summarization.
* **Advanced Admin Visualizations**: Interactive React Native SVG charts for financial and academic reporting.
* **Gamification Engine**: Daily study streaks, leaderboards, and achievement badges for students.
* **Media Player Enhancements**: Offline downloads and Picture-in-Picture (PiP) support for recorded lectures.
