# Design Document

## Overview

This document defines the architecture for consolidating 14 groups of duplicated code across the Next.js "live-resume" project into shared modules. The refactoring introduces a new `src/lib/api/` module for API-route utilities, a generic hook factory, shared seed/format helpers in `src/lib/roadmap/`, and shared UI components — all while maintaining zero runtime behavior changes and zero new dependencies.

## Architecture

The deduplication follows a layered extraction pattern:

```
src/
├── lib/
│   ├── api/                    ← NEW: API route shared utilities
│   │   ├── index.ts            (barrel export)
│   │   ├── parsers.ts          (readTask, readComments)
│   │   ├── providers.ts        (resolveBaseUrl, resolveApiKey, usesEnvApiKey, providerBaseUrls)
│   │   └── similarity.ts       (normalizeForSimilarity, tokenSet, jaccardSimilarity, etc.)
│   └── roadmap/
│       ├── index.ts            (existing barrel — extended)
│       ├── constants.ts        (existing — already has levelStyles)
│       ├── seed-helpers.ts     ← NEW: isRecord, normalizeSeedProgress, readSeedComments
│       ├── format.ts           ← NEW: shared formatDate
│       ├── hydration.ts        ← NEW: useEffect hydration helper
│       └── ...existing files
├── hooks/
│   ├── index.ts                (existing barrel — extended)
│   ├── useDataDecks.ts         ← NEW: generic hook factory
│   ├── useFlashcardDecks.ts    (becomes thin wrapper)
│   ├── useQuizDecks.ts         (becomes thin wrapper)
│   └── useNoteComments.ts      (becomes thin wrapper)
├── components/roadmap/
│   ├── client/Metric.tsx       (existing — becomes single source)
│   ├── shared/
│   │   └── TaskPageHeader.tsx  ← NEW: page boilerplate helper
│   └── comments/
│       ├── ai-stream.ts        ← NEW: AI streaming helper
│       └── ...existing files
```

## Components and Interfaces

### 1. API Utilities Module — `src/lib/api/`

#### `src/lib/api/index.ts` (Barrel Export)

```typescript
// Re-exports all public symbols from the module
export { isNonEmptyString, normalizeBaseUrl, compactText, jsonError } from './parsers';
export { resolveBaseUrl, resolveApiKey, usesEnvApiKey, providerBaseUrls } from './providers';
export { normalizeForSimilarity, tokenSet, jaccardSimilarity, isSimilarToExisting, hasTooMuchOverlap } from './similarity';
export { readTask, readComments } from './parsers';
export type { ChatCompletionResponse, ChatCompletionChunk, ParsedTask, ParsedComment } from './providers';
```

#### `src/lib/api/parsers.ts`

Consolidates validation helpers and request parsing functions shared across all AI routes.

```typescript
import { NextResponse } from 'next/server';

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function compactText(value: string, maxLength: number): string {
  const compacted = value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (compacted.length <= maxLength) return compacted;
  return `${compacted.slice(0, maxLength).trim()}\n\n[Context đã được rút gọn để giới hạn payload.]`;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export type ParsedTask = {
  id: string;
  title: string;
  level: string;
  deliverable: string;
};

export type ParsedComment = {
  author?: string;
  body?: string;
  createdAt?: string;
};

export function readTask(value: unknown): ParsedTask | null { /* ... */ }
export function readComments(value: unknown): ParsedComment[] { /* ... */ }
```

#### `src/lib/api/providers.ts`

Consolidates AI provider resolution logic from comment and models routes.

```typescript
export type ChatCompletionResponse = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

export type ChatCompletionChunk = {
  choices?: Array<{
    delta?: { content?: string };
    message?: { content?: string };
  }>;
  error?: { message?: string };
};

export const providerBaseUrls: Record<string, string> = {
  kilo: 'https://api.kilo.ai/api/gateway',
  openrouter: 'https://openrouter.ai/api/v1',
};

export function resolveBaseUrl(provider: string, baseUrl: unknown): string | null { /* ... */ }
export function resolveApiKey(provider: string, apiKey: unknown): string { /* ... */ }
export function usesEnvApiKey(provider: string, apiKey: unknown): boolean { /* ... */ }
```

#### `src/lib/api/similarity.ts`

