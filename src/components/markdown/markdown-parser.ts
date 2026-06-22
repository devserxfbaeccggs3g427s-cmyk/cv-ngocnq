import type { CalloutType, ListItem, MarkdownBlock } from './markdown-types';
import { headingLevels } from './markdown-types';

export function parseMarkdown(content: string): MarkdownBlock[] {
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
        src: image[2],
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
