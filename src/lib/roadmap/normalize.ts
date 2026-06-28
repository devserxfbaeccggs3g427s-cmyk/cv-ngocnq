import type {
  ProgressFile,
  ProgressItem,
  NoteComment,
  Flashcard,
  FlashcardDeck,
  QuizDeck,
  StudyComment,
  StudyCommentContext,
  MarkdownEntry,
} from '@/types';

import { normalizeQuizzesByTask } from './normalize-quizzes';

export { normalizeQuizzesByTask };

function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

function normalizeProgressItem(input: unknown): ProgressItem | null {
  if (!isRecord(input)) {
    return null;
  }

  return {
    completed: Boolean(input.completed),
    note: typeof input.note === 'string' ? input.note : '',
    completedAt: typeof input.completedAt === 'string' ? input.completedAt : null,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : new Date().toISOString(),
  };
}

export function normalizeProgress(input: unknown): ProgressFile | null {
  if (!isRecord(input)) {
    return null;
  }

  const value = isRecord(input.progress) ? input.progress : input;
  const rawItems = isRecord(value.items) ? value.items : value;

  if (!isRecord(rawItems)) {
    return null;
  }

  const items: Record<string, ProgressItem> = {};

  for (const [taskId, item] of Object.entries(rawItems)) {
    if (taskId === 'updatedAt') {
      continue;
    }

    const progressItem = normalizeProgressItem(item);

    if (!progressItem) {
      return null;
    }

    items[taskId] = progressItem;
  }

  return {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items,
  };
}

function normalizeComment(input: unknown): NoteComment | null {
  if (!isRecord(input)) {
    return null;
  }

  const author = input.author === 'ai' ? 'ai' : input.author === 'user' ? 'user' : null;

  if (
    typeof input.id !== 'string' ||
    (typeof input.parentId !== 'string' && input.parentId !== null) ||
    !author ||
    typeof input.body !== 'string' ||
    typeof input.createdAt !== 'string'
  ) {
    return null;
  }

  return {
    id: input.id,
    parentId: input.parentId,
    author,
    body: input.body,
    createdAt: input.createdAt,
    model: typeof input.model === 'string' ? input.model : undefined,
    provider: typeof input.provider === 'string' ? input.provider : undefined,
  };
}

export function normalizeCommentsByTask(input: unknown): Record<string, NoteComment[]> | null {
  if (!isRecord(input)) {
    return null;
  }

  const comments: Record<string, NoteComment[]> = {};

  for (const [taskId, rawComments] of Object.entries(input)) {
    if (!Array.isArray(rawComments)) {
      return null;
    }

    const normalized = rawComments.map(normalizeComment);

    if (normalized.some((comment) => !comment)) {
      return null;
    }

    comments[taskId] = normalized as NoteComment[];
  }

  return comments;
}

function normalizeFlashcard(input: unknown): Flashcard | null {
  if (!isRecord(input)) {
    return null;
  }

  if (
    typeof input.id !== 'string' ||
    typeof input.front !== 'string' ||
    typeof input.back !== 'string' ||
    typeof input.hint !== 'string' ||
    typeof input.tag !== 'string'
  ) {
    return null;
  }

  return {
    id: input.id,
    front: input.front,
    back: input.back,
    hint: input.hint,
    tag: input.tag,
  };
}

function normalizeFlashcardDeck(input: unknown, fallbackTaskId: string, index: number): FlashcardDeck | null {
  if (!isRecord(input) || !Array.isArray(input.cards)) {
    return null;
  }

  const rawSource = isRecord(input.source) ? input.source : {};
  const cards = input.cards.map(normalizeFlashcard);

  if (cards.some((card) => !card)) {
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
    cards: cards as Flashcard[],
  };
}

export function normalizeFlashcardsByTask(input: unknown): Record<string, FlashcardDeck[]> | null {
  if (!isRecord(input)) {
    return null;
  }

  const flashcards: Record<string, FlashcardDeck[]> = {};

  for (const [taskId, rawDecks] of Object.entries(input)) {
    const sourceDecks = Array.isArray(rawDecks) ? rawDecks : [rawDecks];
    const decks = sourceDecks
      .map((rawDeck, index) => normalizeFlashcardDeck(rawDeck, taskId, index))
      .filter((deck): deck is FlashcardDeck => Boolean(deck));

    if (decks.length > 0) {
      flashcards[taskId] = decks.map((deck, index) => ({
        ...deck,
        taskId: deck.taskId || taskId,
        title: deck.title || `Bộ flashcard ${index + 1}`,
      }));
    }
  }

  return flashcards;
}

