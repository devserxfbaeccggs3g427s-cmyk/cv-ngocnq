'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface FlashcardFaceProps {
  eyebrow: string;
  label: string;
  tone: 'front' | 'back';
  className?: string;
  children: ReactNode;
}

export function FlashcardFace({
  eyebrow,
  label,
  tone,
  className,
  children,
}: FlashcardFaceProps) {
  return (
    <div
      className={cn(
        'absolute inset-0 flex min-h-[27rem] flex-col justify-between rounded-[var(--radius-card)] border p-4 [backface-visibility:hidden] sm:min-h-[22rem] sm:p-7',
        tone === 'front'
          ? 'border-[var(--line-strong)] bg-[var(--surface)]'
          : 'border-[var(--success)] bg-[var(--surface)]',
        'shadow-sm transition-shadow group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-[var(--fg)]',
        className
      )}
    >
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="eyebrow">
            {eyebrow}
          </span>
          <span className="text-base font-semibold text-[var(--fg-muted)] sm:text-xs">{label}</span>
        </div>
        <div className="mt-6 sm:mt-8">{children}</div>
      </div>
      <div className="mt-6 flex items-center justify-between border-t border-[var(--line)] pt-4 text-base font-semibold text-[var(--fg-muted)] sm:mt-8 sm:text-xs">
        <span>{tone === 'front' ? 'Active recall' : 'Self review'}</span>
        <span>{tone === 'front' ? 'Lật thẻ' : 'Đánh giá'}</span>
      </div>
    </div>
  );
}
