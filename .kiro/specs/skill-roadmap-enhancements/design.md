# Design Document

## Overview

Thiết kế chi tiết cho 7 nhóm cải tiến trên ứng dụng Skill Roadmap. Mỗi nhóm được thiết kế tối giản, tận dụng codebase hiện có (localStorage storage, comment flow, component structure) để giảm thiểu rủi ro và duy trì tính nhất quán.

## Architecture

### Tổng quan kiến trúc hiện tại

```
src/
├── app/skill-roadmap/           # Next.js App Router pages
│   ├── notes/[taskId]/          # Note preview
│   ├── tasks/[taskId]/          # Task detail
│   │   ├── flashcards/          # Flashcard study
│   │   └── quiz/                # Quiz study
│   └── page.tsx                 # Roadmap tree view
├── components/roadmap/
│   ├── client/                  # Tree view components (TaskNode, HeroCard)
│   ├── comments/                # Comment/AI system
│   ├── flashcards/              # Flashcard components
│   ├── quiz/                    # Quiz components
│   └── note-preview/            # Note preview components
├── lib/roadmap/                 # Utilities (storage, flatten, filters)
└── types/                       # TypeScript types
```

### Dữ liệu lưu trữ

Tất cả dữ liệu client lưu trong localStorage:
- `skill-roadmap-progress` — ProgressFile (trạng thái completed, note)
- `skill-roadmap-comments` — Record<taskId, NoteComment[]>
- `skill-roadmap-flashcards` — Record<taskId, FlashcardDeck[]>
- `skill-roadmap-quizzes` — Record<taskId, QuizDeck[]>

## Detailed Design

### 1. Điều hướng quay lại từ Note Preview

**Thay đổi file:** `src/app/skill-roadmap/notes/[taskId]/page.tsx`

Thêm các Link component bên cạnh nút "Quay lại roadmap" hiện có:
- Link đến `/skill-roadmap/tasks/{taskId}` (Chi tiết task)
- Link đến `/skill-roadmap/tasks/{taskId}/flashcards` (Flashcard)
- Link đến `/skill-roadmap/tasks/{taskId}/quiz` (Trắc nghiệm)

Sử dụng Next.js `<Link>` component để đảm bảo client-side navigation.

### 2. Comment/AI tại Flashcard và Quiz

**Mô hình dữ liệu mở rộng:**

Thêm localStorage key mới: `skill-roadmap-study-comments`

```typescript
// src/types/study-comments.ts
export type StudyComment = {
  id: string;
  parentId: string | null;
  author: 'user' | 'ai';
  body: string;
  createdAt: string;
  model?: string;
  provider?: string;
  // Context identifiers
  taskId: string;
  context:
    | { type: 'flashcard'; deckId: string; cardId: string }
    | { type: 'quiz'; deckId: string; questionId: string; attemptId: string };
};
```

**Component mới:** `src/components/roadmap/comments/StudyCommentThread.tsx`
- Tái sử dụng `CommentForm`, `CommentBubble` từ hệ thống comment hiện có
- Props: `contextType`, `contextId` (cardId hoặc questionId), `attemptId?`, `contextContent` (nội dung câu hỏi/card để gửi AI)
- Lọc comments theo context identifiers

**Tích hợp với Flashcard:**
- Thêm `StudyCommentThread` vào `FlashcardStudyPanel`, hiển thị bên dưới flashcard card
- Context gửi AI: chỉ `activeCard.front` + `activeCard.back` + `activeCard.hint`

**Tích hợp với Quiz:**
- Thêm `StudyCommentThread` vào `QuizSessionPanel`, hiển thị bên dưới phần giải thích hoặc bên dưới options
- Context gửi AI: chỉ `activeQuestion.question` + `activeQuestion.options` + `activeQuestion.explanation`
- Lọc theo `attemptId` — khi chuyển attempt qua `reviewAttempt()`, comments tự lọc theo attempt mới

**API endpoint:** Tái sử dụng `/api/ai/comment` hiện có, chỉ thay đổi `markdownContext` và `threadContext` khi gọi từ flashcard/quiz.

### 3. Cấu hình Duplicate Detection

**localStorage key:** `skill-roadmap-duplicate-detection` (JSON object)

```typescript
type DuplicateDetectionConfig = {
  flashcards: boolean; // default: true
  quizzes: boolean;    // default: true
};
```

