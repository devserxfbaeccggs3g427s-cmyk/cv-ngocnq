import type { StudyStatusFilter } from '@/types';

export const emptyProgress = {
  updatedAt: null,
  items: {},
} as const;

export const progressStorageKey = 'skill-roadmap-progress:v1';
export const commentsStorageKey = 'skill-roadmap-note-comments:v1';
export const flashcardsStorageKey = 'skill-roadmap-flashcards:v1';
export const quizzesStorageKey = 'skill-roadmap-quizzes:v1';
export const studyCommentsStorageKey = 'skill-roadmap-study-comments:v1';
export const duplicateDetectionStorageKey = 'skill-roadmap-duplicate-detection:v1';
export const autoTaskNoteStorageKey = 'skill-roadmap-auto-task-note:v1';

export const shouldSyncProgressFile = process.env.NODE_ENV !== 'production';

export const levelStyles: Record<string, string> = {
  'Cơ bản': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  'Trung cấp': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Nâng cao': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Chuyên sâu': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

export const studyStatusOptions: Array<{ value: StudyStatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'completed', label: 'Đã học' },
  { value: 'incomplete', label: 'Chưa học' },
  { value: 'in-progress', label: 'Đang học' },
  { value: 'with-note', label: 'Có ghi chú' },
];
