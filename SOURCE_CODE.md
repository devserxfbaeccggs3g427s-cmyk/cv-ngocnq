# Live Resume – Tài liệu Source Code

> Tài liệu này được tạo tự động nhằm tóm tắt cấu trúc, công nghệ, các module chính và quy ước code của dự án **Live Resume** (CV/Portfolio + Workspace học tập & AI tools).
>
> - Ứng dụng: **Next.js 16 App Router** + **React 19** + **TypeScript 5.9** + **Tailwind CSS 4**
> - Ngôn ngữ UI: **Tiếng Việt** (giữ keyword kỹ thuật bằng tiếng Anh)
> - Tác giả CV được cá nhân hoá cho **Nguyễn Quang Ngọc** (Backend / Full-Stack Developer)

---

## 1. Tổng quan dự án

Live Resume là một **template CV/Portfolio chạy bằng Next.js** được thiết kế để AI có thể tuỳ biến nhanh:

- Mọi nội dung CV/portfolio nằm gọn trong `src/data/*.ts`.
- Cấu hình theme/tính năng nằm trong `src/config/`.
- Ngoài phần CV công khai, dự án còn cung cấp một **Workspace** với các công cụ học tập & AI: Skill Roadmap, Markdown Files, AI Context, AI Image Analysis, Workspace Backup.
- Toàn bộ dữ liệu động (progress roadmap, note, flashcard, quiz, comment, study session, backup…) được lưu ở **browser `localStorage`** để an toàn khi deploy lên Vercel/serverless.

### Stack công nghệ

| Công nghệ | Phiên bản | Vai trò |
|---|---|---|
| Next.js | 16.2.x | Framework React App Router |
| React | 19.2.x | UI library |
| TypeScript | 5.9.x | Type-safe JavaScript |
| Tailwind CSS | 4.1.x | Utility-first CSS (CSS-first config) |
| framer-motion | 12.27.x | Animation |
| lucide-react | 0.562.x | Icon |
| react-hook-form + zod | 7.x + 4.x | Form & schema validation |
| recharts | 3.6.x | Biểu đồ (skill visualization) |
| mermaid | 11.15.x | Diagram trong Markdown preview |
| clsx + tailwind-merge | 2.x + 3.x | Conditional className |

### Scripts (package.json)

```bash
bun install         # cài dependencies
bun run dev         # chạy dev (KHÔNG dùng theo AGENTS.md – sandbox tự lo)
bun run build       # production build
bun run start       # chạy production
bun run lint        # eslint
bun run typecheck   # tsc --noEmit
```

> Quy ước nhóm: dùng **bun**, không chạy `next dev` thủ công, luôn `bun typecheck && bun lint` trước khi commit/push.

---

## 2. Cấu trúc thư mục `src/`

