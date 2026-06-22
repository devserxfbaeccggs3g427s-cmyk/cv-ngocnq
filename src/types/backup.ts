import type { ProgressFile } from './progress';
import type { NoteComment } from './comments';
import type { FlashcardDeck } from './flashcards';
import type { QuizDeck } from './quizzes';

export type RoadmapBackupFile = {
  version: 4;
  exportedAt: string;
  progress: ProgressFile;
  comments: Record<string, NoteComment[]>;
  flashcards: Record<string, FlashcardDeck[]>;
  quizzes: Record<string, QuizDeck[]>;
};

export type GithubBackupConfig = {
  repoUrl: string;
  branch: string;
  backupPath: string;
  commitMessage: string;
  hasServerToken: boolean;
};
