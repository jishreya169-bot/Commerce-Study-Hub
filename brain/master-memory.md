# Master Memory (Compressed Project Intelligence)

*Last Updated: 2026-06-25*
*Target Size: < 5,000 words*

---

## 1. Project Vision & Summary
**Commerce Study Hub (Vidya Path)** is an interactive, high-fidelity learning mobile application designed specifically for Commerce stream students, teachers, and administrators. It facilitates course navigation, recorded/live lectures, doubt clearing, note verification, test assessments, and a premium administrative command center.

---

## 2. Subsystem Architecture
```
                                 [ Expo Mobile App ]
                                   (React Native)
                                         │
                   ┌─────────────────────┼─────────────────────┐
                   ▼                     ▼                     ▼
             [ Firebase ]         [ REST Client ]         [ WebSocket ]
         (Auth & Firestore)    (React Query / Axios)   (Real-time Events)
                   │                     │                     │
                   └──────────────┬──────┴─────────────────────┘
                                  ▼
                          [ Express Server ]
                             (TypeScript)
                                  │
                                  ▼
                            [ Drizzle ORM ]
                                  │
                                  ▼
                           [ PostgreSQL DB ]
```

* **Frontend**: Expo SDK 54 / React Native (TypeScript) with Reanimated v4 and Haptics hooks. Expo Router (v6) handles layout transitions.
* **Backend**: Express REST API (`artifacts/api-server`).
* **Database**: PostgreSQL with Drizzle ORM (`lib/db`).
* **Authentication**: Firebase Authentication.
* **Database / Real-time Storage**: Firestore is used to stream real-time collections (e.g. `students`, `teachers`, `classes` collections for statistics) and user profile information.

---

## 3. Core Directory Layout
* `/artifacts/mobile`: Core Expo React Native application.
  * `/app`: Route handlers and screen layouts.
    * `index.tsx`: Main public Landing Page.
    * `login.tsx`: User login page.
    * `(admin)`: Administrative hub.
      * `index.tsx` (Dynamic metrics dashboard), `academics.tsx`, `communication.tsx`, `courses.tsx`, `finance.tsx`, `notifications.tsx`, `profile.tsx`, `reports.tsx`, `students.tsx`, `teachers.tsx`.
    * `(tabs)`: Student & Parent tab bar.
      * `index.tsx` (Dashboard), `courses.tsx`, `doubts.tsx`, `materials.tsx`, `notifications.tsx`, `profile.tsx`, `tests.tsx`.
    * `(teacher)`: Teacher-specific dashboard.
      * `index.tsx` (Dashboard), `classes.tsx`, `doubts.tsx`, `notifications.tsx`, `profile.tsx`, `students.tsx`, `upload.tsx`.
  * `/components`: Reusable user interface components (CourseCard, LiveClassCard, StatCard, etc.).
  * `/context`: Global React contexts (`AuthContext.tsx`, `ThemeContext.tsx`, `AppContext.tsx`).
* `/artifacts/api-server`: Express TypeScript REST backend.
* `/lib`: Workspace-wide shared libraries (`db`, `api-spec`, `api-client-react`).

---

## 4. Key Engineering Decisions
* **D1 — Expo Router for Navigation**: Standardized file-based navigation to simplify route layouts for students, teachers, and admins.
* **D2 — Drizzle ORM**: Used for type-safe database queries and migrations matching Postgres database structures.
* **D3 — Hybrid Firebase & Postgres Auth**: User records are synced between Firebase Auth/Firestore (for rapid client auth and profile fetching) and Postgres (for relational queries).
* **D4 — Poppins Typography & Glassmorphism**: High-fidelity theme utilizing Poppins fonts, `expo-blur` and gradients for a premium application appearance.

---

## 5. Critical Implementation Patterns
* **P1 — Async/Await over Promises**: Avoid complex promise chaining. Write async routines with distinct try-catch loops.
* **P2 — Font Pre-loading Check**: Check font loading state (`fontsLoaded` and `fontError`) prior to rendering UI.
* **P3 — Layout Role Redirection**: Automatic role-based navigation checks inside `app/_layout.tsx` to route users based on role claims.
* **P4 — Firestore Live Counters**: Using `onSnapshot` inside dashboard layers to bind counters (students, teachers, classes) directly to Firestore collections.

---

## 6. Current Roadmap Snapshot
* **Phase 1 (Completed)**: Platform structure setup, Landing Page creation, premium role dashboards, and layout folder structures.
* **Phase 2 (Completed)**: Enforce Project Brain memory layer and developer workflow rules.
* **Phase 3 (In Progress)**: Parent Portal `(parent)` creation, advanced Admin UI visualizations, and Student Gamification (micro-animations implemented).
* **Phase 4 (Planned)**: Full Postgres database schema migrations with Drizzle, API generation, and secure fee payment gateways.
* **Phase 5 (Planned)**: Offline video player support, PiP capabilities, and AI-powered study assistance.
