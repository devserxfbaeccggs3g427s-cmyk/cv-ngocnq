'use client';

import { cn } from '@/lib/utils';
import type { Flashcard } from '@/types';

interface SegmentedProgressBarProps {
  cards: Flashcard[];
  ratings: Record<string, 'hard' | 'good'>;
  activeIndex: number;
  onSegmentClick: (index: number) => void;
}

export function SegmentedProgressBar({
  cards,
  ratings,
  activeIndex,
  onSegmentClick,
}: SegmentedProgressBarProps) {
  if (cards.length === 0) {
    return null;
  }

  return (
    <div
      className="mt-3 flex h-3 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700"
      role="list"
      aria-label="Tiến độ flashcard"
    >
      {cards.map((card, index) => {
        const rating = ratings[card.id];

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSegmentClick(index)}
            className={cn(
              'min-w-2 flex-1 transition hover:brightness-95 focus:outline-none focus-visible:brightness-90',
              rating === 'good'
                ? 'bg-emerald-500'
                : rating === 'hard'
                  ? 'bg-orange-400'
                  : 'bg-gray-200 dark:bg-gray-700'
            )}
            role="listitem"
            aria-label={`Chuyển đến thẻ ${index + 1}`}
            aria-current={activeIndex === index ? 'step' : undefined}
          />
        );
      })}
    </div>
  );
}
