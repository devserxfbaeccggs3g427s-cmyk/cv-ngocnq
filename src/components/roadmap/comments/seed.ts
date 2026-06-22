import type { NoteComment } from '@/types';
import { isRecord, readSeedComments } from '@/lib/roadmap';
import { commentsStorageKey, progressStorageKey, type SeedProgress } from './utils';

export { readSeedComments };

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
