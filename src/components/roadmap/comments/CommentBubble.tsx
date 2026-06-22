'use client';

import type { FormEvent } from 'react';
import {
  Bot,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  Reply,
  Trash2,
  UserRound,
} from 'lucide-react';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { cn } from '@/lib/utils';
import type { CommentNode } from '@/types';
import {
  type CommentDraft,
  countNestedReplies,
  formatDate,
  getLatestActivityDate,
  hasStreamingComment,
  isLongComment,
  plainTextPreview,
  visibleReplyPreviewCount,
} from './utils';
import { CommentForm } from './CommentForm';

export function CommentBubble({
  comment,
  depth,
  replyingTo,
  getDraft,
  submittingKey,
  streamingCommentIds,
  expandedCommentIds,
  openThreadIds,
  expandedReplyGroupIds,
  showThreadToggle = true,
  onReply,
  onDelete,
  onToggleExpanded,
  onToggleThread,
  onToggleReplyGroup,
  onCancelReply,
  onDraftChange,
  onSubmit,
}: {
  comment: CommentNode;
  depth: number;
  replyingTo: string | null;
  getDraft: (key: string) => CommentDraft;
  submittingKey: string | null;
  streamingCommentIds: Set<string>;
  expandedCommentIds: Set<string>;
  openThreadIds: Set<string>;
  expandedReplyGroupIds: Set<string>;
  showThreadToggle?: boolean;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onToggleExpanded: (commentId: string) => void;
  onToggleThread: (commentId: string) => void;
  onToggleReplyGroup: (commentId: string) => void;
  onCancelReply: (commentId: string) => void;
  onDraftChange: (key: string, update: Partial<CommentDraft>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, parentId: string | null) => void;
}) {
  const isAi = comment.author === 'ai';
  const compactDepth = Math.min(depth, 4);
  const draft = getDraft(comment.id);
  const isSubmitting = submittingKey === comment.id;
  const isStreaming = streamingCommentIds.has(comment.id);
  const isLong = isLongComment(comment.body);
  const isExpanded = expandedCommentIds.has(comment.id);
  const nestedReplyCount = countNestedReplies(comment);
  const latestActivity = getLatestActivityDate(comment);
  const hasStreamingReply = hasStreamingComment(comment, streamingCommentIds);
  const isThreadOpen = depth > 0 || openThreadIds.has(comment.id) || replyingTo === comment.id || hasStreamingReply;
  const isReplyGroupExpanded = expandedReplyGroupIds.has(comment.id);
  const visibleReplies =
    depth === 0 && !isReplyGroupExpanded
      ? comment.children.slice(Math.max(comment.children.length - visibleReplyPreviewCount, 0))
      : comment.children;
  const hiddenReplyCount = Math.max(comment.children.length - visibleReplies.length, 0);

  return (
    <div className={cn(depth > 0 && 'border-l border-gray-200 pl-3 dark:border-gray-800')} style={{ marginLeft: `${compactDepth * 0.4}rem` }}>
      <article className={cn('rounded-lg border p-3', isAi ? 'border-blue-200 bg-blue-50/70 dark:border-blue-900/60 dark:bg-blue-950/20' : 'border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950')}>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn('inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full', isAi ? 'bg-blue-600 text-white' : 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-950')}>
              {isAi ? <Bot className="h-4 w-4" aria-hidden="true" /> : <UserRound className="h-4 w-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-gray-950 dark:text-white">
                  {isAi ? 'AI Assistant' : 'Bạn'}
                </h3>
                {comment.model && (
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-blue-200 dark:bg-blue-950 dark:text-blue-200 dark:ring-blue-900">
                    {comment.model}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {formatDate(comment.createdAt)}
                {depth === 0 && latestActivity !== comment.createdAt ? ` · mới nhất ${formatDate(latestActivity)}` : ''}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {depth === 0 && showThreadToggle && (
              <button
                type="button"
                onClick={() => onToggleThread(comment.id)}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
                aria-expanded={isThreadOpen}
              >
                {isThreadOpen ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
                {isThreadOpen ? 'Thu gọn' : 'Mở'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-gray-200 px-2.5 text-xs font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
            >
              <Reply className="h-3.5 w-3.5" aria-hidden="true" />
              Trả lời
            </button>
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="inline-flex h-8 items-center justify-center rounded-lg border border-red-200 px-2.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 hover:text-red-700 dark:border-red-900/70 dark:text-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-200"
              aria-label="Xóa comment"
              title="Xóa comment"
            >
              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {depth === 0 && !isThreadOpen ? (
          <button
            type="button"
            onClick={() => onToggleThread(comment.id)}
            className="mt-3 block w-full rounded-md bg-white/72 p-3 text-left transition hover:bg-gray-50 dark:bg-gray-950/45 dark:hover:bg-gray-900/80"
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
              <span>Mở thread để đọc chi tiết</span>
            </div>
          </button>
        ) : (
          <div className="mt-3 rounded-md bg-white/72 dark:bg-gray-950/45">
            <div
              className={cn(
                'relative overflow-hidden p-3',
                isLong && !isExpanded && 'max-h-72'
              )}
            >
              {comment.body ? (
                <MarkdownPreview content={comment.body} />
              ) : (
                <div className="flex items-center gap-2 py-2 text-sm font-medium text-blue-700 dark:text-blue-300">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  AI đang soạn câu trả lời...
                </div>
              )}
              {isStreaming && comment.body && (
                <span className="mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Đang nhận nội dung
                </span>
              )}
              {isLong && !isExpanded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-white dark:to-gray-950" />
              )}
            </div>
            {isLong && (
              <div className="border-t border-gray-200 px-3 py-2 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => onToggleExpanded(comment.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 transition hover:text-blue-800 dark:text-blue-300 dark:hover:text-blue-200"
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
                      Thu gọn
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
                      {isAi ? 'Mở câu trả lời AI' : 'Xem thêm nội dung Markdown'}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </article>

      {isThreadOpen && replyingTo === comment.id && (
        <div className="mt-3">
          <CommentForm
            draft={draft}
            isSubmitting={isSubmitting}
            submitLabel="Trả lời"
            onSubmit={(event) => onSubmit(event, comment.id)}
            onChange={(update) => onDraftChange(comment.id, update)}
            onCancel={() => onCancelReply(comment.id)}
          />
        </div>
      )}

      {isThreadOpen && comment.children.length > 0 && (
        <div className="mt-3 space-y-3">
          {hiddenReplyCount > 0 && (
            <button
              type="button"
              onClick={() => onToggleReplyGroup(comment.id)}
              className="ml-3 inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
              aria-expanded={isReplyGroupExpanded}
            >
              <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              Xem thêm {hiddenReplyCount} trả lời cũ hơn
            </button>
          )}

          {visibleReplies.map((reply) => (
            <CommentBubble
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              replyingTo={replyingTo}
              getDraft={getDraft}
              submittingKey={submittingKey}
              streamingCommentIds={streamingCommentIds}
              expandedCommentIds={expandedCommentIds}
              openThreadIds={openThreadIds}
              expandedReplyGroupIds={expandedReplyGroupIds}
              showThreadToggle={showThreadToggle}
              onReply={onReply}
              onDelete={onDelete}
              onToggleExpanded={onToggleExpanded}
              onToggleThread={onToggleThread}
              onToggleReplyGroup={onToggleReplyGroup}
              onCancelReply={onCancelReply}
              onDraftChange={onDraftChange}
              onSubmit={onSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
