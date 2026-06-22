import type { Flashcard, FlashcardDeck } from '@/types';
import {
  flashcardsStorageKey,
  formatDate,
  getContentRequirement,
  isRecord,
  normalizeSeedProgress,
  readSeedComments,
} from '@/lib/roadmap';

export { formatDate, isRecord, normalizeSeedProgress, readSeedComments };

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
  return getContentRequirement({ completed, hasNote, contentType: 'flashcard' });
}
