'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ChevronDown, MessageSquarePlus } from 'lucide-react';
import type { NoteComment } from '@/types';
import { CommentForm } from './CommentForm';
import { CommentThread } from './CommentThread';
import { streamAiComment } from './ai-stream';
import { readSeedComments, saveCommentsByTask } from './seed';
import {
  buildCommentTree,
  collectCommentBranchIds,
  commentsStorageKey,
  type CommentDraft,
  createComment,
  defaultDraft,
  getVisibleCommentBatchSize,
  sortCommentNodesNewestFirst,
  summarizeMarkdown,
  summarizeThread,
} from './utils';

export function MarkdownCommentThreads({
  taskId,
  markdown,
}: {
  taskId: string;
  markdown: string;
}) {
  const [comments, setComments] = useState<NoteComment[]>([]);
  const [drafts, setDrafts] = useState<Record<string, CommentDraft>>({});
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [streamingCommentIds, setStreamingCommentIds] = useState<Set<string>>(() => new Set());
  const [visibleRootThreadCount, setVisibleRootThreadCount] = useState(getVisibleCommentBatchSize);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let hasLocalComments = false;

    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      hasLocalComments = raw !== null;
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      window.queueMicrotask(() => setComments(Array.isArray(parsed[taskId]) ? parsed[taskId] : []));
    } catch {
      window.queueMicrotask(() => setComments([]));
    }

    async function hydrateSeedComments() {
      if (hasLocalComments) return;
      try {
        const response = await fetch('/api/skill-roadmap/progress', { cache: 'no-store' });
        if (!response.ok) return;
        const seed = await response.json();
        const seedComments = readSeedComments(seed);
        if (cancelled) return;
        saveCommentsByTask(seedComments);
        setComments(seedComments[taskId] ?? []);
      } catch { /* comment panel can still work with browser-local comments only */ }
    }

    hydrateSeedComments();
    return () => { cancelled = true; };
  }, [taskId]);

  const commentTree = useMemo(() => sortCommentNodesNewestFirst(buildCommentTree(comments)), [comments]);
  const commentCount = comments.length;
  const visibleCommentStep = getVisibleCommentBatchSize();
  const visibleRootThreads = commentTree.slice(0, visibleRootThreadCount);
  const hiddenRootThreadCount = Math.max(commentTree.length - visibleRootThreads.length, 0);
  const markdownContext = useMemo(() => summarizeMarkdown(markdown), [markdown]);

  const saveComments = (nextComments: NoteComment[]) => {
    setComments(nextComments);
    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      parsed[taskId] = nextComments;
      window.localStorage.setItem(commentsStorageKey, JSON.stringify(parsed));
    } catch {
      setError('Không lưu được comment vào localStorage của trình duyệt.');
    }
  };

  const getDraft = (key: string) => drafts[key] ?? defaultDraft;
  const updateDraft = (key: string, update: Partial<CommentDraft>) => {
    setDrafts((current) => ({ ...current, [key]: { ...(current[key] ?? defaultDraft), ...update } }));
  };
  const resetDraft = (key: string) => {
    setDrafts((current) => { const next = { ...current }; delete next[key]; return next; });
  };

  const deleteCommentBranch = (commentId: string) => {
    const deleteIds = collectCommentBranchIds(comments, commentId);
    if (!deleteIds.size) return;
    const message = deleteIds.size === 1
      ? 'Xóa comment này?'
      : `Xóa comment này cùng ${deleteIds.size - 1} trả lời bên trong?`;
    if (!window.confirm(message)) return;
    saveComments(comments.filter((comment) => !deleteIds.has(comment.id)));
    setDrafts((current) => { const next = { ...current }; deleteIds.forEach((id) => delete next[id]); return next; });
  };

  const submitDraft = async (event: FormEvent<HTMLFormElement>, parentId: string | null) => {
    event.preventDefault();
    const draftKey = parentId ?? 'root';
    const draft = getDraft(draftKey);
    const body = draft.body.trim();
    if (!body) { setError('Vui lòng nhập nội dung trước khi gửi.'); return; }
    setError(null);
    setSubmittingKey(draftKey);

    if (draft.mode === 'comment') {
      const nextComment = createComment({ parentId, author: 'user', body });
      saveComments([...comments, nextComment]);
      resetDraft(draftKey);
      setSubmittingKey(null);
      return;
    }

    resetDraft(draftKey);
    await streamAiComment(
      {
        taskId,
        question: body,
        parentId,
        provider: draft.provider,
        apiKey: draft.apiKey,
        model: draft.model,
        baseUrl: draft.provider === 'custom' ? draft.baseUrl : '',
        markdownContext,
        threadContext: (nextComments, userComment) => summarizeThread(nextComments, userComment.id),
      },
      {
        persistComments: (_taskId, nextComments) => saveComments(nextComments),
        addStreamingId: (id) => setStreamingCommentIds((current) => new Set(current).add(id)),
        removeStreamingId: (id) => setStreamingCommentIds((current) => { const next = new Set(current); next.delete(id); return next; }),
        onError: (message) => setError(message),
        getComments: () => comments,
      }
    );
    setSubmittingKey(null);
  };

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[var(--line)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="eyebrow text-[var(--accent)]">Discussion</span>
          <h2 className="mt-1 font-serif text-xl font-normal text-[var(--fg)]">Comment & hỏi AI</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="badge badge-ghost">
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            {commentCount} comment
          </div>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <CommentForm
          draft={getDraft('root')}
          isSubmitting={submittingKey === 'root'}
          submitLabel="Gửi"
          onSubmit={(event) => submitDraft(event, null)}
          onChange={(update) => updateDraft('root', update)}
        />

        {error && (
          <div className="card border-[var(--accent)] px-3 py-2 text-sm font-medium text-[var(--accent)]">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {commentTree.length === 0 ? (
            <div className="rounded-[var(--radius-card)] border border-dashed border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-8 text-center text-sm text-[var(--fg-muted)]">
              Chưa có comment nào cho note này.
            </div>
          ) : (
            <>
              {visibleRootThreads.map((comment) => (
                <CommentThread key={comment.id} taskId={taskId} comment={comment} streamingCommentIds={streamingCommentIds} onDelete={deleteCommentBranch} />
              ))}
            </>
          )}
        </div>

        {hiddenRootThreadCount > 0 && (
          <div className="flex justify-center">
            <button
              type="button"
              onClick={() => setVisibleRootThreadCount((current) => current + visibleCommentStep)}
              className="btn btn-secondary"
            >
              <ChevronDown className="h-4 w-4" aria-hidden="true" />
              Xem thêm {Math.min(hiddenRootThreadCount, visibleCommentStep)} thread cũ hơn
            </button>
          </div>
        )}

      </div>
    </section>
  );
}
