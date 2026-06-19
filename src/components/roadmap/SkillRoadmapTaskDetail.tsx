'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Brain,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  CircleHelp,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  FileText,
  GitBranch,
  Layers,
  Loader2,
  ListTree,
  RotateCcw,
  Save,
  Sparkles,
  StickyNote,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';

type RoadmapTask = {
  id: string;
  title: string;
  level: string;
  estimateHours: number;
  deliverable: string;
  children?: RoadmapTask[];
};

type TaskContext = RoadmapTask & {
  trackTitle: string;
  moduleTitle: string;
  depth: number;
  parentTasks: Array<Pick<RoadmapTask, 'id' | 'title'>>;
};

type ProgressItem = {
  completed: boolean;
  note: string;
  completedAt: string | null;
  updatedAt: string;
};

type ProgressFile = {
  updatedAt: string | null;
  items: Record<string, ProgressItem>;
};

type NoteComment = {
  id: string;
  parentId: string | null;
  author: 'user' | 'ai';
  body: string;
  createdAt: string;
  model?: string;
  provider?: string;
};

type Flashcard = {
  id: string;
  front: string;
  back: string;
  hint: string;
  tag: string;
};

type FlashcardDeck = {
  taskId: string;
  taskTitle: string;
  createdAt: string;
  source: {
    noteCharacters: number;
    commentCount: number;
  };
  cards: Flashcard[];
};

const progressStorageKey = 'skill-roadmap-progress:v1';
const commentsStorageKey = 'skill-roadmap-note-comments:v1';
const flashcardsStorageKey = 'skill-roadmap-flashcards:v1';
const shouldSyncProgressFile = process.env.NODE_ENV !== 'production';

const levelStyles: Record<string, string> = {
  'Cơ bản': 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-300',
  'Trung cấp': 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  'Nâng cao': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  'Chuyên sâu': 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
};