```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout, font Inter, SEO metadata, skip-link
│   ├── page.tsx                  # Home (giới thiệu + skills + projects + workspace preview)
│   ├── globals.css               # Tailwind + tokens + print CSS + Markdown preview styles
│   ├── favicon.ico
│   ├── portfolio/
│   │   ├── page.tsx              # Danh sách dự án + filter
│   │   └── [slug]/page.tsx       # Chi tiết dự án
│   ├── print/page.tsx            # CV dạng A4, in ra PDF, có chế độ edit localStorage
│   ├── workspace/
│   │   ├── page.tsx              # Hub dẫn tới các workspace tools
│   │   └── backup/page.tsx       # Export/Import/Reset/GitHub commit backup
│   ├── skill-roadmap/
│   │   ├── page.tsx              # Bảng roadmap 624 nodes (lọc, mở/thu gọn, note, prompt AI)
│   │   ├── review/page.tsx       # Mindmap review (pan/pinch zoom + preview sheet)
│   │   ├── notes/[taskId]/page.tsx            # Markdown note + comment thread
│   │   ├── notes/[taskId]/comments/[commentId]/page.tsx  # Focused thread
│   │   ├── tasks/[taskId]/page.tsx            # Task detail + note + child tasks
│   │   ├── tasks/[taskId]/flashcards/page.tsx # AI flashcards (deck-based)
│   │   └── tasks/[taskId]/quiz/page.tsx       # AI quizzes (multi-pack + attempt history)
│   ├── markdown-files/
│   │   ├── page.tsx              # Workspace quản lý folder/file Markdown
│   │   └── read/[fileId]/page.tsx             # Book reader full-screen cho file Markdown
│   ├── markdown-reader/[readerId]/page.tsx    # Generic full-screen reader cho preview content
│   ├── ai-context/page.tsx       # Workspace hỏi AI theo nguồn Markdown/roadmap
│   ├── ai-image-analysis/page.tsx# Workspace phân tích ảnh (vision)
│   └── api/
│       ├── contact/route.ts                 # POST gửi email qua Resend
│       ├── pdf/route.ts                     # GET thông tin PDF helper
│       ├── pdf/text/route.ts                # GET xuất text
│       ├── pdf/json/route.ts                # GET xuất JSON
│       ├── ai/comment/route.ts              # Streaming OpenAI-compatible AI cho comment
│       ├── ai/context-title/route.ts        # Sinh tiêu đề ngắn cho AI Context history
│       ├── ai/flashcards/route.ts           # Sinh deck flashcard (anti-dup)
│       ├── ai/quizzes/route.ts              # Sinh quiz (anti-dup, có durationMinutes)
│       ├── ai/task-note/route.ts            # Auto-generate / rewrite note task
│       ├── ai/models/route.ts               # OpenAI-compatible /models discovery
│       ├── ai/image-analysis/route.ts       # Vision (multimodal) OpenAI-compatible
│       ├── skill-roadmap/progress/route.ts  # GET seed + POST sync (local-dev only)
│       └── skill-roadmap/backup/github/route.ts  # POST commit backup JSON lên GitHub
│
├── components/
│   ├── ui/                       # Primitives: Button, Card, Container, Section, Modal, Badge, Progress, Timeline, PrintButton
│   ├── layout/                   # Header, Footer, SideNav, Navigation
│   ├── resume/                   # ProfileHeader, Summary, ExperienceTimeline (+Card), SkillsSection (+Bar), EducationSection, CertificationsSection, LanguagesSection, PrintResumeEditor
│   ├── portfolio/                # ProjectGrid, ProjectCard, ProjectFilters, ProjectDetail
│   ├── contact/                  # ContactSection, ContactForm, SocialLinks
│   ├── markdown/                 # MarkdownPreview (parser + renderers + tokenizers, tách module)
│   ├── markdown-files/           # MarkdownFilesClient, MarkdownBookReader
│   ├── ai-context/               # AiContextWorkspace
│   ├── ai-image-analysis/        # AiImageAnalysisWorkspace
│   ├── workspace/                # WorkspaceBackupClient, WorkspaceBackupPanel
│   └── roadmap/                  # Toàn bộ logic skill-roadmap (client/comments/flashcards/note-preview/quiz/review-minimap/task-detail/shared)
│
├── config/
│   ├── site.config.ts            # SiteConfig: meta, theme, features, navigation, social, sectionOrder, contactForm
│   ├── navigation.config.ts      # Portfolio nav + workspace features (data cho Header/SideNav/Footer/Home)
│   └── index.ts                  # Barrel export
│
├── data/
│   ├── profile.ts                # Personal info, summary, highlights
│   ├── experience.ts             # Work history (Experience[])
│   ├── skills.ts                 # Skill[], Language[], category labels
│   ├── education.ts              # Education[], Certification[], Award[]
│   ├── projects.ts               # Project[] + categories + helpers
│   ├── skill-roadmap.json        # Curriculum (9 tracks, 624 todo nodes)
│   └── skill-roadmap-progress.json  # Seed + local-dev sync (production dùng localStorage)
│
├── hooks/                        # useProgress, useFlashcardDecks, useQuizDecks, useNoteComments, useDataDecks, useAutoTaskNote, useGithubBackup, useLocalStorage, useRoadmapFilters
│
├── lib/
│   ├── utils.ts                  # cn() helper (clsx + tailwind-merge)
│   ├── date.ts                   # formatMonthYear()
│   ├── pdf.ts                    # PDF/text/JSON helpers (cho /api/pdf/*)
│   ├── api/                      # Provider + similarity + parser helpers chia sẻ giữa các AI route
│   └── roadmap/                  # backup, constants, filters, flatten-tasks, format, hydration, navigation, normalize-quizzes, normalize, prompts, seed-helpers, storage, index
│
└── types/                        # backup.ts, comments.ts, flashcards.ts, markdown-files.ts, progress.ts, quizzes.ts, roadmap.ts, study-comments.ts, index.ts
```

---

## 3. App Router – các route chính

| Đường dẫn | File | Loại | Mô tả |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Server Component | Trang chủ: Profile + Summary + Experience + Skills + Education + Cert + Languages + Featured projects + Workspace preview + Contact |
| `/portfolio` | `src/app/portfolio/page.tsx` | Server | Lưới dự án với filter theo category |
| `/portfolio/[slug]` | `src/app/portfolio/[slug]/page.tsx` | Server | Trang chi tiết dự án |
| `/print` | `src/app/print/page.tsx` | Server + Client island | CV dạng A4, có thể edit trước khi in PDF; lưu localStorage |
| `/workspace` | `src/app/workspace/page.tsx` | Server | Hub cho các công cụ workspace |
| `/workspace/backup` | `src/app/workspace/backup/page.tsx` | Client | Export/Import/Reset localStorage + GitHub commit backup |
| `/skill-roadmap` | `src/app/skill-roadmap/page.tsx` | Client | Bảng roadmap dạng cây, filter, note, AI prompt |
| `/skill-roadmap/review` | `src/app/skill-roadmap/review/page.tsx` | Client | Mindmap review với pan/pinch zoom |
| `/skill-roadmap/notes/[taskId]` | `src/app/skill-roadmap/notes/[taskId]/page.tsx` | Client | Markdown preview + comment thread + previous/next |
| `/skill-roadmap/notes/[taskId]/comments/[commentId]` | `…/comments/[commentId]/page.tsx` | Client | Focused thread, sau khi xoá root sẽ redirect về note |
| `/skill-roadmap/tasks/[taskId]` | `…/tasks/[taskId]/page.tsx` | Client | Task detail, note editor, AI rewrite, child tasks |
| `/skill-roadmap/tasks/[taskId]/flashcards` | `…/flashcards/page.tsx` | Client | AI flashcards (nhiều deck, 3D flip card) |
| `/skill-roadmap/tasks/[taskId]/quiz` | `…/quiz/page.tsx` | Client | AI quiz multi-pack, attempt history, timer |
| `/markdown-files` | `src/app/markdown-files/page.tsx` | Client | Quản lý cây folder/file Markdown, editor + preview |
| `/markdown-files/read/[fileId]` | `…/read/[fileId]/page.tsx` | Client | Book reader CSS-column pagination |
| `/markdown-reader/[readerId]` | `src/app/markdown-reader/[readerId]/page.tsx` | Client | Reader cho preview content tuỳ ý (lưu sessionStorage) |
| `/ai-context` | `src/app/ai-context/page.tsx` | Client | Chat AI theo context Markdown files / roadmap tasks |
| `/ai-image-analysis` | `src/app/ai-image-analysis/page.tsx` | Client | Upload ảnh, phân tích vision, lưu lịch sử |

