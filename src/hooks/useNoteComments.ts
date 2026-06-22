'use client';

import type { NoteComment } from '@/types';
import { readStoredComments, storeComments } from '@/lib/roadmap';
import { useDataDecks } from './useDataDecks';

export function useNoteComments() {
  const { dataByTask, getForTask, setForTask, add, remove, replaceAll } =
    useDataDecks<NoteComment>(readStoredComments, storeComments);
  return {
    commentsByTask: dataByTask, getCommentsForTask: getForTask, setCommentsForTask: setForTask,
    addComment: add, removeComment: remove, replaceAllComments: replaceAll,
  };
}
