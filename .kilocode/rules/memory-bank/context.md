# Active Context: Live Resume Template

## Current State

**Template Status**: ✅ Complete and production-ready

The template is fully implemented with all core sections working. It's ready for AI-assisted customization.

## Recently Completed

- [x] Updated `/ai-context` AI asking flow so selected Markdown files and roadmap tasks are sent to `/api/ai/comment` as separate `studyContextItems`. The API now performs a non-streaming AI summarization call for each context source first, preserving key facts/trade-offs/errors relevant to the user's question, then streams the final answer using only the per-context summaries plus the current thread context. Existing flashcard/quiz comment flows still use the previous single `studyContext` behavior.
- [x] Updated `/markdown-files` file opening behavior so Markdown files now default to Preview mode, newly created files open as preview-first, and selecting any file from the tree, folder cards, or breadcrumbs resets to Preview. Preview mode is a reading-focused Markdown view where only the Markdown content area scrolls and the appendix uses a floating bottom-sheet control modeled after the mobile task-note appendix. Edit mode keeps the desktop split layout with independently scrollable Markdown editor and live preview panes, supports hiding/showing the live preview, syncs editor/preview scroll positions by scroll ratio in both directions, and lets the document tree sidebar collapse to an icon rail for more editing/preview width.
- [x] Refined `/ai-context` roadmap task source selection so each selectable review task shows clear hierarchy: Track, Module, parent task chain, indented current leaf task, id/level/estimate metadata, and search now matches parent task titles. Selection still targets leaf tasks only so AI context remains focused while users can see exactly which parent branch a task belongs to.
- [x] Fixed the production build TypeScript error in `StudyCommentThread` by narrowing `StudyCommentContext` with a `switch` before reading flashcard/quiz-specific fields, keeping `ai-review` contexts handled safely.
- [x] Added an independent `/ai-context` workspace for asking AI with manually selected context from standalone Markdown files and/or roadmap review tasks. The page lets users search and select Markdown files from `markdown-files:v1`, search and select leaf roadmap tasks, combines selected file content plus task metadata/saved notes into the AI `studyContext`, and stores each context-specific thread in `skill-roadmap-study-comments:v1` using the new `ai-review` study comment context. Because it reuses `studyComments`, the history is included in the existing Export/Import/GitHub backup flow; backup panel/messages now explicitly mention independent AI Context history.
- [x] Refined the `/ai-context` UI into a more professional two-column workspace: a compact header with context metrics, a sticky source rail for Markdown files and roadmap tasks, denser selectable source rows, and a dedicated conversation panel with context chips, thread count, and clear reset action.
- [x] Updated `/ai-context` history behavior so all saved AI Context chat threads are always visible in the left rail, listed per root chat/question and sorted by latest activity across replies. Selecting a history item automatically restores its saved Markdown file/task sources into the current context selection, opens the matching conversation thread, and ignores missing sources from older backups safely.
- [x] Added best-effort AI-generated titles for `/ai-context` history items. When any new root thread is created, including normal comments, the workspace calls a constrained `/api/ai/context-title` endpoint that uses server-side `AI_CONTEXT_TITLE_MODEL` or `AI_COMMENT_KILO_MODEL` env config without requiring the UI confirmation password, stores the returned one-line title on the root study comment, preserves it through backup normalization, and falls back to the question preview if title generation fails.
- [x] Added delete support for `/ai-context` history items. Each history row now has a dedicated delete button that removes the selected root chat thread plus all nested replies/AI answers from `skill-roadmap-study-comments:v1`; deleting the currently open history also clears the active source selection and closes that thread state.
- [x] Added manual AI rewrite support for roadmap task notes on `/skill-roadmap/tasks/[taskId]` and the shared task preview drawer/panel used from `/skill-roadmap`, `/skill-roadmap/review`, and task detail parent/child previews. The Note card and preview panel now include a collapsible "Yêu cầu AI chỉnh sửa note" form where users enter rewrite instructions plus the `AI_ENV_CONFIRM_PASSWORD`; `/api/ai/task-note` supports `mode: "rewrite"` using the existing server-side task-note AI env config, validates the task prompt, rewrites the current Markdown note without exposing API keys, and saves the returned note back through the same localStorage/local-dev progress sync path.
- [x] Upgraded standalone `/markdown-files` into a document storage workspace with hierarchical folders and Markdown files. Users can create folders/files at root or inside selected folders, expand/collapse the tree, move items by changing parent folder, delete folders recursively, edit file titles/content, and preview Markdown through the existing reusable `MarkdownPreview` renderer. Data persists in browser `localStorage` under `markdown-files:v1`, migrates from the short-lived `skill-roadmap-markdown-files:v1` key if present, hydrates from the project seed when present, and is included in normal Export/Import/GitHub backup as backup version 6 while older flat-file backups are normalized into root-level file nodes.
- [x] Added compact note-comment viewing inside the shared roadmap task preview drawer. The drawer now reads the existing `skill-roadmap-note-comments:v1` data, hydrates seeded comments when localStorage is missing, and keeps comments hidden by default behind a footer "Bình luận" button next to Flashcard/Trắc nghiệm that only appears when the task has comments. Opening it reveals a bounded in-drawer comment panel directly above the footer actions, so comments are accessible without scrolling through a long note; each comment or nested reply can expand/collapse in-place without navigating to the full note/comment screens. The note preview section uses normal content flow so comments do not overlap long Markdown content, AI `<think>/<thinking>` blocks in preview comments are collapsed behind the same "Suy nghĩ của AI" disclosure pattern as the full comment view, and collapsed comment/reply cards are header-only single cards to avoid empty vertical gaps.
- [x] Removed duplicated direct navigation buttons from roadmap task rows and task-detail child rows now that every task can open the shared preview drawer. `/skill-roadmap` no longer shows inline "Chi tiết task" links or "Xem note" links inside completed note cards, and `/skill-roadmap/tasks/[taskId]` child task rows no longer show the separate "Chi tiết" button; the preview drawer remains the central place for Detail, Note, Flashcard, and Quiz navigation.
- [x] Extended roadmap task preview drawer behavior from task detail pages: `/skill-roadmap/tasks/[taskId]` now passes full task context into the client, parent breadcrumb titles open the shared preview drawer instead of navigating away, nested child task titles open the same drawer while keeping the existing "Chi tiết" link, and the drawer can auto-generate/save parent task notes through the same guarded AI flow used by the task detail screen.
- [x] Polished `/skill-roadmap/review` mindmap UX for mobile, laptop, and desktop: the canvas now uses pointer events for smooth mouse/touch panning, keeps drag interaction stable when the pointer leaves the canvas edge, supports two-finger pinch zoom, zooms around the active pointer/viewport center, refits after layout changes, and shows device-specific interaction hints. The review header, legend, filters, stats cards, node interactions, and task preview panel were tightened for a more professional responsive experience, including larger tap targets and a mobile-friendly preview sheet layout.
- [x] Added professional Markdown reference-style link support in the preview: reference definition lines such as `[1]: https://... "Title"` are collected and hidden from rendered body content, including multiple definitions on one line, while inline references like `[Spring Cloud][1]` and shortcut references like `[1]` resolve to sanitized external links. The preview now renders a polished "Tài liệu tham khảo" section at the end with each reference id, title, and compact source URL so readers can inspect/open sources even when references are only defined at the bottom.
- [x] Removed internal Mermaid preview scrolling: Mermaid canvases no longer have fixed max heights or internal overflow, and rendered SVGs now scale to the available preview width with automatic height so diagrams expand naturally in the page instead of requiring nested vertical/horizontal scrolling.
- [x] Refined Markdown preview code/text block rendering: fenced blocks without a language now render as flat plain-text blocks instead of being auto-detected or showing a `TEXT` header, explicit `text`/`plain` blocks skip syntax highlighting, captions, and line-number gutters, while typed code blocks keep captions and highlighting. Code blocks no longer impose an internal vertical max height, so long blocks expand with the page and preserve horizontal scrolling for long lines.
- [x] Changed roadmap parent task completion semantics so parent nodes can no longer be toggled directly and no longer store their own completed state. Parent task status now derives recursively from child/descendant task completion across the roadmap list, filters, track progress, task detail, child rows, note preview, flashcard screen, and quiz screen; stale parent `completed` values in existing progress are ignored for display and cleared on descendant updates.
- [x] Added HTML disclosure support to the reusable Markdown preview: `<details>` blocks with inline or separate `<summary>` tags now render as interactive native disclosure sections, support the `open` attribute, parse nested Markdown content through the existing safe renderer, and include responsive light/dark styling for normal and quiz Markdown surfaces.
- [x] Added safe automatic AI note generation for parent roadmap task detail pages: `/api/ai/task-note` is opt-in via `AI_TASK_NOTE_ENABLED=true`, uses server-side OpenAI-compatible env config, refuses non-parent/incomplete/already-noted tasks, validates the prompt against the task, and only returns generated Markdown. The task detail client now calls it only when a parent task is completed and note is empty, uses localStorage lock/cooldown under `skill-roadmap-auto-task-note:v1` to prevent repeated API calls, rechecks latest progress before saving, never overwrites an existing note, syncs the generated note through the existing progress API in local dev, and exposes a retry button when cooldown/error prevents auto note from running.
- [x] Enabled Mermaid rendering in the reusable Markdown preview: fenced `mermaid`/`mmd` blocks now render as client-side diagrams with responsive framed styling, Markdown language auto-detection recognizes Mermaid diagrams before SQL to avoid architecture diagrams being mislabeled as database code, and invalid Mermaid falls back to the normal code block renderer.
- [x] Extended `/skill-roadmap` backup/export/import/GitHub commit to include flashcard/quiz study comments stored in `skill-roadmap-study-comments:v1`. New backups are version 5 with `studyComments`, older backups without that field still import as an empty list, seed hydration restores study comments when localStorage is missing them, and Clear localStorage now removes/reloads study comments too.
- [x] Split the monolithic `src/components/markdown/MarkdownPreview.tsx` into focused markdown modules: shared types/constants, parser, syntax tokenizer plus keyword sets, block/inline renderers, and a slim composition root with a new barrel export. Existing `@/components/markdown/MarkdownPreview` imports remain valid, every file in `src/components/markdown/` is ≤300 lines, and typecheck/lint/build pass.
- [x] Implemented the deduplication refactor spec: added shared `src/lib/api` route utilities for validation/provider/similarity/parsing, shared roadmap seed/date/hydration helpers, generic `useDataDecks` hook factory with thin flashcard/quiz/comment wrappers, shared Metric variants and task page header helper, and a shared Markdown AI streaming helper. Migrated AI routes, roadmap helper files, task detail/flashcard/quiz hydration, level/date utilities, and Markdown comment streaming to the shared modules while keeping build/typecheck/lint passing.
- [x] Updated roadmap previous/next navigation for task detail and note preview: both screens now navigate only through lowest-level leaf tasks in roadmap order, include unfinished tasks, and never jump into parent task nodes.
- [x] Completed the skill-roadmap enhancement spec: note preview now links directly to task detail, flashcards, and quiz; flashcard/quiz screens have focused study comment/AI threads stored under `skill-roadmap-study-comments:v1`; duplicate detection can be toggled and persisted under `skill-roadmap-duplicate-detection:v1`; flashcard review uses a clickable segmented progress bar; roadmap parent nodes hide prompt/note UI in the tree; child badges count only direct children; and hero progress metrics now count leaf tasks only.
- [x] Refined study UI details: the flashcard segmented progress bar is now visually continuous with only per-segment colors and no active border, and study comments now sort newest first.
- [x] Updated study comment pagination: root comments show newest first, initially limited by `NEXT_PUBLIC_STUDY_COMMENT_VISIBLE_COUNT` with a default of 5, "Xem thêm" loads the next batch, and the composer remains above the comment list.
- [x] Applied the comment ordering/pagination pattern across all roadmap comment surfaces: note preview comments, focused note thread replies, flashcard comments, and quiz comments now use newest-first ordering; root lists page older comments by `NEXT_PUBLIC_COMMENT_VISIBLE_COUNT` with fallback support for `NEXT_PUBLIC_STUDY_COMMENT_VISIBLE_COUNT`; "Xem thêm" stays below the visible list while comment forms are always visible above it.
- [x] Collapsed AI provider/model settings inside the shared comment form by default; choosing "Hỏi AI" now shows a compact "Cấu hình AI" disclosure, and model loading only starts after users open that panel.
- [x] Collapsed AI reasoning blocks in rendered comments by default: AI replies containing `<think>...</think>` or `<thinking>...</thinking>` now hide that reasoning behind a "Suy nghĩ của AI" disclosure while showing the final answer normally.
- [x] Polished the dedicated flashcard study UI with a smoother 3D flip-card interaction, separate front/back faces, stronger focus/hover states, visible per-card rating chips, animated review progress, and clearer self-review controls.
- [x] Split AI flashcards out of `/skill-roadmap/tasks/[taskId]` into the dedicated `/skill-roadmap/tasks/[taskId]/flashcards` screen. Flashcards now support multiple decks per task under `skill-roadmap-flashcards:v1`, while legacy single-deck backup/localStorage data is migrated by wrapping old decks into a one-item deck list. The task detail page now acts as a hub with links to Flashcard, Trắc nghiệm, and Note instead of embedding the full flashcard study UI.
- [x] Extended `/api/ai/flashcards` for repeat deck generation: requests can send existing card fronts, the AI prompt asks for a different learning angle, and the API rejects newly generated decks when more than 50% of cards are too similar to existing flashcards.
- [x] Enabled Markdown rendering inside quiz screens: `/skill-roadmap/tasks/[taskId]/quiz` now renders AI quiz question text, answer options, and submitted explanations through the reusable `MarkdownPreview` component, with compact quiz-specific Markdown CSS for headings, lists, tables, quotes, and code blocks.
- [x] Added password confirmation for every AI feature that uses server-side env API keys. `/api/ai/comment`, `/api/ai/models`, `/api/ai/flashcards`, and `/api/ai/quizzes` now validate `AI_ENV_CONFIRM_PASSWORD` before using env-backed keys; the Markdown Kilo AI composer, flashcard generator, and quiz generator collect a temporary password confirmation without storing it in localStorage.
- [x] Updated Markdown comment "Hỏi AI" Kilo AI flow: selecting Kilo AI now uses server-side env API settings without showing the API key in the browser, auto-loads the provider model list, and applies the env-configured default model returned by `/api/ai/models`.
- [x] Expanded AI quiz generation so each roadmap task can store multiple separate quiz attempts under `skill-roadmap-quizzes:v1`; `/skill-roadmap/tasks/[taskId]/quiz` now lets users create additional quiz packs, choose which quiz to take, and keeps older single-quiz localStorage/backup data compatible as "Bài trắc nghiệm 1". `/api/ai/quizzes` receives previously generated questions, prompts AI to change the angle, and rejects newly generated packs when more than 50% of their questions are too similar to existing questions.
- [x] Extended AI quiz packs with AI-defined `durationMinutes` and persisted attempt history. The quiz screen now requires confirmation before starting, creates a saved attempt at start time, stores every selected answer into `skill-roadmap-quizzes:v1`, auto-submits when the timer reaches zero, records whether submission was manual or timeout, and shows attempt history. Export/import/GitHub backup already includes this attempt data through the v4 `quizzes` payload, and Clear localStorage now reloads progress, comments, flashcards, and quizzes from the project seed.
- [x] Made quiz attempt history reviewable: clicking a saved attempt in `/skill-roadmap/tasks/[taskId]/quiz` reloads that attempt's stored answers into the quiz UI in read-only review mode, showing correct/incorrect markers and explanations across the full quiz.
- [x] Reworked `src/data/skill-roadmap.json` into a deeper multi-level learning hierarchy; roadmap now has 624 todo nodes, grouped as parent task → focused learning branch → concrete issue/task leaf, with no repeated concept/interview/edge-case/practice placeholders, no flat broad parents, and no single-child wrapper branches
- [x] Updated roadmap seed hydration so `src/data/skill-roadmap-progress.json` can be a version-3 combined backup; `/api/skill-roadmap/progress` now preserves `comments` and `flashcards` when syncing progress, while `/skill-roadmap`, note preview/comment pages, and task detail pages hydrate missing `localStorage` keys from the file seed
- [x] Extended `/skill-roadmap` backup tools to include AI flashcard decks from `skill-roadmap-flashcards:v1`; exported/GitHub backup JSON is now version 3 with `progress`, `comments`, and `flashcards`, import remains compatible with older progress-only/version-2 files, and Clear localStorage removes flashcards too
- [x] Added AI flashcard generation to `/skill-roadmap/tasks/[taskId]`: completed tasks with non-empty notes can generate one flashcard deck from the full note plus all note comments, using server-side env-configured OpenAI-compatible AI settings; generated decks are stored in browser `localStorage` and rendered in a modern study panel with flip cards, progress stats, previous/next navigation, and hard/good self-ratings
- [x] Added dedicated `/skill-roadmap/tasks/[taskId]` task detail pages with roadmap/task metadata, localStorage-based completion/note status, parent breadcrumb, recursive child task list, and direct links from each roadmap task row; note content is intentionally not rendered as a preview on this detail screen
- [x] Updated `/skill-roadmap/tasks/[taskId]` so the detail screen includes a note textarea that saves to the same browser progress store while keeping Markdown preview separate, and nested child task branches can be expanded/collapsed to keep parent task pages compact
- [x] Added Prompt AI support to `/skill-roadmap/tasks/[taskId]`, matching the roadmap list behavior with two-line preview, show/hide, and clipboard copy controls
- [x] Fixed Markdown comment thread detail deletion so removing the root comment saves the deletion and immediately returns users to the parent note instead of leaving an empty thread screen
- [x] Added dedicated Markdown comment thread detail pages at `/skill-roadmap/notes/[taskId]/comments/[commentId]`; the Markdown note page now acts as a compact thread inbox while reading/replying happens on the focused thread page backed by the same localStorage comment data
- [x] Compact Markdown preview discussion threads so the root composer opens on demand, only recent root threads render initially, collapsed root threads show a two-line preview with reply/activity metadata, and opened threads show only the latest replies until users expand older replies
- [x] Reworked the Markdown preview AI model selector into a professional searchable model picker with provider model filtering by name/id/owner, selected-model highlighting, result counts, empty search state, manual model fallback before provider models are loaded, and auto-collapse after model selection
- [x] Upgraded Markdown preview "Hỏi AI" answers to stream progressively: `/api/ai/comment` now requests OpenAI-compatible streaming chat completions and the comment UI creates a temporary AI reply, renders incoming Markdown chunks live, shows a professional typing/receiving state, and persists the final answer
- [x] Added AI model discovery for Markdown preview comment composer: `/api/ai/models` now calls OpenAI-compatible `/models` using the provider Base URL without requiring an API key unless the provider itself requires one, with Kilo AI preset to `https://api.kilo.ai/api/gateway`; the "Hỏi AI" composer can load provider models into a selectable dropdown while keeping manual model entry as fallback
- [x] Added previous/next lesson navigation to `/skill-roadmap/notes/[taskId]`, using roadmap order and browser progress completion state to jump only to the nearest already-completed lesson before or after the current note, with disabled professional states when no completed lesson exists
- [x] Polished the Markdown preview previous/next lesson controls on mobile with a compact two-column navigation bar, circular icons, two-line title clamp, and clearer disabled states
- [x] Added desktop-only Markdown file scroll controls in the note preview sidebar so readers can jump to the start or end of the rendered Markdown article without scrolling into the comment section
- [x] Refined Markdown preview navigation UI again: mobile previous/next now renders as a tighter segmented reading navigation control, and desktop Markdown file quick-scroll uses a compact sidebar action panel
- [x] Converted Markdown preview navigation controls to floating UI: mobile previous/next now stays as a floating bottom bar, while desktop Markdown start/end scroll is an icon rail floating above the page
- [x] Enabled the floating Markdown start/end scroll controls on mobile too, positioned separately from the mobile appendix and previous/next controls
- [x] Repositioned mobile Markdown start/end scroll controls beside the floating appendix button for a cleaner grouped reading toolbar
- [x] Added Markdown note preview comment threads with unlimited nested replies, browser localStorage persistence per task, and a composer that can switch between normal comments and AI questions
- [x] Added `/api/ai/comment` OpenAI-compatible AI bridge for Markdown preview comments, supporting OpenRouter by default and custom/Kilo AI-compatible Base URLs, with API keys entered per AI request and never stored by the app
- [x] Added Markdown preview comment deletion and professional long-comment collapsing with rendered Markdown fade-out/expand controls, including branch deletion for comments with replies
- [x] Extended `/skill-roadmap` backup tools so Export JSON, Import JSON, and GitHub commit backup include Markdown preview comments alongside roadmap progress while remaining compatible with old progress-only backup files
- [x] Updated `/skill-roadmap` completed-task note inputs so empty notes show a red border and notes with trimmed content show a green border
- [x] Added a `/skill-roadmap` study status filter so users can show all tasks, completed tasks, not-started tasks, partially in-progress parent tasks, or tasks with notes while keeping matching child tasks visible under their parent hierarchy
- [x] Added a confirmed reset action in `/skill-roadmap` backup tools to clear browser `skill-roadmap-progress:v1` localStorage and reload the latest progress seed from the project JSON
- [x] Added a Markdown heading appendix to `/skill-roadmap/notes/[taskId]` under the task info sidebar, with generated in-page anchor links to each rendered heading
- [x] Optimized the Markdown note appendix for long notes by making the appendix list independently scrollable, keeping the desktop sidebar viewport-bound, and compacting task metadata on mobile/tablet
- [x] Reworked the Markdown note appendix on mobile into a floating action button plus bottom sheet so readers can open the appendix from anywhere in the note without scrolling back to the top
- [x] Hardened Markdown note preview against horizontal overflow on mobile and narrow devices by adding min-width constraints to layout containers, internal scrolling for table/code blocks, safer wrapping for long titles/links/text, and global document overflow guards
- [x] Restored desktop sticky behavior for the Markdown note task info sidebar by removing overflow clipping from sticky ancestors/root document, moving appendix scrolling into the appendix list, and keeping overflow protection on the preview content blocks
- [x] Added active-section highlighting to the Markdown note appendix so the current heading is emphasized while scrolling, including both desktop sidebar and mobile bottom sheet appendix views
- [x] Rà soát và chuẩn hóa ngôn ngữ CV/portfolio/print/PDF: giữ các keyword kỹ thuật và chức danh như Backend, Full Stack, Gateway, Microservices, JWT, Kafka, ECDH Encryption, Signature Service; Việt hóa các cụm mô tả thường gây lẫn Anh-Việt như Implement, check status, receipt, file service/report module, SQL performance, Export Excel, real-time integration, deployment assets
- [x] Rebuilt `/skill-roadmap/notes/[taskId]` Markdown preview with a reusable professional renderer supporting headings, inline formatting, links, images, tables, ordered/unordered/task lists, blockquotes/callouts, horizontal rules, and language-labeled fenced code blocks including SQL/database formats
- [x] Added light/dark Markdown preview styling in `src/app/globals.css` for readable typography, responsive tables, IDE-like syntax-highlighted code blocks with line numbers, language auto-detection, database code emphasis, checklist controls, and callout variants
- [x] Split Markdown preview colors into dedicated light/dark CSS variables so headings, body text, links, inline code, lists, tables, callouts, images, code text, line numbers, and token colors keep readable contrast in both themes
- [x] Added `prefers-color-scheme: dark` support for global and Markdown CSS variables so Markdown content and code blocks follow both class-based and system/browser dark mode
- [x] Added rendered-theme detection in `MarkdownPreview` so Markdown/code palettes follow the actual visible page background, including class-based, data-theme, system dark mode, and computed body background cases
- [x] Added env-driven defaults for `/skill-roadmap` GitHub backup form, including server-side token fallback via `GITHUB_BACKUP_TOKEN` without exposing the token to browser JavaScript
- [x] Fixed TypeScript build error in `/api/skill-roadmap/backup/github` by normalizing unknown GitHub error responses before building contextual error messages
- [x] Hardened `/api/skill-roadmap/backup/github` with GitHub repo/branch preflight checks, more tolerant repo URL parsing, normalized backup paths, and contextual Vietnamese errors for token permission, branch, repo access, conflict, and validation failures
- [x] Made `/skill-roadmap` progress Vercel-safe by persisting runtime completion state and notes in browser `localStorage` instead of writing to bundled JSON files in production
- [x] Updated `/skill-roadmap` hierarchical todo progress so parent rows show an in-progress color when any descendant task is completed and are auto-marked complete when all descendant tasks are completed
- [x] Extended local-dev roadmap progress sync to persist multi-task updates in one request, including auto-updated parent task states
- [x] Updated `/skill-roadmap/notes/[taskId]` to read notes from browser progress storage so Markdown preview reflects Vercel/runtime edits
- [x] Kept `src/data/skill-roadmap-progress.json` as seed/local-dev sync fallback and made production API write attempts return a clear unsupported-runtime error
- [x] Hardened `/api/skill-roadmap/progress` import handling so roadmap progress backups return clearer JSON format errors and accept compatible backup shapes
- [x] Added `/skill-roadmap` professional study roadmap page for Nguyễn Quang Ngọc's full Backend / Full-Stack skill set
- [x] Added manual roadmap progress backup controls: Export JSON, Import JSON, and optional GitHub commit backup
- [x] Added per-task Markdown note preview opened from each completed task note via `/skill-roadmap/notes/[taskId]`
- [x] Made the task info sidebar sticky on desktop in per-task Markdown note preview
- [x] Added `/api/skill-roadmap/backup/github` route to commit roadmap progress backups to a configured GitHub repository using a one-time token
- [x] Added per-node AI learning prompts to `/skill-roadmap`, with preview, show/hide, and copy-to-clipboard controls
- [x] Fixed TypeScript build error in `/skill-roadmap` task tree filtering by removing nullable map results
- [x] Adjusted roadmap AI prompts to emphasize theory, internal mechanisms, why/how explanations, trade-offs, and deep interview questions
- [x] Added subtle depth-based backgrounds and left borders to roadmap todo nodes for clearer parent/child separation
- [x] Added expand/collapse controls for roadmap todo nodes with child tasks, including open-all and collapse-all actions
- [x] Expanded skill roadmap into a parent-child todo hierarchy where parent tasks, child tasks, and deeper child nodes all support completion state and notes
- [x] Added JSON-backed roadmap data with 9 tracks, 18 modules, 298 todo nodes, estimated hours, levels, deliverables, and skill tags
- [x] Added roadmap progress storage for completion state and post-completion notes
- [x] Added `/api/skill-roadmap/progress` route for seed reads and local-dev JSON sync into `src/data/skill-roadmap-progress.json`
- [x] Added navigation entry for the new study roadmap page in header, side nav, and site config
- [x] Added direct edit mode on `/print` so users can adjust visible CV text before saving the browser PDF
- [x] Added local draft persistence for edited print CV content with reset support
- [x] Fixed `/print` hydration mismatch by deferring localStorage-derived draft state until after mount
- [x] Refreshed CV content into a more senior/professional Backend / Full-Stack Developer profile
- [x] Rebuilt selected projects around GOV Payment Service / C12 (2026-05 – present), SHB SAHA Mobile Banking Cambodia (2026-01 – 2026-06), and SHB Debit Collection Portal (2025-11 – 2026-01)
- [x] Reworked Alphaway/SHB work experience as a current employer assignment covering payment gateway, mobile banking, and debit collection systems
- [x] Added payment/core banking skills: Core Banking/ESB integration, Payment Gateway/Napas/VietQR, JdbcTemplate/Stored Procedures, Spring Web MVC, Resilience4j, Actuator/Micrometer/Prometheus
- [x] Rebuilt `/print` route into a dense print-friendly CV layout with summary, highlights, core skills, experience, project experience, education, certifications, and languages
- [x] Localized all visible resume/portfolio/print/PDF-export UI text to Vietnamese
- [x] Updated print/PDF typography: Times New Roman, candidate name 24px, section titles 16px, other content 13px, stronger bold emphasis for highlighted information
- [x] Updated displayed month/year dates to MM-YYYY format across print/PDF, experience cards, certifications, text export, and project durations
- [x] Shortened print/PDF CV by removing repeated top highlights, limiting printed skills, reducing bullet counts, and keeping the 4 strongest projects in the PDF version
- [x] Improved print pagination so long section headings stay with their first content item instead of being orphaned at page bottom
- [x] Restored full professional summary in `/print` while keeping duplicated top highlight bullets removed
- [x] Added SHB Debit Collection Portal project entry (featured), timeline 2025-11 – 2026-01
- [x] Added SHB SAHA Mobile Banking Cambodia project entry, timeline 2026-01 – 2026-06
- [x] Added SHB SAHA Mobile Banking Cambodia project entry (featured)
- [x] Updated skills: Spring Security, Oracle PL/SQL, JWT/Nimbus JOSE, SMS Gateway
- [x] Updated profile summary & highlights to reflect SHB Mobile Banking Cambodia
- [x] Added new work experience: Alphaway (Onsite SHB Bank) — Backend Developer from Nov 2025
- [x] Updated MBBank experience: set end date Oct 2025, marked as not current
- [x] Updated profile summary & highlights to reflect SHB Debit Collection Portal project
- [x] Added new skills: Spring Cloud Gateway, Eureka, Keycloak OIDC, MinIO, Apache POI, iText, MapStruct, Kubernetes, GitLab CI/CD, reCAPTCHA v3
- [x] Profile header with photo support
- [x] Professional summary section
- [x] Experience timeline with animations
- [x] Skills section with visual progress bars
- [x] Education section with certifications and awards
- [x] Portfolio page with project filtering
- [x] Contact section with form
- [x] Print-optimized view
- [x] Side navigation for desktop
- [x] Dark mode support
- [x] Centralized configuration in site.config.ts
- [x] Memory bank migrated to .kilocode/rules/memory-bank/

