'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

type MarkdownBlock =
  | { type: 'heading'; level: 1 | 2 | 3 | 4 | 5 | 6; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'quote'; lines: string[]; callout?: CalloutType }
  | { type: 'code'; language: string; code: string }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'list'; ordered: boolean; items: ListItem[] }
  | { type: 'image'; alt: string; src: string }
  | { type: 'hr' };

type ListItem = {
  text: string;
  depth: number;
  checked?: boolean;
};

type CalloutType = 'note' | 'tip' | 'warning' | 'danger' | 'info';
type SyntaxTokenType =
  | 'plain'
  | 'keyword'
  | 'function'
  | 'variable'
  | 'string'
  | 'number'
  | 'comment'
  | 'operator'
  | 'type'
  | 'property'
  | 'entity'
  | 'boolean'
  | 'class-name'
  | 'decorator'
  | 'regex'
  | 'tag'
  | 'attribute';

type SyntaxToken = {
  text: string;
  type: SyntaxTokenType;
};

export type MarkdownHeading = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

const emptyMessage = '_Chưa có note._';
const headingLevels = [1, 2, 3, 4, 5, 6] as const;
const sqlLanguages = new Set(['sql', 'mysql', 'pgsql', 'postgresql', 'oracle', 'plsql', 'ddl']);
const shellLanguages = new Set(['bash', 'sh', 'shell', 'zsh']);
const jsonLanguages = new Set(['json', 'jsonc']);
const yamlLanguages = new Set(['yaml', 'yml']);
const xmlLanguages = new Set(['html', 'xml', 'tsx', 'jsx']);

export function MarkdownPreview({ content }: { content: string }) {
  const blocks = parseMarkdown(content.trim() ? content : emptyMessage);
  const headingIdsByBlockIndex = buildHeadingIdsByBlockIndex(blocks);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const updateTheme = () => setTheme(resolveRenderedTheme());
    const darkQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const observer = new MutationObserver(updateTheme);

    updateTheme();
    darkQuery.addEventListener('change', updateTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ['class', 'data-theme', 'style'],
    });

    return () => {
      darkQuery.removeEventListener('change', updateTheme);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="markdown-preview" data-theme={theme}>
      {blocks.map((block, index) => renderBlock(block, index, headingIdsByBlockIndex.get(index)))}
    </div>
  );
}

export function extractMarkdownHeadings(content: string): MarkdownHeading[] {
  const blocks = parseMarkdown(content.trim() ? content : emptyMessage);
  const headingIdsByBlockIndex = buildHeadingIdsByBlockIndex(blocks);

  return blocks.flatMap((block, index) => {
    if (block.type !== 'heading') {
      return [];
    }

    const id = headingIdsByBlockIndex.get(index);

    return id ? [{ id, level: block.level, text: stripInlineMarkdown(block.text) }] : [];
  });
}

