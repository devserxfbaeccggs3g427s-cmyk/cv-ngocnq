'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Brain,
  CheckCircle2,
  Circle,
  CircleHelp,
  Clock3,
  ExternalLink,
  FileText,
  Loader2,
  MessageSquareText,
  StickyNote,
  WandSparkles,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgressFile, TaskContext } from '@/types';
import {
  buildLearningPrompt,
  getTaskStudyState,
  levelStyles,
  shouldSyncProgressFile,
  storeProgress,
} from '@/lib/roadmap';
import { useAutoTaskNote } from '@/hooks';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { TaskPreviewComments } from './TaskPreviewComments';

interface TaskPreviewSlidePanelProps {
  task: TaskContext | null;
  progress: ProgressFile;
  onProgressChange?: Dispatch<SetStateAction<ProgressFile | null>>;
  onClose: () => void;
}

export function TaskPreviewSlidePanel({
  task,
  progress,
  onProgressChange,
  onClose,
}: TaskPreviewSlidePanelProps) {
  const [isDesktopPanel, setIsDesktopPanel] = useState(false);
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [aiRewriteOpen, setAiRewriteOpen] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [token, setToken] = useState('');
  const [aiRewriteStatus, setAiRewriteStatus] = useState<'idle' | 'rewriting' | 'saved' | 'error'>('idle');
  const [aiRewriteMessage, setAiRewriteMessage] = useState<string | null>(null);
  const { autoNoteStatus, autoNoteMessage, retryAutoNote } = useAutoTaskNote({
    task: onProgressChange ? task : null,
    progress,
    setProgress: onProgressChange ?? (() => undefined),
  });
  const item = task ? progress.items[task.id] ?? null : null;
  const note = item?.note?.trim() ?? '';
  const hasNote = Boolean(note);
  const canRewriteNote =
    Boolean(task) &&
    Boolean(onProgressChange) &&
    hasNote &&
    editInstruction.trim().length > 0 &&
    token.trim().length > 0 &&
    aiRewriteStatus !== 'rewriting';
  const effectivelyCompleted = task
    ? getTaskStudyState(task, progress).effectivelyCompleted
    : false;

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }

    if (task) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [task, onClose]);

  // Prevent body scroll when panel is open
  useEffect(() => {
    if (task) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [task]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 640px)');
    const syncPanelMode = () => setIsDesktopPanel(mediaQuery.matches);

    syncPanelMode();
    mediaQuery.addEventListener('change', syncPanelMode);
    return () => mediaQuery.removeEventListener('change', syncPanelMode);
  }, []);

  useEffect(() => {
    let cancelled = false;

    window.queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setIsCommentPanelOpen(false);
      setCommentCount(0);
      setAiRewriteOpen(false);
      setEditInstruction('');
      setToken('');
      setAiRewriteStatus('idle');
      setAiRewriteMessage(null);
    });

    return () => {
      cancelled = true;
    };
  }, [task?.id]);

  const handleCommentCountChange = useCallback((count: number) => {
    setCommentCount(count);
    if (count === 0) {
      setIsCommentPanelOpen(false);
    }
  }, []);

  async function handleAiRewriteNote() {
    if (!task || !onProgressChange || !canRewriteNote) {
      return;
    }

    setAiRewriteStatus('rewriting');
    setAiRewriteMessage('AI đang chỉnh sửa lại note...');

    try {
      const response = await fetch('/api/ai/task-note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'rewrite',
          token: token.trim(),
          task: {
            id: task.id,
            title: task.title,
            level: task.level,
            deliverable: task.deliverable,
          },
          learningPrompt: buildLearningPrompt(task),
          hasChildren: Boolean(task.children?.length),
          note,
          editInstruction: editInstruction.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        note?: unknown;
        error?: unknown;
      };

      if (!response.ok) {
        throw new Error(typeof payload.error === 'string' ? payload.error : 'Không chỉnh sửa được note bằng AI.');
      }

      const rewrittenNote = typeof payload.note === 'string' ? payload.note.trim() : '';

      if (!rewrittenNote) {
        throw new Error('AI không trả về note hợp lệ.');
      }

      const now = new Date().toISOString();
      const currentItem = progress.items[task.id];
      const hasChildren = Boolean(task.children?.length);
      const nextProgress: ProgressFile = {
        ...progress,
        updatedAt: now,
        items: {
          ...progress.items,
          [task.id]: {
            completed: hasChildren ? false : currentItem?.completed ?? true,
            completedAt: hasChildren ? null : currentItem?.completedAt ?? now,
            note: rewrittenNote,
            updatedAt: now,
          },
        },
      };

      onProgressChange(nextProgress);
      storeProgress(nextProgress);

      if (shouldSyncProgressFile) {
        const saveResponse = await fetch('/api/skill-roadmap/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: nextProgress.items }),
        });

        if (!saveResponse.ok) {
          throw new Error('Đã lưu note AI vào trình duyệt, nhưng không sync được vào file JSON local.');
        }

        const saved = (await saveResponse.json()) as ProgressFile;
        onProgressChange(saved);
        storeProgress(saved);
      }

      setEditInstruction('');
      setToken('');
      setAiRewriteStatus('saved');
      setAiRewriteMessage('Đã cập nhật note bằng AI.');
    } catch (error) {
      setAiRewriteStatus('error');
      setAiRewriteMessage(error instanceof Error ? error.message : 'Không chỉnh sửa được note bằng AI.');
    }
  }

  return (
    <AnimatePresence>
      {task && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-[var(--fg)]/40"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={isDesktopPanel ? { x: '100%', opacity: 0 } : { y: '100%', opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={isDesktopPanel ? { x: '100%', opacity: 0 } : { y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-x-0 bottom-0 z-50 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] sm:inset-x-auto sm:inset-y-0 sm:right-0 sm:max-h-none sm:max-w-2xl sm:rounded-none sm:border-y-0 sm:border-r-0 sm:border-l md:max-w-3xl lg:max-w-4xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Preview note: ${task.title}`}
          >
            <div className="flex justify-center pt-2 sm:hidden">
              <span className="h-1 w-10 rounded-full bg-[var(--line-strong)]" />
            </div>

            {/* Panel Header */}
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[var(--line)] px-4 py-4 sm:px-5 sm:py-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('badge', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
                    {task.level}
                  </span>
                  <span className="inline-flex items-center gap-1 text-base text-[var(--fg-muted)] sm:text-xs">
                    <Clock3 className="h-4 w-4 sm:h-3 sm:w-3" /> {task.estimateHours}h
                  </span>
                  {effectivelyCompleted ? (
                    <span className="inline-flex items-center gap-1 text-base font-semibold text-[var(--success)] sm:text-xs">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn thành
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-base font-semibold text-[var(--fg-muted)] sm:text-xs">
                      <Circle className="h-3.5 w-3.5" /> Chưa hoàn thành
                    </span>
                  )}
                </div>
                <h2 className="mt-2 font-serif text-2xl font-normal leading-snug text-[var(--fg)] [overflow-wrap:anywhere] sm:text-lg sm:leading-tight">
                  {task.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-base leading-7 text-[var(--fg-muted)] sm:text-xs sm:leading-normal">
                  {task.trackTitle} / {task.moduleTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="btn btn-ghost btn-sm shrink-0"
                aria-label="Đóng panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
              {/* Task info */}
              <div className="border-b border-[var(--line)] px-4 py-4 sm:px-5">
                <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--fg)] sm:text-sm">
                  <BookOpen className="h-4 w-4 text-[var(--accent)]" />
                  Kết quả cần có
                </h3>
                <p className="mt-2 text-lg leading-8 text-[var(--fg)] sm:text-sm sm:leading-relaxed">
                  {task.deliverable}
                </p>
              </div>

              {/* Note Preview */}
              <div className="px-4 py-4 sm:px-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-lg font-bold text-[var(--fg)] sm:text-sm">
                    <StickyNote
                      className={cn(
                        'h-4 w-4',
                        hasNote
                          ? 'text-[var(--warn)]'
                          : 'text-[var(--fg-subtle)]'
                      )}
                    />
                    Note ôn tập
                  </h3>
                  {hasNote && (
                    <Link
                      href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
                      className="link-editorial inline-flex min-h-12 shrink-0 items-center gap-1 sm:min-h-0 sm:px-0 sm:py-0 sm:text-xs"
                    >
                      Xem đầy đủ <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {hasNote ? (
                  <div className="space-y-3">
                    {onProgressChange && (
                      <div className="card">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="min-w-0">
                            <p className="text-lg font-bold text-[var(--fg)] sm:text-sm">Yêu cầu AI chỉnh sửa note</p>
                            <p className="mt-1 text-base leading-7 text-[var(--fg-muted)] sm:text-xs sm:leading-5">Viết lại note trong panel theo yêu cầu của bạn.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAiRewriteOpen((current) => !current)}
                            className="btn btn-secondary shrink-0"
                            aria-expanded={aiRewriteOpen}
                          >
                            <WandSparkles className="h-3.5 w-3.5" />
                            {aiRewriteOpen ? 'Ẩn' : 'Mở yêu cầu'}
                          </button>
                        </div>
                        {aiRewriteOpen && (
                          <div className="mt-3 space-y-3 border-t border-[var(--line)] pt-3">
                            <textarea
                              value={editInstruction}
                              onChange={(event) => setEditInstruction(event.target.value)}
                              rows={3}
                              placeholder="Ví dụ: rút gọn note, bổ sung ví dụ thực tế, làm rõ trade-off, thêm checklist ôn tập..."
                              className="input-modern w-full resize-y p-3 text-lg leading-8 sm:text-sm sm:leading-normal"
                            />
                            <div className="flex flex-col gap-2 sm:flex-row">
                              <input
                                type="password"
                                value={token}
                                onChange={(event) => setToken(event.target.value)}
                                placeholder="Nhập token (API key) để dùng AI"
                                className="input-modern min-h-14 flex-1 text-lg sm:min-h-10 sm:text-sm"
                              />
                              <button
                                type="button"
                                onClick={handleAiRewriteNote}
                                disabled={!canRewriteNote}
                                className="btn btn-primary"
                              >
                                {aiRewriteStatus === 'rewriting' ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <WandSparkles className="h-4 w-4" />
                                )}
                                Chỉnh bằng AI
                              </button>
                            </div>
                          </div>
                        )}
                        {aiRewriteMessage && (
                          <p
                            className={cn(
                              'mt-3 rounded-md border px-3 py-3 text-lg leading-8 sm:py-2 sm:text-sm sm:leading-normal',
                              aiRewriteStatus === 'saved'
                                ? 'border-[var(--success)] bg-[var(--surface-2)] text-[var(--success)]'
                                : aiRewriteStatus === 'error'
                                  ? 'border-[var(--warn)] bg-[var(--surface-2)] text-[var(--warn)]'
                                  : 'border-[var(--line)] bg-[var(--surface-2)] text-[var(--fg-muted)]'
                            )}
                          >
                            {aiRewriteStatus === 'rewriting' && (
                              <Loader2 className="mr-1.5 inline h-3.5 w-3.5 animate-spin align-[-2px]" />
                            )}
                            {aiRewriteMessage}
                          </p>
                        )}
                      </div>
                    )}
                    <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-2)] p-3 sm:p-4">
                      <MarkdownPreview content={note} enableBookReader bookReaderTitle={`${task.id}.md`} />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)] py-12">
                    <FileText className="mb-2 h-8 w-8 text-[var(--fg-subtle)]" />
                    <p className="text-lg text-[var(--fg-muted)] sm:text-sm">
                      {autoNoteStatus === 'generating'
                        ? 'Đang tự động sinh note ôn tập...'
                        : 'Task này chưa có note ôn tập.'}
                    </p>
                    <p className="mt-1 text-base text-[var(--fg-subtle)] sm:text-xs">
                      Hoàn thành task và viết note để review sau.
                    </p>
                    {autoNoteStatus !== 'idle' && autoNoteMessage && (
                      <div className="mt-4 max-w-md rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] px-3 py-3 text-center text-base leading-7 text-[var(--fg-muted)] sm:py-2 sm:text-xs sm:leading-normal">
                        {autoNoteMessage}
                        {!hasNote && (autoNoteStatus === 'skipped' || autoNoteStatus === 'error') && (
                          <button
                            type="button"
                            onClick={retryAutoNote}
                            className="link-editorial ml-2 font-semibold"
                          >
                            Thử lại
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Completion info */}
              {item?.completedAt && (
                <div className="border-t border-[var(--line)] px-4 py-3 sm:px-5">
                  <p className="text-base text-[var(--fg-muted)] sm:text-xs">
                    Hoàn thành:{' '}
                    <span className="font-medium text-[var(--fg)]">
                      {new Intl.DateTimeFormat('vi-VN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(item.completedAt))}
                    </span>
                  </p>
                </div>
              )}
            </div>

            <TaskPreviewComments
              taskId={task.id}
              isOpen={isCommentPanelOpen}
              onCommentCountChange={handleCommentCountChange}
            />

            {/* Panel Footer */}
            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-[var(--line)] px-4 py-3 sm:flex sm:flex-wrap sm:items-center sm:px-5">
              <Link
                href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`}
                className="btn btn-secondary"
              >
                <BookOpen className="h-3.5 w-3.5" /> Chi tiết
              </Link>
              <Link
                href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
                className="btn btn-secondary"
              >
                <FileText className="h-3.5 w-3.5" /> Note đầy đủ
              </Link>
              <Link
                href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}/flashcards`}
                className="btn btn-secondary"
              >
                <Brain className="h-3.5 w-3.5" /> Flashcard
              </Link>
              <Link
                href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}/quiz`}
                className="btn btn-secondary"
              >
                <CircleHelp className="h-3.5 w-3.5" /> Trắc nghiệm
              </Link>
              {commentCount > 0 && (
                <button
                  type="button"
                  onClick={() => setIsCommentPanelOpen((current) => !current)}
                  className="btn btn-secondary"
                  aria-expanded={isCommentPanelOpen}
                >
                  <MessageSquareText className="h-3.5 w-3.5" />
                  {isCommentPanelOpen ? 'Ẩn bình luận' : 'Bình luận'}
                  <span className="badge badge-ghost ml-1">
                    {commentCount}
                  </span>
                </button>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
