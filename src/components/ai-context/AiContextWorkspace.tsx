'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, ListChecks, MessageSquareText, Search, Trash2 } from 'lucide-react';
import { CommentBubble } from '@/components/roadmap/comments/CommentBubble';
import { CommentForm } from '@/components/roadmap/comments/CommentForm';
import {
  buildCommentTree,
  collectCommentBranchIds,
  createComment,
  defaultDraft,
  getVisibleCommentBatchSize,
  plainTextPreview,
  sortCommentNodesNewestFirst,
  summarizeThread,
  type CommentDraft,
} from '@/components/roadmap/comments/utils';
import { useProgress } from '@/hooks';
import { cn } from '@/lib/utils';
import {
  getLeafTaskContexts,
  readStoredMarkdownFiles,
  readStoredStudyComments,
  storeStudyComments,
} from '@/lib/roadmap';
import type { MarkdownFile, Roadmap, StudyComment, StudyCommentContext, TaskContext } from '@/types';

const workspaceTaskId = 'ai-context-workspace';
const maxContextChars = 18000;

type AiReviewContext = Extract<StudyCommentContext, { type: 'ai-review' }>;
type AiContextRequestItem = {
  sourceType: 'markdown-file' | 'roadmap-task';
  title: string;
  content: string;
};

type AiReviewHistoryItem = {
  rootId: string;
  contextId: string;
  sources: AiReviewContext['sources'];
  commentCount: number;
  latestAt: string;
  title: string;
  summary: string;
};

function getDraft(drafts: Record<string, CommentDraft>, key: string) {
  return drafts[key] ?? defaultDraft;
}

function isMarkdownFile(entry: unknown): entry is MarkdownFile {
  return Boolean(entry && typeof entry === 'object' && 'type' in entry && entry.type === 'file');
}

function truncateContext(content: string) {
  return content.length > maxContextChars
    ? `${content.slice(0, maxContextChars)}\n\n[Context đã được rút gọn vì quá dài.]`
    : content;
}

function sameAiContext(comment: StudyComment, context: StudyCommentContext | null) {
  return (
    context?.type === 'ai-review' &&
    comment.taskId === workspaceTaskId &&
    comment.context.type === 'ai-review' &&
    comment.context.contextId === context.contextId
  );
}

function isAiReviewComment(comment: StudyComment) {
  return comment.taskId === workspaceTaskId && comment.context.type === 'ai-review';
}

function buildContextId(fileIds: string[], taskIds: string[]) {
  return [
    'ai-review',
    `files:${[...fileIds].sort().join(',') || 'none'}`,
    `tasks:${[...taskIds].sort().join(',') || 'none'}`,
  ].join('|');
}

function taskMatchesQuery(task: TaskContext, query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return true;
  }

  return [task.title, task.id, task.trackTitle, task.moduleTitle, task.deliverable, ...task.parentTasks.map((parent) => parent.title)]
    .some((value) => value.toLowerCase().includes(normalized));
}

function getTaskParentPath(task: TaskContext) {
  return [task.trackTitle, task.moduleTitle, ...task.parentTasks.map((parent) => parent.title)];
}

function summarizeTask(task: TaskContext, note: string | undefined) {
  return [
    `## Task: ${task.title}`,
    `- ID: ${task.id}`,
    `- Track: ${task.trackTitle}`,
    `- Module: ${task.moduleTitle}`,
    `- Level: ${task.level}`,
    `- Estimate: ${task.estimateHours}h`,
    `- Deliverable: ${task.deliverable}`,
    '',
    note?.trim() ? `### Note đã lưu\n${note.trim()}` : '### Note đã lưu\nTask này chưa có note.',
  ].join('\n');
}

function formatHistoryDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function AiContextWorkspace({ roadmap }: { roadmap: Roadmap }) {
  const { progress } = useProgress(roadmap);
  const [markdownFiles, setMarkdownFiles] = useState<MarkdownFile[]>([]);
  const [allComments, setAllComments] = useState<StudyComment[]>([]);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [fileQuery, setFileQuery] = useState('');
  const [taskQuery, setTaskQuery] = useState('');
  const [drafts, setDrafts] = useState<Record<string, CommentDraft>>({ root: defaultDraft });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [streamingCommentIds, setStreamingCommentIds] = useState<Set<string>>(new Set());
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(new Set());
  const [openThreadIds, setOpenThreadIds] = useState<Set<string>>(new Set());
  const [expandedReplyGroupIds, setExpandedReplyGroupIds] = useState<Set<string>>(new Set());
  const [selectedHistoryRootId, setSelectedHistoryRootId] = useState<string | null>(null);
  const [visibleCommentCount, setVisibleCommentCount] = useState(getVisibleCommentBatchSize);
  const [error, setError] = useState<string | null>(null);

  const leafTasks = useMemo(() => getLeafTaskContexts(roadmap.tracks), [roadmap.tracks]);
  const selectedFiles = useMemo(
    () => markdownFiles.filter((file) => selectedFileIds.includes(file.id)),
    [markdownFiles, selectedFileIds]
  );
  const selectedTasks = useMemo(
    () => leafTasks.filter((task) => selectedTaskIds.includes(task.id)),
    [leafTasks, selectedTaskIds]
  );
  const filteredFiles = useMemo(() => {
    const query = fileQuery.trim().toLowerCase();
    return markdownFiles.filter((file) =>
      query ? [file.title, file.content].some((value) => value.toLowerCase().includes(query)) : true
    );
  }, [fileQuery, markdownFiles]);
  const filteredTasks = useMemo(
    () => leafTasks.filter((task) => taskMatchesQuery(task, taskQuery)).slice(0, 80),
    [leafTasks, taskQuery]
  );

  const contextItems = useMemo<AiContextRequestItem[]>(
    () => [
      ...selectedFiles.map((file) => ({
        sourceType: 'markdown-file' as const,
        title: file.title,
        content: [`# Markdown file: ${file.title}`, `- ID: ${file.id}`, '', file.content.trim() || 'File đang trống.'].join('\n'),
      })),
      ...selectedTasks.map((task) => ({
        sourceType: 'roadmap-task' as const,
        title: task.title,
        content: summarizeTask(task, progress.items[task.id]?.note),
      })),
    ],
    [progress.items, selectedFiles, selectedTasks]
  );

  const contextContent = useMemo(
    () =>
      truncateContext(
        [
          'Bạn đang trả lời dựa trên context học tập được người dùng chọn thủ công.',
          '',
          ...contextItems.map((item) => item.content),
        ].join('\n\n---\n\n')
      ),
    [contextItems]
  );

  const context = useMemo<AiReviewContext | null>(() => {
    if (selectedFiles.length === 0 && selectedTasks.length === 0) {
      return null;
    }

    return {
      type: 'ai-review',
      contextId: buildContextId(selectedFileIds, selectedTaskIds),
      sources: [
        ...selectedFiles.map((file) => ({ type: 'markdown-file' as const, id: file.id, title: file.title })),
        ...selectedTasks.map((task) => ({ type: 'roadmap-task' as const, id: task.id, title: task.title })),
      ],
    };
  }, [selectedFileIds, selectedFiles, selectedTaskIds, selectedTasks]);
  const activeContextId = context?.type === 'ai-review' ? context.contextId : 'empty';

  const comments = useMemo(
    () => allComments.filter((comment) => sameAiContext(comment, context)),
    [allComments, context]
  );
  const historyItems = useMemo<AiReviewHistoryItem[]>(() => {
    const aiReviewComments = allComments.filter(isAiReviewComment);
    const commentById = new Map(aiReviewComments.map((comment) => [comment.id, comment]));
    const childrenByParent = new Map<string, StudyComment[]>();

    aiReviewComments.forEach((comment) => {
      if (!comment.parentId) {
        return;
      }

      childrenByParent.set(comment.parentId, [...(childrenByParent.get(comment.parentId) ?? []), comment]);
    });

    const collectBranch = (comment: StudyComment): StudyComment[] => [
      comment,
      ...(childrenByParent.get(comment.id) ?? []).flatMap(collectBranch),
    ];

    return aiReviewComments
      .filter((comment) => !comment.parentId || !commentById.has(comment.parentId))
      .map((rootComment) => {
        const branch = collectBranch(rootComment);
        const context = rootComment.context.type === 'ai-review' ? rootComment.context : null;
        const sources = context?.sources ?? [];
        const markdownCount = sources.filter((source) => source.type === 'markdown-file').length;
        const taskCount = sources.filter((source) => source.type === 'roadmap-task').length;
        const title = rootComment.title?.trim() || plainTextPreview(rootComment.body).slice(0, 96) || 'Thread AI Context';
        const latestAt = branch
          .map((comment) => comment.createdAt)
          .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

        return {
          rootId: rootComment.id,
          contextId: context?.contextId ?? '',
          sources,
          commentCount: branch.length,
          latestAt,
          title,
          summary: `${markdownCount} Markdown · ${taskCount} task`,
        };
      })
      .sort(
        (left, right) => new Date(right.latestAt).getTime() - new Date(left.latestAt).getTime()
      );
  }, [allComments]);
  const commentTree = useMemo(() => sortCommentNodesNewestFirst(buildCommentTree(comments)), [comments]);
  const visibleStep = getVisibleCommentBatchSize();
  const visibleCommentTree = commentTree.slice(0, visibleCommentCount);
  const hiddenCommentCount = Math.max(commentTree.length - visibleCommentTree.length, 0);
  const selectedSourceCount = selectedFiles.length + selectedTasks.length;

  useEffect(() => {
    window.queueMicrotask(() => {
      setMarkdownFiles(readStoredMarkdownFiles().filter(isMarkdownFile));
      setAllComments(readStoredStudyComments());
    });
  }, []);

  useEffect(() => {
    window.queueMicrotask(() => setVisibleCommentCount(getVisibleCommentBatchSize()));
  }, [activeContextId]);

  function persist(nextComments: StudyComment[]) {
    setAllComments(nextComments);
    storeStudyComments(nextComments);
  }

  function toggleSelection(value: string, selected: string[], setSelected: (next: string[]) => void) {
    setSelected(selected.includes(value) ? selected.filter((item) => item !== value) : [...selected, value]);
    setSelectedHistoryRootId(null);
  }

  function restoreHistoryContext(item: AiReviewHistoryItem) {
    const availableFileIds = new Set(markdownFiles.map((file) => file.id));
    const availableTaskIds = new Set(leafTasks.map((task) => task.id));

    setSelectedFileIds(
      item.sources
        .filter((source) => source.type === 'markdown-file' && availableFileIds.has(source.id))
        .map((source) => source.id)
    );
    setSelectedTaskIds(
      item.sources
        .filter((source) => source.type === 'roadmap-task' && availableTaskIds.has(source.id))
        .map((source) => source.id)
    );
    setReplyingTo(null);
    setSelectedHistoryRootId(item.rootId);
    setOpenThreadIds((current) => new Set(current).add(item.rootId));
    setError(null);
  }

  function deleteHistoryThread(rootId: string) {
    const deleteIds = collectCommentBranchIds(allComments, rootId);
    persist(allComments.filter((comment) => !deleteIds.has(comment.id)));

    if (selectedHistoryRootId === rootId) {
      setSelectedHistoryRootId(null);
      setSelectedFileIds([]);
      setSelectedTaskIds([]);
      setReplyingTo(null);
      setOpenThreadIds((current) => {
        const next = new Set(current);
        deleteIds.forEach((id) => next.delete(id));
        return next;
      });
    }
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

  function updateCommentTitle(commentId: string, title: string) {
    setAllComments((current) => {
      const next = current.map((comment) => (comment.id === commentId ? { ...comment, title } : comment));
      storeStudyComments(next);
      return next;
    });
  }

  async function generateThreadTitle(commentId: string, question: string) {
    try {
      const response = await fetch('/api/ai/context-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          studyContext: contextContent,
        }),
      });

      if (!response.ok) {
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { title?: string };
      const title = body.title?.trim();

      if (title) {
        updateCommentTitle(commentId, title);
      }
    } catch {
      // Title generation is best-effort; the history falls back to the question preview.
    }
  }

  async function streamAiResponse(parentId: string | null, draft: CommentDraft, question: string, baseComments: StudyComment[]) {
    if (!context) {
      return;
    }

    const baseContextComments = baseComments.filter((comment) => sameAiContext(comment, context));
    const aiComment: StudyComment = {
      ...createComment({
        parentId,
        author: 'ai',
        body: 'Đang tóm lược từng nguồn context trước khi trả lời...',
        model: draft.model,
        provider: draft.provider,
      }),
      taskId: workspaceTaskId,
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
          apiKey: draft.apiKey,
          baseUrl: draft.provider === 'custom' ? draft.baseUrl : undefined,
          model: draft.model,
          question,
          studyContext: contextContent,
          studyContextItems: contextItems,
          threadContext: parentId
            ? summarizeThread(baseContextComments, parentId)
            : 'Chưa có lịch sử trao đổi trong thread context này.',
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

      aiBody += decoder.decode();
      updateComment(aiComment.id, aiBody.trim() || 'AI provider không trả về nội dung.');
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
      setError('Hãy chọn ít nhất một file Markdown hoặc một task ôn tập để làm context.');
      return;
    }

    const key = parentId ?? 'root';
    const draft = getDraft(drafts, key);
    const body = draft.body.trim();

    if (!body) {
      setError('Vui lòng nhập nội dung trước khi gửi.');
      return;
    }

    setSubmittingKey(key);

    const userComment: StudyComment = {
      ...createComment({ parentId, author: 'user', body }),
      taskId: workspaceTaskId,
      context,
    };
    const nextComments = [...allComments, userComment];
    persist(nextComments);
    clearDraft(key);
    setReplyingTo(null);

    if (!parentId) {
      setOpenThreadIds((current) => new Set(current).add(userComment.id));
      void generateThreadTitle(userComment.id, body);
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
    <div className="space-y-10">
      <header className="border-b border-[var(--line)] pb-8">
        <div className="mb-6">
          <Link
            href="/workspace"
            className="group inline-flex items-center gap-2 text-sm font-medium text-[var(--fg-muted)] transition-colors hover:text-[var(--fg)]"
          >
            <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
            Quay lại Workspace
          </Link>
        </div>

        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="min-w-0">
            <div className="mb-4 flex items-center gap-3">
              <span className="rule-short" />
              <span className="eyebrow">AI Tools</span>
            </div>
            <h1 className="font-serif text-3xl font-normal leading-[1.05] tracking-tight text-[var(--fg)] sm:text-4xl md:text-5xl">
              AI Context
            </h1>
            <p className="mt-3 max-w-xl text-base leading-7 text-[var(--fg-muted)]">
              Chọn file Markdown hoặc task roadmap làm context rồi chat AI theo thread có lịch sử.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-x-6 gap-y-1 md:gap-x-8">
            <div className="border-t border-[var(--line)] pt-3">
              <dt className="eyebrow">Nguồn</dt>
              <dd className="stat-number mt-2 text-3xl text-[var(--fg)]">{selectedSourceCount}</dd>
            </div>
            <div className="border-t border-[var(--line)] pt-3">
              <dt className="eyebrow">Markdown</dt>
              <dd className="stat-number mt-2 text-3xl text-[var(--accent)]">{selectedFiles.length}</dd>
            </div>
            <div className="border-t border-[var(--line)] pt-3">
              <dt className="eyebrow">Task</dt>
              <dd className="stat-number mt-2 text-3xl text-[var(--fg)]">{selectedTasks.length}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(300px,400px)_minmax(0,1fr)] xl:gap-5 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <aside className="space-y-4 lg:sticky lg:top-20 lg:self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-[var(--fg-muted)]" />
                <h2 className="text-sm font-semibold text-[var(--fg)]">Lịch sử</h2>
              </div>
              <span className="badge">{historyItems.length}</span>
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto p-3 lg:max-h-64">
              {historyItems.length === 0 ? (
                <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--line)] px-3 py-4 text-center text-sm text-[var(--fg-muted)]">
                  Chưa có lịch sử AI Context.
                </p>
              ) : (
                historyItems.map((item) => {
                  const isActive =
                    context?.type === 'ai-review' &&
                    context.contextId === item.contextId &&
                    selectedHistoryRootId === item.rootId;

                  return (
                    <div
                      key={item.rootId}
                      className={cn(
                        'group flex items-start gap-2 rounded-[var(--radius-card)] border p-2 transition',
                        isActive
                          ? 'border-[var(--fg)] bg-[var(--surface-2)]'
                          : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--fg-subtle)] hover:bg-[var(--surface-2)]'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => restoreHistoryContext(item)}
                        className="min-w-0 flex-1 p-1 text-left"
                      >
                        <span className="block truncate text-sm font-semibold text-[var(--fg)]">
                          {item.title}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--fg-muted)]">
                          <span>{item.summary}</span>
                          <span>{Math.max(item.commentCount - 1, 0)} trả lời</span>
                        </span>
                        <span className="mt-2 block text-xs font-medium text-[var(--fg-subtle)]">
                          {formatHistoryDate(item.latestAt)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHistoryThread(item.rootId)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-[var(--fg-subtle)] opacity-100 transition hover:bg-[var(--surface-2)] hover:text-[var(--fg)] md:opacity-0 md:group-hover:opacity-100"
                        aria-label="Xóa lịch sử chat"
                        title="Xóa lịch sử chat"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--fg-muted)]" />
                <h2 className="text-sm font-semibold text-[var(--fg)]">File Markdown</h2>
              </div>
              <span className="badge">{selectedFiles.length}/{markdownFiles.length}</span>
            </div>
            <div className="space-y-3 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                <input
                  value={fileQuery}
                  onChange={(event) => setFileQuery(event.target.value)}
                  placeholder="Tìm file Markdown"
                  className="input-modern min-h-10 w-full py-2 pl-9 pr-3 text-sm"
                />
              </div>
              <div className="max-h-56 space-y-2 overflow-y-auto pr-1 lg:max-h-72">
                {filteredFiles.length === 0 ? (
                  <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--line)] px-3 py-4 text-center text-sm text-[var(--fg-muted)]">
                    Không có file phù hợp.
                  </p>
                ) : (
                  filteredFiles.map((file) => (
                    <label
                      key={file.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border p-3 transition',
                        selectedFileIds.includes(file.id)
                          ? 'border-[var(--fg)] bg-[var(--surface-2)]'
                          : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--fg-subtle)] hover:bg-[var(--surface-2)]'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={() => toggleSelection(file.id, selectedFileIds, setSelectedFileIds)}
                        className="mt-1 h-4 w-4 rounded border-[var(--line-strong)] accent-[var(--accent)]"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[var(--fg)]">{file.title}</span>
                        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-[var(--fg-muted)]">
                          {file.content.trim() || 'File đang trống.'}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-[var(--fg-muted)]" />
                <h2 className="text-sm font-semibold text-[var(--fg)]">Task ôn tập</h2>
              </div>
              <span className="badge">{selectedTasks.length}/{leafTasks.length}</span>
            </div>
            <div className="space-y-3 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--fg-subtle)]" />
                <input
                  value={taskQuery}
                  onChange={(event) => setTaskQuery(event.target.value)}
                  placeholder="Tìm task"
                  className="input-modern min-h-10 w-full py-2 pl-9 pr-3 text-sm"
                />
              </div>
              <div className="max-h-60 space-y-2 overflow-y-auto pr-1 lg:max-h-80">
                {filteredTasks.length === 0 ? (
                  <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--line)] px-3 py-4 text-center text-sm text-[var(--fg-muted)]">
                    Không có task phù hợp.
                  </p>
                ) : (
                  filteredTasks.map((task) => {
                    const parentPath = getTaskParentPath(task);

                    return (
                      <label
                        key={task.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-[var(--radius-card)] border p-3 transition',
                          selectedTaskIds.includes(task.id)
                            ? 'border-[var(--fg)] bg-[var(--surface-2)]'
                            : 'border-[var(--line)] bg-[var(--surface)] hover:border-[var(--fg-subtle)] hover:bg-[var(--surface-2)]'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={() => toggleSelection(task.id, selectedTaskIds, setSelectedTaskIds)}
                          className="mt-1 h-4 w-4 rounded border-[var(--line-strong)] accent-[var(--accent)]"
                        />
                        <span className="min-w-0 flex-1" title={[...parentPath, task.title].join(' / ')}>
                          <span className="flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase leading-5 text-[var(--fg-muted)]">
                            <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[var(--fg-muted)]">{task.trackTitle}</span>
                            <span className="text-[var(--fg-subtle)]">/</span>
                            <span className="rounded-md bg-[var(--surface-2)] px-1.5 py-0.5 text-[var(--fg-muted)]">{task.moduleTitle}</span>
                          </span>

                          {task.parentTasks.length > 0 && (
                            <span className="mt-2 block rounded-md border-l-2 border-[var(--line-strong)] bg-[var(--surface-2)] px-2 py-1 text-xs leading-5 text-[var(--fg-muted)]">
                              <span className="font-semibold text-[var(--fg)]">Cha: </span>
                              {task.parentTasks.map((parent, index) => (
                                <span key={parent.id}>
                                  {index > 0 && <span className="px-1 text-[var(--fg-subtle)]">/</span>}
                                  <span>{parent.title}</span>
                                </span>
                              ))}
                            </span>
                          )}

                          <span
                            className="mt-2 block border-l-2 border-[var(--fg)] pl-2"
                            style={{ marginLeft: `${Math.min(task.depth, 4) * 6}px` }}
                          >
                            <span className="block text-sm font-semibold leading-5 text-[var(--fg)]">
                              {task.title}
                            </span>
                            <span className="mt-1 flex flex-wrap items-center gap-2 text-xs leading-5 text-[var(--fg-muted)]">
                              <span className="font-mono">{task.id}</span>
                              <span>{task.level}</span>
                              <span>{task.estimateHours}h</span>
                              <span>{task.parentTasks.length} task cha</span>
                            </span>
                          </span>
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </aside>

        <section className="card min-w-0 overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-[var(--line)] px-4 py-3 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-[var(--fg-muted)]" />
              <div className="min-w-0">
                <h2 className="text-sm font-semibold text-[var(--fg)]">Hội thoại</h2>
                <p className="truncate text-xs text-[var(--fg-muted)]">
                  {context ? `${commentTree.length} thread trong context đang mở` : 'Chọn lịch sử hoặc nguồn context'}
                </p>
              </div>
            </div>
            {selectedSourceCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setSelectedFileIds([]);
                  setSelectedTaskIds([]);
                  setSelectedHistoryRootId(null);
                }}
                className="btn btn-ghost"
              >
                <Trash2 className="h-4 w-4" />
                Bỏ chọn
              </button>
            )}
          </div>

          <div className="p-3 sm:p-4">

        {!context && (
          <div className="mb-4 border border-[var(--line-strong)] bg-[var(--surface-2)] px-3 py-2 text-sm font-medium text-[var(--fg)]">
            Chọn ít nhất một nguồn context trước khi hỏi AI.
          </div>
        )}

        {context && (
          <div className="mb-4 flex flex-wrap gap-2">
            {context.sources.map((source) => (
              <span
                key={`${source.type}:${source.id}`}
                className="badge"
              >
                {source.type === 'markdown-file' ? 'Markdown' : 'Task'} · {source.title}
              </span>
            ))}
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
          <div className="mt-3 border border-[var(--line-strong)] bg-[var(--surface-2)] px-3 py-2 text-sm font-medium text-[var(--fg)]">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {commentTree.length === 0 ? (
            <p className="rounded-[var(--radius-card)] border border-dashed border-[var(--line)] bg-[var(--surface-2)] px-3 py-4 text-center text-sm text-[var(--fg-muted)]">
              Chưa có lịch sử cho context này.
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
              className="btn btn-secondary"
            >
              Xem thêm {Math.min(visibleStep, hiddenCommentCount)} comment cũ hơn
            </button>
          </div>
        )}
          </div>
      </section>
      </div>
    </div>
  );
}
