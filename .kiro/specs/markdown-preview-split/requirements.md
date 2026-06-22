# Requirements Document

## Introduction

This document defines the requirements for splitting the monolithic `MarkdownPreview.tsx` component (1,241 lines) into 4–5 focused sub-components. The file currently contains markdown parsing, syntax highlighting/tokenization for 6+ language families, block rendering, inline rendering, and theme detection — all in a single file. The refactoring extracts these logical sections into separate modules within a `src/components/markdown/` directory, adds a barrel export (`index.ts`), and keeps every resulting file at 300 lines or fewer. Zero behavior changes, zero new dependencies, and the build must pass after completion.

## Glossary

- **MarkdownPreview_Component**: The existing `src/components/markdown/MarkdownPreview.tsx` file containing all markdown rendering logic
- **Barrel_Export**: An `index.ts` file that re-exports all public symbols from the `src/components/markdown/` directory
- **Sub_Component**: A focused `.tsx` or `.ts` file extracted from the monolith, containing ≤ 300 lines
- **Tokenizer**: A function that converts a code string into an array of `SyntaxToken` objects for syntax highlighting
- **Parser**: The `parseMarkdown` function and its helpers that convert raw markdown text into `MarkdownBlock[]`
- **Block_Renderer**: Functions that convert `MarkdownBlock` objects into React elements (JSX)
- **Inline_Renderer**: The `renderInlineMarkdown` function that handles bold, italic, links, images, and code spans within text
- **Build_System**: The Next.js build pipeline invoked via `npm run build`

## Requirements

### Requirement 1: File Decomposition Structure

**User Story:** As a developer, I want the monolithic MarkdownPreview.tsx split into 4–5 focused files within the same directory, so that each file has a single responsibility and is easy to navigate.

#### Acceptance Criteria

1. WHEN the split is completed, the `src/components/markdown/` directory SHALL contain between 4 and 6 files (inclusive of the barrel export `index.ts`)
2. WHEN the split is completed, the directory SHALL contain a composition root file (`MarkdownPreview.tsx`) that imports sub-modules and exports the `MarkdownPreview` component and `extractMarkdownHeadings` function
3. WHEN the split is completed, the directory SHALL contain a markdown parser module responsible for the `parseMarkdown` function and all its helper functions (table parsing, list parsing, blockquote/callout parsing, paragraph continuation logic)
4. WHEN the split is completed, the directory SHALL contain a syntax tokenizer module responsible for all `tokenize*` functions, language detection, keyword/type/boolean constant sets, and the `readMatch`/`readGenericWord`/`readSqlWord`/`readShellWord` helpers
5. WHEN the split is completed, the directory SHALL contain a block renderer module responsible for `renderBlock`, `renderHeading`, `CodeBlock`, `renderCodeLine`, `renderInlineMarkdown`, and supporting utilities (`getLanguageLabel`, `sanitizeUrl`, `slugifyHeading`, `stripInlineMarkdown`)

### Requirement 2: File Size Constraint

**User Story:** As a developer, I want every file in the markdown directory to be 300 lines or fewer, so that the codebase remains readable.

#### Acceptance Criteria

1. EVERY source file (`.ts`, `.tsx`) created or modified in `src/components/markdown/` SHALL contain 300 lines or fewer, where line count includes all lines (code, comments, blank lines)
2. IF the tokenizer module exceeds 300 lines due to the volume of language-specific keyword sets, it SHALL be split into two files (e.g., `tokenizers.ts` and `tokenizer-keywords.ts`) with each file ≤ 300 lines
3. The barrel export (`index.ts`) SHALL contain only re-export statements

### Requirement 3: Barrel Export Completeness

**User Story:** As a developer, I want a barrel export so that consumers can import from `@/components/markdown/MarkdownPreview` or from the directory index interchangeably.

#### Acceptance Criteria

1. WHEN the split is completed, an `index.ts` file SHALL exist at `src/components/markdown/index.ts`
2. The barrel export SHALL re-export the `MarkdownPreview` component (default or named export matching the current named export)
3. The barrel export SHALL re-export the `extractMarkdownHeadings` function
4. The barrel export SHALL re-export the `MarkdownHeading` type
5. ALL existing import paths (`@/components/markdown/MarkdownPreview`) SHALL continue to resolve without modification by consumers — the original file path must still work

### Requirement 4: Behavioral Equivalence

**User Story:** As a developer, I want zero behavior changes so that all existing consumers continue to work identically.

#### Acceptance Criteria

1. The refactored `MarkdownPreview` component SHALL produce identical DOM output for any given `content` prop value as the pre-split version
2. The refactored component SHALL preserve identical theme detection behavior (MutationObserver on `<html>` and `<body>`, `prefers-color-scheme` listener)
3. The refactored `extractMarkdownHeadings` function SHALL return identical results for any given input string
4. ALL existing imports from consumer files (`SkillRoadmapNotePreview.tsx`, `QuizSessionPanel.tsx`, `CommentBubble.tsx`, `useActiveHeading.ts`, `NotePreviewAppendix.tsx`) SHALL resolve without modification
5. The `MarkdownHeading` type export SHALL remain available from `@/components/markdown/MarkdownPreview`

### Requirement 5: No New Dependencies

**User Story:** As a developer, I want this refactoring to add no new npm packages, keeping bundle size and supply chain unchanged.

#### Acceptance Criteria

1. The refactoring SHALL use only packages already in the project's `package.json` at the time refactoring begins
2. No new `import` or `require` statements SHALL reference packages not already in `node_modules`
3. The `package.json` SHALL remain unmodified

### Requirement 6: Build Verification

**User Story:** As a developer, I want the build to pass after the split, confirming no regressions.

#### Acceptance Criteria

1. WHEN the split is completed, `npm run build` SHALL exit with code 0 and produce no TypeScript compilation errors
2. WHEN the split is completed, `npx tsc --noEmit` SHALL complete with zero type errors
3. WHEN the split is completed, all module resolution SHALL succeed — no "Cannot find module" or "Module not found" errors

### Requirement 7: Type Sharing Between Modules

**User Story:** As a developer, I want shared types (`MarkdownBlock`, `SyntaxToken`, `CalloutType`, etc.) accessible to all sub-modules without circular dependencies.

#### Acceptance Criteria

1. Shared internal types (`MarkdownBlock`, `ListItem`, `CalloutType`, `SyntaxTokenType`, `SyntaxToken`) SHALL be defined in a single location and imported by all sub-modules that need them
2. There SHALL be no circular import dependencies between any files in `src/components/markdown/`
3. The `MarkdownHeading` type SHALL remain exported from `MarkdownPreview.tsx` (preserving the existing public API path)
