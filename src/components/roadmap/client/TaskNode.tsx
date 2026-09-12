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
  isLastChild?: boolean;
  onToggle: (task: RoadmapTask) => void;
  onToggleExpanded: (taskId: string) => void;
  onTitleClick?: (taskId: string) => void;
}

export function TaskNode({
  task,
  depth,
  progress,
  expandedTaskIds,
  savingTaskId,
  isLastChild = false,
  onToggle,
  onToggleExpanded,
  onTitleClick,
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

  return (
    <div className="task-node">
      <div
        className={cn(
          'task-node-row relative grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 py-3 transition sm:gap-4 sm:py-4',
          // Parent (top-level) tasks — editorial container with strong left rail
          !isChild && 'rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] px-4 sm:px-5',
          !isChild && childProgressing && 'border-[var(--warn)] bg-[var(--surface)]',
          !isChild && effectivelyCompleted && 'border-[var(--success)] bg-[var(--surface-2)]',
          // Child tasks — compact, no card chrome, just tree guide line
          isChild && 'rounded-md border border-transparent bg-transparent px-3 hover:bg-[var(--surface-2)] sm:px-4'
        )}
        style={{ '--task-depth': depth } as CSSProperties}
      >
        <button
          type="button"
          onClick={hasChildren ? undefined : () => onToggle(task)}
          disabled={hasChildren}
          className={cn(
            'mt-0.5 inline-flex shrink-0 items-center justify-center rounded-full border bg-[var(--surface)] text-[var(--fg-muted)] transition hover:border-[var(--fg)] hover:text-[var(--fg)]',
            !isChild ? 'h-10 w-10' : 'h-8 w-8',
            hasChildren && 'cursor-default hover:border-[var(--line)] hover:text-[var(--fg-muted)]'
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
            <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
          ) : (
            <Circle className="h-5 w-5" />
          )}
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn('eyebrow', !isChild && 'text-[var(--fg)]')}>{task.id.toUpperCase()}</span>
            {isChild && (
              <span className="badge badge-ghost text-[10px]">
                Mục con cấp {depth}
              </span>
            )}
            <span className={cn('inline-flex items-center rounded-full border bg-[var(--bg)] px-2 py-0.5 text-xs font-semibold', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
              {task.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--fg-muted)]">
              <Clock3 className="h-3.5 w-3.5" />{task.estimateHours}h
            </span>
            {childCount > 0 && (
              <span className={cn(
                'inline-flex items-center rounded-full border bg-[var(--bg)] px-2 py-0.5 text-xs font-semibold',
                childProgressing ? 'border-[var(--warn)] text-[var(--warn)]' : 'border-[var(--line)] text-[var(--fg-muted)]',
                effectivelyCompleted && 'border-[var(--success)] text-[var(--success)]'
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
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[var(--fg-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--fg)]"
                aria-label={isExpanded ? 'Thu gọn mục con' : 'Mở mục con'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </button>
            ) : (
              <span className="h-6 w-6 shrink-0" />
            )}
            <h4 className={cn(
              'min-w-0 font-bold leading-6 text-[var(--fg)]',
              isChild ? 'text-sm' : 'text-base sm:text-lg'
            )}>
              {onTitleClick ? (
                <button
                  type="button"
                  onClick={() => onTitleClick(task.id)}
                  className="max-w-full text-left transition-colors [overflow-wrap:anywhere] hover:text-[var(--accent)]"
                >
                  {task.title}
                </button>
              ) : (
                task.title
              )}
            </h4>
          </div>

          {!isChild && (
            <p className="mt-2 text-sm leading-6 text-[var(--fg-muted)]">
              <span className="font-bold text-[var(--fg)]">Kết quả cần có:</span>{' '}
              {task.deliverable}
            </p>
          )}
          {isChild && (
            <p className="mt-1 text-xs leading-5 text-[var(--fg-muted)] [overflow-wrap:anywhere]">
              {task.deliverable}
            </p>
          )}
          {item?.completedAt && (
            <p className="mt-2 text-xs font-medium text-[var(--fg-muted)]">
              Hoàn thành: {new Date(item.completedAt).toLocaleString('vi-VN')}
            </p>
          )}
        </div>
      </div>

      {hasChildren && isExpanded && (
        <div className={cn(
          'tree-children relative',
          isChild ? 'ml-7 sm:ml-8' : 'mt-2 ml-7 sm:ml-10',
          // Vertical guide line down the left side of the children group
          !isLastChild && 'pb-1'
        )}>
          {/* Vertical tree guide line */}
          <span
            aria-hidden
            className="pointer-events-none absolute left-3 top-0 w-px bg-[var(--line-strong)] sm:left-4"
            style={{ height: 'calc(100% - 0.5rem)' }}
          />
          {childTasks.map((child, index) => {
            const isLast = index === childTasks.length - 1;
            return (
              <div
                key={child.id}
                className={cn(
                  'tree-child relative',
                  index === 0 && 'pt-1'
                )}
              >
                {/* Horizontal connector arm from vertical line into the row */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute left-3 top-[1.55rem] h-px w-3 bg-[var(--line-strong)] sm:left-4 sm:top-[1.85rem] sm:w-4"
                />
                <TaskNode
                  task={child}
                  depth={depth + 1}
                  progress={progress}
                  expandedTaskIds={expandedTaskIds}
                  savingTaskId={savingTaskId}
                  isLastChild={isLast}
                  onToggle={onToggle}
                  onToggleExpanded={onToggleExpanded}
                  onTitleClick={onTitleClick}
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
