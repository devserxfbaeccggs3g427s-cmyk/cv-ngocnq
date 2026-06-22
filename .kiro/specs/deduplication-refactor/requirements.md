# Requirements Document

## Introduction

This specification defines requirements for eliminating code duplication across the Next.js project (live-resume). The project contains 14 identified groups of duplicated functions, types, patterns, and components spread across API routes, hooks, helpers, and UI components. The refactoring consolidates duplicates into shared modules (`src/lib/api/`, a generic hook factory, and shared helpers) while preserving identical runtime behavior, maintaining all existing import paths, and enforcing phased execution with build gates.

## Glossary

- **API_Utilities_Module**: The new barrel-exported module located at `src/lib/api/` that exposes shared API route utilities (validation, URL normalization, error helpers, types, and constants)
- **Hook_Factory**: A generic `useDataDecks<T>` factory function that produces typed localStorage-backed state hooks with get, set, add, remove, and replaceAll operations
- **Similarity_Module**: A shared module containing text normalization, tokenization, Jaccard similarity calculation, and overlap detection functions used by AI content generation routes
- **Seed_Helpers_Module**: A shared module exposing `normalizeSeedProgress`, `readSeedComments`, and `isRecord` for use by all components that hydrate seed data from the progress API
- **Hydration_Helper**: A helper function that encapsulates the useEffect-based localStorage hydration and seed-fetch pattern used across multiple page components
- **AI_Streaming_Helper**: A shared function encapsulating the pattern of creating a user comment, creating an AI placeholder comment, streaming the response, and handling rollback on error
- **Page_Boilerplate_Helper**: A helper function that reduces repetitive page-level setup code (back-link, header, metric grid) across task sub-pages
- **Build_Gate**: A verification step where `next build` (or `npm run build`) passes without errors after completing each phase of implementation
- **Barrel_Export**: An `index.ts` file that re-exports all public symbols from a module directory

## Requirements

### Requirement 1: API Validation Utilities Consolidation

**User Story:** As a developer, I want a single source of truth for API validation helpers, so that changes to validation logic propagate consistently and route files remain concise.

#### Acceptance Criteria

1. THE API_Utilities_Module SHALL export a single `isNonEmptyString` function with the signature `(value: unknown) => value is string` that returns true when the value is a string with non-zero trimmed length.
2. THE API_Utilities_Module SHALL export a single `normalizeBaseUrl` function that trims whitespace and removes trailing slashes from a URL string.
3. THE API_Utilities_Module SHALL export a single `compactText` function that normalizes whitespace, collapses triple-or-more newlines, trims the result, and truncates with an indicator message when exceeding a given `maxLength` parameter.
4. THE API_Utilities_Module SHALL export a single `jsonError` function that returns a `NextResponse.json` with an `{ error: string }` body and the specified HTTP status code.
5. WHEN an API route file currently defines any of `isNonEmptyString`, `normalizeBaseUrl`, `compactText`, or `jsonError` locally, THE Build_System SHALL resolve the import from `@/lib/api` after refactoring.
6. THE API_Utilities_Module SHALL be structured as a directory with a Barrel_Export at `src/lib/api/index.ts`.
7. WHEN the API_Utilities_Module is created, THE Build_Gate SHALL pass with zero TypeScript errors and zero runtime behavior changes.

### Requirement 2: API Provider Resolution Consolidation

**User Story:** As a developer, I want shared provider resolution logic, so that adding a new AI provider requires changes in only one location.

#### Acceptance Criteria

1. THE API_Utilities_Module SHALL export `resolveBaseUrl`, `resolveApiKey`, and `usesEnvApiKey` functions with their current signatures and behavior from the comment and models routes.
2. THE API_Utilities_Module SHALL export a `providerBaseUrls` constant record mapping provider keys to their default base URL strings.
3. THE API_Utilities_Module SHALL export the `ChatCompletionResponse` type definition used by the flashcards, quizzes, and comment routes.
4. WHEN a route file currently defines `resolveBaseUrl`, `resolveApiKey`, `usesEnvApiKey`, `providerBaseUrls`, or `ChatCompletionResponse` locally, THE route file SHALL import the symbol from `@/lib/api` after refactoring.

### Requirement 3: Similarity Detection Consolidation

**User Story:** As a developer, I want similarity detection logic in one module, so that threshold tuning or algorithm changes apply to both flashcards and quizzes simultaneously.

#### Acceptance Criteria

1. THE Similarity_Module SHALL export `normalizeForSimilarity`, `tokenSet`, `jaccardSimilarity`, `isSimilarToExisting`, and `hasTooMuchOverlap` functions.
2. THE `hasTooMuchOverlap` function SHALL accept a generic array of items and a string accessor, so that both flashcard-front and quiz-question callers can use the same function.
3. WHEN the flashcards route or quizzes route currently defines any similarity function locally, THE route file SHALL import the function from the Similarity_Module after refactoring.
4. THE Similarity_Module SHALL reside within `src/lib/api/` and be re-exported through the Barrel_Export.

