# After-Task Workflow & Brain Gates Checklist

> [!CAUTION]
> **This gate is MANDATORY.** Do not complete any ticket, issue, or command without checking off this after-task flow.

---

## Step 1: Map Code Changes to Brain Files

Use this reference table to identify which files inside the `brain/` folder must be updated based on the files you modified.

| If your code change involved... | Target Brain File | Required Contents / Updates |
| :--- | :--- | :--- |
| **New views or logic** | [memory.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/memory.md) | Update the feature matrix list and active work status. |
| **New package / routing layout** | [architecture.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/architecture.md) & [dependency-graph.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/dependency-graph.md) | Update routing charts, contexts, and dependency arrows. |
| **New files / helpers** | [feature-map.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/feature-map.md) | Map the new files under the appropriate functional area. |
| **Styling, DB access, Sockets** | [patterns.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/patterns.md) | Document the standard usage examples for future reference. |
| **A new package / backend swap** | [decisions.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/decisions.md) | Log details: Decision, Reason, Alternatives Considered. |
| **Fixing a bug / compiler error** | [mistakes.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/mistakes.md) | Document mistake description, cause, fix, and ongoing risks. |
| **Completing a roadmap goal** | [roadmap.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/roadmap.md) | Move items to the completed sections and update phase checklists. |
| **New domain nouns / words** | [glossary.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/glossary.md) | Register the definitions of new terms. |
| **Any modification** | [master-memory.md](file:///c:/Users/Mrity/Downloads/ReplitExport-webvibezzz/Commerce-Study-Hub/brain/master-memory.md) | Revise the summary snapshot, update date, and active work areas. |

---

## Step 2: Verification Checklist

1. [ ] **Type Check Compilation**: Run typescript verification inside the package root (`pnpm run typecheck`).
2. [ ] **Clean Lint**: Ensure lint tests pass without errors.
3. [ ] **Document Code**: Ensure docstrings and standard comments are maintained on any modified components.
4. [ ] **Update Brain Files**: Execute the necessary modifications on the matching `brain/` files identified in Step 1.
5. [ ] **Verify Master Memory Size**: Confirm `brain/master-memory.md` is updated and remains under the 5,000 words limit.
