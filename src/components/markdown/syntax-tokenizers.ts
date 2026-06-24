import type { SyntaxToken, SyntaxTokenType } from './markdown-types';
import {
  jsonLanguages,
  mermaidLanguages,
  shellLanguages,
  sqlLanguages,
  xmlLanguages,
  yamlLanguages,
} from './markdown-types';
import { genericBooleans, genericKeywords, genericTypes, sqlBooleans, sqlEntityPrefixes, sqlFunctions, sqlKeywords, sqlTypes } from './tokenizer-keywords';
export function tokenizeCodeLine(line: string, language: string): SyntaxToken[] {
  if (mermaidLanguages.has(language)) {
    return tokenizeGenericLine(line, language);
  }
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
export function detectCodeLanguage(code: string) {
  const sample = code.trim();
  const lower = sample.toLowerCase();
  if (!sample) {
    return 'text';
  }
  if (isMermaidDiagram(sample)) {
    return 'mermaid';
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
function isMermaidDiagram(sample: string) {
  return /^\s*(graph|flowchart)\s+(?:TB|TD|BT|RL|LR)\b/im.test(sample) ||
    /^\s*(sequenceDiagram|classDiagram|stateDiagram(?:-v2)?|erDiagram|journey|gantt|pie|mindmap|timeline|gitGraph)\b/im.test(sample);
}
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
