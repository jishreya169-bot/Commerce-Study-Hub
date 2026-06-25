# Project Roadmap

This roadmap tracks the development progress of the Commerce Study Hub (Vidya Path) platform.

---

## Phase 1: Base Platform & Overhaul
* **Tasks**:
  * [x] Initialize Expo mobile workspaces and Express api-server setups.
  * [x] Design role-based authentication route structures (`app/login.tsx`, `AuthRedirect`).
  * [x] Develop premium Admin dashboard with revenue metrics, horizonal leaderboards, active scheduling, and system health status.
* **Status**: Completed.

---

## Phase 2: Directory Restructure & Memory Layers
* **Tasks**:
  * [x] Enforce Project Brain memory layer and developer workflow rules.
  * [x] Build public Landing Page entry point (`app/index.tsx`) and redirect unauthenticated routes.
  * [x] Restructure and streamline sub-routers for Student tabs `(tabs)`, Teacher options `(teacher)`, and Admin modules `(admin)` with dedicated finance/academics/announcements layouts.
  * [x] Implement live statistics hooks dynamically fetching student/teacher/class counts from Firestore collections.
  * [x] Add Parent Role infrastructure (Quick login, AuthContext setup).
* **Status**: Completed.

---

## Phase 3: Parent Portal & UI Polish
* **Tasks**:
  * [ ] Create dedicated `(parent)` dashboard route for monitoring student progress, attendance, and fee history.
  * [ ] Build interactive data visualization charts for Admin Reports (React Native SVG/Charts).
  * [x] Introduce UI gamification (micro-animations on interaction implemented in Admin dashboard, streaks/badges pending).
* **Status**: In Progress.

---

## Phase 4: Database & Core APIs
* **Tasks**:
  * [ ] Create PostgreSQL Drizzle schemas for Users, Courses, Doubts, and Payments.
  * [ ] Generate type-safe REST API routes on `api-server` and run Orval to generate React client hooks.
  * [ ] Implement secure payment gateway integration for fee collections.
* **Status**: Planned.

---

## Phase 5: Media Player, Testing & AI Integration
* **Tasks**:
  * [ ] Develop video player with Picture-in-Picture (PiP) and offline download support.
  * [ ] Build interactive tests/quiz screens with timer controls and progress visualizers.
  * [ ] Integrate an AI-powered study assistant for automated doubt resolution and notes summarization.
* **Status**: Planned.

