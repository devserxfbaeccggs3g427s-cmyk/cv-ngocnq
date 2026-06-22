'use client';

import { useState, useEffect, useCallback } from 'react';
import type { QuizDeck } from '@/types';
import { readStoredQuizzes, storeQuizzes } from '@/lib/roadmap';

/**
 * Quizzes localStorage state hook.
 * Manages quiz decks per task, persisting to localStorage.
 */
export function useQuizDecks() {
  const [quizzesByTask, setQuizzesByTask] = useState<Record<string, QuizDeck[]>>({});

  useEffect(() => {
    const stored = readStoredQuizzes();
    setQuizzesByTask(stored);
  }, []);

  const getDecksForTask = useCallback(
    (taskId: string): QuizDeck[] => {
      return quizzesByTask[taskId] ?? [];
    },
    [quizzesByTask]
  );

  const setDecksForTask = useCallback(
    (taskId: string, decks: QuizDeck[]) => {
      setQuizzesByTask((current) => {
        const next = { ...current, [taskId]: decks };
        storeQuizzes(next);
        return next;
      });
    },
    []
  );

  const addDeck = useCallback(
    (taskId: string, deck: QuizDeck) => {
      setQuizzesByTask((current) => {
        const existing = current[taskId] ?? [];
        const next = { ...current, [taskId]: [...existing, deck] };
        storeQuizzes(next);
        return next;
      });
    },
    []
  );

  const removeDeck = useCallback(
    (taskId: string, deckId: string) => {
      setQuizzesByTask((current) => {
        const existing = current[taskId] ?? [];
        const next = { ...current, [taskId]: existing.filter((d) => d.id !== deckId) };
        storeQuizzes(next);
        return next;
      });
    },
    []
  );

  const replaceAllQuizzes = useCallback(
    (quizzes: Record<string, QuizDeck[]>) => {
      setQuizzesByTask(quizzes);
      storeQuizzes(quizzes);
    },
    []
  );

  return {
    quizzesByTask,
    getDecksForTask,
    setDecksForTask,
    addDeck,
    removeDeck,
    replaceAllQuizzes,
  };
}
