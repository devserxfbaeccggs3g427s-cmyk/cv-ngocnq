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
      className="mt-3 flex h-3 overflow-hidden rounded-full bg-[var(--surface-2)]"
      role="list"
      aria-label="Tiến độ flashcard"
    >
      {cards.map((card, index) => {
        const rating = ratings[card.id];
        const isActive = activeIndex === index;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onSegmentClick(index)}
            className={cn(
              'min-w-2 flex-1 transition focus:outline-none',
              rating === 'good'
                ? 'bg-[var(--success)]'
                : rating === 'hard'
                  ? 'bg-[var(--warn)]'
                  : 'bg-[var(--line-strong)]',
              isActive && 'ring-2 ring-[var(--fg)] ring-inset'
            )}
            role="listitem"
            aria-label={`Chuyển đến thẻ ${index + 1}`}
            aria-current={isActive ? 'step' : undefined}
          />
        );
      })}
    </div>
  );
}
