'use client';

import type { ChangeEvent, ComponentType, FormEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  BarChart3,
  BotMessageSquare,
  FileImage,
  FileText,
  ImagePlus,
  Loader2,
  MessageSquareText,
  Network,
  Send,
  Table2,
  Trash2,
} from 'lucide-react';
import { AiProviderSettings } from '@/components/roadmap/comments/AiProviderSettings';
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
  type AiModelOption,
  type CommentDraft,
} from '@/components/roadmap/comments/utils';
import { MarkdownPreview } from '@/components/markdown';
import { readStoredStudyComments, storeStudyComments } from '@/lib/roadmap';
import { cn } from '@/lib/utils';
import type { StudyComment, StudyCommentContext } from '@/types';

type AnalysisKind = 'stock' | 'technical' | 'table' | 'document' | 'general';

type UploadedImage = {
  id: string;
  name: string;
  mimeType: string;
  dataUrl: string;
  size: number;
};

type ImageAnalysisContext = Extract<StudyCommentContext, { type: 'image-analysis' }>;
type ImageAnalysisComment = StudyComment & { context: ImageAnalysisContext };

const maxImages = 4;
const maxImageSize = 8 * 1024 * 1024;

const analysisOptions: Array<{
  value: AnalysisKind;
  label: string;
  detail: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  {
    value: 'stock',
    label: 'Chứng khoán',
    detail: 'Chart giá, volume, indicator, vùng hỗ trợ/kháng cự.',
    icon: BarChart3,
  },
  {
    value: 'technical',
    label: 'Kỹ thuật',
    detail: 'Sơ đồ, kiến trúc, luồng xử lý, lỗi hệ thống.',
    icon: Network,
  },
  {
    value: 'table',
    label: 'Bảng dữ liệu',
    detail: 'Dashboard, bảng số liệu, xu hướng và outlier.',
    icon: Table2,
  },
  {
    value: 'document',
    label: 'Tài liệu',
    detail: 'Screenshot văn bản, form, báo cáo, ghi chú.',
    icon: FileText,
  },
  {
    value: 'general',
    label: 'Tổng quát',
    detail: 'Phân tích ảnh theo prompt tùy ý.',
    icon: BotMessageSquare,
  },
];

const defaultPromptByKind: Record<AnalysisKind, string> = {
  stock:
    'Phân tích biểu đồ trong ảnh: xu hướng chính, vùng hỗ trợ/kháng cự, tín hiệu đáng chú ý, rủi ro và các dữ liệu còn thiếu để ra quyết định.',
  technical:
    'Phân tích sơ đồ hoặc ảnh kỹ thuật: thành phần chính, luồng xử lý, điểm nghẽn, rủi ro thiết kế và đề xuất kiểm chứng.',
  table:
    'Phân tích bảng dữ liệu trong ảnh: insight chính, giá trị bất thường, xu hướng, điểm cần đối chiếu và kết luận có thể hành động.',
  document:
    'Đọc và phân tích nội dung trong ảnh: tóm tắt ý chính, thông tin quan trọng, điểm bất thường và việc cần làm tiếp theo.',
  general:
    'Phân tích ảnh theo các chi tiết có thể quan sát được, nêu nhận định chính, bằng chứng, giới hạn dữ liệu và bước tiếp theo.',
};

const workspaceTaskId = 'ai-image-analysis-workspace';

function createImageId(file: File) {
  return `${file.name}-${file.size}-${file.lastModified}-${Math.random().toString(36).slice(2)}`;
}

