# Implementation Plan: Deduplication Refactor

## Overview

Kế hoạch triển khai gộp 14 nhóm code trùng lặp vào shared modules theo 6 phase với build gate sau mỗi phase. Ngôn ngữ: TypeScript (Next.js). Mọi thay đổi đảm bảo zero runtime behavior change, zero new dependency.

## Tasks

- [x] 1. Phase 1 — Tạo module `src/lib/api/` (parsers, providers, similarity, barrel)

  - [x] 1.1 Tạo file `src/lib/api/parsers.ts` — trích xuất validation helpers và request parsers
    - Tạo file mới `src/lib/api/parsers.ts`
    - Import `NextResponse` từ `next/server`
    - Trích xuất hàm `isNonEmptyString` từ `src/app/api/ai/flashcards/route.ts` (dòng 63-65)
    - Trích xuất hàm `normalizeBaseUrl` từ `src/app/api/ai/flashcards/route.ts` (dòng 67-69)
    - Trích xuất hàm `compactText` từ `src/app/api/ai/flashcards/route.ts` (dòng 71-82)
    - Trích xuất hàm `jsonError` từ `src/app/api/ai/flashcards/route.ts` (dòng 84-86)
    - Trích xuất hàm `readTask` từ `src/app/api/ai/flashcards/route.ts` (dòng 88-108) — return type `ParsedTask | null`
    - Trích xuất hàm `readComments` từ `src/app/api/ai/flashcards/route.ts` (dòng 110-132) — return type `ParsedComment[]`
    - Export các types: `ParsedTask`, `ParsedComment`
    - Đảm bảo signature và behavior giống 100% bản gốc
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2_

  - [x] 1.2 Tạo file `src/lib/api/providers.ts` — trích xuất provider resolution logic
    - Tạo file mới `src/lib/api/providers.ts`
    - Trích xuất constant `providerBaseUrls` từ `src/app/api/ai/comment/route.ts` (dòng 49-52)
    - Trích xuất hàm `resolveBaseUrl` từ `src/app/api/ai/comment/route.ts` (dòng 58-68) — cần import `isNonEmptyString`, `normalizeBaseUrl` từ `./parsers`
    - Trích xuất hàm `resolveApiKey` từ `src/app/api/ai/comment/route.ts` (dòng 70-83)
    - Trích xuất hàm `usesEnvApiKey` từ `src/app/api/ai/comment/route.ts` (dòng 85-87)
    - Export types: `ChatCompletionResponse`, `ChatCompletionChunk` (trích từ comment route dòng 22-42)
    - Đảm bảo `resolveBaseUrl` đọc `process.env.AI_COMMENT_KILO_BASE_URL` cho provider `kilo`
    - Đảm bảo `resolveApiKey` đọc fallback chain: `AI_COMMENT_KILO_API_KEY` → `AI_COMMENT_API_KEY` → `AI_FLASHCARD_API_KEY`
    - _Requirements: 2.1, 2.2, 2.3_

  - [x] 1.3 Tạo file `src/lib/api/similarity.ts` — trích xuất text similarity logic
    - Tạo file mới `src/lib/api/similarity.ts`
    - Trích xuất hàm `normalizeForSimilarity` từ `src/app/api/ai/flashcards/route.ts` (dòng 159-166)
    - Trích xuất hàm `tokenSet` từ `src/app/api/ai/flashcards/route.ts` (dòng 168-173)
    - Trích xuất hàm `jaccardSimilarity` từ `src/app/api/ai/flashcards/route.ts` (dòng 175-189)
    - Trích xuất hàm `isSimilarToExisting` từ `src/app/api/ai/flashcards/route.ts` (dòng 191-193) — thêm optional param `threshold = 0.5`
    - Tạo hàm generic `hasTooMuchOverlap<T>(items: T[], accessor: (item: T) => string, existing: string[], overlapThreshold = 0.5): boolean`
    - Logic hàm generic: `items.length === 0 || existing.length === 0 → false`; đếm similar qua accessor; return `similarCount / items.length > overlapThreshold`
    - _Requirements: 3.1, 3.2_

  - [x] 1.4 Tạo file `src/lib/api/index.ts` — barrel export toàn bộ module
    - Tạo file mới `src/lib/api/index.ts`
    - Re-export từ `./parsers`: `isNonEmptyString`, `normalizeBaseUrl`, `compactText`, `jsonError`, `readTask`, `readComments`
    - Re-export types từ `./parsers`: `ParsedTask`, `ParsedComment`
    - Re-export từ `./providers`: `resolveBaseUrl`, `resolveApiKey`, `usesEnvApiKey`, `providerBaseUrls`
    - Re-export types từ `./providers`: `ChatCompletionResponse`, `ChatCompletionChunk`
    - Re-export từ `./similarity`: `normalizeForSimilarity`, `tokenSet`, `jaccardSimilarity`, `isSimilarToExisting`, `hasTooMuchOverlap`
    - _Requirements: 1.6, 3.4_

  - [ ]* 1.5 Viết property tests cho module `src/lib/api/`
    - **Property 1: isNonEmptyString guards correctly**
    - **Property 2: normalizeBaseUrl is idempotent**
    - **Property 3: compactText respects length invariant**
    - **Property 4: jsonError produces correct response shape**
    - **Property 5: Jaccard similarity is symmetric and bounded**
    - **Property 6: normalizeForSimilarity is idempotent**
    - **Property 7: hasTooMuchOverlap generic accessor equivalence**
    - **Property 8: readTask validation round-trip**
    - **Property 9: readComments preserves only valid entries**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 3.1, 3.2, 4.1, 4.2**