### API Routes

| Endpoint | Method | Mô tả |
|---|---|---|
| `/api/contact` | POST | Gửi email qua Resend, dùng env `RESEND_API_KEY`, `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO` |
| `/api/pdf` | GET | Trả về thông tin helper PDF |
| `/api/pdf/text` | GET | Xuất CV dạng text thuần |
| `/api/pdf/json` | GET | Xuất CV dạng JSON |
| `/api/ai/models` | GET | OpenAI-compatible `/models` discovery (env fallback cho Kilo AI) |
| `/api/ai/comment` | POST | Streaming OpenAI-compatible chat completion cho comment AI; nhận `studyContext` hoặc `studyContextItems`; dùng `AI_ENV_CONFIRM_PASSWORD` khi env key |
| `/api/ai/context-title` | POST | Sinh tiêu đề 1 dòng cho AI Context history |
| `/api/ai/flashcards` | POST | Sinh deck flashcard (JSON), kèm anti-dup 50%; dùng `AI_FLASHCARD_*` env |
| `/api/ai/quizzes` | POST | Sinh quiz pack + `durationMinutes`; anti-dup 50%; dùng `AI_QUIZZ_*` env |
| `/api/ai/task-note` | POST | `mode: "auto"` (opt-in `AI_TASK_NOTE_ENABLED=true`) hoặc `mode: "rewrite"` (cần `AI_ENV_CONFIRM_PASSWORD`); dùng `AI_TASK_NOTE_*` env |
| `/api/ai/image-analysis` | POST | Vision OpenAI-compatible; dùng `AI_IMAGE_ANALYSIS_MODEL`, fallback key qua `AI_COMMENT_KILO_*` |
| `/api/skill-roadmap/progress` | GET/POST | Đọc seed; ghi JSON đồng bộ (chỉ local-dev) |
| `/api/skill-roadmap/backup/github` | POST | Commit file backup lên GitHub, dùng `GITHUB_BACKUP_TOKEN` (server-side) |

---

## 4. Components chi tiết

### 4.1. UI primitives (`src/components/ui/`)

| File | Export | Mô tả |
|---|---|---|
| `Button.tsx` | `Button` | Default `type="button"` để an toàn trong form, nhiều variant |
| `Card.tsx` | `Card`, `CardHeader`, `CardContent`, `CardFooter` | Card chuẩn |
| `Container.tsx` | `Container` | Wrapper responsive với size `sm/md/lg/xl/full` |
| `Section.tsx` | `Section`, `SectionHeader` | Section + heading nhất quán (id, title, subtitle) |
| `Badge.tsx` | `Badge` | Badge cho skill, level, status… |
| `Progress.tsx` | `Progress` | Thanh tiến độ cho skill bars |
| `Timeline.tsx` | `Timeline`, `TimelineItem` | Timeline cho experience |
| `Modal.tsx` | `Modal` | `role="dialog"`, `aria-modal`, focus trap, return-focus |
| `PrintButton.tsx` | `PrintButton` | Mở `window.print()` với draft đã edit |

### 4.2. Layout (`src/components/layout/`)

| File | Export | Mô tả |
|---|---|---|
| `Header.tsx` | `Header` | Sticky header, logo + nav, mobile menu (drawer 2 cột), skip-link, theme toggle |
| `Footer.tsx` | `Footer` | Liên kết portfolio, workspace, social |
| `SideNav.tsx` | `SideNav` | Side nav desktop (anchor + ARIA current-state), ẩn theo `features.sideNav` |
| `Navigation.tsx` | `Navigation` | Reusable nav items |
| `index.ts` | Barrel | `Header`, `Footer`, `SideNav` |

### 4.3. Resume (`src/components/resume/`)

