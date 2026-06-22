'use client';

import { useState, useEffect, useCallback } from 'react';
import type { FlashcardDeck } from '@/types';
import { readStoredFlashcards, storeFlashcards } from '@/lib/roadmap';

/**
 * Flashcards localStorage state hook.
 * Manages flashcard decks per task, persisting to localStorage.
 */
export function useFlashcardDecks() {
  const [flashcardsByTask, setFlashcardsByTask] = useState<Record<string, FlashcardDeck[]>>({});

  useEffect(() => {
    const stored = readStoredFlashcards();
    setFlashcardsByTask(stored);
  }, []);

  const getDecksForTask = useCallback(
    (taskId: string): FlashcardDeck[] => {
      return flashcardsByTask[taskId] ?? [];
    },
    [flashcardsByTask]
  );

  const setDecksForTask = useCallback(
    (taskId: string, decks: FlashcardDeck[]) => {
      setFlashcardsByTask((current) => {
        const next = { ...current, [taskId]: decks };
        storeFlashcards(next);
        return next;
      });
    },
    []
  );

  const addDeck = useCallback(
    (taskId: string, deck: FlashcardDeck) => {
      setFlashcardsByTask((current) => {
        const existing = current[taskId] ?? [];
        const next = { ...current, [taskId]: [...existing, deck] };
        storeFlashcards(next);
        return next;
      });
    },
    []
  );

  const removeDeck = useCallback(
    (taskId: string, deckId: string) => {
      setFlashcardsByTask((current) => {
        const existing = current[taskId] ?? [];
        const next = { ...current, [taskId]: existing.filter((d) => d.id !== deckId) };
        storeFlashcards(next);
        return next;
      });
    },
    []
  );

  const replaceAllFlashcards = useCallback(
    (flashcards: Record<string, FlashcardDeck[]>) => {
      setFlashcardsByTask(flashcards);
      storeFlashcards(flashcards);
    },
    []
  );

  return {
    flashcardsByTask,
    getDecksForTask,
    setDecksForTask,
    addDeck,
    removeDeck,
    replaceAllFlashcards,
  };
}
