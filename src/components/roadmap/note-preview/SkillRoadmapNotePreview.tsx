'use client';

import { useMemo, useRef } from 'react';
import { extractMarkdownHeadings, MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { MarkdownCommentThreads } from '@/components/roadmap/comments';
import type { TaskContext } from '@/types';
import { getAdjacentLeafTasks, getTaskStudyState } from '@/lib/roadmap';
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
  const { item, note, progress } = useNotePreviewData(taskId);
  const effectivelyCompleted = task && progress
    ? getTaskStudyState(task, progress).effectivelyCompleted
    : Boolean(item?.completed);
  const leafNavigation = useMemo(
    () => getAdjacentLeafTasks(taskId, navigationTasks),
    [navigationTasks, taskId]
  );
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
      <aside className="card min-w-0 p-4 text-sm lg:sticky lg:top-24 lg:flex lg:max-h-[calc(100vh-7rem)] lg:flex-col lg:self-start">
        <h2 className="font-serif text-base font-normal text-[var(--fg)]">Thông tin task</h2>
        <dl className="mt-3 grid gap-3 text-[var(--fg-muted)] sm:grid-cols-2 lg:block lg:space-y-3">
          <div>
            <dt className="eyebrow">ID</dt>
            <dd className="mt-1 break-all font-mono text-xs">{taskId}</dd>
          </div>
          <div>
            <dt className="eyebrow">Track</dt>
            <dd className="mt-1">{task?.trackTitle ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="eyebrow">Module</dt>
            <dd className="mt-1">{task?.moduleTitle ?? 'N/A'}</dd>
          </div>
          <div>
            <dt className="eyebrow">Trạng thái</dt>
            <dd className="mt-1">{effectivelyCompleted ? 'Đã hoàn thành' : 'Chưa hoàn thành'}</dd>
          </div>
          <div>
            <dt className="eyebrow">Cập nhật</dt>
            <dd className="mt-1">{formatDate(item?.updatedAt ?? null)}</dd>
          </div>
        </dl>

        {headings.length > 0 && (
          <nav className="mt-5 hidden min-h-0 border-t border-[var(--line)] pt-4 lg:flex lg:flex-1 lg:flex-col" aria-label="Phụ lục">
            <div className="flex items-center justify-between gap-3">
              <span className="eyebrow">Phụ lục</span>
              <span className="badge badge-ghost">
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
          previous={leafNavigation.previous}
          next={leafNavigation.next}
          ariaLabel="Điều hướng note task con thấp nhất"
        />

        <article
          ref={markdownArticleRef}
          className="card min-w-0 max-w-full overflow-hidden"
        >
          <div className="min-w-0 overflow-hidden text-ellipsis border-b border-[var(--line)] px-4 py-3 font-mono text-sm text-[var(--fg-muted)]">
            {taskId}.md
          </div>
          <div className="min-w-0 max-w-full overflow-hidden p-4 sm:p-5">
            <MarkdownPreview content={note} enableBookReader bookReaderTitle={`${taskId}.md`} />
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
