import { Badge } from '@/components/ui';
import type { Experience } from '@/data/experience';
import { formatMonthYear } from '@/lib/date';

interface ExperienceCardProps {
  experience: Experience;
}

export function ExperienceCard({ experience }: ExperienceCardProps) {
  const typeLabels: Record<Experience['type'], string> = {
    'full-time': 'Toàn thời gian',
    'part-time': 'Bán thời gian',
    contract: 'Hợp đồng',
    freelance: 'Tự do',
  };

  return (
    <article className="card group p-6 transition-colors duration-300 hover:border-[var(--fg)]">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="eyebrow mb-2">
            {formatMonthYear(experience.startDate)} —{' '}
            {experience.current ? 'Hiện tại' : formatMonthYear(experience.endDate!)}
          </div>
          <h3 className="font-serif text-2xl font-normal leading-tight text-[var(--fg)]">
            {experience.title}
          </h3>
          <p className="mt-1 text-base text-[var(--fg-muted)]">
            {experience.company}
            <span className="mx-2 text-[var(--fg-subtle)]">·</span>
            <span className="text-[var(--fg-subtle)]">{experience.location}</span>
          </p>
        </div>
        <span className="badge badge-ghost shrink-0">{typeLabels[experience.type]}</span>
      </div>

      <p className="mb-5 text-[15px] leading-7 text-[var(--fg-muted)]">
        {experience.description}
      </p>

      {/* Achievements */}
      <ul className="mb-6 space-y-2.5 border-l border-[var(--line)] pl-5">
        {experience.achievements.map((achievement, i) => (
          <li key={i} className="text-sm leading-6 text-[var(--fg)]">
            {achievement}
          </li>
        ))}
      </ul>

      {/* Technologies */}
      <div className="flex flex-wrap gap-1.5">
        {experience.technologies.map((tech) => (
          <span key={tech} className="badge badge-ghost">
            {tech}
          </span>
        ))}
      </div>
    </article>
  );
}