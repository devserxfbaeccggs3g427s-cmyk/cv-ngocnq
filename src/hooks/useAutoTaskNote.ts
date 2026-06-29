'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import type { ProgressFile, TaskContext } from '@/types';
import {
  autoTaskNoteStorageKey,
  buildLearningPrompt,
  flattenTasks,
  getTaskStudyState,
  shouldSyncProgressFile,
  storeProgress,
} from '@/lib/roadmap';

type AutoTaskNoteRecord = {
  promptHash: string;
  status: 'in-flight' | 'succeeded' | 'failed' | 'skipped';
  updatedAt: string;
  message?: string;
};

type AutoTaskNoteStore = Record<string, AutoTaskNoteRecord>;

export type AutoNoteStatus = 'idle' | 'generating' | 'saved' | 'skipped' | 'error';

const autoNoteInFlightCooldownMs = 10 * 60 * 1000;
const autoNoteFailedCooldownMs = 6 * 60 * 60 * 1000;

function getStableTextHash(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash).toString(36);
}

function readAutoTaskNoteStore(): AutoTaskNoteStore {
  if (typeof window === 'undefined') {
    return {};
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(autoTaskNoteStorageKey) ?? '{}') as unknown;
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
      ? (parsed as AutoTaskNoteStore)
      : {};
  } catch {
    return {};
  }
}

function writeAutoTaskNoteRecord(taskId: string, record: AutoTaskNoteRecord) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(
      autoTaskNoteStorageKey,
      JSON.stringify({
        ...readAutoTaskNoteStore(),
        [taskId]: record,
      })
    );
  } catch {
    // The network guard still protects the current render if localStorage is unavailable.
  }
}

function removeAutoTaskNoteRecord(taskId: string) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const next = readAutoTaskNoteStore();
    delete next[taskId];
    window.localStorage.setItem(autoTaskNoteStorageKey, JSON.stringify(next));
  } catch {
    // If localStorage is unavailable, the retry still resets in-memory state for this render.
  }
}

function shouldSkipAutoTaskNote(taskId: string, promptHash: string) {
  const record = readAutoTaskNoteStore()[taskId];

  if (!record || record.promptHash !== promptHash) {
    return false;
  }

  const elapsedMs = Date.now() - new Date(record.updatedAt).getTime();

  if (record.status === 'succeeded') {
    return true;
  }

  if (record.status === 'in-flight' && elapsedMs < autoNoteInFlightCooldownMs) {
    return true;
  }

  return record.status === 'failed' && elapsedMs < autoNoteFailedCooldownMs;
}

