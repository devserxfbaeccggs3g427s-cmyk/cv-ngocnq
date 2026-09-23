'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthContext';

/**
 * `/` is the site's root URL. The redirect target depends on who lands here:
 *
 *   - Unauthenticated visitors (recruiters, casual lookers) are sent to
 *     `/print`, the public CV surface, so the root URL always resolves to
 *     something meaningful for outsiders.
 *   - Authenticated visitors (already past the workspace gate) are sent to
 *     `/workspace`, the natural landing page for someone who has unlocked
 *     the rest of the site. This avoids bouncing an authed user back to
 *     the public CV surface just because they typed the root URL.
 *
 * The redirect is auth-aware because auth state lives in localStorage and
 * is only readable on the client, so this has to be a client component.
 */
export default function HomePage() {
  const router = useRouter();
  const { isAuthed, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    router.replace(isAuthed ? '/workspace' : '/print');
  }, [hydrated, isAuthed, router]);

  return null;
}