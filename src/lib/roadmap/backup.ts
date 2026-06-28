import type { ProgressFile, RoadmapBackupFile } from '@/types';

import { readStoredComments, readStoredFlashcards, readStoredQuizzes, readStoredStudyComments, readStoredMarkdownFiles } from './storage';
import { normalizeRoadmapBackup } from './normalize';

export { normalizeRoadmapBackup };

export function buildRoadmapBackup(progress: ProgressFile): RoadmapBackupFile {
  return {
    version: 6,
    exportedAt: new Date().toISOString(),
    progress,
    comments: readStoredComments(),
    flashcards: readStoredFlashcards(),
    quizzes: readStoredQuizzes(),
    studyComments: readStoredStudyComments(),
    markdownFiles: readStoredMarkdownFiles(),
  };
}
