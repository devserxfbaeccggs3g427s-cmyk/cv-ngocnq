'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  KeyRound,
  LoaderCircle,
  MessageSquarePlus,
  RefreshCw,
  Reply,
  Search,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { cn } from '@/lib/utils';

type CommentMode = 'comment' | 'ai';
type AiProvider = 'openrouter' | 'kilo' | 'custom';

type NoteComment = {
  id: string;
  parentId: string | null;
  author: 'user' | 'ai';
  body: string;
  createdAt: string;
  model?: string;
  provider?: string;
};

type CommentDraft = {
  mode: CommentMode;
  body: string;
  provider: AiProvider;
  baseUrl: string;
  model: string;
  apiKey: string;
};

type AiModelOption = {
  id: string;
  name?: string;
  owner?: string;
};

type CommentNode = NoteComment & {
  replies: CommentNode[];
};

const commentsStorageKey = 'skill-roadmap-note-comments:v1';
const progressStorageKey = 'skill-roadmap-progress:v1';
const longCommentLength = 900;
const longCommentLineCount = 14;
const initialVisibleRootThreads = 6;
const visibleReplyPreviewCount = 2;
const defaultDraft: CommentDraft = {
  mode: 'comment',
  body: '',
  provider: 'kilo',
  baseUrl: '',
  model: '',
  apiKey: '',
};

