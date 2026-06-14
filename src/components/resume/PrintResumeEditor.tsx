'use client';

import { Check, Edit3, Printer, RotateCcw } from 'lucide-react';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { profile } from '@/data/profile';
import { experience } from '@/data/experience';
import { projects } from '@/data/projects';
import {
  getLanguageLevelLabel,
  getSkillCategoryLabel,
  skillCategories,
  getSkillsByCategory,
  languages,
} from '@/data/skills';
import { education, certifications } from '@/data/education';
import { formatMonthYear } from '@/lib/date';

const PRINT_DRAFT_STORAGE_KEY = 'cv-print-edited-html';

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-slate-900 pb-1 text-[16px] font-bold uppercase tracking-[0.08em] text-slate-900">
      {children}
    </h2>
  );
}

export function PrintResumeEditor() {
  const [isEditing, setIsEditing] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);
  const resumeRef = useRef<HTMLDivElement>(null);

  const printProjects = projects.slice(0, 4);
  const skillLimits: Record<string, number> = {
    Languages: 5,
    Frontend: 4,
    Backend: 8,
    Architecture: 6,
    Databases: 5,
    DevOps: 5,
    Security: 4,
    Monitoring: 4,
  };

  useEffect(() => {
    const savedDraft = window.localStorage.getItem(PRINT_DRAFT_STORAGE_KEY);

    if (savedDraft && resumeRef.current) {
      resumeRef.current.innerHTML = savedDraft;
      window.queueMicrotask(() => setHasDraft(true));
    }
  }, []);

  function saveDraft() {
    if (!resumeRef.current) return;

    window.localStorage.setItem(PRINT_DRAFT_STORAGE_KEY, resumeRef.current.innerHTML);
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
    window.localStorage.removeItem(PRINT_DRAFT_STORAGE_KEY);
    window.location.reload();
  }

  const renderExperience = (exp: (typeof experience)[number]) => (
    <article key={exp.id} className="print-item break-inside-avoid">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-[13px] font-bold leading-tight text-slate-950">{exp.title}</h3>
          <p className="text-[13px] font-bold leading-tight text-slate-700">
            {exp.company} | {exp.location}
          </p>
        </div>
        <p className="whitespace-nowrap text-[13px] font-bold leading-tight text-slate-700">
          {formatMonthYear(exp.startDate)} - {exp.current ? 'Hiện tại' : formatMonthYear(exp.endDate!)}
        </p>
      </div>
      <p className="mt-1 text-[13px] leading-[1.45] text-slate-700">{exp.description}</p>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px] leading-[1.42] text-slate-800">
        {exp.achievements.slice(0, exp.id === 'exp-0' ? 4 : 2).map((achievement) => (
          <li key={achievement}>{achievement}</li>
        ))}
      </ul>
    </article>
  );

  const renderProject = (project: (typeof projects)[number], index: number) => (
    <article key={project.id} className="print-item break-inside-avoid">
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <h3 className="text-[13px] font-bold leading-tight text-slate-950">{project.title}</h3>
          <p className="text-[13px] font-bold leading-tight text-slate-700">
            {project.role} | {project.category}
          </p>
        </div>
        <p className="whitespace-nowrap text-[13px] font-bold leading-tight text-slate-700">
          {project.duration}
        </p>
      </div>
      <p className="mt-1 text-[13px] leading-[1.45] text-slate-700">
        {project.description}
      </p>
      <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px] leading-[1.42] text-slate-800">
        {project.highlights.slice(0, index < 3 ? 3 : 2).map((highlight) => (
          <li key={highlight}>{highlight}</li>
        ))}
      </ul>
      <p className="mt-1 text-[13px] leading-[1.35] text-slate-700">
        <span className="font-semibold">Công nghệ:</span>{' '}
        {project.technologies.slice(0, 8).join(', ')}
      </p>
    </article>
  );

  return (
    <div className="mx-auto max-w-[210mm]">
      <div className="sticky top-0 z-10 mb-4 flex flex-wrap items-center justify-center gap-2 bg-slate-100/95 px-3 py-3 backdrop-blur print:hidden">
        <button
          type="button"
          onClick={handleToggleEditing}
          className="inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
        >
          {isEditing ? <Check className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
          {isEditing ? 'Xong chỉnh sửa' : 'Chỉnh sửa CV'}
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
        >
          <Printer className="h-4 w-4" />
          Lưu PDF
        </button>
        <button
          type="button"
          onClick={handleResetDraft}
          disabled={!hasDraft}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RotateCcw className="h-4 w-4" />
          Hoàn tác bản sửa
        </button>
        <p className="basis-full text-center text-xs text-slate-600">
          {isEditing
            ? 'Đang chỉnh sửa: bấm trực tiếp vào nội dung CV, sau đó chọn Lưu PDF.'
            : 'Bật Chỉnh sửa CV để thay đổi nội dung ngay trên bản in trước khi lưu PDF.'}
        </p>
      </div>

      <div
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
                {profile.name}
              </h1>
              <p className="text-[13px] font-bold text-slate-700">{profile.title}</p>
            </div>
            <div className="text-left text-[13px] font-semibold leading-5 text-slate-700 sm:text-right">
              <p>{profile.email}</p>
              <p>{profile.phone}</p>
              <p>{profile.location}</p>
            </div>
          </div>
        </header>

        <main className="space-y-5">
          <section className="print-section">
            <SectionTitle>Tóm tắt chuyên môn</SectionTitle>
            <p className="text-[13px] leading-[1.5] text-slate-800">{profile.summary}</p>
          </section>

          <section className="print-section">
            <SectionTitle>Kỹ năng cốt lõi</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2">
              {skillCategories.map((category) => {
                const categorySkills = getSkillsByCategory(category);
                if (categorySkills.length === 0) return null;

                return (
                  <div key={category} className="break-inside-avoid">
                    <h3 className="text-[13px] font-extrabold uppercase tracking-wide text-slate-950">
                      {getSkillCategoryLabel(category).toUpperCase()}
                    </h3>
                    <p className="mt-0.5 text-[13px] leading-[1.42] text-slate-800">
                      {categorySkills
                        .slice(0, skillLimits[category] || 6)
                        .map((skill) => skill.name)
                        .join(', ')}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="print-section">
            <div className="print-keep-with-title">
              <SectionTitle>Kinh nghiệm làm việc</SectionTitle>
              <div className="space-y-4">
                {experience.slice(0, 1).map(renderExperience)}
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {experience.slice(1).map(renderExperience)}
            </div>
          </section>

          <section className="print-section">
            <div className="print-keep-with-title">
              <SectionTitle>Kinh nghiệm dự án</SectionTitle>
              <div className="space-y-4">
                {printProjects.slice(0, 1).map(renderProject)}
              </div>
            </div>
            <div className="mt-4 space-y-4">
              {printProjects.slice(1).map((project, index) => renderProject(project, index + 1))}
            </div>
          </section>

          <section className="print-section grid grid-cols-1 gap-5 sm:grid-cols-[1.2fr_0.8fr]">
            <div>
              <SectionTitle>Học vấn</SectionTitle>
              <div className="space-y-2">
                {education.map((edu) => (
                  <div key={edu.id} className="break-inside-avoid">
                    <div className="flex items-baseline justify-between gap-4">
                      <h3 className="text-[13px] font-bold leading-tight text-slate-950">
                        {edu.degree} - {edu.field}
                      </h3>
                      <span className="whitespace-nowrap text-[13px] font-bold leading-tight text-slate-700">
                        {edu.startYear} - {edu.endYear}
                      </span>
                    </div>
                    <p className="text-[13px] text-slate-700">{edu.school}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <SectionTitle>Chứng chỉ</SectionTitle>
              <div className="space-y-1.5">
                {certifications.map((cert) => (
                  <p key={cert.id} className="text-[13px] leading-[1.35] text-slate-800">
                    <span className="font-semibold">{cert.name}</span> - {cert.issuer}
                  </p>
                ))}
                <p className="pt-1 text-[13px] text-slate-800">
                  <span className="font-semibold">Ngôn ngữ:</span>{' '}
                  {languages.map((lang) => `${lang.name} (${getLanguageLevelLabel(lang.level)})`).join(', ')}
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
