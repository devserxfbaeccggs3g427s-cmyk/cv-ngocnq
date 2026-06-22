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
import { FlashcardFace } from './FlashcardFace';
import { formatDate } from './helpers';

interface FlashcardStudyPanelProps {
  deck: FlashcardDeck;
  activeIndex: number;
  flipped: boolean;
  ratings: Record<string, 'hard' | 'good'>;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onRate: (cardId: string, rating: 'hard' | 'good') => void;
  onRestart: () => void;
}

export function FlashcardStudyPanel({
  deck,
  activeIndex,
  flipped,
  ratings,
  onFlip,
  onPrevious,
  onNext,
  onRate,
  onRestart,
}: FlashcardStudyPanelProps) {
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
