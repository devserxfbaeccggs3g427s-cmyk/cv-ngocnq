'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskContext } from '@/types';

type NavigationTask = Pick<TaskContext, 'id' | 'title' | 'trackTitle' | 'moduleTitle'>;

export function NoteLessonNavigation({
  previous,
  next,
  hrefBuilder = (taskId) => `/skill-roadmap/notes/${encodeURIComponent(taskId)}`,
  ariaLabel = 'Điều hướng task con thấp nhất',
}: {
  previous: NavigationTask | null;
  next: NavigationTask | null;
  hrefBuilder?: (taskId: string) => string;
  ariaLabel?: string;
}) {
  return (
    <nav
      className="card fixed inset-x-3 bottom-4 z-40 grid min-w-0 grid-cols-2 overflow-hidden p-0 sm:static sm:gap-3 sm:rounded-none sm:border-0 sm:bg-transparent sm:shadow-none"
      aria-label={ariaLabel}
    >
      <LessonNavigationButton direction="previous" task={previous} hrefBuilder={hrefBuilder} />
      <LessonNavigationButton direction="next" task={next} hrefBuilder={hrefBuilder} />
    </nav>
  );
}

function LessonNavigationButton({
  direction,
  task,
  hrefBuilder,
}: {
  direction: 'previous' | 'next';
  task: NavigationTask | null;
  hrefBuilder: (taskId: string) => string;
}) {
  const isPrevious = direction === 'previous';
  const label = isPrevious ? 'Task trước' : 'Task tiếp theo';
  const unavailableLabel = isPrevious ? 'Không có task trước' : 'Không có task sau';
  const icon = isPrevious ? (
    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
  ) : (
    <ChevronRight className="h-4 w-4" aria-hidden="true" />
  );
  const iconClassName = cn(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition sm:h-9 sm:w-9',
    task
      ? 'bg-[var(--surface-2)] text-[var(--fg)] group-hover:bg-[var(--surface)]'
      : 'bg-[var(--surface-2)] text-[var(--fg-subtle)]'
  );
  const content = (
    <>
      {isPrevious && <span className={iconClassName}>{icon}</span>}
      <span className={cn('min-w-0 flex-1', !isPrevious && 'text-right')}>
        <span className="eyebrow text-[10px] sm:text-xs">
          {label}
        </span>
        <span className="mt-1.5 line-clamp-2 min-h-[2rem] text-xs font-semibold leading-snug text-[var(--fg)] sm:min-h-0 sm:truncate sm:text-sm">
          {task?.title ?? unavailableLabel}
        </span>
        {task && (
          <span className="mt-1 hidden truncate text-xs text-[var(--fg-muted)] sm:block">
            {task.moduleTitle}
          </span>
        )}
      </span>
      {!isPrevious && <span className={iconClassName}>{icon}</span>}
    </>
  );
  const className = cn(
    'group flex min-h-[5rem] min-w-0 items-center gap-2 px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg)] focus-visible:ring-inset sm:min-h-0 sm:gap-3 sm:rounded-[var(--radius-card)] sm:border sm:border-[var(--line)] sm:bg-[var(--surface)] sm:px-4 sm:focus-visible:ring-offset-2 sm:focus-visible:ring-offset-[var(--bg)]',
    task
      ? 'hover:bg-[var(--surface-2)] hover:text-[var(--fg)]'
      : 'cursor-not-allowed bg-[var(--surface-2)] opacity-70',
    isPrevious && 'border-r border-[var(--line)] sm:border-r',
    !isPrevious && 'justify-end'
  );

  if (!task) {
    return (
      <span className={className} aria-disabled="true">
        {content}
      </span>
    );
  }

  return (
    <Link href={hrefBuilder(task.id)} className={className}>
      {content}
    </Link>
  );
}