### Requirement 4: Route Request Parsing Consolidation

**User Story:** As a developer, I want shared request parsing helpers for the flashcards and quizzes routes, so that adding new fields requires changes in only one place.

#### Acceptance Criteria

1. THE API_Utilities_Module SHALL export a `readTask` function that validates and extracts `{ id, title, level, deliverable }` from an unknown input.
2. THE API_Utilities_Module SHALL export a `readComments` function that validates and extracts an array of `{ author, body, createdAt }` objects from an unknown input.
3. WHEN the flashcards or quizzes route currently defines `readTask` or `readComments` locally, THE route file SHALL import the function from `@/lib/api` after refactoring.

### Requirement 5: Seed Data Helpers Consolidation

**User Story:** As a developer, I want one canonical implementation of seed normalization, so that fixing a parsing edge case in one place fixes all consumers.

#### Acceptance Criteria

1. THE Seed_Helpers_Module SHALL export a single `normalizeSeedProgress` function that parses unknown JSON into a typed `ProgressFile | null`.
2. THE Seed_Helpers_Module SHALL export a single `readSeedComments` function that parses unknown JSON into a `Record<string, NoteComment[]>`.
3. THE Seed_Helpers_Module SHALL export a single `isRecord` type guard function with the signature `(input: unknown) => input is Record<string, unknown>`.
4. WHEN any component or helper file currently defines `normalizeSeedProgress`, `readSeedComments`, or `isRecord` locally, THE file SHALL import the function from the Seed_Helpers_Module after refactoring.
5. THE Seed_Helpers_Module SHALL reside at `src/lib/roadmap/seed-helpers.ts` and be re-exported through the existing `src/lib/roadmap/index.ts` barrel.

### Requirement 6: Data Hydration Pattern Consolidation

**User Story:** As a developer, I want a reusable hydration helper, so that the 40-line useEffect pattern is written once and parameterized per page.

#### Acceptance Criteria

1. THE Hydration_Helper SHALL accept a configuration object specifying which localStorage keys to read, which seed fields to hydrate, and corresponding state setters.
2. THE Hydration_Helper SHALL preserve the existing behavior: read localStorage synchronously via `queueMicrotask`, fetch seed data only for missing keys, respect a cancellation flag, and call `storeProgress`/`storeComments`/`storeFlashcards`/`storeQuizzes` as appropriate.
3. WHEN a component currently contains the full useEffect hydration pattern (SkillRoadmapTaskDetail, SkillRoadmapTaskFlashcards, SkillRoadmapTaskQuiz, MarkdownCommentThreadDetail, MarkdownCommentThreads), THE component SHALL use the Hydration_Helper after refactoring.
4. THE Hydration_Helper SHALL reside in `src/lib/roadmap/` and be exported through the existing barrel.

### Requirement 7: AI Streaming Logic Consolidation

**User Story:** As a developer, I want a single AI streaming helper, so that error handling, rollback, and streaming-state updates are consistent across all comment components.

#### Acceptance Criteria

1. THE AI_Streaming_Helper SHALL encapsulate the pattern of: creating a user comment, appending it to the comment list, creating an AI placeholder, initiating a fetch to `/api/ai/comment`, reading the response stream chunk-by-chunk, updating the AI comment body progressively, and rolling back to the pre-AI state on error.
2. THE AI_Streaming_Helper SHALL accept callbacks for persisting comments, updating streaming IDs, and reporting errors, so that each component retains control of its own state.
3. WHEN MarkdownCommentThreads, MarkdownCommentThreadDetail, or StudyCommentThread currently implements the full streaming pattern inline, THE component SHALL delegate to the AI_Streaming_Helper after refactoring.
4. THE AI_Streaming_Helper SHALL reside in `src/components/roadmap/comments/` alongside the existing comment utilities.

### Requirement 8: Shared Formatting Utilities Consolidation

**User Story:** As a developer, I want one `formatDate` function and one `levelStyles` constant import, so that locale or style changes propagate everywhere.

#### Acceptance Criteria

1. THE existing `levelStyles` constant in `src/lib/roadmap/constants.ts` SHALL be the single source used by SkillRoadmapTaskDetail, ChildTaskRow, and any other file that currently defines `levelStyles` locally.
2. WHEN a component file currently defines a local `levelStyles` constant, THE file SHALL import `levelStyles` from `@/lib/roadmap` after refactoring.
3. THE Seed_Helpers_Module or a dedicated `src/lib/roadmap/format.ts` file SHALL export a single `formatDate` function with the signature `(value: string | null) => string` that formats dates using `vi-VN` locale.
4. WHEN a helper file (flashcards/helpers.ts, quiz-helpers.ts, TaskDetailInfo.tsx, utils.ts) currently defines `formatDate` locally, THE file SHALL import the shared `formatDate` after refactoring.

