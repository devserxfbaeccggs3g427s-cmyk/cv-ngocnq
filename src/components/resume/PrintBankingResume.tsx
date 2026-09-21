'use client';

import { Check, Edit3, Printer, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import {
  certificationsI18n,
  educationI18n,
  experienceI18n,
  formatMonthYearI18n,
  profileI18n,
  skillsI18n,
  spokenLanguagesI18n,
  ui,
  type Language,
} from '@/data/cv-banking-i18n';
import { cn } from '@/lib/utils';

const LANGUAGE_STORAGE_KEY = 'cv-language';
const draftStorageKey = (lang: Language) => `cv-banking-edited-html.${lang}`;

const LEVEL_LABELS: Record<Language, Record<string, string>> = {
  vi: { Native: 'Bản ngữ', Intermediate: 'Trung cấp' },
  en: { Native: 'Native', Intermediate: 'Intermediate' },
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 border-b-2 border-slate-900 pb-1 text-[15px] font-extrabold uppercase tracking-[0.1em] text-slate-900">
      {children}
    </h2>
  );
}

/**
 * Render the `**bold**` substring inside achievement text as <strong>.
 * Achievements arrive from the data layer with `**...**` markers so non-tech
 * recruiters still see emphasis on the most important numbers.
 */
function renderAchievement(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={idx} className="font-bold text-slate-950">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <span key={idx}>{part}</span>;
  });
}

export interface PrintBankingResumeProps {
  language?: Language;
  onLanguageChange?: (language: Language) => void;
}