| File | Export | Loại | Mô tả |
|---|---|---|---|
| `ProfileHeader.tsx` | `ProfileHeader` | Server | Ảnh, tên, title, contact, highlights |
| `Summary.tsx` | `Summary` | Server | Tóm tắt nghề nghiệp |
| `ExperienceTimeline.tsx` | `ExperienceTimeline` | Server | Danh sách kinh nghiệm (animation theo `animatedTimeline`) |
| `ExperienceCard.tsx` | `ExperienceCard` | Server | Card công việc |
| `SkillsSection.tsx` | `SkillsSection` | Server | Nhóm kỹ năng theo category, có progress bar |
| `SkillBar.tsx` | `SkillBar` | Server | Thanh tiến độ |
| `EducationSection.tsx` | `EducationSection` | Server | Học vấn |
| `CertificationsSection.tsx` | `CertificationsSection` | Server | Chứng chỉ |
| `LanguagesSection.tsx` | `LanguagesSection` | Server | Ngôn ngữ |
| `PrintResumeEditor.tsx` | `PrintResumeEditor` | Client | Edit nội dung CV trước khi in, lưu localStorage |

### 4.4. Portfolio (`src/components/portfolio/`)

| File | Export | Mô tả |
|---|---|---|
| `ProjectGrid.tsx` | `ProjectGrid` | Lưới dự án, hỗ trợ `featuredOnly`, `limit`, `showFilters` |
| `ProjectCard.tsx` | `ProjectCard` | Card dự án |
| `ProjectFilters.tsx` | `ProjectFilters` | Lọc category |
| `ProjectDetail.tsx` | `ProjectDetail` | Chi tiết dự án |

### 4.5. Contact (`src/components/contact/`)

| File | Export | Mô tả |
|---|---|---|
| `ContactSection.tsx` | `ContactSection` | Section liên hệ |
| `ContactForm.tsx` | `ContactForm` | Form với react-hook-form + zod, gửi `POST /api/contact` |
| `SocialLinks.tsx` | `SocialLinks` | Link GitHub/LinkedIn/Twitter |

### 4.6. Markdown (`src/components/markdown/`)

Đã được tách module để mỗi file ≤ 300 dòng:

| File | Mô tả |
|---|---|
| `MarkdownPreview.tsx` | Composition root + auto theme detection + book reader entry |
| `markdown-types.ts` | Kiểu dữ liệu chung (token, block, inline…) |
| `markdown-parser.ts` | Parser Markdown (heading, list, code fence, table, callout, details, ref-link…) |
| `markdown-renderers.tsx` | Block/inline renderers + Mermaid hydration |
| `syntax-tokenizers.ts` | Tokenizer cho code highlight |
| `tokenizer-keywords.ts` | Keyword sets cho mỗi ngôn ngữ |
| `index.ts` | Barrel export (giữ tương thích `import ... from '@/components/markdown'`) |

Tính năng chính:
- Heading (H1–H6, anchor auto), paragraph, bold/italic/strike/inline code
- Link (inline, reference `[id]`/`[text][id]`), image
- List (ul, ol, task list), blockquote, GitHub-style callout
- Table responsive, horizontal rule
- Fenced code block: language label, auto-detect, line numbers, SQL/database emphasis
- Mermaid fenced block (`mermaid`/`mmd`) render client-side, fallback về code nếu lỗi
- `<details>`/`<summary>` disclosure
- Reference link definitions ở cuối file, render "Tài liệu tham khảo"
- Light/dark CSS variables theo theme thực tế của trang

### 4.7. Roadmap (`src/components/roadmap/`)

Các nhóm module con:

| Folder | File chính | Mô tả |
|---|---|---|
| `client/` | `SkillRoadmapClient.tsx` (root), `Metric.tsx`, `RoadmapFilterBar.tsx`, `RoadmapHeroCard.tsx`, `RoadmapTrackCard.tsx`, `TaskNode.tsx` | Giao diện bảng roadmap: hero metrics, filter (status/track/search), track card, task node có expand/collapse + child badge + completion signal theo descendant |
| `comments/` | `AiProviderSettings.tsx`, `CommentBubble.tsx`, `CommentForm.tsx`, `CommentSearchBar.tsx`, `CommentThread.tsx`, `MarkdownCommentThreads.tsx`, `MarkdownCommentThreadDetail.tsx`, `StudyCommentThread.tsx`, `ai-stream.ts`, `seed.ts`, `utils.ts` | Comment + AI composer cho note / flashcard / quiz / AI Context / image-analysis; dùng chung `skill-roadmap-study-comments:v1`; AI streaming qua `ai-stream.ts` |
| `flashcards/` | `FlashcardFace.tsx`, `FlashcardStudyPanel.tsx`, `SegmentedProgressBar.tsx`, `SkillRoadmapTaskFlashcards.tsx`, `helpers.ts` | UI flashcards với 3D flip, segmented progress, hard/good self-rating |
| `quiz/` | `QuizCreationCard.tsx`, `QuizHistoryPanel.tsx`, `QuizResultPanel.tsx`, `QuizSessionPanel.tsx`, `SkillRoadmapTaskQuiz.tsx`, `quiz-helpers.ts` | Quiz multi-pack: tạo pack, làm bài có timer tự nộp, review attempt cũ |
| `note-preview/` | `MarkdownFileScrollControls.tsx`, `NoteLessonNavigation.tsx`, `NotePreviewAppendix.tsx`, `SkillRoadmapNotePreview.tsx`, `useActiveHeading.ts`, `useNotePreviewData.ts` | Preview note: appendix (TOC + active heading), floating scroll controls, prev/next leaf task |
| `review-minimap/` | `MindmapCanvas.tsx`, `MinimapStats.tsx`, `SkillRoadmapReviewMinimap.tsx`, `TaskPreviewComments.tsx`, `TaskPreviewSlidePanel.tsx` | Mindmap review: pan/pinch/wheel zoom, fit zoom, task preview sheet |
| `shared/` | `TaskPageHeader.tsx` | Header dùng chung cho task detail/flashcards/quiz |
| `task-detail/` | `ChildTaskRow.tsx`, `SkillRoadmapTaskDetail.tsx`, `TaskDetailInfo.tsx` | UI task detail với note editor, AI rewrite, child task list, parent breadcrumb |