Consolidates text similarity logic from flashcards and quizzes routes.

```typescript
export function normalizeForSimilarity(value: string): string { /* ... */ }
export function tokenSet(value: string): Set<string> { /* ... */ }
export function jaccardSimilarity(left: string, right: string): number { /* ... */ }
export function isSimilarToExisting(text: string, existing: string[], threshold?: number): boolean { /* ... */ }

// Generic version accepting an accessor function
export function hasTooMuchOverlap<T>(
  items: T[],
  accessor: (item: T) => string,
  existing: string[],
  overlapThreshold?: number
): boolean { /* ... */ }
```

### 2. Seed Helpers — `src/lib/roadmap/seed-helpers.ts`

Consolidates `isRecord`, `normalizeSeedProgress`, and `readSeedComments` from 4+ files.

```typescript
import type { ProgressFile, ProgressItem, NoteComment } from '@/types';

export function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

export function normalizeSeedProgress(input: unknown): ProgressFile | null { /* ... */ }
export function readSeedComments(input: unknown): Record<string, NoteComment[]> { /* ... */ }
```

### 3. Format Utilities — `src/lib/roadmap/format.ts`

Single `formatDate` implementation for the project.

```typescript
export function formatDate(value: string | null): string {
  if (!value) return 'Chưa có dữ liệu';
  try {
    return new Intl.DateTimeFormat('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value));
  } catch {
    return value ?? 'Chưa có dữ liệu';
  }
}
```

### 4. Hydration Helper — `src/lib/roadmap/hydration.ts`

Encapsulates the 40-line useEffect hydration pattern used by 5+ page components.

```typescript
import type { ProgressFile, NoteComment, FlashcardDeck, QuizDeck } from '@/types';

export type HydrationConfig = {
  progressSetter?: (progress: ProgressFile) => void;
  commentsSetter?: (comments: Record<string, NoteComment[]>) => void;
  flashcardsSetter?: (flashcards: Record<string, FlashcardDeck[]>) => void;
  quizzesSetter?: (quizzes: Record<string, QuizDeck[]>) => void;
  seedUrl?: string;
  /** Keys to skip hydrating from seed (already present in localStorage) */
  skipSeedKeys?: Array<'progress' | 'comments' | 'flashcards' | 'quizzes'>;
};

/**
 * Reads localStorage synchronously via queueMicrotask, fetches seed for missing keys,
 * and invokes the appropriate setters. Returns a cleanup function for useEffect.
 */
export function hydrateFromStorage(config: HydrationConfig): () => void { /* ... */ }
```

### 5. AI Streaming Helper — `src/components/roadmap/comments/ai-stream.ts`

Encapsulates the streaming comment pattern used by 3 components.

```typescript
import type { NoteComment } from '@/types';

export type AiStreamCallbacks = {
  persistComments: (taskId: string, comments: NoteComment[]) => void;
  addStreamingId: (id: string) => void;
  removeStreamingId: (id: string) => void;
  onError: (message: string) => void;
  getComments: (taskId: string) => NoteComment[];
};

export type AiStreamOptions = {
  taskId: string;
  question: string;
  parentId: string | null;
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  confirmPassword: string;
  markdownContext?: string;
  studyContext?: string;
  threadContext?: string;
};

/**
 * Creates user comment, creates AI placeholder, streams response from /api/ai/comment,
 * updates AI comment progressively, and rolls back on error.
 */
export async function streamAiComment(
  options: AiStreamOptions,
  callbacks: AiStreamCallbacks
): Promise<void> { /* ... */ }
```

### 6. Generic Hook Factory — `src/hooks/useDataDecks.ts`

Produces typed localStorage-backed state hooks with a unified API.

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';

export type DataDecksReturn<T> = {
  dataByTask: Record<string, T[]>;
  getForTask: (taskId: string) => T[];
  setForTask: (taskId: string, items: T[]) => void;
  add: (taskId: string, item: T) => void;
  remove: (taskId: string, itemId: string) => void;
  replaceAll: (data: Record<string, T[]>) => void;
};

export function useDataDecks<T extends { id: string }>(
  readStored: () => Record<string, T[]>,
  storeAll: (data: Record<string, T[]>) => void
): DataDecksReturn<T> { /* ... */ }
```

**Thin wrapper example** (`useFlashcardDecks.ts` — under 15 lines):

```typescript
'use client';
import type { FlashcardDeck } from '@/types';
import { readStoredFlashcards, storeFlashcards } from '@/lib/roadmap';
import { useDataDecks } from './useDataDecks';