export function PrintBankingResume({
  language = 'vi',
  onLanguageChange,
}: PrintBankingResumeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const t = ui[language];
  const profileData = profileI18n[language];
  const experienceData = experienceI18n[language];
  const skillsData = skillsI18n[language];
  const educationData = educationI18n[language];
  const certificationsData = certificationsI18n[language];
  const spokenLanguages = spokenLanguagesI18n[language];

  useEffect(() => {
    const previousTitle = document.title;
    document.title = t.pageTitle;
    return () => {
      document.title = previousTitle;
    };
  }, [t.pageTitle]);

  useEffect(() => {
    if (!resumeRef.current) return;
    const savedDraft = window.localStorage.getItem(draftStorageKey(language));
    if (savedDraft) {
      resumeRef.current.innerHTML = savedDraft;
      window.queueMicrotask(() => setHasDraft(true));
    }
    window.queueMicrotask(() => setIsEditing(false));
  }, [language]);

  function saveDraft() {
    if (!resumeRef.current) return;
    window.localStorage.setItem(
      draftStorageKey(language),
      resumeRef.current.innerHTML
    );
    setHasDraft(true);
  }

  function handlePrint() {
    saveDraft();
    window.setTimeout(() => window.print(), 0);
  }

  function handleToggleEditing() {
    if (isEditing) saveDraft();
    setIsEditing((current) => !current);
  }

  function handleResetDraft() {
    window.localStorage.removeItem(draftStorageKey(language));
    window.location.reload();
  }

  function handleSwitchLanguage(next: Language) {
    if (next === language) return;
    saveDraft();
    onLanguageChange?.(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore quota / private-mode failures
    }
  }

  const levelLabel = (level: string) =>
    LEVEL_LABELS[language]?.[level] ?? level;

  return (
    <div className="mx-auto max-w-[210mm]">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center justify-center gap-2 bg-slate-100/95 px-3 py-3 backdrop-blur print:hidden">
        <button
          type="button"
          onClick={handleToggleEditing}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          {isEditing ? t.finishEditingButton : t.editButton}
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Printer className="h-4 w-4" />
          {t.savePdfButton}
        </button>
        <button
          type="button"
          onClick={handleResetDraft}
          disabled={!hasDraft}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          {t.resetButton}
        </button>

        <div
          role="group"
          aria-label={t.languageLabel}
          className="inline-flex items-center overflow-hidden rounded-md border border-slate-300 bg-white text-sm font-semibold"
        >
          <button
            type="button"
            onClick={() => handleSwitchLanguage('vi')}
            aria-pressed={language === 'vi'}
            className={cn(
              'px-3 py-2 transition-colors',
              language === 'vi'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            )}
          >
            VI
          </button>
          <button
            type="button"
            onClick={() => handleSwitchLanguage('en')}
            aria-pressed={language === 'en'}
            className={cn(
              'border-l border-slate-300 px-3 py-2 transition-colors',
              language === 'en'
                ? 'bg-slate-900 text-white'
                : 'text-slate-700 hover:bg-slate-100'
            )}
          >
            EN
          </button>
        </div>

        <p className="basis-full text-center text-xs text-slate-600">
          {isEditing ? t.editingHelp : t.idleHelp}
          <br />
          <span className="text-slate-500">{t.printTip}</span>
        </p>
      </div>

      {/* Printable CV */}
      <div
        key={language}
        ref={resumeRef}
        contentEditable={isEditing}
        suppressContentEditableWarning
        onInput={saveDraft}
        className={`print-resume bg-white px-8 py-7 text-slate-950 print:px-0 print:py-0 ${
          isEditing ? 'print-resume-editing' : ''
        }`}
      >
        {/* ===== HEADER ===== */}
        <header className="print-header mb-5 border-b-[3px] border-slate-900 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[26px] font-extrabold leading-tight tracking-tight text-slate-950">
                {profileData.name}
              </h1>
              <p className="mt-1 text-[13px] font-bold uppercase tracking-wide text-blue-700">
                {profileData.title}
              </p>
              <p className="mt-2 inline-block rounded-sm bg-blue-50 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-blue-700">
                {t.profileBadge}
              </p>
            </div>
            <div className="text-left text-[12px] font-semibold leading-5 text-slate-700 sm:text-right">
              <p>📞 {profileData.phone}</p>
              <p>✉ {profileData.email}</p>
              <p>📍 {profileData.location}</p>
              {profileData.socialLink && <p>🔗 {profileData.socialLink}</p>}
            </div>
          </div>
        </header>

        {/* ===== SUMMARY ===== */}
        <section className="print-section mb-5">
          <SectionTitle>{t.sectionSummary}</SectionTitle>
          <p className="text-[13px] font-bold leading-[1.5] text-slate-900">
            {profileData.lead}
          </p>
          <p className="mt-2 text-[13px] leading-[1.5] text-slate-800">
            {profileData.body}
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {profileData.strengths.map((s) => (
              <li
                key={s}
                className="flex items-start gap-2 text-[13px] leading-[1.4] text-slate-800"
              >
                <span className="mt-0.5 text-blue-700">▸</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* ===== CORE CAPABILITIES ===== */}
        <section className="print-section mb-5">
          <SectionTitle>{t.sectionStrengths}</SectionTitle>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {skillsData.map((block) => (
              <div key={block.title} className="break-inside-avoid">
                <h3 className="text-[13px] font-extrabold text-slate-950">
                  <span className="mr-1.5">{block.icon}</span>
                  {block.title}
                </h3>
                <p className="mt-1 text-[12.5px] leading-[1.45] text-slate-800">
                  {block.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ===== EXPERIENCE ===== */}
        <section className="print-section mb-5">
          <SectionTitle>{t.sectionExperience}</SectionTitle>
          <div className="space-y-4">
            {experienceData.map((exp) => {
              const startLabel = formatMonthYearI18n(exp.startDate, language);
              const endLabel = exp.current
                ? t.present
                : formatMonthYearI18n(exp.endDate ?? exp.startDate, language);
              return (
                <article key={exp.id} className="print-item break-inside-avoid">
                  <div className="flex items-baseline justify-between gap-4">
                    <div>
                      <h3 className="text-[14px] font-extrabold leading-tight text-blue-700">
                        {exp.title}
                      </h3>
                      <p className="mt-0.5 text-[13px] font-bold leading-tight text-slate-800">
                        {exp.company} | {exp.location}
                      </p>
                      <p className="mt-1 inline-block rounded-sm bg-blue-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-blue-700">
                        {exp.badge}
                      </p>
                    </div>
                    <p className="whitespace-nowrap text-[13px] font-bold leading-tight text-slate-700">
                      {startLabel} – {endLabel}
                    </p>
                  </div>

                  <p className="mt-2 border-l-2 border-slate-300 pl-3 text-[12.5px] italic leading-[1.5] text-slate-700">
                    {exp.intro}
                  </p>

                  <ul className="mt-2 space-y-1.5 pl-1">
                    {exp.achievements.map((a) => (
                      <li
                        key={a}
                        className="relative pl-4 text-[13px] leading-[1.45] text-slate-800"
                      >
                        <span className="absolute left-0 top-1 text-[8px] text-blue-700">
                          ●
                        </span>
                        {renderAchievement(a)}
                      </li>
                    ))}
                  </ul>
                </article>
              );
            })}
          </div>
        </section>

        {/* ===== EDUCATION + CERTIFICATIONS ===== */}
        <section className="print-section grid grid-cols-1 gap-5 sm:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionTitle>{t.sectionEducation}</SectionTitle>
            <div className="space-y-2">
              {educationData.map((edu) => (
                <div key={edu.id} className="break-inside-avoid">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="text-[13px] font-bold leading-tight text-slate-950">
                      {edu.degree} – {edu.field}
                    </h3>
                    <span className="whitespace-nowrap text-[13px] font-bold leading-tight text-slate-700">
                      {edu.startYear} – {edu.endYear}
                    </span>
                  </div>
                  <p className="text-[12.5px] text-slate-700">{edu.school}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <SectionTitle>{t.sectionCertifications}</SectionTitle>
            <div className="space-y-1.5">
              {certificationsData.map((cert) => (
                <p
                  key={cert.id}
                  className="text-[12.5px] leading-[1.4] text-slate-800"
                >
                  <span className="font-bold text-slate-950">{cert.name}</span> –{' '}
                  {cert.issuer}
                </p>
              ))}
              <p className="pt-2 text-[12.5px] leading-[1.4] text-slate-800">
                <span className="font-bold text-slate-950">{t.languagesLabel}:</span>{' '}
                {spokenLanguages
                  .map((lang) => `${lang.name} (${levelLabel(lang.level)})`)
                  .join(', ')}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}