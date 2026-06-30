# System Patterns: Live Resume Template

## Architecture Overview

```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root layout + SEO metadata
│   ├── page.tsx            # Main resume page (composes sections)
│   ├── globals.css         # Tailwind imports + global + print styles
│   ├── portfolio/
│   │   ├── page.tsx        # Portfolio grid page
│   │   └── [slug]/page.tsx # Project detail page
│   ├── skill-roadmap/page.tsx # JSON-backed curriculum with browser-persisted progress
│   ├── skill-roadmap/notes/[taskId]/page.tsx # Per-task Markdown note preview
│   ├── skill-roadmap/tasks/[taskId]/flashcards/page.tsx # Dedicated AI flashcard screen for a roadmap task
│   ├── skill-roadmap/tasks/[taskId]/quiz/page.tsx # Dedicated AI quiz screen for a roadmap task
│   ├── ai-context/page.tsx # Independent AI context workspace for Markdown files and roadmap tasks
│   ├── ai-image-analysis/page.tsx # Independent AI vision workspace for uploaded images
│   ├── print/page.tsx      # Print-optimized view
│   └── api/
│       ├── contact/route.ts   # Contact form handler
│       ├── ai/models/route.ts # OpenAI-compatible model discovery for comment AI
│       ├── ai/comment/route.ts # OpenAI-compatible comment AI proxy
│       ├── ai/image-analysis/route.ts # OpenAI-compatible multimodal image analysis proxy
│       ├── ai/quizzes/route.ts # OpenAI-compatible roadmap task quiz generator
│       ├── skill-roadmap/progress/route.ts # Roadmap progress seed + local-dev JSON sync
│       ├── skill-roadmap/backup/github/route.ts # Optional browser progress GitHub backup
│       └── pdf/
│           ├── route.ts       # PDF info endpoint
│           ├── text/route.ts  # Plain text export
│           └── json/route.ts  # JSON export
├── components/
│   ├── layout/             # Page structure components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── Footer.tsx      # Site footer
│   │   ├── Navigation.tsx  # Nav links
│   │   └── SideNav.tsx     # Side navigation (desktop)
│   ├── resume/             # Resume section components
│   │   ├── ProfileHeader.tsx  # Name, photo, contact
│   │   ├── Summary.tsx        # Professional summary
│   │   ├── ExperienceTimeline.tsx
│   │   ├── SkillsSection.tsx
│   │   ├── EducationSection.tsx
│   │   ├── CertificationsSection.tsx
│   │   └── LanguagesSection.tsx
│   ├── portfolio/          # Portfolio components
│   │   ├── ProjectGrid.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectFilters.tsx
│   │   └── ProjectDetail.tsx
│   ├── roadmap/            # Hierarchical study roadmap checklist components
│   │   ├── SkillRoadmapClient.tsx
│   │   ├── SkillRoadmapTaskFlashcards.tsx
│   │   ├── SkillRoadmapTaskQuiz.tsx
│   │   └── SkillRoadmapNotePreview.tsx
│   ├── markdown/           # Reusable Markdown rendering components
│   │   └── MarkdownPreview.tsx
│   ├── ai-image-analysis/  # Upload + prompt UI for multimodal image analysis
│   │   └── AiImageAnalysisWorkspace.tsx
│   ├── contact/            # Contact components
│   │   ├── ContactForm.tsx
│   │   ├── ContactSection.tsx
│   │   └── SocialLinks.tsx
│   └── ui/                 # Reusable UI components
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Container.tsx
│       ├── Section.tsx
│       ├── Progress.tsx
│       ├── Timeline.tsx
│       └── PrintButton.tsx
├── config/
│   └── site.config.ts      # ALL site configuration
├── data/                   # ALL user content
│   ├── profile.ts          # Personal info, contact, summary
│   ├── experience.ts       # Work history
│   ├── skills.ts           # Skills, categories, languages
│   ├── education.ts        # Education, certifications, awards
│   ├── projects.ts         # Portfolio projects
│   ├── skill-roadmap.json  # Hierarchical study roadmap curriculum
│   └── skill-roadmap-progress.json # Seed/local-dev roadmap progress by node id
└── lib/
    ├── utils.ts            # Utility functions
    └── pdf.ts              # PDF generation helpers
```

## Key Design Patterns

### 1. Data-Driven Architecture Pattern

**All user content is in `src/data/` files**

This is the primary customization point for AI:
```typescript
// src/data/profile.ts
export const profile = { name, title, email, location, summary }

// src/data/experience.ts
export const experience = [{ title, company, dates, achievements }]

// src/data/skills.ts
export const skills = [{ name, level, category }]
```

**Why**: AI can modify all resume content by editing data files.