export function useFlashcardDecks() {
  const { dataByTask, getForTask, setForTask, add, remove, replaceAll } =
    useDataDecks<FlashcardDeck>(readStoredFlashcards, storeFlashcards);
  return {
    flashcardsByTask: dataByTask,
    getDecksForTask: getForTask,
    setDecksForTask: setForTask,
    addDeck: add,
    removeDeck: remove,
    replaceAllFlashcards: replaceAll,
  };
}
```

### 7. Shared Metric Component — `src/components/roadmap/client/Metric.tsx`

The existing Metric component becomes the single source. An optional `variant` prop is added for layout differences:

```typescript
'use client';
import type { ComponentType } from 'react';

export type MetricVariant = 'default' | 'card';

interface MetricProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  variant?: MetricVariant;
}

export function Metric({ icon: Icon, label, value, variant = 'default' }: MetricProps) { /* ... */ }
```

### 8. Page Header Helper — `src/components/roadmap/shared/TaskPageHeader.tsx`

Reduces repetitive page-level setup across task sub-pages.

```typescript
'use client';
import type { ComponentType } from 'react';
import Link from 'next/link';
import { Metric } from '@/components/roadmap/client/Metric';

export type MetricDef = {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

export type TaskPageHeaderProps = {
  backHref: string;
  backLabel: string;
  title: string;
  taskId: string;
  deckCountBadge?: string;
  metrics: MetricDef[];
};

export function TaskPageHeader(props: TaskPageHeaderProps) { /* ... */ }
```

### 9. Content Requirement Helper — `src/lib/roadmap/seed-helpers.ts`

```typescript
export type ContentType = 'flashcard' | 'quiz';

export function getContentRequirement({
  completed,
  hasNote,
  contentType,
}: {
  completed: boolean;
  hasNote: boolean;
  contentType: ContentType;
}): string | null { /* ... */ }
```

## Data Models

No new data models are introduced. All existing types in `src/types/` remain unchanged:

- `ProgressFile`, `ProgressItem` — progress state
- `NoteComment`, `CommentNode` — comment data
- `FlashcardDeck`, `Flashcard` — flashcard data
- `QuizDeck`, `QuizQuestion`, `QuizAttempt` — quiz data
- `RoadmapBackupFile`, `GithubBackupConfig` — backup data

## Error Handling

Error handling remains identical to the current implementation:

1. **API routes**: `jsonError()` returns structured `{ error: string }` with appropriate HTTP status
2. **localStorage operations**: silent catch with in-memory fallback (existing pattern)
3. **AI streaming**: rollback to pre-AI state on fetch error (encapsulated in `streamAiComment`)
4. **Seed parsing**: returns `null` on invalid input (consumers handle null case)

## Implementation Phases

| Phase | Scope | Build Gate |
|-------|-------|------------|
| 1 | `src/lib/api/` — parsers, providers, similarity, barrel | `npm run build` |
| 2 | `src/lib/roadmap/` — seed-helpers, format, hydration | `npm run build` |
| 3 | `src/hooks/useDataDecks.ts` + thin wrappers | `npm run build` |
| 4 | `src/components/roadmap/` — Metric, TaskPageHeader, ai-stream | `npm run build` |
| 5 | Route migration — update all API routes to import from `@/lib/api` | `npm run build` |
| 6 | Component migration — update pages to use shared helpers | `npm run build` |

## Testing Strategy

**Unit tests** verify specific examples and edge cases for each extracted module:
- Each API utility function (parsers, providers, similarity) gets example-based tests for known inputs
- Seed helpers tested with representative valid/invalid JSON shapes
- `getContentRequirement` tested exhaustively (only 4 input combinations per content type)
- Component rendering tests for Metric variant prop and TaskPageHeader

**Property tests** verify universal invariants across randomized inputs (≥100 iterations each):
- Pure functions in `src/lib/api/` (isNonEmptyString, normalizeBaseUrl, compactText, jsonError, similarity functions)
- Parsing functions (readTask, readComments, normalizeSeedProgress)
- Hook factory behavioral equivalence
- File size constraint across all modified files

**Integration tests** verify side-effect-heavy patterns:
- Hydration helper with mocked localStorage
- AI streaming helper with mocked fetch
- Build gate (`npm run build` exits 0) after each phase

**Smoke tests** verify structural requirements:
- No new dependencies in package.json
- No local duplicates of consolidated functions (grep-based)
- Barrel exports resolve correctly

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: isNonEmptyString guards correctly

*For any* arbitrary value, `isNonEmptyString(value)` returns `true` if and only if the value is of type `string` and `value.trim().length > 0`.

**Validates: Requirements 1.1**

### Property 2: normalizeBaseUrl is idempotent

*For any* URL string `s`, applying `normalizeBaseUrl(normalizeBaseUrl(s))` produces the same result as `normalizeBaseUrl(s)`, and the result contains no trailing slashes and no leading/trailing whitespace.

**Validates: Requirements 1.2**

### Property 3: compactText respects length invariant

*For any* text string and positive `maxLength`, the output of `compactText(text, maxLength)` has a trimmed length that, when the raw compacted form exceeds `maxLength`, produces output where the meaningful content portion (before the truncation indicator) has length ≤ `maxLength`. Additionally, the output never contains three or more consecutive newlines.

**Validates: Requirements 1.3**

### Property 4: jsonError produces correct response shape

*For any* error message string and HTTP status code integer, `jsonError(message, status)` returns a response whose JSON body is `{ error: message }` and whose status is the provided status code.

**Validates: Requirements 1.4**

### Property 5: Jaccard similarity is symmetric and bounded

*For any* two strings `a` and `b`, `jaccardSimilarity(a, b) === jaccardSimilarity(b, a)` (symmetry) and the result is in the range `[0, 1]` inclusive.

**Validates: Requirements 3.1**

### Property 6: normalizeForSimilarity is idempotent

*For any* string `s`, `normalizeForSimilarity(normalizeForSimilarity(s)) === normalizeForSimilarity(s)`.

**Validates: Requirements 3.1**

### Property 7: hasTooMuchOverlap generic accessor equivalence

*For any* array of objects with a string field, `hasTooMuchOverlap(items, accessor, existing)` produces the same result as manually extracting the strings via the accessor and computing overlap — ensuring the generic version behaves identically to the original specialized versions.

**Validates: Requirements 3.2**

### Property 8: readTask validation round-trip

*For any* valid `ParsedTask` object (all fields non-empty strings), wrapping it in an object and passing to `readTask` returns a `ParsedTask` with all fields trimmed. For any object missing a required field or with an empty-after-trim field, `readTask` returns `null`.

**Validates: Requirements 4.1**

### Property 9: readComments preserves only valid entries

*For any* array of objects, `readComments(array)` returns only entries where `body` is a non-empty string, and each returned object has `author` defaulting to `'user'` when missing.

**Validates: Requirements 4.2**

### Property 10: normalizeSeedProgress round-trip

*For any* valid `ProgressFile` object, serializing it to JSON and passing through `normalizeSeedProgress` returns an equivalent `ProgressFile`. For invalid input shapes, it returns `null`.

**Validates: Requirements 5.1**

### Property 11: isRecord type guard correctness

*For any* value, `isRecord(value)` returns `true` if and only if `value` is a non-null, non-array object (i.e., `typeof value === 'object' && value !== null && !Array.isArray(value)`).

**Validates: Requirements 5.3**

### Property 12: formatDate produces consistent locale output

*For any* valid ISO date string, `formatDate(dateString)` produces a non-empty string. For `null` input, it returns the default message `'Chưa có dữ liệu'`.

**Validates: Requirements 8.3**

### Property 13: Hook factory behavioral equivalence

*For any* sequence of `add`, `remove`, `setForTask`, and `replaceAll` operations applied to a `useDataDecks<T>` instance, the resulting `dataByTask` state is identical to the state produced by the original dedicated hook (`useFlashcardDecks`, `useQuizDecks`, or `useNoteComments`) given the same operation sequence.

**Validates: Requirements 10.2, 10.3, 10.4**

### Property 14: File size constraint

*For all* files created or modified by this refactoring, the file contains no more than 300 lines of code.

**Validates: Requirements 14.1**
