import type { NoteComment, ProgressFile, ProgressItem } from '@/types';

export type ContentType = 'flashcard' | 'quiz';

export function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

export function normalizeSeedProgress(input: unknown): ProgressFile | null {
  if (!isRecord(input)) {
    return null;
  }

  const value = isRecord(input.progress) ? input.progress : input;
  const rawItems = isRecord(value.items) ? value.items : null;

  if (!rawItems) {
    return null;
  }

  const items: Record<string, ProgressItem> = {};

  for (const [taskId, rawItem] of Object.entries(rawItems)) {
    if (!isRecord(rawItem)) {
      return null;
    }

    items[taskId] = {
      completed: Boolean(rawItem.completed),
      note: typeof rawItem.note === 'string' ? rawItem.note : '',
      completedAt: typeof rawItem.completedAt === 'string' ? rawItem.completedAt : null,
      updatedAt: typeof rawItem.updatedAt === 'string' ? rawItem.updatedAt : new Date().toISOString(),
    };
  }

  return {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items,
  };
}

export function readSeedComments(input: unknown): Record<string, NoteComment[]> {
  if (!isRecord(input) || !isRecord(input.comments)) {
    return {};
  }

  const comments: Record<string, NoteComment[]> = {};

  for (const [taskId, rawComments] of Object.entries(input.comments)) {
    if (!Array.isArray(rawComments)) {
      continue;
    }

    const taskComments: NoteComment[] = [];

    for (const comment of rawComments) {
      if (!isRecord(comment) || typeof comment.id !== 'string' || typeof comment.body !== 'string') {
        continue;
      }

      taskComments.push({
        id: comment.id,
        parentId: typeof comment.parentId === 'string' ? comment.parentId : null,
        author: comment.author === 'ai' ? 'ai' : 'user',
        body: comment.body,
        createdAt: typeof comment.createdAt === 'string' ? comment.createdAt : new Date().toISOString(),
        model: typeof comment.model === 'string' ? comment.model : undefined,
        provider: typeof comment.provider === 'string' ? comment.provider : undefined,
      });
    }

    comments[taskId] = taskComments;
  }

  return comments;
}

export function getContentRequirement({
  completed,
  hasNote,
  contentType,
}: {
  completed: boolean;
  hasNote: boolean;
  contentType: ContentType;
}): string | null {
  if (contentType === 'quiz') {
    if (!completed && !hasNote) {
      return 'Cần hoàn thành task và có note trước khi tạo trắc nghiệm.';
    }

    if (!completed) {
      return 'Cần hoàn thành task trước khi tạo trắc nghiệm.';
    }

    if (!hasNote) {
      return 'Cần ghi note trước khi tạo trắc nghiệm.';
    }

    return null;
  }

  if (!completed && !hasNote) {
    return 'Cần hoàn thành task và có note trước khi tạo flashcard.';
  }

  if (!completed) {
    return 'Chỉ tạo flashcard sau khi task đã hoàn thành.';
  }

  if (!hasNote) {
    return 'Cần có note trước khi tạo flashcard.';
  }

  return null;
}