**Thay đổi files:**
- `src/components/roadmap/flashcards/SkillRoadmapTaskFlashcards.tsx` — Thêm toggle UI, điều kiện gửi `existingCards`
- `src/components/roadmap/quiz/SkillRoadmapTaskQuiz.tsx` — Thêm toggle UI, điều kiện gửi `existingQuestions`

**Logic:**
- Toggle OFF → `existingCards: []` hoặc bỏ field `existingQuestions` trong request body
- Toggle ON → giữ nguyên behavior hiện tại (gửi danh sách câu hỏi đã có)

### 4. Thanh tiến độ Flashcard phân đoạn

**Component mới:** `src/components/roadmap/flashcards/SegmentedProgressBar.tsx`

```typescript
interface SegmentedProgressBarProps {
  cards: Flashcard[];
  ratings: Record<string, 'hard' | 'good'>;
  activeIndex: number;
  onSegmentClick: (index: number) => void;
}
```

**Logic màu:**
- Chưa rate: `bg-gray-200 dark:bg-gray-700`
- Good (đã nhớ): `bg-emerald-500`
- Hard (khó nhớ): `bg-orange-400`
- Active segment: thêm `ring-2 ring-violet-500` hoặc border indicator

**Thay đổi file:** `src/components/roadmap/flashcards/FlashcardStudyPanel.tsx`
- Thay thế `<div className="mt-3 h-2 overflow-hidden rounded-full ...">` bằng `<SegmentedProgressBar />`
- Truyền callback `onSegmentClick` để set `activeFlashcardIndex`

### 5. Ẩn prompt AI và note tại task cha trong tree view

**Thay đổi file:** `src/components/roadmap/client/TaskNode.tsx`

**Logic:** Thêm điều kiện `const isLeafTask = !hasChildren;`

- Ẩn block "Prompt AI hỗ trợ học" khi `hasChildren === true`
- Ẩn block note textarea (effectivelyCompleted section) khi `hasChildren === true`
- Giữ nguyên link "Chi tiết task" để user vẫn có thể vào Task_Detail_Screen xem đầy đủ

**Không ảnh hưởng:** Task_Detail_Screen (`src/app/skill-roadmap/tasks/[taskId]/page.tsx`) vẫn render đầy đủ thông tin.

### 6. Đếm mục con trực tiếp

**Thay đổi file:** `src/components/roadmap/client/TaskNode.tsx`

**Thay đổi logic:**

Hiện tại:
```typescript
const descendants = flattenTasks(childTasks);
const childCount = descendants.length;
const completedChildren = descendants.filter(...).length;
```

Đổi thành:
```typescript
const directChildren = childTasks; // immediate children only
const childCount = directChildren.length;
const completedChildren = directChildren.filter(
  (child) => progress.items[child.id]?.completed
).length;
```

**Lưu ý:** Logic `effectivelyCompleted` và `hasStartedChildren` vẫn cần dựa trên toàn bộ descendants để xác định trạng thái hoàn thành đệ quy (nếu tất cả descendants completed thì parent cũng completed). Chỉ badge hiển thị count thay đổi.

### 7. Tiến độ tổng quan chỉ tính task lá

**Thay đổi file:** `src/components/roadmap/client/RoadmapHeroCard.tsx`

**Thêm utility:** `src/lib/roadmap/flatten-tasks.ts`

```typescript
export function getLeafTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  return tasks.flatMap((task) =>
    (task.children ?? []).length === 0
      ? [task]
      : getLeafTasks(task.children ?? [])
  );
}
```

**Thay đổi logic trong RoadmapHeroCard:**

Hiện tại dùng `allTasks` (tất cả tasks flattened). Đổi sang chỉ dùng leaf tasks:

```typescript
const leafTasks = allTasks.filter((task) => (task.children ?? []).length === 0);
const completedCount = leafTasks.filter(t => progress.items[t.id]?.completed).length;
const totalHours = leafTasks.reduce((sum, t) => sum + t.estimateHours, 0);
// ...
```

## Correctness Properties

### Property 1: Segmented progress bar segment count equals card count

For all valid FlashcardDecks, the SegmentedProgressBar renders exactly `deck.cards.length` segments.

```
∀ deck ∈ FlashcardDeck where deck.cards.length > 0:
  segmentCount(SegmentedProgressBar(deck)) === deck.cards.length
```

