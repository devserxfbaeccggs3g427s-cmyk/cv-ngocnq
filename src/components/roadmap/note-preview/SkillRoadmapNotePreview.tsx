'use client';

import { useMemo, useRef } from 'react';
import { extractMarkdownHeadings, MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { MarkdownCommentThreads } from '@/components/roadmap/comments';
import type { TaskContext } from '@/types';
import { useNotePreviewData } from './useNotePreviewData';
import { useActiveHeading } from './useActiveHeading';
import { AppendixLinks, MobileAppendixDrawer } from './NotePreviewAppendix';
import { NoteLessonNavigation } from './NoteLessonNavigation';
import { MarkdownFileScrollControls } from './MarkdownFileScrollControls';

type NavigationTask = Pick<TaskContext, 'id' | 'title' | 'trackTitle' | 'moduleTitle'>;

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
  const { item, note, learnedNavigation } = useNotePreviewData(taskId, navigationTasks);
  const headings = useMemo(() => extractMarkdownHeadings(note), [note]);
  const activeHeadingId = useActiveHeading(headings);

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

  return (
    <div className="grid min-w-0 max-w-full gap-4 pb-32 sm:pb-20 lg:grid-cols-[320px_minmax(0,1fr)] lg:pb-0">
      {/* Sidebar */}
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

      {/* Main content */}
      <div className="min-w-0 space-y-4">
        <NoteLessonNavigation
          previous={learnedNavigation.previous}
          next={learnedNavigation.next}
        />

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

      {/* Mobile appendix drawer */}
      <MobileAppendixDrawer headings={headings} activeHeadingId={activeHeadingId} />

      {/* Scroll controls */}
      <MarkdownFileScrollControls
        onScrollTo={scrollMarkdownFileTo}
        hasAppendix={headings.length > 0}
      />
    </div>
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
