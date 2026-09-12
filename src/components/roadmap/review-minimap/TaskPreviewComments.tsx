'use client';

import { useEffect, useMemo, useState } from 'react';
import { Bot, ChevronDown, LoaderCircle, MessageSquareText, UserRound } from 'lucide-react';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { hasStoredComments, readStoredComments } from '@/lib/roadmap';
import { cn } from '@/lib/utils';
import type { CommentNode, NoteComment } from '@/types';
import { readSeedComments, saveCommentsByTask } from '@/components/roadmap/comments/seed';
import {
  buildCommentTree,
  countNestedReplies,
  formatDate,
  splitAiReasoning,
  sortCommentNodesNewestFirst,
} from '@/components/roadmap/comments/utils';

type TaskPreviewCommentsProps = {
  taskId: string;
  isOpen: boolean;
  onCommentCountChange?: (count: number) => void;
};

export function TaskPreviewComments({ taskId, isOpen, onCommentCountChange }: TaskPreviewCommentsProps) {
  const [comments, setComments] = useState<NoteComment[]>([]);
  const [openCommentIds, setOpenCommentIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    let cancelled = false;
    let hasLocalComments = false;

    try {
      hasLocalComments = hasStoredComments();
      const parsed = readStoredComments();
      window.queueMicrotask(() => {
        if (!cancelled) {
          setComments(Array.isArray(parsed[taskId]) ? parsed[taskId] : []);
        }
      });
    } catch {
      window.queueMicrotask(() => {
        if (!cancelled) {
          setComments([]);
        }
      });
    }

    async function hydrateSeedComments() {
      if (hasLocalComments) return;

      try {
        const response = await fetch('/api/skill-roadmap/progress', { cache: 'no-store' });
        if (!response.ok) return;
        const seed = await response.json();
        if (cancelled) return;

        const seedComments = readSeedComments(seed);
        saveCommentsByTask(seedComments);
        setComments(seedComments[taskId] ?? []);
      } catch {
        // Preview drawer still works without seeded comments.
      }
    }

    window.queueMicrotask(() => {
      if (!cancelled) {
        setOpenCommentIds(new Set());
      }
    });
    hydrateSeedComments();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const commentTree = useMemo(
    () => sortCommentNodesNewestFirst(buildCommentTree(comments)),
    [comments]
  );
  const commentCount = comments.length;

  useEffect(() => {
    onCommentCountChange?.(commentCount);
  }, [commentCount, onCommentCountChange]);

  const toggleComment = (commentId: string) => {
    setOpenCommentIds((current) => {
      const next = new Set(current);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  if (!isOpen) {
    return null;
  }

  return (
    <section className="shrink-0 border-t border-[var(--line)] bg-[var(--surface)] px-4 py-3 sm:px-5">
      <div className="card">
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-3 py-2.5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-[var(--fg)]">
            <MessageSquareText className="h-4 w-4 text-[var(--accent)]" />
            Bình luận note
          </h3>
          <span className="badge badge-ghost">
            {commentCount} comment
          </span>
        </div>

        <div className="max-h-[40dvh] overflow-y-auto p-3 overscroll-contain">
          {commentTree.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-6 text-center text-sm text-[var(--fg-muted)]">
              Chưa có bình luận nào cho note này.
            </div>
          ) : (
            <div className="space-y-1.5">
              {commentTree.map((comment) => (
                <PreviewCommentNode
                  key={comment.id}
                  comment={comment}
                  depth={0}
                  openCommentIds={openCommentIds}
                  onToggle={toggleComment}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PreviewCommentNode({
  comment,
  depth,
  openCommentIds,
  onToggle,
}: {
  comment: CommentNode;
  depth: number;
  openCommentIds: Set<string>;
  onToggle: (commentId: string) => void;
}) {
  const isAi = comment.author === 'ai';
  const isOpen = openCommentIds.has(comment.id);
  const replyCount = countNestedReplies(comment);
  const hasReplies = comment.children.length > 0;
  const [isReasoningOpen, setIsReasoningOpen] = useState(false);
  const aiContent = isAi
    ? splitAiReasoning(comment.body)
    : { reasoning: '', answer: comment.body, hasOpenReasoning: false };
  const hasAiReasoning = isAi && Boolean(aiContent.reasoning);
  const displayBody = hasAiReasoning ? aiContent.answer : comment.body;

  return (
    <article className={cn(depth > 0 && 'border-l border-[var(--line)] pl-2')}>
      <div
        className={cn(
          'overflow-hidden rounded-[var(--radius-card)] border',
          isAi
            ? 'border-[var(--line-strong)] bg-[var(--surface-2)]'
            : 'border-[var(--line)] bg-[var(--surface)]'
        )}
      >
        <button
          type="button"
          onClick={() => onToggle(comment.id)}
          className={cn(
            'flex w-full min-w-0 items-start justify-between gap-3 px-3 py-2.5 text-left transition',
            isAi
              ? 'hover:bg-[var(--surface)]'
              : 'hover:bg-[var(--surface-2)]'
          )}
          aria-expanded={isOpen}
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                isAi
                  ? 'bg-[var(--fg)] text-[var(--bg)]'
                  : 'border border-[var(--line-strong)] bg-[var(--surface)] text-[var(--fg-muted)]'
              )}
            >
              {isAi ? <Bot className="h-4 w-4" aria-hidden="true" /> : <UserRound className="h-4 w-4" aria-hidden="true" />}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-bold text-[var(--fg)]">
                {isAi ? 'AI Assistant' : 'Bạn'}
              </span>
              <span className="block text-xs text-[var(--fg-muted)]">
                {formatDate(comment.createdAt)}
              </span>
            </span>
          </span>
          <span className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[var(--fg-muted)]">
            {replyCount > 0 && `${replyCount} trả lời`}
            <span>{isOpen ? 'Thu gọn' : 'Mở'}</span>
            <ChevronDown className={cn('h-3.5 w-3.5 transition', isOpen && 'rotate-180')} aria-hidden="true" />
          </span>
        </button>

        {isOpen && (
          <div className="border-t border-[var(--line)] bg-[var(--surface-2)] p-3">
            {hasAiReasoning && (
              <div className="card mb-3">
                <button
                  type="button"
                  onClick={() => setIsReasoningOpen((current) => !current)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-xs font-bold text-[var(--accent)] transition hover:bg-[var(--surface)]"
                  aria-expanded={isReasoningOpen}
                >
                  <span>{aiContent.hasOpenReasoning ? 'AI đang suy nghĩ' : 'Suy nghĩ của AI'}</span>
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 shrink-0 transition', isReasoningOpen && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>
                {isReasoningOpen && (
                  <div className="border-t border-[var(--line)] px-3 py-2 text-sm leading-6 text-[var(--fg)]">
                    <MarkdownPreview content={aiContent.reasoning} enableBookReader bookReaderTitle="Suy nghĩ của AI" />
                  </div>
                )}
              </div>
            )}

            {displayBody ? (
              <MarkdownPreview content={displayBody} enableBookReader bookReaderTitle={comment.author === 'ai' ? 'Phản hồi AI' : 'Bình luận'} />
            ) : (
              <div className="flex items-center gap-2 text-sm text-[var(--accent)]">
                <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                AI đang soạn câu trả lời...
              </div>
            )}

            {hasReplies && (
              <div className="mt-2 space-y-1">
                {comment.children.map((reply) => (
                  <PreviewCommentNode
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    openCommentIds={openCommentIds}
                    onToggle={onToggle}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
