# Requirements Document

## Introduction

This document defines the requirements for restructuring the cv-ngocnq skill roadmap project. The project contains several monolithic component files (largest: 2,149 lines) with significant code duplication across types, utilities, and localStorage logic. The restructuring extracts shared concerns into dedicated modules and splits large components into focused sub-components, all without changing runtime behavior. The refactoring proceeds in 7 ordered phases with strict build verification between each.

## Glossary

- **Refactoring_System**: The overall process and tooling that applies structural changes to the codebase
- **Build_System**: The Next.js build pipeline invoked via `npm run build`
- **Barrel_Export**: An `index.ts` file that re-exports all public symbols from a directory
- **Phase**: A discrete, atomic unit of work in the refactoring sequence
- **Component_File**: A `.tsx` or `.ts` source file containing React components or logic
- **Type_Module**: A TypeScript file in `src/types/` defining shared type definitions
- **Utility_Module**: A TypeScript file in `src/lib/roadmap/` containing pure utility functions
- **Hook_Module**: A TypeScript file in `src/hooks/` containing custom React hooks
- **Composition_Root**: The top-level component file that composes sub-components together
- **Sub_Component**: A focused component extracted from a monolithic file (≤ 300 lines)

## Requirements

### Requirement 1: Phase-Sequential Build Verification

**User Story:** As a developer, I want each refactoring phase to pass the build before proceeding to the next, so that I can detect breakages early and maintain a working codebase at all times.

#### Acceptance Criteria

1. WHEN a phase is completed, THE Build_System SHALL execute `npm run build` and confirm it exits with code 0 and produces no compilation errors before the next phase begins
2. IF a phase causes a build failure, THEN THE Refactoring_System SHALL revert that phase's changes to the pre-phase commit state and attempt a fix, up to a maximum of 2 fix attempts per phase
3. IF all fix attempts for a phase are exhausted and the build still fails, THEN THE Refactoring_System SHALL leave the phase reverted, halt the refactoring sequence, and report the phase number and build error output
4. THE Refactoring_System SHALL execute phases in dependency order: Phase 1 → 2 → 3 → 4,5,6 (parallel) → 7
5. IF any one of the parallel phases (4, 5, or 6) fails and exhausts its fix attempts, THEN THE Refactoring_System SHALL cancel the remaining in-progress parallel phases, revert all parallel phase changes, and halt the sequence

### Requirement 2: Shared Type Extraction

**User Story:** As a developer, I want all duplicated type definitions extracted to a single `src/types/` directory, so that there is one source of truth for each type and changes propagate consistently.

#### Acceptance Criteria

1. WHEN the shared type extraction is performed, THE Refactoring_System SHALL create a `src/types/` directory containing one or more TypeScript type definition files organized by domain: roadmap, progress, comments, flashcards, quizzes, and backup
2. WHEN the shared type extraction is performed, THE Refactoring_System SHALL create a barrel export file (`src/types/index.ts`) that re-exports every type intended for use outside the `src/types/` directory
3. WHEN a type with the same name and identical structure is defined in 2 or more files within `src/components/` or `src/app/`, THE Refactoring_System SHALL define that type exactly once in `src/types/` and replace all duplicate definitions with imports referencing the single definition
4. THE Refactoring_System SHALL preserve the original type names, property names, and property types of each extracted type without modification
5. IF two definitions of the same type name have differing structures across files, THEN THE Refactoring_System SHALL produce the most complete (superset) definition and flag the discrepancy for manual review
6. WHEN all duplicate type definitions have been replaced with imports, THE Refactoring_System SHALL verify that the project compiles without TypeScript errors by running the existing type-check command successfully
7. THE Refactoring_System SHALL ensure that no extracted type file in `src/types/` contains runtime logic, component code, or framework-specific imports — only type declarations and type-only imports

### Requirement 3: Utility Function Extraction

**User Story:** As a developer, I want shared utility functions extracted to `src/lib/roadmap/`, so that duplicated logic is consolidated and independently testable.

#### Acceptance Criteria

1. WHEN Phase 2 is completed, THE Refactoring_System SHALL have created a `src/lib/roadmap/` directory containing utility modules for constants, flatten-tasks, storage, normalize, filters, prompts, and backup
2. WHEN Phase 2 is completed, THE Refactoring_System SHALL have created a barrel export (`src/lib/roadmap/index.ts`) that re-exports all public functions from the directory
3. WHEN a utility function was previously duplicated across multiple files (defined in 2 or more files), THE Refactoring_System SHALL define that function exactly once in `src/lib/roadmap/` and replace all duplicates with imports
4. THE Refactoring_System SHALL preserve the original function names, signatures, and behavior without modification
5. WHEN all duplicate utility functions have been replaced with imports, THE Refactoring_System SHALL verify that existing tests pass without modification

