'use client';

import { useState } from 'react';
import { ListTree, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { MarkdownHeading } from '@/components/markdown/MarkdownPreview';

export function AppendixLinks({
  headings,
  activeHeadingId,
  className,
  onNavigate,
}: {
  headings: MarkdownHeading[];
  activeHeadingId?: string | null;
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <ol className={`space-y-1 ${className ?? ''}`}>
      {headings.map((heading) => (
        <li key={heading.id} style={{ paddingLeft: `${Math.max(0, heading.level - 1) * 0.65}rem` }}>
          <a
            href={`#${heading.id}`}
            onClick={onNavigate}
            aria-current={activeHeadingId === heading.id ? 'location' : undefined}
            className={cn(
              'block rounded-md border-l-2 border-transparent px-2 py-1.5 text-sm font-medium leading-snug text-[var(--fg-muted)] transition hover:bg-[var(--surface-2)] hover:text-[var(--fg)]',
              activeHeadingId === heading.id &&
                'border-[var(--fg)] bg-[var(--surface-2)] text-[var(--fg)]'
            )}
          >
            {heading.text}
          </a>
        </li>
      ))}
    </ol>
  );
}

export function MobileAppendixDrawer({
  headings,
  activeHeadingId,
}: {
  headings: MarkdownHeading[];
  activeHeadingId: string | null;
}) {
  const [open, setOpen] = useState(false);

  if (headings.length === 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-primary fixed bottom-28 right-4 z-40 lg:hidden"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <ListTree className="h-4 w-4" aria-hidden="true" />
        Phụ lục
        <span className="badge badge-ghost ml-1">
          {headings.length}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Phụ lục">
          <button
            type="button"
            className="absolute inset-0 bg-[var(--fg)]/45"
            onClick={() => setOpen(false)}
            aria-label="Đóng phụ lục"
          />
          <div className="card absolute inset-x-0 bottom-0 max-h-[76vh] rounded-t-[var(--radius-card)] rounded-b-none">
            <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-3">
              <div>
                <h3 className="font-serif text-base font-normal text-[var(--fg)]">Phụ lục</h3>
                <p className="text-xs text-[var(--fg-muted)]">{headings.length} mục trong note</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn btn-ghost btn-sm"
                aria-label="Đóng phụ lục"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <AppendixLinks
              headings={headings}
              activeHeadingId={activeHeadingId}
              className="max-h-[calc(76vh-4.5rem)] overflow-y-auto overscroll-contain p-4"
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
