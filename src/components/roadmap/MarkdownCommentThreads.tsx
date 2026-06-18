'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Bot,
  ChevronDown,
  ChevronUp,
  KeyRound,
  MessageSquarePlus,
  Reply,
  Send,
  Trash2,
  UserRound,
  X,
} from 'lucide-react';
import { MarkdownPreview } from '@/components/markdown/MarkdownPreview';
import { cn } from '@/lib/utils';

type CommentMode = 'comment' | 'ai';
type AiProvider = 'openrouter' | 'custom';

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

type CommentNode = NoteComment & {
  replies: CommentNode[];
};

const commentsStorageKey = 'skill-roadmap-note-comments:v1';
const longCommentLength = 900;
const longCommentLineCount = 14;
const defaultDraft: CommentDraft = {
  mode: 'comment',
  body: '',
  provider: 'openrouter',
  baseUrl: '',
  model: '',
  apiKey: '',
};

const providerOptions: Array<{ value: AiProvider; label: string; hint: string }> = [
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(() => new Set());
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

  const toggleCommentExpanded = (commentId: string) => {
    setExpandedCommentIds((current) => {
      const next = new Set(current);

      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }

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

    try {
      const questionComment = createComment({
        parentId,
        author: 'user',
        body,
      });
      const nextBeforeAi = [...comments, questionComment];

      saveComments(nextBeforeAi);
      resetDraft(draftKey);
      setReplyingTo(null);

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

      const responseBody = (await response.json().catch(() => ({}))) as { answer?: string; error?: string };

      if (!response.ok || !responseBody.answer) {
        throw new Error(responseBody.error ?? 'Không nhận được câu trả lời từ AI.');
      }

      const aiReply = createComment({
        parentId: questionComment.id,
        author: 'ai',
        body: responseBody.answer,
        model: draft.model,
        provider: draft.provider,
      });

      saveComments([...nextBeforeAi, aiReply]);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không gửi được câu hỏi tới AI.');
    } finally {
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
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm font-semibold text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
          <MessageSquarePlus className="h-4 w-4" aria-hidden="true" />
          {commentCount} comment
        </div>
      </div>

      <div className="space-y-5 p-4 sm:p-5">
        <CommentComposer
          draft={getDraft('root')}
          isSubmitting={submittingKey === 'root'}
          submitLabel="Gửi"
          onSubmit={(event) => submitDraft(event, null)}
          onChange={(update) => updateDraft('root', update)}
        />

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
            commentTree.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                depth={0}
                replyingTo={replyingTo}
                getDraft={getDraft}
                submittingKey={submittingKey}
                expandedCommentIds={expandedCommentIds}
                onReply={setReplyingTo}
                onDelete={deleteCommentBranch}
                onToggleExpanded={toggleCommentExpanded}
                onCancelReply={(commentId) => {
                  setReplyingTo(null);
                  resetDraft(commentId);
                }}
                onDraftChange={updateDraft}
                onSubmit={submitDraft}
              />
            ))
          )}
        </div>
      </div>
    </section>
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
              onChange={(event) => onChange({ provider: event.target.value as AiProvider })}
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
            <input
              value={draft.model}
              onChange={(event) => onChange({ model: event.target.value })}
              placeholder="Nhập model theo provider"
              className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
            />
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
  expandedCommentIds,
  onReply,
  onDelete,
  onToggleExpanded,
  onCancelReply,
  onDraftChange,
  onSubmit,
}: {
  comment: CommentNode;
  depth: number;
  replyingTo: string | null;
  getDraft: (key: string) => CommentDraft;
  submittingKey: string | null;
  expandedCommentIds: Set<string>;
  onReply: (commentId: string) => void;
  onDelete: (commentId: string) => void;
  onToggleExpanded: (commentId: string) => void;
  onCancelReply: (commentId: string) => void;
  onDraftChange: (key: string, update: Partial<CommentDraft>) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>, parentId: string | null) => void;
}) {
  const isAi = comment.author === 'ai';
  const compactDepth = Math.min(depth, 4);
  const draft = getDraft(comment.id);
  const isSubmitting = submittingKey === comment.id;
  const isLong = isLongComment(comment.body);
  const isExpanded = expandedCommentIds.has(comment.id);

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
              <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(comment.createdAt)}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
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

        <div className="mt-3 rounded-md bg-white/72 dark:bg-gray-950/45">
          <div
            className={cn(
              'relative overflow-hidden p-3',
              isLong && !isExpanded && 'max-h-72'
            )}
          >
            <MarkdownPreview content={comment.body} />
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
                    Xem thêm nội dung Markdown
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </article>

      {replyingTo === comment.id && (
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

      {comment.replies.length > 0 && (
        <div className="mt-3 space-y-3">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              depth={depth + 1}
              replyingTo={replyingTo}
              getDraft={getDraft}
              submittingKey={submittingKey}
              expandedCommentIds={expandedCommentIds}
              onReply={onReply}
              onDelete={onDelete}
              onToggleExpanded={onToggleExpanded}
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