### 4.8. Workspace & AI workspaces

| Folder | File | Mô tả |
|---|---|---|
| `markdown-files/` | `MarkdownFilesClient.tsx`, `MarkdownBookReader.tsx` | Cây folder/file, edit + preview, book reader full-screen |
| `ai-context/` | `AiContextWorkspace.tsx` | 2 cột: source rail (Markdown file + leaf task) + conversation; lưu `skill-roadmap-study-comments:v1` với context `ai-review`; gọi `/api/ai/comment` với `studyContextItems` |
| `ai-image-analysis/` | `AiImageAnalysisWorkspace.tsx` | Upload ≤ 4 ảnh (PNG/JPG/WebP), focus category, prompt; gọi `/api/ai/image-analysis`; lưu history + comments vào `studyComments` với context `image-analysis` |
| `workspace/` | `WorkspaceBackupClient.tsx`, `WorkspaceBackupPanel.tsx` | Export/Import JSON, reset localStorage, GitHub commit backup |

---

## 5. Config & Data

### 5.1. `src/config/site.config.ts`

```ts
SiteConfig {
  meta: { titleTemplate, defaultDescription, keywords[], siteUrl, locale }
  theme: { primaryColor (HSL), darkModeEnabled, defaultColorMode, fontFamily }
  features: { portfolio, contactForm, pdfDownload, printButton, skillBars,
              animatedTimeline, certifications, languages, awards,
              smoothScroll, sideNav }
  navigation: { items: { label, href, icon, enabled }[] }
  socialPlatforms: { [key]: { name, icon, urlPattern, enabled } }
  sectionOrder: string[]
  contactForm: { endpoint, successMessage, errorMessage }
}
```

Helpers: `getPrimaryColor()`, `isFeatureEnabled(feature)`, `getEnabledNavItems()`, `getEnabledSocialPlatforms()`.

### 5.2. `src/config/navigation.config.ts`

- `NavigationItem`: `{ href, label, icon: LucideIcon, description? }`
- `WorkspaceFeature`: mở rộng với `title, eyebrow, cta, accent ('blue' | 'emerald' | 'violet' | 'cyan')`
- Mảng `portfolioNavItems`, `headerPortfolioNavItems`, `workspaceFeatures` (Roadmap / Markdown / AI Context / AI Image Analysis / Workspace Backup)
- `isWorkspacePath(pathname)` để SideNav biết khi nào đang ở workspace.

### 5.3. `src/data/profile.ts`

```ts
Profile {
  name, title, photo, email, phone?, location, website?, linkedin?, github?, twitter?,
  summary, highlights: string[]
}
```

Helpers: `getProfileSocialLinks()`, `hasProfilePhoto()`, `getProfileInitials()`.

### 5.4. `src/data/experience.ts`

```ts
Experience {
  id, title, company, companyLogo?, location, type ('full-time'|'part-time'|'contract'|'freelance'),
  startDate (YYYY-MM), endDate?, current, description, achievements[], technologies[]
}
```

Helpers: `getTotalYearsOfExperience()`, `getCurrentPosition()`, `getAllTechnologies()`, `formatExperienceDate()`, `getExperienceDuration()`.

### 5.5. `src/data/skills.ts`

```ts
Skill { name, level (0-100), category, icon?, yearsOfExperience? }
Language { name, level: 'Native'|'Fluent'|'Professional'|'Intermediate'|'Basic' }
skillCategories[]: Languages, Frontend, Backend, Architecture, Databases, DevOps, Security, Monitoring
skillCategoryLabels, languageLevelLabels (mapping VI)
```

Helpers: `getSkillsByCategory()`, `getTopSkills()`, `getUsedCategories()`, `getSkillsGroupedByCategory()`, `getAverageSkillLevel()`, `getSkillProficiencyLabel()`.

### 5.6. `src/data/education.ts`

