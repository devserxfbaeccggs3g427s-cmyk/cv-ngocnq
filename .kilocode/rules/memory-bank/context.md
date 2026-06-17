# Active Context: Live Resume Template

## Current State

**Template Status**: ✅ Complete and production-ready

The template is fully implemented with all core sections working. It's ready for AI-assisted customization.

## Recently Completed

- [x] Added a Markdown heading appendix to `/skill-roadmap/notes/[taskId]` under the task info sidebar, with generated in-page anchor links to each rendered heading
- [x] Optimized the Markdown note appendix for long notes by making the appendix list independently scrollable, keeping the desktop sidebar viewport-bound, and compacting task metadata on mobile/tablet
- [x] Reworked the Markdown note appendix on mobile into a floating action button plus bottom sheet so readers can open the appendix from anywhere in the note without scrolling back to the top
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
- Each roadmap node includes a concise generated AI learning prompt with two-line preview, show/hide control, and copy-to-clipboard action; prompts emphasize theory, internal mechanisms, why/how explanations, trade-offs, and deep interview questions
- Roadmap task rows use subtle depth-based background colors and left borders; completed rows keep a stronger green completion signal
- Roadmap parent task rows now show an amber in-progress state as soon as at least one descendant task is completed; once all descendants are completed, the corresponding parent chain is auto-marked completed and persisted
- Roadmap nodes with child tasks can be expanded/collapsed individually; the filter toolbar also has "Mở tất cả" and "Thu gọn tất cả" controls
- The roadmap now breaks broad topics into important interview-level fundamentals; examples include detailed OOP/SOLID/immutable/equals-hashCode/defensive-copying/entity-value-DTO subtrees
- Skill roadmap source data is stored in `src/data/skill-roadmap.json`; user completion state and notes are persisted in browser `localStorage` under `skill-roadmap-progress:v1`, with `src/data/skill-roadmap-progress.json` kept as seed/local-dev JSON sync only
- `/skill-roadmap` includes backup tools for roadmap progress: browser JSON export/import plus optional GitHub commit backup using the current browser progress payload. GitHub tokens are submitted per request and not persisted by the app.
- GitHub backup form defaults can be configured with `GITHUB_BACKUP_REPO_URL`, `GITHUB_BACKUP_BRANCH`, `GITHUB_BACKUP_PATH`, `GITHUB_BACKUP_COMMIT_MESSAGE`, and `GITHUB_BACKUP_TOKEN`; the token is consumed server-side and never returned by the config API.
- GitHub backup now checks repository and branch access before writing the backup file, accepts common repo URL forms (`https://github.com/owner/repo`, copied GitHub URLs, SSH URL, and `owner/repo`), and returns actionable/contextual Vietnamese errors for common GitHub API failures.
- `/skill-roadmap/notes/[taskId]` previews the selected task note as Markdown in a new tab by reading the same browser progress storage, with sticky task metadata and completion status on desktop
- Markdown note preview now uses reusable `src/components/markdown/MarkdownPreview.tsx` and supports richer professional Markdown formatting for headings, body text, tables, syntax-highlighted source code with auto-detected languages, SQL/database snippets, checklists, links, images, callouts, generated heading anchors, a desktop sidebar appendix/table of contents with independent scrolling, a mobile floating appendix bottom sheet, and dedicated light/dark readability palettes that follow the actual rendered page theme
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
