# Mistakes & Prevention Log

This log lists resolved issues, bugs, and performance bottlenecks to ensure they are not repeated in future tasks.

---

## 1. Documented Mistakes

### M1: Unhandled Promises causing Application Crashes
* **Problem**: Network request errors inside UI views caused random app freezes or crash cycles.
* **Cause**: Promise operations used raw `.then()` chaining without trailing `.catch()` handlers.
* **Fix**: Standardized the use of `try-catch` structures inside all `async` hooks and actions.
* **Status**: Resolved.

### M2: Missing Font Validation Render Glitch
* **Problem**: When the mobile app booted, text components fell back to basic sans-serif styles or crashed due to font loading races.
* **Cause**: Rendered screen layouts before confirming Poppins fonts were successfully loaded.
* **Fix**: Added font validation condition checks to `app/_layout.tsx` to delay rendering until fonts are loaded.
* **Status**: Resolved.

### M3: Invalid Artifact Paths in File Creation
* **Problem**: Tool operations fail when trying to assign chat artifact metadata parameters to files located in the project's repository directories.
* **Cause**: Artifact metadata is only accepted for files written to the local conversation directory (`<appDataDir>/brain/<conversation-id>/`).
* **Fix**: Only specify `ArtifactMetadata` when creating/editing chat documents inside the conversation folder.
* **Status**: Resolved.

---

## 2. Ongoing Risk Areas
1. **Drizzle Schema Migrations**: When updating Drizzle schemas in `lib/db/src/schema/`, remember to run migrations to sync the PostgreSQL database state.
2. **Platform Specific UI Checks**: When adding premium styles (such as glassmorphism BlurView or shadow styles), always wrap with `Platform.OS === 'ios'` or equivalent checks to prevent Android lag or compatibility errors.
