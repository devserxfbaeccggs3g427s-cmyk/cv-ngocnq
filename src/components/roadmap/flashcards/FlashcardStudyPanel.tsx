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

        <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex flex-col gap-3 border-b border-gray-200 bg-white px-3 py-3.5 dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-violet-100 px-2.5 py-1 text-sm font-semibold text-violet-800 dark:bg-violet-900/40 dark:text-violet-200 sm:px-2 sm:py-0.5 sm:text-xs">
                  {activeCard.tag}
                </span>
                <span className="text-sm font-semibold text-gray-600 dark:text-gray-300 sm:text-xs sm:font-medium sm:text-gray-500 sm:dark:text-gray-400">
                  Thẻ {activeIndex + 1}/{cards.length}
                </span>
                <span className="text-sm font-medium leading-6 text-gray-600 dark:text-gray-300 sm:text-xs sm:leading-normal sm:text-gray-500 sm:dark:text-gray-400">
                  {deck.title} · {formatDate(deck.createdAt)}
                </span>
                {activeRating && (
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-1 text-sm font-semibold sm:px-2 sm:py-0.5 sm:text-xs',
                      activeRating === 'good'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200'
                        : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'
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
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2 text-base font-semibold text-gray-700 transition hover:border-violet-300 hover:text-violet-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-violet-700 dark:hover:text-violet-300 sm:h-9 sm:w-fit sm:px-3 sm:py-0 sm:text-sm"
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
                  'relative min-h-[24rem] rounded-xl transition-transform duration-500 ease-out [transform-style:preserve-3d] motion-reduce:transition-none sm:min-h-[22rem]',
                  flipped ? '[transform:rotateY(180deg)]' : '[transform:rotateY(0deg)]'
                )}
              >
                <FlashcardFace
                  eyebrow="Câu hỏi"
                  label={`Thẻ ${activeIndex + 1}/${cards.length}`}
                  tone="front"
                >
                  <div className="text-[1.45rem] font-bold leading-9 text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:text-2xl">
                    {activeCard.front}
                  </div>
                  {activeCard.hint && (
                    <div className="mt-6 rounded-lg border border-violet-100 bg-violet-50 px-4 py-3 text-base leading-7 text-violet-800 dark:border-violet-900/60 dark:bg-violet-950/30 dark:text-violet-200 sm:text-sm sm:leading-6">
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
                  <div className="max-h-64 overflow-y-auto pr-1 text-xl font-semibold leading-9 text-gray-950 [overflow-wrap:anywhere] dark:text-white sm:max-h-72 sm:leading-8">
                    {activeCard.back}
                  </div>
                  <div className="mt-6 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-3 text-base leading-7 text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-200 sm:text-sm sm:leading-6">
                    Tự đánh giá ngay sau khi đọc đáp án để theo dõi thẻ cần ôn lại.
                  </div>
                </FlashcardFace>
              </div>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 transition group-hover:text-violet-600 group-focus-visible:text-violet-600 dark:text-gray-300 dark:group-hover:text-violet-300 dark:group-focus-visible:text-violet-300 sm:text-xs sm:text-gray-500 sm:dark:text-gray-400">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                {flipped ? 'Nhấn để quay lại câu hỏi' : 'Nhấn để lật xem đáp án'}
              </div>
            </button>
          </div>

          <div className="flex flex-col gap-3 border-t border-gray-200 bg-white px-3 py-4 dark:border-gray-800 dark:bg-gray-950 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => onRate(activeCard.id, 'hard')}
                className={cn(
                  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-base font-semibold transition sm:h-9 sm:min-h-0 sm:py-0 sm:text-sm',
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
                  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-base font-semibold transition sm:h-9 sm:min-h-0 sm:py-0 sm:text-sm',
                  ratings[activeCard.id] === 'good'
                    ? 'border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/30 dark:text-emerald-200'
                    : 'border-gray-200 text-gray-700 hover:border-emerald-300 hover:text-emerald-700 dark:border-gray-700 dark:text-gray-300 dark:hover:border-emerald-800 dark:hover:text-emerald-200'
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
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-base font-semibold text-gray-700 transition hover:border-violet-300 hover:text-violet-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:border-violet-700 dark:hover:text-violet-300 sm:h-9 sm:min-h-0 sm:py-0 sm:text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Trước
              </button>
              <button
                type="button"
                onClick={onNext}
                disabled={activeIndex >= cards.length - 1}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-gray-950 px-3 py-2 text-base font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 sm:h-9 sm:min-h-0 sm:py-0 sm:text-sm"
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
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-3 dark:border-gray-800 dark:bg-gray-900 sm:py-2">
      <div className="text-xl font-bold text-gray-950 dark:text-white sm:text-lg">{value}</div>
      <div className="text-sm font-semibold leading-5 text-gray-600 dark:text-gray-300 sm:text-xs sm:uppercase sm:tracking-wide sm:text-gray-500 sm:dark:text-gray-400">
        {label}
      </div>
    </div>
  );
}
