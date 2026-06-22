'use client';

import Link from 'next/link';
import { Bot, LoaderCircle, Reply, Trash2, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CommentNode } from '@/types';
import {
  countNestedReplies,
  formatDate,
  getLatestActivityDate,
  getThreadHref,
  hasStreamingComment,
  plainTextPreview,
} from './utils';

export function CommentThread({
  taskId,
  comment,
  streamingCommentIds,
  onDelete,
}: {
  taskId: string;
  comment: CommentNode;
  streamingCommentIds: Set<string>;
  onDelete: (commentId: string) => void;
}) {
  const isAi = comment.author === 'ai';
  const nestedReplyCount = countNestedReplies(comment);
  const latestActivity = getLatestActivityDate(comment);
  const hasStreamingReply = hasStreamingComment(comment, streamingCommentIds);
  const href = getThreadHref(taskId, comment.id);

  return (
    <article className={cn('rounded-lg border p-3', isAi ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/20' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950')}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-2">
          <span className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full', isAi ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-950')}>
            {isAi ? <Bot className="h-4 w-4" aria-hidden="true" /> : <UserRound className="h-4 w-4" aria-hidden="true" />}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-gray-950 dark:text-white">
                {isAi ? 'AI Assistant' : 'Bạn'}
              </span>
              {comment.model && (
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-900">
                  {comment.model}
                </span>
              )}
              {hasStreamingReply && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-200">
                  <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
                  Đang nhận
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-xs text-gray-500 dark:text-gray-400">
              {formatDate(comment.createdAt)}
              {latestActivity !== comment.createdAt ? ` · mới nhất ${formatDate(latestActivity)}` : ''}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          className="inline-flex h-8 shrink-0 items-center justify-center rounded-lg border border-red-200 px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-200"
          aria-label="Xóa thread"
          title="Xóa thread"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <Link
        href={href}
        className="mt-3 block rounded-md bg-white/72 p-3 transition hover:bg-gray-50 dark:bg-gray-950/45 dark:hover:bg-gray-900/80"
      >
        <p className="line-clamp-2 text-sm leading-6 text-gray-700 dark:text-gray-300">
          {comment.body ? plainTextPreview(comment.body) : 'AI đang soạn câu trả lời...'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          {nestedReplyCount > 0 && (
            <span className="rounded-full bg-gray-100 px-2 py-0.5 dark:bg-gray-900">
              {nestedReplyCount} trả lời
            </span>
          )}
          {isAi && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-950 dark:text-blue-200">
              Câu trả lời AI
            </span>
          )}
          <span>Mở thread để đọc và trả lời</span>
        </div>
      </Link>

      <div className="mt-3 flex justify-end">
        <Link
          href={href}
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
        >
          <Reply className="h-3.5 w-3.5" aria-hidden="true" />
          Mở thread
        </Link>
      </div>
    </article>
  );
}