### Requirement 4: Custom Hook Extraction

**User Story:** As a developer, I want stateful logic (useState + useEffect patterns) extracted into reusable custom hooks in `src/hooks/`, so that components are smaller and state logic is reusable.

#### Acceptance Criteria

1. WHEN Phase 3 is completed, THE Refactoring_System SHALL have created a `src/hooks/` directory containing one hook module file per domain: `useLocalStorage`, `useProgress`, `useNoteComments`, `useFlashcardDecks`, `useQuizDecks`, `useGithubBackup`, and `useRoadmapFilters`, where each file exports a single named custom hook function prefixed with `use`
2. WHEN Phase 3 is completed, THE Refactoring_System SHALL have created a barrel export (`src/hooks/index.ts`) that re-exports every `use`-prefixed function exported from hook module files in the directory
3. THE Refactoring_System SHALL preserve the original state management behavior such that each extracted hook produces identical state transitions, localStorage read/write operations, and API request sequences (including optimistic updates and rollback on failure) as the inline logic it replaces
4. WHEN Phase 3 is completed, THE Refactoring_System SHALL have updated all components that previously contained the inline useState + useEffect patterns to import and invoke the corresponding custom hook from `src/hooks/` instead of defining that state logic inline

### Requirement 5: SkillRoadmapClient Component Split

**User Story:** As a developer, I want the 2,149-line SkillRoadmapClient monolith split into focused sub-components, so that each file is readable and maintainable.

#### Acceptance Criteria

1. WHEN Phase 4 is completed, THE Refactoring_System SHALL have created a `src/components/roadmap/client/` directory containing a composition root file (`SkillRoadmapClient.tsx`) that imports and assembles the sub-components: RoadmapHeroCard, RoadmapBackupPanel, RoadmapFilterBar, RoadmapTrackCard, TaskNode, and Metric
2. WHEN Phase 4 is completed, THE Refactoring_System SHALL have created a barrel export (`src/components/roadmap/client/index.ts`) that re-exports `SkillRoadmapClient` as the public API
3. WHEN Phase 4 is completed, THE Refactoring_System SHALL ensure every file in `src/components/roadmap/client/` contains 300 or fewer total lines including blank lines and comments
4. WHEN Phase 4 is completed, THE Refactoring_System SHALL have removed the original monolith file, and all existing imports that referenced it SHALL resolve to the barrel export without modification by consumers
5. WHEN Phase 4 is completed, THE Refactoring_System SHALL ensure the rendered output and interactive behavior of the SkillRoadmapClient component remain identical to the pre-split version

### Requirement 6: MarkdownCommentThreads Component Split

**User Story:** As a developer, I want the ~1,860-line MarkdownCommentThreads component split into focused sub-components, so that the comment system is maintainable.

#### Acceptance Criteria

1. WHEN Phase 5 is completed, THE Refactoring_System SHALL have created a `src/components/roadmap/comments/` directory containing the composition root and sub-components (CommentThread, CommentBubble, CommentForm, AiProviderSettings, CommentSearchBar), where each sub-component resides in its own file
2. WHEN Phase 5 is completed, THE Refactoring_System SHALL have created a barrel export (`src/components/roadmap/comments/index.ts`) that re-exports `MarkdownCommentThreads` as the public API, preserving all previously exported identifiers
3. WHEN Phase 5 is completed, THE Refactoring_System SHALL ensure every file in `src/components/roadmap/comments/` contains 300 lines or fewer
4. WHEN Phase 5 is completed, THE Refactoring_System SHALL ensure the refactored component produces identical rendered DOM output and user-observable behavior (comment creation, AI streaming, deletion, thread navigation, localStorage persistence) as the original single-file implementation
5. WHEN Phase 5 is completed, THE Refactoring_System SHALL have relocated all shared utility functions (buildCommentTree, createComment, formatDate, summarizeMarkdown) into dedicated module files within `src/components/roadmap/comments/`, with no logic duplicated across files

### Requirement 7: TaskFlashcards, TaskQuiz, and TaskDetail Component Splits

**User Story:** As a developer, I want the TaskFlashcards, TaskQuiz, and TaskDetail components split into focused sub-components, so that each file is readable and maintainable.

