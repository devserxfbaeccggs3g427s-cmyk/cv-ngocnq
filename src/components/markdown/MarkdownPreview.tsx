'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen } from 'lucide-react';
import type { MarkdownBlock } from './markdown-types';
import { emptyMessage } from './markdown-types';
import { parseMarkdown, parseMarkdownReferenceDefinitions } from './markdown-parser';
import {
  renderBlock,
  renderReferenceDefinitions,
  slugifyHeading,
  stripInlineMarkdown,
} from './markdown-renderers';

export type MarkdownHeading = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

export function MarkdownPreview({
  content,
  theme: forcedTheme,
  enableBookReader = false,
  bookReaderTitle,
}: {
  content: string;
  theme?: 'light' | 'dark';
  enableBookReader?: boolean;
  bookReaderTitle?: string;
}) {
  const router = useRouter();
  const blocks = parseMarkdown(content.trim() ? content : emptyMessage);
  const referenceDefinitions = parseMarkdownReferenceDefinitions(content);
  const headingIdsByBlockIndex = buildHeadingIdsByBlockIndex(blocks);
  const [theme, setTheme] = useState<'light' | 'dark'>(forcedTheme ?? 'light');
  const renderedTheme = forcedTheme ?? theme;

  useEffect(() => {
    if (forcedTheme) {
      return;
    }

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
  }, [forcedTheme]);

  const preview = (
    <div className="markdown-preview" data-theme={renderedTheme}>
      {blocks.map((block, index) =>
        renderBlock(block, index, headingIdsByBlockIndex.get(index), renderedTheme, referenceDefinitions)
      )}
      {renderReferenceDefinitions(referenceDefinitions)}
    </div>
  );

  if (!enableBookReader) {
    return preview;
  }

  function openBookReader() {
    const readerId = createReaderId();
    const payload = JSON.stringify({
      title: bookReaderTitle || extractMarkdownTitle(content),
      content,
      backHref: window.location.pathname + window.location.search,
    });
    const storageKey = getReaderContentKey(readerId);

    try {
      window.sessionStorage.setItem(storageKey, payload);
    } catch {
      try {
        window.localStorage.setItem(storageKey, payload);
      } catch {
        return;
      }
    }

    router.push(`/markdown-reader/${encodeURIComponent(readerId)}`);
  }

  return (
    <div className="markdown-preview-frame has-book-reader">
      <button
        type="button"
        onClick={openBookReader}
        className="markdown-book-open"
        aria-label="Đọc Markdown dạng sách"
        title="Đọc dạng sách"
      >
        <BookOpen className="h-4 w-4" aria-hidden="true" />
      </button>
      {preview}
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

  const rootStyles = getComputedStyle(root);
  const bodyStyles = getComputedStyle(body);
  const themeBackground = rootStyles.getPropertyValue('--background') || bodyStyles.getPropertyValue('--background');
  const variableLuminance = getCssColorLuminance(themeBackground);

  if (variableLuminance !== null) {
    return variableLuminance < 128 ? 'dark' : 'light';
  }

  const background = bodyStyles.backgroundColor || rootStyles.backgroundColor;
  const luminance = getCssColorLuminance(background);

  if (luminance !== null) {
    return luminance < 128 ? 'dark' : 'light';
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getCssColorLuminance(color: string) {
  const normalizedColor = color.trim();

  if (!normalizedColor) {
    return null;
  }

  const hslMatch = normalizedColor.match(/^(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)%\s+(\d+(?:\.\d+)?)%$/);

  if (hslMatch) {
    return (Number(hslMatch[3]) / 100) * 255;
  }

  const rgbMatch = normalizedColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([.\d]+))?/);

  if (!rgbMatch) {
    return null;
  }

  const alpha = rgbMatch[4] === undefined ? 1 : Number(rgbMatch[4]);

  if (alpha === 0) {
    return null;
  }

  const red = Number(rgbMatch[1]);
  const green = Number(rgbMatch[2]);
  const blue = Number(rgbMatch[3]);

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

function getReaderContentKey(readerId: string) {
  return `markdown-book-reader-content:${readerId}`;
}

function createReaderId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function extractMarkdownTitle(content: string) {
  const heading = content
    .split(/\r?\n/)
    .find((line) => /^#{1,6}\s+\S/.test(line.trim()));

  return heading ? stripInlineMarkdown(heading.replace(/^#{1,6}\s+/, '').trim()) : 'Markdown';
}
