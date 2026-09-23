'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/components/auth/AuthContext';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { Footer } from '@/components/layout/Footer';
import { Header } from '@/components/layout/Header';
import { SideNav } from '@/components/layout/SideNav';

interface SiteShellProps {
  children: ReactNode;
}

/**
 * Top-level shell that wires the auth gate around the existing layout.
 *
 * Responsibilities:
 *   - Provides `AuthContext` to the whole app via `AuthProvider`.
 *   - Runs `AuthGuard` so unauthenticated visits to protected routes are
 *     redirected to `/unlock?next=<path>`, and unknown URLs are redirected
 *     to `/print`, before any chrome or page UI can flash.
 *   - Renders the global chrome (`Header`, `SideNav`, `Footer`). The chrome
 *     is hidden whenever the user is not authenticated — the footer would
 *     otherwise leak the workspace's URL list to casual visitors on 404
 *     pages. The printable CV surfaces (`/print`, `/print-banking`) and the
 *     unlock form also hide the chrome so they read as clean standalone
 *     documents/entry points.
 *
 * The `<main>` element keeps the same `id`, `tabIndex`, `className` and
 * `aria-label` that the old server `layout.tsx` used, so skip-link anchors
 * and screen-reader landmarks continue to work.
 */
export function SiteShell({ children }: SiteShellProps) {
  return (
    <AuthProvider>
      <SiteShellInner>{children}</SiteShellInner>
    </AuthProvider>
  );
}

function SiteShellInner({ children }: SiteShellProps) {
  const pathname = usePathname();
  const { isAuthed, hydrated } = useAuth();

  const isPrintSurface =
    pathname === '/print' || pathname === '/print-banking';
  const isUnlockSurface = pathname === '/unlock';

  // Chrome is only shown to authenticated users on real workspace pages:
  //   - print / print-banking: always standalone, never chrome
  //   - /unlock: clean entry point, never chrome (and authed visitors are
  //     bounced off the page by UnlockPage's own effect anyway)
  //   - any other path while not authed: chrome is suppressed so the
  //     footer can't leak /workspace, /portfolio, … to a casual visitor
  //     landing on a 404 page.
  // Before hydration we conservatively hide the chrome, so there's no
  // flash of nav for authed users either (the check runs in the same
  // microtask as the page mount).
  const showChrome = hydrated && isAuthed && !isPrintSurface && !isUnlockSurface;

  return (
    <AuthGuard>
      {showChrome && <Header />}
      {showChrome && <SideNav />}
      <main
        id="main-content"
        tabIndex={-1}
        className="relative pt-16"
        aria-label="Nội dung chính"
      >
        {children}
      </main>
      {showChrome && <Footer />}
    </AuthGuard>
  );
}