## Components Implemented

| Component | File | Status |
|-----------|------|--------|
| Profile Header | `src/components/resume/ProfileHeader.tsx` | ✅ Complete |
| Summary | `src/components/resume/Summary.tsx` | ✅ Complete |
| Experience Timeline | `src/components/resume/ExperienceTimeline.tsx` | ✅ Complete |
| Skills Section | `src/components/resume/SkillsSection.tsx` | ✅ Complete |
| Education Section | `src/components/resume/EducationSection.tsx` | ✅ Complete |
| Certifications | `src/components/resume/CertificationsSection.tsx` | ✅ Complete |
| Languages | `src/components/resume/LanguagesSection.tsx` | ✅ Complete |
| Editable Print Resume | `src/components/resume/PrintResumeEditor.tsx` | ✅ Complete |
| Portfolio Grid | `src/components/portfolio/ProjectGrid.tsx` | ✅ Complete |
| Contact Form | `src/components/contact/ContactForm.tsx` | ✅ Complete |
| Skill Roadmap | `src/components/roadmap/SkillRoadmapClient.tsx` | ✅ Complete |
| Markdown Preview | `src/components/markdown/MarkdownPreview.tsx` | ✅ Complete |
| Header | `src/components/layout/Header.tsx` | ✅ Complete |
| Footer | `src/components/layout/Footer.tsx` | ✅ Complete |
| Side Nav | `src/components/layout/SideNav.tsx` | ✅ Complete |

