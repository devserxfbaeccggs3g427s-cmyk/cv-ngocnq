'use client';

import { useCallback, useEffect, useState } from 'react';

export type DataDecksReturn<T> = {
  dataByTask: Record<string, T[]>;
  getForTask: (taskId: string) => T[];
  setForTask: (taskId: string, items: T[]) => void;
  add: (taskId: string, item: T) => void;
  remove: (taskId: string, itemId: string) => void;
  replaceAll: (data: Record<string, T[]>) => void;
};

export function useDataDecks<T extends { id: string }>(
  readStored: () => Record<string, T[]>,
  storeAll: (data: Record<string, T[]>) => void
): DataDecksReturn<T> {
  const [dataByTask, setDataByTask] = useState<Record<string, T[]>>({});

  useEffect(() => {
    const stored = readStored();
    window.queueMicrotask(() => setDataByTask(stored));
  }, [readStored]);

  const getForTask = useCallback((taskId: string) => dataByTask[taskId] ?? [], [dataByTask]);

  const setForTask = useCallback(
    (taskId: string, items: T[]) => {
      setDataByTask((current) => {
        const next = { ...current, [taskId]: items };
        storeAll(next);
        return next;
      });
    },
    [storeAll]
  );

  const add = useCallback(
    (taskId: string, item: T) => {
      setDataByTask((current) => {
        const existing = current[taskId] ?? [];
        const next = { ...current, [taskId]: [...existing, item] };
        storeAll(next);
        return next;
      });
    },
    [storeAll]
  );

  const remove = useCallback(
    (taskId: string, itemId: string) => {
      setDataByTask((current) => {
        const existing = current[taskId] ?? [];
        const next = { ...current, [taskId]: existing.filter((item) => item.id !== itemId) };
        storeAll(next);
        return next;
      });
    },
    [storeAll]
  );

  const replaceAll = useCallback(
    (data: Record<string, T[]>) => {
      setDataByTask(data);
      storeAll(data);
    },
    [storeAll]
  );

  return { dataByTask, getForTask, setForTask, add, remove, replaceAll };
}
