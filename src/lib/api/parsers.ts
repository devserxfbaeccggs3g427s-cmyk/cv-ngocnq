import { NextResponse } from 'next/server';

export type ParsedTask = {
  id: string;
  title: string;
  level: string;
  deliverable: string;
};

export type ParsedComment = {
  author?: string;
  body?: string;
  createdAt?: string;
};

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeBaseUrl(value: string) {
  return value.trim().replace(/\/+$/, '');
}

export function compactText(value: string, maxLength: number) {
  const compacted = value
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  if (compacted.length <= maxLength) {
    return compacted;
  }

  return `${compacted.slice(0, maxLength).trim()}\n\n[Context đã được rút gọn để giới hạn payload.]`;
}

export function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export function readTask(value: unknown): ParsedTask | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const task = value as Record<string, unknown>;

  if (
    !isNonEmptyString(task.id) ||
    !isNonEmptyString(task.title) ||
    !isNonEmptyString(task.level) ||
    !isNonEmptyString(task.deliverable)
  ) {
    return null;
  }

  return {
    id: task.id.trim(),
    title: task.title.trim(),
    level: task.level.trim(),
    deliverable: task.deliverable.trim(),
  };
}

export function readComments(value: unknown): ParsedComment[] {
  if (!Array.isArray(value)) {
    return [];
  }

  const comments: ParsedComment[] = [];

  for (const comment of value) {
    if (!comment || typeof comment !== 'object') {
      continue;
    }

    const item = comment as Record<string, unknown>;
    const body = isNonEmptyString(item.body) ? item.body.trim() : '';

    if (!body) {
      continue;
    }

    comments.push({
      author: isNonEmptyString(item.author) ? item.author.trim() : 'user',
      body,
      createdAt: isNonEmptyString(item.createdAt) ? item.createdAt.trim() : undefined,
    });
  }

  return comments;
}
