'use client';

import { useState, useEffect, useCallback } from 'react';
import type { NoteComment } from '@/types';
import { readStoredComments, storeComments } from '@/lib/roadmap';

/**
 * Comments localStorage state hook.
 * Manages note comments per task, persisting to localStorage.
 */
export function useNoteComments() {
  const [commentsByTask, setCommentsByTask] = useState<Record<string, NoteComment[]>>({});

  useEffect(() => {
    const stored = readStoredComments();
    setCommentsByTask(stored);
  }, []);

  const getCommentsForTask = useCallback(
    (taskId: string): NoteComment[] => {
      return commentsByTask[taskId] ?? [];
    },
    [commentsByTask]
  );

  const setCommentsForTask = useCallback(
    (taskId: string, comments: NoteComment[]) => {
      setCommentsByTask((current) => {
        const next = { ...current, [taskId]: comments };
        storeComments(next);
        return next;
      });
    },
    []
  );

  const addComment = useCallback(
    (taskId: string, comment: NoteComment) => {
      setCommentsByTask((current) => {
        const existing = current[taskId] ?? [];
        const next = { ...current, [taskId]: [...existing, comment] };
        storeComments(next);
        return next;
      });
    },
    []
  );

  const removeComment = useCallback(
    (taskId: string, commentId: string) => {
      setCommentsByTask((current) => {
        const existing = current[taskId] ?? [];
        const next = { ...current, [taskId]: existing.filter((c) => c.id !== commentId) };
        storeComments(next);
        return next;
      });
    },
    []
  );

  const replaceAllComments = useCallback(
    (comments: Record<string, NoteComment[]>) => {
      setCommentsByTask(comments);
      storeComments(comments);
    },
    []
  );

  return {
    commentsByTask,
    getCommentsForTask,
    setCommentsForTask,
    addComment,
    removeComment,
    replaceAllComments,
  };
}
