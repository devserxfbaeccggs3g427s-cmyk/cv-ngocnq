export type StudyCommentContext =
  | { type: 'flashcard'; deckId: string; cardId: string }
  | { type: 'quiz'; deckId: string; questionId: string; attemptId: string };

export type StudyComment = {
  id: string;
  parentId: string | null;
  author: 'user' | 'ai';
  body: string;
  createdAt: string;
  model?: string;
  provider?: string;
  taskId: string;
  context: StudyCommentContext;
};
