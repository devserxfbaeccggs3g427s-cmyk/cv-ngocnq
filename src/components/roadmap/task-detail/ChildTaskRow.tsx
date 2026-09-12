'use client';

import { useMemo } from 'react';
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoadmapTask, ProgressFile } from '@/types';
import { flattenTasks, getTaskStudyState, levelStyles } from '@/lib/roadmap';

export function ChildTaskRow({
  task,
  progress,
  depth,
  expandedTaskIds,
  onToggleExpanded,
  onTitleClick,
}: {
  task: RoadmapTask;
  progress: ProgressFile | null;
  depth: number;
  expandedTaskIds: Set<string>;
  onToggleExpanded: (taskId: string) => void;
  onTitleClick?: (taskId: string) => void;
}) {
  const descendants = useMemo(() => flattenTasks(task.children ?? []), [task.children]);
  const completedDescendants = descendants.filter((child) =>
    progress ? getTaskStudyState(child, progress).effectivelyCompleted : false
  ).length;
  const completed = progress ? getTaskStudyState(task, progress).effectivelyCompleted : false;
  const hasChildren = Boolean(task.children?.length);
  const isExpanded = expandedTaskIds.has(task.id);

  return (
    <div className="p-4" style={{ paddingLeft: `calc(1rem + ${depth * 1.25}rem)` }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="eyebrow font-mono normal-case tracking-normal">{task.id}</span>
            <span className={cn('badge', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
              {task.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-[var(--fg-muted)]">
              <Clock3 className="h-3.5 w-3.5" />
              {task.estimateHours}h
            </span>
            {descendants.length > 0 && (
              <span className="badge badge-ghost">
                {completedDescendants}/{descendants.length} mục con
              </span>
            )}
          </div>
          <div className="mt-2 flex items-start gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleExpanded(task.id)}
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--fg-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
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
            <button
              type="button"
              onClick={() => onTitleClick?.(task.id)}
              className="link-editorial text-left text-sm font-semibold leading-6"
            >
              {task.title}
            </button>
          </div>
          <p className="mt-1 text-sm leading-6 text-[var(--fg-muted)]">
            {task.deliverable}
          </p>
        </div>
      </div>
      {completed && (
        <div className="mt-3 badge border-[var(--success)] text-[var(--success)]">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Đã học
        </div>
      )}
      {hasChildren && isExpanded ? (
        <div className="mt-3 divide-y divide-[var(--line)] border-l border-[var(--line)]">
          {task.children?.map((child) => (
            <ChildTaskRow
              key={child.id}
              task={child}
              progress={progress}
              depth={depth + 1}
              expandedTaskIds={expandedTaskIds}
              onToggleExpanded={onToggleExpanded}
              onTitleClick={onTitleClick}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
