'use client';

import { useEffect, useState } from 'react';
import { PrintResumeEditor } from '@/components/resume/PrintResumeEditor';
import type { Language } from '@/data/cv-i18n';

const LANGUAGE_STORAGE_KEY = 'cv-language';

export default function PrintPage() {
  // Start with 'vi' on both server and client so the SSR markup and the
  // initial client render match (no hydration mismatch). The real value is
  // restored from localStorage in the effect below.
  const [language, setLanguage] = useState<Language>('vi');

  // After mount, restore the user's last language from localStorage. Reading
  // happens via queueMicrotask so the setState call sits inside a callback
  // (the React lint rule against setState in effect bodies targets the
  // synchronous case).
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored === 'en' || stored === 'vi') {
        window.queueMicrotask(() => setLanguage(stored));
      }
    } catch {
      // ignore — localStorage may be unavailable in private mode
    }
  }, []);

  // Keep <html lang> in sync so screen readers + browser translation pick the
  // right voice for the printed content.
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = previous || 'vi';
    };
  }, [language]);

  return (
    <PrintResumeEditor language={language} onLanguageChange={setLanguage} />
  );
}