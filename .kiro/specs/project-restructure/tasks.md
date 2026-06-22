# Implementation Plan: Project Restructure

## Overview

Restructure the cv-ngocnq skill roadmap project by extracting shared types, utilities, and hooks into dedicated modules, then splitting monolithic components into focused sub-components (each ≤ 300 lines). Seven phases executed in dependency order: Phase 1 → 2 → 3 → 4,5,6 (parallel) → 7. Each phase must pass `npm run build` before proceeding.

## Tasks

- [x] 1. Phase 1 — Extract shared types to `src/types/`
  - [x] 1.1 Create type definition files for all domains
    - Create `src/types/roadmap.ts` with `RoadmapTask`, `RoadmapModule`, `RoadmapTrack`, `Roadmap`, `TaskContext`, `TaskIndex` types
    - Create `src/types/progress.ts` with `ProgressItem`, `ProgressFile`, `StudyStatusFilter` types
    - Create `src/types/comments.ts` with `NoteComment`, `CommentNode` types
    - Create `src/types/flashcards.ts` with `Flashcard`, `FlashcardDeck` types
    - Create `src/types/quizzes.ts` with `QuizQuestion`, `QuizAttempt`, `QuizDeck` types
    - Create `src/types/backup.ts` with `RoadmapBackupFile`, `GithubBackupConfig` types (importing from sibling type files)
    - _Requirements: 2.1, 2.4, 2.7_

  - [x] 1.2 Create barrel export and replace duplicate type definitions
    - Create `src/types/index.ts` barrel exporting all types from each domain file
    - Find and remove all duplicate type definitions in `src/components/` and `src/app/`
    - Replace removed definitions with `import type { ... } from '@/types'`
    - Verify no runtime logic exists in any `src/types/` file
    - _Requirements: 2.2, 2.3, 2.5, 2.6, 11.1, 11.2, 12.1_

  - [x] 1.3 Build verification for Phase 1
    - Run `npm run build` and confirm exit code 0
    - Run `npx tsc --noEmit` and confirm zero type errors
    - _Requirements: 1.1, 1.4, 10.4_

- [x] 2. Phase 2 — Extract utilities to `src/lib/roadmap/`
  - [x] 2.1 Create utility module files
    - Create `src/lib/roadmap/constants.ts` — storage keys, level styles, filter options
    - Create `src/lib/roadmap/flatten-tasks.ts` — `flattenTasks`, `flattenTasksWithContext`, `getTaskContexts`
    - Create `src/lib/roadmap/storage.ts` — all localStorage read/write/remove functions
    - Create `src/lib/roadmap/normalize.ts` — `normalizeProgress`, `normalizeCommentsByTask`, `normalizeFlashcardsByTask`, `normalizeQuizzesByTask`, `normalizeRoadmapBackup`
    - Create `src/lib/roadmap/filters.ts` — `filterTaskTree`, `matchesTaskStudyStatus`, `collectTaskSearchText`
    - Create `src/lib/roadmap/prompts.ts` — `buildLearningPrompt`
    - Create `src/lib/roadmap/backup.ts` — `buildRoadmapBackup`, `normalizeRoadmapBackup`
    - Import types from `@/types` in all utility files
    - _Requirements: 3.1, 3.3, 3.4, 14.1, 14.2, 14.3, 15.1, 15.2, 15.3, 15.4, 16.1, 16.2, 16.3, 16.4_

  - [x] 2.2 Create barrel export and replace duplicate utility functions
    - Create `src/lib/roadmap/index.ts` barrel exporting all public functions
    - Remove duplicate `flattenTasks()` and `getTaskContexts()` from component files
    - Remove duplicate utility functions from all files that had copies
    - Replace with imports from `@/lib/roadmap`
    - _Requirements: 3.2, 3.3, 11.1, 11.2, 12.1_

  - [x] 2.3 Build verification for Phase 2
    - Run `npm run build` and confirm exit code 0
    - Run `npx tsc --noEmit` and confirm zero type errors
    - _Requirements: 1.1, 1.4, 3.5, 10.4_


- [x] 3. Phase 3 — Extract custom hooks to `src/hooks/`
  - [x] 3.1 Create hook module files
    - Create `src/hooks/useLocalStorage.ts` — generic localStorage state sync hook
    - Create `src/hooks/useProgress.ts` — progress state, saveTask, toggleTask, sync logic
    - Create `src/hooks/useNoteComments.ts` — comments localStorage state hook
    - Create `src/hooks/useFlashcardDecks.ts` — flashcards localStorage state hook
    - Create `src/hooks/useQuizDecks.ts` — quizzes localStorage state hook
    - Create `src/hooks/useGithubBackup.ts` — GitHub backup config + push logic hook
    - Create `src/hooks/useRoadmapFilters.ts` — filter/search/expand state hook
    - Import types from `@/types` and utilities from `@/lib/roadmap`
    - _Requirements: 4.1, 4.3, 12.1, 12.4_

  - [x] 3.2 Create barrel export and update components to use hooks
    - Create `src/hooks/index.ts` barrel exporting all `use`-prefixed hook functions
    - Update components that had inline useState + useEffect patterns to import hooks from `@/hooks`
    - Remove the replaced inline state logic from components
    - _Requirements: 4.2, 4.4, 11.1, 11.2_

  - [x] 3.3 Build verification for Phase 3
    - Run `npm run build` and confirm exit code 0
    - Run `npx tsc --noEmit` and confirm zero type errors
    - _Requirements: 1.1, 1.4, 10.4_

