import type { QuizQuestion, QuizAttempt, QuizDeck } from '@/types';

function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

function normalizeQuizQuestion(input: unknown): QuizQuestion | null {
  if (!isRecord(input)) {
    return null;
  }

  if (
    typeof input.id !== 'string' ||
    typeof input.question !== 'string' ||
    !Array.isArray(input.options) ||
    typeof input.correctOptionIndex !== 'number' ||
    typeof input.explanation !== 'string' ||
    typeof input.tag !== 'string'
  ) {
    return null;
  }

  const options = input.options.filter((option): option is string => typeof option === 'string');

  if (options.length < 2 || input.correctOptionIndex < 0 || input.correctOptionIndex >= options.length) {
    return null;
  }

  return {
    id: input.id,
    question: input.question,
    options,
    correctOptionIndex: input.correctOptionIndex,
    explanation: input.explanation,
    tag: input.tag,
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

function normalizeQuizDeck(input: unknown): QuizDeck | null {
  if (!isRecord(input) || !isRecord(input.source) || !Array.isArray(input.questions)) {
    return null;
  }

  const questions = input.questions.map(normalizeQuizQuestion);

  if (questions.some((question) => !question)) {
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
    questions: questions as QuizQuestion[],
    attempts: Array.isArray(input.attempts)
      ? input.attempts.map(normalizeQuizAttempt).filter((attempt): attempt is QuizAttempt => Boolean(attempt))
      : [],
  };
}

export function normalizeQuizzesByTask(input: unknown): Record<string, QuizDeck[]> | null {
  if (!isRecord(input)) {
    return null;
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
