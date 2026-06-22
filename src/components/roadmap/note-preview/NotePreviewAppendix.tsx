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
              'block rounded-md border-l-2 border-transparent px-2 py-1.5 text-sm font-medium leading-snug text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white',
              activeHeadingId === heading.id &&
                'border-blue-500 bg-blue-50 text-blue-700 shadow-sm dark:border-blue-400 dark:bg-blue-950/40 dark:text-blue-200'
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
        className="fixed bottom-28 right-4 z-40 inline-flex items-center gap-2 rounded-full bg-gray-950 px-4 py-3 text-sm font-semibold text-white shadow-xl shadow-gray-950/20 transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200 sm:bottom-4 lg:hidden"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <ListTree className="h-4 w-4" aria-hidden="true" />
        Phụ lục
        <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs dark:bg-gray-950/10">
          {headings.length}
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Phụ lục">
          <button
            type="button"
            className="absolute inset-0 bg-gray-950/45"
            onClick={() => setOpen(false)}
            aria-label="Đóng phụ lục"
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[76vh] rounded-t-2xl border border-gray-200 bg-white shadow-2xl dark:border-gray-800 dark:bg-gray-950">
            <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-4 py-3 dark:border-gray-800">
              <div>
                <h3 className="font-semibold text-gray-950 dark:text-white">Phụ lục</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{headings.length} mục trong note</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition hover:bg-gray-100 hover:text-gray-950 dark:border-gray-800 dark:text-gray-300 dark:hover:bg-gray-900 dark:hover:text-white"
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
