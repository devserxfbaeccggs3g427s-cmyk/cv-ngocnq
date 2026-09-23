/**
 * =============================================================================
 * AUTH GATE CONFIGURATION
 * =============================================================================
 *
 * Single source of truth for the workspace password gate.
 *
 * What it protects:
 *   Everything except `/`, `/print`, `/unlock`, `/api/*` and other public
 *   surfaces. A user trying to reach a protected route without an unlock
 *   timestamp in localStorage is sent to the hidden `/unlock?next=<path>` URL.
 *
 * What it does NOT do:
 *   - Real security. The password is read from a NEXT_PUBLIC_* env var so it
 *     ships in the client bundle. Anyone who reads the bundle can bypass the
 *     gate. This is a "filter" for casual visitors, not a security boundary.
 *   - Rate-limiting. There's no lockout on repeated wrong passwords — would
 *     require a server endpoint.
 *   - Persisting the password. Only the unlock timestamp is stored.
 *
 * Env var:
 *   NEXT_PUBLIC_AUTH_PASSWORD — required for the gate to accept any input.
 *   If unset, getAuthPassword() returns '' and no password matches, so /unlock
 *   is effectively unreachable. Set this in .env.local before deploying.
 * =============================================================================
 */

/** Top-level path segments that require an unlock timestamp. */
export const PROTECTED_PATH_PREFIXES: readonly string[] = [
  '/workspace',
  '/portfolio',
  '/skill-roadmap',
  '/markdown-files',
  '/markdown-reader',
  '/ai-context',
  '/ai-image-analysis',
];

/** Paths that are always reachable, even without an unlock. */
export const PUBLIC_PATH_EXACT: readonly string[] = [
  '/',
  '/print',
  '/print-banking',
  '/unlock',
];

function startsWithApi(pathname: string): boolean {
  return pathname === '/api' || pathname.startsWith('/api/');
}

/**
 * Returns true if `pathname` should be blocked for an unauthenticated user.
 *
 * Matching rules:
 *   - Exact match in PUBLIC_PATH_EXACT → false
 *   - `/api/*` (server route handlers) → false (they don't render pages)
 *   - Exact match of a protected prefix OR a child (`/workspace/backup`) → true
 *   - Anything else (unknown paths, e.g. `/foo`) → false
 */
export function isProtectedPath(pathname: string): boolean {
  if (!pathname) return false;
  if (PUBLIC_PATH_EXACT.includes(pathname)) return false;
  if (startsWithApi(pathname)) return false;

  return PROTECTED_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

/**
 * Returns true if `pathname` is one of the surfaces that anyone — authed or
 * not — is allowed to visit directly: `/`, the printable CV surfaces, the
 * unlock form, and `/api/*` server route handlers. Use this to gate the
 * "redirect unknown URLs to /print" branch in `AuthGuard`.
 */
export function isPublicSurface(pathname: string): boolean {
  if (!pathname) return false;
  if (startsWithApi(pathname)) return true;
  return PUBLIC_PATH_EXACT.includes(pathname);
}

/**
 * Reads the configured password from the public env.
 *
 * `NEXT_PUBLIC_AUTH_PASSWORD` is exposed to the browser by Next.js — that is
 * intentional. The gate is client-side by design (see file header).
 */
export function getAuthPassword(): string {
  return process.env.NEXT_PUBLIC_AUTH_PASSWORD ?? '';
}