```ts
Education { id, degree, field, school, schoolLogo?, location, startYear, endYear, gpa?, honors?, relevantCourses? }
Certification { id, name, issuer, issuerLogo?, date (YYYY-MM), expirationDate?, credentialId?, credentialUrl? }
Award { id, title, issuer, date, description? }
```

Helpers: `getLatestEducation()`, `getActiveCertifications()`, `getExpiredCertifications()`, `hasCertifications()`, `hasAwards()`, `formatEducation()`, `isCertificationExpiringSoon()`.

### 5.7. `src/data/projects.ts`

```ts
Project {
  id, slug, title, description, longDescription?, thumbnail, images[],
  technologies[], category, role, duration, liveUrl?, githubUrl?,
  featured, highlights[]
}
projectCategories[]: 'All' + 'Tài chính – Ngân hàng', 'Payment Gateway', 'Bảo hiểm', 'Nhật Bản'
```

Helpers: `getFeaturedProjects()`, `getProjectBySlug()`, `getProjectsByCategory()`, `getAllProjectTechnologies()`, `getProjectCountByCategory()`, `searchProjects()`, `getRelatedProjects()`.

### 5.8. `src/data/skill-roadmap.json` + `skill-roadmap-progress.json`

- `skill-roadmap.json`: 9 tracks × nhiều modules, **624 todo nodes** (parent → branch → leaf).
  - Schema: `Roadmap → tracks[RoadmapTrack] → modules[RoadmapModule] → tasks[RoadmapTask] → children?`
  - Mỗi `RoadmapTask` có `id`, `title`, `level`, `estimateHours`, `deliverable`, `children?`.
- `skill-roadmap-progress.json`: seed/local-dev. **Production dùng `localStorage`** (`skill-roadmap-progress:v1`) để tránh ghi file.

---

## 6. Types

| File | Mô tả |
|---|---|
| `src/types/roadmap.ts` | `Roadmap`, `RoadmapTrack`, `RoadmapModule`, `RoadmapTask`, `TaskContext`, `TaskIndex` |
| `src/types/progress.ts` | Kiểu cho `skill-roadmap-progress:v1` (progress nodes, note) |
| `src/types/comments.ts` | Note-level comment threads (`skill-roadmap-note-comments:v1`) |
| `src/types/study-comments.ts` | `StudyComment` với `StudyCommentContext` discriminator: `markdown-note`, `flashcard`, `quiz`, `ai-review`, `image-analysis` |
| `src/types/flashcards.ts` | `Flashcard`, `FlashcardDeck` (lưu `Record<taskId, FlashcardDeck[]>`) |
| `src/types/quizzes.ts` | `QuizQuestion`, `QuizPack`, `QuizAttempt` (lưu `durationMinutes`, attempt history) |
| `src/types/markdown-files.ts` | `MarkdownFolder`, `MarkdownFile`, tree shape |
| `src/types/backup.ts` | Versioned backup payload (hiện tại version 6) |
| `src/types/index.ts` | Barrel |

---

## 7. Lib & Hooks

### 7.1. `src/lib/`

| File | Mô tả |
|---|---|
| `utils.ts` | `cn()` = clsx + tailwind-merge |
| `date.ts` | `formatMonthYear()` cho `YYYY-MM` → `MM-YYYY` |
| `pdf.ts` | Helpers dùng cho `/api/pdf/*` (text/JSON) |
| `api/index.ts` | Barrel cho provider/parser/similarity |
| `api/providers.ts` | Chuẩn hoá OpenAI-compatible Base URL, build headers, request options |
| `api/parsers.ts` | Parse response streaming / JSON |
| `api/similarity.ts` | So khớp nội dung để anti-dup flashcards/quizzes (ngưỡng 50%) |
| `roadmap/index.ts` | Barrel các helper roadmap |
| `roadmap/backup.ts` | Tạo backup payload version 6 (`progress`, `comments`, `flashcards`, `quizzes`, `studyComments`, `markdownFiles`) + normalize cho các version cũ |
| `roadmap/constants.ts` | localStorage keys, env defaults |
| `roadmap/filters.ts` | Lọc task theo status/track/search |
| `roadmap/flatten-tasks.ts` | Duyệt cây, lấy leaf tasks (cho prev/next navigation) |
| `roadmap/format.ts` | Format level/date/title |
| `roadmap/hydration.ts` | Hydrate localStorage từ seed JSON |
| `roadmap/navigation.ts` | Tính prev/next leaf task |
| `roadmap/normalize-quizzes.ts` | Đảm bảo shape `skill-roadmap-quizzes:v1` |
| `roadmap/normalize.ts` | Normalize progress/comments |
| `roadmap/prompts.ts` | Prompt template cho AI learning prompts (theory + why/how + trade-offs) |
| `roadmap/seed-helpers.ts` | Helpers đọc seed JSON |
| `roadmap/storage.ts` | Read/write localStorage an toàn (SSR-safe) |

### 7.2. `src/hooks/`