function createLocalId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatFileSize(size: number) {
  if (size < 1024 * 1024) {
    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(1)} MB`;
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

function getAnalysisLabel(kind: string) {
  return analysisOptions.find((option) => option.value === kind)?.label ?? 'Tổng quát';
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
        return;
      }

      reject(new Error('Không đọc được file ảnh.'));
    };
    reader.onerror = () => reject(new Error('Không đọc được file ảnh.'));
    reader.readAsDataURL(file);
  });
}

function makeInitialDraft(): CommentDraft {
  return {
    ...defaultDraft,
    mode: 'ai',
  };
}

function getDraft(drafts: Record<string, CommentDraft>, key: string) {
  return drafts[key] ?? defaultDraft;
}

function isImageAnalysisComment(comment: StudyComment): comment is ImageAnalysisComment {
  return comment.taskId === workspaceTaskId && comment.context.type === 'image-analysis';
}

function sameImageAnalysisContext(comment: StudyComment, root: StudyComment | null) {
  return (
    Boolean(root) &&
    isImageAnalysisComment(comment) &&
    root?.context.type === 'image-analysis' &&
    comment.context.analysisId === root.context.analysisId
  );
}

export function AiImageAnalysisWorkspace() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [analysisKind, setAnalysisKind] = useState<AnalysisKind>('stock');
  const [prompt, setPrompt] = useState(defaultPromptByKind.stock);
  const [draft, setDraft] = useState<CommentDraft>(makeInitialDraft);
  const [modelOptions, setModelOptions] = useState<AiModelOption[]>([]);
  const [modelSearch, setModelSearch] = useState('');
  const [isModelPickerOpen, setIsModelPickerOpen] = useState(false);
  const [loadedModelKey, setLoadedModelKey] = useState('');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<{ key: string; message: string } | null>(null);
  const [isReadingFiles, setIsReadingFiles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allComments, setAllComments] = useState<StudyComment[]>([]);
  const [activeAnalysisRootId, setActiveAnalysisRootId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, CommentDraft>>({ root: defaultDraft });
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submittingKey, setSubmittingKey] = useState<string | null>(null);
  const [streamingCommentIds, setStreamingCommentIds] = useState<Set<string>>(new Set());
  const [expandedCommentIds, setExpandedCommentIds] = useState<Set<string>>(new Set());
  const [openThreadIds, setOpenThreadIds] = useState<Set<string>>(new Set());
  const [expandedReplyGroupIds, setExpandedReplyGroupIds] = useState<Set<string>>(new Set());
  const [visibleCommentCount, setVisibleCommentCount] = useState(getVisibleCommentBatchSize);
  const [error, setError] = useState<string | null>(null);

  const usesServerApiKey = draft.provider === 'kilo';
  const modelRequestKey = [
    draft.provider,
    draft.provider === 'custom' ? draft.baseUrl.trim() : '',
    usesServerApiKey ? draft.confirmPassword : '',
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
  const selectedAnalysisOption = useMemo(
    () => analysisOptions.find((option) => option.value === analysisKind) ?? analysisOptions[0],
    [analysisKind]
  );
  const imageAnalysisRoots = useMemo<ImageAnalysisComment[]>(
    () => allComments.filter(isImageAnalysisComment).filter((comment) => !comment.parentId),
    [allComments]
  );
  const historyItems = useMemo(() => {
    const childrenByParent = new Map<string, StudyComment[]>();

    allComments.filter(isImageAnalysisComment).forEach((comment) => {
      if (!comment.parentId) {
        return;
      }

      childrenByParent.set(comment.parentId, [...(childrenByParent.get(comment.parentId) ?? []), comment]);
    });

    const collectBranch = (comment: StudyComment): StudyComment[] => [
      comment,
      ...(childrenByParent.get(comment.id) ?? []).flatMap(collectBranch),
    ];

    return imageAnalysisRoots
      .map((root) => {
        const branch = collectBranch(root);
        const context = root.context.type === 'image-analysis' ? root.context : null;
        const latestAt = branch
          .map((comment) => comment.createdAt)
          .sort((left, right) => new Date(right).getTime() - new Date(left).getTime())[0];

        return {
          rootId: root.id,
          title: root.title?.trim() || plainTextPreview(context?.prompt || root.body).slice(0, 90) || 'Phân tích ảnh',
          latestAt,
          analysisKind: context?.analysisKind ?? 'general',
          imageCount: context?.imageCount ?? 0,
          commentCount: Math.max(branch.length - 1, 0),
          prompt: context?.prompt ?? '',
        };
      })
      .sort((left, right) => new Date(right.latestAt).getTime() - new Date(left.latestAt).getTime());
  }, [allComments, imageAnalysisRoots]);
  const activeAnalysisRoot = useMemo(
    () => imageAnalysisRoots.find((comment) => comment.id === activeAnalysisRootId) ?? null,
    [activeAnalysisRootId, imageAnalysisRoots]
  );
  const activeContextComments = useMemo(
    () => allComments.filter((comment) => sameImageAnalysisContext(comment, activeAnalysisRoot)),
    [activeAnalysisRoot, allComments]
  );
  const activeResultComments = useMemo(
    () => activeContextComments.filter((comment) => comment.id !== activeAnalysisRoot?.id),
    [activeAnalysisRoot?.id, activeContextComments]
  );
  const commentTree = useMemo(
    () => sortCommentNodesNewestFirst(buildCommentTree(activeResultComments)),
    [activeResultComments]
  );
  const visibleStep = getVisibleCommentBatchSize();
  const visibleCommentTree = commentTree.slice(0, visibleCommentCount);
  const hiddenCommentCount = Math.max(commentTree.length - visibleCommentTree.length, 0);
  const canLoadModels =
    (draft.provider !== 'custom' || Boolean(draft.baseUrl.trim())) &&
    (!usesServerApiKey || Boolean(draft.confirmPassword.trim()));
  const hasModelOrServerDefault = draft.provider === 'kilo' || draft.model.trim().length > 0;
  const hasRequiredCredential = !usesServerApiKey || Boolean(draft.confirmPassword.trim());
  const canSubmit =
    images.length > 0 && prompt.trim().length > 0 && hasModelOrServerDefault && hasRequiredCredential && !isSubmitting;
  const displayedImageCount =
    activeAnalysisRoot?.context.type === 'image-analysis'
      ? activeAnalysisRoot.context.imageCount
      : images.length;

  useEffect(() => {
    window.queueMicrotask(() => {
      const storedComments = readStoredStudyComments();
      const latestImageHistory = storedComments
        .filter((comment) => isImageAnalysisComment(comment) && !comment.parentId)
        .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0];

      setAllComments(storedComments);

      if (latestImageHistory) {
        setActiveAnalysisRootId(latestImageHistory.id);
      }
    });
  }, []);

  useEffect(() => {
    window.queueMicrotask(() => setVisibleCommentCount(getVisibleCommentBatchSize()));
  }, [activeAnalysisRootId]);

  const loadModels = useCallback(async () => {
    setModelError(null);
    setIsLoadingModels(true);

    try {
      const response = await fetch('/api/ai/models', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: draft.provider,
          apiKey: usesServerApiKey ? undefined : draft.apiKey,
          confirmPassword: usesServerApiKey ? draft.confirmPassword : undefined,
          baseUrl: draft.provider === 'custom' ? draft.baseUrl : undefined,
        }),
      });

      const responseBody = (await response.json().catch(() => ({}))) as {
        models?: AiModelOption[];
        defaultModel?: string;
        error?: string;
      };

      if (!response.ok || !Array.isArray(responseBody.models)) {
        throw new Error(responseBody.error ?? 'Không tải được danh sách model.');
      }

      setModelOptions(responseBody.models);
      setLoadedModelKey(modelRequestKey);
      setModelSearch('');
      setIsModelPickerOpen(true);

      const defaultModel = responseBody.defaultModel?.trim();
      const nextModel = defaultModel || responseBody.models[0]?.id || '';

      if (!draft.model && nextModel) {
        setDraft((current) => ({ ...current, model: nextModel }));
      }
    } catch (loadError) {
      setModelOptions([]);
      setLoadedModelKey('');
      setModelError({
        key: modelRequestKey,
        message: loadError instanceof Error ? loadError.message : 'Không tải được danh sách model.',
      });
    } finally {
      setIsLoadingModels(false);
    }
  }, [
    draft.apiKey,
    draft.baseUrl,
    draft.confirmPassword,
    draft.model,
    draft.provider,
    modelRequestKey,
    usesServerApiKey,
  ]);

  function updateDraft(update: Partial<CommentDraft>) {
    setDraft((current) => ({ ...current, ...update, mode: 'ai' }));
  }

  function updateAnalysisKind(value: AnalysisKind) {
    setAnalysisKind(value);
    setPrompt(defaultPromptByKind[value]);
  }

  function resetCommentState() {
    setDrafts({ root: defaultDraft });
    setReplyingTo(null);
    setSubmittingKey(null);
    setStreamingCommentIds(new Set());
    setExpandedCommentIds(new Set());
    setOpenThreadIds(new Set());
    setExpandedReplyGroupIds(new Set());
    setVisibleCommentCount(getVisibleCommentBatchSize());
  }

  function startNewAnalysis() {
    setActiveAnalysisRootId(null);
    setImages([]);
    setAnalysisKind('stock');
    setPrompt(defaultPromptByKind.stock);
    setError(null);
    resetCommentState();

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  async function addFiles(fileList: FileList | File[]) {
    const files = Array.from(fileList);

    if (!files.length) {
      return;
    }

    setError(null);
    setIsReadingFiles(true);
    setActiveAnalysisRootId(null);
    resetCommentState();

    try {
      const acceptedFiles = files.slice(0, Math.max(maxImages - images.length, 0));
      const nextImages: UploadedImage[] = [];

      for (const file of acceptedFiles) {
        if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
          throw new Error(`File "${file.name}" không phải PNG, JPG hoặc WebP.`);
        }

        if (file.size > maxImageSize) {
          throw new Error(`File "${file.name}" vượt quá giới hạn 8MB.`);
        }

        nextImages.push({
          id: createImageId(file),
          name: file.name,
          mimeType: file.type,
          size: file.size,
          dataUrl: await readFileAsDataUrl(file),
        });
      }

      setImages((current) => [...current, ...nextImages].slice(0, maxImages));
    } catch (readError) {
      setError(readError instanceof Error ? readError.message : 'Không đọc được ảnh upload.');
    } finally {
      setIsReadingFiles(false);

      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  }

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files) {
      void addFiles(event.target.files);
    }
  }

  function persist(nextComments: StudyComment[]) {
    setAllComments(nextComments);
    storeStudyComments(nextComments);
  }

  function updateCommentDraft(key: string, update: Partial<CommentDraft>) {
    setDrafts((current) => ({ ...current, [key]: { ...getDraft(current, key), ...update } }));
  }

  function clearCommentDraft(key: string) {
    setDrafts((current) => ({ ...current, [key]: defaultDraft }));
  }

  function updateComment(commentId: string, body: string) {
    setAllComments((current) => {
      const next = current.map((comment) => (comment.id === commentId ? { ...comment, body } : comment));
      storeStudyComments(next);
      return next;
    });
  }

  function updateAnalysisTitle(commentId: string, title: string) {
    setAllComments((current) => {
      const next = current.map((comment) => (comment.id === commentId ? { ...comment, title } : comment));
      storeStudyComments(next);
      return next;
    });
  }

  function restoreHistory(rootId: string) {
    const root = imageAnalysisRoots.find((comment) => comment.id === rootId);

    setActiveAnalysisRootId(rootId);
    setImages([]);
    setReplyingTo(null);
    setError(null);
    setOpenThreadIds((current) => new Set(current).add(rootId));

    if (root?.context.type === 'image-analysis') {
      const restoredKind = analysisOptions.some((option) => option.value === root.context.analysisKind)
        ? root.context.analysisKind as AnalysisKind
        : 'general';

      setAnalysisKind(restoredKind);
      setPrompt(root.context.prompt);
    }
  }

  function deleteHistory(rootId: string) {
    const deleteIds = collectCommentBranchIds(allComments, rootId);
    persist(allComments.filter((comment) => !deleteIds.has(comment.id)));

    if (activeAnalysisRootId === rootId) {
      setActiveAnalysisRootId(null);
      setReplyingTo(null);
      setOpenThreadIds((current) => {
        const next = new Set(current);
        deleteIds.forEach((id) => next.delete(id));
        return next;
      });
    }
  }

  async function generateAnalysisTitle(rootId: string, question: string, result: string) {
    try {
      const response = await fetch('/api/ai/context-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          studyContext: [
            `Loại phân tích: ${selectedAnalysisOption.label}`,
            `Số ảnh: ${images.length}`,
            '',
            'Kết quả AI:',
            result,
          ].join('\n'),
        }),
      });

      if (!response.ok) {
        return;
      }

      const body = (await response.json().catch(() => ({}))) as { title?: string };
      const title = body.title?.trim();

      if (title) {
        updateAnalysisTitle(rootId, title);
      }
    } catch {
      // Title generation is best-effort; history falls back to prompt/result preview.
    }
  }

  async function streamAiResponse(parentId: string, commentDraft: CommentDraft, userQuestion: string, baseComments: StudyComment[]) {
    if (!activeAnalysisRoot) {
      return;
    }

    const baseContextComments = baseComments.filter((comment) =>
      sameImageAnalysisContext(comment, activeAnalysisRoot)
    );
    const contextContent = [
      'Bạn đang trả lời comment về kết quả phân tích ảnh đã lưu.',
      '',
      '## Prompt phân tích ban đầu',
      activeAnalysisRoot.context.type === 'image-analysis' ? activeAnalysisRoot.context.prompt : prompt,
      '',
      '## Kết quả phân tích ảnh',
      activeAnalysisRoot.body,
    ].join('\n');
    const aiComment: StudyComment = {
      ...createComment({
        parentId,
        author: 'ai',
        body: '',
        model: commentDraft.model,
        provider: commentDraft.provider,
      }),
      taskId: workspaceTaskId,
      context: activeAnalysisRoot.context,
    };
    persist([...baseComments, aiComment]);
    setStreamingCommentIds((current) => new Set(current).add(aiComment.id));

    try {
      const response = await fetch('/api/ai/comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: commentDraft.provider,
          apiKey: commentDraft.provider === 'kilo' ? undefined : commentDraft.apiKey,
          confirmPassword: commentDraft.provider === 'kilo' ? commentDraft.confirmPassword : undefined,
          baseUrl: commentDraft.provider === 'custom' ? commentDraft.baseUrl : undefined,
          model: commentDraft.model,
          question: userQuestion,
          studyContext: contextContent,
          threadContext: summarizeThread(baseContextComments, parentId),
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

    if (!activeAnalysisRoot) {
      setError('Hãy phân tích ảnh hoặc chọn một lịch sử trước khi comment.');
      return;
    }

    const key = parentId ?? 'root';
    const commentDraft = getDraft(drafts, key);
    const body = commentDraft.body.trim();

    if (!body) {
      setError('Vui lòng nhập nội dung comment.');
      return;
    }

    setSubmittingKey(key);

    const realParentId = parentId ?? activeAnalysisRoot.id;
    const userComment: StudyComment = {
      ...createComment({ parentId: realParentId, author: 'user', body }),
      taskId: workspaceTaskId,
      context: activeAnalysisRoot.context,
    };
    const nextComments = [...allComments, userComment];
    persist(nextComments);
    clearCommentDraft(key);
    setReplyingTo(null);
    setOpenThreadIds((current) => new Set(current).add(userComment.id));

    if (commentDraft.mode === 'ai') {
      await streamAiResponse(userComment.id, commentDraft, body, nextComments);
    }

    setSubmittingKey(null);
  }

  function deleteComment(commentId: string) {
    const deleteIds = collectCommentBranchIds(activeContextComments, commentId);
    persist(allComments.filter((comment) => !deleteIds.has(comment.id)));
  }

  async function submitAnalysis() {
    setError(null);

    if (!images.length) {
      setError('Vui lòng upload ít nhất một ảnh.');
      return;
    }

    if (!prompt.trim()) {
      setError('Vui lòng nhập prompt phân tích.');
      return;
    }

    if (!draft.model.trim() && draft.provider !== 'kilo') {
      setError('Vui lòng nhập hoặc chọn model vision/multimodal.');
      return;
    }

    if (usesServerApiKey && !draft.confirmPassword.trim()) {
      setError('Vui lòng nhập mật khẩu xác nhận để dùng AI cấu hình trong env.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/ai/image-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: draft.provider,
          apiKey: usesServerApiKey ? undefined : draft.apiKey,
          confirmPassword: usesServerApiKey ? draft.confirmPassword : undefined,
          baseUrl: draft.provider === 'custom' ? draft.baseUrl : undefined,
          model: draft.model,
          analysisKind,
          prompt,
          images: images.map((image) => ({
            name: image.name,
            mimeType: image.mimeType,
            dataUrl: image.dataUrl,
          })),
        }),
      });

      const responseBody = (await response.json().catch(() => ({}))) as {
        analysis?: string;
        error?: string;
      };

      if (!response.ok || !responseBody.analysis) {
        throw new Error(responseBody.error ?? 'Không nhận được kết quả phân tích.');
      }

      const analysisId = createLocalId();
      const createdAt = new Date().toISOString();
      const rootComment: StudyComment = {
        ...createComment({
          parentId: null,
          author: 'ai',
          body: responseBody.analysis,
          model: draft.model,
          provider: draft.provider,
        }),
        title: plainTextPreview(prompt).slice(0, 90) || `Phân tích ${selectedAnalysisOption.label}`,
        createdAt,
        taskId: workspaceTaskId,
        context: {
          type: 'image-analysis',
          analysisId,
          analysisKind,
          prompt: prompt.trim(),
          imageCount: images.length,
          imageNames: images.map((image) => image.name),
          model: draft.model || undefined,
          provider: draft.provider,
        },
      };
      const nextComments = [...allComments, rootComment];

      persist(nextComments);
      setActiveAnalysisRootId(rootComment.id);
      setOpenThreadIds((current) => new Set(current).add(rootComment.id));
      void generateAnalysisTitle(rootComment.id, prompt, responseBody.analysis);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Không thể phân tích ảnh.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 border-b border-gray-200 p-4 dark:border-gray-800 md:flex-row md:items-center md:justify-between md:p-5">
          <div className="min-w-0">
            <Link
              href="/ai-context"
              className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-gray-950 dark:text-gray-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              AI Context
            </Link>
            <h1 className="mt-3 flex items-center gap-2 text-2xl font-bold text-gray-950 dark:text-white md:text-3xl">
              <FileImage className="h-7 w-7 text-blue-600 dark:text-blue-400" />
              AI Image Analysis
            </h1>
            <button
              type="button"
              onClick={startNewAnalysis}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-sm font-semibold text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/70 dark:bg-blue-950/30 dark:text-blue-200 dark:hover:border-blue-800 dark:hover:bg-blue-950/50"
            >
              <ImagePlus className="h-4 w-4" aria-hidden="true" />
              Phân tích mới
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:min-w-[360px]">
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Ảnh</p>
              <p className="mt-1 text-lg font-bold text-gray-950 dark:text-white">{displayedImageCount}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Loại</p>
              <p className="mt-1 truncate text-sm font-bold text-blue-700 dark:text-blue-300">{selectedAnalysisOption.label}</p>
            </div>
            <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-950">
              <p className="text-[11px] font-semibold uppercase text-gray-500 dark:text-gray-400">Model</p>
              <p className="mt-1 truncate text-sm font-bold text-emerald-700 dark:text-emerald-300">
                {draft.model || 'Chưa chọn'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-4 lg:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)] md:p-5">
          <section className="space-y-4">
            <div
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                void addFiles(event.dataTransfer.files);
              }}
              className={cn(
                'flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-5 text-center transition',
                images.length >= maxImages
                  ? 'border-gray-200 bg-gray-50 text-gray-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-500'
                  : 'border-blue-200 bg-blue-50/60 text-blue-800 hover:border-blue-300 dark:border-blue-900/70 dark:bg-blue-950/20 dark:text-blue-200'
              )}
            >
              <ImagePlus className="h-8 w-8" aria-hidden="true" />
              <p className="mt-3 text-sm font-bold">
                {images.length >= maxImages ? 'Đã đủ 4 ảnh' : 'Upload ảnh phân tích'}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                PNG, JPG hoặc WebP, tối đa 8MB mỗi ảnh
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={images.length >= maxImages || isReadingFiles}
                className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-gray-950 px-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
              >
                {isReadingFiles ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                {isReadingFiles ? 'Đang đọc ảnh...' : 'Chọn ảnh'}
              </button>
            </div>

            {images.length > 0 && (
              <div className="grid gap-3 sm:grid-cols-2">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950"
                  >
                    <div className="aspect-video bg-gray-100 dark:bg-gray-900">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={image.dataUrl}
                        alt={image.name}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 px-3 py-2">
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-gray-900 dark:text-white">{image.name}</p>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400">{formatFileSize(image.size)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))}
                        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-500 transition hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-200"
                        aria-label="Xóa ảnh"
                        title="Xóa ảnh"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-950">
              <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-3 py-2 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="text-sm font-bold text-gray-950 dark:text-white">Lịch sử phân tích</h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={startNewAnalysis}
                    className="inline-flex h-8 items-center gap-1.5 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-bold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 dark:hover:border-blue-800 dark:hover:text-blue-300"
                  >
                    <ImagePlus className="h-3.5 w-3.5" aria-hidden="true" />
                    Mới
                  </button>
                  <span className="rounded-md bg-indigo-50 px-2 py-1 text-xs font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-200">
                    {historyItems.length}
                  </span>
                </div>
              </div>
              <div className="max-h-80 space-y-2 overflow-y-auto p-3">
                {historyItems.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-gray-200 bg-white px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                    Chưa có lịch sử phân tích ảnh.
                  </p>
                ) : (
                  historyItems.map((item) => {
                    const isActive = item.rootId === activeAnalysisRootId;

                    return (
                      <div
                        key={item.rootId}
                        className={cn(
                          'group flex items-start gap-2 rounded-lg border p-2 transition',
                          isActive
                            ? 'border-indigo-300 bg-indigo-50 shadow-sm dark:border-indigo-800 dark:bg-indigo-950/30'
                            : 'border-gray-200 bg-white hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700'
                        )}
                      >
                        <button
                          type="button"
                          onClick={() => restoreHistory(item.rootId)}
                          className="min-w-0 flex-1 p-1 text-left"
                        >
                          <span className="block truncate text-sm font-semibold text-gray-950 dark:text-white">
                            {item.title}
                          </span>
                          <span className="mt-1 flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <span>{getAnalysisLabel(item.analysisKind)}</span>
                            <span>{item.imageCount} ảnh</span>
                            <span>{item.commentCount} comment</span>
                          </span>
                          <span className="mt-2 block text-xs font-medium text-gray-500 dark:text-gray-400">
                            {formatHistoryDate(item.latestAt)}
                          </span>
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteHistory(item.rootId)}
                          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-red-500 opacity-100 transition hover:bg-red-50 hover:text-red-700 dark:text-red-300 dark:hover:bg-red-950/40 dark:hover:text-red-200 md:opacity-0 md:group-hover:opacity-100"
                          aria-label="Xóa lịch sử phân tích"
                          title="Xóa lịch sử phân tích"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </section>

          <section className="min-w-0 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Loại phân tích
              </span>
              <select
                value={analysisKind}
                onChange={(event) => updateAnalysisKind(event.target.value as AnalysisKind)}
                className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 outline-none transition focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
              >
                {analysisOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-2 sm:grid-cols-2">
              {analysisOptions.map((option) => {
                const Icon = option.icon;
                const active = option.value === analysisKind;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => updateAnalysisKind(option.value)}
                    className={cn(
                      'min-h-20 rounded-lg border p-3 text-left transition',
                      active
                        ? 'border-blue-300 bg-blue-50 shadow-sm dark:border-blue-800 dark:bg-blue-950/30'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-white dark:border-gray-800 dark:bg-gray-950 dark:hover:border-gray-700 dark:hover:bg-gray-900'
                    )}
                  >
                    <span className="flex items-center gap-2 text-sm font-bold text-gray-950 dark:text-white">
                      <Icon className={cn('h-4 w-4', active ? 'text-blue-600 dark:text-blue-300' : 'text-gray-500')} />
                      {option.label}
                    </span>
                    <span className="mt-1 block text-xs leading-5 text-gray-500 dark:text-gray-400">{option.detail}</span>
                  </button>
                );
              })}
            </div>

            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Prompt
              </span>
              <textarea
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                rows={5}
                className="mt-1 w-full resize-y rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm leading-6 text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-blue-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                placeholder="Nhập yêu cầu phân tích ảnh..."
              />
            </label>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-800 dark:bg-gray-900/70">
              <div className="mb-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-950 dark:text-white">Cấu hình AI</p>
                  <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                    Chọn model có hỗ trợ vision/multimodal
                  </p>
                </div>
              </div>
              <AiProviderSettings
                draft={draft}
                onChange={updateDraft}
                usesServerApiKey={usesServerApiKey}
                currentModelOptions={currentModelOptions}
                selectedModel={selectedModel}
                isModelPickerOpen={isModelPickerOpen}
                setIsModelPickerOpen={setIsModelPickerOpen}
                filteredModelOptions={filteredModelOptions}
                modelSearch={modelSearch}
                setModelSearch={setModelSearch}
                canLoadModels={canLoadModels}
                isLoadingModels={isLoadingModels}
                loadModels={loadModels}
                currentModelError={currentModelError}
              />
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={submitAnalysis}
                disabled={!canSubmit}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-gray-950 px-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {isSubmitting ? 'Đang phân tích...' : 'Phân tích ảnh'}
              </button>
            </div>
          </section>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
          {error}
        </div>
      )}

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex min-w-0 items-center gap-2">
            <BotMessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-950 dark:text-white">Kết quả phân tích</h2>
              {activeAnalysisRoot?.context.type === 'image-analysis' && (
                <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                  {getAnalysisLabel(activeAnalysisRoot.context.analysisKind)} · {activeAnalysisRoot.context.imageCount} ảnh
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="min-h-60 p-4">
          {isSubmitting ? (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-sm font-medium text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Đang chờ AI phân tích ảnh...
            </div>
          ) : activeAnalysisRoot ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                  {activeAnalysisRoot.title || 'Phân tích ảnh'}
                </span>
                {activeAnalysisRoot.model && (
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {activeAnalysisRoot.model}
                  </span>
                )}
                <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {formatHistoryDate(activeAnalysisRoot.createdAt)}
                </span>
              </div>
              {activeAnalysisRoot.context.type === 'image-analysis' && (
                <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm leading-6 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                  <span className="font-semibold text-gray-950 dark:text-white">Prompt: </span>
                  {activeAnalysisRoot.context.prompt}
                </div>
              )}
              <MarkdownPreview content={activeAnalysisRoot.body} />
            </div>
          ) : (
            <div className="flex min-h-48 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
              Chưa có kết quả. Hãy phân tích ảnh mới hoặc chọn một lịch sử.
            </div>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
          <div className="flex min-w-0 items-center gap-2">
            <MessageSquareText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-gray-950 dark:text-white">Comment kết quả</h2>
              <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                Comment thường hoặc hỏi AI dựa trên kết quả phân tích đang mở
              </p>
            </div>
          </div>
        </div>
        <div className="p-4">
          {!activeAnalysisRoot && (
            <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              Hãy phân tích ảnh hoặc chọn một lịch sử trước khi comment.
            </div>
          )}

          <CommentForm
            draft={getDraft(drafts, 'root')}
            isSubmitting={submittingKey === 'root'}
            submitLabel="Gửi"
            onSubmit={(event) => submitComment(event, null)}
            onChange={(update) => updateCommentDraft('root', update)}
          />

          <div className="mt-4 space-y-3">
            {commentTree.length === 0 ? (
              <p className="rounded-lg border border-dashed border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-400">
                Chưa có comment cho kết quả này.
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
                    clearCommentDraft(commentId);
                  }}
                  onDraftChange={updateCommentDraft}
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
  );
}
