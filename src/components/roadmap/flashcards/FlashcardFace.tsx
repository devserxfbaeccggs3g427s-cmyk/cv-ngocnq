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