| File | Mô tả |
|---|---|
| `useLocalStorage.ts` | Generic hook `useLocalStorage<T>(key, initial)` với hydration guard |
| `useProgress.ts` | Đọc/ghi progress, auto-complete parent khi đủ descendant |
| `useFlashcardDecks.ts` | CRUD flashcard decks + deck-level duplicate detection flag |
| `useQuizDecks.ts` | CRUD quiz packs + attempt history |
| `useNoteComments.ts` | CRUD comment threads `skill-roadmap-note-comments:v1` |
| `useDataDecks.ts` | Generic hook factory (refactor spec) |
| `useAutoTaskNote.ts` | Auto-generate note với cooldown `skill-roadmap-auto-task-note:v1` |
| `useGithubBackup.ts` | Form state + POST `/api/skill-roadmap/backup/github` |
| `useRoadmapFilters.ts` | Filter state cho trang roadmap |
| `index.ts` | Barrel |

---

## 8. Quy ước & Patterns chính

### 8.1. Data-driven content
Mọi nội dung CV/portfolio nằm trong `src/data/*.ts` để AI chỉ cần sửa data, không phải đụng component.

### 8.2. Centralized configuration
`src/config/site.config.ts` quản lý theme (HSL), features toggle, navigation, social platforms, contact form, section order.

### 8.3. Feature toggle
Ẩn/hiện từng section thông qua `siteConfig.features.{portfolio, contactForm, certifications, languages, sideNav, ...}`.

### 8.4. Section independence
Mỗi section là một component tự chứa, dùng wrapper `Section` + `Container` chuẩn:
```tsx
<Section id="experience" title="Kinh nghiệm">
  <Container>
    <SectionHeader title="Kinh nghiệm" subtitle="..." />
    {/* nội dung */}
  </Container>
</Section>
```

### 8.5. HSL color system
`primaryColor` dạng `"hue saturation% lightness%"` (vd `"220 92% 50%"`) để dễ derive variant.

### 8.6. Reusable Markdown preview
- `MarkdownPreview` được dùng xuyên suốt note preview, comment thread, quiz, image analysis result, book reader.
- Tự detect theme thực tế từ background của container (không bị lẫn khi nền gradient).
- Light/dark CSS variables riêng trong `globals.css` để đảm bảo contrast.
- Book reader dùng CSS-column pagination để không mất nội dung code/table/Mermaid, có flip animation kiểu sách cũ.

### 8.7. Client vs Server Components
- Mặc định **Server Components**; chỉ thêm `"use client"` khi dùng `useState`/`useEffect`/event handlers.
- Các trang workspace tools (`/skill-roadmap/*`, `/markdown-files/*`, `/ai-*`, `/workspace/*`, `/print`) là client components.

### 8.8. localStorage keys (versioned)

| Key | Nội dung |
|---|---|
| `skill-roadmap-progress:v1` | Progress + note roadmap |
| `skill-roadmap-note-comments:v1` | Comment threads cho note preview |
| `skill-roadmap-study-comments:v1` | Flashcard / quiz / ai-review / image-analysis threads |
| `skill-roadmap-flashcards:v1` | Flashcard decks |
| `skill-roadmap-quizzes:v1` | Quiz packs + attempt history |
| `skill-roadmap-duplicate-detection:v1` | Bật/tắt anti-dup |
| `skill-roadmap-auto-task-note:v1` | Cooldown auto task note |
| `skill-roadmap-print-draft:v1` | Draft CV trên `/print` |
| `markdown-files:v1` | Folder + file Markdown |
| `markdown-reader:v1` | Generic reader content (sessionStorage-ish) |

### 8.9. API conventions
- Dùng `NextResponse.json({ error, ... }, { status })` khi lỗi.
- OpenAI-compatible AI routes đều trả về streaming `text/event-stream` (qua `ai-stream.ts`) hoặc JSON tuỳ nghiệp vụ.
- `/api/skill-roadmap/progress` chỉ cho ghi JSON ở local-dev (production trả unsupported-runtime).

### 8.10. Backup payload (version 6)
```ts
{
  version: 6,
  exportedAt: string,
  progress: SkillRoadmapProgress,
  comments: NoteCommentThreads,
  flashcards: Record<taskId, FlashcardDeck[]>,
  quizzes: Record<taskId, QuizPack[]>,
  studyComments: StudyComment[],
  markdownFiles: { folders, files }
}
```
Import tương thích ngược với các version cũ (chỉ progress, progress + comments, v3 + flashcards, v4 + quizzes, v5 + studyComments…).

### 8.11. Environment variables

Xem `.env.example`:

- **Resend contact form**: `RESEND_API_KEY`, `CONTACT_EMAIL_FROM`, `CONTACT_EMAIL_TO`
- **GitHub backup**: `GITHUB_BACKUP_TOKEN` (server-side), `GITHUB_BACKUP_REPO_URL`, `GITHUB_BACKUP_BRANCH`, `GITHUB_BACKUP_PATH`, `GITHUB_BACKUP_COMMIT_MESSAGE`
- **AI flashcards**: `AI_FLASHCARD_BASE_URL`, `AI_FLASHCARD_MODEL`
- **AI quiz**: `AI_QUIZZ_BASE_URL`, `AI_QUIZZ_MODEL`
- **AI Kilo comment / image-analysis / context-title**: `AI_COMMENT_KILO_BASE_URL`, `AI_COMMENT_KILO_MODEL`, `AI_CONTEXT_TITLE_MODEL`, `AI_IMAGE_ANALYSIS_MODEL`
- **AI task-note (auto)**: `AI_TASK_NOTE_ENABLED=false`, `AI_TASK_NOTE_BASE_URL`, `AI_TASK_NOTE_MODEL`
- **Bảo vệ key env**: `AI_ENV_CONFIRM_PASSWORD` (bắt buộc cho mọi route dùng key server-side)

---

## 9. Hướng dẫn tuỳ biến nhanh

### Đổi thông tin cá nhân
Sửa `src/data/profile.ts`:
- `profile.name`, `profile.title`, `profile.email`, `profile.phone`, `profile.location`
- `profile.summary`, `profile.highlights[]`

### Đổi kinh nghiệm
Sửa `src/data/experience.ts` (mảng `experience`), giữ thứ tự mới nhất trước.

### Đổi kỹ năng
Sửa `src/data/skills.ts` (`skills[]`, `skillCategories[]`, `skillCategoryLabels`, `languages[]`).

### Đổi học vấn / chứng chỉ / giải thưởng
Sửa `src/data/education.ts`.

### Đổi dự án portfolio
Sửa `src/data/projects.ts`. Project nào muốn nổi bật trên trang chủ → `featured: true`.

### Đổi theme / ẩn hiện tính năng
Sửa `src/config/site.config.ts`:
- `theme.primaryColor` (HSL: `220 92% 50%`, `280 70% 50%`, `150 70% 45%`, …)
- `features.{portfolio, contactForm, skillBars, sideNav, ...}`

### Đổi navigation / workspace items
Sửa `src/config/navigation.config.ts` (`portfolioNavItems`, `workspaceFeatures`).

### Đổi dữ liệu roadmap
Sửa `src/data/skill-roadmap.json` (schema `Roadmap` trong `src/types/roadmap.ts`).

---

## 10. Notes khi phát triển

- **Package manager**: dùng `bun`. KHÔNG dùng npm/yarn.
- **Không chạy `next dev`** – sandbox tự lo.
- **Trước khi commit**: `bun typecheck && bun lint && git add -A && git commit -m "..." && git push`.
- **Memory bank**: sau khi thay đổi quan trọng, cập nhật `.kilocode/rules/memory-bank/context.md` (xem AGENTS.md).
- **Tránh ghi file trên Vercel**: mọi mutable state của user phải dùng `localStorage` (đã được enforce qua `src/lib/roadmap/storage.ts`).
- **Tiếng Việt cho UI, giữ keyword kỹ thuật tiếng Anh**: backend, full-stack, gateway, microservices, JWT, Kafka, ECDH Encryption, Signature Service, Napas, VietQR, Core Banking, ESB, JdbcTemplate, Stored Procedures, …
- **Print/PDF**: dùng Times New Roman, name 24px, section title 16px, body 13px; ngày hiển thị dạng `MM-YYYY`, vị trí hiện tại là `Nay`/`Hiện tại`.
- **Accessibility đã chuẩn**: skip link, `main` focusable, `aria-current`, focus trap cho modal, `Button` mặc định `type="button"`, có `prefers-reduced-motion`.

---

## 11. Bản đồ nhanh các "Workspace tools"

| Workspace | Mục đích | Lưu trữ |
|---|---|---|
| `/skill-roadmap` | Bảng roadmap 624 task + note + AI prompt | `skill-roadmap-progress:v1` |
| `/skill-roadmap/review` | Mindmap review (pan/pinch) | đọc từ progress |
| `/skill-roadmap/tasks/[taskId]` | Task detail + child tasks + AI rewrite | progress |
| `/skill-roadmap/tasks/[taskId]/flashcards` | AI flashcards nhiều deck | `skill-roadmap-flashcards:v1` |
| `/skill-roadmap/tasks/[taskId]/quiz` | AI quiz nhiều pack + attempt | `skill-roadmap-quizzes:v1` |
| `/skill-roadmap/notes/[taskId]` | Markdown preview + comment thread | progress + `skill-roadmap-note-comments:v1` |
| `/markdown-files` | Kho folder/file Markdown | `markdown-files:v1` |
| `/ai-context` | Hỏi AI theo nguồn Markdown + roadmap | `skill-roadmap-study-comments:v1` (context `ai-review`) |
| `/ai-image-analysis` | Phân tích ảnh vision, lưu history | `skill-roadmap-study-comments:v1` (context `image-analysis`) |
| `/workspace/backup` | Export/Import/Reset + GitHub commit backup | tất cả các key trên |

Tất cả các tool trên đều có thể được export/import qua `/workspace/backup` với cùng một payload version 6.

---

*Tài liệu được tạo tự động từ source code. Nếu có thay đổi lớn, hãy cập nhật lại file này và `.kilocode/rules/memory-bank/context.md`.*
