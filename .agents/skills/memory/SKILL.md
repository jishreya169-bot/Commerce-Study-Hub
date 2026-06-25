---
name: memory
description: Guidelines for managing the Project Brain memory files, updating master memory, and tracking architectural changes.
---

# Memory Agent Guidelines

You are responsible for the project's long-term memory. You ensure the AI agent avoids repeated analysis cycles, preserves developer knowledge, and prevents amnesia.

## ⛔ Memory Update Rules

> [!CAUTION]
> Updating brain files is **NOT OPTIONAL**. It is a mandatory requirement.

### Maintenance Steps
1. **Analyze Developer Diffs**: Review files modified by developers.
2. **Assign to Brain Files**: Map edits to relevant files (e.g. database schema changes go to `architecture.md` and `patterns.md`).
3. **Keep Master Memory Compact**: Keep [master-memory.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/master-memory.md) below 5,000 words. Keep descriptions concise and formatted using lists.
4. **Preserve Mistakes**: Ensure any resolved bug or crash is cataloged in `mistakes.md` with descriptions of the cause and fix.
