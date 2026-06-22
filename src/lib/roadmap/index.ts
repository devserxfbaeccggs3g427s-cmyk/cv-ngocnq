export {
  emptyProgress,
  progressStorageKey,
  commentsStorageKey,
  flashcardsStorageKey,
  quizzesStorageKey,
  studyCommentsStorageKey,
  duplicateDetectionStorageKey,
  shouldSyncProgressFile,
  levelStyles,
  studyStatusOptions,
} from './constants';

export {
  flattenTasks,
  flattenTasksWithContext,
  getLeafTasks,
  getTaskContexts,
} from './flatten-tasks';

export {
  readStoredProgress,
  storeProgress,
  removeStoredProgress,
  removeStoredComments,
  removeStoredFlashcards,
  removeStoredQuizzes,
  removeStoredStudyComments,
  hasStoredComments,
  hasStoredFlashcards,
  hasStoredQuizzes,
  readStoredComments,
  readStoredFlashcards,
  readStoredQuizzes,
  readStoredStudyComments,
  readStoredDuplicateDetectionConfig,
  storeComments,
  storeFlashcards,
  storeQuizzes,
  storeStudyComments,
  storeDuplicateDetectionConfig,
} from './storage';

export type { DuplicateDetectionConfig } from './storage';

export {
  normalizeProgress,
  normalizeCommentsByTask,
  normalizeFlashcardsByTask,
  normalizeQuizzesByTask,
  normalizeRoadmapBackup,
} from './normalize';

export {
  filterTaskTree,
  matchesTaskStudyStatus,
  collectTaskSearchText,
  buildTaskIndex,
  applyTaskProgressUpdate,
} from './filters';

export { buildLearningPrompt } from './prompts';

export { buildRoadmapBackup } from './backup';