- [x] 2. Phase 1 Build Gate
  - Chạy `npm run build` — đảm bảo exit code 0, không lỗi TypeScript
  - Các file mới chưa được import bởi route nào → build phải pass vì barrel chỉ export
  - _Requirements: 14.4_

- [x] 3. Phase 2 — Tạo shared helpers trong `src/lib/roadmap/` (seed-helpers, format, hydration)

  - [x] 3.1 Tạo file `src/lib/roadmap/seed-helpers.ts` — gộp isRecord, normalizeSeedProgress, readSeedComments, getContentRequirement
    - Tạo file mới `src/lib/roadmap/seed-helpers.ts`
    - Trích xuất hàm `isRecord` từ `src/components/roadmap/flashcards/helpers.ts` (dòng 4-6)
    - Trích xuất hàm `normalizeSeedProgress` từ `src/components/roadmap/flashcards/helpers.ts` (dòng 8-37) — import types `ProgressFile`, `ProgressItem` từ `@/types`
    - Trích xuất hàm `readSeedComments` từ `src/components/roadmap/flashcards/helpers.ts` (dòng 39-66) — import type `NoteComment` từ `@/types`
    - Tạo hàm `getContentRequirement({ completed, hasNote, contentType }: { completed: boolean; hasNote: boolean; contentType: 'flashcard' | 'quiz' }): string | null`
    - Logic: `!completed && !hasNote` → message kết hợp (dùng `contentType` cho từ "flashcard"/"trắc nghiệm"); `!completed` → message riêng; `!hasNote` → message riêng; else → null
    - Export type `ContentType = 'flashcard' | 'quiz'`
    - _Requirements: 5.1, 5.2, 5.3, 9.1_

  - [x] 3.2 Tạo file `src/lib/roadmap/format.ts` — shared formatDate
    - Tạo file mới `src/lib/roadmap/format.ts`
    - Implement hàm `formatDate(value: string | null): string`
    - Logic: `!value` → return `'Chưa có dữ liệu'`; else → `new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(value))`
    - Wrap trong try/catch — catch return `value ?? 'Chưa có dữ liệu'`
    - _Requirements: 8.3_

  - [x] 3.3 Tạo file `src/lib/roadmap/hydration.ts` — useEffect hydration helper
    - Tạo file mới `src/lib/roadmap/hydration.ts`
    - Import types `ProgressFile`, `NoteComment`, `FlashcardDeck`, `QuizDeck` từ `@/types`
    - Import `storeProgress`, `storeComments`, `storeFlashcards`, `storeQuizzes`, `progressStorageKey`, `commentsStorageKey`, `flashcardsStorageKey`, `quizzesStorageKey` từ cùng module
    - Import `normalizeSeedProgress`, `readSeedComments` từ `./seed-helpers`
    - Định nghĩa type `HydrationConfig`:
      - `progressSetter?: (progress: ProgressFile) => void`
      - `commentsSetter?: (taskId: string, comments: NoteComment[]) => void`
      - `flashcardsSetter?: (taskId: string, decks: FlashcardDeck[]) => void`
      - `quizzesSetter?: (taskId: string, quizzes: QuizDeck[]) => void`
      - `taskId: string`
      - `seedUrl?: string` (default `/api/skill-roadmap/progress`)
      - `normalizeFlashcards?: (input: unknown) => Record<string, FlashcardDeck[]>`
      - `normalizeQuizzes?: (input: unknown) => Record<string, QuizDeck[]>`
      - `readSeedFlashcards?: (input: unknown) => Record<string, FlashcardDeck[]>`
      - `readSeedQuizzes?: (input: unknown) => Record<string, QuizDeck[]>`
    - Export hàm `hydrateFromStorage(config: HydrationConfig): () => void`
    - Behavior: đọc localStorage cho mỗi key → gọi setter qua `queueMicrotask` → track `hasLocal*` flags → fetch seed nếu thiếu → gọi store + setter → return cleanup `cancelled = true`
    - _Requirements: 6.1, 6.2, 6.4_

  - [x] 3.4 Cập nhật barrel `src/lib/roadmap/index.ts` — thêm exports mới
    - Thêm re-export từ `./seed-helpers`: `isRecord`, `normalizeSeedProgress`, `readSeedComments`, `getContentRequirement`
    - Thêm re-export type `ContentType` từ `./seed-helpers`
    - Thêm re-export `formatDate` từ `./format`
    - Thêm re-export `hydrateFromStorage` từ `./hydration`
    - Thêm re-export type `HydrationConfig` từ `./hydration`
    - _Requirements: 5.5, 6.4, 8.3_

  - [ ]* 3.5 Viết property tests cho seed-helpers và format
    - **Property 10: normalizeSeedProgress round-trip**
    - **Property 11: isRecord type guard correctness**
    - **Property 12: formatDate produces consistent locale output**
    - **Validates: Requirements 5.1, 5.3, 8.3**

