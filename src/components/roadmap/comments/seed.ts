import type { NoteComment } from '@/types';
import { commentsStorageKey, progressStorageKey, type SeedProgress } from './utils';

function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

export function readSeedComments(input: unknown): Record<string, NoteComment[]> {
  if (!isRecord(input) || !isRecord(input.comments)) {
    return {};
  }

  const commentsByTask: Record<string, NoteComment[]> = {};

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

    commentsByTask[taskId] = taskComments;
  }

  return commentsByTask;
}

export function readSeedProgress(input: unknown): SeedProgress {
  if (!isRecord(input)) {
    return { updatedAt: null, items: {} };
  }

  const value = isRecord(input.progress) ? input.progress : input;
  const rawItems = isRecord(value.items) ? value.items : {};
  const items: SeedProgress['items'] = {};

  for (const [taskId, rawItem] of Object.entries(rawItems)) {
    if (!isRecord(rawItem)) {
      continue;
    }

    items[taskId] = {
      note: typeof rawItem.note === 'string' ? rawItem.note : '',
      completed: Boolean(rawItem.completed),
      completedAt: typeof rawItem.completedAt === 'string' ? rawItem.completedAt : null,
      updatedAt: typeof rawItem.updatedAt === 'string' ? rawItem.updatedAt : new Date().toISOString(),
    };
  }

  return {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items,
  };
}

export function saveCommentsByTask(commentsByTask: Record<string, NoteComment[]>) {
  try {
    window.localStorage.setItem(commentsStorageKey, JSON.stringify(commentsByTask));
  } catch {
    // The in-memory thread still renders if localStorage is unavailable.
  }
}

export function saveSeedProgress(progress: SeedProgress) {
  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    // The focused thread can still render in memory if localStorage is unavailable.
  }
}
