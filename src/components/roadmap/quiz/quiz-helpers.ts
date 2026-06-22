import type { QuizQuestion, QuizAttempt, QuizDeck } from '@/types';
import {
  formatDate,
  getContentRequirement,
  isRecord,
  normalizeSeedProgress,
  quizzesStorageKey,
  readSeedComments,
} from '@/lib/roadmap';

export { formatDate, isRecord, normalizeSeedProgress, readSeedComments };

export function storeTaskQuizzes(taskId: string, decks: QuizDeck[]) {
  try {
    const raw = window.localStorage.getItem(quizzesStorageKey);
    const parsed = raw ? normalizeQuizzesByTask(JSON.parse(raw)) : {};
    parsed[taskId] = decks;
    window.localStorage.setItem(quizzesStorageKey, JSON.stringify(parsed));
  } catch {
    // The generated quizzes remain usable in memory for this screen.
  }
}

export function readSeedQuizzes(input: unknown): Record<string, QuizDeck[]> {
  if (!isRecord(input) || !isRecord(input.quizzes)) {
    return {};
  }

  return normalizeQuizzesByTask(input.quizzes);
}

function normalizeQuizDeck(input: unknown): QuizDeck | null {
  if (!isRecord(input) || !Array.isArray(input.questions) || !isRecord(input.source)) {
    return null;
  }

  const questions = input.questions
    .map((question) => {
      if (
        !isRecord(question) ||
        typeof question.id !== 'string' ||
        typeof question.question !== 'string' ||
        !Array.isArray(question.options) ||
        typeof question.correctOptionIndex !== 'number'
      ) {
        return null;
      }

      const options = question.options.filter((option): option is string => typeof option === 'string');

      if (options.length < 2 || question.correctOptionIndex < 0 || question.correctOptionIndex >= options.length) {
        return null;
      }

      return {
        id: question.id,
        question: question.question,
        options,
        correctOptionIndex: question.correctOptionIndex,
        explanation: typeof question.explanation === 'string' ? question.explanation : '',
        tag: typeof question.tag === 'string' ? question.tag : 'Kiểm tra',
      };
    })
    .filter((question): question is QuizQuestion => Boolean(question));

  if (questions.length === 0) {
    return null;
  }

  return {
    id: typeof input.id === 'string' ? input.id : crypto.randomUUID(),
    taskId: typeof input.taskId === 'string' ? input.taskId : '',
    taskTitle: typeof input.taskTitle === 'string' ? input.taskTitle : '',
    title: typeof input.title === 'string' ? input.title : '',
    durationMinutes: typeof input.durationMinutes === 'number' ? input.durationMinutes : 10,
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : new Date().toISOString(),
    source: {
      noteCharacters: typeof input.source.noteCharacters === 'number' ? input.source.noteCharacters : 0,
      commentCount: typeof input.source.commentCount === 'number' ? input.source.commentCount : 0,
    },
    questions,
    attempts: Array.isArray(input.attempts)
      ? input.attempts.map(normalizeQuizAttempt).filter((attempt): attempt is QuizAttempt => Boolean(attempt))
      : [],
  };
}

function normalizeQuizAttempt(input: unknown): QuizAttempt | null {
  if (!isRecord(input) || !isRecord(input.answers)) {
    return null;
  }

  const answers: Record<string, number> = {};

  for (const [questionId, answer] of Object.entries(input.answers)) {
    if (typeof answer === 'number') {
      answers[questionId] = answer;
    }
  }

  return {
    id: typeof input.id === 'string' ? input.id : crypto.randomUUID(),
    startedAt: typeof input.startedAt === 'string' ? input.startedAt : new Date().toISOString(),
    submittedAt: typeof input.submittedAt === 'string' ? input.submittedAt : null,
    durationSeconds: typeof input.durationSeconds === 'number' ? input.durationSeconds : 600,
    answers,
    score: typeof input.score === 'number' ? input.score : null,
    total: typeof input.total === 'number' ? input.total : 0,
    submittedBy: input.submittedBy === 'user' || input.submittedBy === 'timeout' ? input.submittedBy : null,
  };
}

export function normalizeQuizzesByTask(input: unknown): Record<string, QuizDeck[]> {
  if (!isRecord(input)) {
    return {};
  }

  const quizzes: Record<string, QuizDeck[]> = {};

  for (const [taskId, rawValue] of Object.entries(input)) {
    const rawDecks = Array.isArray(rawValue) ? rawValue : [rawValue];
    const decks = rawDecks
      .map((rawDeck, index) => {
        const deck = normalizeQuizDeck(rawDeck);

        if (!deck) {
          return null;
        }

        return {
          ...deck,
          taskId: deck.taskId || taskId,
          title: deck.title || `Bài trắc nghiệm ${index + 1}`,
        };
      })
      .filter((deck): deck is QuizDeck => Boolean(deck));

    if (decks.length > 0) {
      quizzes[taskId] = decks;
    }
  }

  return quizzes;
}

export function getQuizRequirement({
  completed,
  hasNote,
}: {
  completed: boolean;
  hasNote: boolean;
}) {
  return getContentRequirement({ completed, hasNote, contentType: 'quiz' });
}
