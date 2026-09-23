/**
 * Auth gate — localStorage-only helpers.
 *
 * Stores a single numeric timestamp under AUTH_STORAGE_KEY. `isAuthenticated`
 * is true while `Date.now() - unlockedAt < AUTH_TTL_MS` (24h).
 *
 * All functions are SSR-safe: they return neutral values when `window` is
 * undefined, and swallow localStorage failures for private-browsing / quota
 * edge cases (mirrors the pattern in `src/hooks/useLocalStorage.ts`).
 */

export const AUTH_STORAGE_KEY = 'cv-auth-unlocked-at';
export const AUTH_TTL_MS = 24 * 60 * 60 * 1000;

/** Returns the stored unlock timestamp in ms, or null if missing/invalid. */
export function readUnlockedAt(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw === null) return null;
    const ts = Number(raw);
    return Number.isFinite(ts) && ts > 0 ? ts : null;
  } catch {
    return null;
  }
}

/** True iff a valid, non-stale timestamp is in localStorage. */
export function isAuthenticated(): boolean {
  const ts = readUnlockedAt();
  if (ts === null) return false;
  return Date.now() - ts < AUTH_TTL_MS;
}

/** Writes the current timestamp, marking the session as unlocked for 24h. */
export function unlock(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(AUTH_STORAGE_KEY, String(Date.now()));
  } catch {
    // localStorage can fail in private mode or when quota is exhausted.
    // The session in-memory state in AuthContext will still reflect unlock(),
    // so the user keeps working until the next reload — they just won't
    // survive a refresh. Acceptable for a soft gate.
  }
}

/** Clears the unlock timestamp. */
export function lock(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore — same reasoning as unlock()
  }
}

/** Milliseconds remaining until the current unlock expires (0 if not authed). */
export function getRemainingMs(): number {
  const ts = readUnlockedAt();
  if (ts === null) return 0;
  const remaining = AUTH_TTL_MS - (Date.now() - ts);
  return remaining > 0 ? remaining : 0;
}