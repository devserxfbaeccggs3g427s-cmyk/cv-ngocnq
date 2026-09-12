import { getLanguageLevelLabel, languages } from '@/data/skills';

export function LanguagesSection() {
  return (
    <div className="border-t border-[var(--line)] pt-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="rule-short" />
        <span className="eyebrow">Languages</span>
      </div>
      <ul className="flex flex-wrap gap-x-10 gap-y-3">
        {languages.map((lang) => (
          <li key={lang.name} className="flex items-baseline gap-2">
            <span className="font-serif text-base text-[var(--fg)]">
              {lang.name}
            </span>
            <span className="text-sm text-[var(--fg-muted)]">
              {getLanguageLevelLabel(lang.level)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}