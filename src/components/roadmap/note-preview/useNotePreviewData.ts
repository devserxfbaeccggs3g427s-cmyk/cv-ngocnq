'use client';

import { useState, useEffect, useMemo } from 'react';
import type { ProgressFile, TaskContext } from '@/types';
import {
  progressStorageKey,
  commentsStorageKey,
  storeProgress,
  hasStoredComments,
} from '@/lib/roadmap';
import { normalizeProgress } from '@/lib/roadmap/normalize';

type NavigationTask = Pick<TaskContext, 'id' | 'title' | 'trackTitle' | 'moduleTitle'>;

export function useNotePreviewData(
  taskId: string,
  navigationTasks: NavigationTask[]
) {
  const [progress, setProgress] = useState<ProgressFile | null>(null);

  useEffect(() => {
    let cancelled = false;
    let hasLocalProgress = false;

    try {
      const raw = window.localStorage.getItem(progressStorageKey);
      hasLocalProgress = raw !== null;
      const storedProgress = raw ? (JSON.parse(raw) as ProgressFile) : null;
      window.queueMicrotask(() => setProgress(storedProgress));
    } catch {
      window.queueMicrotask(() => setProgress(null));
    }

    async function hydrateMissingSeedData() {
      if (hasLocalProgress && hasStoredComments()) {
        return;
      }

      try {
        const response = await fetch('/api/skill-roadmap/progress', {
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const seed = await response.json();

        if (cancelled) {
          return;
        }

        if (!hasLocalProgress) {
          const seedProgress = normalizeProgress(seed?.progress ?? seed);

          if (seedProgress) {
            setProgress(seedProgress);
            storeProgress(seedProgress);
          }
        }

        if (!hasStoredComments() && isRecord(seed) && isRecord(seed.comments)) {
          try {
            window.localStorage.setItem(commentsStorageKey, JSON.stringify(seed.comments));
          } catch {
            // Comments can still be imported manually if localStorage is unavailable.
          }
        }
      } catch {
        // The page can still render browser-local data only.
      }
    }

    hydrateMissingSeedData();

    return () => {
      cancelled = true;
    };
  }, [taskId]);

  const item = progress?.items?.[taskId] ?? null;
  const note = item?.note?.trim() ?? '';

  const learnedNavigation = useMemo(() => {
    const currentIndex = navigationTasks.findIndex(
      (navigationTask) => navigationTask.id === taskId
    );

    if (!progress || currentIndex < 0) {
      return { previous: null, next: null };
    }

    return {
      previous:
        navigationTasks
          .slice(0, currentIndex)
          .reverse()
          .find((t) => progress.items[t.id]?.completed) ?? null,
      next:
        navigationTasks
          .slice(currentIndex + 1)
          .find((t) => progress.items[t.id]?.completed) ?? null,
    };
  }, [navigationTasks, progress, taskId]);

  return { item, note, learnedNavigation };
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return Boolean(input) && typeof input === 'object' && !Array.isArray(input);
}
