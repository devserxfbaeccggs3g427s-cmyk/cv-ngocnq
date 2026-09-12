'use client';

import { ArrowDownToLine, ArrowUpToLine } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MarkdownFileScrollControls({
  onScrollTo,
  hasAppendix,
}: {
  onScrollTo: (position: 'start' | 'end') => void;
  hasAppendix: boolean;
}) {
  return (
    <div
      className={cn(
        'fixed z-40 flex overflow-hidden rounded-full border border-[var(--line-strong)] bg-[var(--surface)] p-1 lg:right-6 lg:flex-col',
        hasAppendix
          ? 'bottom-44 right-4 sm:bottom-20 sm:right-4 lg:bottom-6'
          : 'bottom-24 right-4 sm:bottom-4 lg:bottom-6'
      )}
      aria-label="Cuộn nhanh file Markdown"
    >
      <ScrollButton
        icon={ArrowUpToLine}
        label="Đầu file"
        onClick={() => onScrollTo('start')}
      />
      <div className="my-2 hidden h-px bg-[var(--line)] lg:block" aria-hidden="true" />
      <div className="mx-1 w-px bg-[var(--line)] lg:hidden" aria-hidden="true" />
      <ScrollButton
        icon={ArrowDownToLine}
        label="Cuối file"
        onClick={() => onScrollTo('end')}
      />
    </div>
  );
}

function ScrollButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof ArrowUpToLine;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="group inline-flex h-11 w-11 items-center justify-center rounded-full text-[var(--fg-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--fg)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fg)]"
    >
      <Icon className="h-5 w-5 transition group-hover:scale-105" aria-hidden="true" />
    </button>
  );
}
