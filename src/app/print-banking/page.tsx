'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PrintBankingResume } from '@/components/resume/PrintBankingResume';
import {
  CV_VARIANT_STORAGE_KEY,
  DEFAULT_CV_VARIANT,
  VariantToggle,
  type CvVariant,
} from '@/components/resume/VariantToggle';
import type { Language } from '@/data/cv-banking-i18n';

const LANGUAGE_STORAGE_KEY = 'cv-language';

function readVariant(): CvVariant {
  if (typeof window === 'undefined') return DEFAULT_CV_VARIANT;
  try {
    const stored = window.localStorage.getItem(CV_VARIANT_STORAGE_KEY);
    return stored === 'technical' || stored === 'banking'
      ? stored
      : DEFAULT_CV_VARIANT;
  } catch {
    return DEFAULT_CV_VARIANT;
  }
}

export default function PrintBankingPage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('vi');
  const [variant, setVariant] = useState<CvVariant>(DEFAULT_CV_VARIANT);

  useEffect(() => {
    try {
      const storedLang = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (storedLang === 'en' || storedLang === 'vi') {
        window.queueMicrotask(() => setLanguage(storedLang));
      }
    } catch {
      // ignore localStorage failures (private mode / quota)
    }
  }, []);

  useEffect(() => {
    window.queueMicrotask(() => setVariant(readVariant()));
  }, []);

  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = language;
    return () => {
      document.documentElement.lang = previous || 'vi';
    };
  }, [language]);

  function handleVariantChange(next: CvVariant) {
    if (next === variant) return;
    try {
      window.localStorage.setItem(CV_VARIANT_STORAGE_KEY, next);
    } catch {
      // ignore quota / private-mode failures
    }
    setVariant(next);
    if (next === 'technical') {
      router.push('/print');
    }
  }

  return (
    <div className="space-y-3">
      <div className="print:hidden">
        <VariantToggle value={variant} onChange={handleVariantChange} language={language} />
      </div>
      <PrintBankingResume language={language} onLanguageChange={setLanguage} />
    </div>
  );
}