### Requirement 9: Requirement Helper Consolidation

**User Story:** As a developer, I want one requirement-check function parameterized by content type, so that updating precondition messages requires a single edit.

#### Acceptance Criteria

1. THE Seed_Helpers_Module or `src/lib/roadmap/` SHALL export a single `getContentRequirement` function (or retain both `getFlashcardRequirement` and `getQuizRequirement` pointing to shared logic) that accepts `{ completed: boolean; hasNote: boolean; contentType: 'flashcard' | 'quiz' }` and returns a requirement message string or null.
2. WHEN `flashcards/helpers.ts` or `quiz-helpers.ts` currently defines `getFlashcardRequirement` or `getQuizRequirement` locally, THE file SHALL import from the shared location after refactoring.

### Requirement 10: Generic Hook Factory

**User Story:** As a developer, I want a hook factory that generates typed localStorage-backed deck hooks, so that adding a new deck type requires only a type parameter and storage key.

#### Acceptance Criteria

1. THE Hook_Factory SHALL be a generic function `useDataDecks<T>` that accepts a `storageKey` string and `readStored` / `storeAll` function pair, and returns `{ dataByTask, getForTask, setForTask, add, remove, replaceAll }`.
2. WHEN `useFlashcardDecks` is invoked, THE Hook_Factory SHALL produce behavior identical to the current `useFlashcardDecks` hook.
3. WHEN `useQuizDecks` is invoked, THE Hook_Factory SHALL produce behavior identical to the current `useQuizDecks` hook.
4. WHEN `useNoteComments` is invoked, THE Hook_Factory SHALL produce behavior identical to the current `useNoteComments` hook.
5. THE Hook_Factory SHALL reside at `src/hooks/useDataDecks.ts` and be exported through `src/hooks/index.ts`.
6. THE existing `useFlashcardDecks`, `useQuizDecks`, and `useNoteComments` hook files SHALL become thin wrappers (under 15 lines each) that call the Hook_Factory with appropriate type parameters.

### Requirement 11: Metric Component Consolidation

**User Story:** As a developer, I want one Metric component with layout variants, so that design changes to metric cards apply uniformly.

#### Acceptance Criteria

1. THE existing `src/components/roadmap/client/Metric.tsx` component SHALL be the single Metric implementation used across all pages.
2. WHEN SkillRoadmapTaskFlashcards or SkillRoadmapTaskQuiz currently defines a local `Metric` function, THE file SHALL import `Metric` from `@/components/roadmap/client/Metric` after refactoring.
3. WHEN TaskDetailInfo.tsx currently exports a `Metric` component, THE export SHALL be replaced by a re-export from `@/components/roadmap/client/Metric` or the file SHALL import the shared component.
4. IF a layout variant is needed (e.g., icon-left vs icon-top), THEN THE shared Metric component SHALL accept an optional `variant` prop defaulting to the current layout.

### Requirement 12: Page Boilerplate Reduction

**User Story:** As a developer, I want a page helper that handles the common back-link + header + metric-grid pattern, so that new task sub-pages require minimal template code.

#### Acceptance Criteria

1. THE Page_Boilerplate_Helper SHALL accept configuration for: back-link href and label, page title, task ID badge, optional deck-count badge, and an array of metric definitions (icon, label, value).
2. THE Page_Boilerplate_Helper SHALL render the back-link, header section with badges, and a responsive metric grid.
3. WHEN SkillRoadmapTaskFlashcards or SkillRoadmapTaskQuiz currently renders the header and metric grid inline, THE component SHALL use the Page_Boilerplate_Helper after refactoring.
4. THE Page_Boilerplate_Helper SHALL reside in `src/components/roadmap/shared/` or a similar shared directory.

### Requirement 13: No New Dependencies Constraint

**User Story:** As a developer, I want the refactoring to avoid new npm packages, so that bundle size and supply-chain risk remain unchanged.

#### Acceptance Criteria

1. THE refactoring SHALL NOT add any new entries to `dependencies` or `devDependencies` in `package.json`.
2. THE refactoring SHALL use only standard TypeScript, React, and Next.js APIs already available in the project.

### Requirement 14: File Size and Architecture Constraints

**User Story:** As a developer, I want enforceable file size and dependency rules, so that the refactoring does not introduce new maintenance burdens.

#### Acceptance Criteria

1. WHEN a file is created or modified by this refactoring, THE file SHALL contain no more than 300 lines of code.
2. THE refactoring SHALL NOT introduce circular import dependencies between any modules.
3. WHEN existing external consumers import from a path that existed before the refactoring, THE import path SHALL continue to resolve without modification to the consumer.
4. THE Build_Gate SHALL pass (`npm run build` exits with code 0) after each implementation phase is completed.
5. THE refactoring SHALL produce zero runtime behavior changes observable by end users (identical API responses, identical UI rendering, identical localStorage operations).
