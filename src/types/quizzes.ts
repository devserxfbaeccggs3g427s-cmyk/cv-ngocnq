export type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  tag: string;
};

export type QuizAttempt = {
  id: string;
  startedAt: string;
  submittedAt: string | null;
  durationSeconds: number;
  answers: Record<string, number>;
  score: number | null;
  total: number;
  submittedBy: 'user' | 'timeout' | null;
};

export type QuizDeck = {
  id: string;
  taskId: string;
  taskTitle: string;
  title: string;
  durationMinutes: number;
  createdAt: string;
  source: { noteCharacters: number; commentCount: number };
  questions: QuizQuestion[];
  attempts: QuizAttempt[];
};
