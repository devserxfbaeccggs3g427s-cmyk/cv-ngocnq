import type { ProgressFile } from './progress';
import type { NoteComment } from './comments';
import type { FlashcardDeck } from './flashcards';
import type { QuizDeck } from './quizzes';
import type { StudyComment } from './study-comments';

export type RoadmapBackupFile = {
  version: 5;
  exportedAt: string;
  progress: ProgressFile;
  comments: Record<string, NoteComment[]>;
  flashcards: Record<string, FlashcardDeck[]>;
  quizzes: Record<string, QuizDeck[]>;
  studyComments: StudyComment[];
};

export type GithubBackupConfig = {
  repoUrl: string;
  branch: string;
  backupPath: string;
  commitMessage: string;
  hasServerToken: boolean;
};
