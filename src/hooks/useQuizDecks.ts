'use client';

import type { QuizDeck } from '@/types';
import { readStoredQuizzes, storeQuizzes } from '@/lib/roadmap';
import { useDataDecks } from './useDataDecks';

export function useQuizDecks() {
  const { dataByTask, getForTask, setForTask, add, remove, replaceAll } =
    useDataDecks<QuizDeck>(readStoredQuizzes, storeQuizzes);
  return {
    quizzesByTask: dataByTask, getDecksForTask: getForTask, setDecksForTask: setForTask,
    addDeck: add, removeDeck: remove, replaceAllQuizzes: replaceAll,
  };
}