- [x] 4. Phase 2 Build Gate
  - Chạy `npm run build` — đảm bảo exit code 0
  - Các file mới chỉ export, chưa được consume → build phải pass
  - _Requirements: 14.4_

- [x] 5. Phase 3 — Generic hook factory `src/hooks/useDataDecks.ts` + thin wrappers

  - [x] 5.1 Tạo file `src/hooks/useDataDecks.ts` — generic hook factory
    - Thêm directive `'use client'` ở đầu file
    - Import `useState`, `useEffect`, `useCallback` từ `react`
    - Định nghĩa type `DataDecksReturn<T>`:
      - `dataByTask: Record<string, T[]>`
      - `getForTask: (taskId: string) => T[]`
      - `setForTask: (taskId: string, items: T[]) => void`
      - `add: (taskId: string, item: T) => void`
      - `remove: (taskId: string, itemId: string) => void`
      - `replaceAll: (data: Record<string, T[]>) => void`
    - Export hàm `useDataDecks<T extends { id: string }>(readStored: () => Record<string, T[]>, storeAll: (data: Record<string, T[]>) => void): DataDecksReturn<T>`
    - Implement: `useState<Record<string, T[]>>({})` → `useEffect` gọi `readStored()` qua `queueMicrotask` → `getForTask` dùng `useCallback` trả `dataByTask[taskId] ?? []` → `setForTask` cập nhật state + gọi `storeAll` → `add` append item → `remove` filter by `id` → `replaceAll` set state + gọi `storeAll`
    - _Requirements: 10.1, 10.5_

  - [x] 5.2 Chuyển `src/hooks/useFlashcardDecks.ts` thành thin wrapper (≤15 dòng)
    - Giữ directive `'use client'`
    - Import `FlashcardDeck` từ `@/types`
    - Import `readStoredFlashcards`, `storeFlashcards` từ `@/lib/roadmap`
    - Import `useDataDecks` từ `./useDataDecks`
    - Gọi `useDataDecks<FlashcardDeck>(readStoredFlashcards, storeFlashcards)`
    - Map return: `dataByTask` → `flashcardsByTask`, `getForTask` → `getDecksForTask`, `setForTask` → `setDecksForTask`, `add` → `addDeck`, `remove` → `removeDeck`, `replaceAll` → `replaceAllFlashcards`
    - Xóa toàn bộ logic cũ (~65 dòng state + useEffect + callbacks)
    - _Requirements: 10.2, 10.6_

  - [x] 5.3 Chuyển `src/hooks/useQuizDecks.ts` thành thin wrapper (≤15 dòng)
    - Giữ directive `'use client'`
    - Import `QuizDeck` từ `@/types`
    - Import `readStoredQuizzes`, `storeQuizzes` từ `@/lib/roadmap`
    - Import `useDataDecks` từ `./useDataDecks`
    - Gọi `useDataDecks<QuizDeck>(readStoredQuizzes, storeQuizzes)`
    - Map return: `dataByTask` → `quizzesByTask`, `getForTask` → `getDecksForTask`, `setForTask` → `setDecksForTask`, `add` → `addDeck`, `remove` → `removeDeck`, `replaceAll` → `replaceAllQuizzes`
    - Xóa toàn bộ logic cũ (~65 dòng)
    - _Requirements: 10.3, 10.6_

  - [x] 5.4 Chuyển `src/hooks/useNoteComments.ts` thành thin wrapper (≤15 dòng)
    - Giữ directive `'use client'`
    - Import `NoteComment` từ `@/types`
    - Import `readStoredComments`, `storeComments` từ `@/lib/roadmap`
    - Import `useDataDecks` từ `./useDataDecks`
    - Gọi `useDataDecks<NoteComment>(readStoredComments, storeComments)`
    - Map return: `dataByTask` → `commentsByTask`, `getForTask` → `getCommentsForTask`, `setForTask` → `setCommentsForTask`, `add` → `addComment`, `remove` → `removeComment`, `replaceAll` → `replaceAllComments`
    - Xóa toàn bộ logic cũ (~65 dòng)
    - _Requirements: 10.4, 10.6_

  - [x] 5.5 Cập nhật barrel `src/hooks/index.ts` — export useDataDecks
    - Thêm dòng `export { useDataDecks } from './useDataDecks';`
    - Giữ nguyên các export hiện tại (useLocalStorage, useProgress, useNoteComments, useFlashcardDecks, useQuizDecks, useGithubBackup, useRoadmapFilters)
    - _Requirements: 10.5_

  - [ ]* 5.6 Viết property test cho hook factory behavioral equivalence
    - **Property 13: Hook factory behavioral equivalence**
    - Test: cho sequence operations (add, remove, setForTask, replaceAll), kết quả `dataByTask` phải giống kết quả từ hook cũ
    - **Validates: Requirements 10.2, 10.3, 10.4**

