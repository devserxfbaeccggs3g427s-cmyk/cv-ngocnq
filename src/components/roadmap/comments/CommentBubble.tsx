'use client';

import type { FormEvent } from 'react';
import { useState } from 'react';
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
  splitAiReasoning,
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
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  const compactDepth = Math.min(depth, 4);
  const draft = getDraft(comment.id);
  const isSubmitting = submittingKey === comment.id;
  const isStreaming = streamingCommentIds.has(comment.id);
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
  const aiContent = isAi
    ? splitAiReasoning(comment.body)
    : { reasoning: '', answer: comment.body, hasOpenReasoning: false };
  const hasAiReasoning = isAi && Boolean(aiContent.reasoning);
  const displayBody = hasAiReasoning ? aiContent.answer : comment.body;
  const isLong = isLongComment(displayBody);

  return (
    <div className={cn(depth > 0 && 'border-l border-[var(--line)] pl-3')} style={{ marginLeft: `${compactDepth * 0.4}rem` }}>
      <article className={cn(
        'rounded-[var(--radius-card)] border p-4 sm:p-3',
        isAi ? 'border-[var(--line-strong)] bg-[var(--surface-2)]' : 'border-[var(--line)] bg-[var(--surface)]'
      )}>
        <div className="flex min-w-0 items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className={cn(
              'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full sm:h-8 sm:w-8',
              isAi ? 'bg-[var(--fg)] text-[var(--bg)]' : 'border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--fg-muted)]'
            )}>
              {isAi ? <Bot className="h-4 w-4" aria-hidden="true" /> : <UserRound className="h-4 w-4" aria-hidden="true" />}
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-lg font-bold text-[var(--fg)] sm:text-sm">
                  {isAi ? 'AI Assistant' : 'Bạn'}
                </h3>
                {comment.model && (
                  <span className="badge">
                    {comment.model}
                  </span>
                )}
              </div>
              <p className="text-base text-[var(--fg-muted)] sm:text-xs">
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
                className="btn btn-ghost btn-sm"
                aria-expanded={isThreadOpen}
              >
                {isThreadOpen ? <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" /> : <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />}
                {isThreadOpen ? 'Thu gọn' : 'Mở'}
              </button>
            )}
            <button
              type="button"
              onClick={() => onReply(comment.id)}
              className="btn btn-ghost btn-sm"
            >
              <Reply className="h-3.5 w-3.5" aria-hidden="true" />
              Trả lời
            </button>
            <button
              type="button"
              onClick={() => onDelete(comment.id)}
              className="btn btn-ghost btn-sm"
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
            className="mt-3 block w-full rounded-md bg-[var(--surface-2)] p-3 text-left transition hover:bg-[var(--surface)]"
          >
            <p className="line-clamp-2 text-lg leading-8 text-[var(--fg)] sm:text-sm sm:leading-6">
              {comment.body ? plainTextPreview(comment.body) : 'AI đang soạn câu trả lời...'}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-base font-semibold text-[var(--fg-muted)] sm:text-xs">
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
              <span>Mở thread để đọc chi tiết</span>
            </div>
          </button>
        ) : (
          <div className="mt-3 rounded-md bg-[var(--surface-2)]">
            <div
              className={cn(
                'relative overflow-hidden p-3',
                isLong && !isExpanded && 'max-h-72'
              )}
            >
              {hasAiReasoning && (
                <div className="mb-3 rounded-md border border-[var(--line-strong)] bg-[var(--surface)]">
                  <button
                    type="button"
                    onClick={() => setIsReasoningOpen((current) => !current)}
                    className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left text-base font-bold text-[var(--fg)] transition hover:bg-[var(--surface-2)] sm:py-2 sm:text-xs"
                    aria-expanded={isReasoningOpen}
                  >
                    <span>{aiContent.hasOpenReasoning ? 'AI đang suy nghĩ' : 'Suy nghĩ của AI'}</span>
                    <ChevronDown
                      className={cn('h-3.5 w-3.5 shrink-0 transition', isReasoningOpen && 'rotate-180')}
                      aria-hidden="true"
                    />
                  </button>
                  {isReasoningOpen && (
                    <div className="border-t border-[var(--line)] px-3 py-3 text-lg leading-8 text-[var(--fg)] sm:py-2 sm:text-sm sm:leading-6">
                      <MarkdownPreview content={aiContent.reasoning} enableBookReader bookReaderTitle="Suy nghĩ của AI" />
                    </div>
                  )}
                </div>
              )}

              {displayBody ? (
                <MarkdownPreview content={displayBody} enableBookReader bookReaderTitle={comment.author === 'ai' ? 'Phản hồi AI' : 'Bình luận'} />
              ) : (
                <div className="flex items-center gap-2 py-3 text-lg font-medium text-[var(--fg-muted)] sm:py-2 sm:text-sm">
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                  AI đang soạn câu trả lời...
                </div>
              )}
              {isStreaming && comment.body && (
                <span className="mt-2 inline-flex items-center gap-1.5 text-base font-semibold text-[var(--fg-muted)] sm:text-xs">
                  <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                  Đang nhận nội dung
                </span>
              )}
              {isLong && !isExpanded && (
                <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-b from-transparent to-[var(--surface-2)]" />
              )}
            </div>
            {isLong && (
              <div className="border-t border-[var(--line)] px-3 py-2">
                <button
                  type="button"
                  onClick={() => onToggleExpanded(comment.id)}
                  className="inline-flex items-center gap-1.5 text-base font-bold text-[var(--accent)] transition hover:text-[var(--fg)] sm:text-xs"
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
              className="btn btn-ghost btn-sm ml-3"
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
