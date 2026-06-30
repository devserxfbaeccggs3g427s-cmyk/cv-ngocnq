export type StudyCommentContext =
  | { type: 'flashcard'; deckId: string; cardId: string }
  | { type: 'quiz'; deckId: string; questionId: string; attemptId: string }
  | {
      type: 'image-analysis';
      analysisId: string;
      analysisKind: string;
      prompt: string;
      imageCount: number;
      imageNames: string[];
      model?: string;
      provider?: string;
    }
  | {
      type: 'ai-review';
      contextId: string;
      sources: Array<
        | { type: 'markdown-file'; id: string; title: string }
        | { type: 'roadmap-task'; id: string; title: string }
      >;
    };

export type StudyComment = {
  id: string;
  parentId: string | null;
  author: 'user' | 'ai';
  body: string;
  createdAt: string;
  model?: string;
  provider?: string;
  title?: string;
  taskId: string;
  context: StudyCommentContext;
};