- [x] 6. Phase 3 Build Gate
  - Chạy `npm run build` — đảm bảo exit code 0
  - Hook wrappers giữ nguyên public API → không cần thay đổi consumers
  - _Requirements: 14.4_

- [x] 7. Phase 4 — Shared components (Metric variant, TaskPageHeader, ai-stream)

  - [x] 7.1 Cập nhật `src/components/roadmap/client/Metric.tsx` — thêm `variant` prop
    - Thêm type `MetricVariant = 'default' | 'card'`
    - Thêm optional prop `variant?: MetricVariant` vào interface `MetricProps` (default `'default'`)
    - Variant `'default'`: giữ layout hiện tại (icon-top, rounded-lg border, text-2xl)
    - Variant `'card'`: layout icon-left dùng `Card`+`CardContent` (dựa trên bản trong `SkillRoadmapTaskFlashcards.tsx` dòng cuối: icon trong bg-blue-50 p-2, text bên phải)
    - Export `MetricVariant` type
    - _Requirements: 11.1, 11.4_

  - [x] 7.2 Tạo file `src/components/roadmap/shared/TaskPageHeader.tsx` — page boilerplate helper
    - Tạo thư mục `src/components/roadmap/shared/` (nếu chưa có)
    - Thêm directive `'use client'`
    - Import `Link` từ `next/link`, `ArrowLeft` từ `lucide-react`, `Metric` từ `@/components/roadmap/client/Metric`
    - Định nghĩa type `MetricDef = { icon: ComponentType<{ className?: string }>; label: string; value: string }`
    - Định nghĩa type `TaskPageHeaderProps`:
      - `backHref: string`
      - `backLabel: string`
      - `title: string`
      - `taskId: string`
      - `deckCountBadge?: string`
      - `metrics: MetricDef[]`
      - `metricVariant?: MetricVariant`
      - `actions?: ReactNode`
    - Export component `TaskPageHeader(props)`:
      - Render back-link (ArrowLeft + backLabel, href=backHref)
      - Render taskId badge + deckCountBadge (nếu có)
      - Render h1 title
      - Render actions slot
      - Render responsive metric grid (`grid gap-4 md:grid-cols-2 lg:grid-cols-4`) mapping metrics qua `<Metric>`
    - _Requirements: 12.1, 12.2, 12.4_

  - [x] 7.3 Tạo file `src/components/roadmap/comments/ai-stream.ts` — AI streaming helper
    - Tạo file mới `src/components/roadmap/comments/ai-stream.ts`
    - Import type `NoteComment` từ `@/types`
    - Import `createComment`, `summarizeThread` từ `./utils`
    - Định nghĩa type `AiStreamCallbacks`:
      - `persistComments: (taskId: string, comments: NoteComment[]) => void`
      - `addStreamingId: (id: string) => void`
      - `removeStreamingId: (id: string) => void`
      - `onError: (message: string) => void`
      - `getComments: (taskId: string) => NoteComment[]`
    - Định nghĩa type `AiStreamOptions`:
      - `taskId`, `question`, `parentId`, `provider`, `model`, `apiKey`, `baseUrl`, `confirmPassword`
      - Optional: `markdownContext`, `studyContext`, `threadContext`
    - Export async function `streamAiComment(options, callbacks): Promise<void>`
    - Logic (trích từ `MarkdownCommentThreads.tsx` dòng 80-130):
      1. Tạo user comment → append vào current list → gọi `persistComments`
      2. Tạo AI placeholder (body='') → append → gọi `persistComments`
      3. Gọi `addStreamingId(aiReply.id)`
      4. Fetch `/api/ai/comment` với params từ options
      5. Check `!response.ok` → throw error
      6. Read stream chunk-by-chunk → update AI comment body → gọi `persistComments`
      7. On error: rollback → gọi `persistComments` với rollbackComments → `onError(message)`
      8. Finally: gọi `removeStreamingId(aiReply.id)`
    - _Requirements: 7.1, 7.2, 7.4_

  - [ ]* 7.4 Viết unit tests cho Metric variants và TaskPageHeader rendering
    - Test Metric variant='default' render icon-top layout
    - Test Metric variant='card' render icon-left layout
    - Test TaskPageHeader render back-link, title, metrics, badges
    - _Requirements: 11.4, 12.2_