## Current Focus

The resume has been fully customized for **Nguyễn Quang Ngọc** (Backend / Full-Stack Developer, Hà Nội):
- Profile: quangngoc201197@gmail.com, 0346238899, Đa Phúc Hà Nội
- 4 work experiences: Alphaway/SHB (current), Paraline/MBBank, Bảo Việt, GMO Runsystem
- Skills in Java/Spring Boot, Spring Cloud, Microservices, Kafka, ReactJS, PostgreSQL, OracleDB, Redis, Keycloak, MinIO, ELK, Docker, Kubernetes, Core Banking/ESB integration, Payment Gateway/Napas/VietQR
- Education: UTT (2023–2025) and FPT Polytechnic (2020–2022)
- 7 projects: GOV Payment Service / C12, SHB SAHA Mobile Banking Cambodia, SHB Debit Collection Portal, CMV MBBank, MyBV Life, Veritas, Hywork
- `/skill-roadmap` provides a professional 24-week hierarchical study todo list covering Java/JVM, Spring backend, microservices/event-driven architecture, banking/payment domain, database/cache/storage, security, DevOps/observability, frontend/full-stack delivery, and senior engineering/testing
- `/skill-roadmap/tasks/[taskId]` provides a focused task detail screen for any roadmap node, showing full task metadata, parent path, completion/note status from browser progress, and recursive child tasks for parent tasks while intentionally keeping Markdown note preview out of this screen
- Task detail pages include direct note editing with localStorage persistence and local-dev progress sync on blur, while nested task children are collapsed until opened branch-by-branch
- Parent task detail pages can automatically generate a missing note with AI after the task is effectively completed. The feature is server-side opt-in through `AI_TASK_NOTE_ENABLED=true` plus `AI_TASK_NOTE_API_KEY`, `AI_TASK_NOTE_BASE_URL`, and `AI_TASK_NOTE_MODEL` env config; it will not run for leaf tasks, incomplete parent tasks, or tasks that already have note content. Browser cooldown metadata is stored under `skill-roadmap-auto-task-note:v1` to avoid repeated calls, and users can clear the current task's cooldown from the Note card retry action.
- Task detail Note cards and the shared task preview drawer can now request AI to rewrite an existing note according to a custom instruction. Manual rewrite uses the same `/api/ai/task-note` route with `mode: "rewrite"`, requires `AI_ENV_CONFIRM_PASSWORD`, keeps API credentials server-side, and persists the rewritten Markdown through the existing roadmap progress storage/sync flow.
- Task detail pages also show the generated AI learning prompt for the current task with show/hide and copy controls, using the same theory-focused prompt structure as the main roadmap list
- Task detail pages link to `/skill-roadmap/tasks/[taskId]/flashcards`, a dedicated AI flashcard screen. `/api/ai/flashcards` uses `AI_FLASHCARD_API_KEY`, `AI_FLASHCARD_BASE_URL`, and `AI_FLASHCARD_MODEL` from env, consumes the task note plus every saved note comment, and stores multiple generated flashcard decks per task in browser `localStorage` under `skill-roadmap-flashcards:v1`. New decks include prior card fronts as anti-duplication context and are rejected if more than 50% of generated cards are similar to existing cards.
- Task detail pages now link to `/skill-roadmap/tasks/[taskId]/quiz`, a dedicated AI multiple-choice quiz screen. `/api/ai/quizzes` uses the same env-configured OpenAI-compatible settings as flashcards, consumes the task note plus every saved note comment, and stores multiple generated quiz decks per task in browser `localStorage` under `skill-roadmap-quizzes:v1`. New quiz packs include prior questions as anti-duplication context and are rejected if more than 50% of generated questions are similar to existing ones.
- `/skill-roadmap/notes/[taskId]` now includes direct Next.js navigation links to task detail, flashcards, and quiz for the current task.
- `/skill-roadmap/review` provides a responsive mindmap review screen with touch-friendly pan, two-finger pinch zoom, desktop wheel/ctrl-wheel navigation, compact filters/stats, and a task preview panel optimized as a mobile sheet and desktop slide-over.
- `/markdown-files` provides a standalone document storage workspace for longer self-authored notes/drafts. It stores a hierarchy of folder and file nodes in browser `localStorage` under `markdown-files:v1`; files preview through the shared Markdown renderer, folders can contain nested folders/files, and the whole tree is included in the same versioned backup payload so it can be exported/imported with the rest of the local learning data.
- Flashcard and quiz study screens now include focused comment/AI threads through `StudyCommentThread`. Flashcard comments are scoped to the active deck/card, quiz comments are scoped to the active deck/question/attempt, and AI requests send only the active study context through `/api/ai/comment` `studyContext`.
- Duplicate detection for AI flashcard and quiz generation is user-configurable, defaults to enabled, persists in browser localStorage, and controls whether existing card fronts/questions are sent to generation endpoints.
- Flashcard review progress is now a clickable segmented bar with gray unrated, emerald remembered, orange hard, and a ring on the active card.
- Roadmap tree parent nodes now stay compact by hiding the AI prompt and note textarea/link in the tree view; parent task detail pages still show the full prompt and note content.
- Roadmap child-count badges now count direct children only while recursive completion detection still uses all descendants.
- Roadmap hero progress metrics now count only leaf tasks for completion rate, task count, and study hours.
- Each quiz pack stores `durationMinutes` from AI and an `attempts` array with started time, submitted time, selected answers by question id, score, total questions, and submission source (`user` or `timeout`). The quiz UI only starts after user confirmation, then counts down and auto-submits at zero seconds while continuously saving answers to localStorage.
- Saved quiz attempts in the history sidebar are clickable and open the full submitted attempt for review without changing the stored answers.
- Each roadmap node includes a concise generated AI learning prompt with two-line preview, show/hide control, and copy-to-clipboard action; prompts emphasize theory, internal mechanisms, why/how explanations, trade-offs, and deep interview questions
- Roadmap task rows use subtle depth-based background colors and left borders; completed rows keep a stronger green completion signal
- Roadmap parent task rows now show an amber in-progress state as soon as at least one descendant task is completed; once all descendants are completed, the corresponding parent chain is auto-marked completed and persisted
- Roadmap nodes with child tasks can be expanded/collapsed individually; the filter toolbar also has "Mở tất cả" and "Thu gọn tất cả" controls
- The `/skill-roadmap` filter toolbar includes a study status dropdown for all/completed/not-started/in-progress/with-note filtering, using descendant completion to identify partially in-progress parent tasks
- The roadmap now breaks broad topics into important interview-level fundamentals with multiple nested levels; examples include detailed OOP/SOLID/immutable/equals-hashCode/defensive-copying/entity-value-DTO subtrees plus branch-level grouping for Stream/Optional, ExecutorService/CompletableFuture, REST API design, JPA/Hibernate, Kafka/resilience, banking/payment flows, database/cache/storage, security, DevOps/observability, frontend, testing, and system design
- Skill roadmap source data is stored in `src/data/skill-roadmap.json`; user completion state and notes are persisted in browser `localStorage` under `skill-roadmap-progress:v1`, with `src/data/skill-roadmap-progress.json` kept as seed/local-dev JSON sync only
- `/skill-roadmap` includes backup tools for roadmap progress: browser JSON export/import plus optional GitHub commit backup using the current browser progress payload. GitHub tokens are submitted per request and not persisted by the app.
- Backup tools now include a confirmed local reset action that removes browser `skill-roadmap-progress:v1` and reloads the newest seed from `src/data/skill-roadmap-progress.json` through `/api/skill-roadmap/progress`.
- GitHub backup form defaults can be configured with `GITHUB_BACKUP_REPO_URL`, `GITHUB_BACKUP_BRANCH`, `GITHUB_BACKUP_PATH`, `GITHUB_BACKUP_COMMIT_MESSAGE`, and `GITHUB_BACKUP_TOKEN`; the token is consumed server-side and never returned by the config API.
- GitHub backup now checks repository and branch access before writing the backup file, accepts common repo URL forms (`https://github.com/owner/repo`, copied GitHub URLs, SSH URL, and `owner/repo`), and returns actionable/contextual Vietnamese errors for common GitHub API failures.
- `/skill-roadmap/notes/[taskId]` previews the selected task note as Markdown in a new tab by reading the same browser progress storage, with sticky task metadata and completion status on desktop
- Completed task note inputs on `/skill-roadmap` visually flag missing note content with red borders and switch to green once the note has non-whitespace content.
- Markdown note preview now uses reusable `src/components/markdown/MarkdownPreview.tsx` and supports richer professional Markdown formatting for headings, body text, tables, syntax-highlighted source code with auto-detected languages, SQL/database snippets, checklists, links, images, callouts, generated heading anchors, a desktop sidebar appendix/table of contents with independent scrolling and active-section highlighting, a mobile floating appendix bottom sheet, horizontal-overflow-safe responsive containers, and dedicated light/dark readability palettes that follow the actual rendered page theme
- Markdown note preview now includes `src/components/roadmap/MarkdownCommentThreads.tsx`, which stores nested comment/reply threads in browser `localStorage` under `skill-roadmap-note-comments:v1`. The composer can submit normal comments or ask AI; AI answers are inserted as replies, and follow-up AI requests include a compact Markdown summary plus the active comment ancestry for context.
- Markdown preview comments can be deleted; deleting a parent comment also removes its nested replies after confirmation. Long comments stay rendered as Markdown but are height-constrained with a fade-out and "Xem thêm nội dung Markdown" / "Thu gọn" control.
- Task detail and Markdown note preview have previous/next controls based on full roadmap order filtered to lowest-level leaf tasks only, including unfinished tasks and skipping every parent node. On mobile these controls stay as a floating bottom navigation bar, with the appendix floating button lifted above it on note preview to avoid overlap.
- Markdown note preview includes floating icon controls for "Đầu file" and "Cuối file" on both desktop and mobile. The controls scroll only within the rendered Markdown article bounds, keeping the comment section outside the target range. On mobile, the scroll controls sit above the floating appendix button and previous/next lesson bar to avoid overlap on narrow screens.
- `/skill-roadmap` backup now exports a versioned JSON object containing `progress`, `comments`, `flashcards`, `quizzes`, `studyComments`, and `markdownFiles`, where comments come from `skill-roadmap-note-comments:v1`, flashcards come from `skill-roadmap-flashcards:v1` as `Record<taskId, FlashcardDeck[]>`, quizzes come from `skill-roadmap-quizzes:v1`, flashcard/quiz comment threads come from `skill-roadmap-study-comments:v1`, and standalone Markdown files come from `markdown-files:v1`. Import accepts the current combined format, older single-flashcard-deck backups, older comment/flashcard/quiz backups without `studyComments`/`markdownFiles`, and older progress-only JSON backups. GitHub backup commits the combined payload, and the Clear localStorage action now clears progress, comment, flashcard, quiz, study-comment, and markdown-file storage before reloading from the project seed.
- `src/data/skill-roadmap-progress.json` can now store the same combined backup shape used by Export/GitHub backup. When browser `localStorage` is missing progress, comments, or flashcards, the roadmap, note preview/comment, thread detail, and task detail screens hydrate the missing pieces from this seed file.
- `/api/ai/comment` proxies one-off AI questions to OpenAI-compatible streaming chat completion endpoints. Kilo AI and OpenRouter use preset Base URLs, while other providers can be used through the custom Base URL field. Kilo AI can use `AI_COMMENT_KILO_API_KEY`, `AI_COMMENT_KILO_BASE_URL`, and `AI_COMMENT_KILO_MODEL` from env server-side so the API key is never displayed in the browser; requests using env-backed keys require a matching `AI_ENV_CONFIRM_PASSWORD` confirmation. Non-Kilo providers still accept one-off API keys submitted only with the request and not persisted in localStorage.
- AI comment answers now stream into the Markdown comment thread as they arrive. The UI inserts a temporary AI reply under the user's question, renders partial Markdown progressively, shows "AI đang soạn câu trả lời..." / "Đang nhận nội dung" states, and rolls back the temporary reply if the stream fails before a final answer is produced.
- `/api/ai/models` loads available OpenAI-compatible models from the selected provider using the provider preset Base URL or the custom Base URL when selected. For Kilo AI it falls back to server-side env API settings and returns `defaultModel` from env without exposing secrets after `AI_ENV_CONFIRM_PASSWORD` is confirmed. The Markdown comment composer auto-loads Kilo AI models after the confirmation password is entered, uses the env default model when present, shows the returned models as a dropdown, and still accepts manual model IDs when a provider does not support `/models`.
- The Markdown comment composer now uses a searchable model picker after models are loaded: users can filter by model name, id, or owner; see match counts; select from a scrollable list that auto-collapses after choosing a model; and keep manual model entry before loading models.
- Print/PDF route `/print` now includes full project experience and is optimized for professional A4 PDF export
- `/print` supports direct in-browser editing before PDF export; edited DOM content is persisted in localStorage and used by the browser print/save-PDF flow
- Visible UI language is Vietnamese across home, portfolio, contact, print/PDF page, and text/PDF helper endpoints
- CV content now intentionally keeps technical recruiting keywords in English while using Vietnamese for surrounding descriptions, so the tone is less mixed without losing ATS/recruiter keywords
- Print/PDF typography uses Times New Roman with 24px candidate name, 16px section headings, and 13px body content
- Displayed month/year ranges use MM-YYYY format, with current items ending in `Hiện tại` or `Nay`
- Print/PDF CV is intentionally concise; full project portfolio remains available on `/portfolio`
- Print CSS now uses `break-after: avoid-page` and `break-inside: avoid-page` for section headings and first content blocks
- `/print` uses the full profile summary, but keeps the top highlight bullet block removed to avoid duplicated project content

