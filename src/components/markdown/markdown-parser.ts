import type { CalloutType, ListItem, MarkdownBlock, MarkdownReferenceDefinitions } from './markdown-types';
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

    if (isReferenceDefinitionLine(line)) {
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

    if (isDetailsStart(line)) {
      const { block, nextIndex } = parseDetails(lines, index);
      blocks.push(block);
      index = nextIndex;
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

export function parseMarkdownReferenceDefinitions(content: string): MarkdownReferenceDefinitions {
  const definitions: MarkdownReferenceDefinitions = {};
  const lines = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');

  for (const line of lines) {
    for (const definition of parseReferenceDefinitionsLine(line)) {
      definitions[definition.id] = {
        href: definition.href,
        label: definition.label,
        ...(definition.title ? { title: definition.title } : {}),
      };
    }
  }

  return definitions;
}

function isReferenceDefinitionLine(line: string) {
  const trimmed = line.trim();

  if (!trimmed.startsWith('[')) {
    return false;
  }

  referenceDefinitionPattern.lastIndex = 0;
  const remaining = trimmed.replace(referenceDefinitionPattern, '').trim();
  referenceDefinitionPattern.lastIndex = 0;

  return Boolean(trimmed && !remaining);
}

const referenceDefinitionPattern =
  /\[([^\]]+)\]:\s*(<[^>]+>|\S+)(?:\s+(?:"([^"]*)"|'([^']*)'|\(([^)]*)\)))?/g;

function parseReferenceDefinitionsLine(line: string) {
  const definitions: Array<{ id: string; label: string; href: string; title?: string }> = [];
  let match: RegExpExecArray | null;

  referenceDefinitionPattern.lastIndex = 0;

  while ((match = referenceDefinitionPattern.exec(line)) !== null) {
    definitions.push({
      id: normalizeReferenceId(match[1]),
      label: match[1].trim(),
      href: match[2].replace(/^<|>$/g, ''),
      title: match[3] ?? match[4] ?? match[5],
    });
  }

  return definitions;
}

function normalizeReferenceId(id: string) {
  return id.trim().replace(/\s+/g, ' ').toLowerCase();
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

function isDetailsStart(line: string) {
  return /^<details\b[^>]*>/i.test(line.trim());
}

function parseDetails(lines: string[], startIndex: number) {
  const line = lines[startIndex].trim();
  const opening = line.match(/^<details\b([^>]*)>(.*)$/i);
  const attributes = opening?.[1] ?? '';
  let remainder = opening?.[2] ?? '';
  let index = startIndex + 1;
  let summary = 'Chi tiet';
  const contentLines: string[] = [];
  const summaryResult = consumeSummary(lines, index, remainder);

  if (summaryResult) {
    summary = htmlToText(summaryResult.summary) || summary;
    remainder = summaryResult.remainder;
    index = summaryResult.nextIndex;
  }

  const depth = { value: 0 };
  let closed = false;

  if (remainder.trim()) {
    closed = appendDetailsContentLine(contentLines, remainder, depth);
  }

  while (!closed && index < lines.length) {
    closed = appendDetailsContentLine(contentLines, lines[index], depth);
    index += 1;
  }

  return {
    block: {
      type: 'details',
      summary,
      open: /\sopen(?:\s|=|$)/i.test(attributes),
      blocks: parseMarkdown(contentLines.join('\n').trim()),
    } satisfies MarkdownBlock,
    nextIndex: index,
  };
}

function consumeSummary(lines: string[], nextLineIndex: number, initialText: string) {
  let lineIndex = nextLineIndex;
  let text = initialText;
  let opening = text.match(/<summary\b[^>]*>/i);

  if (!opening) {
    while (lineIndex < lines.length && !lines[lineIndex].trim()) {
      lineIndex += 1;
    }

    text = lines[lineIndex] ?? '';
    opening = text.match(/<summary\b[^>]*>/i);

    if (!opening) {
      return null;
    }
  }

  const summaryStartIndex = opening.index ?? 0;
  let summaryText = text.slice(summaryStartIndex + opening[0].length);
  const sameLineClose = summaryText.match(/<\/summary>/i);

  if (sameLineClose?.index !== undefined) {
    return {
      summary: summaryText.slice(0, sameLineClose.index),
      remainder: summaryText.slice(sameLineClose.index + sameLineClose[0].length),
      nextIndex: text === initialText ? nextLineIndex : lineIndex + 1,
    };
  }

  const summaryLines = [summaryText];
  lineIndex += text === initialText ? 0 : 1;

  while (lineIndex < lines.length) {
    const currentLine = lines[lineIndex];
    const close = currentLine.match(/<\/summary>/i);

    if (close?.index !== undefined) {
      summaryLines.push(currentLine.slice(0, close.index));

      return {
        summary: summaryLines.join('\n'),
        remainder: currentLine.slice(close.index + close[0].length),
        nextIndex: lineIndex + 1,
      };
    }

    summaryLines.push(currentLine);
    lineIndex += 1;
  }

  return {
    summary: summaryLines.join('\n'),
    remainder: '',
    nextIndex: lineIndex,
  };
}

function appendDetailsContentLine(lines: string[], line: string, depth: { value: number }) {
  const outerCloseIndex = findOuterDetailsCloseIndex(line, depth);

  if (outerCloseIndex === -1) {
    lines.push(line);
    return false;
  }

  const beforeClose = line.slice(0, outerCloseIndex).trimEnd();

  if (beforeClose) {
    lines.push(beforeClose);
  }

  return true;
}

function findOuterDetailsCloseIndex(line: string, depth: { value: number }) {
  const tagPattern = /<\/?details\b[^>]*>/gi;
  let match: RegExpExecArray | null;

  while ((match = tagPattern.exec(line)) !== null) {
    const isClosingTag = /^<\//.test(match[0]);

    if (!isClosingTag) {
      depth.value += 1;
      continue;
    }

    if (depth.value === 0) {
      return match.index;
    }

    depth.value -= 1;
  }

  return -1;
}

function htmlToText(value: string) {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
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
      !isDetailsStart(line) &&
      !isReferenceDefinitionLine(line) &&
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
