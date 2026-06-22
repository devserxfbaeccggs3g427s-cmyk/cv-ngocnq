import type { FlashcardDeck, NoteComment, ProgressFile, QuizDeck } from '@/types';

import {
  commentsStorageKey,
  flashcardsStorageKey,
  progressStorageKey,
  quizzesStorageKey,
} from './constants';
import { readSeedComments, normalizeSeedProgress } from './seed-helpers';
import { storeComments, storeFlashcards, storeProgress, storeQuizzes } from './storage';

export type HydrationConfig = {
  taskId: string;
  progressSetter?: (progress: ProgressFile) => void;
  commentsSetter?: (taskId: string, comments: NoteComment[]) => void;
  flashcardsSetter?: (taskId: string, decks: FlashcardDeck[]) => void;
  quizzesSetter?: (taskId: string, quizzes: QuizDeck[]) => void;
  seedUrl?: string;
  normalizeFlashcards?: (input: unknown) => Record<string, FlashcardDeck[]>;
  normalizeQuizzes?: (input: unknown) => Record<string, QuizDeck[]>;
  readSeedFlashcards?: (input: unknown) => Record<string, FlashcardDeck[]>;
  readSeedQuizzes?: (input: unknown) => Record<string, QuizDeck[]>;
};

export function hydrateFromStorage(config: HydrationConfig): () => void {
  let cancelled = false;

  queueMicrotask(() => {
    if (cancelled || typeof window === 'undefined') {
      return;
    }

    let hasLocalProgress = false;
    let hasLocalComments = false;
    let hasLocalFlashcards = false;
    let hasLocalQuizzes = false;

    try {
      const rawProgress = window.localStorage.getItem(progressStorageKey);
      const parsedProgress = rawProgress ? normalizeSeedProgress(JSON.parse(rawProgress)) : null;
      hasLocalProgress = Boolean(parsedProgress);

      if (parsedProgress) {
        config.progressSetter?.(parsedProgress);
      }
    } catch {
      hasLocalProgress = false;
    }

    try {
      const rawComments = window.localStorage.getItem(commentsStorageKey);
      const parsedComments = rawComments ? readSeedComments({ comments: JSON.parse(rawComments) }) : {};
      hasLocalComments = rawComments !== null;
      config.commentsSetter?.(config.taskId, parsedComments[config.taskId] ?? []);
    } catch {
      hasLocalComments = false;
    }

    try {
      const rawFlashcards = window.localStorage.getItem(flashcardsStorageKey);
      const parsedFlashcards = rawFlashcards && config.normalizeFlashcards
        ? config.normalizeFlashcards(JSON.parse(rawFlashcards))
        : {};
      hasLocalFlashcards = rawFlashcards !== null;
      config.flashcardsSetter?.(config.taskId, parsedFlashcards[config.taskId] ?? []);
    } catch {
      hasLocalFlashcards = false;
    }

    try {
      const rawQuizzes = window.localStorage.getItem(quizzesStorageKey);
      const parsedQuizzes = rawQuizzes && config.normalizeQuizzes
        ? config.normalizeQuizzes(JSON.parse(rawQuizzes))
        : {};
      hasLocalQuizzes = rawQuizzes !== null;
      config.quizzesSetter?.(config.taskId, parsedQuizzes[config.taskId] ?? []);
    } catch {
      hasLocalQuizzes = false;
    }

    if (
      hasLocalProgress &&
      hasLocalComments &&
      (!config.flashcardsSetter || hasLocalFlashcards) &&
      (!config.quizzesSetter || hasLocalQuizzes)
    ) {
      return;
    }

    void hydrateFromSeed({
      ...config,
      hasLocalProgress,
      hasLocalComments,
      hasLocalFlashcards,
      hasLocalQuizzes,
      isCancelled: () => cancelled,
    });
  });

  return () => {
    cancelled = true;
  };
}

async function hydrateFromSeed(
  config: HydrationConfig & {
    hasLocalProgress: boolean;
    hasLocalComments: boolean;
    hasLocalFlashcards: boolean;
    hasLocalQuizzes: boolean;
    isCancelled: () => boolean;
  }
) {
  try {
    const response = await fetch(config.seedUrl ?? '/api/skill-roadmap/progress', { cache: 'no-store' });
    const seed = (await response.json()) as unknown;

    if (config.isCancelled()) {
      return;
    }

    if (!config.hasLocalProgress) {
      const progress = normalizeSeedProgress(seed);

      if (progress) {
        storeProgress(progress);
        config.progressSetter?.(progress);
      }
    }

    if (!config.hasLocalComments) {
      const comments = readSeedComments(seed);
      storeComments(comments);
      config.commentsSetter?.(config.taskId, comments[config.taskId] ?? []);
    }

    if (!config.hasLocalFlashcards && config.flashcardsSetter && config.readSeedFlashcards) {
      const flashcards = config.readSeedFlashcards(seed);
      storeFlashcards(flashcards);
      config.flashcardsSetter(config.taskId, flashcards[config.taskId] ?? []);
    }

    if (!config.hasLocalQuizzes && config.quizzesSetter && config.readSeedQuizzes) {
      const quizzes = config.readSeedQuizzes(seed);
      storeQuizzes(quizzes);
      config.quizzesSetter(config.taskId, quizzes[config.taskId] ?? []);
    }
  } catch {
    // Existing pages silently fall back to in-memory state when seed hydration fails.
  }
}
