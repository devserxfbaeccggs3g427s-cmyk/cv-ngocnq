# Tasks

## Task 1: Create shared types module

- [x] 1.1 Create `src/components/markdown/markdown-types.ts` containing all shared type definitions extracted from `MarkdownPreview.tsx`: `MarkdownBlock`, `ListItem`, `CalloutType`, `SyntaxTokenType`, `SyntaxToken`, and the constants `emptyMessage`, `headingLevels`, `sqlLanguages`, `shellLanguages`, `jsonLanguages`, `yamlLanguages`, `xmlLanguages`
- [x] 1.2 Verify the file is ≤ 300 lines

## Task 2: Create markdown parser module

- [x] 2.1 Create `src/components/markdown/markdown-parser.ts` containing the `parseMarkdown` function and all its helpers: `isTableStart`, `parseTable`, `splitTableRow`, `isListLine`, `parseList`, `shouldContinueParagraph`, `parseCallout`. Import types from `./markdown-types`.
- [x] 2.2 Verify the file is ≤ 300 lines

## Task 3: Create syntax tokenizers module

- [x] 3.1 Create `src/components/markdown/syntax-tokenizers.ts` containing `tokenizeCodeLine`, `detectCodeLanguage`, all language-specific tokenizer functions (`tokenizeGenericLine`, `tokenizeSqlLine`, `tokenizeJsonLine`, `tokenizeYamlLine`, `tokenizeXmlLikeLine`, `tokenizeShellLine`), helper functions (`readMatch`, `readGenericWord`, `readSqlWord`, `readShellWord`), and all keyword/type/boolean constant Sets
- [x] 3.2 If the file exceeds 300 lines, extract keyword constant Sets (`genericKeywords`, `genericTypes`, `genericBooleans`, `sqlKeywords`, `sqlTypes`, `sqlFunctions`, `sqlBooleans`, `sqlEntityPrefixes`) into a separate `src/components/markdown/tokenizer-keywords.ts` file and import them back
- [x] 3.3 Verify all tokenizer files are ≤ 300 lines each

## Task 4: Create block and inline renderers module

- [x] 4.1 Create `src/components/markdown/markdown-renderers.tsx` containing `renderBlock`, `renderHeading`, `CodeBlock`, `renderCodeLine`, `renderInlineMarkdown`, `getLanguageLabel`, `sanitizeUrl`, `slugifyHeading`, `stripInlineMarkdown`. Import types from `./markdown-types` and `tokenizeCodeLine` from `./syntax-tokenizers`.
- [x] 4.2 Verify the file is ≤ 300 lines

## Task 5: Refactor composition root

- [x] 5.1 Rewrite `src/components/markdown/MarkdownPreview.tsx` as a slim composition root (~90 lines): keep `'use client'`, `MarkdownPreview` component, `extractMarkdownHeadings`, `resolveRenderedTheme`, `getRgbLuminance`, `buildHeadingIdsByBlockIndex`. Import `parseMarkdown` from `./markdown-parser`, `renderBlock` from `./markdown-renderers`, types from `./markdown-types`. Continue exporting `MarkdownPreview`, `extractMarkdownHeadings`, and `MarkdownHeading` type.
- [x] 5.2 Verify the file is ≤ 300 lines
- [x] 5.3 Verify all existing consumer imports still resolve: `SkillRoadmapNotePreview.tsx`, `QuizSessionPanel.tsx`, `CommentBubble.tsx`, `useActiveHeading.ts`, `NotePreviewAppendix.tsx`

## Task 6: Create barrel export

- [x] 6.1 Create `src/components/markdown/index.ts` that re-exports `MarkdownPreview`, `extractMarkdownHeadings`, and the `MarkdownHeading` type from `./MarkdownPreview`

## Task 7: Build verification

- [x] 7.1 Run `npx tsc --noEmit` and confirm zero type errors
- [x] 7.2 Run `npm run build` and confirm exit code 0 with no compilation errors
- [x] 7.3 Verify no file in `src/components/markdown/` exceeds 300 lines (run `wc -l` on all files)
