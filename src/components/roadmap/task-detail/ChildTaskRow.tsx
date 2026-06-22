'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ListTree,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoadmapTask, ProgressFile } from '@/types';
import { flattenTasks } from '@/lib/roadmap';

const levelStyles: Record<string, string> = {
  'Cơ bản': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  'Trung cấp': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Nâng cao': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Chuyên sâu': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

export function ChildTaskRow({
  task,
  progress,
  depth,
  expandedTaskIds,
  onToggleExpanded,
}: {
  task: RoadmapTask;
  progress: ProgressFile | null;
  depth: number;
  expandedTaskIds: Set<string>;
  onToggleExpanded: (taskId: string) => void;
}) {
  const descendants = useMemo(() => flattenTasks(task.children ?? []), [task.children]);
  const completedDescendants = descendants.filter((child) => progress?.items?.[child.id]?.completed).length;
  const completed = Boolean(progress?.items?.[task.id]?.completed) || (descendants.length > 0 && completedDescendants === descendants.length);
  const hasChildren = Boolean(task.children?.length);
  const isExpanded = expandedTaskIds.has(task.id);

  return (
    <div className="p-4" style={{ paddingLeft: `calc(1rem + ${depth * 1.25}rem)` }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-gray-400">{task.id}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
              {task.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock3 className="h-3.5 w-3.5" />
              {task.estimateHours}h
            </span>
            {descendants.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {completedDescendants}/{descendants.length} mục con
              </span>
            )}
          </div>
          <div className="mt-2 flex items-start gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleExpanded(task.id)}
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label={isExpanded ? 'Thu gọn task con' : 'Mở task con'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="h-6 w-6 shrink-0" />
            )}
            <h3 className="text-sm font-semibold leading-6 text-gray-950 dark:text-white">
              {task.title}
            </h3>
          </div>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {task.deliverable}
          </p>
        </div>
        <Link
          href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
        >
          <ListTree className="h-3.5 w-3.5" />
          Chi tiết
        </Link>
      </div>
      {completed && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Đã học
        </div>
      )}
      {hasChildren && isExpanded ? (
        <div className="mt-3 divide-y divide-gray-100 border-l border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {task.children?.map((child) => (
            <ChildTaskRow
              key={child.id}
              task={child}
              progress={progress}
              depth={depth + 1}
              expandedTaskIds={expandedTaskIds}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
