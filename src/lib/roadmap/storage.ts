import type { NoteComment, FlashcardDeck, QuizDeck, ProgressFile, StudyComment, MarkdownEntry } from '@/types';

import {
  progressStorageKey,
  commentsStorageKey,
  flashcardsStorageKey,
  quizzesStorageKey,
  studyCommentsStorageKey,
  markdownFilesStorageKey,
  duplicateDetectionStorageKey,
} from './constants';
import { normalizeProgress, normalizeCommentsByTask, normalizeFlashcardsByTask, normalizeQuizzesByTask, normalizeMarkdownFiles } from './normalize';

const legacyRoadmapMarkdownFilesStorageKey = 'skill-roadmap-markdown-files:v1';

export type DuplicateDetectionConfig = {
  flashcards: boolean;
  quizzes: boolean;
};

const defaultDuplicateDetectionConfig: DuplicateDetectionConfig = {
  flashcards: true,
  quizzes: true,
};

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

export function removeStoredStudyComments() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(studyCommentsStorageKey);
  } catch {
    // localStorage can fail in locked-down browsers. Progress reset still proceeds.
  }
}

export function removeStoredMarkdownFiles() {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(markdownFilesStorageKey);
    window.localStorage.removeItem(legacyRoadmapMarkdownFilesStorageKey);
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

export function hasStoredStudyComments() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return window.localStorage.getItem(studyCommentsStorageKey) !== null;
  } catch {
    return false;
  }
}

export function hasStoredMarkdownFiles() {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    return (
      window.localStorage.getItem(markdownFilesStorageKey) !== null ||
      window.localStorage.getItem(legacyRoadmapMarkdownFilesStorageKey) !== null
    );
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

export function readStoredStudyComments(): StudyComment[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(studyCommentsStorageKey);
    const parsed = raw ? JSON.parse(raw) : [];

    return Array.isArray(parsed)
      ? parsed.filter((comment): comment is StudyComment =>
          Boolean(
            comment &&
              typeof comment.id === 'string' &&
              typeof comment.taskId === 'string' &&
              typeof comment.body === 'string' &&
              (comment.author === 'user' || comment.author === 'ai') &&
              comment.context &&
              (comment.context.type === 'flashcard' ||
                comment.context.type === 'quiz' ||
                comment.context.type === 'ai-review')
          )
        )
      : [];
  } catch {
    return [];
  }
}

export function readStoredMarkdownFiles(): MarkdownEntry[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(markdownFilesStorageKey);
    if (raw) {
      return normalizeMarkdownFiles(JSON.parse(raw)) ?? [];
    }

    const legacyRaw = window.localStorage.getItem(legacyRoadmapMarkdownFilesStorageKey);
    const legacyFiles = legacyRaw ? normalizeMarkdownFiles(JSON.parse(legacyRaw)) ?? [] : [];

    if (legacyFiles.length > 0) {
      storeMarkdownFiles(legacyFiles);
    }

    return legacyFiles;
  } catch {
    return [];
  }
}

export function readStoredDuplicateDetectionConfig(): DuplicateDetectionConfig {
  if (typeof window === 'undefined') {
    return defaultDuplicateDetectionConfig;
  }

  try {
    const raw = window.localStorage.getItem(duplicateDetectionStorageKey);
    const parsed = raw ? JSON.parse(raw) : {};

    return {
      flashcards: typeof parsed?.flashcards === 'boolean' ? parsed.flashcards : true,
      quizzes: typeof parsed?.quizzes === 'boolean' ? parsed.quizzes : true,
    };
  } catch {
    return defaultDuplicateDetectionConfig;
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

export function storeStudyComments(comments: StudyComment[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(studyCommentsStorageKey, JSON.stringify(comments));
  } catch {
    // localStorage can fail in private browsing or full quota. UI state still remains in memory.
  }
}

export function storeMarkdownFiles(files: MarkdownEntry[]) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(markdownFilesStorageKey, JSON.stringify(files));
  } catch {
    // localStorage can fail in private browsing or full quota. UI state still remains in memory.
  }
}

export function storeDuplicateDetectionConfig(config: DuplicateDetectionConfig) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(duplicateDetectionStorageKey, JSON.stringify(config));
  } catch {
    // localStorage can fail in private browsing or full quota. UI state still remains in memory.
  }
}
