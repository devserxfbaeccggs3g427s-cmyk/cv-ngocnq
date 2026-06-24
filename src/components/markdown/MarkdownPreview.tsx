'use client';

import { useEffect, useState } from 'react';
import type { MarkdownBlock } from './markdown-types';
import { emptyMessage } from './markdown-types';
import { parseMarkdown } from './markdown-parser';
import { renderBlock, slugifyHeading, stripInlineMarkdown } from './markdown-renderers';

export type MarkdownHeading = {
  id: string;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
};

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
      {blocks.map((block, index) => renderBlock(block, index, headingIdsByBlockIndex.get(index), theme))}
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
