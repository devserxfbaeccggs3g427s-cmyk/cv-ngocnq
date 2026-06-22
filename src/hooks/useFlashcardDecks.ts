'use client';

import type { FlashcardDeck } from '@/types';
import { readStoredFlashcards, storeFlashcards } from '@/lib/roadmap';
import { useDataDecks } from './useDataDecks';

export function useFlashcardDecks() {
  const { dataByTask, getForTask, setForTask, add, remove, replaceAll } =
    useDataDecks<FlashcardDeck>(readStoredFlashcards, storeFlashcards);
  return {
    flashcardsByTask: dataByTask, getDecksForTask: getForTask, setDecksForTask: setForTask,
    addDeck: add, removeDeck: remove, replaceAllFlashcards: replaceAll,
  };
}
