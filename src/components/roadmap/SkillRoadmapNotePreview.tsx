'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowDownToLine, ArrowUpToLine, ChevronLeft, ChevronRight, ListTree, X } from 'lucide-react';
import { extractMarkdownHeadings, MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import type { MarkdownHeading } from '@/components/markdown/MarkdownPreview';
import { MarkdownCommentThreads } from '@/components/roadmap/MarkdownCommentThreads';
import { cn } from '@/lib/utils';

type ProgressItem = {
  completed: boolean;
  note: string;
  completedAt: string | null;
  updatedAt: string;
};

type ProgressFile = {
  updatedAt: string | null;
  items: Record<string, ProgressItem>;
};

type TaskContext = {
  id: string;
  title: string;
  level: string;
  estimateHours: number;
  deliverable: string;
  trackTitle: string;
  moduleTitle: string;
  depth: number;
};

type NavigationTask = Pick<TaskContext, 'id' | 'title' | 'trackTitle' | 'moduleTitle'>;

const progressStorageKey = 'skill-roadmap-progress:v1';
const commentsStorageKey = 'skill-roadmap-note-comments:v1';
const activeHeadingOffset = 120;

export function SkillRoadmapNotePreview({
  taskId,
  task,
  navigationTasks = [],
}: {
  taskId: string;
  task?: TaskContext;
  navigationTasks?: NavigationTask[];
}) {
  const markdownArticleRef = useRef<HTMLElement | null>(null);
  const [progress, setProgress] = useState<ProgressFile | null>(null);
  const [appendixOpen, setAppendixOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let hasLocalProgress = false;

    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      hasLocalProgress = raw !== null;
      const storedProgress = raw ? (JSON.parse(raw) as ProgressFile) : null;
      window.queueMicrotask(() => setProgress(storedProgress));
    } catch {
      window.queueMicrotask(() => setProgress(null));
    }

    async function hydrateMissingSeedData() {
      if (hasLocalProgress && hasStoredComments()) {
        return;
      }

      try {
        const response = await fetch('/api/skill-roadmap/progress', {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const seed = await response.json();

        if (cancelled) {
          return;
        }

        if (!hasLocalProgress) {
          const seedProgress = normalizeSeedProgress(seed);

          if (seedProgress) {
            setProgress(seedProgress);
            storeProgress(seedProgress);
          }
        }

        if (!hasStoredComments()) {
          storeSeedComments(seed);
        }
      } catch {
        // The page can still render browser-local data only.
      }
    }

    hydrateMissingSeedData();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const item = progress?.items?.[taskId] ?? null;
  const note = item?.note?.trim() ?? '';
  const headings = useMemo(() => extractMarkdownHeadings(note), [note]);
  const headingIds = useMemo(() => headings.map((heading) => heading.id).join('|'), [headings]);
  const learnedNavigation = useMemo(() => {
    const currentIndex = navigationTasks.findIndex((navigationTask) => navigationTask.id === taskId);

    if (!progress || currentIndex < 0) {
      return {
        previous: null,
        next: null,
      };
    }

    return {
      previous:
        navigationTasks
          .slice(0, currentIndex)
          .reverse()
          .find((navigationTask) => progress.items[navigationTask.id]?.completed) ?? null,
      next:
        navigationTasks
          .slice(currentIndex + 1)
          .find((navigationTask) => progress.items[navigationTask.id]?.completed) ?? null,
    };
  }, [navigationTasks, progress, taskId]);

  function scrollMarkdownFileTo(position: 'start' | 'end') {
    const article = markdownArticleRef.current;

    if (!article) {
      return;
    }

    const articleTop = article.getBoundingClientRect().top + window.scrollY;
    const targetTop =
      position === 'start'
        ? articleTop - 96
        : articleTop + article.offsetHeight - window.innerHeight + 24;

    window.scrollTo({
      top: Math.max(0, targetTop),
      behavior: 'smooth',
    });
  }

  useEffect(() => {
    if (!headings.length) {
      window.queueMicrotask(() => setActiveHeadingId(null));
      return;
    }

    let frameId = 0;

    const updateActiveHeading = () => {
      frameId = 0;

      const headingElements = headings
        .map((heading) => document.getElementById(heading.id))
        .filter((element): element is HTMLElement => Boolean(element));

      if (!headingElements.length) {
        setActiveHeadingId(null);
        return;
      }

      const current =
        headingElements.findLast((element) => element.getBoundingClientRect().top <= activeHeadingOffset) ??
        headingElements[0];

      setActiveHeadingId(current.id);
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveHeading);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [headingIds, headings]);

  return (
    <div className="grid min-w-0 max-w-full gap-4 pb-32 sm:pb-20 lg:grid-cols-[320px_minmax(0,1fr)] lg:pb-0">
      <aside className="min-w-0 rounded-lg border border-gray-200 bg-white p-4 text-sm shadow-sm dark:border-gray-800 dark:bg-gray-950 lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col lg:self-start">
        <h2 className="font-bold text-gray-950 dark:text-white">Thông tin task</h2>
        <dl className="mt-3 grid gap-3 text-gray-600 dark:text-gray-300 sm:grid-cols-2 lg:block lg:space-y-3">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">ID</dt>
            <dd className="mt-1 break-all font-mono text-xs">{taskId}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Track</dt>
            <dd className="mt-1">{task?.trackTitle ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Module</dt>
            <dd className="mt-1">{task?.moduleTitle ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Trạng thái</dt>
            <dd className="mt-1">{item?.completed ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-gray-400">Cập nhật</dt>
            <dd className="mt-1">{formatDate(item?.updatedAt ?? null)}</dd>
          </div>
        </dl>

        {headings.length > 0 && (
          <nav className="mt-5 hidden min-h-0 border-t border-gray-200 pt-4 dark:border-gray-800 lg:flex lg:flex-1 lg:flex-col" aria-label="Phụ lục">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400">Phụ lục</h3>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-500 dark:bg-gray-900 dark:text-gray-400">
                {headings.length} mục
              </span>
            </div>
            <AppendixLinks
              headings={headings}
              activeHeadingId={activeHeadingId}
              className="mt-3 min-h-0 overflow-y-auto overscroll-contain pr-1"
            />
          </nav>
        )}

      </aside>

      <div className="min-w-0 space-y-4">
        <NoteLessonNavigation previous={learnedNavigation.previous} next={learnedNavigation.next} />

        <article
          ref={markdownArticleRef}
          className="min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950"
        >
          <div className="min-w-0 overflow-hidden text-ellipsis border-b border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-200">
            {taskId}.md
          </div>
          <div className="min-w-0 max-w-full overflow-hidden p-4 sm:p-5">
            <MarkdownPreview content={note} />
          </div>
        </article>

        <MarkdownCommentThreads taskId={taskId} markdown={note} />
      </div>

      {headings.length > 0 && (
        <>
          <button
            type="button"
            onClick={() => setAppendixOpen(true)}
            className="fixed bottom-28 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-gray-950/20 transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 sm:bottom-4 lg:hidden"
            aria-haspopup="dialog"
            aria-expanded={appendixOpen}
          >
            <ListTree className="h-4 w-4" aria-hidden="true" />
            Phụ lục
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs dark:bg-gray-950/10">
              {headings.length}
            </span>
          </button>

          {appendixOpen && (
            <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Phụ lục">
              <button
                type="button"
                className="absolute inset-0 bg-gray-950/45"
                onClick={() => setAppendixOpen(false)}
                aria-label="Đóng phụ lục"
              />
              <div className="absolute inset-x-0 bottom-0 max-h-[76vh] rounded-t-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
                <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
                  <div>
                    <h3 className="font-semibold text-gray-950 dark:text-white">Phụ lục</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{headings.length} mục trong note</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAppendixOpen(false)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                    aria-label="Đóng phụ lục"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
                <AppendixLinks
                  headings={headings}
                  activeHeadingId={activeHeadingId}
                  className="max-h-[calc(76vh-4.5rem)] overflow-y-auto overscroll-contain p-4"
                  onNavigate={() => setAppendixOpen(false)}
                />
              </div>
            </div>
          )}
        </>
      )}

      <MarkdownFileScrollControls onScrollTo={scrollMarkdownFileTo} hasAppendix={headings.length > 0} />
    </div>
  );
}

function MarkdownFileScrollControls({
  onScrollTo,
  hasAppendix,
}: {
  onScrollTo: (position: 'start' | 'end') => void;
  hasAppendix: boolean;
}) {
  return (
    <div
      className={cn(
        'fixed z-40 flex overflow-hidden rounded-full border border-gray-200 bg-white/95 p-1 shadow-xl shadow-gray-950/15 backdrop-blur dark:border-gray-800 dark:bg-gray-950/95 lg:right-6 lg:flex-col',
        hasAppendix
          ? 'bottom-44 right-4 sm:bottom-20 sm:right-4 lg:bottom-6'
          : 'bottom-24 right-4 sm:bottom-4 lg:bottom-6'
      )}
      aria-label="Cuộn nhanh file Markdown"
    >
      <MarkdownFileScrollButton
        icon={ArrowUpToLine}
        label="Đầu file"
        onClick={() => onScrollTo('start')}
      />
      <div className="my-2 hidden h-px bg-gray-200 dark:bg-gray-800 lg:block" aria-hidden="true" />
      <div className="mx-1 w-px bg-gray-200 dark:bg-gray-800 lg:hidden" aria-hidden="true" />
      <MarkdownFileScrollButton
        icon={ArrowDownToLine}
        label="Cuối file"
        onClick={() => onScrollTo('end')}
      />
    </div>
  );
}

function MarkdownFileScrollButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ArrowUpToLine;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full text-gray-600 transition hover:bg-blue-50 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:text-gray-300 dark:hover:bg-blue-950/35 dark:hover:text-blue-200"
    >
      <Icon className="h-5 w-5 transition group-hover:scale-105" aria-hidden="true" />
    </button>
  );
}

function NoteLessonNavigation({
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
  const unavailableLabel = isPrevious
    ? 'Không có bài trước'
    : 'Không có bài sau';
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
      {isPrevious && (
        <span className={iconClassName}>
          {icon}
        </span>
      )}
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
      {!isPrevious && (
        <span className={iconClassName}>
          {icon}
        </span>
      )}
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

function AppendixLinks({
  headings,
  activeHeadingId,
  className,
  onNavigate,
}: {
  headings: MarkdownHeading[];
  activeHeadingId?: string | null;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <ol className={`space-y-1 ${className ?? ''}`}>
      {headings.map((heading) => (
        <li key={heading.id} style={{ paddingLeft: `${Math.max(0, heading.level - 1) * 0.65}rem` }}>
          <a
            href={`#${heading.id}`}
            onClick={onNavigate}
            aria-current={activeHeadingId === heading.id ? 'location' : undefined}
            className={cn(
              'block rounded-md border-l-2 border-transparent px-2 py-1.5 text-sm font-medium leading-snug text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white',
              activeHeadingId === heading.id &&
                'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200'
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

function normalizeSeedProgress(input: unknown): ProgressFile | null {
  if (!isRecord(input)) {
    return null;
  }

  const value = isRecord(input.progress) ? input.progress : input;
  const rawItems = isRecord(value.items) ? value.items : null;

  if (!rawItems) {
    return null;
  }

  const items: Record<string, ProgressItem> = {};

  for (const [taskId, rawItem] of Object.entries(rawItems)) {
    if (!isRecord(rawItem)) {
      return null;
    }

    items[taskId] = {
      completed: Boolean(rawItem.completed),
      note: typeof rawItem.note === 'string' ? rawItem.note : '',
      completedAt: typeof rawItem.completedAt === 'string' ? rawItem.completedAt : null,
      updatedAt: typeof rawItem.updatedAt === 'string' ? rawItem.updatedAt : new Date().toISOString(),
    };
  }

  return {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items,
  };
}

function storeProgress(progress: ProgressFile) {
  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    // The in-memory note preview still works if localStorage is unavailable.
  }
}

function hasStoredComments() {
  try {
    return window.localStorage.getItem(commentsStorageKey) !== null;
  } catch {
    return false;
  }
}

function storeSeedComments(seed: unknown) {
  if (!isRecord(seed) || !isRecord(seed.comments)) {
    return;
  }

  try {
    window.localStorage.setItem(commentsStorageKey, JSON.stringify(seed.comments));
  } catch {
    // Comments can still be imported manually if localStorage is unavailable.
  }
}

function formatDate(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
