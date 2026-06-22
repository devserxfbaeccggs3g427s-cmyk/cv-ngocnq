import type { NoteComment, CommentNode } from '@/types';
import { formatDate as sharedFormatDate } from '@/lib/roadmap';

export type CommentMode = 'comment' | 'ai';
export type AiProvider = 'openrouter' | 'kilo' | 'custom';

export type SeedProgress = {
  updatedAt: string | null;
  items: Record<string, { note?: string; completed?: boolean; completedAt?: string | null; updatedAt?: string }>;
};

export type CommentDraft = {
  mode: CommentMode;
  body: string;
  provider: AiProvider;
  baseUrl: string;
  model: string;
  apiKey: string;
  confirmPassword: string;
};

export type AiModelOption = {
  id: string;
  name?: string;
  owner?: string;
};

export const commentsStorageKey = 'skill-roadmap-note-comments:v1';
export const progressStorageKey = 'skill-roadmap-progress:v1';
export const longCommentLength = 900;
export const longCommentLineCount = 14;
export const initialVisibleRootThreads = 6;
export const defaultVisibleCommentBatchSize = 5;
export const visibleReplyPreviewCount = 2;

export const defaultDraft: CommentDraft = {
  mode: 'comment',
  body: '',
  provider: 'kilo',
  baseUrl: '',
  model: '',
  apiKey: '',
  confirmPassword: '',
};

export const providerOptions: Array<{ value: AiProvider; label: string; hint: string }> = [
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

export function buildCommentTree(comments: NoteComment[]): CommentNode[] {
  const nodes = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  comments.forEach((comment) => {
    nodes.set(comment.id, { ...comment, children: [] });
  });

  nodes.forEach((node) => {
    if (node.parentId && nodes.has(node.parentId)) {
      nodes.get(node.parentId)?.children.push(node);
      return;
    }

    roots.push(node);
  });

  const sortByCreatedAt = (items: CommentNode[]) => {
    items.sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
    items.forEach((item) => sortByCreatedAt(item.children));
  };

  sortByCreatedAt(roots);
  return roots;
}

export function getVisibleCommentBatchSize() {
  const configured =
    Number(process.env.NEXT_PUBLIC_COMMENT_VISIBLE_COUNT) ||
    Number(process.env.NEXT_PUBLIC_STUDY_COMMENT_VISIBLE_COUNT);

  return Number.isFinite(configured) && configured > 0
    ? Math.floor(configured)
    : defaultVisibleCommentBatchSize;
}

export function sortCommentNodesNewestFirst<T extends { createdAt: string; children: T[] }>(comments: T[]): T[] {
  return [...comments]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .map((comment) => ({ ...comment, children: sortCommentNodesNewestFirst(comment.children) }));
}

export function createComment({
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

export const formatDate = sharedFormatDate;

export function summarizeMarkdown(markdown: string) {
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

export function collectCommentBranchIds(comments: NoteComment[], commentId: string) {
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

export function countNestedReplies(comment: CommentNode): number {
  return comment.children.reduce((count, reply) => count + 1 + countNestedReplies(reply), 0);
}

export function getLatestActivityDate(comment: CommentNode): string {
  return [comment.createdAt, ...comment.children.map(getLatestActivityDate)].sort(
    (left, right) => new Date(right).getTime() - new Date(left).getTime()
  )[0];
}

export function hasStreamingComment(comment: CommentNode, streamingCommentIds: Set<string>): boolean {
  return streamingCommentIds.has(comment.id) || comment.children.some((reply) => hasStreamingComment(reply, streamingCommentIds));
}

export function plainTextPreview(markdown: string) {
  return stripAiReasoning(markdown)
    .replace(/```[\s\S]*?```/g, ' [code] ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]+\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function splitAiReasoning(markdown: string) {
  const openMatch = markdown.match(/<think(?:ing)?>/i);

  if (!openMatch || openMatch.index === undefined) {
    return {
      reasoning: '',
      answer: markdown,
      hasOpenReasoning: false,
    };
  }

  const before = markdown.slice(0, openMatch.index);
  const afterOpen = markdown.slice(openMatch.index + openMatch[0].length);
  const closeMatch = afterOpen.match(/<\/think(?:ing)?>/i);

  if (!closeMatch || closeMatch.index === undefined) {
    return {
      reasoning: afterOpen.trim(),
      answer: before.trim(),
      hasOpenReasoning: true,
    };
  }

  const reasoning = afterOpen.slice(0, closeMatch.index).trim();
  const afterClose = afterOpen.slice(closeMatch.index + closeMatch[0].length);

  return {
    reasoning,
    answer: [before, afterClose].filter((part) => part.trim()).join('\n\n').trim(),
    hasOpenReasoning: false,
  };
}

export function stripAiReasoning(markdown: string) {
  return splitAiReasoning(markdown).answer || markdown.replace(/<\/?think(?:ing)?>/gi, '').trim();
}

export function isLongComment(body: string) {
  return body.length > longCommentLength || body.split(/\r\n|\r|\n/).length > longCommentLineCount;
}

export function findCommentNode(comments: CommentNode[], commentId: string): CommentNode | null {
  for (const comment of comments) {
    if (comment.id === commentId) {
      return comment;
    }

    const nested = findCommentNode(comment.children, commentId);

    if (nested) {
      return nested;
    }
  }

  return null;
}

export function getThreadHref(taskId: string, commentId: string) {
  return `/skill-roadmap/notes/${encodeURIComponent(taskId)}/comments/${encodeURIComponent(commentId)}`;
}

export function summarizeThread(comments: NoteComment[], focusCommentId: string) {
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
