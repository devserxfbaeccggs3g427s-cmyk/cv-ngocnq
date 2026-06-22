'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ComponentType } from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, CheckCircle2, Circle, Clock3, Layers, Loader2, FileText, Sparkles, StickyNote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { TaskContext, ProgressFile, NoteComment, Flashcard, FlashcardDeck } from '@/types';
import { progressStorageKey, commentsStorageKey, flashcardsStorageKey, flattenTasks, storeProgress, storeComments, storeFlashcards } from '@/lib/roadmap';
import { FlashcardStudyPanel } from './FlashcardStudyPanel';
import { normalizeFlashcardsByTask, normalizeSeedProgress, readSeedComments, readSeedFlashcards, storeTaskFlashcards, getFlashcardRequirement, formatDate } from './helpers';

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
    } catch { window.queueMicrotask(() => setProgress(null)); }
    try {
      const raw = window.localStorage.getItem(commentsStorageKey);
      hasLocalComments = raw !== null;
      const parsed = raw ? (JSON.parse(raw) as Record<string, NoteComment[]>) : {};
      window.queueMicrotask(() => setNoteComments(Array.isArray(parsed[task.id]) ? parsed[task.id] : []));
    } catch { window.queueMicrotask(() => setNoteComments([])); }
    try {
      const raw = window.localStorage.getItem(flashcardsStorageKey);
      hasLocalFlashcards = raw !== null;
      const parsed = raw ? normalizeFlashcardsByTask(JSON.parse(raw)) : {};
      const taskDecks = parsed[task.id] ?? [];
      window.queueMicrotask(() => { setFlashcardDecks(taskDecks); setActiveDeckId(taskDecks[0]?.id ?? null); resetStudyState(); });
    } catch { window.queueMicrotask(() => { setFlashcardDecks([]); setActiveDeckId(null); resetStudyState(); }); }

    async function hydrateMissingSeedData() {
      if (hasLocalProgress && hasLocalComments && hasLocalFlashcards) return;
      try {
        const response = await fetch('/api/skill-roadmap/progress', { cache: 'no-store' });
        if (!response.ok) return;
        const seed = await response.json();
        if (cancelled) return;
        if (!hasLocalProgress) { const p = normalizeSeedProgress(seed); if (p) { setProgress(p); storeProgress(p); } }
        if (!hasLocalComments) { const c = readSeedComments(seed); storeComments(c); setNoteComments(c[task.id] ?? []); }
        if (!hasLocalFlashcards) { const f = readSeedFlashcards(seed); storeFlashcards(f); const d = f[task.id] ?? []; setFlashcardDecks(d); setActiveDeckId(d[0]?.id ?? null); }
      } catch { /* Browser-local data is enough */ }
    }
    hydrateMissingSeedData();
    return () => { cancelled = true; };
  }, [task.id]);

  const descendants = useMemo(() => flattenTasks(task.children ?? []), [task.children]);
  const item = progress?.items?.[task.id] ?? null;
  const completedDescendants = descendants.filter((c) => progress?.items?.[c.id]?.completed).length;
  const effectivelyCompleted = Boolean(item?.completed) || (descendants.length > 0 && completedDescendants === descendants.length);
  const hasNote = Boolean(item?.note.trim());
  const canCreateFlashcards = effectivelyCompleted && hasNote;
  const requirement = getFlashcardRequirement({ completed: effectivelyCompleted, hasNote });
  const activeDeck = flashcardDecks.find((d) => d.id === activeDeckId) ?? flashcardDecks[0] ?? null;
  const activeCard = activeDeck?.cards[activeFlashcardIndex] ?? null;

  async function createFlashcards() {
    if (!canCreateFlashcards || !item?.note.trim()) { setFlashcardError(requirement); return; }
    if (!aiConfirmPassword.trim()) { setFlashcardError('Vui lòng nhập mật khẩu xác nhận trước khi dùng AI cấu hình trong env.'); return; }
    setGeneratingFlashcards(true);
    setFlashcardError(null);
    try {
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          confirmPassword: aiConfirmPassword,
          task: { id: task.id, title: task.title, level: task.level, deliverable: task.deliverable },
          note: item.note,
          comments: noteComments.map((c) => ({ author: c.author, body: c.body, createdAt: c.createdAt })),
          existingCards: flashcardDecks.flatMap((d) => d.cards.map((c) => c.front)),
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { deck?: Partial<FlashcardDeck> & { cards?: Flashcard[] }; error?: string };
      if (!response.ok || !body.deck || !Array.isArray(body.deck.cards)) throw new Error(body.error ?? 'Không tạo được flashcard.');
      const nextDeck: FlashcardDeck = {
        id: body.deck.id || crypto.randomUUID(), taskId: body.deck.taskId || task.id,
        taskTitle: body.deck.taskTitle || task.title, title: body.deck.title || `Bộ flashcard ${flashcardDecks.length + 1}`,
        createdAt: body.deck.createdAt || new Date().toISOString(),
        source: body.deck.source || { noteCharacters: item.note.length, commentCount: noteComments.length },
        cards: body.deck.cards,
      };
      const nextDecks = [...flashcardDecks, nextDeck];
      storeTaskFlashcards(task.id, nextDecks);
      setFlashcardDecks(nextDecks); setActiveDeckId(nextDeck.id); resetStudyState();
    } catch (e) { setFlashcardError(e instanceof Error ? e.message : 'Không tạo được flashcard.'); }
    finally { setGeneratingFlashcards(false); }
  }

  function selectDeck(deckId: string) { setActiveDeckId(deckId); resetStudyState(); }
  function resetStudyState() { setActiveFlashcardIndex(0); setFlashcardFlipped(false); setFlashcardRatings({}); }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`} className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
            <ArrowLeft className="h-4 w-4" /> Quay lại task
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs font-semibold uppercase text-gray-400">{task.id}</span>
            {flashcardDecks.length > 0 && <span className="rounded-full bg-violet-100 px-2 py-0.5 text-xs font-semibold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200">{flashcardDecks.length} bộ</span>}
          </div>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-3xl">Flashcard: {task.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-blue-700 dark:hover:text-blue-300">
            <FileText className="h-4 w-4" /> Mở note
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric icon={effectivelyCompleted ? CheckCircle2 : Circle} label="Trạng thái" value={effectivelyCompleted ? 'Đã học' : 'Chưa học'} />
        <Metric icon={StickyNote} label="Note" value={hasNote ? 'Đã có' : 'Chưa có'} />
        <Metric icon={Layers} label="Bộ thẻ" value={String(flashcardDecks.length)} />
        <Metric icon={Clock3} label="Nguồn comment" value={String(noteComments.length)} />
      </div>

      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">AI Flashcards</p>
              <h2 className="mt-1 flex items-center gap-2 text-lg font-bold text-gray-950 dark:text-white">
                <Brain className="h-5 w-5 text-violet-600 dark:text-violet-400" /> Tạo nhiều bộ thẻ theo các góc học khác nhau
              </h2>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">Nguồn học gồm toàn bộ note hiện tại và {noteComments.length} comment. Bộ mới sẽ được yêu cầu đổi góc hỏi so với các thẻ đã có.</p>
            </div>
            <div className="w-full shrink-0 space-y-2 lg:w-72">
              <label className="block">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Mật khẩu xác nhận</span>
                <input value={aiConfirmPassword} onChange={(e) => setAiConfirmPassword(e.target.value)} type="password" placeholder="Password dùng AI env" autoComplete="off" className="mt-1 w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-violet-400 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-100" />
              </label>
              <button type="button" onClick={createFlashcards} disabled={!canCreateFlashcards || generatingFlashcards} className={cn('inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition', canCreateFlashcards ? 'bg-violet-600 text-white hover:bg-violet-700 disabled:cursor-wait disabled:bg-violet-400' : 'cursor-not-allowed bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-400')}>
                {generatingFlashcards ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generatingFlashcards ? 'Đang tạo' : flashcardDecks.length > 0 ? 'Tạo bộ mới' : 'Tạo flashcard'}
              </button>
            </div>
          </div>
          {requirement && <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200">{requirement}</div>}
          {flashcardError && <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">{flashcardError}</div>}
          {flashcardDecks.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {flashcardDecks.map((deck, i) => (
                <button key={deck.id} type="button" onClick={() => selectDeck(deck.id)} className={cn('rounded-lg border px-4 py-3 text-left transition', activeDeck?.id === deck.id ? 'border-violet-300 bg-violet-50 text-violet-950 dark:border-violet-800 dark:bg-violet-950/30 dark:text-violet-100' : 'border-gray-200 bg-white text-gray-800 hover:border-violet-200 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-200 dark:hover:border-violet-900')}>
                  <div className="font-semibold">{deck.title || `Bộ flashcard ${i + 1}`}</div>
                  <div className="mt-1 text-xs font-medium text-gray-500 dark:text-gray-400">{deck.cards.length} thẻ · Tạo lúc {formatDate(deck.createdAt)}</div>
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
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-gray-600 dark:text-gray-300">Hoàn thành task, nhập note, sau đó tạo bộ flashcard đầu tiên để bắt đầu ôn tập.</p>
          </CardContent>
        </Card>
      ) : (
        <FlashcardStudyPanel
          deck={activeDeck} activeIndex={activeFlashcardIndex} flipped={flashcardFlipped} ratings={flashcardRatings}
          onFlip={() => setFlashcardFlipped((c) => !c)}
          onPrevious={() => { setActiveFlashcardIndex((c) => Math.max(c - 1, 0)); setFlashcardFlipped(false); }}
          onNext={() => { setActiveFlashcardIndex((c) => Math.min(c + 1, (activeDeck?.cards.length ?? 1) - 1)); setFlashcardFlipped(false); }}
          onRate={(cardId, rating) => { setFlashcardRatings((c) => ({ ...c, [cardId]: rating })); }}
          onRestart={resetStudyState}
        />
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-lg bg-blue-50 p-2 text-blue-600 dark:bg-blue-950/40 dark:text-blue-300"><Icon className="h-5 w-5" /></div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{label}</div>
          <div className="mt-0.5 font-bold text-gray-950 dark:text-white">{value}</div>
        </div>
      </CardContent>
    </Card>
  );
}
