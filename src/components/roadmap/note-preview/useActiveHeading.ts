'use client';

import { useState, useEffect, useMemo } from 'react';
import type { MarkdownHeading } from '@/components/markdown/MarkdownPreview';

const ACTIVE_HEADING_OFFSET = 120;

export function useActiveHeading(headings: MarkdownHeading[]) {
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  const headingIds = useMemo(
    () => headings.map((heading) => heading.id).join('|'),
    [headings]
  );

  useEffect(() => {
    if (!headings.length) {
      window.queueMicrotask(() => setActiveHeadingId(null));
      return;
    }

    let frameId = 0;

    const updateActiveHeading = () => {
      frameId = 0;

      const headingElements = headings
        .map((heading) => document.getElementById(heading.id))
        .filter((element): element is HTMLElement => Boolean(element));

      if (!headingElements.length) {
        setActiveHeadingId(null);
        return;
      }

      const current =
        headingElements.findLast(
          (element) => element.getBoundingClientRect().top <= ACTIVE_HEADING_OFFSET
        ) ?? headingElements[0];

      setActiveHeadingId(current.id);
    };

    const requestUpdate = () => {
      if (frameId) {
        return;
      }

      frameId = window.requestAnimationFrame(updateActiveHeading);
    };

    requestUpdate();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frameId) {
        window.cancelAnimationFrame(frameId);
      }

      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, [headingIds, headings]);

  return activeHeadingId;
}
