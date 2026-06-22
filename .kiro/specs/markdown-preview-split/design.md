# Design Document

## Overview

Split the 1,241-line `MarkdownPreview.tsx` into 5 focused modules within `src/components/markdown/`. The decomposition follows logical boundaries: shared types, markdown parsing, syntax tokenization, block/inline rendering, and a slim composition root. A barrel export provides a clean public API.

## Architecture

### File Structure (Post-Split)

```
src/components/markdown/
├── index.ts                  # Barrel export (re-exports public API)
├── MarkdownPreview.tsx       # Composition root (~90 lines) — 'use client', theme detection, component assembly
├── markdown-types.ts         # Shared internal types (~55 lines) — MarkdownBlock, SyntaxToken, ListItem, etc.
├── markdown-parser.ts        # Parser logic (~200 lines) — parseMarkdown + all parsing helpers
├── syntax-tokenizers.ts      # Tokenizer logic (~290 lines) — all tokenize* functions + keyword sets
└── markdown-renderers.tsx    # Block & inline renderers (~280 lines) — renderBlock, CodeBlock, renderInlineMarkdown, etc.
```

### Module Responsibilities

#### `markdown-types.ts` (~55 lines)
- `MarkdownBlock` discriminated union type
- `ListItem` type
- `CalloutType` type
- `SyntaxTokenType` type
- `SyntaxToken` type
- Constants: `headingLevels`, `emptyMessage`, language set constants (`sqlLanguages`, `shellLanguages`, `jsonLanguages`, `yamlLanguages`, `xmlLanguages`)

#### `markdown-parser.ts` (~200 lines)
- `parseMarkdown(content: string): MarkdownBlock[]`
- Helper functions: `isTableStart`, `parseTable`, `splitTableRow`, `isListLine`, `parseList`, `shouldContinueParagraph`, `parseCallout`
- Imports types from `./markdown-types`

#### `syntax-tokenizers.ts` (~290 lines)
- `tokenizeCodeLine(line: string, language: string): SyntaxToken[]`
- `detectCodeLanguage(code: string): string`
- Language-specific tokenizers: `tokenizeGenericLine`, `tokenizeSqlLine`, `tokenizeJsonLine`, `tokenizeYamlLine`, `tokenizeXmlLikeLine`, `tokenizeShellLine`
- Helper functions: `readMatch`, `readGenericWord`, `readSqlWord`, `readShellWord`
- Keyword/type/boolean constant Sets: `genericKeywords`, `genericTypes`, `genericBooleans`, `sqlKeywords`, `sqlTypes`, `sqlFunctions`, `sqlBooleans`, `sqlEntityPrefixes`
- Imports types from `./markdown-types`

> **Note:** If this file exceeds 300 lines, the keyword constant Sets will be extracted to a separate `tokenizer-keywords.ts` file.

#### `markdown-renderers.tsx` (~280 lines)
- `renderBlock(block: MarkdownBlock, index: number, headingId?: string): ReactNode`
- `renderHeading(level, text, key, id?): ReactNode`
- `CodeBlock({ language, code }): JSX.Element`
- `renderCodeLine(line: string, language: string): ReactNode`
- `renderInlineMarkdown(text: string): ReactNode[]`
- `getLanguageLabel(language: string): string`
- `sanitizeUrl(url: string): string`
- `slugifyHeading(text: string): string`
- `stripInlineMarkdown(text: string): string`
- Imports types from `./markdown-types`
- Imports `tokenizeCodeLine` from `./syntax-tokenizers`

#### `MarkdownPreview.tsx` (~90 lines) — Composition Root
- `'use client'` directive
- `MarkdownPreview` component (useState, useEffect for theme detection)
- `extractMarkdownHeadings` function
- `resolveRenderedTheme` and `getRgbLuminance` helper functions
- `buildHeadingIdsByBlockIndex` helper
- Re-exports `MarkdownHeading` type (preserves existing public API)
- Imports from `./markdown-parser`, `./markdown-renderers`, `./markdown-types`

#### `index.ts` — Barrel Export
```typescript
export { MarkdownPreview, extractMarkdownHeadings } from './MarkdownPreview';
export type { MarkdownHeading } from './MarkdownPreview';
```

### Dependency Graph (No Cycles)

```
index.ts
  └── MarkdownPreview.tsx
        ├── markdown-types.ts
        ├── markdown-parser.ts
        │     └── markdown-types.ts
        └── markdown-renderers.tsx
              ├── markdown-types.ts
              └── syntax-tokenizers.ts
                    └── markdown-types.ts
```

### Key Design Decisions

1. **Types in a separate file**: Avoids circular dependencies. All modules import from `markdown-types.ts` which has zero imports of its own.

2. **Renderers import tokenizers (not vice versa)**: One-way dependency. Tokenizers are pure functions with no React dependency.

3. **Composition root keeps theme logic**: The `useEffect`/`useState` for theme detection stays in `MarkdownPreview.tsx` because it's the only place that needs React hooks and the `'use client'` directive.

4. **Original file path preserved**: `MarkdownPreview.tsx` still exists at the same path, so all existing `import { MarkdownPreview } from '@/components/markdown/MarkdownPreview'` statements continue to resolve.

5. **No runtime behavior change**: Functions are moved verbatim. No logic is added, removed, or modified.

6. **Keyword sets placement**: The large keyword/type constant Sets stay in `syntax-tokenizers.ts` unless line count exceeds 300, in which case they move to `tokenizer-keywords.ts`.

## Data Flow

```
content (string)
  → parseMarkdown() [markdown-parser.ts]
  → MarkdownBlock[] 
  → renderBlock() [markdown-renderers.tsx]
     → for code blocks: tokenizeCodeLine() [syntax-tokenizers.ts]
  → React elements (JSX)
```

## Error Handling

No changes. The existing fallback behavior (empty message for blank content, `sanitizeUrl` returning `#` for unsafe URLs) is preserved verbatim.
