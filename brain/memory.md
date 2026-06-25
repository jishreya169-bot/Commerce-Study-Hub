# Central Project Memory

## 1. Project Description
**Vidya Path** (Commerce Study Hub) is a comprehensive online learning ecosystem built specifically for Commerce stream students. It provides access to video lectures, notes, academic support, assessment tools, and doubts management. Additionally, it offers dedicated panels for Teachers to manage coursework and student submissions, and a premium Admin dashboard to monitor system diagnostics, enrollment reports, financial statistics, and scheduling.

---

## 2. Core Features Matrix

| Feature | Target Audience | Status | Description |
| :--- | :--- | :--- | :--- |
| **Landing Page** | Public / All | `Live` | Clean introductory portal highlighting features, stats, testimonials, and access pathways. |
| **Authentication** | All Users | `Live` | Secure email & password login using Firebase Auth, with automatic role redirection (Student, Teacher, Admin, Parent). Includes quick demo login buttons. |
| **Admin Dashboard** | Admin | `Live` | Overhauled command center with active counters, quick action grids, fee defaulter alert lists, and top student lists. |
| **Admin Academics & Finance** | Admin | `Live` | Dedicated screens for reviewing course allocations, fee tables, and administrative communications. |
| **Student Dashboard** | Student | `Live` | Tab-based system (`courses`, `doubts`, `materials`, `notifications`, `profile`, `tests`) designed for student navigation. |
| **Teacher Dashboard** | Teacher | `Live` | Tab-based portal (`classes`, `doubts`, `notifications`, `profile`, `students`, `upload`) for checking active tasks and publishing files. |
| **Doubts Solver** | Student / Teacher | `Live` | Dedicated tabs for listing, reviewing, and responding to student doubt tickets. |
| **Notes & Materials** | Student / Teacher | `Live` | Centralized study handouts repository (PDFs, docs). |

---

## 3. Current Project State
The project is currently configured as a pnpm monorepo containing:
1. `artifacts/mobile`: Expo application configured with Expo Router, `@expo-google-fonts/poppins`, and firebase auth hooks.
2. `artifacts/api-server`: Simple Node/TypeScript Express server.
3. `lib/db`: Database layer using Drizzle ORM connecting to PostgreSQL.
4. `lib/api-spec`: Orval and OpenAPI specifications.

---

## 4. Active Work Areas
* **Project Brain System Setup**: Creating a persistent project intelligence layer at `brain/` to avoid context amnesia during AI-powered development.
* **Database Schema Finalization**: Designing table associations in PostgreSQL using Drizzle ORM schemas.
