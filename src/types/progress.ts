export type ProgressItem = {
  completed: boolean;
  note: string;
  completedAt: string | null;
  updatedAt: string;
};

export type ProgressFile = {
  updatedAt: string | null;
  items: Record<string, ProgressItem>;
};

export type StudyStatusFilter = 'all' | 'completed' | 'incomplete' | 'in-progress' | 'with-note';
