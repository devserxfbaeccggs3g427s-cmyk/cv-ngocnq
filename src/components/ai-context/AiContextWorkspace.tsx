'use client';

import type { FormEvent } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, BotMessageSquare, FileText, ListChecks, MessageSquareText, Search, Trash2 } from 'lucide-react';
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

  const contextContent = useMemo(() => {
    const fileSections = selectedFiles.map((file) =>
      [`# Markdown file: ${file.title}`, `- ID: ${file.id}`, '', file.content.trim() || 'File đang trống.'].join('\n')
    );
    const taskSections = selectedTasks.map((task) => summarizeTask(task, progress.items[task.id]?.note));

    return truncateContext(
      [
        'Bạn đang trả lời dựa trên context học tập được người dùng chọn thủ công.',
        '',
        ...fileSections,
        ...taskSections,
      ].join('\n\n---\n\n')
    );
  }, [progress.items, selectedFiles, selectedTasks]);

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
      ...createComment({ parentId, author: 'ai', body: '', model: draft.model, provider: draft.provider }),
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
          apiKey: draft.provider === 'kilo' ? undefined : draft.apiKey,
          confirmPassword: draft.provider === 'kilo' ? draft.confirmPassword : undefined,
          baseUrl: draft.provider === 'custom' ? draft.baseUrl : undefined,
          model: draft.model,
          question,
          studyContext: contextContent,
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
    <div className="space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="min-w-0">
            <Link
              href="/skill-roadmap"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-950 dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Roadmap
            </Link>
            <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white md:text-3xl">
              <BotMessageSquare className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              AI Context
            </h1>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Nguồn</p>
              <p className="mt-1 text-lg font-bold text-gray-950 dark:text-white">{selectedSourceCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Markdown</p>
              <p className="mt-1 text-lg font-bold text-blue-700 dark:text-blue-300">{selectedFiles.length}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Task</p>
              <p className="mt-1 text-lg font-bold text-emerald-700 dark:text-emerald-300">{selectedTasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(320px,420px)_minmax(0,1fr)]">
        <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <MessageSquareText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h2 className="text-sm font-bold text-gray-950 dark:text-white">Lịch sử</h2>
              </div>
              <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200">
                {historyItems.length}
              </span>
            </div>
            <div className="max-h-64 space-y-2 overflow-y-auto p-3">
              {historyItems.length === 0 ? (
                <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
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
                        'group flex items-start gap-2 rounded-lg border p-2 transition',
                        isActive
                          ? 'border-indigo-300 bg-indigo-50 shadow-sm dark:border-indigo-800 dark:bg-indigo-950/30'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 dark:hover:bg-gray-900'
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => restoreHistoryContext(item)}
                        className="min-w-0 flex-1 p-1 text-left"
                      >
                        <span className="block truncate text-sm font-semibold text-gray-950 dark:text-white">
                          {item.title}
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span>{item.summary}</span>
                          <span>{Math.max(item.commentCount - 1, 0)} trả lời</span>
                        </span>
                        <span className="mt-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                          {formatHistoryDate(item.latestAt)}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteHistoryThread(item.rootId)}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-500 opacity-100 transition hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-200 md:opacity-0 md:group-hover:opacity-100"
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

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <h2 className="text-sm font-bold text-gray-950 dark:text-white">File Markdown</h2>
              </div>
              <span className="rounded-md bg-blue-50 px-2 py-1 text-xs font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-200">
                {selectedFiles.length}/{markdownFiles.length}
              </span>
            </div>
            <div className="space-y-3 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={fileQuery}
                  onChange={(event) => setFileQuery(event.target.value)}
                  placeholder="Tìm file Markdown"
                  className="min-h-10 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                {filteredFiles.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Không có file phù hợp.
                  </p>
                ) : (
                  filteredFiles.map((file) => (
                    <label
                      key={file.id}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition',
                        selectedFileIds.includes(file.id)
                          ? 'border-blue-300 bg-blue-50 shadow-sm dark:border-blue-800 dark:bg-blue-950/30'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 dark:hover:bg-gray-900'
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selectedFileIds.includes(file.id)}
                        onChange={() => toggleSelection(file.id, selectedFileIds, setSelectedFileIds)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-gray-900 dark:text-white">{file.title}</span>
                        <span className="mt-1 line-clamp-2 block text-xs leading-5 text-gray-500 dark:text-gray-400">
                          {file.content.trim() || 'File đang trống.'}
                        </span>
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                <h2 className="text-sm font-bold text-gray-950 dark:text-white">Task ôn tập</h2>
              </div>
              <span className="rounded-md bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                {selectedTasks.length}/{leafTasks.length}
              </span>
            </div>
            <div className="space-y-3 p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  value={taskQuery}
                  onChange={(event) => setTaskQuery(event.target.value)}
                  placeholder="Tìm task"
                  className="min-h-10 w-full rounded-lg border border-gray-200 bg-gray-50 py-2 pl-9 pr-3 text-sm text-gray-900 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-950 dark:text-white"
                />
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
                {filteredTasks.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-200 px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
                    Không có task phù hợp.
                  </p>
                ) : (
                  filteredTasks.map((task) => {
                    const parentPath = getTaskParentPath(task);

                    return (
                      <label
                        key={task.id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition',
                          selectedTaskIds.includes(task.id)
                            ? 'border-emerald-300 bg-emerald-50 shadow-sm dark:border-emerald-800 dark:bg-emerald-950/30'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 dark:hover:bg-gray-900'
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedTaskIds.includes(task.id)}
                          onChange={() => toggleSelection(task.id, selectedTaskIds, setSelectedTaskIds)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="min-w-0 flex-1" title={[...parentPath, task.title].join(' / ')}>
                          <span className="flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase leading-5 text-gray-500 dark:text-gray-400">
                            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">{task.trackTitle}</span>
                            <span className="text-gray-300 dark:text-gray-600">/</span>
                            <span className="rounded-md bg-gray-100 px-1.5 py-0.5 dark:bg-gray-800">{task.moduleTitle}</span>
                          </span>

                          {task.parentTasks.length > 0 && (
                            <span className="mt-2 block rounded-md border-l-2 border-emerald-200 bg-white/70 px-2 py-1 text-xs leading-5 text-gray-600 dark:border-emerald-900/70 dark:bg-gray-900/70 dark:text-gray-300">
                              <span className="font-semibold text-gray-700 dark:text-gray-200">Cha: </span>
                              {task.parentTasks.map((parent, index) => (
                                <span key={parent.id}>
                                  {index > 0 && <span className="px-1 text-gray-400">/</span>}
                                  <span>{parent.title}</span>
                                </span>
                              ))}
                            </span>
                          )}

                          <span
                            className="mt-2 block border-l-2 border-emerald-500 pl-2"
                            style={{ marginLeft: `${Math.min(task.depth, 4) * 6}px` }}
                          >
                            <span className="block text-sm font-semibold leading-5 text-gray-900 dark:text-white">
                              {task.title}
                            </span>
                            <span className="mt-1 flex flex-wrap items-center gap-2 text-xs leading-5 text-gray-500 dark:text-gray-400">
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

        <section className="min-w-0 rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800 md:flex-row md:items-center md:justify-between">
            <div className="flex min-w-0 items-center gap-2">
              <MessageSquareText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <div className="min-w-0">
                <h2 className="text-sm font-bold text-gray-950 dark:text-white">Hội thoại</h2>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
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
                className="inline-flex h-9 items-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-950 dark:hover:text-white"
              >
                <Trash2 className="h-4 w-4" />
                Bỏ chọn
              </button>
            )}
          </div>

          <div className="p-4">

        {!context && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            Chọn ít nhất một nguồn context trước khi hỏi AI.
          </div>
        )}

        {context && (
          <div className="mb-4 flex flex-wrap gap-2">
            {context.sources.map((source) => (
              <span
                key={`${source.type}:${source.id}`}
                className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200"
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
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mt-4 space-y-3">
          {commentTree.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
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
              className="inline-flex h-9 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
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