### Property 2: Quiz comments filtered by attemptId are exclusive

For all stored StudyComments of type 'quiz', filtering by a specific attemptId returns only comments belonging to that attempt.

```
∀ attemptId ∈ QuizAttempt.id:
  filteredComments = comments.filter(c => c.context.attemptId === attemptId)
  ∀ c ∈ filteredComments: c.context.attemptId === attemptId
  ∀ c ∈ (allComments \ filteredComments): c.context.attemptId ≠ attemptId
```

### Property 3: Direct children count equals immediate children length

For all tasks with children, the displayed child count badge shows exactly `task.children.length`, not the recursive descendant count.

```
∀ task ∈ RoadmapTask where task.children.length > 0:
  displayedChildCount(task) === task.children.length
  displayedChildCount(task) ≤ flattenTasks(task.children).length
```

### Property 4: Leaf task filtering excludes all parent tasks

For any roadmap, `getLeafTasks` returns only tasks with no children, and no task in the result has children.

```
∀ task ∈ getLeafTasks(allTasks):
  (task.children ?? []).length === 0

∀ task ∈ allTasks where (task.children ?? []).length > 0:
  task ∉ getLeafTasks(allTasks)
```

### Property 5: Progress metrics use only leaf tasks

The progress panel completion rate equals (completed leaf tasks / total leaf tasks), and total hours equals sum of leaf task estimate hours only.

```
∀ roadmap, progress:
  leafTasks = getLeafTasks(allTasks)
  completedLeafs = leafTasks.filter(t => progress.items[t.id]?.completed)
  
  displayedCompletionRate === round(completedLeafs.length / leafTasks.length * 100)
  displayedTotalHours === sum(leafTasks.map(t => t.estimateHours))
  displayedTaskCount === leafTasks.length
```

### Property 6: Duplicate detection toggle controls API payload

When duplicate detection is disabled, the request body sent to AI generation endpoints contains an empty array (or omits) the existing questions field.

```
∀ generateRequest where duplicateDetection === false:
  request.body.existingCards === [] OR request.body.existingCards === undefined
  request.body.existingQuestions === [] OR request.body.existingQuestions === undefined
```

## Test Strategy

| Requirement | Test Type | Rationale |
|---|---|---|
| Req 1 (Navigation) | Example/UI test | Static links, no varying logic |
| Req 2 (Comments) | Property + Example | Comment filtering by attemptId varies with data |
| Req 3 (Duplicate config) | Example | Binary toggle, 2 states |
| Req 4 (Segmented bar) | Property + Example | Segment count scales with deck size |
| Req 5 (Hide prompt) | Example | Conditional render on hasChildren boolean |
| Req 6 (Direct count) | Property | Count logic varies with tree depth/structure |
| Req 7 (Leaf progress) | Property | Calculation varies with any roadmap shape |

## File Change Summary

| File | Action | Description |
|---|---|---|
| `src/app/skill-roadmap/notes/[taskId]/page.tsx` | Modify | Add navigation links to task detail, flashcard, quiz |
| `src/types/study-comments.ts` | Create | StudyComment type definition |
| `src/components/roadmap/comments/StudyCommentThread.tsx` | Create | Reusable comment thread for flashcard/quiz context |
| `src/components/roadmap/flashcards/FlashcardStudyPanel.tsx` | Modify | Add StudyCommentThread, replace progress bar |
| `src/components/roadmap/flashcards/SegmentedProgressBar.tsx` | Create | Segmented progress bar component |
| `src/components/roadmap/quiz/QuizSessionPanel.tsx` | Modify | Add StudyCommentThread |
| `src/components/roadmap/flashcards/SkillRoadmapTaskFlashcards.tsx` | Modify | Add duplicate detection toggle |
| `src/components/roadmap/quiz/SkillRoadmapTaskQuiz.tsx` | Modify | Add duplicate detection toggle |
| `src/components/roadmap/client/TaskNode.tsx` | Modify | Hide prompt/note for parent tasks, change child count |
| `src/components/roadmap/client/RoadmapHeroCard.tsx` | Modify | Use leaf tasks only for metrics |
| `src/lib/roadmap/flatten-tasks.ts` | Modify | Add getLeafTasks utility |
| `src/lib/roadmap/index.ts` | Modify | Export getLeafTasks |
