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
    <article className={cn(
      'rounded-[var(--radius-card)] border p-3',
      isAi ? 'border-[var(--line-strong)] bg-[var(--surface-2)]' : 'border-[var(--line)] bg-[var(--surface)]'
    )}>
      <div className="flex min-w-0 items-start justify-between gap-3">
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-2">
          <span className={cn(
            'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
            isAi ? 'bg-[var(--fg)] text-[var(--bg)]' : 'border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--fg-muted)]'
          )}>
            {isAi ? <Bot className="h-4 w-4" aria-hidden="true" /> : <UserRound className="h-4 w-4" aria-hidden="true" />}
          </span>
          <span className="min-w-0">
            <span className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-[var(--fg)]">
                {isAi ? 'AI Assistant' : 'Bạn'}
              </span>
              {comment.model && (
                <span className="badge">
                  {comment.model}
                </span>
              )}
              {hasStreamingReply && (
                <span className="badge badge-ghost">
                  <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
                  Đang nhận
                </span>
              )}
            </span>
            <span className="mt-0.5 block text-xs text-[var(--fg-muted)]">
              {formatDate(comment.createdAt)}
              {latestActivity !== comment.createdAt ? ` · mới nhất ${formatDate(latestActivity)}` : ''}
            </span>
          </span>
        </Link>
        <button
          type="button"
          onClick={() => onDelete(comment.id)}
          className="btn btn-ghost btn-sm shrink-0"
          aria-label="Xóa thread"
          title="Xóa thread"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>

      <Link
        href={href}
        className="mt-3 block rounded-md bg-[var(--surface-2)] p-3 transition hover:bg-[var(--surface)]"
      >
        <p className="line-clamp-2 text-sm leading-6 text-[var(--fg-muted)]">
          {comment.body ? plainTextPreview(comment.body) : 'AI đang soạn câu trả lời...'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold text-[var(--fg-muted)]">
          {nestedReplyCount > 0 && (
            <span className="badge badge-ghost">
              {nestedReplyCount} trả lời
            </span>
          )}
          {isAi && (
            <span className="badge">
              Câu trả lời AI
            </span>
          )}
          <span>Mở thread để đọc và trả lời</span>
        </div>
      </Link>

      <div className="mt-3 flex justify-end">
        <Link
          href={href}
          className="btn btn-ghost btn-sm"
        >
          <Reply className="h-3.5 w-3.5" aria-hidden="true" />
          Mở thread
        </Link>
      </div>
    </article>
  );
}
