'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { ProgressFile, ProgressItem, RoadmapTask, TaskIndex, Roadmap } from '@/types';
import {
  emptyProgress,
  shouldSyncProgressFile,
  readStoredProgress,
  storeProgress,
  removeStoredProgress,
  removeStoredComments,
  removeStoredFlashcards,
  removeStoredQuizzes,
  hasStoredComments,
  hasStoredFlashcards,
  hasStoredQuizzes,
  storeComments,
  storeFlashcards,
  storeQuizzes,
  normalizeRoadmapBackup,
  buildTaskIndex,
  applyTaskProgressUpdate,
  flattenTasks,
} from '@/lib/roadmap';

export function useProgress(roadmap: Roadmap) {
  const [progress, setProgress] = useState<ProgressFile>(emptyProgress);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const taskIndex = useMemo<TaskIndex>(
    () => buildTaskIndex(roadmap.tracks),
    [roadmap.tracks]
  );

  const allTasks = useMemo(
    () =>
      roadmap.tracks.flatMap((track) =>
        track.modules.flatMap((module) => flattenTasks(module.tasks))
      ),
    [roadmap.tracks]
  );

  useEffect(() => {
    let ignore = false;

    async function loadProgress() {
      const storedProgress = readStoredProgress();

      try {
        const response = await fetch('/api/skill-roadmap/progress', {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error('Không đọc được file tiến độ');
        }

        const seed = normalizeRoadmapBackup(await response.json());

        if (!seed) {
          throw new Error('File tiến độ không đúng định dạng');
        }

        if (!ignore) {
          const nextProgress = storedProgress ?? seed.progress;

          setProgress(nextProgress);
          storeProgress(nextProgress);

          if (!hasStoredComments()) {
            storeComments(seed.comments);
          }

          if (!hasStoredFlashcards()) {
            storeFlashcards(seed.flashcards);
          }

          if (!hasStoredQuizzes()) {
            storeQuizzes(seed.quizzes);
          }
        }
      } catch {
        if (!ignore) {
          if (storedProgress) {
            setProgress(storedProgress);
          }

          setLoadError('Không tải được tiến độ seed từ file JSON. Tiến độ mới vẫn được lưu trong trình duyệt này.');
        }
      }
    }

    loadProgress();

    return () => {
      ignore = true;
    };
  }, []);

  const saveTask = useCallback(
    async (taskId: string, nextItem: Partial<ProgressItem>) => {
      setSavingTaskId(taskId);

      const previous = progress;
      const optimistic = applyTaskProgressUpdate(previous, taskId, nextItem, taskIndex);

      setProgress(optimistic);
      storeProgress(optimistic);

      try {
        if (shouldSyncProgressFile) {
          const response = await fetch('/api/skill-roadmap/progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              items: optimistic.items,
            }),
          });

          if (!response.ok) {
            throw new Error('Save failed');
          }

          const saved = (await response.json()) as ProgressFile;
          setProgress(saved);
          storeProgress(saved);
        }

        setLoadError(null);
      } catch {
        setLoadError('Đã lưu vào trình duyệt, nhưng không sync được vào file JSON local.');
      } finally {
        setSavingTaskId(null);
      }
    },
    [progress, taskIndex]
  );

  const toggleTask = useCallback(
    (task: RoadmapTask) => {
      const current = progress.items[task.id];
      saveTask(task.id, {
        completed: !current?.completed,
        note: current?.note ?? '',
        completedAt: !current?.completed ? new Date().toISOString() : null,
      });
    },
    [progress, saveTask]
  );

  const updateNote = useCallback(
    (taskId: string, note: string) => {
      setProgress((current) => {
        const next: ProgressFile = {
          ...current,
          updatedAt: new Date().toISOString(),
          items: {
            ...current.items,
            [taskId]: {
              completed: current.items[taskId]?.completed ?? true,
              completedAt: current.items[taskId]?.completedAt ?? new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              note,
            },
          },
        };

        storeProgress(next);
        return next;
      });
    },
    []
  );

  const resetProgress = useCallback(async () => {
    const confirmed = window.confirm(
      'Bạn chắc chắn muốn xoá tiến độ, comment, flashcard và trắc nghiệm đang lưu trong trình duyệt, sau đó tải lại tiến độ mới nhất từ file JSON trong project?'
    );

    if (!confirmed) {
      return;
    }

    removeStoredProgress();
    removeStoredComments();
    removeStoredFlashcards();
    removeStoredQuizzes();

    try {
      const response = await fetch('/api/skill-roadmap/progress', {
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error('Không đọc được file tiến độ mới nhất từ project.');
      }

      const data = normalizeRoadmapBackup(await response.json());

      if (!data) {
        throw new Error('File tiến độ trong project không đúng định dạng.');
      }

      setProgress(data.progress);
      storeProgress(data.progress);
      storeComments(data.comments);
      storeFlashcards(data.flashcards);
      storeQuizzes(data.quizzes);
      setLoadError(null);
    } catch (error) {
      throw error;
    }
  }, []);

  return {
    progress,
    setProgress,
    allTasks,
    taskIndex,
    savingTaskId,
    loadError,
    setLoadError,
    saveTask,
    toggleTask,
    updateNote,
    resetProgress,
  };
}
