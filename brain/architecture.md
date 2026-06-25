# Architectural Blueprint

This document details the architectural configuration and data flow across the Vidya Path (Commerce Study Hub) codebase.

---

## 1. Architectural Layers

### Frontend Layer (`artifacts/mobile`)
* **Framework**: React Native with Expo SDK 54.
* **Routing**: File-based routing using `expo-router` (v6).
  * Root navigation defined in `app/_layout.tsx` using a React Native Stack.
  * Public Landing Page is hosted at `app/index.tsx`.
  * Role-based redirection is executed within `AuthRedirect` in `app/_layout.tsx` based on profile role (student, teacher, admin, parent):
    * Authenticated user redirects from `/` or `/login` directly to their matching sub-router.
    * Unauthenticated user is kept on `/` or `/login`.
* **Sub-Routers**: 
  * `(admin)`: Stack structure mapping admin options. Contains `index.tsx`, `academics.tsx`, `communication.tsx`, `courses.tsx`, `finance.tsx`, `notifications.tsx`, `profile.tsx`, `reports.tsx`, `students.tsx`, `teachers.tsx`.
  * `(tabs)`: Tab-bar sub-navigation structure for students and parent observers. Contains `index.tsx` (Student Hub), `courses.tsx`, `doubts.tsx` (doubt list/chat tab), `materials.tsx` (study notes list), `notifications.tsx`, `profile.tsx`, `tests.tsx`.
  * `(teacher)`: Custom sub-navigation for teachers. Contains `index.tsx` (Teacher Hub), `classes.tsx`, `doubts.tsx` (doubts list resolver), `notifications.tsx`, `profile.tsx`, `students.tsx`, `upload.tsx` (file upload panel).
* **Context State**:
  * `AuthContext`: Tracks session authentication status, active user details (synced with Firebase Auth and Firestore), and controls login/logout.
  * `ThemeContext`: Handles light/dark themes and styling tokens.
  * `AppContext`: Handles generic application configurations, sidebar drawer states, and notifications.

### API & Network Layer (`lib/api-spec` & `lib/api-client-react`)
* **Orval integration**: Auto-generates type-safe React Query hooks based on the REST interface schema declared in `openapi.yaml`.
* **Axios instances**: Built-in clients that interact with the backend Express server.

### Backend REST API Layer (`artifacts/api-server`)
* **Framework**: TypeScript Express application.
* **Routing**: Simple router middleware defining health checks and sub-routes under `/api`.
* **Middlewares**: Custom logger and response formatting middleware.

### Database Layer (`lib/db`)
* **ORM**: Drizzle ORM connecting to PostgreSQL database.
* **Client**: `node-postgres` pooling database connection instances.

---

## 2. External Services & Integrations

### Firebase Integration
* **Firebase Auth**: Configured in `artifacts/mobile/lib/firebase.ts`. Handles secure authentication logic.
* **Firestore**: Stores user profile records and enables real-time document listeners (`onSnapshot`) used to update metrics on dashboards.

---

## 3. Data Flow Workflow

```
[User Action in Mobile App]
            │
            ▼
[Context Trigger / React Query Hook]
            │
            ├─► (Local State)  ──► [AsyncStorage / Cache]
            │
            └─► (Remote API)   ──► [Express Server Router]
                                         │
                                         ▼
                                  [Drizzle Query]
                                         │
                                         ▼
                                   [PostgreSQL]
```
