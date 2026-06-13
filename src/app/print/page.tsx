import type { Metadata } from 'next';
import type { ReactNode } from 'react';
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
import { PrintButton } from '@/components/ui/PrintButton';
import { formatMonthYear } from '@/lib/date';

export const metadata: Metadata = {
  title: `CV | ${profile.name}`,
  description: 'Bản CV tối ưu để in hoặc lưu PDF',
};

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <h2 className="mb-3 border-b border-slate-900 pb-1 text-[16px] font-bold uppercase tracking-[0.08em] text-slate-900">
      {children}
    </h2>
  );
}

export default function PrintPage() {
  const printProjects = projects;

  return (
    <div className="print-resume mx-auto max-w-[210mm] bg-white px-8 py-7 text-slate-950 print:px-0 print:py-0">
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
        <section>
          <SectionTitle>Tóm tắt chuyên môn</SectionTitle>
          <p className="text-[13px] leading-[1.5] text-slate-800">{profile.summary}</p>
          <div className="mt-2 grid grid-cols-1 gap-x-5 gap-y-1 sm:grid-cols-2">
            {profile.highlights.map((item) => (
              <div key={item} className="flex gap-2 text-[13px] font-semibold leading-[1.45] text-slate-800">
                <span className="mt-[7px] h-1 w-1 flex-none rounded-full bg-slate-900" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section>
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
                    {categorySkills.map((skill) => skill.name).join(', ')}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <SectionTitle>Kinh nghiệm làm việc</SectionTitle>
          <div className="space-y-4">
            {experience.map((exp) => (
              <article key={exp.id} className="break-inside-avoid">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-950">{exp.title}</h3>
                    <p className="text-[13px] font-bold text-slate-700">
                      {exp.company} | {exp.location}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-[13px] font-bold text-slate-700">
                    {formatMonthYear(exp.startDate)} - {exp.current ? 'Hiện tại' : formatMonthYear(exp.endDate!)}
                  </p>
                </div>
                <p className="mt-1 text-[13px] leading-[1.45] text-slate-700">{exp.description}</p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px] leading-[1.42] text-slate-800">
                  {exp.achievements.slice(0, exp.id === 'exp-0' ? 6 : 4).map((achievement) => (
                    <li key={achievement}>{achievement}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Kinh nghiệm dự án</SectionTitle>
          <div className="space-y-4">
            {printProjects.map((project, index) => (
              <article key={project.id} className="break-inside-avoid">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-[13px] font-bold text-slate-950">{project.title}</h3>
                    <p className="text-[13px] font-bold text-slate-700">
                      {project.role} | {project.category}
                    </p>
                  </div>
                  <p className="whitespace-nowrap text-[13px] font-bold text-slate-700">
                    {project.duration}
                  </p>
                </div>
                <p className="mt-1 text-[13px] leading-[1.45] text-slate-700">
                  {project.description}
                </p>
                <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[13px] leading-[1.42] text-slate-800">
                  {project.highlights.slice(0, index < 3 ? 5 : 3).map((highlight) => (
                    <li key={highlight}>{highlight}</li>
                  ))}
                </ul>
                <p className="mt-1 text-[13px] leading-[1.35] text-slate-700">
                  <span className="font-semibold">Công nghệ:</span>{' '}
                  {project.technologies.slice(0, 12).join(', ')}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 sm:grid-cols-[1.2fr_0.8fr]">
          <div>
            <SectionTitle>Học vấn</SectionTitle>
            <div className="space-y-2">
              {education.map((edu) => (
                <div key={edu.id} className="break-inside-avoid">
                  <div className="flex justify-between gap-4">
                    <h3 className="text-[13px] font-bold text-slate-950">
                      {edu.degree} - {edu.field}
                    </h3>
                    <span className="whitespace-nowrap text-[13px] font-bold text-slate-700">
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

      <div className="mt-8 text-center print:hidden">
        <PrintButton />
      </div>
    </div>
  );
}
