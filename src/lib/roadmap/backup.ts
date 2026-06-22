import type { ProgressFile, RoadmapBackupFile, NoteComment, FlashcardDeck, QuizDeck } from '@/types';

import { readStoredComments, readStoredFlashcards, readStoredQuizzes } from './storage';
import { normalizeRoadmapBackup } from './normalize';

export { normalizeRoadmapBackup };

export function buildRoadmapBackup(progress: ProgressFile): RoadmapBackupFile {
  return {
    version: 4,
    exportedAt: new Date().toISOString(),
    progress,
    comments: readStoredComments(),
    flashcards: readStoredFlashcards(),
    quizzes: readStoredQuizzes(),
  };
}
