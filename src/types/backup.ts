import type { ProgressFile } from './progress';
import type { NoteComment } from './comments';
import type { FlashcardDeck } from './flashcards';
import type { QuizDeck } from './quizzes';
import type { StudyComment } from './study-comments';
import type { MarkdownEntry } from './markdown-files';

export type RoadmapBackupFile = {
  version: 6;
  exportedAt: string;
  progress: ProgressFile;
  comments: Record<string, NoteComment[]>;
  flashcards: Record<string, FlashcardDeck[]>;
  quizzes: Record<string, QuizDeck[]>;
  studyComments: StudyComment[];
  markdownFiles: MarkdownEntry[];
};

export type GithubBackupConfig = {
  repoUrl: string;
  branch: string;
  backupPath: string;
  commitMessage: string;
  hasServerToken: boolean;
};
