'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Brain,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  FileText,
  Layers,
  Loader2,
  RotateCcw,
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
  id: string;
  taskId: string;
  taskTitle: string;
  title: string;
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

export function SkillRoadmapTaskFlashcards({ task }: { task: TaskContext }) {
  const [progress, setProgress] = useState<ProgressFile | null>(null);
  const [noteComments, setNoteComments] = useState<NoteComment[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [aiConfirmPassword, setAiConfirmPassword] = useState('');
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
      const parsed = raw ? normalizeFlashcardsByTask(JSON.parse(raw)) : {};
      const taskDecks = parsed[task.id] ?? [];
      window.queueMicrotask(() => {
        setFlashcardDecks(taskDecks);
        setActiveDeckId(taskDecks[0]?.id ?? null);
        resetStudyState();
      });
    } catch {
      window.queueMicrotask(() => {
        setFlashcardDecks([]);
        setActiveDeckId(null);
        resetStudyState();
      });
    }

    async function hydrateMissingSeedData() {
      if (hasLocalProgress && hasLocalComments && hasLocalFlashcards) {
        return;
      }

      try {
        const response = await fetch('/api/skill-roadmap/progress', { cache: 'no-store' });

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
          const taskDecks = seedFlashcards[task.id] ?? [];
          setFlashcardDecks(taskDecks);
          setActiveDeckId(taskDecks[0]?.id ?? null);
        }
      } catch {
        // Browser-local data is enough for this screen.
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
  const effectivelyCompleted =
    Boolean(item?.completed) || (descendants.length > 0 && completedDescendants === descendants.length);
  const hasNote = Boolean(item?.note.trim());
  const canCreateFlashcards = effectivelyCompleted && hasNote;
  const requirement = getFlashcardRequirement({ completed: effectivelyCompleted, hasNote });
  const activeDeck = flashcardDecks.find((deck) => deck.id === activeDeckId) ?? flashcardDecks[0] ?? null;
  const activeCard = activeDeck?.cards[activeFlashcardIndex] ?? null;

  async function createFlashcards() {
    if (!canCreateFlashcards || !item?.note.trim()) {
      setFlashcardError(requirement);
      return;
    }

    if (!aiConfirmPassword.trim()) {
      setFlashcardError('Vui lòng nhập mật khẩu xác nhận trước khi dùng AI cấu hình trong env.');
      return;
    }

    setGeneratingFlashcards(true);
    setFlashcardError(null);

    try {
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmPassword: aiConfirmPassword,
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
          existingCards: flashcardDecks.flatMap((deck) => deck.cards.map((card) => card.front)),
        }),
      });

      const responseBody = (await response.json().catch(() => ({}))) as {
        deck?: Partial<FlashcardDeck> & { cards?: Flashcard[] };
        error?: string;
      };

      if (!response.ok || !responseBody.deck || !Array.isArray(responseBody.deck.cards)) {
        throw new Error(responseBody.error ?? 'Không tạo được flashcard.');
      }

      const nextDeck: FlashcardDeck = {
        id: responseBody.deck.id || crypto.randomUUID(),
        taskId: responseBody.deck.taskId || task.id,
        taskTitle: responseBody.deck.taskTitle || task.title,
        title: responseBody.deck.title || `Bộ flashcard ${flashcardDecks.length + 1}`,
        createdAt: responseBody.deck.createdAt || new Date().toISOString(),
        source: responseBody.deck.source || {
          noteCharacters: item.note.length,
          commentCount: noteComments.length,
        },
        cards: responseBody.deck.cards,
      };
      const nextDecks = [...flashcardDecks, nextDeck];
      storeTaskFlashcards(task.id, nextDecks);
      setFlashcardDecks(nextDecks);
      setActiveDeckId(nextDeck.id);
      resetStudyState();
    } catch (error) {
      setFlashcardError(error instanceof Error ? error.message : 'Không tạo được flashcard.');
    } finally {
      setGeneratingFlashcards(false);
    }
  }

  function selectDeck(deckId: string) {
    setActiveDeckId(deckId);
    resetStudyState();
  }

  function resetStudyState() {
    setActiveFlashcardIndex(0);
    setFlashcardFlipped(false);
    setFlashcardRatings({});
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link
            href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`}
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            <ArrowLeft className="h-4 w-4" />
            Quay lại task
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-gray-400">{task.id}</span>
            {flashcardDecks.length > 0 && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">
                {flashcardDecks.length} bộ
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-3xl">
            Flashcard: {task.title}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
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
          icon={effectivelyCompleted ? CheckCircle2 : Circle}
          label="Trạng thái"
          value={effectivelyCompleted ? 'Đã học' : 'Chưa học'}
        />
        <Metric icon={StickyNote} label="Note" value={hasNote ? 'Đã có' : 'Chưa có'} />
        <Metric icon={Layers} label="Bộ thẻ" value={String(flashcardDecks.length)} />
        <Metric icon={Clock3} label="Nguồn comment" value={String(noteComments.length)} />
      </div>

      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">
                AI Flashcards
              </p>
              <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                Tạo nhiều bộ thẻ theo các góc học khác nhau
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                Nguồn học gồm toàn bộ note hiện tại và {noteComments.length} comment. Bộ mới sẽ được yêu cầu đổi góc hỏi so với các thẻ đã có.
              </p>
            </div>

            <div className="w-full shrink-0 space-y-2 lg:w-72">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Mật khẩu xác nhận
                </span>
                <input
                  value={aiConfirmPassword}
                  onChange={(event) => setAiConfirmPassword(event.target.value)}
                  type="password"
                  placeholder="Password dùng AI env"
                  autoComplete="off"
                  className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-violet-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100"
                />
              </label>
              <button
                type="button"
                onClick={createFlashcards}
                disabled={!canCreateFlashcards || generatingFlashcards}
                className={cn(
                  'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition',
                  canCreateFlashcards
                    ? 'bg-violet-600 text-white hover:bg-violet-700 disabled:cursor-wait disabled:bg-violet-400'
                    : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400'
                )}
              >
                {generatingFlashcards ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {generatingFlashcards ? 'Đang tạo' : flashcardDecks.length > 0 ? 'Tạo bộ mới' : 'Tạo flashcard'}
              </button>
            </div>
          </div>

          {requirement && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">
              {requirement}
            </div>
          )}

          {flashcardError && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
              {flashcardError}
            </div>
          )}

          {flashcardDecks.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {flashcardDecks.map((deck, index) => (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => selectDeck(deck.id)}
                  className={cn(
                    'rounded-lg border px-4 py-3 text-left transition',
                    activeDeck?.id === deck.id
                      ? 'border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-100'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-violet-200 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-violet-900'
                  )}
                >
                  <div className="font-semibold">{deck.title || `Bộ flashcard ${index + 1}`}</div>
                  <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">
                    {deck.cards.length} thẻ · Tạo lúc {formatDate(deck.createdAt)}
                  </div>
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {!activeDeck || !activeCard ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Brain className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-700" />
            <h2 className="mt-3 text-lg font-bold text-gray-950 dark:text-white">Chưa có bộ flashcard</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300">
              Hoàn thành task, nhập note, sau đó tạo bộ flashcard đầu tiên để bắt đầu ôn tập.
            </p>
          </CardContent>
        </Card>
      ) : (
        <FlashcardStudyPanel
          deck={activeDeck}
          activeIndex={activeFlashcardIndex}
          flipped={flashcardFlipped}
          ratings={flashcardRatings}
          onFlip={() => setFlashcardFlipped((current) => !current)}
          onPrevious={() => {
            setActiveFlashcardIndex((current) => Math.max(current - 1, 0));
            setFlashcardFlipped(false);
          }}
          onNext={() => {
            setActiveFlashcardIndex((current) =>
              Math.min(current + 1, (activeDeck?.cards.length ?? 1) - 1)
            );
            setFlashcardFlipped(false);
          }}
          onRate={(cardId, rating) => {
            setFlashcardRatings((current) => ({ ...current, [cardId]: rating }));
          }}
          onRestart={resetStudyState}
        />
      )}
    </div>
  );
}

function FlashcardStudyPanel({
  deck,
  activeIndex,
  flipped,
  ratings,
  onFlip,
  onPrevious,
  onNext,
  onRate,
  onRestart,
}: {
  deck: FlashcardDeck;
  activeIndex: number;
  flipped: boolean;
  ratings: Record<string, 'hard' | 'good'>;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRate: (cardId: string, rating: 'hard' | 'good') => void;
  onRestart: () => void;
}) {
  const cards = deck.cards;
  const activeCard = cards[activeIndex];
  const reviewedCount = Object.keys(ratings).length;
  const hardCount = Object.values(ratings).filter((rating) => rating === 'hard').length;
  const goodCount = Object.values(ratings).filter((rating) => rating === 'good').length;
  const progressPercent = cards.length > 0 ? Math.round((reviewedCount / cards.length) * 100) : 0;
  const activeRating = ratings[activeCard?.id ?? ''];

  if (!activeCard) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-5 md:p-6">
        <div className="grid gap-3 sm:grid-cols-4">
          <FlashcardStat label="Tổng thẻ" value={String(cards.length)} />
          <FlashcardStat label="Đã ôn" value={`${reviewedCount}/${cards.length}`} />
          <FlashcardStat label="Nhớ tốt" value={String(goodCount)} />
          <FlashcardStat label="Cần ôn lại" value={String(hardCount)} />
        </div>

        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900">
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
                  {deck.title} · {formatDate(deck.createdAt)}
                </span>
                {activeRating && (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-semibold',
                      activeRating === 'good'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
                    )}
                  >
                    {activeRating === 'good' ? 'Đã nhớ' : 'Cần ôn lại'}
                  </span>
                )}
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
                <div
                  className="h-full rounded-full bg-violet-600 transition-all duration-500 ease-out"
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

          <div className="px-4 py-6 sm:px-8 sm:py-8">
            <button
              type="button"
              onClick={onFlip}
              className="group mx-auto block w-full max-w-4xl text-left outline-none [perspective:1400px]"
              aria-label={flipped ? 'Xem mặt câu hỏi' : 'Xem mặt đáp án'}
              aria-pressed={flipped}
            >
              <div
                className={cn(
                  'relative min-h-[22rem] rounded-xl transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:transition-none',
                  flipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
                )}
              >
                <FlashcardFace
                  eyebrow="Câu hỏi"
                  label={`Thẻ ${activeIndex + 1}/${cards.length}`}
                  tone="front"
                >
                  <div className="text-2xl font-bold leading-9 text-gray-950 [overflow-wrap:anywhere] dark:text-white">
                    {activeCard.front}
                  </div>
                  {activeCard.hint && (
                    <div className="mt-6 rounded-lg border border-violet-100 bg-violet-50 px-4 py-3 text-sm leading-6 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200">
                      <span className="font-semibold">Gợi ý:</span> {activeCard.hint}
                    </div>
                  )}
                </FlashcardFace>

                <FlashcardFace
                  eyebrow="Đáp án"
                  label="Mặt sau"
                  tone="back"
                  className="[transform:rotateY(180deg)]"
                >
                  <div className="max-h-60 overflow-y-auto pr-1 text-xl font-semibold leading-8 text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:max-h-72">
                    {activeCard.back}
                  </div>
                  <div className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm leading-6 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200">
                    Tự đánh giá ngay sau khi đọc đáp án để theo dõi thẻ cần ôn lại.
                  </div>
                </FlashcardFace>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 transition group-hover:text-violet-600 group-focus-visible:text-violet-600 dark:text-gray-400 dark:group-hover:text-violet-300 dark:group-focus-visible:text-violet-300">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {flipped ? 'Nhấn để quay lại câu hỏi' : 'Nhấn để lật xem đáp án'}
              </div>
            </button>
          </div>

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
      </CardContent>
    </Card>
  );
}

function FlashcardFace({
  eyebrow,
  label,
  tone,
  className,
  children,
}: {
  eyebrow: string;
  label: string;
  tone: 'front' | 'back';
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex min-h-[22rem] flex-col justify-between rounded-xl border p-5 shadow-lg [backface-visibility:hidden] sm:p-7',
        tone === 'front'
          ? 'border-violet-100 bg-white dark:border-violet-900/60 dark:bg-gray-950'
          : 'border-emerald-100 bg-white dark:border-emerald-900/60 dark:bg-gray-950',
        'ring-1 ring-black/5 transition-shadow group-hover:shadow-xl group-focus-visible:ring-2 group-focus-visible:ring-violet-400 dark:ring-white/10',
        className
      )}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-xs font-bold uppercase tracking-wide',
              tone === 'front'
                ? 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
            )}
          >
            {eyebrow}
          </span>
          <span className="text-xs font-semibold text-gray-400">{label}</span>
        </div>
        <div className="mt-8">{children}</div>
      </div>
      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-semibold text-gray-400 dark:border-gray-800">
        <span>{tone === 'front' ? 'Active recall' : 'Self review'}</span>
        <span>{tone === 'front' ? 'Lật thẻ' : 'Đánh giá'}</span>
      </div>
    </div>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
            {label}
          </div>
          <div className="mt-0.5 font-bold text-gray-950 dark:text-white">{value}</div>
        </div>
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

function flattenTasks(tasks: RoadmapTask[]): RoadmapTask[] {
  return tasks.flatMap((task) => [
    task,
    ...flattenTasks(task.children ?? []),
  ]);
}

function storeProgress(progress: ProgressFile) {
  try {
    window.localStorage.setItem(progressStorageKey, JSON.stringify(progress));
  } catch {
    // The in-memory UI still works if localStorage is unavailable.
  }
}

function storeTaskFlashcards(taskId: string, decks: FlashcardDeck[]) {
  try {
    const raw = window.localStorage.getItem(flashcardsStorageKey);
    const parsed = raw ? normalizeFlashcardsByTask(JSON.parse(raw)) : {};
    parsed[taskId] = decks;
    window.localStorage.setItem(flashcardsStorageKey, JSON.stringify(parsed));
  } catch {
    // The generated decks remain usable in memory for the current screen.
  }
}

function storeComments(comments: Record<string, NoteComment[]>) {
  try {
    window.localStorage.setItem(commentsStorageKey, JSON.stringify(comments));
  } catch {
    // The current screen can still render the in-memory comments.
  }
}

function storeFlashcards(flashcards: Record<string, FlashcardDeck[]>) {
  try {
    window.localStorage.setItem(flashcardsStorageKey, JSON.stringify(flashcards));
  } catch {
    // The current screen can still render in-memory flashcards.
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

function readSeedFlashcards(input: unknown): Record<string, FlashcardDeck[]> {
  if (!isRecord(input) || !isRecord(input.flashcards)) {
    return {};
  }

  return normalizeFlashcardsByTask(input.flashcards);
}

function normalizeFlashcard(input: unknown): Flashcard | null {
  if (!isRecord(input)) {
    return null;
  }

  if (
    typeof input.id !== 'string' ||
    typeof input.front !== 'string' ||
    typeof input.back !== 'string'
  ) {
    return null;
  }

  return {
    id: input.id,
    front: input.front,
    back: input.back,
    hint: typeof input.hint === 'string' ? input.hint : '',
    tag: typeof input.tag === 'string' ? input.tag : 'Ôn tập',
  };
}

function normalizeFlashcardDeck(input: unknown, fallbackTaskId: string, index: number): FlashcardDeck | null {
  if (!isRecord(input) || !Array.isArray(input.cards)) {
    return null;
  }

  const rawSource = isRecord(input.source) ? input.source : {};
  const cards = input.cards.map(normalizeFlashcard).filter((card): card is Flashcard => Boolean(card));

  if (cards.length === 0) {
    return null;
  }

  return {
    id: typeof input.id === 'string' ? input.id : crypto.randomUUID(),
    taskId: typeof input.taskId === 'string' ? input.taskId : fallbackTaskId,
    taskTitle: typeof input.taskTitle === 'string' ? input.taskTitle : '',
    title: typeof input.title === 'string' ? input.title : `Bộ flashcard ${index + 1}`,
    createdAt: typeof input.createdAt === 'string' ? input.createdAt : new Date().toISOString(),
    source: {
      noteCharacters: typeof rawSource.noteCharacters === 'number' ? rawSource.noteCharacters : 0,
      commentCount: typeof rawSource.commentCount === 'number' ? rawSource.commentCount : 0,
    },
    cards,
  };
}

function normalizeFlashcardsByTask(input: unknown): Record<string, FlashcardDeck[]> {
  if (!isRecord(input)) {
    return {};
  }

  const flashcards: Record<string, FlashcardDeck[]> = {};

  for (const [taskId, rawDecks] of Object.entries(input)) {
    const sourceDecks = Array.isArray(rawDecks) ? rawDecks : [rawDecks];
    const decks = sourceDecks
      .map((rawDeck, index) => normalizeFlashcardDeck(rawDeck, taskId, index))
      .filter((deck): deck is FlashcardDeck => Boolean(deck));

    if (decks.length > 0) {
      flashcards[taskId] = decks;
    }
  }

  return flashcards;
}

function getFlashcardRequirement({
  completed,
  hasNote,
}: {
  completed: boolean;
  hasNote: boolean;
}) {
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