- [x] 8. Phase 4 Build Gate
  - Chạy `npm run build` — đảm bảo exit code 0
  - Các component mới chưa được consume bởi pages → build pass
  - _Requirements: 14.4_

- [ ] 9. Checkpoint — Đảm bảo tất cả tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Phase 5 — Route migration (cập nhật tất cả API routes import từ `@/lib/api`)

  - [x] 10.1 Migrate `src/app/api/ai/flashcards/route.ts` — xóa local definitions, import từ `@/lib/api`
    - Thêm import: `import { isNonEmptyString, normalizeBaseUrl, compactText, jsonError, readTask, readComments, normalizeForSimilarity, tokenSet, jaccardSimilarity, isSimilarToExisting, hasTooMuchOverlap } from '@/lib/api';`
    - Thêm import type: `import type { ParsedTask, ParsedComment, ChatCompletionResponse } from '@/lib/api';`
    - Xóa local definitions: `isNonEmptyString` (dòng 63-65), `normalizeBaseUrl` (67-69), `compactText` (71-82), `jsonError` (84-86)
    - Xóa local definitions: `readTask` (88-108), `readComments` (110-132)
    - Xóa local definitions: `normalizeForSimilarity` (159-166), `tokenSet` (168-173), `jaccardSimilarity` (175-189), `isSimilarToExisting` (191-193), `hasTooMuchOverlap` (195-203)
    - Xóa local types: `FlashcardTask`, `FlashcardComment`, `ChatCompletionResponse`
    - Cập nhật `hasTooMuchOverlap` call: `hasTooMuchOverlap(cards, (card) => card.front, existingCards)`
    - Giữ nguyên: `readExistingCards`, `extractJsonArray`, `normalizeFlashcards`, POST handler logic
    - _Requirements: 1.5, 2.4, 3.3, 4.3_

  - [x] 10.2 Migrate `src/app/api/ai/quizzes/route.ts` — xóa local definitions, import từ `@/lib/api`
    - Thêm import: `import { isNonEmptyString, normalizeBaseUrl, compactText, jsonError, readTask, readComments, normalizeForSimilarity, tokenSet, jaccardSimilarity, isSimilarToExisting, hasTooMuchOverlap } from '@/lib/api';`
    - Thêm import type: `import type { ParsedTask, ParsedComment, ChatCompletionResponse } from '@/lib/api';`
    - Xóa local definitions: `isNonEmptyString` (dòng 53-55), `normalizeBaseUrl` (57-59), `compactText` (61-72), `jsonError` (74-76)
    - Xóa local `readTask` (78-97), `readComments` (99-122)
    - Xóa local similarity functions: `normalizeForSimilarity`, `tokenSet`, `jaccardSimilarity`, `isSimilarToExisting`, `hasTooMuchOverlap`
    - Xóa local types: `QuizTask`, `QuizComment`, `ChatCompletionResponse`
    - Cập nhật `hasTooMuchOverlap` call: `hasTooMuchOverlap(questions, (q) => q.question, existingQuestions)`
    - Giữ nguyên: `readExistingQuestions`, `extractJson`, `normalizeQuestions`, `normalizeQuizDeck`, POST handler logic
    - _Requirements: 1.5, 2.4, 3.3, 4.3_

  - [x] 10.3 Migrate `src/app/api/ai/comment/route.ts` — xóa local definitions, import từ `@/lib/api`
    - Thêm import: `import { isNonEmptyString, normalizeBaseUrl, compactText, jsonError, resolveBaseUrl, resolveApiKey, usesEnvApiKey, providerBaseUrls } from '@/lib/api';`
    - Thêm import type: `import type { ChatCompletionChunk } from '@/lib/api';`
    - Xóa local definitions: `isNonEmptyString` (dòng 48), `normalizeBaseUrl` (50-52), `providerBaseUrls` (49-52)
    - Xóa local: `resolveBaseUrl` (58-68), `resolveApiKey` (70-83), `usesEnvApiKey` (85-87), `compactText` (89-99), `jsonError` (101-103)
    - Xóa local type: `ChatCompletionChunk` (31-42)
    - Giữ nguyên: `AiCommentRequest` type (local only), POST handler logic, stream handling
    - _Requirements: 1.5, 2.4_

  - [x] 10.4 Migrate `src/app/api/ai/models/route.ts` — xóa local definitions, import từ `@/lib/api`
    - Thêm import: `import { isNonEmptyString, normalizeBaseUrl, resolveBaseUrl, resolveApiKey, usesEnvApiKey, providerBaseUrls } from '@/lib/api';`
    - Xóa local definitions: `isNonEmptyString` (dòng 33-35), `normalizeBaseUrl` (37-39), `providerBaseUrls` (30-33)
    - Xóa local: `resolveBaseUrl` (41-51), `resolveApiKey` (53-65), `usesEnvApiKey` (67-69)
    - Thêm local hàm `resolveDefaultModel` (giữ nguyên — nó không trùng lặp)
    - Giữ nguyên: `AiModelsRequest` type, `ModelsResponse` type, POST handler logic
    - _Requirements: 1.5, 2.4_

