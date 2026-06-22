import type { RoadmapTask, RoadmapTrack, TaskContext } from '@/types';

export function flattenTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  return tasks.flatMap((task) => [
    task,
    ...flattenTasks(task.children ?? []),
  ]);
}

export function getLeafTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  const leaves: RoadmapTask[] = [];
  const seenIds = new Set<string>();

  const visit = (items: RoadmapTask[]) => {
    items.forEach((task) => {
      if ((task.children ?? []).length === 0) {
        if (!seenIds.has(task.id)) {
          seenIds.add(task.id);
          leaves.push(task);
        }
        return;
      }

      visit(task.children ?? []);
    });
  };

  visit(tasks);
  return leaves;
}

export function flattenTasksWithContext(
  tasks: RoadmapTask[],
  trackTitle: string,
  moduleTitle: string,
  depth = 0,
  parentTasks: Array<Pick<RoadmapTask, 'id' | 'title'>> = []
): TaskContext[] {
  return tasks.flatMap((task) => {
    const current: TaskContext = {
      ...task,
      trackTitle,
      moduleTitle,
      depth,
      parentTasks,
    };

    return [
      current,
      ...flattenTasksWithContext(
        task.children ?? [],
        trackTitle,
        moduleTitle,
        depth + 1,
        [...parentTasks, { id: task.id, title: task.title }]
      ),
    ];
  });
}

export function getTaskContexts(tracks: RoadmapTrack[]): Map<string, TaskContext> {
  const entries = tracks.flatMap((track) =>
    track.modules.flatMap((roadmapModule) =>
      flattenTasksWithContext(roadmapModule.tasks, track.title, roadmapModule.title)
    )
  );

  return new Map(entries.map((task) => [task.id, task]));
}
