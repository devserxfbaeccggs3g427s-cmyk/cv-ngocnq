'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Brain, CheckCircle2, Circle, Clock3, Layers, Loader2, FileText, Sparkles, StickyNote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { Metric } from '@/components/roadmap/client/Metric';
import { cn } from '@/lib/utils';
import type { TaskContext, ProgressFile, NoteComment, Flashcard, FlashcardDeck } from '@/types';
import {
  getTaskStudyState,
  hydrateFromStorage,
  readStoredDuplicateDetectionConfig,
  storeDuplicateDetectionConfig,
} from '@/lib/roadmap';
import { FlashcardStudyPanel } from './FlashcardStudyPanel';
import { normalizeFlashcardsByTask, readSeedFlashcards, storeTaskFlashcards, getFlashcardRequirement, formatDate } from './helpers';

export function SkillRoadmapTaskFlashcards({ task }: { task: TaskContext }) {
  const [progress, setProgress] = useState<ProgressFile | null>(null);
  const [noteComments, setNoteComments] = useState<NoteComment[]>([]);
  const [flashcardDecks, setFlashcardDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeckId, setActiveDeckId] = useState<string | null>(null);
  const [aiToken, setAiToken] = useState('');
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);
  const [flashcardError, setFlashcardError] = useState<string | null>(null);
  const [activeFlashcardIndex, setActiveFlashcardIndex] = useState(0);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);
  const [flashcardRatings, setFlashcardRatings] = useState<Record<string, 'hard' | 'good'>>({});
  const [duplicateDetectionEnabled, setDuplicateDetectionEnabled] = useState(true);

  useEffect(() => {
    window.queueMicrotask(() => setDuplicateDetectionEnabled(readStoredDuplicateDetectionConfig().flashcards));

    return hydrateFromStorage({
      taskId: task.id,
      progressSetter: setProgress,
      commentsSetter: (_taskId, comments) => setNoteComments(comments),
      flashcardsSetter: (_taskId, decks) => {
        setFlashcardDecks(decks);
        setActiveDeckId(decks[0]?.id ?? null);
        resetStudyState();
      },
      normalizeFlashcards: normalizeFlashcardsByTask,
      readSeedFlashcards,
    });
  }, [task.id]);

  const item = progress?.items?.[task.id] ?? null;
  const effectivelyCompleted = progress ? getTaskStudyState(task, progress).effectivelyCompleted : false;
  const hasNote = Boolean(item?.note.trim());
  const canCreateFlashcards = effectivelyCompleted && hasNote;
  const requirement = getFlashcardRequirement({ completed: effectivelyCompleted, hasNote });
  const activeDeck = flashcardDecks.find((d) => d.id === activeDeckId) ?? flashcardDecks[0] ?? null;
  const activeCard = activeDeck?.cards[activeFlashcardIndex] ?? null;

  async function createFlashcards() {
    if (!canCreateFlashcards || !item?.note.trim()) { setFlashcardError(requirement); return; }
    if (!aiToken.trim()) { setFlashcardError('Vui lòng nhập token (API key) trước khi tạo flashcard.'); return; }
    setGeneratingFlashcards(true);
    setFlashcardError(null);
    try {
      const response = await fetch('/api/ai/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: aiToken,
          task: { id: task.id, title: task.title, level: task.level, deliverable: task.deliverable },
          note: item.note,
          comments: noteComments.map((c) => ({ author: c.author, body: c.body, createdAt: c.createdAt })),
          existingCards: duplicateDetectionEnabled ? flashcardDecks.flatMap((d) => d.cards.map((c) => c.front)) : [],
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
  function updateDuplicateDetection(enabled: boolean) {
    const current = readStoredDuplicateDetectionConfig();
    const next = { ...current, flashcards: enabled };
    setDuplicateDetectionEnabled(enabled);
    storeDuplicateDetectionConfig(next);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <Link href={`/skill-roadmap/tasks/${encodeURIComponent(task.id)}`} className="link-editorial inline-flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Quay lại task
          </Link>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="eyebrow">{task.id}</span>
            {flashcardDecks.length > 0 && <span className="badge">{flashcardDecks.length} bộ</span>}
          </div>
          <h1 className="mt-2 font-serif text-2xl font-normal leading-tight text-[var(--fg)] [overflow-wrap:anywhere] sm:text-3xl">Flashcard: {task.title}</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/skill-roadmap/notes/${encodeURIComponent(task.id)}`} className="btn btn-secondary">
            <FileText className="h-4 w-4" /> Mở note
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Metric variant="card" icon={effectivelyCompleted ? CheckCircle2 : Circle} label="Trạng thái" value={effectivelyCompleted ? 'Đã học' : 'Chưa học'} />
        <Metric variant="card" icon={StickyNote} label="Note" value={hasNote ? 'Đã có' : 'Chưa có'} />
        <Metric variant="card" icon={Layers} label="Bộ thẻ" value={String(flashcardDecks.length)} />
        <Metric variant="card" icon={Clock3} label="Nguồn comment" value={String(noteComments.length)} />
      </div>

      <Card>
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="min-w-0">
              <span className="eyebrow text-[var(--accent)]">AI Flashcards</span>
              <h2 className="mt-1 flex items-center gap-2 font-serif text-xl font-normal text-[var(--fg)]">
                <Brain className="h-5 w-5 text-[var(--accent)]" /> Tạo nhiều bộ thẻ theo các góc học khác nhau
              </h2>
              <p className="mt-2 text-sm leading-6 text-[var(--fg-muted)]">Nguồn học gồm toàn bộ note hiện tại và {noteComments.length} comment. Bộ mới sẽ được yêu cầu đổi góc hỏi so với các thẻ đã có.</p>
            </div>
            <div className="w-full shrink-0 space-y-2 lg:w-72">
              <label className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] px-3 py-2">
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-[var(--fg-muted)]">
                    Chặn câu trùng
                  </span>
                  <span className="block text-xs text-[var(--fg-muted)]">
                    Gửi thẻ đã có cho AI
                  </span>
                </span>
                <input
                  type="checkbox"
                  checked={duplicateDetectionEnabled}
                  onChange={(event) => updateDuplicateDetection(event.target.checked)}
                  className="h-4 w-4 rounded border-[var(--line-strong)] accent-[var(--fg)]"
                />
              </label>
              <label className="block">
                <span className="eyebrow">Token (API key)</span>
                <input
                  value={aiToken}
                  onChange={(e) => setAiToken(e.target.value)}
                  type="password"
                  placeholder="Nhập token để dùng AI"
                  autoComplete="off"
                  className="input-modern mt-1 w-full text-sm"
                />
              </label>
              <button
                type="button"
                onClick={createFlashcards}
                disabled={!canCreateFlashcards || generatingFlashcards}
                className={cn('btn w-full', canCreateFlashcards ? 'btn-primary' : 'btn-secondary')}
              >
                {generatingFlashcards ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {generatingFlashcards ? 'Đang tạo' : flashcardDecks.length > 0 ? 'Tạo bộ mới' : 'Tạo flashcard'}
              </button>
            </div>
          </div>
          {requirement && (
            <div className="card mt-4 border-[var(--warn)] px-4 py-3 text-sm font-medium text-[var(--warn)]">
              {requirement}
            </div>
          )}
          {flashcardError && (
            <div className="card mt-4 border-[var(--accent)] px-4 py-3 text-sm font-medium text-[var(--accent)]">
              {flashcardError}
            </div>
          )}
          {flashcardDecks.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {flashcardDecks.map((deck, i) => (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => selectDeck(deck.id)}
                  className={cn(
                    'card px-4 py-3 text-left transition',
                    activeDeck?.id === deck.id
                      ? 'border-[var(--fg)] bg-[var(--surface)]'
                      : 'hover:border-[var(--line-strong)]'
                  )}
                >
                  <div className="font-serif text-base font-semibold text-[var(--fg)]">
                    {deck.title || `Bộ flashcard ${i + 1}`}
                  </div>
                  <div className="mt-1 text-xs font-medium text-[var(--fg-muted)]">
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
            <Brain className="mx-auto h-10 w-10 text-[var(--fg-subtle)]" />
            <h2 className="mt-3 font-serif text-xl font-normal text-[var(--fg)]">Chưa có bộ flashcard</h2>
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[var(--fg-muted)]">Hoàn thành task, nhập note, sau đó tạo bộ flashcard đầu tiên để bắt đầu ôn tập.</p>
          </CardContent>
        </Card>
      ) : (
        <FlashcardStudyPanel
          taskId={task.id} deck={activeDeck} activeIndex={activeFlashcardIndex} flipped={flashcardFlipped} ratings={flashcardRatings}
          onFlip={() => setFlashcardFlipped((c) => !c)}
          onPrevious={() => { setActiveFlashcardIndex((c) => Math.max(c - 1, 0)); setFlashcardFlipped(false); }}
          onNext={() => { setActiveFlashcardIndex((c) => Math.min(c + 1, (activeDeck?.cards.length ?? 1) - 1)); setFlashcardFlipped(false); }}
          onRate={(cardId, rating) => { setFlashcardRatings((c) => ({ ...c, [cardId]: rating })); }}
          onSegmentClick={(index) => { setActiveFlashcardIndex(index); setFlashcardFlipped(false); }}
          onRestart={resetStudyState}
        />
      )}
    </div>
  );
}
