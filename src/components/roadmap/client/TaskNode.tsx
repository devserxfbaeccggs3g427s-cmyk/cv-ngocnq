'use client';

import type { CSSProperties } from 'react';
import { CheckCircle2, ChevronDown, ChevronRight, Circle, Clock3, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RoadmapTask, ProgressFile } from '@/types';
import { flattenTasks, getTaskStudyState, levelStyles } from '@/lib/roadmap';

interface TaskNodeProps {
  task: RoadmapTask;
  depth: number;
  progress: ProgressFile;
  expandedTaskIds: Set<string>;
  savingTaskId: string | null;
  onToggle: (task: RoadmapTask) => void;
  onToggleExpanded: (taskId: string) => void;
  onTitleClick?: (taskId: string) => void;
}

function getTaskDepthStyle(depth: number): string {
  if (depth === 0) return 'border-transparent bg-white/55 dark:bg-slate-900/30';
  if (depth === 1) return 'border-sky-200 bg-sky-50/60 dark:border-sky-900/70 dark:bg-sky-950/18';
  if (depth === 2) return 'border-violet-200 bg-violet-50/50 dark:border-violet-900/70 dark:bg-violet-950/18';
  return 'border-amber-200 bg-amber-50/45 dark:border-amber-900/70 dark:bg-amber-950/18';
}

export function TaskNode({
  task, depth, progress, expandedTaskIds,
  savingTaskId, onToggle, onToggleExpanded, onTitleClick,
}: TaskNodeProps) {
  const item = progress.items[task.id];
  const saving = savingTaskId === task.id;
  const childTasks = task.children ?? [];
  const descendants = flattenTasks(childTasks);
  const childCount = childTasks.length;
  const hasChildren = childTasks.length > 0;
  const completed = Boolean(item?.completed);
  const completedChildren = childTasks.filter(
    (child) => getTaskStudyState(child, progress).effectivelyCompleted
  ).length;
  const completedDescendants = descendants.filter(
    (child) => getTaskStudyState(child, progress).effectivelyCompleted
  ).length;
  const hasStartedChildren = completedDescendants > 0;
  const allChildrenCompleted = childCount > 0 && completedChildren === childCount;
  const allDescendantsCompleted = descendants.length > 0 && completedDescendants === descendants.length;
  const effectivelyCompleted = hasChildren ? allDescendantsCompleted : completed;
  const childProgressing = !effectivelyCompleted && hasStartedChildren;
  const isChild = depth > 0;
  const isExpanded = expandedTaskIds.has(task.id);
  const depthStyle = getTaskDepthStyle(depth);

  return (
    <div className="divide-y divide-slate-100/80 dark:divide-slate-800">
      <div
        className={cn(
          'task-node-row grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-l-4 py-4 pr-4 transition sm:gap-4 sm:py-5 md:pr-6',
          depthStyle,
          childProgressing && 'border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/25',
          effectivelyCompleted && 'border-emerald-300 bg-emerald-50/75 dark:border-emerald-800 dark:bg-emerald-950/25'
        )}
        style={{ '--task-depth': depth } as CSSProperties}
      >
        <button
          type="button"
          onClick={hasChildren ? undefined : () => onToggle(task)}
          disabled={hasChildren}
          className={cn(
            'mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-slate-200 bg-white/70 text-slate-400 shadow-sm transition hover:border-blue-300 hover:text-blue-700 dark:border-slate-700 dark:bg-slate-950/35 dark:hover:border-blue-700',
            isChild && 'h-8 w-8',
            hasChildren && 'cursor-default hover:border-slate-200 hover:text-slate-400 disabled:opacity-100 dark:hover:border-slate-700'
          )}
          aria-label={
            hasChildren
              ? 'Trạng thái task cha tự tính theo task con'
              : effectivelyCompleted
                ? 'Bỏ đánh dấu hoàn thành'
                : 'Đánh dấu hoàn thành'
          }
          title={hasChildren ? 'Task cha tự tính trạng thái theo task con' : undefined}
        >
          {saving ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : effectivelyCompleted ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wide text-slate-400">{task.id.toUpperCase()}</span>
            {isChild && (
              <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                Mục con cấp {depth}
              </span>
            )}
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
              {task.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <Clock3 className="h-3.5 w-3.5" />{task.estimateHours}h
            </span>
            {childCount > 0 && (
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs font-semibold',
                childProgressing ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
                effectivelyCompleted && 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200'
              )}>
                {completedChildren}/{childCount} mục con
              </span>
            )}
          </div>

          <div className="mt-2 flex items-start gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleExpanded(task.id)}
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/80 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label={isExpanded ? 'Thu gọn mục con' : 'Mở mục con'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="h-6 w-6 shrink-0" />
            )}
            <h4 className={cn('min-w-0 font-bold leading-6 text-slate-950 dark:text-white', isChild ? 'text-sm' : 'text-base')}>
              {onTitleClick ? (
                <button
                  type="button"
                  onClick={() => onTitleClick(task.id)}
                  className="max-w-full text-left transition-colors [overflow-wrap:anywhere] hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {task.title}
                </button>
              ) : (
                task.title
              )}
            </h4>
          </div>
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300">
            <span className="font-bold text-slate-800 dark:text-slate-100">Kết quả cần có:</span>{' '}
            {task.deliverable}
          </p>
          {item?.completedAt && (
            <p className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              Hoàn thành: {new Date(item.completedAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div>
          {childTasks.map((child) => (
            <TaskNode
              key={child.id}
              task={child}
              depth={depth + 1}
              progress={progress}
              expandedTaskIds={expandedTaskIds}
              savingTaskId={savingTaskId}
              onToggle={onToggle}
              onToggleExpanded={onToggleExpanded}
              onTitleClick={onTitleClick}
            />
          ))}
        </div>
      )}
    </div>
  );
}
