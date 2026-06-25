# Engineering Decisions Log

This log registers the rationale behind major architectural choices and package integrations within the project.

---

## D1: pnpm Monorepo Workspaces
* **Decision**: Organize the project as a pnpm monorepo consisting of `/artifacts/mobile`, `/artifacts/api-server`, and `/lib/` packages.
* **Reason**: Allows seamless code sharing (e.g., sharing database schemas and REST API specifications), ensures absolute path imports, and optimizes developer workspace builds.
* **Alternatives considered**: Separate repositories (adds overhead to sync changes), Single huge package (hard to separate mobile app code from backend server libraries).

---

## D2: Expo Router (SDK 54)
* **Decision**: Adopt Expo Router for the React Native mobile application's layout system.
* **Reason**: File-based routing maps routing folders directly to application states (tabs, teacher portal, admin screens), supports automated deep linking, and integrates clean route transitions out-of-the-box.
* **Alternatives considered**: React Navigation native containers (requires verbose layout declaration in a single file).

---

## D3: Drizzle ORM + PostgreSQL
* **Decision**: Utilize Drizzle ORM for database connection and table declarations.
* **Reason**: Provides clean type safety, lightweight bundle output, and SQL-like query performance. Integrates with Zod schemas to automate input validation.
* **Alternatives considered**: Prisma (heavier, custom query engine layer can slow down dev start times).

---

## D4: Firebase Integration
* **Decision**: Use Firebase Auth and Firestore alongside Postgres.
* **Reason**: Speeds up authentication setup on mobile, provides native Google/Social login pipelines, and offloads user state storage (e.g. online presence, chat details). Relational data still mapped inside PostgreSQL database.
* **Alternatives considered**: Supabase Auth (already committed to Firebase for mobile push configuration).

---

## D5: Public Landing Page Entry Point
* **Decision**: Add `app/index.tsx` as an unauthenticated Landing Page entry route, with redirection gates handling authenticated routes.
* **Reason**: Improves onboarding UX by allowing guest viewing of course listings, tutor directories, and statistics before forcing credentials screens.
* **Alternatives considered**: Directly forcing users to the `login.tsx` view on start (creates friction for new users).
