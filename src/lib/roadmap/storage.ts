import type { NoteComment, FlashcardDeck, QuizDeck, ProgressFile } from '@/types';

import {
  progressStorageKey,
  commentsStorageKey,
  flashcardsStorageKey,
  quizzesStorageKey,
} from './constants';
import { normalizeProgress, normalizeCommentsByTask, normalizeFlashcardsByTask, normalizeQuizzesByTask } from './normalize';

export function readStoredProgress(): ProgressFile | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(progressStorageKey);
    return raw ? normalizeProgress(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

export function storeProgress(progress: ProgressFile) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    // localStorage can fail in private browsing or full quota. The in-memory UI still works.
  }
}

export function removeStoredProgress() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(progressStorageKey);
  } catch {
    // localStorage can fail in locked-down browsers. The reload flow still reports API errors.
  }
}

export function removeStoredComments() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(commentsStorageKey);
  } catch {
    // localStorage can fail in locked-down browsers. Progress reset still proceeds.
  }
}

export function removeStoredFlashcards() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(flashcardsStorageKey);
  } catch {
    // localStorage can fail in locked-down browsers. Progress reset still proceeds.
  }
}

export function removeStoredQuizzes() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(quizzesStorageKey);
  } catch {
    // localStorage can fail in locked-down browsers. Progress reset still proceeds.
  }
}

export function hasStoredComments() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(commentsStorageKey) !== null;
  } catch {
    return false;
  }
}

export function hasStoredFlashcards() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(flashcardsStorageKey) !== null;
  } catch {
    return false;
  }
}

export function hasStoredQuizzes() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(quizzesStorageKey) !== null;
  } catch {
    return false;
  }
}

export function readStoredComments(): Record<string, NoteComment[]> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(commentsStorageKey);
    return raw ? normalizeCommentsByTask(JSON.parse(raw)) ?? {} : {};
  } catch {
    return {};
  }
}

export function readStoredFlashcards(): Record<string, FlashcardDeck[]> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(flashcardsStorageKey);
    return raw ? normalizeFlashcardsByTask(JSON.parse(raw)) ?? {} : {};
  } catch {
    return {};
  }
}

export function readStoredQuizzes(): Record<string, QuizDeck[]> {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(quizzesStorageKey);
    return raw ? normalizeQuizzesByTask(JSON.parse(raw)) ?? {} : {};
  } catch {
    return {};
  }
}

export function storeComments(comments: Record<string, NoteComment[]>) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
  } catch {
    // localStorage can fail in private browsing or full quota. Import still keeps progress in memory.
  }
}

export function storeFlashcards(flashcards: Record<string, FlashcardDeck[]>) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(flashcardsStorageKey, JSON.stringify(flashcards));
  } catch {
    // localStorage can fail in private browsing or full quota. Import still keeps progress in memory.
  }
}

export function storeQuizzes(quizzes: Record<string, QuizDeck[]>) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(quizzesStorageKey, JSON.stringify(quizzes));
  } catch {
    // localStorage can fail in private browsing or full quota. Import still keeps progress in memory.
  }
}
