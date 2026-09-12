'use client';

import { skillCategories, getSkillCategoryLabel, getSkillsByCategory } from '@/data/skills';
import { Section } from '@/components/ui';

export function SkillsSection() {
  return (
    <Section
      id="skills"
      eyebrow="Stack"
      title="Kỹ năng chuyên môn"
      subtitle="Công nghệ, công cụ và năng lực kỹ thuật đã sử dụng trong dự án thực tế"
    >
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {skillCategories.map((category) => {
          const categorySkills = getSkillsByCategory(category);
          if (categorySkills.length === 0) return null;
          const sortedSkills = [...categorySkills].sort((a, b) => b.level - a.level);

          return (
            <div key={category}>
              <h3 className="mb-5 font-serif text-xl text-[var(--fg)]">
                {getSkillCategoryLabel(category)}
              </h3>
              <ul className="space-y-3">
                {sortedSkills.map((skill) => (
                  <li
                    key={skill.name}
                    className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] pb-3 last:border-b-0"
                  >
                    <span className="text-sm font-medium text-[var(--fg)]">
                      {skill.name}
                    </span>
                    <span className="flex items-baseline gap-3 text-xs text-[var(--fg-subtle)] tabular-nums">
                      {skill.yearsOfExperience && (
                        <span>{skill.yearsOfExperience} năm</span>
                      )}
                      <span className="numeral text-[var(--fg-muted)]">{skill.level}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}