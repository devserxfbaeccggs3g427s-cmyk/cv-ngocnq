'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TaskContext } from '@/types';

type NavigationTask = Pick<TaskContext, 'id' | 'title' | 'trackTitle' | 'moduleTitle'>;

export function NoteLessonNavigation({
  previous,
  next,
}: {
  previous: NavigationTask | null;
  next: NavigationTask | null;
}) {
  return (
    <nav
      className="fixed inset-x-3 bottom-4 z-40 grid min-w-0 grid-cols-2 overflow-hidden rounded-2xl border border-gray-200 bg-white/95 shadow-2xl shadow-gray-950/20 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95 sm:static sm:gap-3 sm:overflow-visible sm:rounded-none sm:border-0 sm:bg-transparent sm:shadow-none sm:backdrop-blur-none"
      aria-label="Điều hướng bài học đã hoàn thành"
    >
      <LessonNavigationButton direction="previous" task={previous} />
      <LessonNavigationButton direction="next" task={next} />
    </nav>
  );
}

function LessonNavigationButton({
  direction,
  task,
}: {
  direction: 'previous' | 'next';
  task: NavigationTask | null;
}) {
  const isPrevious = direction === 'previous';
  const label = isPrevious ? 'Bài trước' : 'Bài tiếp theo';
  const unavailableLabel = isPrevious ? 'Không có bài trước' : 'Không có bài sau';
  const icon = isPrevious ? (
    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
  ) : (
    <ChevronRight className="h-4 w-4" aria-hidden="true" />
  );
  const iconClassName = cn(
    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition sm:h-9 sm:w-9',
    task
      ? 'bg-blue-50 text-blue-700 group-hover:bg-blue-100 dark:bg-blue-950/35 dark:text-blue-200 dark:group-hover:bg-blue-950'
      : 'bg-gray-100 text-gray-400 dark:bg-gray-900 dark:text-gray-600'
  );
  const content = (
    <>
      {isPrevious && <span className={iconClassName}>{icon}</span>}
      <span className={cn('min-w-0 flex-1', !isPrevious && 'text-right')}>
        <span className="block text-[0.62rem] font-bold uppercase leading-none tracking-wide text-gray-400 sm:text-xs">
          {label}
        </span>
        <span className="mt-1.5 line-clamp-2 min-h-[2rem] text-xs font-semibold leading-snug text-gray-900 dark:text-gray-100 sm:min-h-0 sm:truncate sm:text-sm">
          {task?.title ?? unavailableLabel}
        </span>
        {task && (
          <span className="mt-1 hidden truncate text-xs text-gray-500 dark:text-gray-400 sm:block">
            {task.moduleTitle}
          </span>
        )}
      </span>
      {!isPrevious && <span className={iconClassName}>{icon}</span>}
    </>
  );
  const className = cn(
    'group flex min-h-[5rem] min-w-0 items-center gap-2 px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset sm:min-h-0 sm:gap-3 sm:rounded-lg sm:border sm:px-4 sm:shadow-sm sm:focus-visible:ring-offset-2 sm:focus-visible:ring-offset-white dark:sm:focus-visible:ring-offset-gray-950',
    task
      ? 'hover:bg-blue-50/70 hover:text-blue-700 dark:hover:bg-blue-950/25 dark:hover:text-blue-200 sm:border-gray-200 sm:bg-white sm:hover:border-blue-300 dark:sm:border-gray-800 dark:sm:bg-gray-950 dark:sm:hover:border-blue-800'
      : 'cursor-not-allowed bg-gray-50 opacity-70 dark:bg-gray-900/35 sm:border-gray-200 sm:bg-gray-50 dark:sm:border-gray-800 dark:sm:bg-gray-900/50',
    isPrevious && 'border-r border-gray-200 dark:border-gray-800 sm:border-r',
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
    <Link href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`} className={className}>
      {content}
    </Link>
  );
}
