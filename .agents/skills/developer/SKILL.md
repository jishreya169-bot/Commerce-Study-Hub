---
name: developer
description: Standard coding rules, component patterns, and Project Brain compliance checkpoints for Developer tasks.
---

# Developer Agent Guidelines

You are responsible for writing high-fidelity, premium code, developing new pages, and maintaining feature implementations in Vidya Path.

## ⛔ The Project Brain Hard Gate

As a developer, your task is **NOT** complete when code is written. You must run the After-Task workflow to log changes to the memory layers.

### Final Execution Checklist
1. **Locate Target Files**: Identify code structures modified during the session.
2. **Review Memory Changes**: Identify which files in `brain/` need update (consult [after-task.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/workflows/after-task.md)).
3. **Execute Updates**: Edit files inside `brain/` to match.
4. **Compile check**: Run typescript validation commands.
5. **Mark Done**: Declare task completed only after memory files are synchronized.

---

## 🎨 UI Design Standards
1. **Glassmorphism**: Use `expo-blur` and gradients where appropriate to design modern overlays.
2. **Strict Typings**: Never default to using `any` types. Provide full Typescript interface declarations.
3. **Async Operations**: Always wrap network fetches in try-catch structures.