function resolveRenderedTheme(): 'light' | 'dark' {
  const root = document.documentElement;
  const body = document.body;

  if (
    root.classList.contains('dark') ||
    body.classList.contains('dark') ||
    root.dataset.theme === 'dark' ||
    body.dataset.theme === 'dark'
  ) {
    return 'dark';
  }

  if (
    root.classList.contains('light') ||
    body.classList.contains('light') ||
    root.dataset.theme === 'light' ||
    body.dataset.theme === 'light'
  ) {
    return 'light';
  }

  const background = getComputedStyle(body).backgroundColor || getComputedStyle(root).backgroundColor;
  const luminance = getRgbLuminance(background);

  if (luminance !== null) {
    return luminance < 128 ? 'dark' : 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getRgbLuminance(color: string) {
  const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);

  if (!match) {
    return null;
  }

  const red = Number(match[1]);
  const green = Number(match[2]);
  const blue = Number(match[3]);

  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

function buildHeadingIdsByBlockIndex(blocks: MarkdownBlock[]) {
  const idCounts = new Map<string, number>();
  const idsByBlockIndex = new Map<number, string>();

  blocks.forEach((block, index) => {
    if (block.type !== 'heading') {
      return;
    }

    const baseId = slugifyHeading(block.text) || `heading-${index + 1}`;
    const count = idCounts.get(baseId) ?? 0;
    idCounts.set(baseId, count + 1);
    idsByBlockIndex.set(index, count === 0 ? baseId : `${baseId}-${count + 1}`);
  });

  return idsByBlockIndex;
}

function slugifyHeading(text: string) {
  return stripInlineMarkdown(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function stripInlineMarkdown(text: string) {
  return text
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*_~]/g, '')
    .trim();
}

function parseMarkdown(content: string): MarkdownBlock[] {
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const fence = trimmed.match(/^```([\w#+.-]*)\s*$/);

    if (fence) {
      const language = fence[1] ?? '';
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        type: 'code',
        language,
        code: codeLines.join('\n'),
      });
      continue;
    }

    if (isTableStart(lines, index)) {
      const { block, nextIndex } = parseTable(lines, index);
      blocks.push(block);
      index = nextIndex;
      continue;
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/);

    if (heading) {
      const level = headingLevels[heading[1].length - 1] ?? 6;

      blocks.push({
        type: 'heading',
        level,
        text: heading[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
      blocks.push({ type: 'hr' });
      index += 1;
      continue;
    }

    if (trimmed.startsWith('>')) {
      const quoteLines: string[] = [];

      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }

      const callout = parseCallout(quoteLines);
      blocks.push({ type: 'quote', lines: callout.lines, callout: callout.type });
      continue;
    }

    if (isListLine(line)) {
      const { block, nextIndex } = parseList(lines, index);
      blocks.push(block);
      index = nextIndex;
      continue;
    }

    const image = trimmed.match(/^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)$/);

    if (image) {
      blocks.push({
        type: 'image',
        alt: image[1],
        src: sanitizeUrl(image[2]),
      });
      index += 1;
      continue;
    }

    const paragraphLines = [trimmed];
    index += 1;

    while (index < lines.length && shouldContinueParagraph(lines, index)) {
      paragraphLines.push(lines[index].trim());
      index += 1;
    }

    blocks.push({
      type: 'paragraph',
      text: paragraphLines.join(' '),
    });
  }

  return blocks;
}

function renderBlock(block: MarkdownBlock, index: number, headingId?: string) {
  switch (block.type) {
    case 'heading':
      return renderHeading(block.level, block.text, index, headingId);

    case 'paragraph':
      return <p key={index}>{renderInlineMarkdown(block.text)}</p>;

    case 'quote':
      return (
        <blockquote
          key={index}
          className={block.callout ? 'markdown-callout' : undefined}
          data-callout={block.callout}
        >
          {block.lines.map((line, lineIndex) => (
            <p key={lineIndex}>{renderInlineMarkdown(line)}</p>
          ))}
        </blockquote>
      );

    case 'code':
      return <CodeBlock key={index} language={block.language} code={block.code} />;

    case 'table':
      return (
        <div key={index} className="markdown-table-wrap">
          <table>
            <thead>
              <tr>
                {block.headers.map((header, cellIndex) => (
                  <th key={cellIndex}>{renderInlineMarkdown(header)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {block.headers.map((_, cellIndex) => (
                    <td key={cellIndex}>
                      {renderInlineMarkdown(row[cellIndex] ?? '')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'list': {
      const ListTag = block.ordered ? 'ol' : 'ul';

      return (
        <ListTag key={index} className={block.ordered ? 'markdown-ordered-list' : undefined}>
          {block.items.map((item, itemIndex) => (
            <li
              key={itemIndex}
              className={item.checked === undefined ? undefined : 'markdown-task-list-item'}
              style={{ marginLeft: `${item.depth * 1.25}rem` }}
            >
              {item.checked !== undefined && (
                <input type="checkbox" checked={item.checked} readOnly aria-label="Task item" />
              )}
              <span>{renderInlineMarkdown(item.text)}</span>
            </li>
          ))}
        </ListTag>
      );
    }

    case 'image':
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={index}
          src={block.src}
          alt={block.alt}
          loading="lazy"
          className="markdown-image"
        />
      );

    case 'hr':
      return <hr key={index} />;

    default:
      return null;
  }
}

function renderHeading(level: 1 | 2 | 3 | 4 | 5 | 6, text: string, key: number, id?: string) {
  const children = renderInlineMarkdown(text);

  switch (level) {
    case 1:
      return <h1 key={key} id={id}>{children}</h1>;
    case 2:
      return <h2 key={key} id={id}>{children}</h2>;
    case 3:
      return <h3 key={key} id={id}>{children}</h3>;
    case 4:
      return <h4 key={key} id={id}>{children}</h4>;
    case 5:
      return <h5 key={key} id={id}>{children}</h5>;
    case 6:
      return <h6 key={key} id={id}>{children}</h6>;
    default:
      return <h3 key={key} id={id}>{children}</h3>;
  }
}

function CodeBlock({ language, code }: { language: string; code: string }) {
  const normalizedLanguage = language.trim().toLowerCase();
  const effectiveLanguage = normalizedLanguage || detectCodeLanguage(code);
  const label = getLanguageLabel(effectiveLanguage);
  const lines = code.split('\n');

  return (
    <figure className="markdown-code" data-language={effectiveLanguage || 'text'}>
      <figcaption>
        <span>{label}</span>
        <span>{lines.length} dòng</span>
      </figcaption>
      <pre>
        <code>
          {lines.map((line, index) => (
            <span key={index} className="markdown-code-line">
              {line ? renderCodeLine(line, effectiveLanguage) : ' '}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

function renderCodeLine(line: string, language: string) {
  return tokenizeCodeLine(line, language).map((token, index) => {
    if (token.type === 'plain') {
      return token.text;
    }

    return (
      <span key={index} className={`markdown-token markdown-token-${token.type}`}>
        {token.text}
      </span>
    );
  });
}

function tokenizeCodeLine(line: string, language: string): SyntaxToken[] {
  if (sqlLanguages.has(language)) {
    return tokenizeSqlLine(line);
  }

  if (xmlLanguages.has(language) && /<\/?[A-Za-z][\w:-]*/.test(line)) {
    return tokenizeXmlLikeLine(line);
  }

  if (jsonLanguages.has(language)) {
    return tokenizeJsonLine(line);
  }

  if (yamlLanguages.has(language)) {
    return tokenizeYamlLine(line);
  }

  if (shellLanguages.has(language)) {
    return tokenizeShellLine(line);
  }

  return tokenizeGenericLine(line, language);
}

function detectCodeLanguage(code: string) {
  const sample = code.trim();
  const lower = sample.toLowerCase();

  if (!sample) {
    return 'text';
  }

  if (/^[\s\n]*[{[]/.test(sample) && /["'][\w.-]+["']\s*:/.test(sample)) {
    return 'json';
  }

  if (
    /\b(select|insert|update|delete|create|alter|drop|with|merge)\b/i.test(sample) &&
    /\b(from|into|table|join|where|values|set|procedure|index|view)\b/i.test(sample)
  ) {
    return 'sql';
  }

  if (/^\s*(package|import|public|private|protected|class|interface|enum|record)\b/m.test(sample)) {
    return 'java';
  }

  if (/\b(const|let|var|interface|type|export|import|async|await)\b/.test(sample)) {
    return 'ts';
  }

  if (/^\s*[-\w.]+\s*:\s+/m.test(sample) && !/[;{}]/.test(sample)) {
    return 'yaml';
  }

  if (/^\s*(npm|pnpm|yarn|bun|git|docker|kubectl|curl|ssh|cd|mkdir|rm|cp|mv)\b/m.test(lower)) {
    return 'bash';
  }

  if (/^\s*<\/?[A-Za-z][\w:-]*/m.test(sample)) {
    return 'html';
  }

  return 'text';
}

const genericKeywords = new Set([
  'abstract',
  'as',
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'do',
  'else',
  'enum',
  'export',
  'extends',
  'final',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'throws',
  'try',
  'type',
  'typeof',
  'using',
  'var',
  'void',
  'while',
  'yield',
]);

const genericTypes = new Set([
  'boolean',
  'byte',
  'char',
  'double',
  'float',
  'int',
  'long',
  'map',
  'number',
  'promise',
  'record',
  'set',
  'short',
  'string',
  'unknown',
  'void',
]);

const genericBooleans = new Set(['false', 'null', 'true', 'undefined']);

const sqlKeywords = new Set([
  'add',
  'alter',
  'and',
  'as',
  'asc',
  'begin',
  'between',
  'by',
  'case',
  'check',
  'commit',
  'constraint',
  'create',
  'cross',
  'database',
  'default',
  'delete',
  'desc',
  'distinct',
  'drop',
  'else',
  'end',
  'exists',
  'foreign',
  'from',
  'full',
  'group',
  'having',
  'if',
  'in',
  'index',
  'inner',
  'insert',
  'into',
  'is',
  'join',
  'key',
  'left',
  'like',
  'limit',
  'not',
  'null',
  'on',
  'or',
  'order',
  'outer',
  'primary',
  'procedure',
  'references',
  'right',
  'rollback',
  'select',
  'set',
  'table',
  'then',
  'transaction',
  'trigger',
  'truncate',
  'union',
  'unique',
  'update',
  'values',
  'view',
  'when',
  'where',
]);

const sqlTypes = new Set([
  'bigint',
  'blob',
  'boolean',
  'char',
  'clob',
  'date',
  'datetime',
  'decimal',
  'double',
  'float',
  'int',
  'integer',
  'json',
  'long',
  'number',
  'numeric',
  'nvarchar',
  'raw',
  'serial',
  'smallint',
  'text',
  'time',
  'timestamp',
  'uuid',
  'varchar',
  'varchar2',
]);

const sqlFunctions = new Set([
  'avg',
  'cast',
  'coalesce',
  'concat',
  'count',
  'decode',
  'lower',
  'max',
  'min',
  'nvl',
  'round',
  'row_number',
  'substr',
  'substring',
  'sum',
  'to_char',
  'to_date',
  'to_number',
  'trim',
  'upper',
]);

const sqlBooleans = new Set(['false', 'null', 'true']);

const sqlEntityPrefixes = new Set([
  'database',
  'from',
  'index',
  'into',
  'join',
  'on',
  'references',
  'schema',
  'sequence',
  'table',
  'trigger',
  'update',
  'view',
]);

function tokenizeGenericLine(line: string, language: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let cursor = 0;

  while (cursor < line.length) {
    const rest = line.slice(cursor);
    const next =
      readMatch(rest, /^\s+/) ??
      readMatch(rest, /^\/\/.*/, 'comment') ??
      readMatch(rest, /^\/\*.*?(?:\*\/|$)/, 'comment') ??
      readMatch(rest, /^("(?:\\.|[^"])*"?|'(?:\\.|[^'])*'?|`(?:\\.|[^`])*`?)/, 'string') ??
      readMatch(rest, /^\/(?![/*])(?:\\.|[^/\\\n])+\/[dgimsuy]*/, 'regex') ??
      readMatch(rest, /^-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, 'number') ??
      readMatch(rest, /^@[A-Za-z_][\w$]*/, 'decorator') ??
      readGenericWord(rest, line, cursor, language) ??
      readMatch(rest, /^[{}()[\];,.<>?:+\-*/%=!&|^~]+/, 'operator');

    if (next) {
      tokens.push(next);
      cursor += next.text.length;
    } else {
      tokens.push({ text: rest[0], type: 'plain' });
      cursor += 1;
    }
  }

  return tokens;
}

function readGenericWord(
  rest: string,
  line: string,
  cursor: number,
  language: string
): SyntaxToken | null {
  const word = rest.match(/^[$A-Za-z_][\w$]*/)?.[0];

  if (!word) {
    return null;
  }

  const normalized = word.toLowerCase();
  const previousChar = line[cursor - 1] ?? '';
  const nextChar = line.slice(cursor + word.length).trimStart()[0] ?? '';
  const previousWord = line.slice(0, cursor).match(/([A-Za-z_$][\w$]*)\W*$/)?.[1]?.toLowerCase();

  if (genericBooleans.has(normalized)) {
    return { text: word, type: 'boolean' };
  }

  if (genericKeywords.has(normalized)) {
    return { text: word, type: 'keyword' };
  }

  if (
    previousWord &&
    ['class', 'enum', 'extends', 'implements', 'interface', 'new', 'record', 'type'].includes(previousWord)
  ) {
    return { text: word, type: 'class-name' };
  }

  if (genericTypes.has(normalized)) {
    return { text: word, type: 'type' };
  }

  if (/^[A-Z][\w$]*$/.test(word)) {
    return { text: word, type: 'class-name' };
  }

  if (nextChar === '(') {
    return { text: word, type: 'function' };
  }

  if (previousChar === '.') {
    return { text: word, type: 'property' };
  }

  if (word.startsWith('$')) {
    return { text: word, type: 'variable' };
  }

  return { text: word, type: 'plain' };
}

function tokenizeSqlLine(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let cursor = 0;
  let previousWord = '';

  while (cursor < line.length) {
    const rest = line.slice(cursor);
    const matched =
      readMatch(rest, /^\s+/) ??
      readMatch(rest, /^--.*/, 'comment') ??
      readMatch(rest, /^#.*/, 'comment') ??
      readMatch(rest, /^\/\*.*?(?:\*\/|$)/, 'comment') ??
      readMatch(rest, /^('(?:''|\\.|[^'])*'?|"(?:\\"|[^"])*"?|`(?:``|[^`])*`?)/, 'string') ??
      readMatch(rest, /^[@:$][A-Za-z_][\w$]*/, 'variable') ??
      readMatch(rest, /^-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, 'number') ??
      readSqlWord(rest, line, cursor, previousWord) ??
      readMatch(rest, /^[()[\],.;:+\-*/%=<>!|]+/, 'operator');

    if (matched) {
      tokens.push(matched);

      if (/^[A-Za-z_][\w$]*$/.test(matched.text)) {
        previousWord = matched.text.toLowerCase();
      } else if (matched.type !== 'plain' || matched.text.trim()) {
        previousWord = '';
      }

      cursor += matched.text.length;
    } else {
      tokens.push({ text: rest[0], type: 'plain' });
      cursor += 1;
    }
  }

  return tokens;
}

function readSqlWord(
  rest: string,
  line: string,
  cursor: number,
  previousWord: string
): SyntaxToken | null {
  const word = rest.match(/^[A-Za-z_][\w$]*/)?.[0];

  if (!word) {
    return null;
  }

  const normalized = word.toLowerCase();
  const nextChar = line.slice(cursor + word.length).trimStart()[0] ?? '';
  const previousChar = line[cursor - 1] ?? '';

  if (sqlBooleans.has(normalized)) {
    return { text: word, type: 'boolean' };
  }

  if (sqlKeywords.has(normalized)) {
    return { text: word, type: 'keyword' };
  }

  if (sqlTypes.has(normalized)) {
    return { text: word, type: 'type' };
  }

  if (sqlFunctions.has(normalized) || nextChar === '(') {
    return { text: word, type: 'function' };
  }

  if (sqlEntityPrefixes.has(previousWord) || previousChar === '.') {
    return { text: word, type: 'entity' };
  }

  return { text: word, type: 'property' };
}

function tokenizeJsonLine(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let cursor = 0;

  while (cursor < line.length) {
    const rest = line.slice(cursor);
    const stringMatch = rest.match(/^"(?:\\.|[^"])*"?/);

    if (stringMatch) {
      const afterString = rest.slice(stringMatch[0].length).trimStart();
      tokens.push({
        text: stringMatch[0],
        type: afterString.startsWith(':') ? 'property' : 'string',
      });
      cursor += stringMatch[0].length;
      continue;
    }

    const matched =
      readMatch(rest, /^\s+/) ??
      readMatch(rest, /^-?\b\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b/, 'number') ??
      readMatch(rest, /^(true|false|null)\b/, 'boolean') ??
      readMatch(rest, /^[{}[\],:]+/, 'operator');

    if (matched) {
      tokens.push(matched);
      cursor += matched.text.length;
    } else {
      tokens.push({ text: rest[0], type: 'plain' });
      cursor += 1;
    }
  }

  return tokens;
}

function tokenizeYamlLine(line: string): SyntaxToken[] {
  const commentStart = line.indexOf('#');
  const content = commentStart >= 0 ? line.slice(0, commentStart) : line;
  const comment = commentStart >= 0 ? line.slice(commentStart) : '';
  const tokens: SyntaxToken[] = [];
  const keyMatch = content.match(/^(\s*-?\s*)([A-Za-z_][\w.-]*)(\s*:)/);

  if (keyMatch) {
    tokens.push({ text: keyMatch[1], type: 'plain' });
    tokens.push({ text: keyMatch[2], type: 'property' });
    tokens.push({ text: keyMatch[3], type: 'operator' });
    tokens.push(...tokenizeGenericLine(content.slice(keyMatch[0].length), 'yaml'));
  } else {
    tokens.push(...tokenizeGenericLine(content, 'yaml'));
  }

  if (comment) {
    tokens.push({ text: comment, type: 'comment' });
  }

  return tokens;
}

function tokenizeXmlLikeLine(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let cursor = 0;

  while (cursor < line.length) {
    const rest = line.slice(cursor);
    const matched =
      readMatch(rest, /^\s+/) ??
      readMatch(rest, /^<!--.*?(?:-->|$)/, 'comment') ??
      readMatch(rest, /^<\/?[A-Za-z][\w:-]*/, 'tag') ??
      readMatch(rest, /^[A-Za-z_:][\w:.-]*(?=\s*=)/, 'attribute') ??
      readMatch(rest, /^("(?:\\.|[^"])*"?|'(?:\\.|[^'])*'?)/, 'string') ??
      readMatch(rest, /^[<>{}/=]+/, 'operator') ??
      readGenericWord(rest, line, cursor, 'tsx');

    if (matched) {
      tokens.push(matched);
      cursor += matched.text.length;
    } else {
      tokens.push({ text: rest[0], type: 'plain' });
      cursor += 1;
    }
  }

  return tokens;
}

function tokenizeShellLine(line: string): SyntaxToken[] {
  const tokens: SyntaxToken[] = [];
  let cursor = 0;
  let expectsCommand = true;

  while (cursor < line.length) {
    const rest = line.slice(cursor);
    const matched: SyntaxToken | null =
      readMatch(rest, /^\s+/) ??
      readMatch(rest, /^#.*/, 'comment') ??
      readMatch(rest, /^("(?:\\.|[^"])*"?|'(?:\\.|[^'])*'?)/, 'string') ??
      readMatch(rest, /^\$[{(]?[A-Za-z_][\w]*[})]?/, 'variable') ??
      readMatch(rest, /^-{1,2}[A-Za-z][\w-]*/, 'variable') ??
      readShellWord(rest, expectsCommand) ??
      readMatch(rest, /^[|&;()<>]+/, 'operator');

    if (matched) {
      tokens.push(matched);

      if (matched.text.trim()) {
        expectsCommand = matched.type === 'operator';
      }

      cursor += matched.text.length;
    } else {
      tokens.push({ text: rest[0], type: 'plain' });
      expectsCommand = false;
      cursor += 1;
    }
  }

  return tokens;
}

function readShellWord(rest: string, expectsCommand: boolean): SyntaxToken | null {
  const word = rest.match(/^[A-Za-z_./][\w./-]*/)?.[0];

  if (!word) {
    return null;
  }

  if (['case', 'do', 'done', 'elif', 'else', 'esac', 'fi', 'for', 'function', 'if', 'in', 'then', 'while'].includes(word)) {
    return { text: word, type: 'keyword' };
  }

  return { text: word, type: expectsCommand ? 'function' : 'plain' };
}

function readMatch(rest: string, pattern: RegExp, type: SyntaxTokenType = 'plain') {
  const text = rest.match(pattern)?.[0];
  return text ? { text, type } : null;
}

function renderInlineMarkdown(text: string) {
  const pattern =
    /(!\[([^\]]*)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|\[([^\]]+)\]\(([^)\s]+)(?:\s+"[^"]*")?\)|`([^`]+)`|\*\*([^*]+)\*\*|__([^_]+)__|~~([^~]+)~~|\*([^*]+)\*|_([^_]+)_)/g;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > cursor) {
      nodes.push(text.slice(cursor, match.index));
    }

    if (match[2] !== undefined && match[3] !== undefined) {
      nodes.push(
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={nodes.length}
          src={sanitizeUrl(match[3])}
          alt={match[2]}
          loading="lazy"
          className="markdown-inline-image"
        />
      );
    } else if (match[4] !== undefined && match[5] !== undefined) {
      const href = sanitizeUrl(match[5]);
      const isPageAnchor = href.startsWith('#');

      nodes.push(
        <a
          key={nodes.length}
          href={href}
          target={isPageAnchor ? undefined : '_blank'}
          rel={isPageAnchor ? undefined : 'noreferrer'}
        >
          {renderInlineMarkdown(match[4])}
        </a>
      );
    } else if (match[6] !== undefined) {
      nodes.push(<code key={nodes.length}>{match[6]}</code>);
    } else if (match[7] !== undefined || match[8] !== undefined) {
      nodes.push(<strong key={nodes.length}>{renderInlineMarkdown(match[7] ?? match[8])}</strong>);
    } else if (match[9] !== undefined) {
      nodes.push(<del key={nodes.length}>{renderInlineMarkdown(match[9])}</del>);
    } else if (match[10] !== undefined || match[11] !== undefined) {
      nodes.push(<em key={nodes.length}>{renderInlineMarkdown(match[10] ?? match[11])}</em>);
    }

    cursor = pattern.lastIndex;
  }

  if (cursor < text.length) {
    nodes.push(text.slice(cursor));
  }

  return nodes;
}

function isTableStart(lines: string[], index: number) {
  return Boolean(
    lines[index]?.includes('|') &&
      lines[index + 1]?.includes('|') &&
      splitTableRow(lines[index + 1]).every((cell) => /^:?-{3,}:?$/.test(cell.trim()))
  );
}

function parseTable(lines: string[], startIndex: number) {
  const headers = splitTableRow(lines[startIndex]);
  const rows: string[][] = [];
  let index = startIndex + 2;

  while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
    rows.push(splitTableRow(lines[index]));
    index += 1;
  }

  return {
    block: { type: 'table', headers, rows } satisfies MarkdownBlock,
    nextIndex: index,
  };
}

function splitTableRow(line: string) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isListLine(line: string) {
  return /^(\s*)([-*+])\s+/.test(line) || /^(\s*)\d+[.)]\s+/.test(line);
}

function parseList(lines: string[], startIndex: number) {
  const ordered = /^(\s*)\d+[.)]\s+/.test(lines[startIndex]);
  const items: ListItem[] = [];
  let index = startIndex;

  while (index < lines.length && isListLine(lines[index])) {
    const line = lines[index];
    const match = ordered
      ? line.match(/^(\s*)\d+[.)]\s+(.+)$/)
      : line.match(/^(\s*)[-*+]\s+(.+)$/);

    if (!match) {
      break;
    }

    const indent = match[1].replace(/\t/g, '  ').length;
    let text = match[2].trim();
    let checked: boolean | undefined;
    const task = text.match(/^\[([ xX])\]\s+(.+)$/);

    if (task) {
      checked = task[1].toLowerCase() === 'x';
      text = task[2];
    }

    items.push({
      text,
      checked,
      depth: Math.floor(indent / 2),
    });
    index += 1;
  }

  return {
    block: { type: 'list', ordered, items } satisfies MarkdownBlock,
    nextIndex: index,
  };
}

