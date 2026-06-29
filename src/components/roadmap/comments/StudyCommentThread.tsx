'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { readStoredStudyComments, storeStudyComments } from '@/lib/roadmap';
import type { StudyComment, StudyCommentContext } from '@/types';
import { CommentBubble } from './CommentBubble';
import { CommentForm } from './CommentForm';
import {
  buildCommentTree,
  collectCommentBranchIds,
  createComment,
  defaultDraft,
  getVisibleCommentBatchSize,
  sortCommentNodesNewestFirst,
  type CommentDraft,
  summarizeThread,
} from './utils';

type StudyCommentThreadProps = {
  taskId: string;
  deckId: string;
  contextType: 'flashcard' | 'quiz';
  contextId: string;
  attemptId?: string | null;
  contextContent: string;
};

function getDraft(drafts: Record<string, CommentDraft>, key: string) {
  return drafts[key] ?? defaultDraft;
}

function sameContext(comment: StudyComment, context: StudyCommentContext, taskId: string) {
  if (comment.taskId !== taskId || comment.context.type !== context.type) {
    return false;
  }

  switch (context.type) {
    case 'flashcard':
      return (
        comment.context.type === 'flashcard' &&
        comment.context.deckId === context.deckId &&
        comment.context.cardId === context.cardId
      );
    case 'quiz':
      return (
        comment.context.type === 'quiz' &&
        comment.context.deckId === context.deckId &&
        comment.context.questionId === context.questionId &&
        comment.context.attemptId === context.attemptId
      );
    case 'ai-review':
      return comment.context.type === 'ai-review' && comment.context.contextId === context.contextId;
  }
}