#### Acceptance Criteria

1. WHEN Phase 6 is completed, THE Refactoring_System SHALL have created `src/components/roadmap/flashcards/`, `src/components/roadmap/quiz/`, and `src/components/roadmap/task-detail/` directories, each containing a composition root and at least 2 sub-component files
2. WHEN Phase 6 is completed, THE Refactoring_System SHALL have created barrel exports (`index.ts`) in each directory that re-export the original component names (`SkillRoadmapTaskFlashcards`, `SkillRoadmapTaskQuiz`, `SkillRoadmapTaskDetail`) so that all existing import paths resolve without modification
3. WHEN Phase 6 is completed, THE Refactoring_System SHALL ensure every file in these directories contains 300 lines or fewer
4. WHEN Phase 6 is completed, THE Refactoring_System SHALL pass the project's TypeScript type-check and build without errors, confirming no regressions from the component split

### Requirement 8: Page File Cleanup

**User Story:** As a developer, I want page files to import shared utilities instead of containing duplicate function definitions, so that the codebase has no redundant code.

#### Acceptance Criteria

1. WHEN Phase 7 is completed, THE Refactoring_System SHALL have removed all local `flattenTasks()` and `getTaskContexts()` function definitions from every page file under `src/app/skill-roadmap/`
2. WHEN Phase 7 is completed, THE Refactoring_System SHALL have replaced each removed local definition with an import statement referencing `@/lib/roadmap/flatten-tasks`
3. WHEN Phase 7 is completed, THE Build_System SHALL pass `npm run build` with zero TypeScript type errors and zero module resolution errors
4. WHEN Phase 7 is completed, THE Refactoring_System SHALL ensure that no file under `src/app/` contains a locally-defined function named `flattenTasks` or `getTaskContexts`

### Requirement 9: File Size Constraint

**User Story:** As a developer, I want every file created or modified by this refactoring to stay at 300 lines or fewer, so that the codebase remains readable and navigable.

#### Acceptance Criteria

1. THE Refactoring_System SHALL ensure every source code file created by the refactoring contains 300 lines or fewer, where line count includes all lines (code, comments, and blank lines) terminated by a newline character
2. THE Refactoring_System SHALL ensure every source code file modified by the refactoring contains 300 lines or fewer
3. IF a file modified by the refactoring exceeds 300 lines and cannot be reduced without breaking existing functionality, THEN THE Refactoring_System SHALL split the file into two or more files each containing 300 lines or fewer while preserving all existing public interfaces
4. THE Refactoring_System SHALL apply the 300-line constraint to all source code files (.ts, .tsx) but SHALL exclude auto-generated files and dependency lock files

### Requirement 10: Behavioral Equivalence

**User Story:** As a developer, I want the refactoring to produce zero behavior changes, so that existing functionality continues to work identically for end users.

#### Acceptance Criteria

1. THE Refactoring_System SHALL preserve identical DOM structure and text content in rendered output for all components when provided the same props, state, and context
2. THE Refactoring_System SHALL preserve identical side effects (localStorage reads/writes, API calls) for all components, maintaining the same invocation count, argument values, and call sequence order for a given user interaction
3. THE Refactoring_System SHALL preserve all original named exports importable from their original paths or via barrel re-exports
4. WHEN the refactored codebase is compiled, THE Refactoring_System SHALL produce zero TypeScript type errors as reported by `tsc --noEmit`
5. THE Refactoring_System SHALL preserve identical user-observable responses to event handlers (click, submit, navigation, keyboard) such that the same user action produces the same resulting state change and UI update

### Requirement 11: Barrel Export Completeness

**User Story:** As a developer, I want every new directory to have a complete barrel export, so that consumers can import from a single entry point.

#### Acceptance Criteria

1. THE Refactoring_System SHALL create an `index.ts` barrel export file in every directory created or restructured during the refactoring (`src/types/`, `src/lib/roadmap/`, `src/hooks/`, and each `src/components/roadmap/*` subdirectory)
2. WHEN a module within a barrel-exported directory contains a symbol declared with the `export` keyword (including `export type`), THE Barrel_Export SHALL re-export that symbol using a named re-export statement
3. THE Refactoring_System SHALL preserve original export names without renaming
4. IF two or more modules within the same barrel-exported directory export symbols with identical names, THEN THE Refactoring_System SHALL resolve the conflict by using a namespace re-export for the conflicting module and SHALL NOT silently drop any export

### Requirement 12: Import Resolution

