import { education } from '@/data/education';
import { Section } from '@/components/ui';
import { GraduationCap } from 'lucide-react';

export function EducationSection() {
  return (
    <Section
      id="education"
      eyebrow="Education"
      title="Học vấn"
      subtitle="Nền tảng đào tạo và chuyên ngành"
    >
      <div className="grid grid-cols-1 gap-x-12 gap-y-8 md:grid-cols-2">
        {education.map((edu, index) => (
          <article
            key={edu.id}
            className="flex items-baseline gap-5 border-t border-[var(--line)] pt-5"
          >
            <span className="numeral shrink-0 text-sm text-[var(--fg-subtle)]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <div className="min-w-0 flex-1">
              <div className="eyebrow mb-2 text-[var(--fg-muted)]">
                {edu.startYear} — {edu.endYear}
              </div>
              <h3 className="font-serif text-xl leading-tight text-[var(--fg)]">
                {edu.degree} — {edu.field}
              </h3>
              <p className="mt-1.5 text-sm text-[var(--fg-muted)]">
                {edu.school} · {edu.location}
              </p>
              {edu.gpa && (
                <p className="mt-2 text-sm text-[var(--fg-subtle)]">
                  GPA {edu.gpa}
                </p>
              )}
              {edu.honors && edu.honors.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {edu.honors.map((honor) => (
                    <span key={honor} className="badge badge-ghost">
                      <GraduationCap className="h-3 w-3" />
                      {honor}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  );
}