export function useAutoTaskNote({
  task,
  progress,
  setProgress,
}: {
  task: TaskContext | null;
  progress: ProgressFile | null;
  setProgress: Dispatch<SetStateAction<ProgressFile | null>>;
}) {
  const [autoNoteStatus, setAutoNoteStatus] = useState<AutoNoteStatus>('idle');
  const [autoNoteMessage, setAutoNoteMessage] = useState<string | null>(null);
  const [autoNoteRetryNonce, setAutoNoteRetryNonce] = useState(0);
  const progressRef = useRef<ProgressFile | null>(progress);
  const autoNoteInFlightRef = useRef(false);
  const descendants = useMemo(() => flattenTasks(task?.children ?? []), [task?.children]);
  const item = task && progress ? progress.items?.[task.id] ?? null : null;
  const hasChildren = Boolean(task?.children?.length);
  const hasNote = Boolean(item?.note.trim());
  const effectivelyCompleted = task && progress ? getTaskStudyState(task, progress).effectivelyCompleted : false;
  const learningPrompt = useMemo(() => (task ? buildLearningPrompt(task) : ''), [task]);
  const descendantSummary = useMemo(
    () =>
      descendants.length
        ? descendants
            .map((child) => {
              const childItem = progress?.items?.[child.id];
              return `- ${child.id}: ${child.title} (${childItem?.completed ? 'đã hoàn thành' : 'chưa hoàn thành'})`;
            })
            .join('\n')
        : '',
    [descendants, progress]
  );

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) {
        return;
      }

      setAutoNoteStatus('idle');
      setAutoNoteMessage(null);
    });
    autoNoteInFlightRef.current = false;

    return () => {
      cancelled = true;
    };
  }, [task?.id]);

  useEffect(() => {
    if (!task || !progress || !hasChildren || !effectivelyCompleted || hasNote || autoNoteInFlightRef.current) {
      return;
    }

    const promptHash = getStableTextHash(learningPrompt);

    if (shouldSkipAutoTaskNote(task.id, promptHash)) {
      queueMicrotask(() => {
        setAutoNoteStatus('skipped');
        setAutoNoteMessage('Đã bỏ qua tự sinh note do đã có lần xử lý gần đây cho task này.');
      });
      return;
    }

    const controller = new AbortController();

    async function generateAndSaveTaskNote() {
      if (!task) {
        return;
      }

      autoNoteInFlightRef.current = true;
      setAutoNoteStatus('generating');
      setAutoNoteMessage('Đang tự động sinh note cho task cha bằng AI...');
      writeAutoTaskNoteRecord(task.id, {
        promptHash,
        status: 'in-flight',
        updatedAt: new Date().toISOString(),
      });

      try {
        const response = await fetch('/api/ai/task-note', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            task: {
              id: task.id,
              title: task.title,
              level: task.level,
              deliverable: task.deliverable,
            },
            learningPrompt,
            isCompleted: effectivelyCompleted,
            hasChildren,
            hasNote,
            descendantSummary,
          }),
        });

        const payload = (await response.json().catch(() => ({}))) as {
          note?: unknown;
          error?: unknown;
        };

        if (!response.ok) {
          throw new Error(typeof payload.error === 'string' ? payload.error : 'Không tự động sinh được note.');
        }

        const generatedNote = typeof payload.note === 'string' ? payload.note.trim() : '';

        if (!generatedNote) {
          throw new Error('AI không trả về note hợp lệ.');
        }

        let nextProgressToSync: ProgressFile | null = null;
        const latestProgress = progressRef.current;
        const latestItem = latestProgress?.items?.[task.id];
        const latestHasNote = Boolean(latestItem?.note.trim());
        const latestCompleted = latestProgress
          ? getTaskStudyState(task, latestProgress).effectivelyCompleted
          : false;

        if (!latestProgress || latestHasNote || !latestCompleted) {
          writeAutoTaskNoteRecord(task.id, {
            promptHash,
            status: 'skipped',
            updatedAt: new Date().toISOString(),
            message: 'Trạng thái task đã thay đổi trước khi lưu note.',
          });
          setAutoNoteStatus('skipped');
          setAutoNoteMessage('Đã bỏ qua vì task đã có note hoặc không còn đủ điều kiện lưu.');
          return;
        }

        const now = new Date().toISOString();
        nextProgressToSync = {
          ...latestProgress,
          updatedAt: now,
          items: {
            ...latestProgress.items,
            [task.id]: {
              completed: false,
              completedAt: null,
              note: generatedNote,
              updatedAt: now,
            },
          },
        };

        setProgress(nextProgressToSync);
        storeProgress(nextProgressToSync);

        if (shouldSyncProgressFile) {
          const saveResponse = await fetch('/api/skill-roadmap/progress', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ items: nextProgressToSync.items }),
          });

          if (!saveResponse.ok) {
            throw new Error('Đã lưu note vào trình duyệt, nhưng không sync được vào file JSON local.');
          }

          const saved = (await saveResponse.json()) as ProgressFile;
          setProgress(saved);
          storeProgress(saved);
        }

        writeAutoTaskNoteRecord(task.id, {
          promptHash,
          status: 'succeeded',
          updatedAt: new Date().toISOString(),
        });
        setAutoNoteStatus('saved');
        setAutoNoteMessage('Đã tự động sinh và lưu note cho task cha.');
      } catch (error) {
        if (controller.signal.aborted || !task) {
          return;
        }

        const message = error instanceof Error ? error.message : 'Không tự động sinh được note.';
        writeAutoTaskNoteRecord(task.id, {
          promptHash,
          status: 'failed',
          updatedAt: new Date().toISOString(),
          message,
        });
        setAutoNoteStatus('error');
        setAutoNoteMessage(message);
      } finally {
        autoNoteInFlightRef.current = false;
      }
    }

    void generateAndSaveTaskNote();

    return () => {
      controller.abort();
      autoNoteInFlightRef.current = false;
    };
  }, [
    autoNoteRetryNonce,
    descendantSummary,
    effectivelyCompleted,
    hasChildren,
    hasNote,
    learningPrompt,
    progress,
    setProgress,
    task,
  ]);

  function retryAutoNote() {
    if (!task || autoNoteStatus === 'generating') {
      return;
    }

    removeAutoTaskNoteRecord(task.id);
    autoNoteInFlightRef.current = false;
    setAutoNoteStatus('idle');
    setAutoNoteMessage(null);
    setAutoNoteRetryNonce((current) => current + 1);
  }

  return {
    autoNoteStatus,
    autoNoteMessage,
    retryAutoNote,
  };
}