**User Story:** As a developer, I want all new imports using path aliases (`@/types`, `@/lib/roadmap`, `@/hooks`) to resolve correctly, so that TypeScript compilation succeeds.

#### Acceptance Criteria

1. THE Refactoring_System SHALL ensure all imports using `@/types`, `@/lib/roadmap`, `@/hooks`, and `@/components/roadmap` resolve via the existing `@/*` → `./src/*` path alias in `tsconfig.json`, such that `npx tsc --noEmit` completes with zero path-resolution errors
2. IF a new import references a directory under `src/` that does not yet exist, THEN THE Refactoring_System SHALL create the directory and its corresponding index or module file before any import statement references it
3. IF the `tsconfig.json` `paths` configuration does not cover a newly introduced alias pattern, THEN THE Refactoring_System SHALL add the required path mapping entry to `tsconfig.json` before compilation
4. THE Refactoring_System SHALL introduce no circular dependencies between modules

### Requirement 13: No New Dependencies

**User Story:** As a developer, I want this refactoring to introduce no new npm dependencies, so that bundle size and supply chain risk remain unchanged.

#### Acceptance Criteria

1. THE Refactoring_System SHALL complete the entire refactoring using only packages already listed in the project's `package.json` `dependencies` and `devDependencies` sections at the time refactoring begins
2. THE Refactoring_System SHALL not add, remove, or change any entry in the `package.json` `dependencies` or `devDependencies` sections
3. THE Refactoring_System SHALL not add any import or require statement that references a package not already resolvable through the existing `package-lock.json` dependency tree

### Requirement 14: Normalize Functions — Defensive Parsing

**User Story:** As a developer, I want normalize functions to safely parse unknown input and return typed data or null, so that localStorage corruption cannot crash the application.

#### Acceptance Criteria

1. WHEN input of type `unknown` conforming to the expected object structure (all required fields present with correct types) is provided, THE Utility_Module SHALL return a fully populated object matching the declared TypeScript interface with no undefined fields
2. WHEN input is null, undefined, a non-object type, or an object missing required fields or containing fields of incorrect types, THE Utility_Module SHALL return null without throwing an exception
3. THE Utility_Module SHALL validate each field of the returned object at runtime by checking the JavaScript typeof (or Array.isArray for arrays) for every required property, assigning documented default values for optional properties that are missing or invalid
4. WHEN input is a collection (array) containing a mixture of valid and invalid items, THE Utility_Module SHALL filter out invalid items and return only the valid subset, or reject the entire collection by returning null, as documented per normalize function

### Requirement 15: Tree Traversal Correctness

**User Story:** As a developer, I want `flattenTasks` to correctly traverse the task tree, so that all tasks are accessible for filtering, search, and progress tracking.

#### Acceptance Criteria

1. WHEN a `RoadmapTask[]` array containing one or more tasks is provided, THE Utility_Module SHALL return a flat array containing every task node exactly once, including tasks whose `children` property is undefined or an empty array
2. WHEN a `RoadmapTask[]` array is provided, THE Utility_Module SHALL preserve DFS pre-order traversal so that each parent task appears at a lower index than any of its descendants
3. WHEN a task tree with nested children is provided, THE Utility_Module SHALL return a result whose length equals the total number of nodes in the tree, counted as 1 per task plus the recursive count of all descendant tasks
4. THE Utility_Module SHALL not mutate the input task tree, including not modifying, reordering, or replacing any `children` arrays within the tree
5. WHEN an empty `RoadmapTask[]` array is provided, THE Utility_Module SHALL return an empty array

### Requirement 16: Filter Task Tree Structure Preservation

**User Story:** As a developer, I want `filterTaskTree` to preserve the parent-child hierarchy when filtering, so that filtered views maintain correct tree structure.

#### Acceptance Criteria

1. WHEN a predicate matches a descendant task, THE Utility_Module SHALL include all ancestor tasks from the root to that descendant in the result, with each ancestor's `children` array containing only the branches that lead to matching descendants
2. WHEN the predicate returns false for every task in the tree, THE Utility_Module SHALL return an empty array
3. THE Utility_Module SHALL return new object references for all included nodes and SHALL not modify any property of the input task array or its nested tasks
4. WHEN the identity predicate (always returns true) is applied, THE Utility_Module SHALL return a tree with the same node count, same hierarchy depth, and same property values as the input
5. WHEN a parent task matches the predicate but none of its descendants match, THE Utility_Module SHALL include that parent with its `children` array containing only descendants that match the predicate
