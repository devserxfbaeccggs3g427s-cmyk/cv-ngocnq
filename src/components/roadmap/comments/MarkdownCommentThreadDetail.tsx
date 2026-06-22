'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { NoteComment } from '@/types';
import { CommentBubble } from './CommentBubble';
import { readSeedComments, readSeedProgress, saveCommentsByTask, saveSeedProgress } from './seed';
import {
  buildCommentTree,
  collectCommentBranchIds,
  commentsStorageKey,
  type CommentDraft,
  createComment,
  defaultDraft,
  findCommentNode,
  progressStorageKey,
  sortCommentNodesNewestFirst,
  summarizeMarkdown,
  summarizeThread,
} from './utils';

export function MarkdownCommentThreadDetail({
  taskId,
  commentId,
  backHref,
}: {
  taskId: string;
  commentId: string;
  backHref: string;
}) {
  const router = useRouter();
  const [comments, setComments] = useState<NoteComment[]>([]);
  const [markdown, setMarkdown] = useState('');
  const [drafts, setDrafts] = useState<Record<string, CommentDraft>>({});
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [streamingCommentIds, setStreamingCommentIds] = useState<Set<string>>(() => new Set());
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(() => new Set());
  const [expandedReplyGroupIds, setExpandedReplyGroupIds] = useState<Set<string>>(() => new Set());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    let hasLocalComments = false;
    let hasLocalProgress = false;

    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      hasLocalComments = raw !== null;
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      window.queueMicrotask(() => setComments(Array.isArray(parsed[taskId]) ? parsed[taskId] : []));
    } catch { window.queueMicrotask(() => setComments([])); }

    try {
      const rawProgress = window.localStorage.getItem(progressStorageKey);
      hasLocalProgress = rawProgress !== null;
      const parsedProgress = rawProgress ? (JSON.parse(rawProgress) as { items?: Record<string, { note?: string }> }) : null;
      window.queueMicrotask(() => setMarkdown(parsedProgress?.items?.[taskId]?.note?.trim() ?? ''));
    } catch { window.queueMicrotask(() => setMarkdown('')); }

    async function hydrateSeedData() {
      if (hasLocalComments && hasLocalProgress) return;
      try {
        const response = await fetch('/api/skill-roadmap/progress', { cache: 'no-store' });
        if (!response.ok) return;
        const seed = await response.json();
        if (cancelled) return;
        if (!hasLocalComments) {
          const seedComments = readSeedComments(seed);
          saveCommentsByTask(seedComments);
          setComments(seedComments[taskId] ?? []);
        }
        if (!hasLocalProgress) {
          const seedProgress = readSeedProgress(seed);
          saveSeedProgress(seedProgress);
          setMarkdown(seedProgress.items?.[taskId]?.note?.trim() ?? '');
        }
      } catch { /* focused thread can still work with browser-local data only */ }
    }

    hydrateSeedData();
    return () => { cancelled = true; };
  }, [taskId]);

  const commentTree = useMemo(() => sortCommentNodesNewestFirst(buildCommentTree(comments)), [comments]);
  const thread = useMemo(() => findCommentNode(commentTree, commentId), [commentId, commentTree]);
  const openThreadIds = useMemo(() => new Set(thread ? [thread.id] : []), [thread]);
  const markdownContext = useMemo(() => summarizeMarkdown(markdown), [markdown]);

  const saveComments = (nextComments: NoteComment[]) => {
    setComments(nextComments);
    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      parsed[taskId] = nextComments;
      window.localStorage.setItem(commentsStorageKey, JSON.stringify(parsed));
    } catch { setError('Không lưu được comment vào localStorage của trình duyệt.'); }
  };

  const getDraft = (key: string) => drafts[key] ?? defaultDraft;
  const updateDraft = (key: string, update: Partial<CommentDraft>) => {
    setDrafts((current) => ({ ...current, [key]: { ...(current[key] ?? defaultDraft), ...update } }));
  };
  const resetDraft = (key: string) => {
    setDrafts((current) => { const next = { ...current }; delete next[key]; return next; });
  };

  const toggleCommentExpanded = (targetCommentId: string) => {
    setExpandedCommentIds((current) => { const next = new Set(current); if (next.has(targetCommentId)) next.delete(targetCommentId); else next.add(targetCommentId); return next; });
  };
  const toggleReplyGroupExpanded = (targetCommentId: string) => {
    setExpandedReplyGroupIds((current) => { const next = new Set(current); if (next.has(targetCommentId)) next.delete(targetCommentId); else next.add(targetCommentId); return next; });
  };

  const deleteCommentBranch = (targetCommentId: string) => {
    const deleteIds = collectCommentBranchIds(comments, targetCommentId);
    if (!deleteIds.size) return;
    const message = deleteIds.size === 1 ? 'Xóa comment này?' : `Xóa comment này cùng ${deleteIds.size - 1} trả lời bên trong?`;
    if (!window.confirm(message)) return;
    saveComments(comments.filter((comment) => !deleteIds.has(comment.id)));
    if (targetCommentId === commentId) { router.replace(backHref); return; }
    setReplyingTo((current) => (current && deleteIds.has(current) ? null : current));
    setDrafts((current) => { const next = { ...current }; deleteIds.forEach((id) => delete next[id]); return next; });
    setExpandedCommentIds((current) => { const next = new Set(current); deleteIds.forEach((id) => next.delete(id)); return next; });
    setExpandedReplyGroupIds((current) => { const next = new Set(current); deleteIds.forEach((id) => next.delete(id)); return next; });
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
      setReplyingTo(null);
      setSubmittingKey(null);
      return;
    }

    let streamingReplyId: string | null = null;
    let rollbackComments: NoteComment[] | null = null;
    try {
      const questionComment = createComment({ parentId, author: 'user', body });
      const nextBeforeAi = [...comments, questionComment];
      rollbackComments = nextBeforeAi;
      saveComments(nextBeforeAi);
      resetDraft(draftKey);
      setReplyingTo(null);

      const aiReply = createComment({ parentId: questionComment.id, author: 'ai', body: '', model: draft.model, provider: draft.provider });
      const nextWithPlaceholder = [...nextBeforeAi, aiReply];
      let streamedAnswer = '';
      streamingReplyId = aiReply.id;
      setStreamingCommentIds((current) => new Set(current).add(aiReply.id));
      saveComments(nextWithPlaceholder);

      const response = await fetch('/api/ai/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: draft.provider,
          apiKey: draft.provider === 'kilo' ? undefined : draft.apiKey,
          confirmPassword: draft.provider === 'kilo' ? draft.confirmPassword : undefined,
          model: draft.model,
          baseUrl: draft.provider === 'custom' ? draft.baseUrl : undefined,
          question: body,
          markdownContext,
          threadContext: summarizeThread(nextBeforeAi, questionComment.id),
        }),
      });

      if (!response.ok) {
        const responseBody = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(responseBody.error ?? 'Không nhận được câu trả lời từ AI.');
      }
      if (!response.body) throw new Error('Không đọc được stream trả lời từ AI.');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        streamedAnswer += decoder.decode(value, { stream: true });
        saveComments([...nextBeforeAi, { ...aiReply, body: streamedAnswer }]);
      }
      streamedAnswer += decoder.decode();
      if (!streamedAnswer.trim()) throw new Error('AI provider không trả về nội dung trả lời.');
      saveComments([...nextBeforeAi, { ...aiReply, body: streamedAnswer.trim() }]);
    } catch (submitError) {
      if (rollbackComments) saveComments(rollbackComments);
      setError(submitError instanceof Error ? submitError.message : 'Không gửi được câu hỏi tới AI.');
    } finally {
      if (streamingReplyId) {
        const id = streamingReplyId;
        setStreamingCommentIds((current) => { const next = new Set(current); next.delete(id); return next; });
      }
      setSubmittingKey(null);
    }
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">Discussion Thread</p>
          <h2 className="mt-1 text-lg font-bold text-gray-950 dark:text-white">Chi tiết thread comment</h2>
        </div>
        <Link
          href={backHref}
          className="inline-flex h-9 w-fit items-center justify-center rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
        >
          Quay lại note
        </Link>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {thread ? (
          <CommentBubble
            comment={thread}
            depth={0}
            replyingTo={replyingTo}
            getDraft={getDraft}
            submittingKey={submittingKey}
            streamingCommentIds={streamingCommentIds}
            expandedCommentIds={expandedCommentIds}
            openThreadIds={openThreadIds}
            expandedReplyGroupIds={expandedReplyGroupIds}
            showThreadToggle={false}
            onReply={setReplyingTo}
            onDelete={deleteCommentBranch}
            onToggleExpanded={toggleCommentExpanded}
            onToggleThread={() => undefined}
            onToggleReplyGroup={toggleReplyGroupExpanded}
            onCancelReply={(targetCommentId) => { setReplyingTo(null); resetDraft(targetCommentId); }}
            onDraftChange={updateDraft}
            onSubmit={submitDraft}
          />
        ) : (
          <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
            Không tìm thấy thread comment này trong localStorage của trình duyệt.
          </div>
        )}
      </div>
    </section>
  );
}
