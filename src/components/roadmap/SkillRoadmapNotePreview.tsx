'use client';

import { useEffect, useMemo, useState } from 'react';
import { ListTree, X } from 'lucide-react';
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

const progressStorageKey = 'skill-roadmap-progress:v1';
const activeHeadingOffset = 120;

export function SkillRoadmapNotePreview({
  taskId,
  task,
}: {
  taskId: string;
  task?: TaskContext;
}) {
  const [item, setItem] = useState<ProgressItem | null>(null);
  const [appendixOpen, setAppendixOpen] = useState(false);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      const progress = raw ? (JSON.parse(raw) as ProgressFile) : null;
      window.queueMicrotask(() => setItem(progress?.items?.[taskId] ?? null));
    } catch {
      window.queueMicrotask(() => setItem(null));
    }
  }, [taskId]);

  const note = item?.note?.trim() ?? '';
  const headings = useMemo(() => extractMarkdownHeadings(note), [note]);
  const headingIds = useMemo(() => headings.map((heading) => heading.id).join('|'), [headings]);

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
    <div className="grid min-w-0 max-w-full gap-4 pb-20 lg:grid-cols-[320px_minmax(0,1fr)] lg:pb-0">
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
        <article className="min-w-0 max-w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
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
            className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-gray-950/20 transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 lg:hidden"
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
    </div>
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

function formatDate(value: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
