import type { RoadmapTask, ProgressFile, ProgressItem, TaskIndex, StudyStatusFilter } from '@/types';

import { flattenTasks } from './flatten-tasks';

export function filterTaskTree(
  tasks: RoadmapTask[],
  predicate: (task: RoadmapTask) => boolean
): RoadmapTask[] {
  return tasks.flatMap((task) => {
    const children = filterTaskTree(task.children ?? [], predicate);

    if (predicate(task) || children.length > 0) {
      return [{
        ...task,
        children,
      }];
    }

    return [];
  });
}

function getTaskStudyState(task: RoadmapTask, progress: ProgressFile) {
  const item = progress.items[task.id];
  const completed = Boolean(item?.completed);
  const descendants = flattenTasks(task.children ?? []);
  const childCount = descendants.length;
  const completedChildren = descendants.filter(
    (child) => progress.items[child.id]?.completed
  ).length;
  const allChildrenCompleted = childCount > 0 && completedChildren === childCount;
  const effectivelyCompleted = completed || allChildrenCompleted;
  const childProgressing = !effectivelyCompleted && completedChildren > 0;
  const hasNote = Boolean(item?.note.trim());

  return {
    completed,
    childCount,
    completedChildren,
    effectivelyCompleted,
    childProgressing,
    hasNote,
  };
}

export function matchesTaskStudyStatus(
  task: RoadmapTask,
  progress: ProgressFile,
  statusFilter: StudyStatusFilter
): boolean {
  const studyState = getTaskStudyState(task, progress);

  if (statusFilter === 'completed') {
    return studyState.effectivelyCompleted;
  }

  if (statusFilter === 'incomplete') {
    return !studyState.effectivelyCompleted && !studyState.childProgressing;
  }

  if (statusFilter === 'in-progress') {
    return studyState.childProgressing;
  }

  if (statusFilter === 'with-note') {
    return studyState.hasNote;
  }

  return true;
}

export function collectTaskSearchText(
  task: RoadmapTask,
  moduleTitle: string,
  trackTitle: string,
  skills: string[]
): string {
  return [
    task.title,
    task.deliverable,
    task.level,
    moduleTitle,
    trackTitle,
    ...skills,
    ...flattenTasks(task.children ?? []).flatMap((child) => [
      child.title,
      child.deliverable,
      child.level,
    ]),
  ]
    .join(' ')
    .toLowerCase();
}

export function buildTaskIndex(tracks: { modules: { tasks: RoadmapTask[] }[] }[]): TaskIndex {
  const taskById = new Map<string, RoadmapTask>();
  const ancestorIdsByTaskId = new Map<string, string[]>();

  function walk(tasks: RoadmapTask[], ancestorIds: string[]) {
    for (const task of tasks) {
      taskById.set(task.id, task);
      ancestorIdsByTaskId.set(task.id, ancestorIds);
      walk(task.children ?? [], [...ancestorIds, task.id]);
    }
  }

  for (const track of tracks) {
    for (const roadmapModule of track.modules) {
      walk(roadmapModule.tasks, []);
    }
  }

  return {
    taskById,
    ancestorIdsByTaskId,
  };
}

export function applyTaskProgressUpdate(
  progress: ProgressFile,
  taskId: string,
  nextItem: Partial<ProgressItem>,
  taskIndex: TaskIndex
): ProgressFile {
  const now = new Date().toISOString();
  const items = {
    ...progress.items,
    [taskId]: mergeProgressItem(progress.items[taskId], nextItem, now),
  };

  const ancestorIds = taskIndex.ancestorIdsByTaskId.get(taskId) ?? [];

  for (const ancestorId of [...ancestorIds].reverse()) {
    const ancestor = taskIndex.taskById.get(ancestorId);

    if (!ancestor) {
      continue;
    }

    const descendants = flattenTasks(ancestor.children ?? []);
    const allDescendantsCompleted = descendants.length > 0
      && descendants.every((descendant) => items[descendant.id]?.completed);
    const current = items[ancestorId];

    if (allDescendantsCompleted) {
      items[ancestorId] = mergeProgressItem(current, {
        completed: true,
        completedAt: current?.completedAt ?? now,
      }, now);
      continue;
    }

    if (current?.completed) {
      items[ancestorId] = mergeProgressItem(current, {
        completed: false,
        completedAt: null,
      }, now);
    }
  }

  return {
    updatedAt: now,
    items,
  };
}

function mergeProgressItem(
  current: ProgressItem | undefined,
  nextItem: Partial<ProgressItem>,
  now: string
): ProgressItem {
  return {
    completed: current?.completed ?? false,
    note: current?.note ?? '',
    completedAt: current?.completedAt ?? null,
    ...nextItem,
    updatedAt: now,
  };
}
