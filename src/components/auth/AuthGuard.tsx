'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isProtectedPath, isPublicSurface } from '@/config/auth.config';
import { useAuth } from '@/components/auth/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Wraps protected content. Once the auth context has hydrated, it routes
 * unauthenticated visitors to a safe landing surface:
 *
 *   - Protected route (`/workspace`, `/portfolio`, …) → `/unlock?next=<path>`
 *     so the user can authenticate and bounce back to where they were going.
 *   - Unknown route (anything not protected and not a public surface, e.g.
 *     `/foo`) → `/print` so casual visitors don't leak the workspace's URL
 *     shape via the 404 page chrome.
 *   - Public surface (`/`, `/print`, `/print-banking`, `/unlock`, `/api/*`)
 *     → render through, no redirect.
 *
 * Authenticated users pass through on every path.
 *
 * Before hydration we don't yet know whether the user is authed, so we
 * suppress anything that isn't already known to be a public surface —
 * that prevents protected UI from flashing on first paint and stops the
 * default 404 from rendering for unknown URLs.
 *
 * Re-runs the redirect effect whenever `pathname` or `isAuthed` flips, so
 * the gate stays correct across client-side navigation without a full reload.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed, hydrated } = useAuth();
  const protectedRoute = isProtectedPath(pathname);
  const publicSurface = isPublicSurface(pathname);

  useEffect(() => {
    if (!hydrated) return;
    if (isAuthed) return;
    if (protectedRoute) {
      const next = encodeURIComponent(pathname);
      router.replace(`/unlock?next=${next}`);
      return;
    }
    if (!publicSurface) {
      // Unknown URL (not in the protected list and not a public surface).
      // Bounce to the public CV instead of letting a 404 leak the page list
      // via the footer.
      router.replace('/print');
    }
  }, [hydrated, isAuthed, protectedRoute, publicSurface, pathname, router]);

  // Before hydration we don't yet know whether the user is authed, so we
  // can't safely render protected content. Public surfaces can still render
  // — their visibility is independent of auth state. Unknown paths are held
  // back until hydration completes so the redirect can fire cleanly.
  if (!hydrated) {
    if (publicSurface) return <>{children}</>;
    return null;
  }

  if (!isAuthed && (protectedRoute || !publicSurface)) return null;

  return <>{children}</>;
}