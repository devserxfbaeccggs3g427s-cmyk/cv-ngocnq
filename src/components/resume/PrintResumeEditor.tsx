'use client';

import { Check, Edit3, Printer, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { profile as homepageProfile } from '@/data/profile';
import { experience as homepageExperience } from '@/data/experience';
import { education as homepageEducation, certifications as homepageCertifications } from '@/data/education';
import { projects as homepageProjects } from '@/data/projects';
import {
  skillCategories,
  getSkillsByCategory,
} from '@/data/skills';
import {
  certificationsI18n,
  educationI18n,
  experienceI18n,
  formatMonthYearI18n,
  formatProjectDurationI18n,
  languageLevelLabelsI18n,
  localizeProjectCategory,
  localizeSkillName,
  profileI18n,
  projectsI18n,
  skillCategoryLabelsI18n,
  skillLimitsByCategory,
  spokenLanguagesI18n,
  ui,
  type Language,
} from '@/data/cv-i18n';
import { cn } from '@/lib/utils';

const LANGUAGE_STORAGE_KEY = 'cv-language';
const draftStorageKey = (lang: Language) => `cv-print-edited-html.${lang}`;

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-slate-900 pb-1 text-[16px] font-bold uppercase tracking-[0.08em] text-slate-900">
      {children}
    </h2>
  );
}

export interface PrintResumeEditorProps {
  language?: Language;
  onLanguageChange?: (language: Language) => void;
}

