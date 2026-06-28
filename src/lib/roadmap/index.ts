export {
  emptyProgress,
  progressStorageKey,
  commentsStorageKey,
  flashcardsStorageKey,
  quizzesStorageKey,
  studyCommentsStorageKey,
  markdownFilesStorageKey,
  duplicateDetectionStorageKey,
  autoTaskNoteStorageKey,
  shouldSyncProgressFile,
  levelStyles,
  studyStatusOptions,
} from './constants';

export {
  flattenTasks,
  flattenTasksWithContext,
  getLeafTasks,
  getLeafTaskContexts,
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
  removeStoredMarkdownFiles,
  hasStoredComments,
  hasStoredFlashcards,
  hasStoredQuizzes,
  hasStoredStudyComments,
  hasStoredMarkdownFiles,
  readStoredComments,
  readStoredFlashcards,
  readStoredQuizzes,
  readStoredStudyComments,
  readStoredMarkdownFiles,
  readStoredDuplicateDetectionConfig,
  storeComments,
  storeFlashcards,
  storeQuizzes,
  storeStudyComments,
  storeMarkdownFiles,
  storeDuplicateDetectionConfig,
} from './storage';

export type { DuplicateDetectionConfig } from './storage';

export {
  normalizeProgress,
  normalizeCommentsByTask,
  normalizeFlashcardsByTask,
  normalizeQuizzesByTask,
  normalizeMarkdownFiles,
  normalizeRoadmapBackup,
} from './normalize';

export {
  filterTaskTree,
  matchesTaskStudyStatus,
  getTaskStudyState,
  collectTaskSearchText,
  buildTaskIndex,
  applyTaskProgressUpdate,
} from './filters';

export { buildLearningPrompt } from './prompts';

export { buildRoadmapBackup } from './backup';

export { getAdjacentLeafTasks } from './navigation';
export type { RoadmapNavigationTask } from './navigation';

export {
  getContentRequirement,
  isRecord,
  normalizeSeedProgress,
  readSeedComments,
} from './seed-helpers';
export type { ContentType } from './seed-helpers';

export { formatDate } from './format';

export { hydrateFromStorage } from './hydration';
export type { HydrationConfig } from './hydration';