export function SkillRoadmapTaskDetail({ task }: { task: TaskContext }) {
  const [progress, setProgress] = useState<ProgressFile | null>(null);
  const [savingNote, setSavingNote] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [expandedChildTaskIds, setExpandedChildTaskIds] = useState<Set<string>>(new Set());
  const [promptVisible, setPromptVisible] = useState(false);
  const [promptCopied, setPromptCopied] = useState(false);
  const [promptCopyError, setPromptCopyError] = useState<string | null>(null);
  const [noteComments, setNoteComments] = useState<NoteComment[]>([]);
  const [flashcardDeck, setFlashcardDeck] = useState<FlashcardDeck | null>(null);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [flashcardRatings, setFlashcardRatings] = useState<Record<string, 'hard' | 'good'>>({});

  useEffect(() => {
    let cancelled = false;
    let hasLocalProgress = false;
    let hasLocalComments = false;
    let hasLocalFlashcards = false;

    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      hasLocalProgress = raw !== null;
      const storedProgress = raw ? (JSON.parse(raw) as ProgressFile) : null;
      window.queueMicrotask(() => setProgress(storedProgress));
    } catch {
      window.queueMicrotask(() => setProgress(null));
    }

    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      hasLocalComments = raw !== null;
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      window.queueMicrotask(() => setNoteComments(Array.isArray(parsed[task.id]) ? parsed[task.id] : []));
    } catch {
      window.queueMicrotask(() => setNoteComments([]));
    }

    try {
      const raw = window.localStorage.getItem(flashcardsStorageKey);
      hasLocalFlashcards = raw !== null;
      const parsed = raw ? (JSON.parse(raw) as Record<string, FlashcardDeck>) : {};
      window.queueMicrotask(() => {
        setFlashcardDeck(parsed[task.id] ?? null);
        setActiveFlashcardIndex(0);
        setFlashcardFlipped(false);
        setFlashcardRatings({});
      });
    } catch {
      window.queueMicrotask(() => setFlashcardDeck(null));
    }

    async function hydrateMissingSeedData() {
      if (hasLocalProgress && hasLocalComments && hasLocalFlashcards) {
        return;
      }

      try {
        const response = await fetch('/api/skill-roadmap/progress', {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const seed = await response.json();

        if (cancelled) {
          return;
        }

        if (!hasLocalProgress) {
          const seedProgress = normalizeSeedProgress(seed);

          if (seedProgress) {
            setProgress(seedProgress);
            storeProgress(seedProgress);
          }
        }

        if (!hasLocalComments) {
          const seedComments = readSeedComments(seed);
          storeComments(seedComments);
          setNoteComments(seedComments[task.id] ?? []);
        }

        if (!hasLocalFlashcards) {
          const seedFlashcards = readSeedFlashcards(seed);
          storeFlashcards(seedFlashcards);
          setFlashcardDeck(seedFlashcards[task.id] ?? null);
        }
      } catch {
        // The page can still work with browser-local data only.
      }
    }

    hydrateMissingSeedData();

    return () => {
      cancelled = true;
    };
  }, [task.id]);

  const descendants = useMemo(() => flattenTasks(task.children ?? []), [task.children]);
  const item = progress?.items?.[task.id] ?? null;
  const completedDescendants = descendants.filter((child) => progress?.items?.[child.id]?.completed).length;
  const hasChildren = Boolean(task.children?.length);
  const hasNote = Boolean(item?.note.trim());
  const allChildrenCompleted = descendants.length > 0 && completedDescendants === descendants.length;
  const effectivelyCompleted = Boolean(item?.completed) || allChildrenCompleted;
  const childProgressing = !effectivelyCompleted && completedDescendants > 0;
  const totalChildHours = descendants.reduce((sum, child) => sum + child.estimateHours, 0);
  const learningPrompt = useMemo(() => buildLearningPrompt(task), [task]);
  const canCreateFlashcards = effectivelyCompleted && hasNote && !flashcardDeck;
  const flashcardRequirement = getFlashcardRequirement({
    completed: effectivelyCompleted,
    hasNote,
    hasDeck: Boolean(flashcardDeck),
  });

  function updateNote(note: string) {
    setProgress((current) => {
      const now = new Date().toISOString();
      const currentProgress = current ?? { updatedAt: null, items: {} };
      const currentItem = currentProgress.items[task.id];
      const next: ProgressFile = {
        updatedAt: now,
        items: {
          ...currentProgress.items,
          [task.id]: {
            completed: currentItem?.completed ?? true,
            completedAt: currentItem?.completedAt ?? now,
            note,
            updatedAt: now,
          },
        },
      };

      storeProgress(next);
      return next;
    });
  }

  async function saveNote() {
    const currentProgress = progress;

    if (!currentProgress) {
      return;
    }

    setSavingNote(true);
    setSaveError(null);

    try {
      if (shouldSyncProgressFile) {
        const response = await fetch('/api/skill-roadmap/progress', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: currentProgress.items,
          }),
        });

        if (!response.ok) {
          throw new Error('Save failed');
        }

        const saved = (await response.json()) as ProgressFile;
        setProgress(saved);
        storeProgress(saved);
      }
    } catch {
      setSaveError('Đã lưu note vào trình duyệt, nhưng không sync được vào file JSON local.');
    } finally {
      setSavingNote(false);
    }
  }

  function toggleChildTask(taskId: string) {
    setExpandedChildTaskIds((current) => {
      const next = new Set(current);

      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }

      return next;
    });
  }

  async function copyLearningPrompt() {
    setPromptCopyError(null);

    try {
      await navigator.clipboard.writeText(learningPrompt);
      setPromptCopied(true);
      window.setTimeout(() => setPromptCopied(false), 1400);
    } catch {
      setPromptCopyError('Không copy được prompt tự động. Vui lòng mở prompt và copy thủ công.');
    }
  }

  async function createFlashcards() {
    if (!canCreateFlashcards || !item?.note.trim()) {
      setFlashcardError(flashcardRequirement);
      return;
    }

    setGeneratingFlashcards(true);
    setFlashcardError(null);

    try {
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: {
            id: task.id,
            title: task.title,
            level: task.level,
            deliverable: task.deliverable,
          },
          note: item.note,
          comments: noteComments.map((comment) => ({
            author: comment.author,
            body: comment.body,
            createdAt: comment.createdAt,
          })),
        }),
      });

      const responseBody = (await response.json().catch(() => ({}))) as {
        deck?: FlashcardDeck;
        error?: string;
      };

      if (!response.ok || !responseBody.deck) {
        throw new Error(responseBody.error ?? 'Không tạo được flashcard.');
      }

      storeFlashcardDeck(task.id, responseBody.deck);
      setFlashcardDeck(responseBody.deck);
      setActiveFlashcardIndex(0);
      setFlashcardFlipped(false);
      setFlashcardRatings({});
    } catch (error) {
      setFlashcardError(error instanceof Error ? error.message : 'Không tạo được flashcard.');
    } finally {
      setGeneratingFlashcards(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link
            href="/skill-roadmap"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại roadmap
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-gray-400">{task.id}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
              {task.level}
            </span>
            {task.parentTasks.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                Task con cấp {task.depth}
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-3xl">
            {task.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}/quiz`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 px-3 py-2 text-sm font-semibold text-cyan-700 transition hover:border-cyan-400 hover:text-cyan-800 dark:border-cyan-900/70 dark:text-cyan-300 dark:hover:border-cyan-700 dark:hover:text-cyan-200"
          >
            <CircleHelp className="h-4 w-4" />
            Trắc nghiệm
          </Link>
          <Link
            href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
          >
            <FileText className="h-4 w-4" />
            Mở note
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={effectivelyCompleted ? CheckCircle2 : childProgressing ? GitBranch : Circle}
          label="Trạng thái"
          value={effectivelyCompleted ? 'Đã học' : childProgressing ? 'Đang học' : 'Chưa học'}
        />
        <Metric icon={Clock3} label="Thời lượng" value={`${task.estimateHours}h`} />
        <Metric icon={Layers} label="Task con" value={`${completedDescendants}/${descendants.length}`} />
        <Metric icon={StickyNote} label="Note" value={hasNote ? 'Đã có' : 'Chưa có'} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-6">
          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Thông tin task
              </h2>
              <dl className="mt-4 grid gap-4 text-sm md:grid-cols-2">
                <DetailItem label="Track" value={task.trackTitle} />
                <DetailItem label="Module" value={task.moduleTitle} />
                <DetailItem label="ID" value={task.id} mono />
                <DetailItem label="Cấp độ" value={task.level} />
                <DetailItem label="Ước tính" value={`${task.estimateHours} giờ`} />
                <DetailItem label="Tổng giờ task con" value={`${totalChildHours} giờ`} />
              </dl>

              <div className="mt-5 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Kết quả cần có
                </div>
                <p className="mt-2 text-sm leading-6 text-gray-700 dark:text-gray-200">
                  {task.deliverable}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-wide text-cyan-600 dark:text-cyan-300">
                    AI Trắc nghiệm
                  </p>
                  <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                    <CircleHelp className="h-5 w-5 text-cyan-600 dark:text-cyan-300" />
                    Kiểm tra hiểu biết trên màn riêng
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    Bài trắc nghiệm dùng toàn bộ note và {noteComments.length} comment của task này làm nguồn câu hỏi.
                  </p>
                </div>
                <Link
                  href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}/quiz`}
                  className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 text-sm font-semibold text-white transition hover:bg-cyan-700"
                >
                  <CircleHelp className="h-4 w-4" />
                  Mở trắc nghiệm
                </Link>
              </div>
            </CardContent>
          </Card>

          <FlashcardStudyPanel
            deck={flashcardDeck}
            commentCount={noteComments.length}
            canCreate={canCreateFlashcards}
            requirement={flashcardRequirement}
            isGenerating={generatingFlashcards}
            error={flashcardError}
            activeIndex={activeFlashcardIndex}
            flipped={flashcardFlipped}
            ratings={flashcardRatings}
            onCreate={createFlashcards}
            onFlip={() => setFlashcardFlipped((current) => !current)}
            onPrevious={() => {
              setActiveFlashcardIndex((current) => Math.max(current - 1, 0));
              setFlashcardFlipped(false);
            }}
            onNext={() => {
              setActiveFlashcardIndex((current) =>
                Math.min(current + 1, (flashcardDeck?.cards.length ?? 1) - 1)
              );
              setFlashcardFlipped(false);
            }}
            onRate={(cardId, rating) => {
              setFlashcardRatings((current) => ({ ...current, [cardId]: rating }));
            }}
            onRestart={() => {
              setActiveFlashcardIndex(0);
              setFlashcardFlipped(false);
            }}
          />

          <Card>
            <CardContent className="p-5 md:p-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                    <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Prompt AI hỗ trợ học
                  </h2>
                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                    {learningPrompt}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => setPromptVisible((visible) => !visible)}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
                    aria-expanded={promptVisible}
                  >
                    {promptVisible ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                    {promptVisible ? 'Ẩn' : 'Xem'}
                  </button>
                  <button
                    type="button"
                    onClick={copyLearningPrompt}
                    className="inline-flex items-center gap-1.5 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-emerald-700 dark:hover:text-emerald-300"
                  >
                    <Copy className="h-3.5 w-3.5" />
                    {promptCopied ? 'Đã copy' : 'Copy'}
                  </button>
                </div>
              </div>

              {promptVisible && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700 [overflow-wrap:anywhere] dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200">
                  {learningPrompt}
                </div>
              )}

              {promptCopyError && (
                <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  {promptCopyError}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <StickyNote className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Note
              </h2>
              <textarea
                value={item?.note ?? ''}
                onChange={(event) => updateNote(event.target.value)}
                onBlur={saveNote}
                rows={8}
                placeholder="Ghi lại nội dung đã học, link tài liệu, lỗi gặp phải, checklist cần ôn lại..."
                className={cn(
                  'mt-4 min-h-48 w-full resize-y rounded-lg border bg-white p-3 text-sm text-gray-900 outline-none transition focus:ring-2 dark:bg-gray-900 dark:text-white',
                  hasNote
                    ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500/20 dark:border-emerald-800'
                    : 'border-red-300 focus:border-red-500 focus:ring-red-500/20 dark:border-red-800'
                )}
              />
              <div className="mt-2 flex flex-col gap-2 text-xs text-gray-500 dark:text-gray-400 sm:flex-row sm:items-center sm:justify-between">
                <span>Cập nhật: {formatDate(item?.updatedAt ?? null)}</span>
                <span className="inline-flex items-center gap-1">
                  {savingNote ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      Đang lưu
                    </>
                  ) : (
                    <>
                      <Save className="h-3.5 w-3.5" />
                      Tự lưu khi rời ô note
                    </>
                  )}
                </span>
              </div>
              {saveError && (
                <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
                  {saveError}
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5 md:p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <ListTree className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Task con
              </h2>
              {hasChildren ? (
                <div className="mt-4 divide-y divide-gray-100 rounded-lg border border-gray-200 dark:divide-gray-800 dark:border-gray-800">
                  {task.children?.map((child) => (
                    <ChildTaskRow
                      key={child.id}
                      task={child}
                      progress={progress}
                      depth={0}
                      expandedTaskIds={expandedChildTaskIds}
                      onToggleExpanded={toggleChildTask}
                    />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300">
                  Task này không có task con.
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <CardContent className="p-5">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                Vị trí trong lộ trình
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                <PathLine label="Track" value={task.trackTitle} />
                <PathLine label="Module" value={task.moduleTitle} />
                {task.parentTasks.map((parent, index) => (
                  <PathLine
                    key={parent.id}
                    label={`Cha cấp ${index + 1}`}
                    value={parent.title}
                    href={`/skill-roadmap/tasks/${encodeURIComponent(parent.id)}`}
                  />
                ))}
                <PathLine label="Task hiện tại" value={task.title} active />
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function FlashcardStudyPanel({
  deck,
  commentCount,
  canCreate,
  requirement,
  isGenerating,
  error,
  activeIndex,
  flipped,
  ratings,
  onCreate,
  onFlip,
  onPrevious,
  onNext,
  onRate,
  onRestart,
}: {
  deck: FlashcardDeck | null;
  commentCount: number;
  canCreate: boolean;
  requirement: string | null;
  isGenerating: boolean;
  error: string | null;
  activeIndex: number;
  flipped: boolean;
  ratings: Record<string, 'hard' | 'good'>;
  onCreate: () => void;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRate: (cardId: string, rating: 'hard' | 'good') => void;
  onRestart: () => void;
}) {
  const cards = deck?.cards ?? [];
  const activeCard = cards[activeIndex] ?? null;
  const reviewedCount = Object.keys(ratings).length;
  const hardCount = Object.values(ratings).filter((rating) => rating === 'hard').length;
  const goodCount = Object.values(ratings).filter((rating) => rating === 'good').length;
  const progressPercent = cards.length > 0 ? Math.round((reviewedCount / cards.length) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
              AI Flashcards
            </p>
            <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
              <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              Bộ thẻ ôn tập từ note và comment
            </h2>
            <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
              Nguồn học gồm toàn bộ note hiện tại và {commentCount} comment của note này. Mỗi task chỉ tạo bộ flashcard một lần.
            </p>
          </div>

          {!deck && (
            <button
              type="button"
              onClick={onCreate}
              disabled={!canCreate || isGenerating}
              className={cn(
                'inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition',
                canCreate
                  ? 'bg-violet-600 text-white hover:bg-violet-700 disabled:cursor-wait disabled:bg-violet-400'
                  : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
              )}
            >
              {isGenerating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              {isGenerating ? 'Đang tạo' : 'Tạo flashcard'}
            </button>
          )}
        </div>

        {!deck && requirement && (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
            {requirement}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        {deck && activeCard && (
          <div className="mt-5 space-y-4">
            <div className="grid gap-3 sm:grid-cols-4">
              <FlashcardStat label="Tổng thẻ" value={String(cards.length)} />
              <FlashcardStat label="Đã ôn" value={`${reviewedCount}/${cards.length}`} />
              <FlashcardStat label="Nhớ tốt" value={String(goodCount)} />
              <FlashcardStat label="Cần ôn lại" value={String(hardCount)} />
            </div>

            <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
              <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                      {activeCard.tag}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Thẻ {activeIndex + 1}/{cards.length}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      Tạo lúc {formatDate(deck.createdAt)}
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                    <div
                      className="h-full rounded-full bg-violet-600 transition-all"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onRestart}
                  className="inline-flex h-9 w-fit items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-violet-700 dark:hover:text-violet-300"
                >
                  <RotateCcw className="h-4 w-4" />
                  Ôn lại từ đầu
                </button>
              </div>

              <button
                type="button"
                onClick={onFlip}
                className="block min-h-64 w-full px-4 py-8 text-left transition hover:bg-white dark:hover:bg-gray-950 sm:px-8"
                aria-label={flipped ? 'Xem mặt câu hỏi' : 'Xem mặt đáp án'}
              >
                <div className="mx-auto flex min-h-48 max-w-3xl flex-col justify-center rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-950 sm:p-7">
                  <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                    {flipped ? 'Đáp án' : 'Câu hỏi'}
                  </div>
                  <div className="mt-3 text-xl font-bold leading-8 text-gray-950 [overflow-wrap:anywhere] dark:text-white">
                    {flipped ? activeCard.back : activeCard.front}
                  </div>
                  {!flipped && activeCard.hint && (
                    <p className="mt-5 rounded-lg border border-violet-100 bg-violet-50 px-3 py-2 text-sm leading-6 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200">
                      Gợi ý: {activeCard.hint}
                    </p>
                  )}
                  <div className="mt-5 text-xs font-semibold text-gray-400">
                    Nhấn vào thẻ để lật
                  </div>
                </div>
              </button>

              <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onRate(activeCard.id, 'hard')}
                    className={cn(
                      'inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition',
                      ratings[activeCard.id] === 'hard'
                        ? 'border-rose-300 bg-rose-50 text-rose-700 dark:border-rose-800 dark:bg-rose-950/30 dark:text-rose-200'
                        : 'border-gray-200 text-gray-700 hover:border-rose-300 hover:text-rose-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-rose-800 dark:hover:text-rose-200'
                    )}
                  >
                    <X className="h-4 w-4" />
                    Khó nhớ
                  </button>
                  <button
                    type="button"
                    onClick={() => onRate(activeCard.id, 'good')}
                    className={cn(
                      'inline-flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold transition',
                      ratings[activeCard.id] === 'good'
                        ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                        : 'border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-emerald-800 dark:hover:text-emerald-200'
                    )}
                  >
                    <Check className="h-4 w-4" />
                    Đã nhớ
                  </button>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onPrevious}
                    disabled={activeIndex === 0}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-violet-700 dark:hover:text-violet-300"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Trước
                  </button>
                  <button
                    type="button"
                    onClick={onNext}
                    disabled={activeIndex >= cards.length - 1}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-gray-950 px-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
                  >
                    Sau
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function FlashcardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 dark:border-gray-800 dark:bg-gray-900">
      <div className="text-lg font-bold text-gray-950 dark:text-white">{value}</div>
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
        {label}
      </div>
    </div>
  );
}

function ChildTaskRow({
  task,
  progress,
  depth,
  expandedTaskIds,
  onToggleExpanded,
}: {
  task: RoadmapTask;
  progress: ProgressFile | null;
  depth: number;
  expandedTaskIds: Set<string>;
  onToggleExpanded: (taskId: string) => void;
}) {
  const descendants = flattenTasks(task.children ?? []);
  const completedDescendants = descendants.filter((child) => progress?.items?.[child.id]?.completed).length;
  const completed = Boolean(progress?.items?.[task.id]?.completed) || (descendants.length > 0 && completedDescendants === descendants.length);
  const hasChildren = Boolean(task.children?.length);
  const isExpanded = expandedTaskIds.has(task.id);

  return (
    <div className="p-4" style={{ paddingLeft: `calc(1rem + ${depth * 1.25}rem)` }}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-gray-400">{task.id}</span>
            <span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold', levelStyles[task.level] ?? levelStyles['Trung cấp'])}>
              {task.level}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Clock3 className="h-3.5 w-3.5" />
              {task.estimateHours}h
            </span>
            {descendants.length > 0 && (
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                {completedDescendants}/{descendants.length} mục con
              </span>
            )}
          </div>
          <div className="mt-2 flex items-start gap-2">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => onToggleExpanded(task.id)}
                className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
                aria-label={isExpanded ? 'Thu gọn task con' : 'Mở task con'}
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <span className="h-6 w-6 shrink-0" />
            )}
            <h3 className="text-sm font-semibold leading-6 text-gray-950 dark:text-white">
              {task.title}
            </h3>
          </div>
          <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-300">
            {task.deliverable}
          </p>
        </div>
        <Link
          href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300"
        >
          <ListTree className="h-3.5 w-3.5" />
          Chi tiết
        </Link>
      </div>
      {completed && (
        <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-200">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Đã học
        </div>
      )}
      {hasChildren && isExpanded ? (
        <div className="mt-3 divide-y divide-gray-100 border-l border-gray-200 dark:divide-gray-800 dark:border-gray-800">
          {task.children?.map((child) => (
            <ChildTaskRow
              key={child.id}
              task={child}
              progress={progress}
              depth={depth + 1}
              expandedTaskIds={expandedTaskIds}
              onToggleExpanded={onToggleExpanded}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="p-4">
        <Icon className="mb-3 h-5 w-5 text-blue-600 dark:text-blue-400" />
        <div className="text-xl font-bold text-gray-950 dark:text-white">{value}</div>
        <div className="mt-1 text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
          {label}
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</dt>
      <dd className={cn('mt-1 text-gray-900 [overflow-wrap:anywhere] dark:text-gray-100', mono && 'font-mono text-xs')}>
        {value}
      </dd>
    </div>
  );
}

function PathLine({
  label,
  value,
  href,
  active = false,
}: {
  label: string;
  value: string;
  href?: string;
  active?: boolean;
}) {
  const content = (
    <div
      className={cn(
        'rounded-lg border px-3 py-2',
        active
          ? 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/30 dark:text-blue-100'
          : 'border-gray-200 bg-gray-50 text-gray-700 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200'
      )}
    >
      <div className="text-xs font-semibold uppercase tracking-wide text-gray-400">{label}</div>
      <div className="mt-1 leading-5 [overflow-wrap:anywhere]">{value}</div>
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

function flattenTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  return tasks.flatMap((task) => [
    task,
    ...flattenTasks(task.children ?? []),
  ]);
}

function buildLearningPrompt(task: RoadmapTask): string {
  return [
    'Bạn là mentor Backend/Senior Engineer, ưu tiên dạy lý thuyết và bản chất.',
    `Hãy giúp tôi học mục: "${task.title}".`,
    `Mục tiêu cần đạt: ${task.deliverable}.`,
    'Trình bày theo 6 phần: định nghĩa ngắn, cơ chế bên trong/nó xử lý thế nào, vì sao cần dùng, trade-off và khi không nên dùng, câu hỏi phỏng vấn đào sâu kèm đáp án, ví dụ nhỏ để kiểm chứng hiểu biết.',
  ].join(' ');
}

function storeProgress(progress: ProgressFile) {
  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    // The in-memory UI still reflects the note if localStorage is unavailable.
  }
}

function storeFlashcardDeck(taskId: string, deck: FlashcardDeck) {
  try {
    const raw = window.localStorage.getItem(flashcardsStorageKey);
    const parsed = raw ? (JSON.parse(raw) as Record<string, FlashcardDeck>) : {};
    parsed[taskId] = deck;
    window.localStorage.setItem(flashcardsStorageKey, JSON.stringify(parsed));
  } catch {
    // The generated deck remains usable in memory for the current screen.
  }
}

function storeComments(comments: Record<string, NoteComment[]>) {
  try {
    window.localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
  } catch {
    // The current screen can still render the in-memory comments.
  }
}

function storeFlashcards(flashcards: Record<string, FlashcardDeck>) {
  try {
    window.localStorage.setItem(flashcardsStorageKey, JSON.stringify(flashcards));
  } catch {
    // The current screen can still render the in-memory flashcard deck.
  }
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}

function normalizeSeedProgress(input: unknown): ProgressFile | null {
  if (!isRecord(input)) {
    return null;
  }

  const value = isRecord(input.progress) ? input.progress : input;
  const rawItems = isRecord(value.items) ? value.items : null;

  if (!rawItems) {
    return null;
  }

  const items: Record<string, ProgressItem> = {};

  for (const [taskId, rawItem] of Object.entries(rawItems)) {
    if (!isRecord(rawItem)) {
      return null;
    }

    items[taskId] = {
      completed: Boolean(rawItem.completed),
      note: typeof rawItem.note === 'string' ? rawItem.note : '',
      completedAt: typeof rawItem.completedAt === 'string' ? rawItem.completedAt : null,
      updatedAt: typeof rawItem.updatedAt === 'string' ? rawItem.updatedAt : new Date().toISOString(),
    };
  }

  return {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : null,
    items,
  };
}

function readSeedComments(input: unknown): Record<string, NoteComment[]> {
  if (!isRecord(input) || !isRecord(input.comments)) {
    return {};
  }

  const comments: Record<string, NoteComment[]> = {};

  for (const [taskId, rawComments] of Object.entries(input.comments)) {
    if (!Array.isArray(rawComments)) {
      continue;
    }

    const taskComments: NoteComment[] = [];

    for (const comment of rawComments) {
      if (!isRecord(comment) || typeof comment.id !== 'string' || typeof comment.body !== 'string') {
        continue;
      }

      taskComments.push({
        id: comment.id,
        parentId: typeof comment.parentId === 'string' ? comment.parentId : null,
        author: comment.author === 'ai' ? 'ai' : 'user',
        body: comment.body,
        createdAt: typeof comment.createdAt === 'string' ? comment.createdAt : new Date().toISOString(),
        model: typeof comment.model === 'string' ? comment.model : undefined,
        provider: typeof comment.provider === 'string' ? comment.provider : undefined,
      });
    }

    comments[taskId] = taskComments;
  }

  return comments;
}

function readSeedFlashcards(input: unknown): Record<string, FlashcardDeck> {
  if (!isRecord(input) || !isRecord(input.flashcards)) {
    return {};
  }

  const flashcards: Record<string, FlashcardDeck> = {};

  for (const [taskId, rawDeck] of Object.entries(input.flashcards)) {
    if (!isRecord(rawDeck) || !Array.isArray(rawDeck.cards) || !isRecord(rawDeck.source)) {
      continue;
    }

    const cards = rawDeck.cards
      .map((card) => {
        if (
          !isRecord(card) ||
          typeof card.id !== 'string' ||
          typeof card.front !== 'string' ||
          typeof card.back !== 'string'
        ) {
          return null;
        }

        return {
          id: card.id,
          front: card.front,
          back: card.back,
          hint: typeof card.hint === 'string' ? card.hint : '',
          tag: typeof card.tag === 'string' ? card.tag : 'Ôn tập',
        };
      })
      .filter((card): card is Flashcard => Boolean(card));

    flashcards[taskId] = {
      taskId: typeof rawDeck.taskId === 'string' ? rawDeck.taskId : taskId,
      taskTitle: typeof rawDeck.taskTitle === 'string' ? rawDeck.taskTitle : '',
      createdAt: typeof rawDeck.createdAt === 'string' ? rawDeck.createdAt : new Date().toISOString(),
      source: {
        noteCharacters: typeof rawDeck.source.noteCharacters === 'number' ? rawDeck.source.noteCharacters : 0,
        commentCount: typeof rawDeck.source.commentCount === 'number' ? rawDeck.source.commentCount : 0,
      },
      cards,
    };
  }

  return flashcards;
}

function getFlashcardRequirement({
  completed,
  hasNote,
  hasDeck,
}: {
  completed: boolean;
  hasNote: boolean;
  hasDeck: boolean;
}) {
  if (hasDeck) {
    return null;
  }

  if (!completed && !hasNote) {
    return 'Cần hoàn thành task và có note trước khi tạo flashcard.';
  }

  if (!completed) {
    return 'Chỉ tạo flashcard sau khi task đã hoàn thành.';
  }

  if (!hasNote) {
    return 'Cần có note trước khi tạo flashcard.';
  }

  return null;
}

function formatDate(value: string | null): string {
  if (!value) {
    return 'Chưa có dữ liệu';
  }

  return new Date(value).toLocaleString('vi-VN');
}
