'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { AuthProvider } from '@/components/auth/AuthContext';
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
 *     redirected to `/unlock?next=<path>` before the protected UI mounts.
 *   - Renders the global chrome (`Header`, `SideNav`, `Footer`). On `/print`
 *     — the public CV surface — all three chrome elements are hidden so the
 *     page reads as a standalone printable document. `VariantToggle` inside
 *     `/print` and `/print-banking` is unaffected.
 *
 * The `<main>` element keeps the same `id`, `tabIndex`, `className` and
 * `aria-label` that the old server `layout.tsx` used, so skip-link anchors
 * and screen-reader landmarks continue to work.
 */
export function SiteShell({ children }: SiteShellProps) {
  const pathname = usePathname();
  // Both /print and /print-banking are public CV surfaces and should read
  // as standalone printable documents — no global nav, side anchor menu
  // or footer chrome.
  const isPrintSurface =
    pathname === '/print' || pathname === '/print-banking';

  return (
    <AuthProvider>
      <AuthGuard>
        {!isPrintSurface && <Header />}
        {!isPrintSurface && <SideNav />}
        <main
          id="main-content"
          tabIndex={-1}
          className="relative pt-16"
          aria-label="Nội dung chính"
        >
          {children}
        </main>
        {!isPrintSurface && <Footer />}
      </AuthGuard>
    </AuthProvider>
  );
}