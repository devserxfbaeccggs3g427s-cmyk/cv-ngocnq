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
export const markdownFilesStorageKey = 'markdown-files:v1';
export const duplicateDetectionStorageKey = 'skill-roadmap-duplicate-detection:v1';
export const autoTaskNoteStorageKey = 'skill-roadmap-auto-task-note:v1';

export const shouldSyncProgressFile = process.env.NODE_ENV !== 'production';

export const levelStyles: Record<string, string> = {
  'Cơ bản': 'border-[var(--line-strong)] text-[var(--fg-muted)]',
  'Trung cấp': 'border-[var(--warn)] text-[var(--warn)]',
  'Nâng cao': 'border-[var(--success)] text-[var(--success)]',
  'Chuyên sâu': 'border-[var(--accent)] text-[var(--accent)]',
};

export const studyStatusOptions: Array<{ value: StudyStatusFilter; label: string }> = [
  { value: 'all', label: 'Tất cả trạng thái' },
  { value: 'completed', label: 'Đã học' },
  { value: 'incomplete', label: 'Chưa học' },
  { value: 'in-progress', label: 'Đang học' },
  { value: 'with-note', label: 'Có ghi chú' },
];
