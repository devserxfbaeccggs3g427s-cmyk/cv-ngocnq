'use client';

import { cn } from '@/lib/utils';

export type CvVariant = 'banking' | 'technical';

export const CV_VARIANT_STORAGE_KEY = 'cv-print-variant';
export const DEFAULT_CV_VARIANT: CvVariant = 'banking';

const LABELS: Record<CvVariant, { vi: string; en: string }> = {
  banking: { vi: 'CV Senior Banking', en: 'Senior Banking CV' },
  technical: { vi: 'CV Kỹ thuật', en: 'Technical CV' },
};

export function getVariantLabel(
  variant: CvVariant,
  language: 'vi' | 'en' = 'vi'
): string {
  return LABELS[variant][language];
}

interface VariantToggleProps {
  value: CvVariant;
  onChange: (next: CvVariant) => void;
  language?: 'vi' | 'en';
}

/**
 * Small toolbar widget to switch between the two CV variants:
 *   - `banking`   → senior banking leadership-focused (default)
 *   - `technical` → original detailed technical CV
 *
 * Both /print and /print-banking pages share the same localStorage key so
 * the toggle persists across navigation.
 */
export function VariantToggle({
  value,
  onChange,
  language = 'vi',
}: VariantToggleProps) {
  const ariaLabel = language === 'vi' ? 'Chọn phiên bản CV' : 'CV variant';
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center overflow-hidden rounded-md border border-slate-300 bg-white text-sm font-semibold"
    >
      <button
        type="button"
        onClick={() => onChange('banking')}
        aria-pressed={value === 'banking'}
        className={cn(
          'px-3 py-2 transition-colors',
          value === 'banking'
            ? 'bg-blue-600 text-white'
            : 'text-slate-700 hover:bg-slate-100'
        )}
      >
        {getVariantLabel('banking', language)}
      </button>
      <button
        type="button"
        onClick={() => onChange('technical')}
        aria-pressed={value === 'technical'}
        className={cn(
          'border-l border-slate-300 px-3 py-2 transition-colors',
          value === 'technical'
            ? 'bg-blue-600 text-white'
            : 'text-slate-700 hover:bg-slate-100'
        )}
      >
        {getVariantLabel('technical', language)}
      </button>
    </div>
  );
}