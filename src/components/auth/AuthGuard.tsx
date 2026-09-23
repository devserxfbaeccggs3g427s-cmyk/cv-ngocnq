'use client';

import { useEffect, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { isProtectedPath } from '@/config/auth.config';
import { useAuth } from '@/components/auth/AuthContext';

interface AuthGuardProps {
  children: ReactNode;
}

/**
 * Wraps protected content. On the first mount after hydration, redirects
 * any protected-but-unauthenticated route to `/unlock?next=<path>` and
 * renders nothing until the redirect kicks in (no flash of protected UI).
 *
 * Public routes (`/`, `/print`, `/unlock`, `/api/*`, anything else not in
 * PROTECTED_PATH_PREFIXES) pass through unconditionally.
 *
 * Re-runs the redirect effect whenever `pathname` or `isAuthed` flips, so
 * the gate stays correct across client-side navigation without a full reload.
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthed, hydrated } = useAuth();
  const protectedRoute = isProtectedPath(pathname);

  useEffect(() => {
    if (!hydrated) return;
    if (protectedRoute && !isAuthed) {
      const next = encodeURIComponent(pathname);
      router.replace(`/unlock?next=${next}`);
    }
  }, [hydrated, isAuthed, protectedRoute, pathname, router]);

  // Before hydration we don't yet know whether the user is authed, so we
  // can't safely render protected content. Public content can still render
  // — its visibility is independent of auth state.
  if (!hydrated) {
    if (protectedRoute) return null;
    return <>{children}</>;
  }

  if (protectedRoute && !isAuthed) return null;

  return <>{children}</>;
}