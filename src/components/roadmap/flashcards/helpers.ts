import type { ProgressFile, ProgressItem, NoteComment, Flashcard, FlashcardDeck } from '@/types';
import { flashcardsStorageKey } from '@/lib/roadmap';

function isRecord(input: unknown): input is Record<string, unknown> {
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

export function readSeedFlashcards(input: unknown): Record<string, FlashcardDeck[]> {
  if (!isRecord(input) || !isRecord(input.flashcards)) {
    return {};
  }

  return normalizeFlashcardsByTask(input.flashcards);
}

function normalizeFlashcard(input: unknown): Flashcard | null {
  if (!isRecord(input)) {
    return null;
  }

  if (
    typeof input.id !== 'string' ||
    typeof input.front !== 'string' ||
    typeof input.back !== 'string'
  ) {
    return null;
  }

  return {
    id: input.id,
    front: input.front,
    back: input.back,
    hint: typeof input.hint === 'string' ? input.hint : '',
    tag: typeof input.tag === 'string' ? input.tag : 'Ôn tập',
  };
}

function normalizeFlashcardDeck(input: unknown, fallbackTaskId: string, index: number): FlashcardDeck | null {
  if (!isRecord(input) || !Array.isArray(input.cards)) {
    return null;
  }

  const rawSource = isRecord(input.source) ? input.source : {};
  const cards = input.cards.map(normalizeFlashcard).filter((card): card is Flashcard => Boolean(card));

  if (cards.length === 0) {
    return null;
  }

  return {
    id: typeof input.id === 'string' ? input.id : crypto.randomUUID(),
    taskId: typeof input.taskId === 'string' ? input.taskId : fallbackTaskId,
    taskTitle: typeof input.taskTitle === 'string' ? input.taskTitle : '',
    title: typeof input.title === 'string' ? input.title : `Bộ flashcard ${index + 1}`,
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : new Date().toISOString(),
    source: {
      noteCharacters: typeof rawSource.noteCharacters === 'number' ? rawSource.noteCharacters : 0,
      commentCount: typeof rawSource.commentCount === 'number' ? rawSource.commentCount : 0,
    },
    cards,
  };
}

export function normalizeFlashcardsByTask(input: unknown): Record<string, FlashcardDeck[]> {
  if (!isRecord(input)) {
    return {};
  }

  const flashcards: Record<string, FlashcardDeck[]> = {};

  for (const [taskId, rawDecks] of Object.entries(input)) {
    const sourceDecks = Array.isArray(rawDecks) ? rawDecks : [rawDecks];
    const decks = sourceDecks
      .map((rawDeck, index) => normalizeFlashcardDeck(rawDeck, taskId, index))
      .filter((deck): deck is FlashcardDeck => Boolean(deck));

    if (decks.length > 0) {
      flashcards[taskId] = decks;
    }
  }

  return flashcards;
}

export function storeTaskFlashcards(taskId: string, decks: FlashcardDeck[]) {
  try {
    const raw = window.localStorage.getItem(flashcardsStorageKey);
    const parsed = raw ? normalizeFlashcardsByTask(JSON.parse(raw)) : {};
    parsed[taskId] = decks;
    window.localStorage.setItem(flashcardsStorageKey, JSON.stringify(parsed));
  } catch {
    // The generated decks remain usable in memory for the current screen.
  }
}

export function getFlashcardRequirement({
  completed,
  hasNote,
}: {
  completed: boolean;
  hasNote: boolean;
}): string | null {
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

export function formatDate(value: string | null): string {
  if (!value) {
    return 'Chưa có dữ liệu';
  }

  return new Date(value).toLocaleString('vi-VN');
}