- [x] 4. Phase 4 — Split SkillRoadmapClient into sub-components
  - [x] 4.1 Create sub-component files in `src/components/roadmap/client/`
    - Create `src/components/roadmap/client/Metric.tsx` — reusable metric display component
    - Create `src/components/roadmap/client/RoadmapHeroCard.tsx` — stats/metrics display
    - Create `src/components/roadmap/client/RoadmapBackupPanel.tsx` — import/export/GitHub backup UI
    - Create `src/components/roadmap/client/RoadmapFilterBar.tsx` — search, level filter, status filter, expand/collapse
    - Create `src/components/roadmap/client/TaskNode.tsx` — individual task row (recursive)
    - Create `src/components/roadmap/client/RoadmapTrackCard.tsx` — track card with modules
    - Each file ≤ 300 lines, importing hooks from `@/hooks` and types from `@/types`
    - _Requirements: 5.1, 5.3, 9.1, 9.2_

  - [x] 4.2 Create composition root and barrel export
    - Create `src/components/roadmap/client/SkillRoadmapClient.tsx` — composition root (~150 lines) importing and assembling all sub-components
    - Create `src/components/roadmap/client/index.ts` barrel re-exporting `SkillRoadmapClient`
    - Remove the original monolithic SkillRoadmapClient file
    - Update all existing imports to resolve via barrel or verify they already do
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 10.1, 10.2, 10.3, 11.1_

- [x] 5. Phase 5 — Split MarkdownCommentThreads into sub-components
  - [x] 5.1 Create sub-component files in `src/components/roadmap/comments/`
    - Create `src/components/roadmap/comments/CommentBubble.tsx` — individual comment display
    - Create `src/components/roadmap/comments/CommentForm.tsx` — comment composer/editor
    - Create `src/components/roadmap/comments/CommentThread.tsx` — thread view with tree rendering
    - Create `src/components/roadmap/comments/AiProviderSettings.tsx` — AI provider configuration
    - Create `src/components/roadmap/comments/CommentSearchBar.tsx` — search within comments
    - Each file ≤ 300 lines
    - _Requirements: 6.1, 6.3, 6.5, 9.1, 9.2_

  - [x] 5.2 Create composition root and barrel export
    - Create `src/components/roadmap/comments/MarkdownCommentThreads.tsx` — composition root
    - Create `src/components/roadmap/comments/index.ts` barrel re-exporting `MarkdownCommentThreads`
    - Remove the original monolithic file
    - Update all existing imports to resolve via barrel
    - _Requirements: 6.2, 6.4, 10.1, 10.2, 10.3, 11.1_

- [x] 6. Phase 6 — Split TaskFlashcards, TaskQuiz, and TaskDetail
  - [x] 6.1 Split TaskFlashcards into `src/components/roadmap/flashcards/`
    - Create `src/components/roadmap/flashcards/FlashcardStudyPanel.tsx` — card study UI
    - Create `src/components/roadmap/flashcards/FlashcardFace.tsx` — card face rendering
    - Create `src/components/roadmap/flashcards/SkillRoadmapTaskFlashcards.tsx` — composition root
    - Create `src/components/roadmap/flashcards/index.ts` barrel re-exporting `SkillRoadmapTaskFlashcards`
    - Each file ≤ 300 lines
    - _Requirements: 7.1, 7.2, 7.3, 9.1_

  - [x] 6.2 Split TaskQuiz into `src/components/roadmap/quiz/`
    - Create `src/components/roadmap/quiz/QuizSessionPanel.tsx` — active quiz UI
    - Create `src/components/roadmap/quiz/QuizResultPanel.tsx` — results display
    - Create `src/components/roadmap/quiz/QuizHistoryPanel.tsx` — past attempts
    - Create `src/components/roadmap/quiz/SkillRoadmapTaskQuiz.tsx` — composition root
    - Create `src/components/roadmap/quiz/index.ts` barrel re-exporting `SkillRoadmapTaskQuiz`
    - Each file ≤ 300 lines
    - _Requirements: 7.1, 7.2, 7.3, 9.1_

  - [x] 6.3 Split TaskDetail into `src/components/roadmap/task-detail/`
    - Create `src/components/roadmap/task-detail/ChildTaskRow.tsx` — child task display
    - Create `src/components/roadmap/task-detail/TaskDetailInfo.tsx` — detail metadata
    - Create `src/components/roadmap/task-detail/SkillRoadmapTaskDetail.tsx` — composition root
    - Create `src/components/roadmap/task-detail/index.ts` barrel re-exporting `SkillRoadmapTaskDetail`
    - Each file ≤ 300 lines
    - _Requirements: 7.1, 7.2, 7.3, 9.1_