- [x] 11. Phase 5 Build Gate
  - Chạy `npm run build` — đảm bảo exit code 0
  - Tất cả API routes phải compile thành công với imports mới
  - _Requirements: 14.4_

- [x] 12. Phase 6 — Component migration (cập nhật pages dùng shared helpers)

  - [x] 12.1 Migrate `src/components/roadmap/flashcards/helpers.ts` — xóa duplicates, import shared
    - Thêm import: `import { isRecord, normalizeSeedProgress, readSeedComments, getContentRequirement } from '@/lib/roadmap';`
    - Thêm import: `import { formatDate } from '@/lib/roadmap';`
    - Xóa local `isRecord` (dòng 4-6)
    - Xóa local `normalizeSeedProgress` (dòng 8-37)
    - Xóa local `readSeedComments` (dòng 39-66)
    - Xóa local `formatDate` (dòng cuối file)
    - Thay `getFlashcardRequirement` bằng thin wrapper: `export function getFlashcardRequirement(opts) { return getContentRequirement({ ...opts, contentType: 'flashcard' }); }`
    - Re-export `isRecord`, `normalizeSeedProgress`, `readSeedComments`, `formatDate` cho backward compat
    - Giữ nguyên: `readSeedFlashcards`, `normalizeFlashcardsByTask`, `normalizeFlashcard`, `normalizeFlashcardDeck`, `storeTaskFlashcards`
    - _Requirements: 5.4, 8.4, 9.2_

  - [x] 12.2 Migrate `src/components/roadmap/quiz/quiz-helpers.ts` — xóa duplicates, import shared
    - Thêm import: `import { isRecord, normalizeSeedProgress, readSeedComments, getContentRequirement } from '@/lib/roadmap';`
    - Thêm import: `import { formatDate } from '@/lib/roadmap';`
    - Xóa local `isRecord` (dòng 16-18)
    - Xóa local `normalizeSeedProgress` (dòng 20-47)
    - Xóa local `readSeedComments` (dòng 49-76)
    - Xóa local `formatDate` (dòng cuối file)
    - Thay `getQuizRequirement` bằng thin wrapper: `export function getQuizRequirement(opts) { return getContentRequirement({ ...opts, contentType: 'quiz' }); }`
    - Re-export `normalizeSeedProgress`, `readSeedComments`, `formatDate` cho backward compat
    - Giữ nguyên: `storeTaskQuizzes`, `readSeedQuizzes`, `normalizeQuizzesByTask`, `normalizeQuizDeck`, `normalizeQuizAttempt`
    - _Requirements: 5.4, 8.4, 9.2_

  - [x] 12.3 Migrate `src/components/roadmap/comments/seed.ts` — xóa duplicates, import shared
    - Thêm import: `import { isRecord, readSeedComments as sharedReadSeedComments } from '@/lib/roadmap';`
    - Xóa local `isRecord` (dòng 4-6)
    - Xóa local `readSeedComments` (dòng 8-39) — replace bằng re-export: `export const readSeedComments = sharedReadSeedComments;`
    - Giữ nguyên: `readSeedProgress` (nó có logic khác — dùng `SeedProgress` type local), `saveCommentsByTask`, `saveSeedProgress`
    - _Requirements: 5.4_

  - [x] 12.4 Migrate `src/components/roadmap/task-detail/TaskDetailInfo.tsx` — xóa duplicates, import shared
    - Thêm import: `import { isRecord, normalizeSeedProgress, readSeedComments } from '@/lib/roadmap';`
    - Thêm import: `import { formatDate } from '@/lib/roadmap';` (replace local `formatDate`)
    - Thêm import: `import { Metric } from '@/components/roadmap/client/Metric';` — re-export thay vì define locally
    - Xóa local `isRecord` (cuối file)
    - Xóa local `normalizeSeedProgress` (cuối file)
    - Xóa local `readSeedComments` (cuối file)
    - Xóa local `formatDate` (cuối file)
    - Xóa local `Metric` component definition (dòng 18-29) — thay bằng: `export { Metric } from '@/components/roadmap/client/Metric';`
    - Giữ nguyên: `DetailItem`, `PathLine`, `QuizCard`, `FlashcardCard`, `LearningPromptCard`, `NoteCard`
    - _Requirements: 5.4, 8.4, 11.3_

  - [x] 12.5 Migrate `src/components/roadmap/comments/utils.ts` — xóa local formatDate
    - Thêm import: `import { formatDate as sharedFormatDate } from '@/lib/roadmap';`
    - Xóa local `formatDate` (dòng 141-148)
    - Thêm re-export: `export const formatDate = sharedFormatDate;` (hoặc thay tất cả callsites nếu internal-only)
    - Giữ nguyên tất cả functions khác
    - _Requirements: 8.4_

  - [x] 12.6 Migrate `src/components/roadmap/task-detail/SkillRoadmapTaskDetail.tsx` — xóa local levelStyles
    - Thêm import: `import { levelStyles } from '@/lib/roadmap';`
    - Xóa local `levelStyles` constant (dòng 48-53)
    - Giữ nguyên toàn bộ component logic, chỉ đổi source của constant
    - _Requirements: 8.1, 8.2_

  - [x] 12.7 Migrate `src/components/roadmap/task-detail/ChildTaskRow.tsx` — xóa local levelStyles
    - Thêm import: `import { levelStyles } from '@/lib/roadmap';` (thêm vào existing import từ `@/lib/roadmap`)
    - Xóa local `levelStyles` constant (dòng 16-21)
    - Cập nhật existing import line: `import { flattenTasks, levelStyles } from '@/lib/roadmap';`
    - _Requirements: 8.1, 8.2_

  - [x] 12.8 Migrate `src/components/roadmap/flashcards/SkillRoadmapTaskFlashcards.tsx` — dùng shared Metric
    - Xóa local `Metric` component definition (cuối file, ~10 dòng)
    - Thêm import: `import { Metric } from '@/components/roadmap/client/Metric';`
    - Cập nhật `<Metric>` usage: thêm prop `variant="card"` cho mỗi instance (4 instances trong grid)
    - Giữ nguyên toàn bộ logic khác
    - _Requirements: 11.2_

  - [x] 12.9 Migrate `MarkdownCommentThreads.tsx` — dùng `streamAiComment` helper
    - Thêm import: `import { streamAiComment } from './ai-stream';`
    - Trong `submitDraft` function, khi `draft.mode === 'ai'`:
      - Thay toàn bộ block try/catch AI streaming (dòng ~80-130) bằng call `streamAiComment(options, callbacks)`
      - `options`: lấy từ `draft` (provider, model, apiKey, baseUrl, confirmPassword) + question=body + markdownContext + threadContext
      - `callbacks.persistComments`: wrapper gọi `saveComments` với task-scoped logic
      - `callbacks.addStreamingId`: gọi `setStreamingCommentIds((c) => new Set(c).add(id))`
      - `callbacks.removeStreamingId`: gọi `setStreamingCommentIds((c) => { const n = new Set(c); n.delete(id); return n; })`
      - `callbacks.onError`: gọi `setError(message)`
      - `callbacks.getComments`: return `comments`
    - _Requirements: 7.3_

  - [x] 12.10 Migrate `MarkdownCommentThreadDetail.tsx` — dùng `streamAiComment` helper
    - Thêm import: `import { streamAiComment } from './ai-stream';`
    - Trong `submitDraft` function, khi `draft.mode !== 'comment'`:
      - Thay toàn bộ block try/catch AI streaming (~50 dòng) bằng call `streamAiComment(options, callbacks)`
      - Tương tự pattern ở task 12.9
    - _Requirements: 7.3_

  - [x] 12.11 Migrate `SkillRoadmapTaskFlashcards.tsx` — dùng `hydrateFromStorage` (optional refactor)
    - Thêm import: `import { hydrateFromStorage } from '@/lib/roadmap';`
    - Thay useEffect hydration block (~40 dòng, dòng 28-68) bằng call `hydrateFromStorage(config)`:
      - `config.taskId = task.id`
      - `config.progressSetter = setProgress`
      - `config.commentsSetter = (taskId, comments) => setNoteComments(comments)`
      - `config.flashcardsSetter = (taskId, decks) => { setFlashcardDecks(decks); setActiveDeckId(decks[0]?.id ?? null); resetStudyState(); }`
      - `config.normalizeFlashcards = normalizeFlashcardsByTask`
      - `config.readSeedFlashcards = readSeedFlashcards`
    - Giữ `duplicateDetectionEnabled` init riêng (queueMicrotask)
    - _Requirements: 6.3_

  - [x] 12.12 Migrate `SkillRoadmapTaskQuiz.tsx` — dùng `hydrateFromStorage` (optional refactor)
    - Thêm import: `import { hydrateFromStorage } from '@/lib/roadmap';`
    - Thay useEffect hydration block (~50 dòng) bằng call `hydrateFromStorage(config)`:
      - `config.taskId = task.id`
      - `config.progressSetter = setProgress`
      - `config.commentsSetter = (taskId, comments) => setNoteComments(comments)`
      - `config.quizzesSetter = (taskId, quizzes) => { setQuizDecks(quizzes); setActiveQuizId(quizzes[0]?.id ?? null); }`
      - `config.normalizeQuizzes = normalizeQuizzesByTask`
      - `config.readSeedQuizzes = readSeedQuizzes`
    - Giữ `duplicateDetectionEnabled` init riêng
    - _Requirements: 6.3_

  - [x] 12.13 Migrate `SkillRoadmapTaskDetail.tsx` — dùng `hydrateFromStorage`
    - Thêm import: `import { hydrateFromStorage } from '@/lib/roadmap';`
    - Thay useEffect hydration block (~30 dòng) bằng call `hydrateFromStorage(config)`:
      - `config.taskId = task.id`
      - `config.progressSetter = setProgress`
      - `config.commentsSetter = (taskId, comments) => setNoteComments(comments)`
    - Không cần flashcards/quizzes cho trang này
    - _Requirements: 6.3_

  - [ ]* 12.14 Viết property test file size constraint
    - **Property 14: File size constraint**
    - Kiểm tra mọi file đã tạo/sửa có ≤300 dòng
    - Dùng script đếm dòng trên glob `src/lib/api/*.ts`, `src/lib/roadmap/seed-helpers.ts`, `src/lib/roadmap/format.ts`, `src/lib/roadmap/hydration.ts`, `src/hooks/useDataDecks.ts`, `src/components/roadmap/shared/TaskPageHeader.tsx`, `src/components/roadmap/comments/ai-stream.ts`
    - **Validates: Requirements 14.1**

