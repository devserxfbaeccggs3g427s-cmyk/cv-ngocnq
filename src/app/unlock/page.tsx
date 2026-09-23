'use client';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Container } from '@/components/ui';
import { PasswordForm } from '@/components/auth/PasswordForm';
import { useAuth } from '@/components/auth/AuthContext';

const FALLBACK_NEXT = '/workspace';

/**
 * Hidden unlock route. Not linked from anywhere on the site — users reach it
 * by typing `/unlock` directly or by being redirected from `AuthGuard`.
 *
 * Reads the optional `?next=<path>` so the user lands on the page they were
 * trying to reach after a successful unlock. Defaults to `/workspace`.
 *
 * Already-authed visitors are bounced to `next` immediately so the form
 * never appears for them.
 *
 * `useSearchParams()` requires a Suspense boundary in Next.js App Router
 * (it bails out of static prerendering and needs a client-side fallback).
 * The Suspense wrapper below satisfies that without changing the user-facing
 * behavior — the form renders identically.
 */
export default function UnlockPage() {
  return (
    <Suspense fallback={<UnlockFallback />}>
      <UnlockInner />
    </Suspense>
  );
}

function UnlockFallback() {
  return (
    <Container size="sm" className="py-16 md:py-24">
      <div className="card card-flat glass-panel mx-auto max-w-md p-6 sm:p-8">
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <span className="rule-short" aria-hidden="true" />
            <span className="eyebrow">Workspace</span>
          </div>
          <h1 className="font-serif text-3xl leading-tight text-[var(--fg)] sm:text-4xl">
            Đăng nhập Workspace
          </h1>
          <p className="text-sm leading-6 text-[var(--fg-muted)]">
            Đang tải…
          </p>
        </div>
      </div>
    </Container>
  );
}

function UnlockInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthed, unlock, hydrated } = useAuth();
  const nextRef = useRef<string>(FALLBACK_NEXT);

  // Capture `next` once on mount so subsequent re-renders (e.g. after the
  // router replaces the URL) don't bounce the user elsewhere mid-flow.
  useEffect(() => {
    const raw = searchParams.get('next');
    if (raw && raw.startsWith('/') && !raw.startsWith('//')) {
      nextRef.current = raw;
    } else {
      nextRef.current = FALLBACK_NEXT;
    }
  }, [searchParams]);

  // Already-authed: skip the form, go straight to the destination.
  useEffect(() => {
    if (hydrated && isAuthed) {
      router.replace(nextRef.current);
    }
  }, [hydrated, isAuthed, router]);

  function handleSuccess() {
    unlock();
    router.replace(nextRef.current);
  }

  return (
    <Container size="sm" className="py-16 md:py-24">
      <div className="card card-flat glass-panel mx-auto max-w-md p-6 sm:p-8">
        <PasswordForm onSuccess={handleSuccess} />
      </div>
    </Container>
  );
}