- [ ] 7. Checkpoint — Verify Phases 1–6
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Phase 7 — Page file cleanup
  - [x] 8.1 Remove duplicate functions from page files
    - Remove local `flattenTasks()` definition from `src/app/skill-roadmap/tasks/[taskId]/page.tsx`
    - Remove local `flattenTasks()` definition from `src/app/skill-roadmap/tasks/[taskId]/flashcards/page.tsx`
    - Remove local `flattenTasks()` definition from `src/app/skill-roadmap/tasks/[taskId]/quiz/page.tsx`
    - Remove local `getTaskContexts()` from all page files that define it
    - Replace with `import { flattenTasks, getTaskContexts } from '@/lib/roadmap/flatten-tasks'`
    - Verify no file under `src/app/` contains a locally-defined `flattenTasks` or `getTaskContexts`
    - _Requirements: 8.1, 8.2, 8.4_

- [ ] 9. Final checkpoint — Full build and lint verification
  - Run `npm run build`, `npm run typecheck`, and `npm run lint`
  - Ensure all pass with zero errors
  - Verify no circular dependencies introduced
  - Ensure all tests pass, ask the user if questions arise.

- [ ]* 10. Property-based tests for extracted utilities
  - [ ]* 10.1 Write property test for flattenTasks node count invariant
    - **Property 6: flattenTasks Node Count Invariant**
    - Install `fast-check` as devDependency, set up test runner if not present
    - Generate arbitrary task trees and verify `flattenTasks(tree).length === countAllNodes(tree)`
    - **Validates: Requirements 15.1, 15.3**

  - [ ]* 10.2 Write property test for flattenTasks DFS ordering
    - **Property 7: flattenTasks DFS Ordering**
    - For any task tree, verify every parent appears before its children in flattened output
    - **Validates: Requirements 15.2**

  - [ ]* 10.3 Write property test for tree operation immutability
    - **Property 8: Tree Operation Immutability**
    - Deep-clone input tree, call flattenTasks and filterTaskTree, verify input unchanged
    - **Validates: Requirements 15.4, 16.3**

  - [ ]* 10.4 Write property test for filterTaskTree ancestor preservation
    - **Property 9: filterTaskTree Ancestor Preservation**
    - For any tree and predicate, if a descendant is in the result, all ancestors are too
    - **Validates: Requirements 16.1**

  - [ ]* 10.5 Write property test for filterTaskTree identity and empty
    - **Property 10: filterTaskTree Identity**
    - **Property 11: filterTaskTree Empty Predicate**
    - Verify `filterTaskTree(tree, () => true)` is structurally equivalent to input
    - Verify `filterTaskTree(tree, () => false)` returns empty array
    - **Validates: Requirements 16.4, 16.2**

  - [ ]* 10.6 Write property tests for normalize functions
    - **Property 4: Normalize Valid Input Preservation**
    - **Property 5: Normalize Invalid Input Safety**
    - Generate arbitrary valid ProgressFile/NoteComment[]/FlashcardDeck[]/QuizDeck[] and verify round-trip
    - Generate arbitrary invalid inputs and verify null return without throwing
    - **Validates: Requirements 14.1, 14.2, 14.3**

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation between major phases
- Property tests validate universal correctness properties from the design document
- Phases 4, 5, and 6 can be executed in parallel after Phase 3 completes
- No behavior changes — this is purely structural refactoring
- All files must stay ≤ 300 lines
- `npm run build` must pass after every phase

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1"] },
    { "id": 1, "tasks": ["1.2"] },
    { "id": 2, "tasks": ["1.3"] },
    { "id": 3, "tasks": ["2.1"] },
    { "id": 4, "tasks": ["2.2"] },
    { "id": 5, "tasks": ["2.3"] },
    { "id": 6, "tasks": ["3.1"] },
    { "id": 7, "tasks": ["3.2"] },
    { "id": 8, "tasks": ["3.3"] },
    { "id": 9, "tasks": ["4.1", "5.1", "6.1", "6.2", "6.3"] },
    { "id": 10, "tasks": ["4.2", "5.2"] },
    { "id": 11, "tasks": ["4.3", "5.3", "6.4"] },
    { "id": 12, "tasks": ["8.1"] },
    { "id": 13, "tasks": ["8.2"] },
    { "id": 14, "tasks": ["10.1", "10.2", "10.3", "10.4", "10.5", "10.6"] }
  ]
}
```