export function PrintResumeEditor({
  language = 'vi',
  onLanguageChange,
}: PrintResumeEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const t = ui[language];
  const profileData = profileI18n[language];
  const experienceData = experienceI18n[language];
  const educationData = educationI18n[language];
  const certificationsData = certificationsI18n[language];
  const projectsData = projectsI18n[language];
  const categoryLabels = skillCategoryLabelsI18n[language];
  const levelLabels = languageLevelLabelsI18n[language];
  const spokenLanguages = spokenLanguagesI18n[language];

  // The shared experience array (dates, ids) is still sourced from the
  // homepage data so we don't risk drift between the two renderings of dates.
  const dateExperience = homepageExperience;
  const printProjects = homepageProjects.slice(0, 5);

  // Keep document title in sync with the active language.
  useEffect(() => {
    const previousTitle = document.title;
    document.title = t.pageTitle;
    return () => {
      document.title = previousTitle;
    };
  }, [t.pageTitle]);

  // Load the language-specific draft on mount and whenever the language flips.
  useEffect(() => {
    if (!resumeRef.current) return;
    const savedDraft = window.localStorage.getItem(draftStorageKey(language));
    if (savedDraft) {
      // A draft exists for this language — restore it on top of the React
      // render so user edits survive reloads.
      resumeRef.current.innerHTML = savedDraft;
      window.queueMicrotask(() => setHasDraft(true));
    }
    // When no draft exists we deliberately do NOT touch innerHTML — React has
    // already rendered the localized content into the DOM and clearing it here
    // would wipe the CV to a blank page.
    // Exit edit mode whenever we switch languages — a half-edited document
    // could otherwise be silently committed to the wrong language key.
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
    if (isEditing) {
      saveDraft();
    }
    setIsEditing((current) => !current);
  }

  function handleResetDraft() {
    window.localStorage.removeItem(draftStorageKey(language));
    window.location.reload();
  }

  function handleSwitchLanguage(next: Language) {
    if (next === language) return;
    // Persist any in-flight edits under the outgoing language before switching.
    saveDraft();
    onLanguageChange?.(next);
    try {
      window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
    } catch {
      // ignore quota / private-mode failures — language is also held in state
    }
  }

  const renderExperience = (
    localized: (typeof experienceData)[number],
    indexInList: number
  ) => {
    const shared = dateExperience[indexInList];
    const achievementCount = shared.id === 'exp-0' ? 5 : 3;
    const startLabel = formatMonthYearI18n(shared.startDate, language);
    const endLabel = shared.current
      ? t.present
      : formatMonthYearI18n(shared.endDate ?? shared.startDate, language);

    return (
      <article key={shared.id} className="print-item break-inside-avoid">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h3 className="text-[13px] font-bold leading-tight text-slate-950">
              {localized.title}
            </h3>
            <p className="text-[13px] font-bold leading-tight text-slate-700">
              {localized.company} | {localized.location}
            </p>
          </div>
          <p className="whitespace-nowrap text-[13px] font-bold leading-tight text-slate-700">
            {startLabel} - {endLabel}
          </p>
        </div>
        <p className="mt-1 text-[13px] leading-[1.45] text-slate-700">
          {localized.description}
        </p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px] leading-[1.42] text-slate-800">
          {localized.achievements.slice(0, achievementCount).map((achievement) => (
            <li key={achievement}>{achievement}</li>
          ))}
        </ul>
      </article>
    );
  };

  const renderProject = (
    localized: (typeof projectsData)[number],
    index: number,
    sharedId: string
  ) => {
    const shared = homepageProjects.find((p) => p.id === sharedId);
    const highlightCount = index < 3 ? 3 : 2;
    return (
      <article key={sharedId} className="print-item break-inside-avoid">
        <div className="flex items-baseline justify-between gap-4">
          <div>
            <h3 className="text-[13px] font-bold leading-tight text-slate-950">
              {localized.title}
            </h3>
            <p className="text-[13px] font-bold leading-tight text-slate-700">
              {localized.role} | {shared ? localizeProjectCategory(shared.category, language) : ''}
            </p>
          </div>
          <p className="whitespace-nowrap text-[13px] font-bold leading-tight text-slate-700">
            {shared ? formatProjectDurationI18n(shared.duration, language) : ''}
          </p>
        </div>
        <p className="mt-1 text-[13px] leading-[1.45] text-slate-700">
          {localized.description}
        </p>
        <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px] leading-[1.42] text-slate-800">
          {localized.highlights.slice(0, highlightCount).map((highlight) => (
            <li key={highlight}>{highlight}</li>
          ))}
        </ul>
        <p className="mt-1 text-[13px] leading-[1.35] text-slate-700">
          <span className="font-semibold">{t.technologiesLabel}:</span>{' '}
          {(shared?.technologies ?? []).slice(0, 8).join(', ')}
        </p>
      </article>
    );
  };

  return (
    <div className="mx-auto max-w-[210mm]">
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
        <header className="print-header mb-5 border-b-2 border-slate-900 pb-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-[24px] font-bold leading-tight tracking-normal text-slate-950">
                {profileData.name}
              </h1>
              <p className="text-[13px] font-bold text-slate-700">
                {profileData.title}
              </p>
            </div>
            <div className="text-left text-[13px] font-semibold leading-5 text-slate-700 sm:text-right">
              <p>{profileData.email}</p>
              {profileData.phone && <p>{profileData.phone}</p>}
              <p>{profileData.location}</p>
            </div>
          </div>
        </header>

        <main className="space-y-5">
          <section className="print-section">
            <SectionTitle>{t.sectionSummary}</SectionTitle>
            <p className="text-[13px] leading-[1.5] text-slate-800">
              {profileData.summary}
            </p>
          </section>

          <section className="print-section">
            <SectionTitle>{t.sectionSkills}</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {skillCategories.map((category) => {
                const categorySkills = getSkillsByCategory(category);
                if (categorySkills.length === 0) return null;

                const label = categoryLabels[category] ?? category;
                const limit = skillLimitsByCategory[category] ?? 6;

                return (
                  <div key={category} className="break-inside-avoid">
                    <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-slate-950">
                      {label.toUpperCase()}
                    </h3>
                    <p className="mt-0.5 text-[13px] leading-[1.42] text-slate-800">
                      {categorySkills
                        .slice(0, limit)
                        .map((skill) => localizeSkillName(skill.name, language))
                        .join(', ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="print-section">
            <div className="print-keep-with-title">
              <SectionTitle>{t.sectionExperience}</SectionTitle>
              <div className="space-y-4">
                {experienceData.slice(0, 1).map((exp, idx) =>
                  renderExperience(exp, idx)
                )}
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {experienceData.slice(1).map((exp, idx) =>
                renderExperience(exp, idx + 1)
              )}
            </div>
          </section>

          <section className="print-section">
            <div className="print-keep-with-title">
              <SectionTitle>{t.sectionProjects}</SectionTitle>
              <div className="space-y-4">
                {projectsData.slice(0, 1).map((project, idx) =>
                  renderProject(project, idx, project.id)
                )}
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {projectsData.slice(1).map((project, idx) =>
                renderProject(project, idx + 1, project.id)
              )}
            </div>
          </section>

          <section className="print-section grid grid-cols-1 gap-5 sm:grid-cols-[1.2fr_0.8fr]">
            <div>
              <SectionTitle>{t.sectionEducation}</SectionTitle>
              <div className="space-y-2">
                {educationData.map((edu, idx) => {
                  // year range is locale-neutral; pull from the shared education array.
                  const shared = homepageEducation[idx];
                  return (
                    <div key={edu.id} className="break-inside-avoid">
                      <div className="flex items-baseline justify-between gap-4">
                        <h3 className="text-[13px] font-bold leading-tight text-slate-950">
                          {edu.degree} - {edu.field}
                        </h3>
                        <span className="whitespace-nowrap text-[13px] font-bold leading-tight text-slate-700">
                          {shared?.startYear} - {shared?.endYear}
                        </span>
                      </div>
                      <p className="text-[13px] text-slate-700">{edu.school}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <SectionTitle>{t.sectionCertifications}</SectionTitle>
              <div className="space-y-1.5">
                {certificationsData.map((cert, idx) => {
                  const shared = homepageCertifications[idx];
                  return (
                    <p
                      key={cert.id}
                      className="text-[13px] leading-[1.35] text-slate-800"
                    >
                      <span className="font-semibold">{cert.name}</span> - {cert.issuer}
                    </p>
                  );
                })}
                <p className="pt-1 text-[13px] text-slate-800">
                  <span className="font-semibold">{t.languagesLabel}:</span>{' '}
                  {spokenLanguages
                    .map((lang) => `${lang.name} (${levelLabels[lang.level]})`)
                    .join(', ')}
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// Suppress lint warning about unused import — homepageProfile is intentionally
// not used directly: we route every translatable string through cv-i18n.ts.
void homepageProfile;