export function StudyCommentThread({
  taskId,
  deckId,
  contextType,
  contextId,
  attemptId,
  contextContent,
}: StudyCommentThreadProps) {
  const [allComments, setAllComments] = useState<StudyComment[]>([]);
  const [drafts, setDrafts] = useState<Record<string, CommentDraft>>({ root: defaultDraft });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [streamingCommentIds, setStreamingCommentIds] = useState<Set<string>>(new Set());
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(new Set());
  const [openThreadIds, setOpenThreadIds] = useState<Set<string>>(new Set());
  const [expandedReplyGroupIds, setExpandedReplyGroupIds] = useState<Set<string>>(new Set());
  const [visibleCommentCount, setVisibleCommentCount] = useState(getVisibleCommentBatchSize);
  const [error, setError] = useState<string | null>(null);

  const context = useMemo<StudyCommentContext | null>(() => {
    if (contextType === 'quiz' && !attemptId) {
      return null;
    }

    return contextType === 'flashcard'
      ? { type: 'flashcard', deckId, cardId: contextId }
      : { type: 'quiz', deckId, questionId: contextId, attemptId: attemptId as string };
  }, [attemptId, contextId, contextType, deckId]);

  useEffect(() => {
    window.queueMicrotask(() => setAllComments(readStoredStudyComments()));
  }, []);

  const comments = useMemo(
    () => (context ? allComments.filter((comment) => sameContext(comment, context, taskId)) : []),
    [allComments, context, taskId]
  );
  const commentTree = useMemo(() => sortCommentNodesNewestFirst(buildCommentTree(comments)), [comments]);
  const visibleStep = getVisibleCommentBatchSize();
  const visibleCommentTree = commentTree.slice(0, visibleCommentCount);
  const hiddenCommentCount = Math.max(commentTree.length - visibleCommentTree.length, 0);
  const contextLabel = contextType === 'flashcard' ? 'flashcard này' : 'câu hỏi này';

  useEffect(() => {
    window.queueMicrotask(() => setVisibleCommentCount(getVisibleCommentBatchSize()));
  }, [contextId, contextType, attemptId, deckId]);

  function persist(nextComments: StudyComment[]) {
    setAllComments(nextComments);
    storeStudyComments(nextComments);
  }

  function updateDraft(key: string, update: Partial<CommentDraft>) {
    setDrafts((current) => ({ ...current, [key]: { ...getDraft(current, key), ...update } }));
  }

  function clearDraft(key: string) {
    setDrafts((current) => ({ ...current, [key]: defaultDraft }));
  }

  function updateComment(commentId: string, body: string) {
    setAllComments((current) => {
      const next = current.map((comment) => (comment.id === commentId ? { ...comment, body } : comment));
      storeStudyComments(next);
      return next;
    });
  }

  async function streamAiResponse(parentId: string | null, draft: CommentDraft, userQuestion: string, baseComments: StudyComment[]) {
    if (!context) {
      return;
    }

    const baseContextComments = baseComments.filter((comment) => sameContext(comment, context, taskId));
    const aiComment: StudyComment = {
      ...createComment({ parentId, author: 'ai', body: '', model: draft.model, provider: draft.provider }),
      taskId,
      context,
    };
    persist([...baseComments, aiComment]);
    setStreamingCommentIds((current) => new Set(current).add(aiComment.id));

    try {
      const response = await fetch('/api/ai/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: draft.provider,
          apiKey: draft.provider === 'kilo' ? undefined : draft.apiKey,
          confirmPassword: draft.provider === 'kilo' ? draft.confirmPassword : undefined,
          baseUrl: draft.provider === 'custom' ? draft.baseUrl : undefined,
          model: draft.model,
          question: userQuestion,
          studyContext: contextContent,
          threadContext: parentId
            ? summarizeThread(baseContextComments, parentId)
            : 'Chưa có lịch sử trao đổi trong thread này.',
        }),
      });

      if (!response.ok || !response.body) {
        const body = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? 'Không nhận được phản hồi AI.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiBody = '';

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        aiBody += decoder.decode(value, { stream: true });
        updateComment(aiComment.id, aiBody);
      }
    } catch (streamError) {
      updateComment(
        aiComment.id,
        `Không thể nhận phản hồi AI: ${streamError instanceof Error ? streamError.message : 'Lỗi không xác định.'}`
      );
    } finally {
      setStreamingCommentIds((current) => {
        const next = new Set(current);
        next.delete(aiComment.id);
        return next;
      });
    }
  }

  async function submitComment(event: FormEvent<HTMLFormElement>, parentId: string | null) {
    event.preventDefault();
    setError(null);

    if (!context) {
      setError('Hãy bắt đầu hoặc mở một lượt làm bài trước khi comment câu hỏi quiz.');
      return;
    }

    const key = parentId ?? 'root';
    const draft = getDraft(drafts, key);
    const body = draft.body.trim();

    if (!body) {
      setError('Vui lòng nhập nội dung comment.');
      return;
    }

    setSubmittingKey(key);

    const userComment: StudyComment = {
      ...createComment({ parentId, author: 'user', body }),
      taskId,
      context,
    };
    const nextComments = [...allComments, userComment];
    persist(nextComments);
    clearDraft(key);
    setReplyingTo(null);

    if (!parentId) {
      setOpenThreadIds((current) => new Set(current).add(userComment.id));
    }

    if (draft.mode === 'ai') {
      await streamAiResponse(userComment.id, draft, body, nextComments);
    }

    setSubmittingKey(null);
  }

  function deleteComment(commentId: string) {
    const deleteIds = collectCommentBranchIds(comments, commentId);
    persist(allComments.filter((comment) => !deleteIds.has(comment.id)));
  }

  return (
    <section className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-900/70">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquareText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div>
          <h3 className="text-sm font-bold text-gray-950 dark:text-white">Comment và hỏi AI</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ngữ cảnh chỉ lấy từ {contextLabel}; không gửi toàn bộ note.
          </p>
        </div>
      </div>

      {!context && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
          Hãy bắt đầu làm bài hoặc mở một lượt đã lưu để comment theo đúng lượt làm.
        </div>
      )}

      <CommentForm
        draft={getDraft(drafts, 'root')}
        isSubmitting={submittingKey === 'root'}
        submitLabel="Gửi"
        onSubmit={(event) => submitComment(event, null)}
        onChange={(update) => updateDraft('root', update)}
      />

      {error && (
        <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="mt-4 space-y-3">
        {commentTree.length === 0 ? (
          <p className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
            Chưa có comment cho {contextLabel}.
          </p>
        ) : (
          visibleCommentTree.map((comment) => (
            <CommentBubble
              key={comment.id}
              comment={comment}
              depth={0}
              replyingTo={replyingTo}
              getDraft={(key) => getDraft(drafts, key)}
              submittingKey={submittingKey}
              streamingCommentIds={streamingCommentIds}
              expandedCommentIds={expandedCommentIds}
              openThreadIds={openThreadIds}
              expandedReplyGroupIds={expandedReplyGroupIds}
              onReply={(commentId) => setReplyingTo(commentId)}
              onDelete={deleteComment}
              onToggleExpanded={(commentId) =>
                setExpandedCommentIds((current) => {
                  const next = new Set(current);
                  next.has(commentId) ? next.delete(commentId) : next.add(commentId);
                  return next;
                })
              }
              onToggleThread={(commentId) =>
                setOpenThreadIds((current) => {
                  const next = new Set(current);
                  next.has(commentId) ? next.delete(commentId) : next.add(commentId);
                  return next;
                })
              }
              onToggleReplyGroup={(commentId) =>
                setExpandedReplyGroupIds((current) => {
                  const next = new Set(current);
                  next.has(commentId) ? next.delete(commentId) : next.add(commentId);
                  return next;
                })
              }
              onCancelReply={(commentId) => {
                setReplyingTo(null);
                clearDraft(commentId);
              }}
              onDraftChange={updateDraft}
              onSubmit={submitComment}
            />
          ))
        )}
      </div>

      {hiddenCommentCount > 0 && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCommentCount((current) => current + visibleStep)}
            className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
          >
            Xem thêm {Math.min(visibleStep, hiddenCommentCount)} comment cũ hơn
          </button>
        </div>
      )}

    </section>
  );
}