## Quick Customization Guide

### To change personal info:
Edit `src/data/profile.ts`:
- `profile.name` - Full name
- `profile.title` - Job title
- `profile.email` - Contact email
- `profile.summary` - Professional summary

### To change work experience:
Edit `src/data/experience.ts`:
- Add/modify entries in `experience` array
- Include title, company, dates, achievements

### To change skills:
Edit `src/data/skills.ts`:
- Add/modify entries in `skills` array
- Set `level` (0-100) for skill bars
- Organize by `category`

### To change theme color:
Edit `src/config/site.config.ts`:
- `theme.primaryColor` - HSL color value
- Popular options: Blue `220 92% 50%`, Purple `280 70% 50%`, Green `150 70% 45%`

### To toggle features:
Edit `src/config/site.config.ts` → `features`:
- `portfolio: boolean` - Show/hide portfolio
- `skillBars: boolean` - Show/hide skill bars
- `certifications: boolean` - Show/hide certifications
- `sideNav: boolean` - Show/hide side navigation

## Known Considerations

- Profile image expects `/images/profile.jpg` → Add real photo
- Project thumbnails expect `/projects/` images
- Contact form sends email through Resend when `RESEND_API_KEY` and `CONTACT_EMAIL_FROM` are configured
- Avatar images use placeholders → Replace with real photos