- [x] 13. Phase 6 Build Gate
  - Chạy `npm run build` — đảm bảo exit code 0
  - Tất cả components phải compile thành công
  - _Requirements: 14.4_

- [ ] 14. Final Checkpoint — Verification toàn bộ
  - Chạy `npm run build` lần cuối
  - Chạy `npm run typecheck` (tsc --noEmit)
  - Chạy `npm run lint`
  - Verify: không có circular imports (kiểm tra barrel → barrel không import lẫn nhau)
  - Verify: `package.json` không có dependencies mới (diff check)
  - Verify: grep không còn local `isRecord` definition ngoài `src/lib/roadmap/seed-helpers.ts`
  - Verify: grep không còn local `normalizeSeedProgress` ngoài `src/lib/roadmap/seed-helpers.ts`
  - Verify: grep không còn local `normalizeForSimilarity` ngoài `src/lib/api/similarity.ts`
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 13.1, 14.2, 14.3, 14.4, 14.5_

## Notes

- Tasks đánh dấu `*` là optional (property tests, unit tests) — có thể skip cho MVP nhanh
- Mỗi task reference cụ thể requirements traceability
- Checkpoints đảm bảo validation từng giai đoạn
- Property tests validate universal correctness properties từ design
- Thứ tự phase quan trọng: shared modules trước → consumers sau
- Khi xóa local definition mà có external consumers import từ file đó → thêm re-export để giữ backward compat
- `src/components/roadmap/comments/utils.ts` có `formatDate` khác signature (không accept `null`) — cần align hoặc re-export wrapper

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "1.5"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["3.3", "3.4", "3.5"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["5.2", "5.3", "5.4", "5.5", "5.6"] },
    { "id": 6, "tasks": ["7.1", "7.2", "7.3", "7.4"] },
    { "id": 7, "tasks": ["10.1", "10.2", "10.3", "10.4"] },
    { "id": 8, "tasks": ["12.1", "12.2", "12.3", "12.4", "12.5", "12.6", "12.7", "12.8"] },
    { "id": 9, "tasks": ["12.9", "12.10", "12.11", "12.12", "12.13"] },
    { "id": 10, "tasks": ["12.14"] }
  ]
}
```
