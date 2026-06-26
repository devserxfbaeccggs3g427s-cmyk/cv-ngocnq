'use client';

import { useEffect, useState, useMemo } from 'react';
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
  StickyNote,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProgressFile, TaskContext } from '@/types';
import { getTaskStudyState, levelStyles } from '@/lib/roadmap';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';

interface TaskPreviewSlidePanelProps {
  task: TaskContext | null;
  progress: ProgressFile;
  onClose: () => void;
}

export function TaskPreviewSlidePanel({
  task,
  progress,
  onClose,
}: TaskPreviewSlidePanelProps) {
  const item = task ? progress.items[task.id] ?? null : null;
  const note = item?.note?.trim() ?? '';
  const hasNote = Boolean(note);
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
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[90vw] flex-col border-l border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950 sm:max-w-2xl md:max-w-3xl lg:max-w-4xl"
            role="dialog"
            aria-modal="true"
            aria-label={`Preview note: ${task.title}`}
          >
            {/* Panel Header */}
            <div className="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'inline-block rounded-full px-2 py-0.5 text-[11px] font-bold',
                      levelStyles[task.level] ?? levelStyles['Trung cấp']
                    )}
                  >
                    {task.level}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock3 className="h-3 w-3" /> {task.estimateHours}h
                  </span>
                  {effectivelyCompleted ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> Đã hoàn thành
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400">
                      <Circle className="h-3.5 w-3.5" /> Chưa hoàn thành
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-lg font-bold leading-tight text-gray-950 [overflow-wrap:anywhere] dark:text-white">
                  {task.title}
                </h2>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {task.trackTitle} → {task.moduleTitle}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-gray-700 dark:text-gray-400 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
                aria-label="Đóng panel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Panel Body */}
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain">
              {/* Task info */}
              <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800/60">
                <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
                  <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  Kết quả cần có
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  {task.deliverable}
                </p>
              </div>

              {/* Note Preview */}
              <div className="flex min-h-0 flex-1 flex-col px-5 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-200">
                    <StickyNote
                      className={cn(
                        'h-4 w-4',
                        hasNote
                          ? 'text-amber-500 dark:text-amber-400'
                          : 'text-gray-400'
                      )}
                    />
                    Note ôn tập
                  </h3>
                  {hasNote && (
                    <Link
                      href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
                      className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-blue-600 transition hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
                    >
                      Xem đầy đủ <ExternalLink className="h-3 w-3" />
                    </Link>
                  )}
                </div>

                {hasNote ? (
                  <div className="rounded-lg border border-gray-200 bg-gray-50/50 p-4 dark:border-gray-800 dark:bg-gray-900/50">
                    <MarkdownPreview content={note} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center rounded-lg border border-dashed border-gray-300 bg-gray-50/50 py-12 dark:border-gray-700 dark:bg-gray-900/30">
                    <FileText className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Task này chưa có note ôn tập.
                    </p>
                    <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      Hoàn thành task và viết note để review sau.
                    </p>
                  </div>
                )}
              </div>

              {/* Completion info */}
              {item?.completedAt && (
                <div className="border-t border-gray-100 px-5 py-3 dark:border-gray-800/60">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Hoàn thành:{' '}
                    <span className="font-medium text-gray-700 dark:text-gray-200">
                      {new Intl.DateTimeFormat('vi-VN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      }).format(new Date(item.completedAt))}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Panel Footer */}
            <div className="flex shrink-0 flex-wrap items-center gap-2 border-t border-gray-200 px-5 py-3 dark:border-gray-800">
              <Link
                href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
              >
                <BookOpen className="h-3.5 w-3.5" /> Chi tiết
              </Link>
              <Link
                href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
              >
                <FileText className="h-3.5 w-3.5" /> Note đầy đủ
              </Link>
              <Link
                href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}/flashcards`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:border-violet-400 dark:border-violet-900/70 dark:text-violet-300 dark:hover:border-violet-600"
              >
                <Brain className="h-3.5 w-3.5" /> Flashcard
              </Link>
              <Link
                href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}/quiz`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 px-3 py-2 text-xs font-semibold text-cyan-700 transition hover:border-cyan-400 dark:border-cyan-900/70 dark:text-cyan-300 dark:hover:border-cyan-600"
              >
                <CircleHelp className="h-3.5 w-3.5" /> Trắc nghiệm
              </Link>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
