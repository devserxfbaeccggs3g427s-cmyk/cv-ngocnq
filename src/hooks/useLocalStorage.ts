'use client';

import { useState, useCallback } from 'react';

/**
 * Generic localStorage state sync hook.
 * Reads stored value on mount, provides a setter that persists to localStorage,
 * and a remover that clears the key.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: {
    serialize?: (value: T) => string;
    deserialize?: (raw: string) => T | null;
  }
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const serialize = options?.serialize ?? JSON.stringify;
  const deserialize = options?.deserialize ?? ((raw: string) => {
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  });

  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const raw = window.localStorage.getItem(key);

      if (raw === null) {
        return initialValue;
      }

      const parsed = deserialize(raw);
      return parsed !== null ? parsed : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((current) => {
        const next = value instanceof Function ? value(current) : value;

        if (typeof window !== 'undefined') {
          try {
            window.localStorage.setItem(key, serialize(next));
          } catch {
            // localStorage can fail in private browsing or full quota.
          }
        }

        return next;
      });
    },
    [key, serialize]
  );

  const removeValue = useCallback(() => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(key);
      } catch {
        // localStorage can fail in locked-down browsers.
      }
    }

    setStoredValue(initialValue);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
