import type { ProgressFile, RoadmapBackupFile, NoteComment, FlashcardDeck, QuizDeck } from '@/types';

import { readStoredComments, readStoredFlashcards, readStoredQuizzes, readStoredStudyComments } from './storage';
import { normalizeRoadmapBackup } from './normalize';

export { normalizeRoadmapBackup };

export function buildRoadmapBackup(progress: ProgressFile): RoadmapBackupFile {
  return {
    version: 5,
    exportedAt: new Date().toISOString(),
    progress,
    comments: readStoredComments(),
    flashcards: readStoredFlashcards(),
    quizzes: readStoredQuizzes(),
    studyComments: readStoredStudyComments(),
  };
}