function shouldContinueParagraph(lines: string[], index: number) {
  const line = lines[index];
  const trimmed = line.trim();

  return Boolean(
    trimmed &&
      !trimmed.startsWith('```') &&
      !trimmed.startsWith('>') &&
      !isTableStart(lines, index) &&
      !isListLine(line) &&
      !/^(#{1,6})\s+/.test(trimmed) &&
      !/^ {0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)
  );
}

function parseCallout(lines: string[]) {
  const firstLine = lines[0]?.trim().match(/^\[!(NOTE|TIP|WARNING|DANGER|INFO)\]\s*(.*)$/i);

  if (!firstLine) {
    return { type: undefined, lines } as { type?: CalloutType; lines: string[] };
  }

  const type = firstLine[1].toLowerCase() as CalloutType;
  const title = firstLine[2]?.trim();
  const nextLines = title ? [title, ...lines.slice(1)] : lines.slice(1);

  return { type, lines: nextLines.length ? nextLines : [type.toUpperCase()] };
}

function getLanguageLabel(language: string) {
  const labels: Record<string, string> = {
    bash: 'Shell',
    sh: 'Shell',
    zsh: 'Shell',
    ts: 'TypeScript',
    tsx: 'TSX',
    js: 'JavaScript',
    jsx: 'JSX',
    java: 'Java',
    kotlin: 'Kotlin',
    sql: 'SQL / Database',
    mysql: 'MySQL',
    pgsql: 'PostgreSQL',
    postgresql: 'PostgreSQL',
    oracle: 'Oracle SQL',
    plsql: 'PL/SQL',
    ddl: 'Database DDL',
    dbml: 'Database Model',
    json: 'JSON',
    yaml: 'YAML',
    yml: 'YAML',
    xml: 'XML',
    dockerfile: 'Dockerfile',
    mermaid: 'Mermaid',
  };

  return labels[language] ?? (language ? language.toUpperCase() : 'Plain text');
}

function sanitizeUrl(url: string) {
  const trimmed = url.trim();

  if (
    trimmed.startsWith('/') ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('mailto:') ||
    trimmed.startsWith('data:image/')
  ) {
    return trimmed;
  }

  return '#';
}
