'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  AUTH_TTL_MS,
  getRemainingMs,
  isAuthenticated,
  lock as lockStorage,
  readUnlockedAt,
  unlock as unlockStorage,
} from '@/lib/auth';

export interface AuthContextValue {
  /** True once we've read localStorage and confirmed a fresh unlock. */
  isAuthed: boolean;
  /** The stored timestamp in ms (0 if not authed). */
  unlockedAt: number;
  /** Milliseconds remaining until expiry (0 if not authed). */
  remainingMs: number;
  /** True after the first mount-time localStorage read. */
  hydrated: boolean;
  /** Records the current time as the unlock timestamp. */
  unlock: () => void;
  /** Clears the unlock timestamp. */
  lock: () => void;
}

const noop = () => {};

const defaultValue: AuthContextValue = {
  isAuthed: false,
  unlockedAt: 0,
  remainingMs: 0,
  hydrated: false,
  unlock: noop,
  lock: noop,
};

const AuthContext = createContext<AuthContextValue>(defaultValue);

/**
 * Provides auth-gate state to the React tree. Must wrap any component that
 * calls `useAuth()`.
 *
 * Re-checks expiry every minute so that a session that crosses the 24h mark
 * while the tab is still open is correctly marked as locked. The check is
 * cheap (one localStorage read + a Date.now() comparison).
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [unlockedAt, setUnlockedAt] = useState(0);
  const [remainingMs, setRemainingMs] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount.
  //
  // We have to defer this read to a mount effect because `window` is
  // undefined during the server pass. Setting state in the effect is the
  // standard pattern for client-only hydration of persisted state — this is
  // exactly what useEffect is for, so we disable the
  // `react-hooks/set-state-in-effect` lint rule for the hydration block.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect --
       intentional: client-only localStorage hydration on mount */
    const ts = readUnlockedAt();
    const authed = ts !== null && Date.now() - ts < AUTH_TTL_MS;
    setUnlockedAt(authed ? ts ?? 0 : 0);
    setIsAuthed(authed);
    setRemainingMs(authed ? getRemainingMs() : 0);
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  // Tick every minute to detect expiry while the tab is open.
  useEffect(() => {
    if (!isAuthed) return;
    const id = window.setInterval(() => {
      const remaining = getRemainingMs();
      if (remaining <= 0) {
        lockStorage();
        setIsAuthed(false);
        setUnlockedAt(0);
        setRemainingMs(0);
      } else {
        setRemainingMs(remaining);
      }
    }, 60_000);
    return () => window.clearInterval(id);
  }, [isAuthed]);

  const handleUnlock = useCallback(() => {
    unlockStorage();
    const now = Date.now();
    setUnlockedAt(now);
    setIsAuthed(true);
    setRemainingMs(AUTH_TTL_MS);
  }, []);

  const handleLock = useCallback(() => {
    lockStorage();
    setIsAuthed(false);
    setUnlockedAt(0);
    setRemainingMs(0);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      isAuthed,
      unlockedAt,
      remainingMs,
      hydrated,
      unlock: handleUnlock,
      lock: handleLock,
    }),
    [isAuthed, unlockedAt, remainingMs, hydrated, handleUnlock, handleLock]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}