### 2. Centralized Configuration Pattern

All site settings in `src/config/site.config.ts`:
```typescript
export const siteConfig = {
  meta: { titleTemplate, description, keywords },
  theme: { primaryColor, darkModeEnabled },
  features: { portfolio, contactForm, skillBars, ... },
  navigation: { items: [...] },
  socialPlatforms: { github, linkedin, ... },
}
```

**Why**: Single place to change global settings, theme, and features.

### 3. Feature Toggle Pattern

Sections can be enabled/disabled via config:
```typescript
features: {
  portfolio: true,
  certifications: true,
  languages: true,
  skillBars: true,
  sideNav: true,
}
```

**Why**: Users can customize which sections appear without touching components.

### 4. Section Independence Pattern

Each section component:
- Imports its own data from data files
- Is fully self-contained
- Uses consistent Container/Section wrappers
- Has consistent vertical padding

```tsx
// Example section pattern
export function ExperienceTimeline() {
  return (
    <Section id="experience">
      <Container>
        <SectionHeader title="Experience" />
        {/* Section content */}
      </Container>
    </Section>
  );
}
```

**Why**: Sections can be added, removed, or reordered easily.

### 5. HSL Color System Pattern

Theme colors use HSL for easy customization:
```typescript
theme: {
  primaryColor: '220 92% 50%',  // Format: "hue saturation% lightness%"
}
```

**Why**: Easy to generate color variations, accessible, AI-friendly.

### 6. Reusable Markdown Preview Pattern

Roadmap task notes use a shared Markdown renderer in `src/components/markdown/MarkdownPreview.tsx`.
The renderer covers common note formats without adding runtime dependencies:
- headings, paragraphs, inline bold/italic/strike/code, links, and images
- ordered, unordered, and task checklist lists
- blockquotes and GitHub-style callouts
- responsive Markdown tables
- fenced code blocks with language labels, language auto-detection, line numbers, syntax token coloring, and SQL/database-oriented labels

Global `.markdown-preview` styles in `src/app/globals.css` keep Markdown content readable in both light and dark themes.

## Component Communication

```
page.tsx
    ├── Header (reads navigation from config)
    ├── ProfileHeader (reads profile from data)
    ├── Summary (reads profile.summary)
    ├── ExperienceTimeline (reads experience)
    ├── SkillsSection (reads skills)
    ├── EducationSection (reads education)
    ├── CertificationsSection (reads certifications)
    ├── ContactSection (reads profile contact info)
    └── Footer (reads config)
```

## Styling Conventions

### Colors (Blue Default Theme)
- Primary: HSL `220 92% 50%` (configurable)
- Background: `gray-50` light, `gray-900` dark
- Text: `gray-900` (headings), `gray-600` (body)

### Spacing
- Section padding: `py-16` or `py-24` (consistent)
- Container padding: `px-4 sm:px-6 lg:px-8`
- Component gaps: `gap-4`, `gap-6`, `gap-8`

### Typography
- Hero headline: `text-4xl md:text-5xl font-bold`
- Section titles: `text-2xl md:text-3xl font-bold`
- Body text: `text-base` or `text-lg`
- Font: Inter (via Next.js font optimization)

## State Management

- Framer Motion for animations
- React Hook Form for contact form
- Local `useState` for filters, toggles
- No global state needed (data is static)
- Skill roadmap learning artifacts use browser `localStorage`: progress, note comments, flashcard decks, quiz packs, and study comments. Flashcards and quizzes are stored as multiple decks/packs per task with backup/import compatibility for older single-deck flashcard data. Standalone Markdown document storage is a separate `/markdown-files` feature using `markdown-files:v1`; it stores folder/file nodes with `parentId` hierarchy and is still included in the versioned backup payload so export/import can preserve all local learning data. The independent `/ai-context` workspace reuses `skill-roadmap-study-comments:v1` with an `ai-review` context type. `/ai-image-analysis` uses the same storage with an `image-analysis` context type for saved analysis results, AI-generated titles, and result comments/follow-up AI replies, so both features are backed up through the existing `studyComments` payload.

## File Naming Conventions

- Components: PascalCase (`ProfileHeader.tsx`, `Button.tsx`)
- Data files: camelCase (`profile.ts`, `experience.ts`)
- Utilities: camelCase (`utils.ts`, `pdf.ts`)
- Directories: kebab-case or lowercase (`components/resume/`)

## ID Conventions

- Experience: `exp-1`, `exp-2`, ...
- Projects: `proj-1`, `proj-2`, ...
- Education: `edu-1`, `edu-2`, ...
- Certifications: `cert-1`, `cert-2`, ...
- Awards: `award-1`, `award-2`, ...