function normalizeStudyCommentContext(input: unknown): StudyCommentContext | null {
  if (!isRecord(input)) {
    return null;
  }

  if (input.type === 'flashcard') {
    if (typeof input.deckId !== 'string' || typeof input.cardId !== 'string') {
      return null;
    }

    return {
      type: 'flashcard',
      deckId: input.deckId,
      cardId: input.cardId,
    };
  }

  if (input.type === 'quiz') {
    if (
      typeof input.deckId !== 'string' ||
      typeof input.questionId !== 'string' ||
      typeof input.attemptId !== 'string'
    ) {
      return null;
    }

    return {
      type: 'quiz',
      deckId: input.deckId,
      questionId: input.questionId,
      attemptId: input.attemptId,
    };
  }

  return null;
}

function normalizeStudyComment(input: unknown): StudyComment | null {
  const baseComment = normalizeComment(input);

  if (!baseComment || !isRecord(input) || typeof input.taskId !== 'string') {
    return null;
  }

  const context = normalizeStudyCommentContext(input.context);

  if (!context) {
    return null;
  }

  return {
    ...baseComment,
    taskId: input.taskId,
    context,
  };
}

export function normalizeStudyComments(input: unknown): StudyComment[] | null {
  if (!Array.isArray(input)) {
    return null;
  }

  const comments = input.map(normalizeStudyComment);

  if (comments.some((comment) => !comment)) {
    return null;
  }

  return comments as StudyComment[];
}

function normalizeMarkdownFile(input: unknown): MarkdownEntry | null {
  if (!isRecord(input)) {
    return null;
  }

  if (
    typeof input.id !== 'string' ||
    typeof input.title !== 'string'
  ) {
    return null;
  }

  const now = new Date().toISOString();
  const parentId = typeof input.parentId === 'string' ? input.parentId : null;

  if (input.type === 'folder') {
    return {
      id: input.id,
      type: 'folder',
      title: input.title,
      parentId,
      createdAt: typeof input.createdAt === 'string' ? input.createdAt : now,
      updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : now,
    };
  }

  if (input.type !== undefined && input.type !== 'file') {
    return null;
  }

  if (typeof input.content !== 'string') {
    return null;
  }

  return {
    id: input.id,
    type: 'file',
    title: input.title,
    parentId,
    content: input.content,
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : now,
    updatedAt: typeof input.updatedAt === 'string' ? input.updatedAt : now,
  };
}

export function normalizeMarkdownFiles(input: unknown): MarkdownEntry[] | null {
  if (!Array.isArray(input)) {
    return null;
  }

  const files = input.map(normalizeMarkdownFile);

  if (files.some((file) => !file)) {
    return null;
  }

  return files as MarkdownEntry[];
}

export function normalizeRoadmapBackup(input: unknown): {
  progress: ProgressFile;
  comments: Record<string, NoteComment[]>;
  flashcards: Record<string, FlashcardDeck[]>;
  quizzes: Record<string, QuizDeck[]>;
  studyComments: StudyComment[];
  markdownFiles: MarkdownEntry[];
} | null {
  if (!isRecord(input)) {
    return null;
  }

  const progress = normalizeProgress(input.progress ?? input);

  if (!progress) {
    return null;
  }

  const comments = input.comments === undefined ? {} : normalizeCommentsByTask(input.comments);

  if (!comments) {
    return null;
  }

  const flashcards = input.flashcards === undefined ? {} : normalizeFlashcardsByTask(input.flashcards);

  if (!flashcards) {
    return null;
  }

  const quizzes = input.quizzes === undefined ? {} : normalizeQuizzesByTask(input.quizzes);

  if (!quizzes) {
    return null;
  }

  const studyComments = input.studyComments === undefined ? [] : normalizeStudyComments(input.studyComments);

  if (!studyComments) {
    return null;
  }

  const markdownFiles = input.markdownFiles === undefined ? [] : normalizeMarkdownFiles(input.markdownFiles);

  if (!markdownFiles) {
    return null;
  }

  return {
    progress,
    comments,
    flashcards,
    quizzes,
    studyComments,
    markdownFiles,
  };
}
