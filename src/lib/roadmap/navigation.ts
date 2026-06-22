import type { TaskContext } from '@/types';

export type RoadmapNavigationTask = Pick<TaskContext, 'id' | 'title' | 'trackTitle' | 'moduleTitle'>;

export function getAdjacentLeafTasks(
  taskId: string,
  leafTasks: RoadmapNavigationTask[]
): {
  previous: RoadmapNavigationTask | null;
  next: RoadmapNavigationTask | null;
} {
  const currentIndex = leafTasks.findIndex((task) => task.id === taskId);

  if (currentIndex < 0) {
    return { previous: null, next: null };
  }

  return {
    previous: leafTasks[currentIndex - 1] ?? null,
    next: leafTasks[currentIndex + 1] ?? null,
  };
}