## Pending Improvements (Optional)

- [ ] Add more theme color presets
- [ ] Add skills chart visualization
- [ ] Add testimonials/recommendations section
- [ ] Add blog/articles integration
- [ ] Add multi-language support

## Session History

| Date | Activity |
|------|----------|
| 2026-06-26 | Added opt-in safe AI auto-note generation for completed parent task detail pages with no-overwrite guards and localStorage cooldown |
| 2026-06-18 | Reworked `skill-roadmap.json` from broad generated child placeholders into 624 multi-level topic/branch/leaf todo nodes |
| 2026-06-18 | Added focused skill roadmap task detail pages with child task drill-down and no note preview rendering |
| 2026-06-18 | Added note editing and collapsible child task branches to focused skill roadmap task detail pages |
| 2026-06-18 | Added show/hide and copy controls for generated AI learning prompts on skill roadmap task detail pages |
| 2026-06-18 | Redirected Markdown comment thread detail back to the note after deleting the root thread comment |
| 2026-06-18 | Added dedicated Markdown comment thread detail pages and changed note comments into compact links to focused thread conversations |
| 2026-06-18 | Compacted Markdown preview discussion threads with on-demand composer, root thread previews, visible thread limits, and collapsed older replies |
| 2026-06-18 | Reworked Markdown preview AI model selection into a searchable model picker |
| 2026-06-18 | Changed Markdown preview AI answers from wait-then-render to progressive streaming replies |
| 2026-06-18 | Added provider model discovery and selectable model dropdown to Markdown preview AI questions |
| 2026-06-18 | Added desktop Markdown article start/end scroll controls to note preview sidebar |
| 2026-06-18 | Refined Markdown preview mobile prev/next and desktop quick-scroll controls for a more professional navigation UI |
| 2026-06-18 | Converted Markdown preview prev/next and file-scroll actions into floating controls |
| 2026-06-18 | Enabled floating Markdown file start/end scroll controls on mobile |
| 2026-06-18 | Moved mobile Markdown file scroll controls above the appendix floating button to avoid overlap |
| 2026-06-18 | Polished mobile UI for Markdown preview previous/next lesson navigation |
| 2026-06-18 | Added completed-lesson previous/next navigation to Markdown note preview |
| 2026-06-18 | Extended roadmap backup/export/import/GitHub commit flow to include Markdown preview comments in addition to progress and notes |
| 2026-06-18 | Added delete controls for Markdown preview comments, including nested branch deletion, plus rendered Markdown long-comment collapse/expand behavior |
| 2026-06-18 | Added nested Markdown preview comment threads with normal-comment/ask-AI composer, OpenRouter/custom OpenAI-compatible AI bridge, per-request API key entry, and compact Markdown/thread context for AI replies |
| 2026-06-18 | Updated `/skill-roadmap` note input borders to red when empty and green when populated |
| 2026-06-18 | Added study status filtering to `/skill-roadmap` for completed, not-started, in-progress parent tasks, and tasks with notes |
| 2026-06-18 | Added confirmed `/skill-roadmap` backup action to clear progress localStorage and reload the newest project JSON seed |
| 2026-06-17 | Rà soát lại ngôn ngữ CV/PDF và portfolio project text, Việt hóa cụm mô tả thường trong `src/data` và `cv-base.md` trong khi giữ keyword kỹ thuật/chức danh |
| 2026-06-14 | Upgraded per-task Markdown note preview with a reusable professional renderer, language auto-detection, IDE-like syntax-highlighted code, and light/dark styles for tables, database snippets, lists, links, images, and callouts |
| 2026-06-14 | Fixed GitHub roadmap backup API typecheck failure by normalizing unknown GitHub error bodies before passing them to `buildGithubError` |
| 2026-06-14 | Added env-driven default GitHub backup settings and server-side token fallback |
| 2026-06-14 | Hardened GitHub roadmap backup diagnostics and repo URL/path normalization |
| 2026-06-14 | Made roadmap progress Vercel-safe with browser localStorage persistence, local-dev JSON sync fallback, and client-side note preview storage |
| 2026-06-14 | Added derived parent task state for hierarchical roadmap todos: partial descendant progress color and auto-complete parent chain |
| 2026-06-14 | Hardened roadmap progress JSON import validation and improved backup format error messages |
| 2026-06-14 | Added per-task Markdown note preview opened from each completed roadmap task |
| 2026-06-14 | Fixed nullable `filterTaskTree` return typing in `/skill-roadmap` build |
| 2026-06-14 | Made per-task Markdown preview metadata sidebar sticky on desktop |
| 2026-06-14 | Added manual JSON export/import and optional GitHub commit backup for `/skill-roadmap` progress |
| 2026-06-14 | Added per-node AI learning prompt preview/view/copy controls to `/skill-roadmap` |
| 2026-06-14 | Adjusted `/skill-roadmap` prompts toward theory-first learning and deep why/how explanations |
| 2026-06-14 | Added subtle depth-based row backgrounds to hierarchical `/skill-roadmap` |
| 2026-06-14 | Added expand/collapse controls for hierarchical `/skill-roadmap` nodes |
| 2026-06-14 | Expanded `/skill-roadmap` into a hierarchical todo roadmap with child-level completion tracking and notes |
| 2026-06-14 | Fixed hydration mismatch in editable print CV reset button state |
| 2026-06-14 | Added editable `/print` CV mode with local draft persistence and PDF export using the edited visible content |
| 2026-06-14 | Wired contact form API to send email through Resend with env-based configuration |
| 2026-06-13 | Restored full professional summary in print/PDF CV |
| 2026-06-13 | Improved print page-break behavior for Experience and Project sections |
| 2026-06-13 | Shortened `/print` CV content to reduce PDF length while keeping strongest banking/payment projects |
| 2026-06-13 | Changed displayed date format from month-name/year to MM-YYYY |
| 2026-06-13 | Updated `/print` typography and emphasis for PDF export |
| 2026-06-12 | Localized visible project UI and print/PDF CV labels to Vietnamese |
| 2026-06-12 | Refreshed professional CV content, added GOV Payment Service/C12, corrected SAHA timeline to Jan-Jun 2026, rebuilt project portfolio and print/PDF view |
| 2026-01-22 | Memory bank updated to match .kilocode standard structure |
| 2026-04-15 | Customized all data files for Nguyễn Quang Ngọc (Full-Stack Developer, Vietnam) |
| 2026-05-04 | Added Alphaway/SHB experience (Nov 2025–present), SHB Debit Collection Portal project, updated skills |
| 2026-05-05 | Added SHB SAHA Mobile Banking Cambodia experience & project, updated skills & profile |
| 2026-05-05 | Added SHB Debit Collection Portal project entry (2025-11 – 2026-01) |
