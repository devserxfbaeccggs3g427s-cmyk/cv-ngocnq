# Tasks

## Task 1: Điều hướng quay lại từ Note Preview

- [x] 1.1 Add navigation links (Task Detail, Flashcard, Quiz) to `src/app/skill-roadmap/notes/[taskId]/page.tsx` next to existing "Quay lại roadmap" button
- [x] 1.2 Verify all links use Next.js `<Link>` component with proper `encodeURIComponent(taskId)` paths

## Task 2: Comment/AI tại Flashcard và Quiz

- [x] 2.1 Create `src/types/study-comments.ts` with `StudyComment` type including context discriminated union (flashcard | quiz)
- [x] 2.2 Export `StudyComment` from `src/types/index.ts`
- [x] 2.3 Add localStorage key `skill-roadmap-study-comments` constant to `src/lib/roadmap/constants.ts` and export from `src/lib/roadmap/index.ts`
- [x] 2.4 Add storage utilities (`readStoredStudyComments`, `storeStudyComments`) to `src/lib/roadmap/storage.ts`
- [x] 2.5 Create `src/components/roadmap/comments/StudyCommentThread.tsx` component that reuses CommentForm and CommentBubble, accepts context props (taskId, contextType, contextId, attemptId?, contextContent)
- [x] 2.6 Integrate `StudyCommentThread` into `FlashcardStudyPanel.tsx` — show below the flashcard card area with context = active card front/back/hint
- [x] 2.7 Integrate `StudyCommentThread` into `QuizSessionPanel.tsx` — show below options/explanation with context = active question/options/explanation, filtering by current attemptId
- [x] 2.8 Update `/api/ai/comment` route or create a new variant to accept `studyContext` field instead of `markdownContext` for focused AI responses

## Task 3: Cấu hình Duplicate Detection

- [x] 3.1 Add localStorage key `skill-roadmap-duplicate-detection` and read/write utility functions
- [x] 3.2 Add toggle UI to `SkillRoadmapTaskFlashcards.tsx` near the "Tạo flashcard" button, default enabled
- [x] 3.3 Conditionally send `existingCards` based on toggle state in `createFlashcards()` function
- [x] 3.4 Add toggle UI to `SkillRoadmapTaskQuiz.tsx` near the "Tạo bài" button, default enabled
- [x] 3.5 Conditionally send `existingQuestions` based on toggle state in `createQuiz()` function

## Task 4: Thanh tiến độ Flashcard phân đoạn

- [x] 4.1 Create `src/components/roadmap/flashcards/SegmentedProgressBar.tsx` with props: cards, ratings, activeIndex, onSegmentClick
- [x] 4.2 Implement color logic: gray (unrated), emerald/green (good), orange (hard), and active indicator (ring/border)
- [x] 4.3 Replace the continuous progress bar in `FlashcardStudyPanel.tsx` with `SegmentedProgressBar`
- [x] 4.4 Wire `onSegmentClick` to update `activeFlashcardIndex` in parent component

## Task 5: Ẩn prompt AI và note tại task cha

- [x] 5.1 In `TaskNode.tsx`, wrap the "Prompt AI hỗ trợ học" section with `{!hasChildren && (...)}` condition
- [x] 5.2 In `TaskNode.tsx`, wrap the note textarea section (effectivelyCompleted block) with `{!hasChildren && (...)}` condition
- [x] 5.3 Verify Task_Detail_Screen still shows full prompt and note content for parent tasks

## Task 6: Đếm mục con trực tiếp

- [x] 6.1 In `TaskNode.tsx`, change `childCount` from `descendants.length` to `childTasks.length`
- [x] 6.2 Change `completedChildren` to count only direct children's completed status instead of all descendants
- [x] 6.3 Keep `effectivelyCompleted` logic using full descendants for correct recursive completion detection
- [x] 6.4 Update `hasStartedChildren` to use direct children completion status for badge color

## Task 7: Tiến độ tổng quan chỉ tính task lá

- [x] 7.1 Add `getLeafTasks(tasks: RoadmapTask[]): RoadmapTask[]` utility to `src/lib/roadmap/flatten-tasks.ts`
- [x] 7.2 Export `getLeafTasks` from `src/lib/roadmap/index.ts`
- [x] 7.3 In `RoadmapHeroCard.tsx`, filter `allTasks` to leaf tasks only before calculating completedCount, totalHours, completedHours, and completionRate
- [x] 7.4 Update Metric display for "Task" to show leaf task count (e.g., `completedLeafCount/totalLeafCount`)
