'use client';

import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { FlashcardDeck } from '@/types';
import { StudyCommentThread } from '@/components/roadmap/comments';
import { FlashcardFace } from './FlashcardFace';
import { SegmentedProgressBar } from './SegmentedProgressBar';
import { formatDate } from './helpers';

interface FlashcardStudyPanelProps {
  taskId: string;
  deck: FlashcardDeck;
  activeIndex: number;
  flipped: boolean;
  ratings: Record<string, 'hard' | 'good'>;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRate: (cardId: string, rating: 'hard' | 'good') => void;
  onSegmentClick: (index: number) => void;
  onRestart: () => void;
}

export function FlashcardStudyPanel({
  taskId,
  deck,
  activeIndex,
  flipped,
  ratings,
  onFlip,
  onPrevious,
  onNext,
  onRate,
  onSegmentClick,
  onRestart,
}: FlashcardStudyPanelProps) {
  const cards = deck.cards;
  const activeCard = cards[activeIndex];
  const reviewedCount = Object.keys(ratings).length;
  const hardCount = Object.values(ratings).filter((rating) => rating === 'hard').length;
  const goodCount = Object.values(ratings).filter((rating) => rating === 'good').length;
  const activeRating = ratings[activeCard?.id ?? ''];

  if (!activeCard) {
    return null;
  }

  return (
    <Card>
      <CardContent className="p-3 sm:p-5 md:p-6">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <FlashcardStat label="Tổng thẻ" value={String(cards.length)} />
          <FlashcardStat label="Đã ôn" value={`${reviewedCount}/${cards.length}`} />
          <FlashcardStat label="Nhớ tốt" value={String(goodCount)} />
          <FlashcardStat label="Cần ôn lại" value={String(hardCount)} />
        </div>

        <div className="mt-4 overflow-hidden rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface-2)]">
          <div className="flex flex-col gap-3 border-b border-[var(--line)] bg-[var(--surface)] px-3 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="badge">
                  {activeCard.tag}
                </span>
                <span className="text-base font-semibold text-[var(--fg-muted)] sm:text-xs sm:font-medium">
                  Thẻ {activeIndex + 1}/{cards.length}
                </span>
                <span className="text-base font-medium leading-7 text-[var(--fg-muted)] sm:text-xs sm:leading-normal">
                  {deck.title} · {formatDate(deck.createdAt)}
                </span>
                {activeRating && (
                  <span
                    className={cn(
                      'badge',
                      activeRating === 'good'
                        ? 'border-[var(--success)] text-[var(--success)]'
                        : 'border-[var(--warn)] text-[var(--warn)]'
                    )}
                  >
                    {activeRating === 'good' ? 'Đã nhớ' : 'Cần ôn lại'}
                  </span>
                )}
              </div>
              <SegmentedProgressBar
                cards={cards}
                ratings={ratings}
                activeIndex={activeIndex}
                onSegmentClick={onSegmentClick}
              />
            </div>
            <button
              type="button"
              onClick={onRestart}
              className="btn btn-secondary w-full sm:w-fit"
            >
              <RotateCcw className="h-4 w-4" />
              Ôn lại từ đầu
            </button>
          </div>

          <div className="px-3 py-5 sm:px-8 sm:py-8">
            <button
              type="button"
              onClick={onFlip}
              className="group mx-auto block w-full max-w-4xl text-left outline-none [perspective:1400px]"
              aria-label={flipped ? 'Xem mặt câu hỏi' : 'Xem mặt đáp án'}
              aria-pressed={flipped}
            >
              <div
                className={cn(
                  'relative min-h-[27rem] rounded-[var(--radius-card)] transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:transition-none sm:min-h-[22rem]',
                  flipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
                )}
              >
                <FlashcardFace
                  eyebrow="Câu hỏi"
                  label={`Thẻ ${activeIndex + 1}/${cards.length}`}
                  tone="front"
                >
                  <div className="font-serif text-[1.72rem] font-normal leading-10 text-[var(--fg)] [overflow-wrap:anywhere] sm:text-2xl sm:leading-9">
                    {activeCard.front}
                  </div>
                  {activeCard.hint && (
                    <div className="mt-6 rounded-md border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-4 text-lg leading-8 text-[var(--fg)] sm:py-3 sm:text-sm sm:leading-6">
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
                  <div className="max-h-72 overflow-y-auto pr-1 font-serif text-[1.45rem] font-normal leading-10 text-[var(--fg)] [overflow-wrap:anywhere] sm:max-h-72 sm:text-xl sm:leading-8">
                    {activeCard.back}
                  </div>
                  <div className="mt-6 rounded-md border border-[var(--line-strong)] bg-[var(--surface-2)] px-4 py-4 text-lg leading-8 text-[var(--fg)] sm:py-3 sm:text-sm sm:leading-6">
                    Tự đánh giá ngay sau khi đọc đáp án để theo dõi thẻ cần ôn lại.
                  </div>
                </FlashcardFace>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-base font-semibold text-[var(--fg-muted)] transition group-hover:text-[var(--fg)] group-focus-visible:text-[var(--fg)] sm:text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {flipped ? 'Nhấn để quay lại câu hỏi' : 'Nhấn để lật xem đáp án'}
              </div>
            </button>
          </div>

          <div className="flex flex-col gap-3 border-t border-[var(--line)] bg-[var(--surface)] px-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => onRate(activeCard.id, 'hard')}
                className={cn(
                  'btn',
                  ratings[activeCard.id] === 'hard'
                    ? 'btn-primary'
                    : 'btn-secondary'
                )}
              >
                <X className="h-4 w-4" />
                Khó nhớ
              </button>
              <button
                type="button"
                onClick={() => onRate(activeCard.id, 'good')}
                className={cn(
                  'btn',
                  ratings[activeCard.id] === 'good'
                    ? 'btn-primary'
                    : 'btn-secondary'
                )}
              >
                <Check className="h-4 w-4" />
                Đã nhớ
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={onPrevious}
                disabled={activeIndex === 0}
                className="btn btn-secondary disabled:opacity-40"
              >
                <ArrowLeft className="h-4 w-4" />
                Trước
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={activeIndex >= cards.length - 1}
                className="btn btn-primary disabled:opacity-40"
              >
                Sau
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        <StudyCommentThread
          taskId={taskId}
          deckId={deck.id}
          contextType="flashcard"
          contextId={activeCard.id}
          contextContent={[
            `Mặt trước: ${activeCard.front}`,
            `Mặt sau: ${activeCard.back}`,
            activeCard.hint ? `Gợi ý: ${activeCard.hint}` : '',
            `Tag: ${activeCard.tag}`,
          ].filter(Boolean).join('\n')}
        />
      </CardContent>
    </Card>
  );
}

function FlashcardStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[var(--radius-card)] border border-[var(--line)] bg-[var(--surface)] px-3 py-3.5 sm:py-2">
      <div className="stat-number text-2xl text-[var(--fg)] sm:text-lg">{value}</div>
      <div className="eyebrow mt-1">
        {label}
      </div>
    </div>
  );
}