const providerOptions: Array<{ value: AiProvider; label: string; hint: string }> = [
  {
    value: 'kilo',
    label: 'Kilo AI',
    hint: 'Dùng Base URL mặc định https://api.kilo.ai/api/gateway.',
  },
  {
    value: 'openrouter',
    label: 'OpenRouter',
    hint: 'Dùng endpoint OpenRouter mặc định.',
  },
  {
    value: 'custom',
    label: 'Kilo AI / OpenAI-compatible',
    hint: 'Nhập Base URL tương thích OpenAI.',
  },
];

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
  const [visibleRootThreadCount, setVisibleRootThreadCount] = useState(initialVisibleRootThreads);
  const [rootComposerOpen, setRootComposerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      window.queueMicrotask(() => setComments(Array.isArray(parsed[taskId]) ? parsed[taskId] : []));
    } catch {
      window.queueMicrotask(() => setComments([]));
    }
  }, [taskId]);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
  const commentCount = comments.length;
  const visibleRootThreads = commentTree.slice(Math.max(commentTree.length - visibleRootThreadCount, 0));
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
    setDrafts((current) => ({
      ...current,
      [key]: {
        ...(current[key] ?? defaultDraft),
        ...update,
      },
    }));
  };

  const resetDraft = (key: string) => {
    setDrafts((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const deleteCommentBranch = (commentId: string) => {
    const deleteIds = collectCommentBranchIds(comments, commentId);

    if (!deleteIds.size) {
      return;
    }

    const message =
      deleteIds.size === 1
        ? 'Xóa comment này?'
        : `Xóa comment này cùng ${deleteIds.size - 1} trả lời bên trong?`;

    if (!window.confirm(message)) {
      return;
    }

    saveComments(comments.filter((comment) => !deleteIds.has(comment.id)));
    setDrafts((current) => {
      const next = { ...current };
      deleteIds.forEach((id) => delete next[id]);
      return next;
    });
  };

  const submitDraft = async (event: FormEvent<HTMLFormElement>, parentId: string | null) => {
    event.preventDefault();

    const draftKey = parentId ?? 'root';
    const draft = getDraft(draftKey);
    const body = draft.body.trim();

    if (!body) {
      setError('Vui lòng nhập nội dung trước khi gửi.');
      return;
    }

    setError(null);
    setSubmittingKey(draftKey);

    if (draft.mode === 'comment') {
      const nextComment = createComment({
        parentId,
        author: 'user',
        body,
      });

      saveComments([...comments, nextComment]);
      resetDraft(draftKey);
      setRootComposerOpen(false);
      setSubmittingKey(null);
      return;
    }

    let streamingReplyId: string | null = null;
    let rollbackComments: NoteComment[] | null = null;

    try {
      const questionComment = createComment({
        parentId,
        author: 'user',
        body,
      });
      const nextBeforeAi = [...comments, questionComment];
      rollbackComments = nextBeforeAi;

      saveComments(nextBeforeAi);
      resetDraft(draftKey);
      setRootComposerOpen(false);

      const aiReply = createComment({
        parentId: questionComment.id,
        author: 'ai',
        body: '',
        model: draft.model,
        provider: draft.provider,
      });
      const nextWithPlaceholder = [...nextBeforeAi, aiReply];
      let streamedAnswer = '';
      streamingReplyId = aiReply.id;

      setStreamingCommentIds((current) => new Set(current).add(aiReply.id));
      saveComments(nextWithPlaceholder);

      const response = await fetch('/api/ai/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: draft.provider,
          apiKey: draft.apiKey,
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

      if (!response.body) {
        throw new Error('Không đọc được stream trả lời từ AI.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        streamedAnswer += decoder.decode(value, { stream: true });
        saveComments([
          ...nextBeforeAi,
          {
            ...aiReply,
            body: streamedAnswer,
          },
        ]);
      }

      streamedAnswer += decoder.decode();

      if (!streamedAnswer.trim()) {
        throw new Error('AI provider không trả về nội dung trả lời.');
      }

      saveComments([
        ...nextBeforeAi,
        {
          ...aiReply,
          body: streamedAnswer.trim(),
        },
      ]);
    } catch (submitError) {
      if (rollbackComments) {
        saveComments(rollbackComments);
      }

      setError(submitError instanceof Error ? submitError.message : 'Không gửi được câu hỏi tới AI.');
    } finally {
      if (streamingReplyId) {
        const completedStreamingReplyId = streamingReplyId;

        setStreamingCommentIds((current) => {
          const next = new Set(current);
          next.delete(completedStreamingReplyId);
          return next;
        });
      }

      setSubmittingKey(null);
    }
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Discussion
          </p>
          <h2 className="mt-1 text-lg font-bold text-gray-950 dark:text-white">Comment & hỏi AI</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
            <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
            {commentCount} comment
          </div>
          <button
            type="button"
            onClick={() => setRootComposerOpen((current) => !current)}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-gray-950 px-3 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            aria-expanded={rootComposerOpen}
          >
            {rootComposerOpen ? <X className="h-4 w-4" aria-hidden="true" /> : <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />}
            {rootComposerOpen ? 'Đóng form' : 'Thêm comment'}
          </button>
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        {rootComposerOpen && (
          <CommentComposer
            draft={getDraft('root')}
            isSubmitting={submittingKey === 'root'}
            submitLabel="Gửi"
            onSubmit={(event) => submitDraft(event, null)}
            onChange={(update) => updateDraft('root', update)}
            onCancel={() => {
              setRootComposerOpen(false);
              resetDraft('root');
            }}
          />
        )}

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {commentTree.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-400">
              Chưa có comment nào cho note này.
            </div>
          ) : (
            <>
              {hiddenRootThreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => setVisibleRootThreadCount((current) => current + initialVisibleRootThreads)}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-600 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 dark:border-gray-800 dark:bg-gray-900/60 dark:text-gray-300 dark:hover:border-blue-900 dark:hover:bg-blue-950/30 dark:hover:text-blue-200"
                >
                  <ChevronUp className="h-4 w-4" aria-hidden="true" />
                  Xem thêm {Math.min(hiddenRootThreadCount, initialVisibleRootThreads)} thread cũ hơn
                </button>
              )}

              {visibleRootThreads.map((comment) => (
                <CommentThreadCard
                  key={comment.id}
                  taskId={taskId}
                  comment={comment}
                  streamingCommentIds={streamingCommentIds}
                  onDelete={deleteCommentBranch}
                />
              ))}
            </>
          )}
        </div>
      </div>
    </section>
  );
}

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
    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      window.queueMicrotask(() => setComments(Array.isArray(parsed[taskId]) ? parsed[taskId] : []));
    } catch {
      window.queueMicrotask(() => setComments([]));
    }

    try {
      const rawProgress = window.localStorage.getItem(progressStorageKey);
      const parsedProgress = rawProgress
        ? (JSON.parse(rawProgress) as { items?: Record<string, { note?: string }> })
        : null;
      window.queueMicrotask(() => setMarkdown(parsedProgress?.items?.[taskId]?.note?.trim() ?? ''));
    } catch {
      window.queueMicrotask(() => setMarkdown(''));
    }
  }, [taskId]);

  const commentTree = useMemo(() => buildCommentTree(comments), [comments]);
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
    } catch {
      setError('Không lưu được comment vào localStorage của trình duyệt.');
    }
  };

  const getDraft = (key: string) => drafts[key] ?? defaultDraft;
  const updateDraft = (key: string, update: Partial<CommentDraft>) => {
    setDrafts((current) => ({
      ...current,
      [key]: {
        ...(current[key] ?? defaultDraft),
        ...update,
      },
    }));
  };

  const resetDraft = (key: string) => {
    setDrafts((current) => {
      const next = { ...current };
      delete next[key];
      return next;
    });
  };

  const toggleCommentExpanded = (targetCommentId: string) => {
    setExpandedCommentIds((current) => {
      const next = new Set(current);

      if (next.has(targetCommentId)) {
        next.delete(targetCommentId);
      } else {
        next.add(targetCommentId);
      }

      return next;
    });
  };

  const toggleReplyGroupExpanded = (targetCommentId: string) => {
    setExpandedReplyGroupIds((current) => {
      const next = new Set(current);

      if (next.has(targetCommentId)) {
        next.delete(targetCommentId);
      } else {
        next.add(targetCommentId);
      }

      return next;
    });
  };

  const deleteCommentBranch = (targetCommentId: string) => {
    const deleteIds = collectCommentBranchIds(comments, targetCommentId);

    if (!deleteIds.size) {
      return;
    }

    const message =
      deleteIds.size === 1
        ? 'Xóa comment này?'
        : `Xóa comment này cùng ${deleteIds.size - 1} trả lời bên trong?`;

    if (!window.confirm(message)) {
      return;
    }

    saveComments(comments.filter((comment) => !deleteIds.has(comment.id)));

    if (targetCommentId === commentId) {
      router.replace(backHref);
      return;
    }

    setReplyingTo((current) => (current && deleteIds.has(current) ? null : current));
    setDrafts((current) => {
      const next = { ...current };
      deleteIds.forEach((id) => delete next[id]);
      return next;
    });
    setExpandedCommentIds((current) => {
      const next = new Set(current);
      deleteIds.forEach((id) => next.delete(id));
      return next;
    });
    setExpandedReplyGroupIds((current) => {
      const next = new Set(current);
      deleteIds.forEach((id) => next.delete(id));
      return next;
    });
  };

  const submitDraft = async (event: FormEvent<HTMLFormElement>, parentId: string | null) => {
    event.preventDefault();

    const draftKey = parentId ?? 'root';
    const draft = getDraft(draftKey);
    const body = draft.body.trim();

    if (!body) {
      setError('Vui lòng nhập nội dung trước khi gửi.');
      return;
    }

    setError(null);
    setSubmittingKey(draftKey);

    if (draft.mode === 'comment') {
      const nextComment = createComment({
        parentId,
        author: 'user',
        body,
      });

      saveComments([...comments, nextComment]);
      resetDraft(draftKey);
      setReplyingTo(null);
      setSubmittingKey(null);
      return;
    }

    let streamingReplyId: string | null = null;
    let rollbackComments: NoteComment[] | null = null;

    try {
      const questionComment = createComment({
        parentId,
        author: 'user',
        body,
      });
      const nextBeforeAi = [...comments, questionComment];
      rollbackComments = nextBeforeAi;

      saveComments(nextBeforeAi);
      resetDraft(draftKey);
      setReplyingTo(null);

      const aiReply = createComment({
        parentId: questionComment.id,
        author: 'ai',
        body: '',
        model: draft.model,
        provider: draft.provider,
      });
      const nextWithPlaceholder = [...nextBeforeAi, aiReply];
      let streamedAnswer = '';
      streamingReplyId = aiReply.id;

      setStreamingCommentIds((current) => new Set(current).add(aiReply.id));
      saveComments(nextWithPlaceholder);

      const response = await fetch('/api/ai/comment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: draft.provider,
          apiKey: draft.apiKey,
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

      if (!response.body) {
        throw new Error('Không đọc được stream trả lời từ AI.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        streamedAnswer += decoder.decode(value, { stream: true });
        saveComments([
          ...nextBeforeAi,
          {
            ...aiReply,
            body: streamedAnswer,
          },
        ]);
      }

      streamedAnswer += decoder.decode();

      if (!streamedAnswer.trim()) {
        throw new Error('AI provider không trả về nội dung trả lời.');
      }

      saveComments([
        ...nextBeforeAi,
        {
          ...aiReply,
          body: streamedAnswer.trim(),
        },
      ]);
    } catch (submitError) {
      if (rollbackComments) {
        saveComments(rollbackComments);
      }

      setError(submitError instanceof Error ? submitError.message : 'Không gửi được câu hỏi tới AI.');
    } finally {
      if (streamingReplyId) {
        const completedStreamingReplyId = streamingReplyId;

        setStreamingCommentIds((current) => {
          const next = new Set(current);
          next.delete(completedStreamingReplyId);
          return next;
        });
      }

      setSubmittingKey(null);
    }
  };

  return (
    <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
      <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-600 dark:text-blue-400">
            Discussion Thread
          </p>
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
          <CommentItem
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
            onCancelReply={(targetCommentId) => {
              setReplyingTo(null);
              resetDraft(targetCommentId);
            }}
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

function CommentThreadCard({
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

function CommentComposer({
  draft,
  isSubmitting,
  submitLabel,
  onSubmit,
  onChange,
  onCancel,
}: {
  draft: CommentDraft;
  isSubmitting: boolean;
  submitLabel: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onChange: (update: Partial<CommentDraft>) => void;
  onCancel?: () => void;
}) {
  const [modelOptions, setModelOptions] = useState<AiModelOption[]>([]);
  const [modelSearch, setModelSearch] = useState('');
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [loadedModelKey, setLoadedModelKey] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<{ key: string; message: string } | null>(null);
  const modelRequestKey = [
    draft.provider,
    draft.provider === 'custom' ? draft.baseUrl.trim() : '',
  ].join('|');
  const currentModelOptions = loadedModelKey === modelRequestKey ? modelOptions : [];
  const currentModelError = modelError?.key === modelRequestKey ? modelError.message : null;
  const normalizedModelSearch = modelSearch.trim().toLowerCase();
  const filteredModelOptions = normalizedModelSearch
    ? currentModelOptions.filter((model) =>
        [model.id, model.name, model.owner]
          .filter(Boolean)
          .some((value) => value?.toLowerCase().includes(normalizedModelSearch))
      )
    : currentModelOptions;
  const selectedModel = currentModelOptions.find((model) => model.id === draft.model);

  const canLoadModels =
    draft.mode === 'ai' &&
    (draft.provider !== 'custom' || Boolean(draft.baseUrl.trim()));

  const loadModels = async () => {
    setModelError(null);
    setIsLoadingModels(true);

    try {
      const response = await fetch('/api/ai/models', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: draft.provider,
          apiKey: draft.apiKey,
          baseUrl: draft.provider === 'custom' ? draft.baseUrl : undefined,
        }),
      });

      const responseBody = (await response.json().catch(() => ({}))) as {
        models?: AiModelOption[];
        error?: string;
      };

      if (!response.ok || !Array.isArray(responseBody.models)) {
        throw new Error(responseBody.error ?? 'Không tải được danh sách model.');
      }

      setModelOptions(responseBody.models);
      setLoadedModelKey(modelRequestKey);
      setModelSearch('');
      setIsModelPickerOpen(true);

      if (!draft.model && responseBody.models[0]?.id) {
        onChange({ model: responseBody.models[0].id });
      }
    } catch (error) {
      setModelOptions([]);
      setLoadedModelKey('');
      setModelError({
        key: modelRequestKey,
        message: error instanceof Error ? error.message : 'Không tải được danh sách model.',
      });
    } finally {
      setIsLoadingModels(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/70">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="inline-flex w-fit rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-gray-950">
          <ModeButton active={draft.mode === 'comment'} onClick={() => onChange({ mode: 'comment' })}>
            Comment thường
          </ModeButton>
          <ModeButton active={draft.mode === 'ai'} onClick={() => onChange({ mode: 'ai' })}>
            Hỏi AI
          </ModeButton>
        </div>

        {draft.mode === 'ai' && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <KeyRound className="h-4 w-4" aria-hidden="true" />
            API key chỉ dùng cho request này, không lưu vào localStorage.
          </div>
        )}
      </div>

      {draft.mode === 'ai' && (
        <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1fr)]">
          <label className="block min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Kênh AI
            </span>
            <select
              value={draft.provider}
              onChange={(event) => onChange({ provider: event.target.value as AiProvider, model: '' })}
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            >
              {providerOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="block min-w-0">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Model
            </span>
            {currentModelOptions.length > 0 ? (
              <div className="mt-1">
                <button
                  type="button"
                  onClick={() => setIsModelPickerOpen((current) => !current)}
                  className="flex min-h-10 w-full min-w-0 items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2 text-left text-sm transition hover:border-blue-300 focus:border-blue-400 focus:outline-none dark:border-gray-800 dark:bg-gray-950 dark:hover:border-blue-800 dark:focus:border-blue-700"
                  aria-expanded={isModelPickerOpen}
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold text-gray-900 dark:text-gray-100">
                      {selectedModel?.name || draft.model || 'Chọn model'}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                      {selectedModel?.name ? selectedModel.id : selectedModel?.owner || `${currentModelOptions.length} model đã tải`}
                    </span>
                  </span>
                  <ChevronDown
                    className={cn('h-4 w-4 shrink-0 text-gray-400 transition', isModelPickerOpen && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>

                {isModelPickerOpen && (
                  <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-950">
                    <div className="border-b border-gray-200 p-2 dark:border-gray-800">
                      <div className="flex items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-2 focus-within:border-blue-400 focus-within:bg-white dark:border-gray-800 dark:bg-gray-900 dark:focus-within:border-blue-700 dark:focus-within:bg-gray-950">
                        <Search className="h-4 w-4 shrink-0 text-gray-400" aria-hidden="true" />
                        <input
                          value={modelSearch}
                          onChange={(event) => setModelSearch(event.target.value)}
                          placeholder="Tìm model theo tên, id hoặc owner"
                          className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-400 dark:text-gray-100"
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span>{filteredModelOptions.length}/{currentModelOptions.length} model</span>
                        {selectedModel && (
                          <span className="truncate font-semibold text-blue-700 dark:text-blue-300">
                            Đang chọn: {selectedModel.name || selectedModel.id}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="max-h-56 overflow-y-auto p-1">
                      {filteredModelOptions.length > 0 ? (
                        filteredModelOptions.map((model) => {
                          const isSelected = model.id === draft.model;

                          return (
                            <button
                              key={model.id}
                              type="button"
                              onClick={() => {
                                onChange({ model: model.id });
                                setModelSearch('');
                                setIsModelPickerOpen(false);
                              }}
                              className={cn(
                                'flex w-full min-w-0 items-start gap-2 rounded-md px-2.5 py-2 text-left transition',
                                isSelected
                                  ? 'bg-blue-50 text-blue-900 dark:bg-blue-950/50 dark:text-blue-100'
                                  : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-900'
                              )}
                            >
                              <span
                                className={cn(
                                  'mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-blue-950'
                                    : 'border-gray-300 text-transparent dark:border-gray-700'
                                )}
                              >
                                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold">
                                  {model.name || model.id}
                                </span>
                                <span className="mt-0.5 block truncate text-xs text-gray-500 dark:text-gray-400">
                                  {model.name ? model.id : model.owner || 'OpenAI-compatible model'}
                                  {model.name && model.owner ? ` · ${model.owner}` : ''}
                                </span>
                              </span>
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-3 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          Không tìm thấy model phù hợp.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <input
                value={draft.model}
                onChange={(event) => onChange({ model: event.target.value })}
                placeholder="Tải danh sách hoặc nhập model thủ công"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              />
            )}
          </label>

          {draft.provider === 'custom' && (
            <label className="block min-w-0 md:col-span-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Base URL
              </span>
              <input
                value={draft.baseUrl}
                onChange={(event) => onChange({ baseUrl: event.target.value })}
                placeholder="https://.../v1"
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              />
              <span className="mt-1 block text-xs text-gray-500 dark:text-gray-400">
                {providerOptions.find((option) => option.value === draft.provider)?.hint}
              </span>
            </label>
          )}

          <label className="block min-w-0 md:col-span-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              API key
            </span>
            <input
              value={draft.apiKey}
              onChange={(event) => onChange({ apiKey: event.target.value })}
              type="password"
              placeholder="Nhập API key khi hỏi AI"
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            />
          </label>

          <div className="flex flex-col gap-2 md:col-span-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tải danh sách model do kênh AI cung cấp. API key chỉ cần khi gửi câu hỏi; Base URL chỉ cần nhập khi chọn Custom.
            </p>
            <button
              type="button"
              onClick={loadModels}
              disabled={!canLoadModels || isLoadingModels}
              className="inline-flex h-9 w-fit items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-60 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
            >
              <RefreshCw className={cn('h-4 w-4', isLoadingModels && 'animate-spin')} aria-hidden="true" />
              {isLoadingModels ? 'Đang tải model...' : 'Tải danh sách model'}
            </button>
          </div>

          {currentModelError && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200 md:col-span-2">
              {currentModelError}
            </div>
          )}
        </div>
      )}

      <label className="mt-3 block">
        <span className="sr-only">Nội dung comment</span>
        <textarea
          value={draft.body}
          onChange={(event) => onChange({ body: event.target.value })}
          rows={4}
          placeholder={draft.mode === 'ai' ? 'Nhập câu hỏi cho AI...' : 'Viết comment...'}
          className="w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
        />
      </label>

      <div className="mt-3 flex items-center justify-end gap-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition hover:bg-white hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-950 dark:hover:text-white"
          >
            <X className="h-4 w-4" aria-hidden="true" />
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-gray-950 px-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
        >
          <Send className="h-4 w-4" aria-hidden="true" />
          {isSubmitting ? 'Đang gửi...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

function ModeButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-3 py-1.5 text-sm font-semibold transition',
        active
          ? 'bg-gray-950 text-white shadow-sm dark:bg-white dark:text-gray-950'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white'
      )}
    >
      {children}
    </button>
  );
}

function CommentItem({
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
      ? comment.replies.slice(Math.max(comment.replies.length - visibleReplyPreviewCount, 0))
      : comment.replies;
  const hiddenReplyCount = Math.max(comment.replies.length - visibleReplies.length, 0);

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
          <CommentComposer
            draft={draft}
            isSubmitting={isSubmitting}
            submitLabel="Trả lời"
            onSubmit={(event) => onSubmit(event, comment.id)}
            onChange={(update) => onDraftChange(comment.id, update)}
            onCancel={() => onCancelReply(comment.id)}
          />
        </div>
      )}

      {isThreadOpen && comment.replies.length > 0 && (
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
            <CommentItem
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

function collectCommentBranchIds(comments: NoteComment[], commentId: string) {
  const deleteIds = new Set<string>();
  const childrenByParent = new Map<string, string[]>();

  comments.forEach((comment) => {
    if (!comment.parentId) {
      return;
    }

    childrenByParent.set(comment.parentId, [...(childrenByParent.get(comment.parentId) ?? []), comment.id]);
  });

  const visit = (id: string) => {
    deleteIds.add(id);
    (childrenByParent.get(id) ?? []).forEach(visit);
  };

  if (comments.some((comment) => comment.id === commentId)) {
    visit(commentId);
  }

  return deleteIds;
}

function countNestedReplies(comment: CommentNode): number {
  return comment.replies.reduce((count, reply) => count + 1 + countNestedReplies(reply), 0);
}

function getLatestActivityDate(comment: CommentNode): string {
  return [comment.createdAt, ...comment.replies.map(getLatestActivityDate)].sort(
    (left, right) => new Date(right).getTime() - new Date(left).getTime()
  )[0];
}

function hasStreamingComment(comment: CommentNode, streamingCommentIds: Set<string>): boolean {
  return streamingCommentIds.has(comment.id) || comment.replies.some((reply) => hasStreamingComment(reply, streamingCommentIds));
}

function plainTextPreview(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, ' [code] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function isLongComment(body: string) {
  return body.length > longCommentLength || body.split(/\r\n|\r|\n/).length > longCommentLineCount;
}

function buildCommentTree(comments: NoteComment[]) {
  const nodes = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, replies: [] });
  });

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.replies.push(node);
      return;
    }

    roots.push(node);
  });

  const sortByCreatedAt = (items: CommentNode[]) => {
    items.sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
    items.forEach((item) => sortByCreatedAt(item.replies));
  };

  sortByCreatedAt(roots);
  return roots;
}

function findCommentNode(comments: CommentNode[], commentId: string): CommentNode | null {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }

    const nested = findCommentNode(comment.replies, commentId);

    if (nested) {
      return nested;
    }
  }

  return null;
}

function getThreadHref(taskId: string, commentId: string) {
  return `/skill-roadmap/notes/${encodeURIComponent(taskId)}/comments/${encodeURIComponent(commentId)}`;
}

function createComment({
  parentId,
  author,
  body,
  model,
  provider,
}: {
  parentId: string | null;
  author: 'user' | 'ai';
  body: string;
  model?: string;
  provider?: string;
}): NoteComment {
  return {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    parentId,
    author,
    body,
    model,
    provider,
    createdAt: new Date().toISOString(),
  };
}

function summarizeMarkdown(markdown: string) {
  const normalized = markdown.trim();

  if (!normalized) {
    return 'Note Markdown hiện đang trống.';
  }

  const headingLines = normalized
    .split('\n')
    .filter((line) => /^#{1,6}\s+/.test(line.trim()))
    .slice(0, 24)
    .join('\n');
  const withoutLargeCode = normalized.replace(/```[\s\S]*?```/g, '[Code block đã được rút gọn]');
  const excerpt = withoutLargeCode.length > 8500 ? `${withoutLargeCode.slice(0, 8500)}\n[Markdown còn nội dung dài hơn.]` : withoutLargeCode;

  return [
    headingLines ? `Các heading chính:\n${headingLines}` : 'Không phát hiện heading Markdown.',
    '',
    'Trích nội dung note:',
    excerpt,
  ].join('\n');
}

function summarizeThread(comments: NoteComment[], focusCommentId: string) {
  const byId = new Map(comments.map((comment) => [comment.id, comment]));
  const focus = byId.get(focusCommentId);
  const ancestors: NoteComment[] = [];
  let current = focus;

  while (current?.parentId) {
    const parent = byId.get(current.parentId);

    if (!parent) {
      break;
    }

    ancestors.unshift(parent);
    current = parent;
  }

  const threadIds = new Set([...ancestors.map((comment) => comment.id), focusCommentId]);
  const related = comments.filter((comment) => threadIds.has(comment.id));
  const fallback = related.length ? related : comments.slice(-10);

  return fallback
    .map((comment, index) => {
      const author = comment.author === 'ai' ? `AI${comment.model ? ` (${comment.model})` : ''}` : 'User';
      const excerpt = comment.body.replace(/\s+/g, ' ').trim().slice(0, 1400);
      return `${index + 1}. ${author}: ${excerpt}`;
    })
    .join('\n');
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value));
}
